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

// ── Native Gemini helpers ────────────────────────────────────────────────
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODEL = "gemini-3.1-flash-image-preview";

async function fetchImageAsBase64(url: string): Promise<{ mimeType: string; data: string } | null> {
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 15_000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(tid);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    const { contentType } = detectImageFormat(bytes);
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const b64 = btoa(binary);
    return { mimeType: contentType, data: b64 };
  } catch (e) {
    console.warn("[generate-catalog] fetchImageAsBase64 failed:", (e as Error).message);
    return null;
  }
}

function isContentBlocked(data: Record<string, unknown>): boolean {
  const candidates = data.candidates as Array<Record<string, unknown>> | undefined;
  if (!candidates?.length) {
    const blockReason = (data.promptFeedback as Record<string, unknown>)?.blockReason;
    return !!blockReason;
  }
  return candidates[0]?.finishReason === "SAFETY" || candidates[0]?.finishReason === "RECITATION";
}

function extractBlockReason(data: Record<string, unknown>): string {
  const pfb = (data.promptFeedback as Record<string, unknown>)?.blockReason;
  if (pfb) return `Blocked by safety filter: ${pfb}`;
  const candidates = data.candidates as Array<Record<string, unknown>> | undefined;
  if (candidates?.[0]?.finishReason) return `Blocked: ${candidates[0].finishReason}`;
  return "Content blocked by safety filter";
}

function extractImageFromGeminiResponse(data: Record<string, unknown>): string | null {
  const candidates = data.candidates as Array<Record<string, unknown>> | undefined;
  if (!candidates?.length) return null;
  const parts = (candidates[0]?.content as Record<string, unknown>)?.parts as Array<Record<string, unknown>> | undefined;
  if (!parts) return null;
  for (const part of parts) {
    const inline = part.inlineData as { mimeType: string; data: string } | undefined;
    if (inline?.data) return `data:${inline.mimeType};base64,${inline.data}`;
  }
  return null;
}

async function generateImageNative(
  prompt: string,
  referenceImageUrls: string[],
  apiKey: string,
  aspectRatio: string,
  maxRetries = 1,
): Promise<{ ok: boolean; imageBase64?: string; error?: string }> {
  const timeoutMs = 100_000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Convert reference URLs to inlineData parts
      const imageParts: Array<Record<string, unknown>> = [];
      for (const url of referenceImageUrls) {
        const img = await fetchImageAsBase64(url);
        if (img) {
          imageParts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
        } else {
          console.warn(`[generate-catalog] Skipping unreachable ref image: ${url.slice(0, 80)}`);
        }
      }

      const response = await fetch(
        `${GEMINI_BASE}/models/${GEMINI_MODEL}:generateContent`,
        {
          method: "POST",
          headers: {
            "x-goog-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [...imageParts, { text: prompt }] }],
            generationConfig: {
              responseModalities: ["IMAGE", "TEXT"],
              temperature: 1.0,
              
              imageConfig: {
                imageSize: "2K",
                aspectRatio,
              },
            },
          }),
          signal: AbortSignal.timeout(timeoutMs),
        },
      );

      if (!response.ok) {
        let errorText = "";
        try { errorText = await response.text(); } catch (_) { /* ignore */ }

        if (response.status === 429) {
          if (attempt < maxRetries) {
            console.warn(`[generate-catalog] Native Gemini rate limited, retrying in 5s...`);
            await new Promise(r => setTimeout(r, 5000));
            continue;
          }
          return { ok: false, error: "Rate limited by AI, please try again later" };
        }

        const isTransient = response.status === 500 || response.status === 502 || response.status === 503;
        if (isTransient && attempt < maxRetries) {
          console.warn(`[generate-catalog] Native Gemini transient ${response.status}, retrying in 3s...`);
          await new Promise(r => setTimeout(r, 3000));
          continue;
        }
        return { ok: false, error: `Gemini API error ${response.status}: ${errorText.slice(0, 300)}` };
      }

      const data = await response.json();

      if (isContentBlocked(data)) {
        const reason = extractBlockReason(data);
        console.warn(`[generate-catalog] Content blocked: ${reason}`);
        return { ok: false, error: reason };
      }

      const imageDataUrl = extractImageFromGeminiResponse(data);
      if (!imageDataUrl) {
        console.error("[generate-catalog] No image in Gemini response:", JSON.stringify(data).slice(0, 500));
        if (attempt < maxRetries) {
          console.warn("[generate-catalog] Retrying after empty image response...");
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        return { ok: false, error: "No image generated by AI model" };
      }

      return { ok: true, imageBase64: imageDataUrl };
    } catch (error: unknown) {
      const isTimeout = error instanceof DOMException && error.name === "TimeoutError";
      if (!isTimeout && attempt < maxRetries) {
        console.warn(`[generate-catalog] Native Gemini error, retrying in 3s...`, error);
        await new Promise(r => setTimeout(r, 3000));
        continue;
      }
      return { ok: false, error: isTimeout ? "AI generation timed out (100s)" : (error instanceof Error ? error.message : "Unknown error") };
    }
  }
  return { ok: false, error: "Max retries exceeded" };
}

