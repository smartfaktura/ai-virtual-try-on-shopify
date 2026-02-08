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
  colorFeel: string;
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

// ── Selfie / UGC intent detection ─────────────────────────────────────────
const SELFIE_KEYWORDS = [
  'selfie', 'self-portrait', 'self portrait', 'front-facing', 'front facing',
  'ugc', 'phone camera', 'mirror shot', 'mirror selfie', 'phone selfie',
  'casual selfie', 'social media selfie', 'influencer selfie', 'vlog',
  'arm-length', 'arm length', 'front camera', 'facecam',
];

function detectSelfieIntent(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  return SELFIE_KEYWORDS.some((kw) => lower.includes(kw));
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
  userNegatives?: string[],
  modelContext?: string
): string {
  const layers: string[] = [];
  const isSelfie = detectSelfieIntent(rawPrompt);

  if (isSelfie) {
    layers.push(`Authentic selfie-style photo: ${rawPrompt}`);
    layers.push(
      "Ultra high resolution, sharp focus on face, natural ambient lighting, true-to-life color accuracy. Shot on a high-end smartphone front-facing camera."
    );
    // Selfie composition layer
    layers.push(
      "SELFIE COMPOSITION: Front-facing smartphone camera perspective. Slight high angle (camera held slightly above eye level). Arm-length or close-up distance from subject. Soft natural smartphone-style bokeh in background — NOT studio strobe bokeh. Authentic, candid facial expression — relaxed, genuine, not model-posed. Natural selfie framing with the subject centered or slightly off-center."
    );
  } else {
    layers.push(`Professional photography: ${rawPrompt}`);
    layers.push(
      "Ultra high resolution, sharp focus, natural lighting, commercial-grade color accuracy."
    );
  }

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
      "PRODUCT ACCURACY: The product in the PRODUCT REFERENCE IMAGE must be reproduced with 100% fidelity — identical shape, color, texture, branding, and proportions. Do not modify, stylize, or reinterpret the product in any way."
    );
  }

  // Model / portrait layer — strong identity matching
  if (context.hasModel) {
    const identityDetails = modelContext ? ` (${modelContext})` : "";
    layers.push(
      `MODEL IDENTITY: The generated person MUST be the EXACT same person shown in the MODEL REFERENCE IMAGE${identityDetails}. Replicate their exact face, facial features, skin tone, hair color, hair style, and body proportions with 100% fidelity. This is a specific real person — do NOT generate a different person who merely shares the same gender or ethnicity. The face must be recognizable as the same individual from the reference photo.`
    );
    layers.push(
      "PORTRAIT QUALITY: Natural and realistic skin texture, accurate body proportions, natural pose and expression. Studio-grade portrait retouching — no plastic or airbrushed look."
    );
  }

  // Scene / environment layer
  if (context.hasScene) {
    layers.push(
      "ENVIRONMENT: Match the lighting direction and color temperature of the SCENE REFERENCE IMAGE. Integrate the subject naturally into the environment with consistent shadows and reflections."
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

// Content-block detection helpers
function isContentBlocked(data: Record<string, unknown>): boolean {
  const choice = (data.choices as Array<Record<string, unknown>>)?.[0];
  if (!choice) return false;
  const finishReason = String(choice.finish_reason || "");
  if (/PROHIBIT|BLOCK|SAFETY|RECITATION/i.test(finishReason)) return true;
  const content = String((choice.message as Record<string, unknown>)?.content || "");
  if (/I cannot fulfill|I('m| am) unable to|violates .* policy|inappropriate|not able to generate/i.test(content)) return true;
  return false;
}

function extractBlockReason(data: Record<string, unknown>): string {
  const choice = (data.choices as Array<Record<string, unknown>>)?.[0];
  const content = String((choice?.message as Record<string, unknown>)?.content || "").trim();
  if (content.length > 10 && content.length < 300) return content;
  return "This prompt was flagged by our content safety system. Try rephrasing with different terms.";
}

type ContentItem = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };
type GenerateResult = string | { blocked: true; reason: string } | null;

// ── AI image generation with structured content ───────────────────────────
async function generateImage(
  content: ContentItem[],
  apiKey: string,
  model: string,
  aspectRatio?: string
): Promise<GenerateResult> {
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
            model,
            messages: [{ role: "user", content }],
            modalities: ["image", "text"],
            ...(aspectRatio ? { image_config: { aspect_ratio: aspectRatio } } : {}),
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
        if (isContentBlocked(data)) {
          const reason = extractBlockReason(data);
          console.warn("Content blocked by safety filter:", reason);
          return { blocked: true, reason };
        }

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

// ── Build labeled content array with interleaved text + images ────────────
function buildContentArray(
  prompt: string,
  sourceImage?: string,
  modelImage?: string,
  sceneImage?: string,
  modelContext?: string
): ContentItem[] {
  const content: ContentItem[] = [];

  // Main prompt text first
  content.push({ type: "text", text: prompt });

  // Product/source image with explicit label
  if (sourceImage) {
    content.push({
      type: "text",
      text: "PRODUCT/SOURCE REFERENCE IMAGE — reproduce this exact product with 100% fidelity (shape, color, texture, branding, proportions):",
    });
    content.push({ type: "image_url", image_url: { url: sourceImage } });
  }

  // Model image with strong identity label
  if (modelImage) {
    const modelDesc = modelContext ? ` (${modelContext})` : "";
    content.push({
      type: "text",
      text: `MODEL REFERENCE IMAGE — use this EXACT person's face, hair, skin tone, and body${modelDesc}. Do NOT generate a different person:`,
    });
    content.push({ type: "image_url", image_url: { url: modelImage } });
  }

  // Scene image with label
  if (sceneImage) {
    content.push({
      type: "text",
      text: "SCENE/ENVIRONMENT REFERENCE IMAGE — match this setting, lighting direction, and color temperature:",
    });
    content.push({ type: "image_url", image_url: { url: sceneImage } });
  }

  return content;
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
      finalPrompt = polishUserPrompt(enrichedPrompt, polishContext, body.brandProfile, body.negatives, body.modelContext);
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
    let contentBlocked = false;
    let blockReason = "";

    // Batch consistency instruction for multi-image requests
    const batchConsistency = imageCount > 1
      ? "\n\nBATCH CONSISTENCY: Maintain the same color palette, lighting direction, overall mood, and visual style. Only vary composition, angle, and framing."
      : "";

    for (let i = 0; i < imageCount; i++) {
      try {
        const variationSuffix =
          i === 0
            ? batchConsistency
            : `${batchConsistency}\n\nVariation ${i + 1}: Create a different composition and angle while keeping the same subject, style, and lighting.`;

        const promptWithVariation = `${aspectPrompt}${variationSuffix}`;

        // Build structured content array with labeled images
        const contentArray = buildContentArray(
          promptWithVariation,
          body.sourceImage,
          body.modelImage,
          body.sceneImage,
          body.modelContext
        );

        const result = await generateImage(contentArray, LOVABLE_API_KEY, aiModel, body.aspectRatio);

        if (result && typeof result === "object" && "blocked" in result) {
          contentBlocked = true;
          blockReason = result.reason;
          console.warn(`Image ${i + 1} blocked by content safety filter`);
          break;
        } else if (typeof result === "string") {
          images.push(result);
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

    // If content was blocked and no images were generated
    if (contentBlocked && images.length === 0) {
      return new Response(
        JSON.stringify({
          images: [],
          generatedCount: 0,
          requestedCount: imageCount,
          contentBlocked: true,
          blockReason,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
        contentBlocked: contentBlocked || undefined,
        blockReason: contentBlocked ? blockReason : undefined,
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
