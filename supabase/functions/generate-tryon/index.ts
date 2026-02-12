import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface TryOnRequest {
  product: {
    title: string;
    description: string;
    productType: string;
    imageUrl: string;
  };
  model: {
    name: string;
    gender: string;
    ethnicity: string;
    bodyType: string;
    ageRange: string;
    imageUrl: string;
  };
  pose: {
    name: string;
    description: string;
    category: string;
  };
  aspectRatio: "1:1" | "4:5" | "9:16" | "16:9";
  imageCount: number;
}

function buildPrompt(req: TryOnRequest): string {
  const backgroundMap: Record<string, string> = {
    studio: "clean white or light gray professional studio backdrop",
    lifestyle: "natural outdoor or modern interior setting with soft ambient lighting",
    editorial: "dramatic minimalist backdrop with artistic lighting and geometric shadows",
    streetwear: "urban street environment with concrete, graffiti art, or industrial elements",
  };
  const background = backgroundMap[req.pose.category] || backgroundMap.studio;

  const ageDescMap: Record<string, string> = {
    "young-adult": "early 20s",
    adult: "late 20s to mid 30s",
    mature: "40s to 50s",
  };
  const ageDesc = ageDescMap[req.model.ageRange] || "adult";

  return `Create a professional fashion photograph combining the person from [MODEL IMAGE] wearing the clothing item from [PRODUCT IMAGE].

CRITICAL REQUIREMENTS:
1. The person MUST look exactly like the model in [MODEL IMAGE]:
   - Keep the EXACT same face, facial features, skin tone, and hair
   - Maintain their body type and proportions (${req.model.bodyType} build)
   - This is ${req.model.name}, a ${req.model.gender} ${req.model.ethnicity} model in their ${ageDesc}

2. The clothing MUST look exactly like the garment in [PRODUCT IMAGE]:
   - Preserve 100% accurate colors, patterns, logos, and textures
   - Show natural fabric draping on the model's body
   - Product: ${req.product.title}
   - Details: ${req.product.description || req.product.productType}

3. Photography style:
   - Pose: ${req.pose.name} - ${req.pose.description}
   - Background: ${background}
   - Lighting: Professional studio lighting with soft key light and rim light for depth
   - Camera: Shot on Canon EOS R5, 85mm f/1.4 lens, fashion editorial quality

4. Quality requirements:
   - Photorealistic skin with natural texture
   - Perfect anatomy with natural hands
   - No AI artifacts or distortions
   - Ultra high resolution

Remember: The final image must show THE EXACT PERSON from [MODEL IMAGE] wearing THE EXACT GARMENT from [PRODUCT IMAGE].`;
}

const negativePrompt =
  "blurry, low quality, distorted, deformed hands, extra fingers, missing fingers, bad anatomy, unnatural pose, stiff pose, mannequin, cartoon, illustration, anime, 3d render, text, watermark, logo overlay, signature, flat lay, product only without model, floating clothes, wrinkled messy clothes, wrong colors, pattern distortion";

function getUserIdFromJwt(authHeader: string | null): string | null {
  if (!authHeader) return null;
  try {
    const token = authHeader.replace("Bearer ", "");
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

async function uploadBase64ToStorage(
  base64Url: string,
  userId: string,
  supabaseUrl: string,
  serviceRoleKey: string
): Promise<string> {
  // Extract raw base64 data
  const base64Data = base64Url.includes(",")
    ? base64Url.split(",")[1]
    : base64Url;

  // Decode to binary
  const binaryStr = atob(base64Data);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  const fileName = `${userId}/${crypto.randomUUID()}.png`;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabase.storage
    .from("tryon-images")
    .upload(fileName, bytes, {
      contentType: "image/png",
      upsert: false,
    });

  if (error) {
    console.error("Storage upload failed:", error);
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from("tryon-images")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

async function generateImage(
  prompt: string,
  productImageUrl: string,
  modelImageUrl: string,
  apiKey: string
): Promise<string | null> {
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `${prompt}\n\nNegative prompt (avoid these): ${negativePrompt}`,
                  },
                  { type: "image_url", image_url: { url: productImageUrl } },
                  { type: "image_url", image_url: { url: modelImageUrl } },
                ],
              },
            ],
            modalities: ["image", "text"],
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) throw { status: 429, message: "Rate limit exceeded" };
        if (response.status === 402) throw { status: 402, message: "Payment required - please add credits" };
        const errorText = await response.text();
        console.error(`AI Gateway error (attempt ${attempt + 1}):`, response.status, errorText);
        if (attempt < maxRetries) { await new Promise((r) => setTimeout(r, 1000 * (attempt + 1))); continue; }
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!imageUrl) {
        console.error("No image in response:", JSON.stringify(data).slice(0, 500));
        if (attempt < maxRetries) { await new Promise((r) => setTimeout(r, 1000)); continue; }
        return null;
      }

      return imageUrl;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "status" in error) throw error;
      console.error(`Generation attempt ${attempt + 1} failed:`, error);
      if (attempt < maxRetries) { await new Promise((r) => setTimeout(r, 1000 * (attempt + 1))); continue; }
      throw error;
    }
  }

  return null;
}

