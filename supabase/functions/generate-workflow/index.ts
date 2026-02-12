import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TONE_DESCRIPTIONS: Record<string, string> = {
  luxury: "premium, sophisticated, elegant with refined details",
  clean: "minimalist, uncluttered, modern and professional",
  bold: "striking, high-contrast, attention-grabbing",
  minimal: "extremely simple, lots of negative space, zen-like",
  playful: "vibrant, energetic, fun with dynamic composition",
};

interface GenerationConfig {
  prompt_template: string;
  system_instructions: string;
  fixed_settings: {
    aspect_ratios?: string[];
    quality?: string;
    composition_rules?: string;
  };
  variation_strategy: {
    type: string;
    variations: VariationItem[];
  };
  ui_config: Record<string, unknown>;
  negative_prompt_additions?: string;
}

interface VariationItem {
  label: string;
  instruction: string;
  aspect_ratio?: string;
}

interface WorkflowRequest {
  workflow_id: string;
  product: {
    title: string;
    productType: string;
    description: string;
    imageUrl: string; // base64 or URL
  };
  model?: {
    name: string;
    gender: string;
    ethnicity: string;
    bodyType: string;
    ageRange: string;
    imageUrl: string; // base64 or URL of the model reference image
  };
  brand_profile?: {
    tone?: string;
    background_style?: string;
    lighting_style?: string;
    color_temperature?: string;
    brand_keywords?: string[];
    color_palette?: string[];
    target_audience?: string;
    do_not_rules?: string[];
    composition_bias?: string;
    preferred_scenes?: string[];
    photography_reference?: string;
  };
  selected_variations?: number[]; // indices of which variations to generate
  quality?: string;
  image_count?: number;
}

function buildVariationPrompt(
  config: GenerationConfig,
  variation: VariationItem,
  product: WorkflowRequest["product"],
  brandProfile: WorkflowRequest["brand_profile"],
  variationIndex: number,
  totalVariations: number,
  model?: WorkflowRequest["model"]
): string {
  const brandLines: string[] = [];
  if (brandProfile) {
    const toneDesc =
      TONE_DESCRIPTIONS[brandProfile.tone || "clean"] ||
      TONE_DESCRIPTIONS.clean;
    brandLines.push(`   - Tone: ${toneDesc}`);
    if (brandProfile.brand_keywords?.length) {
      brandLines.push(
        `   - Brand DNA: ${brandProfile.brand_keywords.join(", ")}`
      );
    }
    if (brandProfile.color_palette?.length) {
      brandLines.push(
        `   - Brand accent colors: ${brandProfile.color_palette.join(", ")}`
      );
    }
    if (brandProfile.target_audience) {
      brandLines.push(
        `   - Target audience: ${brandProfile.target_audience}`
      );
    }
    if (brandProfile.lighting_style) {
      brandLines.push(`   - Lighting: ${brandProfile.lighting_style}`);
    }
    if (brandProfile.photography_reference) {
      brandLines.push(
        `   - Style reference: ${brandProfile.photography_reference}`
      );
    }
  }

  const compositionRules =
    config.fixed_settings.composition_rules || "";

  // Identity-preservation block when a model reference is provided
  const modelBlock = model
    ? `\nMODEL IDENTITY (CRITICAL):
The person in this image MUST be the EXACT same person shown in [MODEL IMAGE].
- Preserve: face shape, skin tone, eye color, hair color/texture/length, facial features, distinguishing marks
- Gender: ${model.gender}, Body type: ${model.bodyType}, Age range: ${model.ageRange}, Ethnicity: ${model.ethnicity}
- The face must be unmistakably recognizable as the same individual
- Do NOT alter, idealize, or change any facial features from the reference\n`
    : "";

  const prompt = `${config.prompt_template}

PRODUCT DETAILS:
- Product: ${product.title}
- Type: ${product.productType}
${product.description ? `- Description: ${product.description}` : ""}
${modelBlock}
VARIATION ${variationIndex + 1} of ${totalVariations}: "${variation.label}"
${variation.instruction}

${compositionRules ? `COMPOSITION RULES:\n${compositionRules}` : ""}

${brandLines.length > 0 ? `BRAND GUIDELINES:\n${brandLines.join("\n")}` : ""}

CRITICAL REQUIREMENTS:
1. The product MUST look EXACTLY like [PRODUCT IMAGE] — preserve 100% accurate packaging, labels, colors, branding, shape, and materials.
2. All text on packaging must be perfectly legible.
3. Ultra high resolution, professional quality, no AI artifacts.
4. This specific variation must clearly match the "${variation.label}" direction described above.
${model ? `5. The person MUST match [MODEL IMAGE] exactly — same face, same identity. This is non-negotiable.` : ""}

${config.negative_prompt_additions ? `AVOID: ${config.negative_prompt_additions}` : ""}`;

  return prompt;
}

function getAspectRatioForVariation(
  config: GenerationConfig,
  variation: VariationItem
): string {
  // Multi-ratio strategies have per-variation aspect ratios
  if (variation.aspect_ratio) return variation.aspect_ratio;
  // Otherwise use the first fixed aspect ratio
  if (config.fixed_settings.aspect_ratios?.length) {
    return config.fixed_settings.aspect_ratios[0];
  }
  return "1:1";
}

