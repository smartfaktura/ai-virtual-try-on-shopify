import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Color Feel mapping
const COLOR_FEEL_DESCRIPTIONS: Record<string, string> = {
  'warm-earthy': 'warm earth tones, natural warmth, amber and terracotta accents',
  'cool-crisp': 'cool tones, clean whites, blue and silver undertones',
  'neutral-natural': 'true-to-life colors, balanced exposure, no heavy grading',
  'rich-saturated': 'deep saturated colors, bold and vivid palette, high color impact',
  'muted-soft': 'desaturated pastels, soft muted tones, dreamy and gentle palette',
  'vibrant-bold': 'high energy colors, bright and punchy, strong contrast',
};

const TONE_DESCRIPTIONS: Record<string, string> = {
  luxury: 'premium, sophisticated, elegant with refined details',
  clean: 'minimalist, uncluttered, modern and professional',
  bold: 'striking, high-contrast, attention-grabbing',
  minimal: 'extremely simple, lots of negative space, zen-like',
  playful: 'vibrant, energetic, fun with dynamic composition',
};

interface PromptBlueprint {
  sceneDescription: string;
  lighting: string;
  cameraStyle: string;
  backgroundRules: string;
  constraints: {
    do: string[];
    dont: string[];
  };
}

interface ProductRequest {
  product: {
    title: string;
    productType: string;
    description: string;
    imageUrl: string;
  };
  template: {
    name: string;
    promptBlueprint: PromptBlueprint;
    negativePrompt: string;
  };
  brandSettings: {
    tone: string;
    colorFeel?: string; // new Color Feel value
    brandKeywords?: string[];
    colorPalette?: string[];
    targetAudience?: string;
    // Legacy fields (still accepted for backward compat)
    backgroundStyle?: string;
    lightingStyle?: string;
    colorTemperature?: string;
    compositionBias?: string;
    preferredScenes?: string[];
    photographyReference?: string;
  };
  aspectRatio: "1:1" | "4:5" | "16:9";
  imageCount: number;
}

function buildPrompt(req: ProductRequest): string {
  const { product, template, brandSettings } = req;
  const { promptBlueprint } = template;

  const doConstraints = promptBlueprint.constraints.do.join(", ");
  const dontConstraints = promptBlueprint.constraints.dont.join(", ");

  const toneDesc = TONE_DESCRIPTIONS[brandSettings.tone] || TONE_DESCRIPTIONS.clean;

  // Build brand guidelines section
  const brandLines: string[] = [
    `   - Tone: ${toneDesc}`,
  ];

  // Color Feel (preferred) or legacy color temperature
  const colorFeel = brandSettings.colorFeel || brandSettings.colorTemperature;
  if (colorFeel) {
    const colorDesc = COLOR_FEEL_DESCRIPTIONS[colorFeel] || colorFeel;
    brandLines.push(`   - Color direction: ${colorDesc}`);
  }

  if (brandSettings.brandKeywords && brandSettings.brandKeywords.length > 0) {
    brandLines.push(`   - Brand DNA: ${brandSettings.brandKeywords.join(", ")}`);
  }
  if (brandSettings.colorPalette && brandSettings.colorPalette.length > 0) {
    brandLines.push(`   - Brand accent colors: ${brandSettings.colorPalette.join(", ")}`);
  }
  if (brandSettings.targetAudience) {
    brandLines.push(`   - Target audience: ${brandSettings.targetAudience}`);
  }

  const prompt = `Create a professional e-commerce product photograph featuring the EXACT product shown in [PRODUCT IMAGE].

CRITICAL REQUIREMENTS:
1. The product MUST look exactly like [PRODUCT IMAGE]:
   - Preserve 100% accurate packaging, labels, colors, and branding
   - Keep all text on packaging perfectly legible
   - Maintain exact shape, proportions, and materials
   - Product: ${product.title}
   - Type: ${product.productType}
   ${product.description ? `- Details: ${product.description}` : ""}

2. Photography Style - "${template.name}":
   - Scene: ${promptBlueprint.sceneDescription}
   - Lighting: ${promptBlueprint.lighting}
   - Camera: ${promptBlueprint.cameraStyle}
   - Background: ${promptBlueprint.backgroundRules}

3. Brand Guidelines:
${brandLines.join("\n")}

4. Composition Requirements:
   - DO: ${doConstraints}
   - DON'T: ${dontConstraints}

5. Technical Quality:
   - Ultra high resolution, sharp focus
   - Professional product photography quality
   - No AI artifacts or distortions
   - Perfect color accuracy

The final image must show THE EXACT PRODUCT from [PRODUCT IMAGE] in a new professional photography setting that matches the template style.`;

  return prompt;
}

