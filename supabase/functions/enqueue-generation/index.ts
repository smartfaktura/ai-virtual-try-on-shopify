import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Hourly rate limits per plan
const HOURLY_LIMITS: Record<string, number> = {
  enterprise: 9999,
  pro: 999,
  growth: 100,
  starter: 50,
  free: 10,
};

// Credit cost calculation
function calculateCreditCost(jobType: string, imageCount: number, quality: string, additionalProductCount: number = 0): number {
  if (jobType === "tryon") return imageCount * 8;
  const baseCost = imageCount * (quality === "high" ? 10 : 4);
  const extraProductCost = additionalProductCount * 2 * imageCount;
  return baseCost + extraProductCost;
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
    const { jobType, payload, imageCount = 1, quality = "standard", additionalProductCount = 0 } = body;

    if (!jobType || !payload) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: jobType, payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validJobTypes = ["product", "tryon", "freestyle", "workflow"];
    if (!validJobTypes.includes(jobType)) {
      return new Response(
        JSON.stringify({ error: `Invalid job type: ${jobType}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate credit cost
    const creditsCost = calculateCreditCost(jobType, imageCount, quality, additionalProductCount);

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
    const hourlyLimit = HOURLY_LIMITS[userPlan] || HOURLY_LIMITS.free;

    // Count non-cancelled jobs in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentJobCount } = await supabase
      .from("generation_queue")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", oneHourAgo)
      .in("status", ["queued", "processing", "completed", "failed"]);

    if ((recentJobCount || 0) >= hourlyLimit) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: `You've reached the maximum of ${hourlyLimit} generations per hour on your ${userPlan} plan.`,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Enrich payload with imageCount, quality, aspectRatio so downstream functions receive them
    const enrichedPayload = { ...payload, imageCount, quality };

    // Atomic enqueue with credit deduction
    const { data: enqueueResult, error: enqueueError } = await supabase.rpc(
      "enqueue_generation",
      {
        p_user_id: userId,
        p_job_type: jobType,
        p_payload: enrichedPayload,
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
      const errorStr = String(result.error);
      const status = errorStr.includes("concurrent") ? 429 : 402;
      return new Response(
        JSON.stringify({ error: result.error, balance: result.balance, max_concurrent: result.max_concurrent }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Trigger process-queue with retry (2 attempts, 5s timeout each)
    const triggerQueue = async () => {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch(`${supabaseUrl}/functions/v1/process-queue`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${serviceRoleKey}`,
              "Content-Type": "application/json",
              "x-queue-internal": "true",
            },
            body: JSON.stringify({ trigger: "enqueue" }),
            signal: AbortSignal.timeout(5000),
          });
          if (res.ok) break;
          console.warn(`[enqueue] process-queue attempt ${attempt + 1} returned ${res.status}`);
        } catch (e) {
          console.warn(`[enqueue] process-queue attempt ${attempt + 1} failed:`, (e as Error).message);
        }
      }
    };
    triggerQueue().catch(() => {});

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