function getModelForQuality(quality: string): string {
  return quality === "high"
    ? "google/gemini-3-pro-image-preview"
    : "google/gemini-2.5-flash-image";
}

async function generateImage(
  prompt: string,
  referenceImages: Array<{ url: string; label: string }>,
  aiModel: string,
  apiKey: string
): Promise<string | null> {
  const maxRetries = 2;

  // Build content array: text prompt + all reference images
  const contentParts: Array<Record<string, unknown>> = [
    { type: "text", text: prompt },
  ];
  for (const img of referenceImages) {
    contentParts.push({
      type: "image_url",
      image_url: { url: img.url },
    });
  }

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
            model: aiModel,
            messages: [
              {
                role: "user",
                content: contentParts,
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
          throw {
            status: 402,
            message: "Payment required - please add credits",
          };
        }
        const errorText = await response.text();
        console.error(
          `AI Gateway error (attempt ${attempt + 1}):`,
          response.status,
          errorText
        );
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      const imageUrl =
        data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!imageUrl) {
        console.error(
          "No image in response:",
          JSON.stringify(data).slice(0, 500)
        );
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        return null;
      }

      return imageUrl;
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "status" in error
      ) {
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body: WorkflowRequest = await req.json();

    if (!body.workflow_id || !body.product) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: workflow_id and product",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch workflow with generation_config from DB
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: workflow, error: wfError } = await supabase
      .from("workflows")
      .select("*")
      .eq("id", body.workflow_id)
      .single();

    if (wfError || !workflow) {
      return new Response(
        JSON.stringify({ error: "Workflow not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const config = workflow.generation_config as GenerationConfig | null;
    if (!config) {
      return new Response(
        JSON.stringify({
          error:
            "This workflow does not have a generation config yet. Use the standard generation flow.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(
      `[generate-workflow] Workflow: ${workflow.name}, Strategy: ${config.variation_strategy.type}`
    );

    // Determine which variations to generate
    const allVariations = config.variation_strategy.variations;
    let variationsToGenerate: VariationItem[];

    if (body.selected_variations?.length) {
      variationsToGenerate = body.selected_variations
        .filter((i) => i >= 0 && i < allVariations.length)
        .map((i) => allVariations[i]);
    } else {
      variationsToGenerate = allVariations;
    }

    // Cap at reasonable limit
    const maxImages = Math.min(variationsToGenerate.length, 8);
    variationsToGenerate = variationsToGenerate.slice(0, maxImages);

    const quality =
      body.quality || config.fixed_settings.quality || "standard";
    const model = getModelForQuality(quality);

    console.log(
      `[generate-workflow] Generating ${variationsToGenerate.length} variations using ${model}`
    );

    const images: Array<{
      url: string;
      label: string;
      aspect_ratio: string;
    }> = [];
    const errors: string[] = [];

    for (let i = 0; i < variationsToGenerate.length; i++) {
      const variation = variationsToGenerate[i];
      const aspectRatio = getAspectRatioForVariation(config, variation);

      try {
        const prompt = buildVariationPrompt(
          config,
          variation,
          body.product,
          body.brand_profile,
          i,
          variationsToGenerate.length,
          body.model
        );

        console.log(
          `[generate-workflow] Variation ${i + 1}/${variationsToGenerate.length}: "${variation.label}" (${aspectRatio})${body.model ? ` [with model: ${body.model.name}]` : ""}`
        );

        // Build reference images array: product first, then model if provided
        const referenceImages: Array<{ url: string; label: string }> = [
          { url: body.product.imageUrl, label: "product" },
        ];
        if (body.model?.imageUrl) {
          referenceImages.push({ url: body.model.imageUrl, label: "model" });
        }

        const imageUrl = await generateImage(
          prompt,
          referenceImages,
          model,
          LOVABLE_API_KEY
        );

        if (imageUrl) {
          images.push({
            url: imageUrl,
            label: variation.label,
            aspect_ratio: aspectRatio,
          });
          console.log(
            `[generate-workflow] ✓ Variation "${variation.label}" generated`
          );
        } else {
          errors.push(`"${variation.label}" failed to generate`);
        }
      } catch (error: unknown) {
        if (
          typeof error === "object" &&
          error !== null &&
          "status" in error
        ) {
          const statusError = error as { status: number; message: string };
          return new Response(
            JSON.stringify({ error: statusError.message }),
            {
              status: statusError.status,
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
              },
            }
          );
        }
        errors.push(
          `"${variation.label}": ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }

      // Small delay between generations
      if (i < variationsToGenerate.length - 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    if (images.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Failed to generate any images",
          details: errors,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        images: images.map((img) => img.url),
        variations: images.map((img) => ({
          label: img.label,
          aspect_ratio: img.aspect_ratio,
        })),
        generatedCount: images.length,
        requestedCount: variationsToGenerate.length,
        partialSuccess: images.length < variationsToGenerate.length,
        workflow_name: workflow.name,
        strategy_type: config.variation_strategy.type,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
