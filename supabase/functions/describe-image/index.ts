import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OUTFIT_DIRECTION_PROMPT = `You are a senior fashion stylist writing PRODUCT-AWARE outfit direction for a premium e-commerce shoot. The user's product (referenced as [PRODUCT IMAGE]) is the unknown HERO piece — you do NOT know if it is a top, bottom, dress, outerwear, jumpsuit, or crop. NEVER name a specific garment as the hero, never describe the hero's color, fabric, or silhouette. NEVER copy the outfit visible in the reference image as if it were the product.

From the reference image, extract ONLY the contextual styling DNA: mood/aesthetic family (editorial, quiet luxury, street, resort, sport, minimal, etc.), color palette and contrast logic (tonal, monochrome, complementary, neutral, saturated), formality level, silhouette tendency (oversized, tailored, fluid, cropped-friendly, structured), fabric family direction (knit, tailoring, denim-friendly or not, technical, linen, leather), and footwear formality.

Then write a single paragraph of CONDITIONAL styling rules a stylist would follow regardless of what the hero turns out to be. Required structure inside the paragraph:
- "Treat [PRODUCT IMAGE] as the hero — do not re-describe it, do not alter its silhouette, never cover or obscure it."
- "If the product is a top: pair with complementary bottoms in <palette/silhouette logic from scene>, no second top, no closed layer over it."
- "If the product is a crop top or cropped piece: keep the cropped silhouette visible — any layer must be open, cropped, or omitted entirely; never stack a sweater, blazer, or shirt over it."
- "If the product is a bottom: pair with a complementary top in <logic>, no second bottom."
- "If the product is a dress, jumpsuit, or one-piece: complement only with light outerwear or accessories — no conflicting tops or bottoms layered over it."
- "If the product is outerwear: build a coordinated base layer beneath in <logic>."
- Footwear logic: choose only when full or lower body is visible and the scene supports it; describe the footwear formality and tone, not a specific brand.
- Hard avoids: no denim if the scene reads elevated/editorial, no streetwear in editorial scenes, no loud branding, no second top over a top, no second bottom over a bottom, no blazer or sweater stacked over a crop top, no accessories that hide the hero piece.
- Closing line: "The full look should feel like one cohesive outfit from the same collection, with the hero piece left fully visible and undisturbed."

Output ONLY the single direction paragraph — no preamble, no headings, no bullet points, no markdown.`;

const SYSTEM_PROMPT = `You are an expert AI image prompt engineer. Given an image, analyze it in extreme detail and produce a single comma-separated prompt that could be used to reproduce a very similar image with an AI image generator.

Your prompt MUST cover ALL of the following aspects (when visible/applicable):
- Subject description (gender, age range, ethnicity, hair, body type)
- Clothing and accessories (materials, colors, fit, style)
- Pose and body language
- Facial expression and gaze direction
- Camera angle and distance (e.g. low angle, close-up, full body)
- Lens and focal length feel (e.g. 35mm, 85mm portrait, wide angle)
- Lighting setup (direction, quality, color temperature, shadows)
- Color palette and color grading
- Background and environment
- Mood and atmosphere
- Composition and framing
- Film/photography aesthetic (e.g. analog grain, cinematic, editorial)
- Texture and material qualities
- Any post-processing style visible

Output ONLY the prompt as a single paragraph of comma-separated descriptive phrases. No titles, no labels, no explanations, no bullet points. Just the raw prompt text optimized for AI image generation.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageUrl, mode } = await req.json();
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "imageUrl is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isOutfitMode = mode === "outfit_direction";
    const systemPrompt = isOutfitMode ? OUTFIT_DIRECTION_PROMPT : SYSTEM_PROMPT;
    const userText = isOutfitMode
      ? "Analyze this reference image and produce the outfit direction paragraph."
      : "Analyze this image and generate a detailed AI image generation prompt to reproduce it.";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userContent: any[] = [
      { type: "text", text: userText },
      { type: "image_url", image_url: { url: imageUrl } },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", status, errorText);
      return new Response(JSON.stringify({ error: "Failed to analyze image" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim() || "";

    return new Response(JSON.stringify(isOutfitMode ? { outfit_hint: result } : { prompt: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("describe-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
