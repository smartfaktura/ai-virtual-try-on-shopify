import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    imageUrl: string; // Base64 encoded
  };
  template: {
    name: string;
    promptBlueprint: PromptBlueprint;
    negativePrompt: string;
  };
  brandSettings: {
    tone: string;
    backgroundStyle: string;
    brandKeywords?: string[];
    colorPalette?: string[];
    preferredScenes?: string[];
    targetAudience?: string;
    photographyReference?: string;
    lightingStyle?: string;
    colorTemperature?: string;
    compositionBias?: string;
  };
  aspectRatio: "1:1" | "4:5" | "16:9";
  imageCount: number;
}

function buildPrompt(req: ProductRequest): string {
  const { product, template, brandSettings } = req;
  const { promptBlueprint } = template;

  // Build constraint strings
  const doConstraints = promptBlueprint.constraints.do.join(", ");
  const dontConstraints = promptBlueprint.constraints.dont.join(", ");

  // Map brand tone to descriptive style
  const toneDescriptions: Record<string, string> = {
    luxury: "premium, sophisticated, elegant with refined details",
    clean: "minimalist, uncluttered, modern and professional",
    playful: "vibrant, energetic, fun with dynamic composition",
    bold: "striking, high-contrast, attention-grabbing",
    minimal: "extremely simple, lots of negative space, zen-like",
  };
  const toneDesc = toneDescriptions[brandSettings.tone] || toneDescriptions.clean;

  // Map background style to description
  const bgStyleDescriptions: Record<string, string> = {
    studio: "clean professional studio backdrop",
    lifestyle: "natural lifestyle environment",
    gradient: "smooth gradient background",
    pattern: "subtle textured pattern backdrop",
    contextual: "relevant contextual environment",
  };
  const bgDesc = bgStyleDescriptions[brandSettings.backgroundStyle] || bgStyleDescriptions.studio;

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
   - Tone: ${toneDesc}
   - Background Style: ${bgDesc}${
     brandSettings.lightingStyle ? `\n   - Lighting: ${brandSettings.lightingStyle}` : ''
   }${
     brandSettings.colorTemperature ? `\n   - Color Temperature: ${brandSettings.colorTemperature}` : ''
   }${
     brandSettings.compositionBias ? `\n   - Composition: ${brandSettings.compositionBias}` : ''
   }${
     brandSettings.brandKeywords && brandSettings.brandKeywords.length > 0
       ? `\n   - Brand DNA: ${brandSettings.brandKeywords.join(", ")}` : ''
   }${
     brandSettings.colorPalette && brandSettings.colorPalette.length > 0
       ? `\n   - Preferred Palette: ${brandSettings.colorPalette.join(", ")}` : ''
   }${
     brandSettings.preferredScenes && brandSettings.preferredScenes.length > 0
       ? `\n   - Preferred Environments: ${brandSettings.preferredScenes.join(", ")}` : ''
   }${
     brandSettings.photographyReference
       ? `\n   - Creative Direction: ${brandSettings.photographyReference}` : ''
   }

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: ProductRequest = await req.json();

    // Validate required fields
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

    // Generate images sequentially to avoid rate limits
    for (let i = 0; i < imageCount; i++) {
      try {
        // Add slight variation to each prompt for variety
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
          return new Response(
            JSON.stringify({ error: statusError.message }),
            { status: statusError.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        errors.push(`Image ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }

      // Small delay between generations to avoid rate limits
      if (i < imageCount - 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
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
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
