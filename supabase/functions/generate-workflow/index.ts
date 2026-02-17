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
  category?: string;
}

// UGC Product Interaction Mapping
const PRODUCT_INTERACTIONS: Record<string, string> = {
  'skincare': 'applying to their skin or showing the product texture on the back of their hand',
  'beauty': 'applying the product or holding it up near their face showing the shade/color',
  'makeup': 'applying the product or holding it up near their face showing the shade/color',
  'clothing': 'wearing the item naturally as part of their outfit',
  'apparel': 'wearing the item naturally as part of their outfit',
  'shoes': 'showing the shoes on their feet or holding them up excitedly',
  'bags': 'wearing the bag naturally on their shoulder or holding it',
  'jewelry': 'wearing the jewelry piece (on finger, wrist, neck, or ear) and showing it off',
  'rings': 'wearing the ring on their finger and holding their hand up to show it',
  'watches': 'wearing the watch on their wrist and casually showing it',
  'food': 'holding the food/drink package or tasting/sipping the product',
  'drink': 'sipping or holding the drink toward the camera',
  'tech': 'using or demonstrating the device naturally',
  'fragrance': 'holding the bottle near their neck/wrist as if just applied',
  'haircare': 'running fingers through their hair or holding the product near their hair',
};

const UGC_MOOD_DESCRIPTIONS: Record<string, string> = {
  'excited': 'Genuine excitement and enthusiasm. Wide natural smile, bright eyes, "OMG I love this" energy. The kind of face you make when showing your best friend something amazing.',
  'chill': 'Relaxed and casual. Soft natural smile, effortless cool vibe. Everyday comfort energy, as if casually mentioning a product they use daily.',
  'confident': 'Self-assured and knowing. Subtle confident smile, direct eye contact with the camera. "I know what works for me" energy.',
  'surprised': 'Genuine surprise and wonder. Slightly raised eyebrows, open expression, "wait this actually works?!" reaction face.',
  'focused': 'Demonstrating and explaining. Friendly but concentrated expression, tutorial-mode energy. Looking at the product or showing how to use it.',
};

function getProductInteraction(productType: string): string {
  const type = productType.toLowerCase().trim();
  for (const [key, value] of Object.entries(PRODUCT_INTERACTIONS)) {
    if (type.includes(key)) return value;
  }
  return 'holding the product naturally near their face or chest';
}

