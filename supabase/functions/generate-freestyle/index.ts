import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Color Feel mapping (matches brandPromptBuilder.ts)
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

interface BrandProfileContext {
  tone: string;
  colorFeel: string; // Color Feel value (e.g., 'warm-earthy')
  doNotRules: string[];
  brandKeywords?: string[];
  colorPalette?: string[];
  targetAudience?: string;
}

interface FreestyleRequest {
  prompt: string;
  sourceImage?: string;
  modelImage?: string;
  sceneImage?: string;
  aspectRatio: string;
  imageCount: number;
  quality: "standard" | "high";
  polishPrompt: boolean;
  modelContext?: string;
  stylePresets?: string[];
  brandProfile?: BrandProfileContext;
  negatives?: string[];
}

// ── Negative prompt (always appended when polish is on) ───────────────────
const NEGATIVE_PROMPT = `
CRITICAL — DO NOT include any of the following:
- No text, watermarks, logos, labels, or signatures anywhere in the image
- No distorted or extra fingers, hands, or limbs
- No blurry or out-of-focus areas unless intentionally bokeh
- No AI-looking skin smoothing or plastic textures
- No collage layouts or split-screen compositions`;

// ── Context-aware prompt polish ───────────────────────────────────────────
function polishUserPrompt(
  rawPrompt: string,
  context: { hasSource: boolean; hasModel: boolean; hasScene: boolean },
  brandProfile?: BrandProfileContext,
  userNegatives?: string[]
): string {
  const layers: string[] = [];

  layers.push(`Professional photography: ${rawPrompt}`);

  // Base quality layer (always)
  layers.push(
    "Ultra high resolution, sharp focus, natural lighting, commercial-grade color accuracy."
  );

  // Brand profile layer
  if (brandProfile) {
    const brandParts: string[] = [];
    if (brandProfile.tone) {
      const toneDesc = TONE_DESCRIPTIONS[brandProfile.tone] || brandProfile.tone;
      brandParts.push(`Visual tone: ${toneDesc}`);
    }
    if (brandProfile.colorFeel) {
      const colorDesc = COLOR_FEEL_DESCRIPTIONS[brandProfile.colorFeel] || brandProfile.colorFeel;
      brandParts.push(`Color direction: ${colorDesc}`);
    }
    if (brandProfile.brandKeywords && brandProfile.brandKeywords.length > 0) {
      brandParts.push(`Brand DNA keywords: ${brandProfile.brandKeywords.join(", ")}`);
    }
    if (brandProfile.colorPalette && brandProfile.colorPalette.length > 0) {
      brandParts.push(`Brand accent colors: ${brandProfile.colorPalette.join(", ")}`);
    }
    if (brandProfile.targetAudience) {
      brandParts.push(`Target audience: ${brandProfile.targetAudience}`);
    }
    if (brandParts.length > 0) {
      layers.push(`BRAND STYLE GUIDE:\n${brandParts.join(". ")}.`);
    }
  }

  // Product / source image layer
  if (context.hasSource) {
    layers.push(
      "PRODUCT ACCURACY: The product in the reference image must be reproduced with 100% fidelity — identical shape, color, texture, branding, and proportions. Do not modify, stylize, or reinterpret the product in any way."
    );
  }

  // Model / portrait layer
  if (context.hasModel) {
    layers.push(
      "PORTRAIT QUALITY: Natural and realistic skin texture, accurate body proportions, natural pose and expression. Studio-grade portrait retouching — no plastic or airbrushed look."
    );
  }

  // Scene / environment layer
  if (context.hasScene) {
    layers.push(
      "ENVIRONMENT: Match the lighting direction and color temperature of the scene reference. Integrate the subject naturally into the environment with consistent shadows and reflections."
    );
  }

  // Build combined negatives list
  const allNegatives: string[] = [];
  if (brandProfile?.doNotRules && brandProfile.doNotRules.length > 0) {
    allNegatives.push(...brandProfile.doNotRules);
  }
  if (userNegatives && userNegatives.length > 0) {
    allNegatives.push(...userNegatives);
  }

  // Build final negative prompt
  let negativeBlock = NEGATIVE_PROMPT;
  if (allNegatives.length > 0) {
    const dedupedNegatives = [...new Set(allNegatives.map(n => n.toLowerCase()))];
    negativeBlock += `\n- No ${dedupedNegatives.join("\n- No ")}`;
  }

  layers.push(negativeBlock);

  return layers.join("\n\n");
}

