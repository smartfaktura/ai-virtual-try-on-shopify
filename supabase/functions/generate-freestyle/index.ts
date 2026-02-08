import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface FreestyleRequest {
  prompt: string;
  sourceImage?: string; // Base64 data URL
  modelImage?: string; // Base64 data URL
  sceneImage?: string; // Base64 data URL
  aspectRatio: string;
  imageCount: number;
  quality: "standard" | "high";
  polishPrompt: boolean;
}

function polishUserPrompt(rawPrompt: string): string {
  return `Professional photography: ${rawPrompt}

IMPORTANT PHOTOGRAPHY GUIDELINES:
- Ultra high resolution, sharp focus, professional quality
- Natural and realistic lighting, no AI artifacts
- Commercial-grade composition and color accuracy
- Clean, polished aesthetic suitable for e-commerce or editorial use`;
}

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

    const finalPrompt = body.polishPrompt
      ? polishUserPrompt(body.prompt)
      : body.prompt;

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
      aspectRatio: body.aspectRatio,
      imageCount: body.imageCount,
      quality: body.quality,
      model: aiModel,
      polished: body.polishPrompt,
    });

    const imageCount = Math.min(body.imageCount || 1, 4);
    const images: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < imageCount; i++) {
      try {
        const variationPrompt =
          i === 0
            ? aspectPrompt
            : `${aspectPrompt}\n\nVariation ${i + 1}: Create a different composition while keeping the same subject and style.`;

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