interface WorkflowRequest {
  workflow_id: string;
  product: {
    title: string;
    productType: string;
    description: string;
    dimensions?: string;
    imageUrl: string;
  };
  additional_products?: Array<{
    title: string;
    productType: string;
    description: string;
    imageUrl: string;
  }>;
  styling_notes?: string;
  prop_style?: 'clean' | 'decorated';
  ugc_mood?: string;
  model?: {
    name: string;
    gender: string;
    ethnicity: string;
    bodyType: string;
    ageRange: string;
    imageUrl: string;
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
  selected_variations?: number[];
  product_angles?: 'front' | 'front-side' | 'front-back' | 'all';
  quality?: string;
  image_count?: number;
  // Creative Drops fields
  theme?: string;
  theme_notes?: string;
}

function buildVariationPrompt(
  config: GenerationConfig,
  variation: VariationItem,
  product: WorkflowRequest["product"],
  brandProfile: WorkflowRequest["brand_profile"],
  variationIndex: number,
  totalVariations: number,
  model?: WorkflowRequest["model"],
  additionalProducts?: WorkflowRequest["additional_products"],
  stylingNotes?: string,
  propStyle?: 'clean' | 'decorated',
  ugcMood?: string,
  theme?: string,
  themeNotes?: string,
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

  // Additional products block for flat lay multi-product
  const additionalProductsBlock = (additionalProducts && additionalProducts.length > 0)
    ? `\nADDITIONAL PRODUCTS IN COMPOSITION:
${additionalProducts.map((p, idx) => `- Product ${idx + 2}: ${p.title} (${p.productType})${p.description ? ` — ${p.description}` : ''}`).join('\n')}
Arrange ALL products together in a cohesive flat lay composition. Each product should be clearly visible and identifiable.\n`
    : "";

  // Styling notes for flat lay aesthetics
  const stylingBlock = stylingNotes
    ? `\nSTYLING & PROPS: ${stylingNotes}\nIncorporate these styling elements naturally into the flat lay composition.\n`
    : "";

  // Prop style control for flat lay — prevents AI from adding extra commercial products
  let propStyleBlock = "";
  if (propStyle === 'clean' || (!propStyle && additionalProducts !== undefined)) {
    propStyleBlock = `\nCRITICAL COMPOSITION RULE: Show ONLY the selected products on the surface. Do NOT add any extra items, props, accessories, or commercial products. The surface should contain ONLY the products provided — nothing else. No watches, cameras, electronics, bags, or any item not explicitly listed above.\n`;
  } else if (propStyle === 'decorated') {
    propStyleBlock = `\nCOMPOSITION RULE: You may add ONLY abstract/decorative styling elements around the products: natural textures, dried flowers, fabric swatches, paper, abstract shapes, ribbons. NEVER add extra commercial products like watches, cameras, electronics, earbuds, bags, or any item that could be mistaken for the user's own product.\n`;
  }

  // UGC mood and product interaction injection
  let ugcBlock = "";
  if (ugcMood) {
    const moodDesc = UGC_MOOD_DESCRIPTIONS[ugcMood] || UGC_MOOD_DESCRIPTIONS['excited'];
    const interaction = getProductInteraction(product.productType);
    ugcBlock = `\nEXPRESSION & ENERGY:\n${moodDesc}\n\nPRODUCT INTERACTION:\nThe subject must be naturally ${interaction} with the EXACT product from [PRODUCT IMAGE]. The product must be clearly visible and recognizable in the frame.\n`;
  }

  // Replace {PRODUCT_INTERACTION} and {MOOD_DESCRIPTION} placeholders in prompt template
  let processedTemplate = config.prompt_template;
  if (ugcMood) {
    const moodDesc = UGC_MOOD_DESCRIPTIONS[ugcMood] || UGC_MOOD_DESCRIPTIONS['excited'];
    const interaction = getProductInteraction(product.productType);
    processedTemplate = processedTemplate
      .replace('{PRODUCT_INTERACTION}', interaction)
      .replace('{MOOD_DESCRIPTION}', moodDesc);
  }

  // Issue 1: Seasonal/theme direction block
  const themeBlock = theme && theme !== 'custom'
    ? `\nSEASONAL DIRECTION: ${theme}
Generate imagery with a ${theme} aesthetic and mood.
${themeNotes ? `Additional direction: ${themeNotes}` : ""}\n`
    : themeNotes
      ? `\nCREATIVE DIRECTION:\n${themeNotes}\n`
      : "";

  // Issue 6: Merge brand do_not_rules into negative prompts
  const allNegatives = [
    config.negative_prompt_additions,
    ...(brandProfile?.do_not_rules || []),
  ].filter(Boolean).join('. ');

  const prompt = `${processedTemplate}
${themeBlock}
PRODUCT DETAILS:
- Product: ${product.title}
- Type: ${product.productType}
${product.dimensions ? `- Dimensions: ${product.dimensions} -- render at realistic scale` : ""}
${product.description ? `- Description: ${product.description}` : ""}
${modelBlock}${additionalProductsBlock}${stylingBlock}${propStyleBlock}${ugcBlock}
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

${allNegatives ? `AVOID: ${allNegatives}` : ""}`;

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
    console.log(`[generate-workflow] Refunded ${creditsReserved} credits for failed job ${jobId}`);
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
      console.log(`[generate-workflow] Partial: refunded ${refundAmount} credits for job ${jobId}`);
    }
  }

  console.log(`[generate-workflow] ✓ Queue job ${jobId} completed (${generatedCount} images)`);
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
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body: WorkflowRequest & { user_id?: string; job_id?: string; credits_reserved?: number } = await req.json();

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

    const allVariations = config.variation_strategy.variations;
    let variationsToGenerate: VariationItem[];

    if (body.selected_variations?.length) {
      variationsToGenerate = body.selected_variations
        .filter((i) => i >= 0 && i < allVariations.length)
        .map((i) => allVariations[i]);
    } else {
      variationsToGenerate = allVariations;
    }

    const maxImages = 4; // max 4 images per job; frontend splits larger requests into batches
    variationsToGenerate = variationsToGenerate.slice(0, maxImages);

    // Determine angle variations
    const angleOption = body.product_angles || 'front';
    const angleInstructions: Array<{ suffix: string; label: string }> = [
      { suffix: '', label: 'Front' },
    ];
    if (angleOption === 'front-side' || angleOption === 'all') {
      angleInstructions.push({ suffix: '\n\nANGLE: Show the product from a 45-degree side angle, revealing the side profile and depth of the product.', label: 'Side' });
    }
    if (angleOption === 'front-back' || angleOption === 'all') {
      angleInstructions.push({ suffix: '\n\nANGLE: Show the back/rear of the product, revealing the back panel, ingredients list, or back design.', label: 'Back' });
    }

    const quality =
      body.quality || config.fixed_settings.quality || "standard";
    let model = getModelForQuality(quality);
    // Force Pro model when a person/model reference image is present (e.g. Selfie/UGC Set)
    if (body.model?.imageUrl) model = "google/gemini-3-pro-image-preview";

    const totalToGenerate = variationsToGenerate.length * angleInstructions.length;
    console.log(
      `[generate-workflow] Generating ${variationsToGenerate.length} variations × ${angleInstructions.length} angles = ${totalToGenerate} images using ${model}`
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

      for (let a = 0; a < angleInstructions.length; a++) {
        const angle = angleInstructions[a];

        try {
          // Build variation with angle instruction appended
          const angleVariation: VariationItem = {
            ...variation,
            instruction: variation.instruction + angle.suffix,
          };
          const imageLabel = angleInstructions.length > 1 ? `${variation.label} (${angle.label})` : variation.label;

          const prompt = buildVariationPrompt(
            config,
            angleVariation,
            body.product,
            body.brand_profile,
            i,
            variationsToGenerate.length,
            body.model,
            body.additional_products,
            body.styling_notes,
            body.prop_style,
            body.ugc_mood,
            body.theme,
            body.theme_notes,
          );

          console.log(
            `[generate-workflow] Variation ${i + 1}/${variationsToGenerate.length} [${angle.label}]: "${variation.label}" (${aspectRatio})${body.model ? ` [with model: ${body.model.name}]` : ""}`
          );

          const referenceImages: Array<{ url: string; label: string }> = [
            { url: body.product.imageUrl, label: "product" },
          ];
          // Add additional product images as AI references for flat lay multi-product
          if (body.additional_products?.length) {
            for (const [idx, ap] of body.additional_products.entries()) {
              if (ap.imageUrl) {
                referenceImages.push({ url: ap.imageUrl, label: `product_${idx + 2}` });
              }
            }
          }
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
            // Upload base64 to storage to avoid bloating the database
            let finalUrl = imageUrl;
            if (imageUrl.startsWith("data:")) {
              try {
                const [meta, base64Data] = imageUrl.split(",");
                const mimeMatch = meta.match(/^data:(.*?);/);
                const mimeType = mimeMatch?.[1] || "image/png";
                const ext = mimeType === "image/jpeg" ? "jpg" : "png";

                const binaryString = atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let k = 0; k < binaryString.length; k++) {
                  bytes[k] = binaryString.charCodeAt(k);
                }

                const userId = body.user_id || "anonymous";
                const jobId = body.job_id || crypto.randomUUID();
                const storagePath = `${userId}/${jobId}/${i}-${a}.${ext}`;

                const { error: uploadError } = await supabase.storage
                  .from("workflow-previews")
                  .upload(storagePath, bytes, {
                    contentType: mimeType,
                    cacheControl: "3600",
                  });

                if (!uploadError) {
                  const { data: publicUrlData } = supabase.storage
                    .from("workflow-previews")
                    .getPublicUrl(storagePath);
                  finalUrl = publicUrlData.publicUrl;
                  console.log(`[generate-workflow] Uploaded to storage: ${storagePath}`);
                } else {
                  console.error("[generate-workflow] Storage upload failed, keeping base64:", uploadError.message);
                }
              } catch (uploadErr) {
                console.error("[generate-workflow] Storage upload error:", uploadErr);
              }
            }

            images.push({
              url: finalUrl,
              label: imageLabel,
              aspect_ratio: aspectRatio,
            });
            console.log(
              `[generate-workflow] ✓ "${imageLabel}" generated`
            );
          } else {
            errors.push(`"${imageLabel}" failed to generate`);
          }
        } catch (error: unknown) {
          if (
            typeof error === "object" &&
            error !== null &&
            "status" in error
          ) {
            const statusError = error as { status: number; message: string };
            if (isQueueInternal && body.job_id) {
              await completeQueueJob(body.job_id, body.user_id!, body.credits_reserved!, [], totalToGenerate, [statusError.message], body as unknown as Record<string, unknown>);
            }
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
          const imageLabel = angleInstructions.length > 1 ? `${variation.label} (${angle.label})` : variation.label;
          errors.push(
            `"${imageLabel}": ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }

        // Delay between generations
        if (a < angleInstructions.length - 1 || i < variationsToGenerate.length - 1) {
          await new Promise((r) => setTimeout(r, 500));
        }
      }
    }

    const imageUrls = images.map((img) => img.url);

    // Queue self-completion
    if (isQueueInternal && body.job_id) {
      await completeQueueJob(body.job_id, body.user_id!, body.credits_reserved!, imageUrls, totalToGenerate, errors, body as unknown as Record<string, unknown>);
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
        images: imageUrls,
        variations: images.map((img) => ({
          label: img.label,
          aspect_ratio: img.aspect_ratio,
        })),
        generatedCount: images.length,
        requestedCount: totalToGenerate,
        partialSuccess: images.length < totalToGenerate,
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
    try {
      const body = await req.clone().json().catch(() => ({}));
      if (isQueueInternal && body.job_id) {
        await completeQueueJob(body.job_id, body.user_id, body.credits_reserved, [], 1, [error instanceof Error ? error.message : "Unknown error"], body);
      }
    } catch { /* best effort */ }
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
