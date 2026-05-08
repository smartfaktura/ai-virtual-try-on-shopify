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

const BATCH_SIZE = 6; // max concurrent dispatches per round
const STAGGER_MS = 200; // small stagger between fetches within a batch

/**
 * Fire-and-forget: dispatch job to generation function.
 * Uses a short timeout — we only care about immediate rejection (403/500),
 * not the full generation response. The generation function updates the queue itself.
 */
function dispatchGenerationFunction(
  functionUrl: string,
  serviceRoleKey: string,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; status?: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

  return fetch(functionUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      "x-queue-internal": "true",
    },
    body: JSON.stringify(payload),
    signal: controller.signal,
  }).then(async (res) => {
    clearTimeout(timeout);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[process-queue] Dispatch rejected: ${res.status} ${body.slice(0, 300)}`);
      return { ok: false, status: res.status };
    }
    // Don't read body — function is still running
    return { ok: true };
  }).catch((err) => {
    clearTimeout(timeout);
    // AbortError means the function accepted the connection and is still processing — that's success
    if (err.name === "AbortError") {
      return { ok: true };
    }
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

  let authOk = false;
  if (authHeader === `Bearer ${serviceRoleKey}`) {
    authOk = true;
  } else if (isQueueInternal && authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.replace("Bearer ", "");
      const payloadB64 = token.split(".")[1];
      if (payloadB64) {
        const payload = JSON.parse(atob(payloadB64));
        if (payload.role === "service_role") {
          authOk = true;
        }
      }
    } catch {
      // Invalid token format
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
  const MAX_RUNTIME_MS = 55_000;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Step 0: Acquire singleton dispatch lock
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

    // Step 2: Loop — claim batches of jobs and dispatch concurrently
    while (Date.now() - startTime < MAX_RUNTIME_MS) {
      // Claim up to BATCH_SIZE jobs
      interface ClaimedJob {
        id: string;
        job_type: string;
        payload: Record<string, unknown>;
        user_id: string;
        credits_reserved: number;
      }
      const batch: ClaimedJob[] = [];

      for (let i = 0; i < BATCH_SIZE; i++) {
        if (Date.now() - startTime >= MAX_RUNTIME_MS) break;

        const { data: claimResult, error: claimError } = await supabase.rpc("claim_next_job");
        if (claimError) {
          console.error("[process-queue] Claim error:", claimError);
          break;
        }
        const claimed = claimResult as Record<string, unknown>;
        if (!claimed.job || claimed.job === null) break;

        batch.push(claimed.job as ClaimedJob);
      }

      if (batch.length === 0) {
        console.log(`[process-queue] No more jobs. Dispatched ${dispatchedCount} jobs total.`);
        break;
      }

      // Dispatch all jobs in this batch concurrently with small stagger
      const dispatches = batch.map((job, idx) => {
        const functionName = JOB_TYPE_TO_FUNCTION[job.job_type];
        if (!functionName) {
          // Unknown job type — fail immediately
          return (async () => {
            console.error(`[process-queue] Unknown job type: ${job.job_type}, failing job ${job.id}`);
            await supabase
              .from("generation_queue")
              .update({ status: "failed", error_message: `Unknown job type: ${job.job_type}`, completed_at: new Date().toISOString() })
              .eq("id", job.id);
            await supabase.rpc("refund_credits", { p_user_id: job.user_id, p_amount: job.credits_reserved });
            return { job, ok: false, skipped: true };
          })();
        }

        const functionUrl = `${supabaseUrl}/functions/v1/${functionName}`;
        const enrichedPayload = {
          ...job.payload,
          user_id: job.user_id,
          job_id: job.id,
          job_type: job.job_type,
          credits_reserved: job.credits_reserved,
        };

        // Small stagger to avoid thundering herd
        return new Promise<{ job: ClaimedJob; ok: boolean; skipped?: boolean }>((resolve) => {
          setTimeout(async () => {
            const result = await dispatchGenerationFunction(functionUrl, serviceRoleKey, enrichedPayload);
            if (!result.ok) {
              console.error(`[process-queue] Dispatch of job ${job.id} rejected with status ${result.status} — failing job and refunding`);
              await supabase
                .from("generation_queue")
                .update({ status: "failed", error_message: `Dispatch rejected (${result.status}). Please try again.`, completed_at: new Date().toISOString() })
                .eq("id", job.id);
              await supabase.rpc("refund_credits", { p_user_id: job.user_id, p_amount: job.credits_reserved });
            }
            resolve({ job, ok: result.ok });
          }, idx * STAGGER_MS);
        });
      });

      const results = await Promise.allSettled(dispatches);
      for (const r of results) {
        if (r.status === "fulfilled" && r.value.ok) {
          dispatchedCount++;
          console.log(`[process-queue] ⚡ Dispatched job ${r.value.job.id}, type=${r.value.job.job_type}, user=${r.value.job.user_id}`);
        }
      }
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