// ── Build catalog prompt from structured spec (legacy fallback) ──────────
interface CatalogPayload {
  product: {
    title: string;
    description?: string;
    productType?: string;
    imageUrl: string;
  };
  model?: {
    name?: string;
    gender?: string;
    ethnicity?: string;
    bodyType?: string;
    ageRange?: string;
    imageUrl?: string;
    /** High-res identity source image for face replication */
    identityImageUrl?: string;
  } | null;
  pose?: {
    name?: string;
    instruction?: string;
  };
  background?: {
    label?: string;
    instruction?: string;
  };
  aspectRatio?: string;
  batch_id?: string;
  prompt_final?: string;
  catalog_mode?: boolean;
  render_path?: string;
  shot_id?: string;
  shot_group?: 'on-model' | 'product-only';
  anchor_image_url?: string;
  // Queue metadata
  user_id?: string;
  job_id?: string;
  credits_reserved?: number;
  workflow_id?: string;
  product_id?: string;
  product_name?: string;
  product_image_url?: string;
  imageCount?: number;
  quality?: string;
}

function buildCatalogPrompt(p: CatalogPayload): string {
  const aspectRatio = p.aspectRatio || "4:5";
  const model = p.model;

  if (!model?.gender) {
    // Product-only mode
    return `Generate a professional e-commerce catalog photograph of ${p.product.title || "the product"} shown in the reference image.
${p.pose?.instruction ? `\nSHOT: ${p.pose.instruction}` : ""}
${p.background?.instruction ? `\nENVIRONMENT: ${p.background.instruction}` : ""}

STYLE: Clean e-commerce catalog photography. Even, professional studio lighting. Sharp focus on the product. Ultra high resolution, 8K detail.

OUTPUT ASPECT RATIO: ${aspectRatio}.

CONSTRAINTS:
- Reproduce the product EXACTLY as shown in the reference image — preserve all colors, textures, patterns, labels, and branding with 100% fidelity.
- No text overlays, watermarks, or logos added to the image.
- Do NOT hallucinate or invent product details not visible in the reference.`;
  }

  const ageDescMap: Record<string, string> = {
    "young-adult": "early 20s",
    adult: "late 20s to mid 30s",
    mature: "40s to 50s",
  };
  const ageDesc = ageDescMap[model.ageRange || "adult"] || "adult";

  return `Generate a professional e-commerce catalog photograph of a ${model.gender} model, ${model.ethnicity}, ${ageDesc}, ${model.bodyType} build.

The model is wearing the EXACT ${p.product.productType || "product"} shown in the product reference image — preserve all colors, textures, patterns, labels, and branding with 100% fidelity.${p.product.description ? ` Product: ${p.product.description}.` : ""}

POSE: ${p.pose?.instruction || "Natural standing pose, looking at camera"}

ENVIRONMENT: ${p.background?.instruction || "Clean studio background, soft neutral lighting"}

STYLE: Clean e-commerce catalog photography. Even, professional studio lighting. Sharp focus on the product. Ultra high resolution, 8K detail.

OUTPUT ASPECT RATIO: ${aspectRatio}.

CONSTRAINTS:
- Reproduce the product EXACTLY as shown in the product reference image. Do NOT change colors, patterns, or branding.
- If a model reference image is provided, preserve that person's exact facial features, skin tone, and appearance. Do NOT generate a different face.
- Maintain realistic fabric draping and body proportions.
- No text overlays, watermarks, or logos added to the image.
- Do NOT hallucinate details. Only reproduce what is visible in the references.
- NEVER blend or merge faces from multiple reference images. Use ONLY ONE face identity.`;
}