/** Helper: update generation_queue and handle credits when called from the queue */
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

  const generatedCount = images.length;

  if (generatedCount === 0) {
    await supabase.from("generation_queue").update({
      status: "failed",
      error_message: errors.join("; ") || "Failed to generate any images",
      completed_at: new Date().toISOString(),
    }).eq("id", jobId);
    await supabase.rpc("refund_credits", { p_user_id: userId, p_amount: creditsReserved });
    console.log(`[generate-tryon] Refunded ${creditsReserved} credits for failed job ${jobId}`);
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
    brand_profile_id: payload.brand_profile_id || null,
    ratio: payload.aspectRatio || "1:1",
    quality: payload.quality || "standard",
    requested_count: requestedCount,
    credits_used: creditsReserved,
    creative_drop_id: payload.creative_drop_id || null,
    prompt_final: payload.prompt || null,
  });

  if (generatedCount < requestedCount) {
    const perImageCost = Math.floor(creditsReserved / requestedCount);
    const refundAmount = perImageCost * (requestedCount - generatedCount);
    if (refundAmount > 0) {
      await supabase.rpc("refund_credits", { p_user_id: userId, p_amount: refundAmount });
      console.log(`[generate-tryon] Partial: refunded ${refundAmount} credits for job ${jobId}`);
    }
  }

  console.log(`[generate-tryon] ✓ Queue job ${jobId} completed (${generatedCount} images)`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const isQueueInternal = req.headers.get("x-queue-internal") === "true";

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Storage not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: TryOnRequest & { user_id?: string; job_id?: string; credits_reserved?: number } = await req.json();

    let userId: string | null;
    if (isQueueInternal && body.user_id) {
      userId = body.user_id;
    } else {
      userId = getUserIdFromJwt(req.headers.get("authorization"));
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.product || !body.model || !body.pose) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: product, model, or pose" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = buildPrompt(body);
    console.log("Generating with prompt:", prompt.slice(0, 200) + "...");

    const imageCount = Math.min(body.imageCount || 4, 8);
    const images: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < imageCount; i++) {
      try {
        const variationPrompt =
          i === 0
            ? prompt
            : `${prompt}\n\nVariation ${i + 1}: Slightly different angle and lighting while maintaining the same high quality.`;

        const base64Url = await generateImage(variationPrompt, body.product.imageUrl, body.model.imageUrl, LOVABLE_API_KEY);

        if (base64Url) {
          const publicUrl = await uploadBase64ToStorage(base64Url, userId, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
          images.push(publicUrl);
          console.log(`Generated and uploaded image ${i + 1}/${imageCount}`);
        } else {
          errors.push(`Image ${i + 1} failed to generate`);
        }
      } catch (error: unknown) {
        if (typeof error === "object" && error !== null && "status" in error) {
          const statusError = error as { status: number; message: string };
          if (isQueueInternal && body.job_id) {
            await completeQueueJob(body.job_id, body.user_id!, body.credits_reserved!, [], imageCount, [statusError.message], body as unknown as Record<string, unknown>);
          }
          return new Response(
            JSON.stringify({ error: statusError.message }),
            { status: statusError.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        errors.push(`Image ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }

      if (i < imageCount - 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    // Queue self-completion
    if (isQueueInternal && body.job_id) {
      await completeQueueJob(body.job_id, body.user_id!, body.credits_reserved!, images, imageCount, errors, body as unknown as Record<string, unknown>);
    }

    if (images.length === 0) {
      return new Response(
        JSON.stringify({ error: "Failed to generate any images", details: errors }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        images,
        generatedCount: images.length,
        requestedCount: imageCount,
        partialSuccess: images.length < imageCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    try {
      const body = await req.clone().json().catch(() => ({}));
      if (isQueueInternal && body.job_id) {
        await completeQueueJob(body.job_id, body.user_id, body.credits_reserved, [], 1, [error instanceof Error ? error.message : "Unknown error"], body);
      }
    } catch { /* best effort */ }
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
