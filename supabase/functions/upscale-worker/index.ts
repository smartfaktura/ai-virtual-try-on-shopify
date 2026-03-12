import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESOLUTION_CONFIG: Record<string, { maxPx: number; label: string }> = {
  "2k": { maxPx: 2048, label: "2K" },
  "4k": { maxPx: 4096, label: "4K" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

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

    console.log(`[upscale-worker] Job ${jobId}: upscaling to ${resConfig.label} (${resConfig.maxPx}px), source=${sourceType}/${sourceId}`);

    // 1. Fetch source image
    const imgResponse = await fetch(imageUrl);
    if (!imgResponse.ok) throw new Error(`Failed to fetch source image: ${imgResponse.status}`);
    const imgBuffer = await imgResponse.arrayBuffer();

    // Chunked base64 encoding
    const uint8 = new Uint8Array(imgBuffer);
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < uint8.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, Array.from(uint8.slice(i, i + chunkSize)));
    }
    const imgBase64 = btoa(binary);
    const mimeType = imgResponse.headers.get("content-type") || "image/png";

    // 2. Build resolution-specific prompt with professional upscaling directives
    const targetPx = resConfig.maxPx;
    const promptText = `You are a professional image upscaler. Take this image and output the EXACT same image at ${targetPx}px on its longest edge as a high-resolution PNG.

CRITICAL RULES:
- Preserve EVERY detail: composition, colors, lighting, shadows, reflections, framing
- Do NOT add, remove, change, or hallucinate any element
- Do NOT crop, reframe, or alter the aspect ratio
- Enhance sharpness: visible material textures, fine stitching, micro-contrast on skin texture
- Maximize detail clarity on edges, text, patterns, and fine structures
- Razor-sharp eye detail with individual eyelash rendering where applicable
- Output as lossless PNG at the highest possible quality
- The result must be indistinguishable from the original except at higher resolution`;

    // 3. Call Gemini 3 Pro Image for maximum upscale fidelity
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        modalities: ["image", "text"],
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: promptText },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${imgBase64}` } },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error(`[upscale-worker] AI gateway error: ${aiResponse.status}`, errText);

      if (aiResponse.status === 429) {
        throw new Error("Rate limited by AI gateway. Please try again shortly.");
      }
      if (aiResponse.status === 402) {
        throw new Error("AI gateway payment required.");
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();

    // 4. Extract generated image
    let newImageBase64: string | null = null;
    let newMimeType = "image/png";

    // Try images array first (Lovable AI gateway format)
    const images = aiResult.choices?.[0]?.message?.images;
    if (Array.isArray(images)) {
      for (const img of images) {
        if (img.type === "image_url" && img.image_url?.url) {
          const dataUrl = img.image_url.url as string;
          const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            newMimeType = match[1];
            newImageBase64 = match[2];
            break;
          }
        }
      }
    }

    // Fallback to content array
    if (!newImageBase64) {
      const content = aiResult.choices?.[0]?.message?.content;
      if (Array.isArray(content)) {
        for (const part of content) {
          if (part.type === "image_url" && part.image_url?.url) {
            const dataUrl = part.image_url.url as string;
            const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
              newMimeType = match[1];
              newImageBase64 = match[2];
              break;
            }
          }
        }
      }
    }

    if (!newImageBase64) {
      throw new Error("No image returned from AI model");
    }

    // 5. Decode and upload
    const binaryStr = atob(newImageBase64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const ext = newMimeType.includes("png") ? "png" : "jpg";
    const storagePath = `upscaled/${userId}/${crypto.randomUUID()}-${resolution}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("freestyle-images")
      .upload(storagePath, bytes, {
        contentType: newMimeType,
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

    // 6. Create NEW record — do NOT update the original
    // Fetch source metadata to copy into the new record
    let sourcePrompt = `Upscaled from ${sourceType}/${sourceId}`;
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
      // For generation items, extract the job prompt
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

    // Insert a new freestyle_generations row for the upscaled version
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

    // 7. Mark queue job as completed
    await supabase
      .from("generation_queue")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        result: { imageUrl: newImageUrl, resolution },
      })
      .eq("id", jobId);

    console.log(`[upscale-worker] ✅ Job ${jobId} completed: ${resConfig.label} upscale → ${storagePath}`);

    return new Response(
      JSON.stringify({ success: true, imageUrl: newImageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`[upscale-worker] Job ${jobId} failed:`, error);

    // Mark queue job as failed — cleanup_stale_jobs handles credit refund
    if (jobId) {
      await supabase
        .from("generation_queue")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : "Upscale failed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      // Refund credits immediately
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
