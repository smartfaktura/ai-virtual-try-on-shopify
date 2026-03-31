import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Detect actual image format from magic bytes ──────────────────────────
function detectImageFormat(bytes: Uint8Array): { ext: string; contentType: string } {
  if (bytes[0] === 0xFF && bytes[1] === 0xD8) return { ext: 'jpg', contentType: 'image/jpeg' };
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[8] === 0x57 && bytes[9] === 0x45) return { ext: 'webp', contentType: 'image/webp' };
  return { ext: 'png', contentType: 'image/png' };
}

// --- Previous config (kept for rollback) ---
// const RESOLUTION_CONFIG = {
//   "2k": { maxPx: 2048, label: "2K", model: "Standard V2", sharpen: 0.85, fix_compression: 0.6, denoise: 0.05, strength: 0.85, face_enhancement: true, face_enhancement_strength: 0.6, face_enhancement_creativity: 0.2 },
//   "4k": { maxPx: 4096, label: "4K", model: "High Fidelity V2", sharpen: 0.9, fix_compression: 0.65, denoise: 0.03, strength: 0.9, face_enhancement: true, face_enhancement_strength: 0.7, face_enhancement_creativity: 0.2 },
// };

const RESOLUTION_CONFIG: Record<string, { maxPx: number; label: string; model: string; sharpen: number; fix_compression: number; denoise: number; strength: number; face_enhancement: boolean; face_enhancement_strength: number; face_enhancement_creativity: number }> = {
  "2k": { maxPx: 2048, label: "2K", model: "Wonder", sharpen: 0.5, fix_compression: 0.4, denoise: 0.03, strength: 0.85, face_enhancement: true, face_enhancement_strength: 0.6, face_enhancement_creativity: 0.3 },
  "4k": { maxPx: 4096, label: "4K", model: "Wonder", sharpen: 0.5, fix_compression: 0.4, denoise: 0.03, strength: 0.9, face_enhancement: true, face_enhancement_strength: 0.7, face_enhancement_creativity: 0.3 },
};

