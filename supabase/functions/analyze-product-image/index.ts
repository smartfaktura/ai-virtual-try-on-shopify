import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { resolveCanonicalCategory } from "../_shared/category-mapper.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace("Bearer ", "");
    const { data, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !data?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { imageUrl, title } = await req.json();
    if (!imageUrl) throw new Error("imageUrl is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const titleContext = title
      ? `\nThe user has indicated this is: "${title}". Focus your analysis specifically on that item in the image.`
      : "";

    const aiBody = JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image. It MUST be a tangible product (something a brand sells and a customer can buy / hold / wear / use).${titleContext}

If the image IS a product, return:
- "kind": "product"
- "title": Short product name (e.g. "Black High-Waist Yoga Leggings", "Lavender Soy Candle")
- "productType": Short free-form category label (e.g. "Leggings", "Scented Candle", "Face Serum"). NEVER use a location, room, or place name here.
- "category": REQUIRED. One canonical id from this enum (use "other" only if truly none fit): fragrance, beauty-skincare, makeup-lipsticks, bags-accessories, backpacks, wallets-cardholders, belts, scarves, phone-cases, caps, hats, beanies, shoes, sneakers, boots, high-heels, socks, garments, dresses, wedding-dress, skirts, streetwear, hoodies, jeans, trousers, jackets, activewear, swimwear, lingerie, kidswear, jewellery-necklaces, jewellery-earrings, jewellery-bracelets, jewellery-rings, watches, eyewear, home-decor, furniture, tech-devices, food, beverages, supplements-wellness, other
- "description": 10-20 word description of color, material, style, key features
- "specification": A detailed 30-50 word generation-ready description covering the product's silhouette, construction, materials, colors, finish, texture, and key visual details. Include hex color codes if identifiable. This should read like a technical product spec for image generation.

If the image is NOT a product — examples include rooms, kitchens, bedrooms, offices, building facades, streets, parks, landscapes, sports courts, stadiums, gyms, swimming pools, beaches, mountains, sky, generic interiors or exteriors, plain people with no clear product, screenshots, logos, charts, or abstract art — return ONLY this JSON and nothing else:
{ "kind": "not_product", "reason": "<short reason, e.g. 'Image shows a basketball court, not a product'>" }

CRITICAL RULE FOR PHONE CASES, TABLET CASES, LAPTOP SLEEVES, AIRPODS / EARBUD CASES, SMARTWATCH BANDS, AND SCREEN PROTECTORS:
- NEVER mention or guess any device brand or model designation, even if cutouts, camera bumps, button placement, or silhouette make a specific device identifiable.
- FORBIDDEN words in title, productType, description, and specification: "iPhone", "Apple", "Samsung", "Galaxy", "Pixel", "Google Pixel", "Huawei", "Xiaomi", "OnePlus", "Sony", "Nokia", "Motorola", "iPad", "MacBook", "AirPods", "Apple Watch", and any model numbers or suffixes like "15", "15 Pro", "Pro Max", "Ultra", "S24", "S25", "Mini", "Plus", "Air".
- Describe the item generically: "Phone Case", "Tablet Case", "Laptop Sleeve", "Earbud Case", "Watch Band", "Screen Protector".
- Examples:
  - Bad title: "Orange Striped iPhone 15 Pro Case" → Good: "Orange Striped Phone Case"
  - Bad description: "...glossy phone case for iPhone 15 Pro" → Good: "...glossy phone case with a slim profile and precise cutouts"
  - Bad specification: "Designed for iPhone 15 Pro Max with MagSafe ring" → Good: "Slim TPU phone case with a circular accessory ring and precise cutouts for camera, speaker, and charging port"

Return ONLY the JSON object, no markdown or explanation.`,

            },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
    });

    let response: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: aiBody,
      });
      if (response.ok || (response.status !== 503 && response.status !== 429)) break;
      const retryText = await response.text();
      console.warn(`AI gateway attempt ${attempt + 1} failed: ${response.status} ${retryText}`);
      if (attempt < 2) await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }

    if (!response || !response.ok) {
      const errText = response ? await response.text() : "no response";
      console.error("AI gateway error after retries:", response?.status, errText);
      return new Response(
        JSON.stringify({ error: "AI analysis temporarily unavailable. Please try again in a moment." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Strip markdown code fences (```json ... ``` or ``` ... ```)
    const stripped = content
      .replace(/```(?:json)?\s*/gi, "")
      .replace(/```/g, "")
      .trim();

    // Find first '{' and walk forward counting brace depth to extract matching '}'
    function extractJsonObject(text: string): string | null {
      const start = text.indexOf("{");
      if (start === -1) return null;
      let depth = 0;
      let inString = false;
      let escape = false;
      for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (escape) { escape = false; continue; }
        if (ch === "\\") { escape = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (ch === "{") depth++;
        else if (ch === "}") {
          depth--;
          if (depth === 0) return text.slice(start, i + 1);
        }
      }
      return null;
    }

    const jsonStr = extractJsonObject(stripped);
    if (!jsonStr) {
      console.error("No JSON object found in AI content:", content.slice(0, 500));
      return new Response(
        JSON.stringify({ error: "Could not parse AI response" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsed: unknown;
    try {
      // Most of the time the AI returns clean JSON — try raw parse first.
      parsed = JSON.parse(jsonStr);
    } catch {
      // Fallback: only escape control chars that appear INSIDE string values.
      let sanitized = "";
      let inString = false;
      let escape = false;
      for (let i = 0; i < jsonStr.length; i++) {
        const ch = jsonStr[i];
        if (escape) { sanitized += ch; escape = false; continue; }
        if (ch === "\\") { sanitized += ch; escape = true; continue; }
        if (ch === '"') { inString = !inString; sanitized += ch; continue; }
        if (inString && (ch.charCodeAt(0) < 0x20 || ch === "\x7F")) {
          if (ch === "\n") sanitized += "\\n";
          else if (ch === "\r") sanitized += "\\r";
          else if (ch === "\t") sanitized += "\\t";
          // drop other control chars
          continue;
        }
        sanitized += ch;
      }
      try {
        parsed = JSON.parse(sanitized);
      } catch (parseErr) {
        console.error("JSON.parse failed:", parseErr, "raw:", jsonStr.slice(0, 500));
        return new Response(
          JSON.stringify({ error: "Could not parse AI response" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Layer 2/3: validate AI's category against canonical enum, fall back to
    // regex over title+productType. Reject anything that looks like a location.
    const SPACE_RE = /\b(court|room|kitchen|bedroom|living\s*room|bathroom|hallway|hall|office|facade|building|street|sidewalk|park|stadium|arena|gym|swimming\s*pool|pool|beach|mountain|forest|landscape|interior|exterior|space|garage|warehouse|store\s+front|cafe\s+interior|restaurant\s+interior|lobby|terrace|balcony|garden|backyard|lawn)\b/i;
    try {
      if (parsed && typeof parsed === "object") {
        const p = parsed as Record<string, unknown>;
        const title = typeof p.title === "string" ? p.title : "";
        const productType = typeof p.productType === "string" ? p.productType : "";

        // Server-side saugiklis: reject locations even if the model ignored the rule.
        const looksLikeSpace =
          p.kind === "not_product" ||
          (!p.category && (SPACE_RE.test(title) || SPACE_RE.test(productType)));

        if (looksLikeSpace) {
          return new Response(
            JSON.stringify({
              kind: "not_product",
              reason:
                typeof p.reason === "string" && p.reason
                  ? p.reason
                  : "Image looks like a location, not a product",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        const userCategory = resolveCanonicalCategory(p.category, title || null, productType || null);
        p.kind = "product";
        p.userCategory = userCategory;
      }
    } catch (resolveErr) {
      console.warn("Category resolution failed (continuing without):", resolveErr);
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-product-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
