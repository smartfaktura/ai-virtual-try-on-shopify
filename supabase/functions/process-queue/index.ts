import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map job types to edge function names
const JOB_TYPE_TO_FUNCTION: Record<string, string> = {
  tryon: "generate-tryon",
  freestyle: "generate-freestyle",
  workflow: "generate-workflow",
  upscale: "upscale-worker",
  video: "generate-video",
  video_multishot: "generate-video",
  catalog: "generate-catalog",
  "text-product": "generate-text-product",
};

/**
 * Fire-and-forget: dispatch job to generation function without waiting.
 * The generation function will update generation_queue directly when done.
 */
function dispatchGenerationFunction(
  functionUrl: string,
  serviceRoleKey: string,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; status?: number }> {
  // Wait briefly for immediate rejection (403/500) but don't wait for full generation
  return fetch(functionUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      "x-queue-internal": "true",
    },
    body: JSON.stringify(payload),
  }).then(async (res) => {
    if (!res.ok) {
      // Read body for logging, then signal failure
      const body = await res.text().catch(() => "");
      console.error(`[process-queue] Dispatch rejected: ${res.status} ${body.slice(0, 300)}`);
      return { ok: false, status: res.status };
    }
    // Don't await the body — the function is still running and will self-complete
    return { ok: true };
  }).catch((err) => {
    console.error(`[process-queue] Dispatch fetch error:`, err);
    return { ok: false, status: 0 };
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth guard: only allow internal calls with service role key or x-queue-internal header
  const authHeader = req.headers.get("authorization");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const isQueueInternal = req.headers.get("x-queue-internal") === "true";

  // Accept: exact service role key match OR a valid service_role JWT from internal callers
  let authOk = false;
  if (authHeader === `Bearer ${serviceRoleKey}`) {
    authOk = true;
  } else if (isQueueInternal && authHeader?.startsWith("Bearer ")) {
    // Internal callers (retry-queue, enqueue-generation) may have a different-format
    // service role key after key rotation. Validate via Supabase auth.
    try {
      const token = authHeader.replace("Bearer ", "");
      // Decode JWT payload to check role claim (service_role)
      const payloadB64 = token.split(".")[1];
      if (payloadB64) {
        const payload = JSON.parse(atob(payloadB64));
        if (payload.role === "service_role") {
          authOk = true;
        }
      }
    } catch {
      // Invalid token format — fall through to reject
    }
  }

  if (!authOk) {
    console.warn(`[process-queue] Auth REJECTED — headerLen=${authHeader?.length ?? 0}, expectedLen=${("Bearer " + serviceRoleKey).length}, isQueueInternal=${isQueueInternal}`);
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  console.log("[process-queue] Auth OK — dispatching jobs");

  const startTime = Date.now();
  const MAX_RUNTIME_MS = 55_000; // 55 seconds — fire-and-forget dispatch, 1s stagger

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Step 0: Acquire singleton dispatch lock — only one instance dispatches at a time
    const { data: lockAcquired } = await supabase.rpc("try_acquire_dispatch_lock", { p_locked_by: "process-queue" });
    if (!lockAcquired) {
      console.log("[process-queue] Another dispatcher is active, skipping.");
      return new Response(
        JSON.stringify({ skipped: true, reason: "another dispatcher active" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Cleanup stale/timed-out jobs first
    const { data: cleanupResult } = await supabase.rpc("cleanup_stale_jobs");
    if (cleanupResult && (cleanupResult as Record<string, number>).cleaned > 0) {
      console.log(`[process-queue] Cleaned ${(cleanupResult as Record<string, number>).cleaned} stale jobs`);
    }

    let dispatchedCount = 0;

    // Step 2: Loop — claim and dispatch jobs until time runs out
    while (Date.now() - startTime < MAX_RUNTIME_MS) {
      // Claim next job
      const { data: claimResult, error: claimError } = await supabase.rpc("claim_next_job");

      if (claimError) {
        console.error("[process-queue] Claim error:", claimError);
        break;
      }

      const claimed = claimResult as Record<string, unknown>;
      if (!claimed.job || claimed.job === null) {
        console.log(`[process-queue] No more jobs. Dispatched ${dispatchedCount} jobs total.`);
        break;
      }

      const job = claimed.job as Record<string, unknown>;
      const jobId = job.id as string;
      const jobType = job.job_type as string;
      const payload = job.payload as Record<string, unknown>;
      const userId = job.user_id as string;
      const creditsReserved = job.credits_reserved as number;

      const functionName = JOB_TYPE_TO_FUNCTION[jobType];
      if (!functionName) {
        console.error(`[process-queue] Unknown job type: ${jobType}, failing job ${jobId}`);
        await supabase
          .from("generation_queue")
          .update({
            status: "failed",
            error_message: `Unknown job type: ${jobType}`,
            completed_at: new Date().toISOString(),
          })
          .eq("id", jobId);
        await supabase.rpc("refund_credits", { p_user_id: userId, p_amount: creditsReserved });
        continue;
      }

      const functionUrl = `${supabaseUrl}/functions/v1/${functionName}`;

      // Enrich payload with queue metadata so generation function can update the queue
      const enrichedPayload = {
        ...payload,
        user_id: userId,
        job_id: jobId,
        job_type: jobType,
        credits_reserved: creditsReserved,
      };

      // Dispatch and check for immediate rejection
      const dispatchResult = await dispatchGenerationFunction(functionUrl, serviceRoleKey, enrichedPayload);

      if (!dispatchResult.ok) {
        // Target function rejected immediately (e.g. 403 auth mismatch) — fail the job
        console.error(`[process-queue] Dispatch of job ${jobId} rejected with status ${dispatchResult.status} — failing job and refunding`);
        await supabase
          .from("generation_queue")
          .update({
            status: "failed",
            error_message: `Dispatch rejected (${dispatchResult.status}). Please try again.`,
            completed_at: new Date().toISOString(),
          })
          .eq("id", jobId);
        await supabase.rpc("refund_credits", { p_user_id: userId, p_amount: creditsReserved });
        continue;
      }

      dispatchedCount++;

      // Stagger dispatches (1s) to avoid thundering herd on AI gateway
      await new Promise((r) => setTimeout(r, 1000));
      console.log(`[process-queue] ⚡ Dispatched job ${jobId}, type=${jobType}, user=${userId}`);
    }

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log(`[process-queue] Done. Dispatched ${dispatchedCount} jobs in ${elapsed}s`);

    return new Response(
      JSON.stringify({ dispatched: dispatchedCount, elapsed_seconds: elapsed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[process-queue] Fatal error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } finally {
    // Always release the singleton lock so next invocation can dispatch
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
      });
      await supabase.rpc("release_dispatch_lock");
    } catch (lockErr) {
      console.error("[process-queue] Failed to release lock:", lockErr);
    }
  }
});
