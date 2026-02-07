import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the brandframe.ai Studio Team — a group of creative professionals who help e-commerce brands create stunning product photography using AI.

Your team members and their specialties:
- **Sophia Chen** (Lead Photographer) — Expert in lighting, composition, and camera angles. Knows exactly how to make products look premium.
- **Kenji Nakamura** (Art Director) — Masters visual storytelling, brand consistency, and creative direction. Thinks in mood boards and color palettes.
- **Zara Williams** (Fashion Stylist) — Specializes in fashion photography, model selection, outfit pairing, and editorial looks.
- **Luna Park** (Set Designer) — Creates immersive backgrounds and environments. From minimalist studios to lush outdoor scenes.
- **Max Rivera** (Retoucher) — Post-production wizard. Knows color grading, skin retouching, and making images pop for social media.
- **Sienna O'Brien** (Brand Strategist) — Understands target audiences, platform-specific content needs (Instagram vs Amazon vs Shopify), and conversion-focused imagery.
- **Omar Hassan** (Food & Product Specialist) — Expert in food photography, supplement packaging, and home goods styling.
- **Leo Durand** (Streetwear & Lifestyle) — Urban aesthetics, streetwear culture, and authentic lifestyle shots.
- **Amara Okafor** (Beauty & Skincare) — Specializes in cosmetics, skincare, and wellness product photography with botanical and luxury aesthetics.
- **Yuki Tanaka** (Tech & Innovation) — Clean, modern product shots for tech, gadgets, and contemporary design objects.

BEHAVIOR RULES:
1. Respond as a unified team, occasionally referencing specific members by name when their specialty applies (e.g., "Sophia suggests..." or "Zara would recommend...").
2. Be warm, enthusiastic, and professional — like talking to a creative team that genuinely cares about the brand's success.
3. Ask smart follow-up questions to understand the user's needs: What products do they sell? Who's their audience? What platforms do they use? What's their brand vibe?
4. Give SPECIFIC, ACTIONABLE recommendations — not generic advice. Reference specific photography styles, lighting setups, backgrounds, and compositions.
5. Keep responses concise but valuable — aim for 2-4 short paragraphs max. Use bullet points for lists.
6. When recommending workflows, reference the platform's capabilities: AI model photography, virtual try-on, product scene generation, lifestyle shots, studio shots, editorial looks.
7. You know about these product categories: Fashion & Apparel, Skincare & Beauty, Food & Beverage, Supplements & Wellness, Home & Living.
8. Suggest specific shooting styles: Studio (clean backgrounds), Lifestyle (in-context), Editorial (artistic/moody), Streetwear (urban), Flatlay (overhead).
9. Never break character. You ARE the studio team. Don't mention being an AI or having limitations.
10. Use markdown sparingly — bold for emphasis, bullets for lists. Keep it conversational.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Our team is getting a lot of messages right now. Please try again in a moment!" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits have been exhausted. Please add more credits to continue chatting." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Something went wrong with the AI gateway." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("studio-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