async function generateImage(
  prompt: string,
  productImageUrl: string,
  negativePrompt: string,
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
                  {
                    type: "image_url",
                    image_url: {
                      url: productImageUrl,
                    },
                  },
                ],
              },
            ],
            modalities: ["image", "text"],
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw { status: 429, message: "Rate limit exceeded" };
        }
        if (response.status === 402) {
          throw { status: 402, message: "Payment required - please add credits" };
        }
        const errorText = await response.text();
        console.error(`AI Gateway error (attempt ${attempt + 1}):`, response.status, errorText);

        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!imageUrl) {
        console.error("No image in response:", JSON.stringify(data).slice(0, 500));
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        return null;
      }

      return imageUrl;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "status" in error) {
        throw error;
      }
      console.error(`Generation attempt ${attempt + 1} failed:`, error);
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }

  return null;
}

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
    // Total failure — mark failed, refund all credits
    await supabase.from("generation_queue").update({
      status: "failed",
      error_message: errors.join("; ") || "Failed to generate any images",
      completed_at: new Date().toISOString(),
    }).eq("id", jobId);
    await supabase.rpc("refund_credits", { p_user_id: userId, p_amount: creditsReserved });
    console.log(`[generate-product] Refunded ${creditsReserved} credits for failed job ${jobId}`);
    return;
  }

  const result = { images, generatedCount, requestedCount, errors: errors.length > 0 ? errors : undefined };

  // Mark completed
  await supabase.from("generation_queue").update({
    status: "completed",
    result,
    completed_at: new Date().toISOString(),
  }).eq("id", jobId);

  // Save to generation_jobs for library
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

  // Partial success — refund unused credits
  if (generatedCount < requestedCount) {
    const perImageCost = Math.floor(creditsReserved / requestedCount);
    const refundAmount = perImageCost * (requestedCount - generatedCount);
    if (refundAmount > 0) {
      await supabase.rpc("refund_credits", { p_user_id: userId, p_amount: refundAmount });
      console.log(`[generate-product] Partial: refunded ${refundAmount} credits for job ${jobId}`);
    }
  }

  console.log(`[generate-product] ✓ Queue job ${jobId} completed (${generatedCount} images)`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Detect queue-internal calls
  const isQueueInternal = req.headers.get("x-queue-internal") === "true";

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: ProductRequest & { user_id?: string; job_id?: string; credits_reserved?: number } = await req.json();

    if (!body.product || !body.template) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: product or template" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = buildPrompt(body);
    const negativePrompt = body.template.negativePrompt || "blurry, low quality, distorted, text overlay, watermark, wrong colors, wrong packaging";
    
    console.log("Generating product image with prompt:", prompt.slice(0, 200) + "...");
    console.log("Image count requested:", body.imageCount);

    const imageCount = Math.min(body.imageCount || 4, 8);
    const images: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < imageCount; i++) {
      try {
        const variationPrompt =
          i === 0
            ? prompt
            : `${prompt}\n\nVariation ${i + 1}: Slightly different angle and composition while maintaining the same high quality and exact product appearance.`;

        const imageUrl = await generateImage(
          variationPrompt,
          body.product.imageUrl,
          negativePrompt,
          LOVABLE_API_KEY
        );

        if (imageUrl) {
          images.push(imageUrl);
          console.log(`Generated image ${i + 1}/${imageCount}`);
        } else {
          errors.push(`Image ${i + 1} failed to generate`);
        }
      } catch (error: unknown) {
        if (typeof error === "object" && error !== null && "status" in error) {
          const statusError = error as { status: number; message: string };
          // For queue jobs, record failure instead of returning HTTP error
          if (isQueueInternal && body.job_id) {
            await completeQueueJob(body.job_id, body.user_id!, body.credits_reserved!, [], imageCount, [statusError.message], body as unknown as Record<string, unknown>);
            return new Response(JSON.stringify({ error: statusError.message }), {
              status: statusError.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
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

    // Queue self-completion: update generation_queue directly
    if (isQueueInternal && body.job_id) {
      await completeQueueJob(body.job_id, body.user_id!, body.credits_reserved!, images, imageCount, errors, body as unknown as Record<string, unknown>);
    }

    if (images.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Failed to generate any images",
          details: errors,
        }),
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
    // If queue job, try to mark as failed
    try {
      const body = await req.clone().json().catch(() => ({}));
      if (isQueueInternal && body.job_id) {
        await completeQueueJob(body.job_id, body.user_id, body.credits_reserved, [], 1, [error instanceof Error ? error.message : "Unknown error"], body);
      }
    } catch { /* best effort */ }
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
