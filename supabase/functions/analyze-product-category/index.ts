import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageUrl, title, description, productType } = await req.json();

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "imageUrl is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a product analysis AI for an ecommerce photography platform. Analyze the product image and metadata to determine key attributes.

Return a JSON object with these exact fields:
- category: one of "fragrance", "beauty-skincare", "makeup-lipsticks", "bags-accessories", "hats-small", "shoes", "garments", "home-decor", "tech-devices", "food-beverage", "supplements-wellness", "other"
- sizeClass: one of "very-small", "small", "medium", "large", "extra-large"
- colorFamily: primary color description (e.g. "warm brown", "silver metallic", "soft pink")
- materialFamily: primary material (e.g. "leather", "glass", "fabric", "plastic", "metal", "ceramic")
- finish: surface finish (e.g. "matte", "glossy", "satin", "textured", "brushed")
- packagingRelevant: boolean - true if product typically has notable packaging (perfumes, cosmetics, tech)
- personCompatible: boolean - true if product can be shown with a person (held, worn, used)
- accentColor: the dominant/accent color of the product as a hex code (e.g. "#D4A574", "#1A1A1A", "#E8C4B0"). Pick the single most visually prominent color.

Be precise and confident. Use the image as primary signal, with title/description as context.`;

    const userContent: Array<Record<string, unknown>> = [
      {
        type: "text",
        text: `Analyze this product:\nTitle: ${title || "Unknown"}\nDescription: ${description || "N/A"}\nType: ${productType || "N/A"}`,
      },
      {
        type: "image_url",
        image_url: { url: imageUrl },
      },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "classify_product",
              description: "Classify a product into category and attributes",
              parameters: {
                type: "object",
                properties: {
                  category: {
                    type: "string",
                    enum: [
                      "fragrance", "beauty-skincare", "makeup-lipsticks",
                      "bags-accessories", "hats-small", "shoes",
                      "garments", "home-decor", "tech-devices",
                      "food-beverage", "supplements-wellness", "other",
                    ],
                  },
                  sizeClass: {
                    type: "string",
                    enum: ["very-small", "small", "medium", "large", "extra-large"],
                  },
                  colorFamily: { type: "string" },
                  materialFamily: { type: "string" },
                  finish: { type: "string" },
                  packagingRelevant: { type: "boolean" },
                  personCompatible: { type: "boolean" },
                },
                required: ["category", "sizeClass", "colorFamily", "materialFamily", "finish", "packagingRelevant", "personCompatible"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "classify_product" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "No analysis result" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-product-category error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
