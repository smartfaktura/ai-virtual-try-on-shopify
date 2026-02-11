import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map job types to edge function names
const JOB_TYPE_TO_FUNCTION: Record<string, string> = {
  product: "generate-product",
  tryon: "generate-tryon",
  freestyle: "generate-freestyle",
  workflow: "generate-workflow",
};

async function callGenerationFunction(
  functionUrl: string,
  serviceRoleKey: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      "x-queue-internal": "true",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(95_000), // 95s timeout for downstream calls (pro model)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(errorData.error || `Generation function returned ${response.status}`);
  }

  return await response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth guard: only allow internal calls with service role key
  const authHeader = req.headers.get("authorization");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (authHeader !== `Bearer ${serviceRoleKey}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const startTime = Date.now();
  const MAX_RUNTIME_MS = 100_000; // 100 seconds, accommodate pro model

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Step 1: Cleanup stale/timed-out jobs first
    const { data: cleanupResult } = await supabase.rpc("cleanup_stale_jobs");
    if (cleanupResult && (cleanupResult as Record<string, number>).cleaned > 0) {
      console.log(`[process-queue] Cleaned ${(cleanupResult as Record<string, number>).cleaned} stale jobs`);
    }

    let processedCount = 0;

    // Step 2: Loop — claim and process jobs until time runs out
    while (Date.now() - startTime < MAX_RUNTIME_MS) {
      // Claim next job
      const { data: claimResult, error: claimError } = await supabase.rpc("claim_next_job");

      if (claimError) {
        console.error("[process-queue] Claim error:", claimError);
        break;
      }

      const claimed = claimResult as Record<string, unknown>;
      if (!claimed.job || claimed.job === null) {
        console.log(`[process-queue] No more jobs. Processed ${processedCount} jobs total.`);
        break;
      }

      const job = claimed.job as Record<string, unknown>;
      const jobId = job.id as string;
      const jobType = job.job_type as string;
      const payload = job.payload as Record<string, unknown>;
      const userId = job.user_id as string;
      const creditsReserved = job.credits_reserved as number;

      console.log(`[process-queue] Processing job ${jobId}, type=${jobType}, user=${userId}`);

      try {
        // Route to the appropriate generation function
        const functionName = JOB_TYPE_TO_FUNCTION[jobType];
        if (!functionName) {
          throw new Error(`Unknown job type: ${jobType}`);
        }

        const functionUrl = `${supabaseUrl}/functions/v1/${functionName}`;

        // Inject user_id into payload so downstream functions can identify the user
        const enrichedPayload = { ...payload, user_id: userId };

        let allImages: string[] = [];
        let allErrors: string[] = [];

        // For freestyle with imageCount > 1: loop sequential 1-image calls
        const requestedCount = (payload as Record<string, unknown>).imageCount as number || 1;
        if (jobType === 'freestyle' && requestedCount > 1) {
          for (let i = 0; i < requestedCount; i++) {
            if (Date.now() - startTime >= MAX_RUNTIME_MS) {
              console.log(`[process-queue] Time budget exceeded during freestyle loop at image ${i + 1}`);
              break;
            }
            try {
              const singleResult = await callGenerationFunction(functionUrl, serviceRoleKey, enrichedPayload);
              const imgs = (singleResult.images as string[]) || [];
              allImages.push(...imgs);
              console.log(`[process-queue] Freestyle image ${i + 1}/${requestedCount} done (${imgs.length} images)`);
            } catch (loopErr) {
              console.error(`[process-queue] Freestyle image ${i + 1} failed:`, loopErr);
              allErrors.push(`Image ${i + 1}: ${loopErr instanceof Error ? loopErr.message : 'Unknown error'}`);
            }
          }
        } else {
          // Single call for all other types (and freestyle with imageCount=1)
          const result = await callGenerationFunction(functionUrl, serviceRoleKey, enrichedPayload);
          allImages = (result.images as string[]) || [];
          allErrors = (result.errors as string[]) || [];
        }

        const generatedCount = allImages.length;
        const result = { images: allImages, generatedCount, requestedCount, errors: allErrors.length > 0 ? allErrors : undefined };

        // Mark job as completed
        await supabase
          .from("generation_queue")
          .update({
            status: "completed",
            result,
            completed_at: new Date().toISOString(),
          })
          .eq("id", jobId);

        // For non-freestyle types, save to generation_jobs for library
        // (Freestyle saves its own records inside the function)
        if (jobType !== 'freestyle' && generatedCount > 0) {
          await supabase.from("generation_jobs").insert({
            user_id: userId,
            results: allImages,
            status: "completed",
            completed_at: new Date().toISOString(),
            product_id: (payload as Record<string, unknown>).product_id || null,
            workflow_id: (payload as Record<string, unknown>).workflow_id || null,
            brand_profile_id: (payload as Record<string, unknown>).brand_profile_id || null,
            ratio: (payload as Record<string, unknown>).aspectRatio || "1:1",
            quality: (payload as Record<string, unknown>).quality || "standard",
            requested_count: requestedCount,
            credits_used: creditsReserved,
            creative_drop_id: (payload as Record<string, unknown>).creative_drop_id || null,
            prompt_final: (payload as Record<string, unknown>).prompt || null,
          });
        }

        // Handle partial success — refund unused credits
        if (generatedCount < requestedCount && generatedCount > 0) {
          const perImageCost = Math.floor(creditsReserved / requestedCount);
          const refundAmount = perImageCost * (requestedCount - generatedCount);
          if (refundAmount > 0) {
            await supabase.rpc("refund_credits", {
              p_user_id: userId,
              p_amount: refundAmount,
            });
            console.log(`[process-queue] Partial success: refunded ${refundAmount} credits for job ${jobId}`);
          }
        }

        processedCount++;
        console.log(`[process-queue] ✓ Job ${jobId} completed (${generatedCount} images)`);

      } catch (error) {
        console.error(`[process-queue] ✗ Job ${jobId} failed:`, error);

        // Mark as failed
        await supabase
          .from("generation_queue")
          .update({
            status: "failed",
            error_message: error instanceof Error ? error.message : "Unknown error",
            completed_at: new Date().toISOString(),
          })
          .eq("id", jobId);

        // Refund credits
        await supabase.rpc("refund_credits", {
          p_user_id: userId,
          p_amount: creditsReserved,
        });

        console.log(`[process-queue] Refunded ${creditsReserved} credits for failed job ${jobId}`);
      }
    }

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log(`[process-queue] Done. Processed ${processedCount} jobs in ${elapsed}s`);

    return new Response(
      JSON.stringify({ processed: processedCount, elapsed_seconds: elapsed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[process-queue] Fatal error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