// ── Complete queue job helper ────────────────────────────────────────────
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
    console.log(`[generate-catalog] Job ${jobId} was cancelled — skipping completion`);
    return;
  }

  const generatedCount = images.length;

  if (generatedCount === 0) {
    await supabase.from("generation_queue").update({
      status: "failed",
      error_message: errors.join("; ") || "Failed to generate catalog image",
      completed_at: new Date().toISOString(),
    }).eq("id", jobId);
    await supabase.rpc("refund_credits", { p_user_id: userId, p_amount: creditsReserved });
    console.log(`[generate-catalog] Refunded ${creditsReserved} credits for failed job ${jobId}`);

    try {
      const { data: profile } = await supabase.from("profiles").select("email, display_name, settings").eq("user_id", userId).single();
      const settings = (profile?.settings as Record<string, unknown>) || {};
      if (profile?.email && settings.emailOnFailed !== false) {
        fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: { Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "generation_failed",
            to: profile.email,
            data: {
              jobType: "catalog",
              errorMessage: errors.join("; "),
              displayName: profile.display_name,
              workflowName: "Catalog Studio",
              productName: (payload.product_name as string) || undefined,
            },
          }),
        }).catch((e) => console.warn("[generate-catalog] Failed email send failed:", (e as Error).message));
      }
    } catch (e) { console.warn("[generate-catalog] Failed email lookup failed:", e); }
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
    product_id: payload.product_id || null,
    workflow_id: payload.workflow_id || null,
    ratio: (payload.aspectRatio as string) || "4:5",
    quality: "standard",
    requested_count: requestedCount,
    credits_used: creditsReserved,
    scene_name: (payload.pose as Record<string, unknown>)?.name || (payload.shot_id as string) || null,
    scene_id: ((payload.pose as Record<string, unknown>)?.id as string) ?? (payload.shot_id as string) ?? null,
    model_name: (payload.model as Record<string, unknown>)?.name || null,
    model_image_url: (payload.model as Record<string, unknown>)?.originalImageUrl || null,
    workflow_slug: "catalog-studio",
    product_name: payload.product_name || (payload.product as Record<string, unknown>)?.title || null,
    product_image_url: (payload.product_image_url as string) || null,
  });

  console.log(`[generate-catalog] ✓ Queue job ${jobId} completed (${generatedCount} images)`);
}

