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

// Credit cost calculation — simplified pricing
function calculateCreditCost(
  jobType: string,
  imageCount: number,
  quality: string,
  hasModel: boolean = false,
  hasScene: boolean = false,
  _additionalProductCount: number = 0,
  resolution?: string,
  payload?: Record<string, unknown>,
): number {
  // Video jobs use dedicated pricing
  if (jobType === "video") {
    const dur = String(payload?.duration || "5");
    const audio = String(payload?.audioMode || "silent");
    const motion = String(payload?.cameraMotion || "");
    let cost = dur === "10" ? 18 : 10;
    if (audio === "ambient") cost += 4;
    if (["product_orbit", "premium_handheld"].includes(motion)) cost += 2;
    return cost;
  }

  let perImage: number;

  if (jobType === "upscale") {
    perImage = resolution === "4k" ? 15 : 10;
  } else if (jobType === "workflow" || jobType === "tryon") {
    perImage = 6;
  } else {
    perImage = (hasModel || hasScene || quality === 'high') ? 6 : 4;
  }

  return imageCount * perImage;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Authenticate user with cryptographic JWT verification
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userId = user.id;

    const body = await req.json();
    const { jobType, payload, imageCount = 1, quality = "standard", additionalProductCount = 0, hasModel = false, hasScene = false, resolution, skipWake = false, wakeOnly = false } = body;

    // If wakeOnly, just trigger process-queue and return
    if (wakeOnly) {
      fetch(`${supabaseUrl}/functions/v1/process-queue`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          "x-queue-internal": "true",
        },
        body: JSON.stringify({ trigger: "batch-wake" }),
      }).catch((e) => console.warn(`[enqueue] batch wake failed:`, (e as Error).message));
      return new Response(
        JSON.stringify({ ok: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!jobType || !payload) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: jobType, payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validJobTypes = ["tryon", "freestyle", "workflow", "upscale", "video", "catalog"];
    if (!validJobTypes.includes(jobType)) {
      return new Response(
        JSON.stringify({ error: `Invalid job type: ${jobType}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate credit cost
    const creditsCost = calculateCreditCost(jobType, imageCount, quality, hasModel, hasScene, additionalProductCount, resolution, payload);

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
      // Burst/rate limit → 429; insufficient credits → 402
      const isBurst = errorStr.includes("Too many requests") || errorStr.includes("burst") || errorStr.includes("concurrent");
      const status = isBurst ? 429 : 402;
      return new Response(
        JSON.stringify({ error: result.error, balance: result.balance, max_concurrent: result.max_concurrent, retry_after_seconds: result.retry_after_seconds || (isBurst ? 5 : undefined) }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fire-and-forget: wake process-queue (skip if client will send its own wake)
    if (!skipWake) {
      fetch(`${supabaseUrl}/functions/v1/process-queue`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          "x-queue-internal": "true",
        },
        body: JSON.stringify({ trigger: "enqueue" }),
      }).catch((e) => console.warn(`[enqueue] process-queue wake failed:`, (e as Error).message));
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
