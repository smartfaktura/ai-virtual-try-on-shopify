import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageUrl, prompt, sceneOptions } = await req.json();
    const sceneList: string[] = Array.isArray(sceneOptions)
      ? sceneOptions.filter((s: any) => typeof s === 'string' && s.length > 0).slice(0, 400)
      : [];

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "imageUrl is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are a creative director for a fashion AI platform called VOVV.AI. Given an AI-generated image (and optionally the prompt used to create it), suggest metadata for publishing it to a public Discover feed.

CATEGORY DEFINITIONS — pick the single best match:
• fashion — Fashion & apparel, clothing, streetwear, outfits
• beauty — Beauty, skincare, cosmetics, makeup
• fragrances — Perfumes, colognes, scent bottles
• jewelry — Rings, necklaces, watches, earrings
• accessories — Bags, hats, sunglasses, belts, scarves
• home — Home decor, furniture, interior styling
• food — Food & beverage, drinks, restaurant, packaging
• electronics — Tech, gadgets, devices, modern products
• sports — Sports gear, fitness, activewear, athletic
• supplements — Health supplements, vitamins, wellness products

Be concise and catchy.`;

    const userContent: any[] = [
      {
        type: "image_url",
        image_url: { url: imageUrl },
      },
      {
        type: "text",
        text: prompt
          ? `The prompt used to generate this image was: "${prompt}". Suggest a short catchy title, the best category, and relevant tags.`
          : "Suggest a short catchy title, the best category, and relevant tags for this image.",
      },
    ];

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
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
          tools: [
            {
              type: "function",
              function: {
                name: "suggest_discover_metadata",
                description:
                  "Return suggested metadata for a Discover feed image.",
                parameters: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                      description:
                        "A short, catchy title for the image. Max 40 characters. No quotes.",
                    },
                    category: {
                      type: "string",
                      enum: [
                        "fashion",
                        "beauty",
                        "fragrances",
                        "jewelry",
                        "accessories",
                        "home",
                        "food",
                        "electronics",
                        "sports",
                        "supplements",
                      ],
                      description:
                        "The single best-matching category. editorial=moody/dramatic/cinematic, commercial=clean product/studio/e-commerce, lifestyle=natural/outdoor/casual, fashion=outfit-centric/styling/streetwear, campaign=ad-style/bold/promotional.",
                    },
                    tags: {
                      type: "array",
                      items: { type: "string" },
                      description:
                        "3 to 5 single-word lowercase tags describing the image.",
                    },
                  },
                  required: ["title", "category", "tags"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "suggest_discover_metadata" },
          },
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      
      if (status === 429 || status === 402) {
        return new Response(
          JSON.stringify({ error: status === 429 ? "Rate limited" : "Payment required" }),
          { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(
        JSON.stringify({ error: "No structured output from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const metadata = JSON.parse(toolCall.function.arguments);

    if (metadata.title && metadata.title.length > 40) {
      metadata.title = metadata.title.slice(0, 40);
    }
    if (metadata.tags && metadata.tags.length > 5) {
      metadata.tags = metadata.tags.slice(0, 5);
    }

    return new Response(JSON.stringify(metadata), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("describe-discover-metadata error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