// ── Main handler ─────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const isQueueInternal = req.headers.get("x-queue-internal") === "true";
  let body: CatalogPayload = {} as CatalogPayload;

  try {
    body = await req.json();

    // Validate: product.imageUrl is always required; model is optional for product-only mode
    if (!body.product?.imageUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required field: product.imageUrl" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Auth: verify JWT for non-queue calls
    if (!isQueueInternal) {
      const authHeader = req.headers.get("authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: authError } = await supabase.auth.getUser(token);
      if (authError || !userData?.user) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      const errMsg = "GEMINI_API_KEY not configured";
      if (isQueueInternal && body.job_id) {
        await completeQueueJob(body.job_id, body.user_id!, body.credits_reserved!, [], 1, [errMsg], body as unknown as Record<string, unknown>);
      }
      return new Response(JSON.stringify({ error: errMsg }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aspectRatio = body.aspectRatio || "4:5";

    // Use prompt_final from catalog engine if present; fall back to legacy buildCatalogPrompt
    const prompt = body.prompt_final || buildCatalogPrompt(body);

    const hasModel = !!(body.model?.imageUrl || body.model?.identityImageUrl);
    const logModel = hasModel ? `model="${body.model?.name}"` : "product-only";
    const logAnchor = body.anchor_image_url ? 'has_anchor' : 'no_anchor';
    const logRenderPath = body.render_path || 'unknown';
    const logShotGroup = body.shot_group || 'unknown';
    console.log(`[generate-catalog] Generating: product="${body.product.title}", ${logModel}, shot="${body.shot_id || 'default'}", render=${logRenderPath}, group=${logShotGroup}, anchor=${logAnchor}, ratio=${aspectRatio}`);

    // Build reference images with shot-type-aware ordering
    const isProductOnly = body.render_path === 'product_only_generate' || body.shot_group === 'product-only';
    const isAnchorShot = body.shot_id === 'identity_anchor';
    const modelIdentityUrl = body.model?.identityImageUrl || body.model?.imageUrl;

    const referenceImages: string[] = [];
    if (isProductOnly) {
      // ── HARD ISOLATION: Product-only shots get ONLY the product image ──
      referenceImages.push(body.product.imageUrl);
    } else if (isAnchorShot) {
      // ── FACELESS ANCHOR: product image ONLY — no model face ──
      referenceImages.push(body.product.imageUrl);
    } else if (body.anchor_image_url) {
      // ── DERIVATIVE ON-MODEL: DUAL-REFERENCE (anchor outfit + identity backup) ──
      const TEXTURE_ONLY_SHOTS = ['detail_closeup', 'zoom_detail', 'hands_detail'];
      if (TEXTURE_ONLY_SHOTS.includes(body.shot_id || '')) {
        // Texture/detail shots: product image only, no face needed
        referenceImages.push(body.product.imageUrl);
      } else if (modelIdentityUrl) {
        referenceImages.push(body.anchor_image_url);  // Image 1: anchor (correct outfit + model)
        referenceImages.push(modelIdentityUrl);         // Image 2: identity backup for face
      } else {
        // NO FALLBACK: fail fast to protect face consistency
        console.error(`[generate-catalog] FACE GUARD: derivative on-model shot "${body.shot_id}" has anchor but NO model identity URL — failing`);
        const errMsg = "Model identity image missing — derivative skipped to protect face consistency";
        if (isQueueInternal && body.job_id) {
          await completeQueueJob(body.job_id, body.user_id!, body.credits_reserved!, [], 1, [errMsg], body as unknown as Record<string, unknown>);
        }
        return new Response(JSON.stringify({ error: errMsg }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (modelIdentityUrl && !isProductOnly) {
      // On-model shot WITHOUT anchor — FAIL FAST
      console.error(`[generate-catalog] FACE GUARD: on-model shot "${body.shot_id}" has no anchor_image_url — failing`);
      const errMsg = "Anchor image missing — derivative skipped to protect face consistency";
      if (isQueueInternal && body.job_id) {
        await completeQueueJob(body.job_id, body.user_id!, body.credits_reserved!, [], 1, [errMsg], body as unknown as Record<string, unknown>);
      }
      return new Response(JSON.stringify({ error: errMsg }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      // Product-only fallback (no model involved)
      referenceImages.push(body.product.imageUrl);
    }

    // ── Log actual reference state for debugging ──
    const refMode = isProductOnly ? 'product-only' : isAnchorShot ? 'anchor-faceless' : body.anchor_image_url ? 'derivative-dual-ref' : 'fallback';
    console.log(`[generate-catalog] REF_STATE: shot="${body.shot_id}", mode=${refMode}, refs=${referenceImages.length}, hasModelIdentity=${!!modelIdentityUrl}, hasAnchor=${!!body.anchor_image_url}`);

    // ── Generate with Native Gemini API (2K quality) ──
    const result = await generateImageNative(
      prompt,
      referenceImages,
      geminiApiKey,
      aspectRatio,
      1,
    );

    if (!result.ok || !result.imageBase64) {
      const errMsg = result.error || "AI generation failed";
      console.error(`[generate-catalog] Generation failed: ${errMsg}`);
      if (isQueueInternal && body.job_id) {
        await completeQueueJob(body.job_id, body.user_id!, body.credits_reserved!, [], 1, [errMsg], body as unknown as Record<string, unknown>);
      }
      return new Response(JSON.stringify({ error: errMsg }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Decode base64 and upload to storage ──
    let finalUrl = "";
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

      // Strip data URI prefix if present
      const base64Data = result.imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const imgBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      const fmt = detectImageFormat(imgBytes);
      const userId = body.user_id || "anonymous";
      const jobId = body.job_id || crypto.randomUUID();
      const storagePath = `${userId}/${jobId}/catalog-0.${fmt.ext}`;

      const { error: uploadError } = await supabase.storage
        .from("catalog-previews")
        .upload(storagePath, imgBytes, {
          contentType: fmt.contentType,
          cacheControl: "3600",
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("catalog-previews")
          .getPublicUrl(storagePath);
        finalUrl = publicUrlData.publicUrl;
        console.log(`[generate-catalog] Uploaded to storage: ${storagePath}`);
      } else {
        console.error("[generate-catalog] Storage upload failed:", uploadError.message);
        // Use inline base64 as last resort (not ideal for large images)
        finalUrl = result.imageBase64;
      }
    } catch (uploadErr) {
      console.error("[generate-catalog] Storage upload error:", uploadErr);
      finalUrl = result.imageBase64;
    }

    const images = [finalUrl];

    if (isQueueInternal && body.job_id) {
      await completeQueueJob(body.job_id, body.user_id!, body.credits_reserved!, images, 1, [], body as unknown as Record<string, unknown>);
    }

    console.log(`[generate-catalog] ✓ Catalog image generated for "${body.product.title}"`);

    return new Response(
      JSON.stringify({
        images,
        generatedCount: 1,
        requestedCount: 1,
        workflow_name: "Catalog Studio",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[generate-catalog] Fatal error:", error);
    if (isQueueInternal && body.job_id) {
      try {
        await completeQueueJob(body.job_id, body.user_id!, body.credits_reserved!, [], 1, [error instanceof Error ? error.message : "Unknown error"], body as unknown as Record<string, unknown>);
      } catch { /* best effort */ }
    }
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
