import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Title-based category fallback when AI returns "other" */
const TITLE_CATEGORY_PATTERNS: [RegExp, string][] = [
  // Jewellery (specific first)
  [/necklace|pendant|choker|lariat|chain necklace/i, "jewellery-necklaces"],
  [/earring|stud|hoop|drop earring|huggie|ear cuff/i, "jewellery-earrings"],
  [/bracelet|bangle|cuff bracelet|charm bracelet|tennis bracelet/i, "jewellery-bracelets"],
  [/\bring\b|signet|band ring|cocktail ring|engagement ring|wedding band/i, "jewellery-rings"],
  [/\bwatch\b|timepiece|chronograph|wristwatch/i, "watches"],
  [/sunglasses|glasses|eyewear|optical|aviator|spectacles/i, "eyewear"],
  // Accessories (specific first)
  [/backpack|rucksack|daypack/i, "backpacks"],
  [/wallet|cardholder|card holder|card case|money clip|billfold/i, "wallets-cardholders"],
  [/\bbelt\b|waist belt|leather belt|buckle belt/i, "belts"],
  [/scarf|shawl|bandana|neckerchief|stole/i, "scarves"],
  // Footwear (specific first)
  [/sneaker|trainer|air max|nike dunk|jordan|running shoe/i, "sneakers"],
  [/\bboot\b|\bboots\b|ankle boot|chelsea boot|combat boot|hiking boot|cowboy boot/i, "boots"],
  [/high heel|stiletto|pump|platform heel|kitten heel|wedge heel/i, "high-heels"],
  // Fashion (specific first)
  [/\bdress\b|\bdresses\b|gown|maxi dress|midi dress|sundress|cocktail dress/i, "dresses"],
  [/hoodie|hooded sweatshirt/i, "hoodies"],
  [/streetwear|graphic tee|oversized tee|urban wear/i, "streetwear"],
  [/\bjeans\b|denim|skinny jeans|wide-leg jeans|mom jeans/i, "jeans"],
  [/jacket|blazer|bomber|puffer|windbreaker|parka|trench coat/i, "jackets"],
  [/activewear|sportswear|\byoga\b|gym wear|athletic|workout|legging|sports bra/i, "activewear"],
  [/swimwear|bikini|swimsuit|swim trunks|bathing suit/i, "swimwear"],
  [/lingerie|\bbra\b|underwear|corset|negligee|intimates/i, "lingerie"],
  [/\bkids\b|children|baby|toddler|infant|kidswear/i, "kidswear"],
  // Beauty / Makeup split
  [/perfume|fragrance|eau de|cologne|parfum|body mist/i, "fragrance"],
  [/lipstick|mascara|foundation|concealer|blush|eyeshadow|eyeliner|lip gloss|bronzer|primer|highlighter|contour|rouge/i, "makeup-lipsticks"],
  [/serum|moisturizer|cream|cleanser|toner|sunscreen|lotion|face wash|body wash|shampoo|conditioner|exfoliant|retinol/i, "beauty-skincare"],
  // Generic parents
  [/\bbag\b|handbag|clutch|purse|tote|satchel/i, "bags-accessories"],
  [/\bhat\b|\bcap\b|beanie|headband|beret|fedora/i, "hats-small"],
  [/\bshoe\b|\bshoes\b|sandal|loafer|slipper|mule/i, "shoes"],
  [/\bshirt\b|pants|skirt|coat|sweater|blouse|cardigan|vest/i, "garments"],
  [/candle|vase|pillow|lamp|decor|cushion|throw|planter|frame/i, "home-decor"],
  [/phone|laptop|tablet|headphone|speaker|camera|earbuds|charger|keyboard|mouse/i, "tech-devices"],
  [/protein|vitamin|supplement|probiotic|collagen|creatine|pre-?workout/i, "supplements-wellness"],
  [/coffee|tea|juice|soda|wine|beer|kombucha|smoothie|energy drink|lemonade|milk/i, "beverages"],
  [/chocolate|cereal|granola|honey|jam|sauce|snack|cookie|candy|chips|olive oil|food/i, "food"],
];

