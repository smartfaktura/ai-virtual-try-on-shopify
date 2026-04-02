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

// ── Seedream aspect ratio mapping ────────────────────────────────────────
function seedreamAspectRatio(appRatio: string): string {
  const map: Record<string, string> = {
    "1:1": "1:1", "9:16": "9:16", "16:9": "16:9",
    "4:3": "4:3", "3:4": "3:4", "4:5": "4:5",
    "5:4": "5:4", "3:2": "3:2", "2:3": "2:3",
  };
  return map[appRatio] || "1:1";
}

const SEEDREAM_MODERATION_CODES = [1301, 1302, 1303, 1304, 1305, 1024];

// ── Seedream generation with retry ───────────────────────────────────────
async function generateImageSeedream(
  prompt: string,
  imageUrls: string[],
  model: string,
  apiKey: string,
  aspectRatio = "1:1",
  maxRetries = 1,
): Promise<{ ok: boolean; imageUrl?: string; error?: string }> {
  const ARK_BASE = "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations";
  const seedreamRatio = seedreamAspectRatio(aspectRatio);
  const timeoutMs = 90_000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const body: Record<string, unknown> = {
        model, prompt, size: "4K",
        aspect_ratio: seedreamRatio,
        response_format: "url",
        watermark: false,
        guidance_scale: 8.5,
        sequential_image_generation: "disabled",
        ...(seed !== undefined && { seed }),
      };
      if (imageUrls.length === 1) {
        body.image = imageUrls[0];
      } else if (imageUrls.length > 1) {
        body.image = imageUrls;
      }

      const response = await fetch(ARK_BASE, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!response.ok) {
        let errorText = "";
        try { errorText = await response.text(); } catch (_) { /* ignore */ }

        // Check moderation
        try {
          const errJson = JSON.parse(errorText);
          const errCode = errJson?.error?.code || errJson?.code;
          if (errCode && SEEDREAM_MODERATION_CODES.includes(Number(errCode))) {
            return { ok: false, error: `Content moderated: ${errJson?.error?.message || errJson?.message}` };
          }
        } catch (_) { /* not JSON */ }

        // Transient errors: retry
        const isTransient = response.status === 429 || response.status === 502 || response.status === 503;
        if (isTransient && attempt < maxRetries) {
          console.warn(`[generate-catalog] Seedream transient ${response.status}, retrying in 3s...`);
          await new Promise(r => setTimeout(r, 3000));
          continue;
        }
        return { ok: false, error: `ARK API error ${response.status}: ${errorText.slice(0, 200)}` };
      }

      const data = await response.json();
      const respCode = data?.error?.code || data?.code;
      if (respCode && SEEDREAM_MODERATION_CODES.includes(Number(respCode))) {
        return { ok: false, error: `Content moderated: ${data?.error?.message || data?.message}` };
      }

      const imageUrl = data?.data?.[0]?.url;
      if (!imageUrl) {
        return { ok: false, error: "No URL in Seedream response" };
      }
      return { ok: true, imageUrl };
    } catch (error: unknown) {
      const isTimeout = error instanceof DOMException && error.name === "TimeoutError";
      if (!isTimeout && attempt < maxRetries) {
        console.warn(`[generate-catalog] Seedream error, retrying in 3s...`, error);
        await new Promise(r => setTimeout(r, 3000));
        continue;
      }
      return { ok: false, error: isTimeout ? "Seedream request timed out (90s)" : (error instanceof Error ? error.message : "Unknown error") };
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
  const model = p.model;
  if (!model?.gender) {
    // Product-only mode
    return `A professional e-commerce catalog photograph of ${p.product.title || "the product"} shown in [PRODUCT IMAGE].
${p.pose?.instruction ? `\nSHOT: ${p.pose.instruction}` : ""}
${p.background?.instruction ? `\nENVIRONMENT: ${p.background.instruction}` : ""}

STYLE: Clean e-commerce catalog photography. Even, professional studio lighting. Sharp focus on the product. Ultra high resolution, 8K detail.

CONSTRAINTS:
- Preserve all colors, textures, patterns, labels, and branding with 100% fidelity.
- No text overlays, watermarks, or logos added to the image.`;
  }

  const ageDescMap: Record<string, string> = {
    "young-adult": "early 20s",
    adult: "late 20s to mid 30s",
    mature: "40s to 50s",
  };
  const ageDesc = ageDescMap[model.ageRange || "adult"] || "adult";

  return `A professional e-commerce catalog photograph of a ${model.gender} model, ${model.ethnicity}, ${ageDesc}, ${model.bodyType} build.

The model is wearing the EXACT ${p.product.productType || "product"} shown in [PRODUCT IMAGE] — preserve all colors, textures, patterns, labels, and branding with 100% fidelity.${p.product.description ? ` Product: ${p.product.description}.` : ""}

POSE: ${p.pose?.instruction || "Natural standing pose, looking at camera"}

ENVIRONMENT: ${p.background?.instruction || "Clean studio background, soft neutral lighting"}

STYLE: Clean e-commerce catalog photography. Even, professional studio lighting. Sharp focus on the product. Ultra high resolution, 8K detail.

CONSTRAINTS:
- Do NOT change the product's appearance, colors, or branding from [PRODUCT IMAGE].
- Do NOT alter the model's facial features or skin tone from [MODEL IMAGE].
- Maintain realistic fabric draping and body proportions.
- No text overlays, watermarks, or logos added to the image.`;
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

    const arkApiKey = Deno.env.get("BYTEPLUS_ARK_API_KEY");
    if (!arkApiKey) {
      const errMsg = "BYTEPLUS_ARK_API_KEY not configured";
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
    console.log(`[generate-catalog] Generating: product="${body.product.title}", ${logModel}, shot="${body.shot_id || body.pose?.name || 'default'}", ratio=${aspectRatio}`);

    // Build reference images with shot-type-aware ordering
    const isProductOnly = body.render_path === 'product_only_generate' || body.shot_group === 'product-only';
    const modelIdentityUrl = body.model?.identityImageUrl || body.model?.imageUrl;

    const referenceImages: string[] = [];
    if (isProductOnly) {
      // Product-only shots: only product reference, no model contamination
      referenceImages.push(body.product.imageUrl);
      if (body.anchor_image_url) referenceImages.push(body.anchor_image_url);
    } else {
      // On-model shots: identity image FIRST for stronger face locking
      if (modelIdentityUrl) referenceImages.push(modelIdentityUrl);
      referenceImages.push(body.product.imageUrl);
      if (body.anchor_image_url) referenceImages.push(body.anchor_image_url);
    }

    const seedreamResult = await generateImageSeedream(
      prompt,
      referenceImages,
      "seedream-4-5-251128",
      arkApiKey,
      aspectRatio,
      1, // 1 retry for transient errors
    );

    if (!seedreamResult.ok || !seedreamResult.imageUrl) {
      const errMsg = seedreamResult.error || "Seedream generation failed";
      console.error(`[generate-catalog] Generation failed: ${errMsg}`);
      if (isQueueInternal && body.job_id) {
        await completeQueueJob(body.job_id, body.user_id!, body.credits_reserved!, [], 1, [errMsg], body as unknown as Record<string, unknown>);
      }
      return new Response(JSON.stringify({ error: errMsg }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download the Seedream URL and upload to our storage
    let finalUrl = seedreamResult.imageUrl;
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

      const imgResp = await fetch(seedreamResult.imageUrl);
      if (imgResp.ok) {
        const imgBytes = new Uint8Array(await imgResp.arrayBuffer());
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
          console.error("[generate-catalog] Storage upload failed, using Seedream URL:", uploadError.message);
        }
      }
    } catch (uploadErr) {
      console.error("[generate-catalog] Storage upload error:", uploadErr);
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
