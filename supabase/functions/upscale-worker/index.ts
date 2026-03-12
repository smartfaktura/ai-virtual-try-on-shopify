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

    // 2. Build resolution-specific prompt
    const promptText = resolution === "4k"
      ? `[SOURCE IMAGE]: Reproduce this EXACT image at 4096 pixels on the longest edge. Maximum resolution, razor-sharp details, no compression artifacts. Preserve every detail: colors, composition, lighting, textures, skin pores, fabric weave, background elements. Do NOT change anything — same framing, same content, same style. Output at absolute maximum quality and resolution.`
      : `[SOURCE IMAGE]: Reproduce this EXACT image at 2048 pixels on the longest edge. Ultra-sharp, preserve all details: colors, composition, lighting, textures. No compression artifacts, maximum quality output. Do not change anything about the image — same framing, same content, same style. Just output at higher resolution.`;

    // 3. Call Gemini 3 Pro Image for upscale
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90_000);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
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

    // Parse sourceId for generation items (composite: "jobUUID-index")
    let storageId = sourceId;
    if (sourceType === "generation") {
      const lastDash = sourceId.lastIndexOf("-");
      if (lastDash > 0) {
        storageId = sourceId.substring(0, lastDash);
      }
    }

    const ext = newMimeType.includes("png") ? "png" : "jpg";
    const storagePath = `upscaled/${userId}/${storageId}-${resolution}.${ext}`;

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

    // 6. Update source DB record
    if (sourceType === "freestyle") {
      const { error: updateError } = await supabase
        .from("freestyle_generations")
        .update({ image_url: newImageUrl, quality: "upscaled" })
        .eq("id", sourceId)
        .eq("user_id", userId);

      if (updateError) {
        console.error("[upscale-worker] DB update error:", updateError);
        throw new Error("Failed to update freestyle record");
      }
    } else if (sourceType === "generation") {
      const lastDash = sourceId.lastIndexOf("-");
      const realJobId = sourceId.substring(0, lastDash);
      const resultIndex = parseInt(sourceId.substring(lastDash + 1), 10);

      const { data: jobData, error: fetchError } = await supabase
        .from("generation_jobs")
        .select("results")
        .eq("id", realJobId)
        .eq("user_id", userId)
        .single();

      if (fetchError || !jobData) {
        console.error("[upscale-worker] Failed to fetch job:", fetchError);
        throw new Error("Failed to find generation job");
      }

      const results = Array.isArray(jobData.results) ? [...(jobData.results as string[])] : [];
      if (resultIndex >= 0 && resultIndex < results.length) {
        results[resultIndex] = newImageUrl;
      }

      const { error: updateError } = await supabase
        .from("generation_jobs")
        .update({ results, quality: "upscaled" })
        .eq("id", realJobId)
        .eq("user_id", userId);

      if (updateError) {
        console.error("[upscale-worker] DB update error:", updateError);
        throw new Error("Failed to update generation job");
      }
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
