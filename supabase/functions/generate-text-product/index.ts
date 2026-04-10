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

// ── Helper: Convert URL to native Gemini inlineData part ────────────
async function urlToInlineDataPart(url: string): Promise<Record<string, unknown>> {
  if (url.startsWith("data:")) {
    const match = url.match(/^data:(image\/\w+);base64,(.+)$/s);
    if (match) return { inlineData: { mimeType: match[1], data: match[2] } };
  }
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch image for inlineData: ${resp.status}`);
  const buf = await resp.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  const b64 = btoa(binary);
  const contentType = resp.headers.get("content-type") || "image/png";
  const mimeType = contentType.split(";")[0].trim();
  return { inlineData: { mimeType, data: b64 } };
}

function extractImageFromGeminiResponse(data: Record<string, unknown>): string | null {
  const candidates = data.candidates as Array<Record<string, unknown>> | undefined;
  if (!candidates?.length) return null;
  const parts = (candidates[0].content as Record<string, unknown>)?.parts as Array<Record<string, unknown>> | undefined;
  if (!parts) return null;
  for (const part of parts) {
    const inlineData = part.inlineData as { mimeType: string; data: string } | undefined;
    if (inlineData?.data) return `data:${inlineData.mimeType};base64,${inlineData.data}`;
  }
  return null;
}

// ── Gemini native image generation ──────────────────────────────────
async function generateImageGemini(
  prompt: string,
  model: string,
  apiKey: string,
  aspectRatio?: string,
  referenceParts?: Record<string, unknown>[],
): Promise<string | null> {
  const maxRetries = 1;
  const PER_IMAGE_TIMEOUT = 100_000;

  const nativeParts: Record<string, unknown>[] = [
    ...(referenceParts || []),
    { text: prompt },
  ];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const generationConfig: Record<string, unknown> = {
        responseModalities: ["IMAGE", "TEXT"],
        temperature: 1.0,
        imageConfig: {
          ...(aspectRatio ? { aspectRatio } : {}),
          imageSize: "2K",
        },
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "x-goog-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: nativeParts }],
            generationConfig,
          }),
          signal: AbortSignal.timeout(PER_IMAGE_TIMEOUT),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          console.warn(`[generate-text-product] 429 (attempt ${attempt + 1})`);
          if (attempt < maxRetries) {
            const jitter = Math.random() * 3000;
            await new Promise((r) => setTimeout(r, 3000 * (attempt + 1) + jitter));
            continue;
          }
          return null;
        }
        if (response.status === 402) {
          throw { status: 402, message: "Payment required - please add credits" };
        }
        const errorText = await response.text();
        console.error(`[generate-text-product] Gemini error (attempt ${attempt + 1}):`, response.status, errorText);
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        return null;
      }

      let data: Record<string, unknown>;
      try {
        data = await response.json();
      } catch (jsonErr) {
        console.error(`[generate-text-product] JSON parse failed:`, jsonErr);
        if (attempt < maxRetries) { await new Promise((r) => setTimeout(r, 1000)); continue; }
        return null;
      }

      const imageUrl = extractImageFromGeminiResponse(data);
      if (!imageUrl) {
        console.error("[generate-text-product] No image in Gemini response:", JSON.stringify(data).slice(0, 500));
        if (attempt < maxRetries) { await new Promise((r) => setTimeout(r, 1000)); continue; }
        return null;
      }
      return imageUrl;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "status" in error) throw error;
      const isTimeout = error instanceof DOMException && error.name === 'TimeoutError';
      console.error(`[generate-text-product] Attempt ${attempt + 1} failed${isTimeout ? ' (timeout)' : ''}:`, error);
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      if (isTimeout) return null;
      throw error;
    }
  }
  return null;
}

// ── Seedream fallback (text-only, no reference images) ──────────────
const SEEDREAM_MODERATION_CODES = [1301, 1302, 1303, 1304, 1305, 1024];

function seedreamAspectRatio(appRatio: string): string {
  const map: Record<string, string> = {
    "1:1": "1:1", "16:9": "16:9", "9:16": "9:16",
    "4:3": "4:3", "3:4": "3:4", "4:5": "4:5",
    "5:4": "5:4", "3:2": "3:2", "2:3": "2:3", "21:9": "21:9",
  };
  return map[appRatio] || "1:1";
}

async function generateImageSeedream(
  prompt: string,
  model: string,
  apiKey: string,
  aspectRatio = "1:1",
): Promise<{ ok: boolean; imageUrl?: string; error?: string }> {
  const ARK_BASE = "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations";
  const seedreamRatio = seedreamAspectRatio(aspectRatio);
  const timeoutMs = 90_000;

  try {
    const body: Record<string, unknown> = {
      model, prompt, size: "2K",
      aspect_ratio: seedreamRatio,
      response_format: "url",
      watermark: false,
      sequential_image_generation: "disabled",
    };

    const response = await fetch(ARK_BASE, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      let errorText = "";
      try { errorText = await response.text(); } catch (_) { /* ignore */ }
      try {
        const errJson = JSON.parse(errorText);
        const errCode = errJson?.error?.code || errJson?.code;
        if (errCode && SEEDREAM_MODERATION_CODES.includes(Number(errCode))) {
          return { ok: false, error: `Content moderated: ${errJson?.error?.message || errJson?.message}` };
        }
      } catch (_) { /* not JSON */ }
      return { ok: false, error: `ARK API error ${response.status}: ${errorText.slice(0, 200)}` };
    }

    const data = await response.json();
    const respCode = data?.error?.code || data?.code;
    if (respCode && SEEDREAM_MODERATION_CODES.includes(Number(respCode))) {
      return { ok: false, error: `Content moderated: ${data?.error?.message || data?.message}` };
    }

    const imageUrl = data?.data?.[0]?.url;
    if (!imageUrl) return { ok: false, error: "No URL in Seedream response" };
    return { ok: true, imageUrl };
  } catch (error: unknown) {
    const isTimeout = error instanceof DOMException && error.name === "TimeoutError";
    return { ok: false, error: isTimeout ? "Seedream request timed out (90s)" : (error instanceof Error ? error.message : "Unknown error") };
  }
}

// ── Queue completion helper ──────────────────────────────────────────
async function completeQueueJob(
  jobId: string,
  userId: string,
  creditsReserved: number,
  images: string[],
  requestedCount: number,
  errors: string[],
  payload: Record<string, unknown>,
) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const { data: currentJob } = await supabase
    .from("generation_queue")
    .select("status")
    .eq("id", jobId)
    .single();

  if (currentJob?.status === "cancelled") {
    console.log(`[generate-text-product] Job ${jobId} was cancelled — skipping completion`);
    return;
  }

  const generatedCount = images.length;

  if (generatedCount === 0) {
    await supabase.from("generation_queue").update({
      status: "failed",
      error_message: errors.join("; ") || "Failed to generate any images",
      completed_at: new Date().toISOString(),
    }).eq("id", jobId);
    await supabase.rpc("refund_credits", { p_user_id: userId, p_amount: creditsReserved });
    console.log(`[generate-text-product] Refunded ${creditsReserved} credits for failed job ${jobId}`);

    // Fire-and-forget: send generation failed email if user opted in
    try {
      const { data: profile } = await supabase.from("profiles").select("email, display_name, settings").eq("user_id", userId).single();
      const settings = (profile?.settings as Record<string, unknown>) || {};
      if (profile?.email && settings.emailOnFailed !== false) {
        fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: { Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ type: "generation_failed", to: profile.email, data: { jobType: "text-product", errorMessage: errors.join("; "), displayName: profile.display_name, workflowName: "Text to Product" } }),
        }).catch((e) => console.warn("[generate-text-product] Failed email send failed:", e.message));
      }
    } catch (e) { console.warn("[generate-text-product] Failed email lookup failed:", e); }
    return;
  }

  const result = { images, generatedCount, requestedCount, errors: errors.length > 0 ? errors : undefined };

  await supabase.from("generation_queue").update({
    status: "completed",
    result,
    completed_at: new Date().toISOString(),
  }).eq("id", jobId);

  await supabase.from("generation_jobs").insert({
    user_id: userId,
    results: images,
    status: "completed",
    completed_at: new Date().toISOString(),
    ratio: payload.aspectRatio || "1:1",
    quality: "high",
    requested_count: requestedCount,
    credits_used: creditsReserved,
    workflow_slug: "text-to-product",
    product_name: payload.title || null,
  });

  if (generatedCount < requestedCount) {
    const perImageCost = Math.floor(creditsReserved / requestedCount);
    const refundAmount = perImageCost * (requestedCount - generatedCount);
    if (refundAmount > 0) {
      await supabase.rpc("refund_credits", { p_user_id: userId, p_amount: refundAmount });
      console.log(`[generate-text-product] Partial: refunded ${refundAmount} credits for job ${jobId}`);
    }
  }

  console.log(`[generate-text-product] ✓ Queue job ${jobId} completed (${generatedCount} images)`);

  // Fire-and-forget: send generation complete email
  try {
    const { data: profile } = await supabase.from("profiles").select("email, display_name, settings").eq("user_id", userId).single();
    const settings = (profile?.settings as Record<string, unknown>) || {};
    if (profile?.email && settings.emailOnComplete === true) {
      fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: { Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ type: "generation_complete", to: profile.email, data: { imageCount: generatedCount, jobType: "text-product", displayName: profile.display_name } }),
      }).catch((e) => console.warn("[generate-text-product] Email send failed:", e.message));
    }
  } catch (e) { console.warn("[generate-text-product] Email lookup failed:", e); }
}

// ── Main handler ─────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authHeaderRaw = req.headers.get("authorization");
  const isQueueInternal = req.headers.get("x-queue-internal") === "true"
    && authHeaderRaw === `Bearer ${serviceRoleKey}`;

  const FUNCTION_START = Date.now();
  const MAX_WALL_CLOCK_MS = 270_000;

  try {
    if (!isQueueInternal) {
      return new Response(
        JSON.stringify({ error: "Direct access not allowed. Use the generation queue." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { scenes, title, user_id: userId, job_id: jobId, credits_reserved: creditsReserved, referenceImageUrl } = body;

    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      if (jobId && userId && creditsReserved) {
        await completeQueueJob(jobId, userId, creditsReserved, [], 1, ["No scenes provided"], body);
      }
      return new Response(
        JSON.stringify({ error: "Missing required field: scenes" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build reference image parts if provided
    let referenceParts: Record<string, unknown>[] | undefined;
    if (referenceImageUrl) {
      try {
        const refPart = await urlToInlineDataPart(referenceImageUrl);
        referenceParts = [refPart];
        console.log(`[generate-text-product] Reference image provided — will use as visual inspiration`);
      } catch (refErr) {
        console.warn(`[generate-text-product] Failed to process reference image:`, refErr);
      }
    }

    const ANTI_COPYRIGHT_INSTRUCTION = referenceParts
      ? `REFERENCE IMAGE RULES: The attached image is visual inspiration ONLY. Use it for shape, silhouette, color palette, and style direction. Do NOT copy any brand logos, labels, text, trademarks, or brand-specific patterns. Create a generic unbranded version. Remove or replace all visible branding.\n\n`
      : "";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const totalToGenerate = scenes.length;
    const model = "gemini-3-pro-image-preview";

    console.log(`[generate-text-product] Generating ${totalToGenerate} scenes using ${model} for "${title || 'untitled'}"${referenceParts ? ' (with reference image)' : ''}`);

    const images: Array<{ url: string; label: string; aspect_ratio: string }> = [];
    const errors: string[] = [];
    let wallClockBreak = false;

    for (let i = 0; i < scenes.length && !wallClockBreak; i++) {
      const scene = scenes[i];
      const prompt = ANTI_COPYRIGHT_INSTRUCTION + (scene.prompt as string);
      const label = scene.label as string || `Scene ${i + 1}`;
      const aspectRatio = scene.aspect_ratio as string || "1:1";

      if (Date.now() - FUNCTION_START > MAX_WALL_CLOCK_MS) {
        console.warn(`[generate-text-product] Wall-clock limit approaching, breaking after ${images.length}/${totalToGenerate}`);
        wallClockBreak = true;
        break;
      }

      try {
        console.log(`[generate-text-product] Scene ${i + 1}/${totalToGenerate}: "${label}" (${aspectRatio})`);

        // Tier 1: Gemini Pro (with reference image if available)
        let imageUrl = await generateImageGemini(prompt, model, GEMINI_API_KEY, aspectRatio, referenceParts);

        // Tier 2: Seedream 4.5 fallback
        if (imageUrl === null) {
          const arkApiKey = Deno.env.get("BYTEPLUS_ARK_API_KEY");
          if (arkApiKey) {
            console.warn(`[generate-text-product] Gemini returned null — falling back to Seedream 4.5 for "${label}"`);
            const seedreamResult = await generateImageSeedream(prompt, "seedream-4-5-251128", arkApiKey, aspectRatio);
            if (seedreamResult.ok && seedreamResult.imageUrl) {
              imageUrl = seedreamResult.imageUrl;
              console.log(`[generate-text-product] Seedream fallback succeeded for "${label}"`);
            } else {
              console.warn(`[generate-text-product] Seedream fallback failed:`, seedreamResult.error);
            }
          }
        }

        // Tier 3: Gemini Flash fallback
        if (imageUrl === null) {
          console.warn(`[generate-text-product] Primary + Seedream both failed — trying Flash fallback for "${label}"`);
          imageUrl = await generateImageGemini(prompt, "gemini-3.1-flash-image-preview", GEMINI_API_KEY, aspectRatio, referenceParts);
          if (imageUrl) console.log(`[generate-text-product] Flash fallback succeeded for "${label}"`);
        }

        if (imageUrl) {
          let finalUrl = imageUrl;
          // Upload base64 to storage
          if (imageUrl.startsWith("data:")) {
            try {
              const [_meta, base64Data] = imageUrl.split(",");
              const binaryString = atob(base64Data);
              const bytes = new Uint8Array(binaryString.length);
              for (let k = 0; k < binaryString.length; k++) {
                bytes[k] = binaryString.charCodeAt(k);
              }

              const fmt = detectImageFormat(bytes);
              const storagePath = `${userId || "anonymous"}/${jobId || crypto.randomUUID()}/${i}.${fmt.ext}`;

              const { error: uploadError } = await supabase.storage
                .from("workflow-previews")
                .upload(storagePath, bytes, {
                  contentType: fmt.contentType,
                  cacheControl: "3600",
                });

              if (!uploadError) {
                const { data: publicUrlData } = supabase.storage
                  .from("workflow-previews")
                  .getPublicUrl(storagePath);
                finalUrl = publicUrlData.publicUrl;
                console.log(`[generate-text-product] Uploaded to storage: ${storagePath}`);
              } else {
                console.error("[generate-text-product] Storage upload failed:", uploadError.message);
              }
            } catch (uploadErr) {
              console.error("[generate-text-product] Storage upload error:", uploadErr);
            }
          }

          images.push({ url: finalUrl, label, aspect_ratio: aspectRatio });
          console.log(`[generate-text-product] ✓ "${label}" generated (${images.length}/${totalToGenerate})`);

          // Write progress to queue
          if (jobId) {
            try {
              await supabase.from("generation_queue").update({
                result: {
                  generatedCount: images.length,
                  requestedCount: totalToGenerate,
                  currentLabel: label,
                  images: images.map((img) => img.url),
                },
                timeout_at: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
              }).eq("id", jobId);
            } catch (progressErr) {
              console.warn("[generate-text-product] Progress update failed:", progressErr);
            }
          }
        } else {
          errors.push(`"${label}" failed to generate`);
        }
      } catch (error: unknown) {
        if (typeof error === "object" && error !== null && "status" in error) {
          const statusError = error as { status: number; message: string };
          if (jobId && userId && creditsReserved) {
            await completeQueueJob(jobId, userId, creditsReserved, [], totalToGenerate, [statusError.message], body);
          }
          return new Response(
            JSON.stringify({ error: statusError.message }),
            { status: statusError.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        errors.push(`"${label}": ${error instanceof Error ? error.message : "Unknown error"}`);
      }

      // Delay between generations
      if (i < scenes.length - 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    const imageUrls = images.map((img) => img.url);

    // Queue self-completion
    if (jobId && userId && creditsReserved !== undefined) {
      await completeQueueJob(jobId, userId, creditsReserved, imageUrls, totalToGenerate, errors, body);
    }

    if (images.length === 0) {
      return new Response(
        JSON.stringify({ error: "Failed to generate any images", details: errors }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        images: imageUrls,
        variations: images.map((img) => ({ label: img.label, aspect_ratio: img.aspect_ratio })),
        generatedCount: images.length,
        requestedCount: totalToGenerate,
        partialSuccess: images.length < totalToGenerate,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[generate-text-product] Fatal error:", error);
    try {
      const body = await req.clone().json().catch(() => ({}));
      if (body.job_id && body.user_id && body.credits_reserved) {
        await completeQueueJob(body.job_id, body.user_id, body.credits_reserved, [], 1, [error instanceof Error ? error.message : "Unknown error"], body);
      }
    } catch { /* best effort */ }
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