const TOPAZ_BASE = "https://api.topazlabs.com/image/v1";
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 60; // 3s × 60 = 3 min max

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const topazApiKey = Deno.env.get("TOPAZ_API_KEY")!;

  // Internal-only: only process-queue can call this
  const authHeader = req.headers.get("authorization");
  const isInternal = req.headers.get("x-queue-internal") === "true";
  if (!isInternal || authHeader !== `Bearer ${serviceRoleKey}`) {
    return new Response(
      JSON.stringify({ error: "This function is queue-only. Use enqueue-generation instead." }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  let jobId: string | undefined;
  let userId: string | undefined;
  let creditsReserved: number | undefined;

  try {
    const body = await req.json();
    jobId = body.job_id;
    userId = body.user_id;
    creditsReserved = body.credits_reserved;
    const imageUrl = body.imageUrl as string;
    const sourceType = body.sourceType as string;
    const sourceId = body.sourceId as string;
    const resolution = (body.resolution as string) || "2k";

    if (!imageUrl || !sourceType || !sourceId || !jobId || !userId) {
      throw new Error("Missing required fields: imageUrl, sourceType, sourceId, job_id, user_id");
    }

    const resConfig = RESOLUTION_CONFIG[resolution] || RESOLUTION_CONFIG["2k"];
    const qualityTag = resolution === "4k" ? "upscaled_4k" : "upscaled_2k";

    console.log(`[upscale-worker] Job ${jobId}: upscaling to ${resConfig.label} (${resConfig.maxPx}px) using Topaz ${resConfig.model}, source=${sourceType}/${sourceId}`);

    // 1. Submit to Topaz Labs Enhance API (async)
    const formData = new FormData();
    // Fetch the source image and submit as file upload
    const imgResponse = await fetch(imageUrl);
    if (!imgResponse.ok) throw new Error(`Failed to fetch source image: ${imgResponse.status}`);
    const imgBlob = await imgResponse.blob();
    const sourceSizeKB = Math.round(imgBlob.size / 1024);

    formData.append("image", imgBlob, "source.png");
    formData.append("model", resConfig.model);
    formData.append("output_width", String(resConfig.maxPx));
    formData.append("output_format", "png");
    formData.append("sharpen", String(resConfig.sharpen));
    formData.append("fix_compression", String(resConfig.fix_compression));
    formData.append("denoise", String(resConfig.denoise));
    formData.append("strength", String(resConfig.strength));
    if (resConfig.face_enhancement) {
      formData.append("face_enhancement", "true");
      formData.append("face_enhancement_strength", String(resConfig.face_enhancement_strength));
      formData.append("face_enhancement_creativity", String(resConfig.face_enhancement_creativity));
    }

    const submitResponse = await fetch(`${TOPAZ_BASE}/enhance/async`, {
      method: "POST",
      headers: {
        "X-API-Key": topazApiKey,
      },
      body: formData,
    });

    if (!submitResponse.ok) {
      const errText = await submitResponse.text();
      console.error(`[upscale-worker] Topaz submit error: ${submitResponse.status}`, errText);
      if (submitResponse.status === 401 || submitResponse.status === 403) {
        throw new Error("Topaz API authentication failed. Check API key.");
      }
      if (submitResponse.status === 402) {
        throw new Error("Topaz API: insufficient credits on Topaz account.");
      }
      if (submitResponse.status === 429) {
        throw new Error("Topaz API rate limited. Please try again shortly.");
      }
      throw new Error(`Topaz API error: ${submitResponse.status}`);
    }

    const submitResult = await submitResponse.json();
    const processId = submitResult.process_id;
    if (!processId) {
      throw new Error("No process_id returned from Topaz API");
    }

    console.log(`[upscale-worker] Job ${jobId}: Topaz process_id=${processId}, ETA=${submitResult.eta}`);

    // 2. Poll for completion
    let status = "pending";
    let attempts = 0;

    while (status !== "completed" && status !== "failed" && attempts < MAX_POLL_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      attempts++;

      const statusResponse = await fetch(`${TOPAZ_BASE}/status/${processId}`, {
        headers: { "X-API-Key": topazApiKey },
      });

      if (!statusResponse.ok) {
        console.warn(`[upscale-worker] Status poll ${attempts} failed: ${statusResponse.status}`);
        continue;
      }

      const statusResult = await statusResponse.json();
      status = statusResult.status?.toLowerCase() || "unknown";
      console.log(`[upscale-worker] Job ${jobId}: poll ${attempts}/${MAX_POLL_ATTEMPTS} → ${status}`);

      if (status === "failed" || status === "error" || status === "cancelled") {
        throw new Error(`Topaz processing failed: ${statusResult.error || "Unknown error"}`);
      }
    }

    if (status !== "completed") {
      throw new Error(`Topaz processing timed out after ${MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS / 1000}s`);
    }

    // 3. Get download URL from Topaz (returns JSON with presigned URL)
    const downloadMetaResponse = await fetch(`${TOPAZ_BASE}/download/${processId}`, {
      headers: { "X-API-Key": topazApiKey },
    });

    if (!downloadMetaResponse.ok) {
      throw new Error(`Failed to get download URL from Topaz: ${downloadMetaResponse.status}`);
    }

    const downloadMeta = await downloadMetaResponse.json();
    const presignedUrl = downloadMeta.download_url;
    if (!presignedUrl) {
      throw new Error("No download_url in Topaz download response");
    }

    console.log(`[upscale-worker] Job ${jobId}: fetching processed image from presigned URL`);

    const imageDownloadResponse = await fetch(presignedUrl);
    if (!imageDownloadResponse.ok) {
      throw new Error(`Failed to download processed image: ${imageDownloadResponse.status}`);
    }

    const processedBlob = await imageDownloadResponse.blob();
    const outputSizeKB = Math.round(processedBlob.size / 1024);
    const processedBytes = new Uint8Array(await processedBlob.arrayBuffer());

    console.log(`[upscale-worker] Job ${jobId}: Topaz output ${outputSizeKB}KB (source was ${sourceSizeKB}KB)`);

    // 4. Upload to storage
    const storagePath = `upscaled/${userId}/${crypto.randomUUID()}-${resolution}.png`;

    const { error: uploadError } = await supabase.storage
      .from("freestyle-images")
      .upload(storagePath, processedBytes, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("[upscale-worker] Upload error:", uploadError);
      throw new Error("Failed to upload upscaled image");
    }

    const { data: publicUrlData } = supabase.storage
      .from("freestyle-images")
      .getPublicUrl(storagePath);

    const newImageUrl = publicUrlData.publicUrl;

    // 5. Fetch source metadata and create new record
    let sourcePrompt = `Enhanced to ${resolution === '4k' ? '4K' : '2K'}`;
    let sourceAspectRatio = "1:1";
    let sourceModelId: string | null = null;
    let sourceSceneId: string | null = null;
    let sourceProductId: string | null = null;

    if (sourceType === "freestyle") {
      const { data: srcRow } = await supabase
        .from("freestyle_generations")
        .select("prompt, aspect_ratio, model_id, scene_id, product_id")
        .eq("id", sourceId)
        .eq("user_id", userId)
        .single();

      if (srcRow) {
        sourcePrompt = srcRow.prompt || sourcePrompt;
        sourceAspectRatio = srcRow.aspect_ratio || sourceAspectRatio;
        sourceModelId = srcRow.model_id;
        sourceSceneId = srcRow.scene_id;
        sourceProductId = srcRow.product_id;
      }
    } else if (sourceType === "generation") {
      const lastDash = sourceId.lastIndexOf("-");
      const realJobId = sourceId.substring(0, lastDash);

      const { data: jobData } = await supabase
        .from("generation_jobs")
        .select("prompt_final, ratio, product_id")
        .eq("id", realJobId)
        .eq("user_id", userId)
        .single();

      if (jobData) {
        sourcePrompt = jobData.prompt_final || sourcePrompt;
        sourceAspectRatio = jobData.ratio || sourceAspectRatio;
        sourceProductId = jobData.product_id;
      }
    }

    const { error: insertError } = await supabase
      .from("freestyle_generations")
      .insert({
        user_id: userId,
        image_url: newImageUrl,
        prompt: sourcePrompt,
        aspect_ratio: sourceAspectRatio,
        quality: qualityTag,
        model_id: sourceModelId,
        scene_id: sourceSceneId,
        product_id: sourceProductId,
      });

    if (insertError) {
      console.error("[upscale-worker] Insert error:", insertError);
      throw new Error("Failed to create upscaled record");
    }

    // 6. Check for cancellation before marking completed
    const { data: currentJob } = await supabase
      .from("generation_queue")
      .select("status")
      .eq("id", jobId)
      .single();

    if (currentJob?.status === "cancelled") {
      console.log(`[upscale-worker] Job ${jobId} was cancelled — skipping completion`);
    } else {
      await supabase
        .from("generation_queue")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          result: { imageUrl: newImageUrl, resolution },
        })
        .eq("id", jobId);
    }

    // 7. Clean up Topaz status (optional, free up their storage)
    fetch(`${TOPAZ_BASE}/status/${processId}`, {
      method: "DELETE",
      headers: { "X-API-Key": topazApiKey },
    }).catch(() => {});

    console.log(`[upscale-worker] ✅ Job ${jobId} completed: ${resConfig.label} upscale via Topaz → ${storagePath}`);

    return new Response(
      JSON.stringify({ success: true, imageUrl: newImageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`[upscale-worker] Job ${jobId} failed:`, error);

    if (jobId) {
      await supabase
        .from("generation_queue")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : "Upscale failed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      if (userId && creditsReserved) {
        await supabase.rpc("refund_credits", {
          p_user_id: userId,
          p_amount: creditsReserved,
        });
      }
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Upscale failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