// ── AI image generation with retries ──────────────────────────────────────
async function generateImage(
  prompt: string,
  images: Array<{ type: "image_url"; image_url: { url: string } }>,
  apiKey: string,
  model: string
): Promise<string | null> {
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const content: Array<unknown> = [{ type: "text", text: prompt }];
      for (const img of images) {
        content.push(img);
      }

      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content }],
            modalities: ["image", "text"],
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw { status: 429, message: "Rate limit exceeded. Please wait and try again." };
        }
        if (response.status === 402) {
          throw { status: 402, message: "Credits exhausted. Please add more credits." };
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

// ── Request handler ───────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: FreestyleRequest = await req.json();

    if (!body.prompt || body.prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Append model text context if provided
    let enrichedPrompt = body.prompt;
    if (body.modelContext) {
      enrichedPrompt = `${enrichedPrompt}\n\nModel reference: ${body.modelContext}`;
    }

    // Append style presets if provided
    if (body.stylePresets && body.stylePresets.length > 0) {
      enrichedPrompt = `${enrichedPrompt}\n\nStyle direction: ${body.stylePresets.join(", ")}`;
    }

    // Apply polish if enabled
    const polishContext = {
      hasSource: !!body.sourceImage,
      hasModel: !!body.modelImage,
      hasScene: !!body.sceneImage,
    };

    let finalPrompt: string;
    if (body.polishPrompt) {
      finalPrompt = polishUserPrompt(enrichedPrompt, polishContext, body.brandProfile, body.negatives);
    } else {
      // Even without polish, apply brand context and negatives if provided
      let unpolished = enrichedPrompt;
      if (body.brandProfile) {
        const bp = body.brandProfile;
        const parts: string[] = [];
        if (bp.tone) parts.push(bp.tone);
        if (bp.colorFeel) {
          const colorDesc = COLOR_FEEL_DESCRIPTIONS[bp.colorFeel] || bp.colorFeel;
          parts.push(colorDesc);
        }
        if (parts.length > 0) unpolished += `\n\nBrand style: ${parts.join(", ")}`;
      }
      const allNeg: string[] = [
        ...(body.brandProfile?.doNotRules || []),
        ...(body.negatives || []),
      ];
      if (allNeg.length > 0) {
        const dedupedNeg = [...new Set(allNeg.map(n => n.toLowerCase()))];
        unpolished += `\n\nDo NOT include: ${dedupedNeg.join(", ")}`;
      }
      finalPrompt = unpolished;
    }

    // Build image references
    const imageRefs: Array<{ type: "image_url"; image_url: { url: string } }> = [];
    if (body.sourceImage) {
      imageRefs.push({ type: "image_url", image_url: { url: body.sourceImage } });
    }
    if (body.modelImage) {
      imageRefs.push({ type: "image_url", image_url: { url: body.modelImage } });
    }
    if (body.sceneImage) {
      imageRefs.push({ type: "image_url", image_url: { url: body.sceneImage } });
    }

    // Add aspect ratio instruction
    const aspectPrompt = `${finalPrompt}\n\nOutput aspect ratio: ${body.aspectRatio}`;

    // Select model based on quality
    const aiModel = body.quality === "high"
      ? "google/gemini-3-pro-image-preview"
      : "google/gemini-2.5-flash-image";

    console.log("Freestyle generation:", {
      promptLength: body.prompt.length,
      hasSourceImage: !!body.sourceImage,
      hasModelImage: !!body.modelImage,
      hasSceneImage: !!body.sceneImage,
      hasModelContext: !!body.modelContext,
      stylePresets: body.stylePresets,
      hasBrandProfile: !!body.brandProfile,
      brandTone: body.brandProfile?.tone,
      brandColorFeel: body.brandProfile?.colorFeel,
      negativesCount: body.negatives?.length || 0,
      aspectRatio: body.aspectRatio,
      imageCount: body.imageCount,
      quality: body.quality,
      model: aiModel,
      polished: body.polishPrompt,
    });

    const imageCount = Math.min(body.imageCount || 1, 4);
    const images: string[] = [];
    const errors: string[] = [];

    // Batch consistency instruction for multi-image requests
    const batchConsistency = imageCount > 1
      ? "\n\nBATCH CONSISTENCY: Maintain the same color palette, lighting direction, overall mood, and visual style. Only vary composition, angle, and framing."
      : "";

    for (let i = 0; i < imageCount; i++) {
      try {
        const variationPrompt =
          i === 0
            ? `${aspectPrompt}${batchConsistency}`
            : `${aspectPrompt}${batchConsistency}\n\nVariation ${i + 1}: Create a different composition and angle while keeping the same subject, style, and lighting.`;

        const imageUrl = await generateImage(variationPrompt, imageRefs, LOVABLE_API_KEY, aiModel);

        if (imageUrl) {
          images.push(imageUrl);
          console.log(`Generated freestyle image ${i + 1}/${imageCount}`);
        } else {
          errors.push(`Image ${i + 1} failed to generate`);
        }
      } catch (error: unknown) {
        if (typeof error === "object" && error !== null && "status" in error) {
          const statusError = error as { status: number; message: string };
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
    console.error("Freestyle edge function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