function applyCategoryFallback(analysis: Record<string, unknown>, title: string): void {
  if (analysis.category && analysis.category !== "other") return;
  const combined = (title || "").toLowerCase();
  for (const [pattern, category] of TITLE_CATEGORY_PATTERNS) {
    if (pattern.test(combined)) {
      console.log(`Category fallback: "${analysis.category}" → "${category}" (matched title: "${title}")`);
      analysis.category = category;
      return;
    }
  }
}

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

    const systemPrompt = `You are a product analysis AI for a premium ecommerce photography platform. Analyze the product image and metadata to extract rich visual, semantic, and category-specific attributes.

Return a JSON object with ALL applicable fields. For category-specific fields, ONLY return the ones relevant to the detected category.

IMPORTANT: Pay close attention to the product title — if the title says "perfume", "fragrance", "eau de", etc., the category MUST be "fragrance". If the title says "shirt", "dress", etc., the category MUST be "garments". The title is a strong signal.

VALID CATEGORIES: fragrance, beauty-skincare, makeup-lipsticks, bags-accessories, backpacks, wallets-cardholders, belts, scarves, hats-small, shoes, sneakers, boots, high-heels, garments, dresses, hoodies, streetwear, jeans, jackets, activewear, swimwear, lingerie, kidswear, jewellery-necklaces, jewellery-earrings, jewellery-bracelets, jewellery-rings, watches, eyewear, home-decor, tech-devices, food, beverages, supplements-wellness, other

GLOBAL VISUAL (always return):
- category: one of the valid categories above
- sizeClass: very-small | small | medium | large | extra-large
- productSubcategory, productForm, productSilhouette
- productMainHex, productSecondaryHex, productAccentHex (valid #RRGGBB)
- backgroundBaseHex, backgroundSecondaryHex, shadowToneHex
- productFinishType: matte | glossy | satin | metallic | textured | frosted
- materialPrimary, materialSecondary, textureType
- transparencyType: none | translucent | transparent | frosted
- metalTone (if metallic: gold, silver, rose-gold, bronze, gunmetal, chrome)
- heroFeature, detailFocusAreas, scaleType, wearabilityMode, bodyPlacementSuggested
- colorFamily, materialFamily, finish, packagingRelevant (boolean), personCompatible (boolean), accentColor

GLOBAL SEMANTIC (return when applicable — use empty string if not relevant):
- ingredientFamilyPrimary, ingredientFamilySecondary
- fruitsRelated, flowersRelated, botanicalsRelated, woodsRelated, spicesRelated, greensRelated
- materialsRelated, regionRelated, landscapeRelated

CATEGORY-SPECIFIC — only return fields for the detected category:
Fashion: garmentType, fitType, fabricType, fabricWeight, drapeBehavior
Beauty: packagingType, formulaType, formulaTexture, applicationMode, skinAreaSuggested
Fragrance: fragranceFamily, bottleType, capStyle, liquidColorHex, glassTintType, noteObjectsPrimary, noteObjectsSecondary, scentWorld
Jewelry: jewelryType, gemType, gemColorHex, metalPrimary, metalFinish, wearPlacement, sparkleLevel
Accessories: accessoryType, carryMode, strapType, hardwareType, hardwareFinish, structureType, signatureDetail
Home: decorType, placementType, objectScale, baseMaterial, surfaceFinish, roomContextSuggested, stylingCompanions
Food: foodType, servingMode, ingredientObjectsPrimary, ingredientObjectsSecondary, textureCue, temperatureCue, consumptionContext
Electronics: deviceType, interfaceType, screenPresence, screenStateSuggested, finishMaterialPrimary, industrialStyle, portDetail, buttonDetail
Sports: sportType, gearType, performanceMaterial, gripTexture, motionCue, usageContext, surfaceContext
Health: supplementType, dosageForm, mixingMode, wellnessIngredientObjects, containerType, clinicalCleanlinessLevel, routineContext

Use the IMAGE as primary signal. Be vivid and specific. All hex colors must be valid (#RRGGBB).

Return ONLY the JSON object, no markdown fences, no explanation.`;

    const userContent: Array<Record<string, unknown>> = [
      {
        type: "text",
        text: `Analyze this product:\nTitle: ${title || "Unknown"}\nDescription: ${description || "N/A"}\nType: ${productType || "N/A"}\n\nReturn a JSON object with all applicable fields.`,
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
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
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

    // Parse response — plain JSON (no tool calling)
    let analysis: Record<string, unknown> | null = null;

    // Try tool_calls first (backward compat if model returns them)
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        analysis = JSON.parse(toolCall.function.arguments);
      } catch {}
    }

    // Try plain content
    if (!analysis) {
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        try {
          // Strip markdown fences if present
          const cleaned = content.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim();
          analysis = JSON.parse(cleaned);
        } catch (e) {
          console.error("Failed to parse JSON from content:", e, content?.substring(0, 200));
        }
      }
    }

    if (!analysis) {
      return new Response(JSON.stringify({ error: "No analysis result" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Post-processing: title-based category fallback
    applyCategoryFallback(analysis, title || "");

    // Normalize booleans
    if (typeof analysis.packagingRelevant === "string") {
      analysis.packagingRelevant = analysis.packagingRelevant === "true";
    }
    if (typeof analysis.personCompatible === "string") {
      analysis.personCompatible = analysis.personCompatible === "true";
    }

    // Stamp version so client can invalidate stale caches
    analysis.version = 2;

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
