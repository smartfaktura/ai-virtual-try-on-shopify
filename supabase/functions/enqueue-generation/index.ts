import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rate limits per plan (per hour)
const RATE_LIMITS: Record<string, { perHour: number; maxConcurrent: number }> = {
  enterprise: { perHour: 9999, maxConcurrent: 6 },
  pro: { perHour: 999, maxConcurrent: 4 },
  growth: { perHour: 100, maxConcurrent: 3 },
  starter: { perHour: 50, maxConcurrent: 2 },
  free: { perHour: 10, maxConcurrent: 1 },
};

// Credit cost calculation
function calculateCreditCost(jobType: string, imageCount: number, quality: string): number {
  if (jobType === "video") return imageCount * 30;
  if (jobType === "tryon") return imageCount * 8;
  return imageCount * (quality === "high" ? 10 : 4);
}

function getUserIdFromJwt(authHeader: string | null): string | null {
  if (!authHeader) return null;
  try {
    const token = authHeader.replace("Bearer ", "");
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Authenticate user
    const userId = getUserIdFromJwt(req.headers.get("authorization"));
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { jobType, payload, imageCount = 1, quality = "standard" } = body;

    if (!jobType || !payload) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: jobType, payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validJobTypes = ["product", "tryon", "freestyle", "workflow", "video"];
    if (!validJobTypes.includes(jobType)) {
      return new Response(
        JSON.stringify({ error: `Invalid job type: ${jobType}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate credit cost
    const creditsCost = calculateCreditCost(jobType, imageCount, quality);

    // Use service role client for DB operations
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Check rate limit
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("user_id", userId)
      .single();

    const userPlan = profile?.plan || "free";
    const limits = RATE_LIMITS[userPlan] || RATE_LIMITS.free;

    // Count jobs in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentJobCount } = await supabase
      .from("generation_queue")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", oneHourAgo);

    if ((recentJobCount || 0) >= limits.perHour) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: `You've reached the maximum of ${limits.perHour} generations per hour on your ${userPlan} plan.`,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Atomic enqueue with credit deduction
    const { data: enqueueResult, error: enqueueError } = await supabase.rpc(
      "enqueue_generation",
      {
        p_user_id: userId,
        p_job_type: jobType,
        p_payload: payload,
        p_credits_cost: creditsCost,
      }
    );

    if (enqueueError) {
      console.error("Enqueue error:", enqueueError);
      return new Response(
        JSON.stringify({ error: "Failed to enqueue generation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = enqueueResult as Record<string, unknown>;

    if (result.error) {
      return new Response(
        JSON.stringify({ error: result.error, balance: result.balance }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fire-and-forget: trigger process-queue worker
    try {
      fetch(`${supabaseUrl}/functions/v1/process-queue`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          "x-queue-internal": "true",
        },
        body: JSON.stringify({ trigger: "enqueue" }),
      }).catch(() => {
        // Silently ignore — pg_cron will pick it up
      });
    } catch {
      // Silently ignore
    }

    console.log(`[enqueue] Job ${result.job_id} enqueued for user ${userId}, type=${jobType}, cost=${creditsCost}, priority=${result.priority}`);

    return new Response(
      JSON.stringify({
        jobId: result.job_id,
        position: result.position,
        priority: result.priority,
        newBalance: result.new_balance,
        creditsCost,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Enqueue error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
