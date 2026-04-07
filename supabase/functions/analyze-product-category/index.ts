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

    const systemPrompt = `You are a product analysis AI for a premium ecommerce photography platform. Analyze the product image and metadata to extract rich visual, semantic, and category-specific attributes.

Return ALL applicable fields. For category-specific fields, ONLY return the ones relevant to the detected category (e.g. fragranceFamily only for fragrances, garmentType only for fashion).

GLOBAL VISUAL (always return):
- category: product category
- sizeClass: physical size
- productSubcategory: more specific type within category
- productForm: physical form (bottle, tube, jar, box, garment, device, etc.)
- productSilhouette: outline shape description
- productMainHex: dominant color as hex
- productSecondaryHex: secondary color as hex
- productAccentHex: accent/highlight color as hex
- backgroundBaseHex: suggested ideal background color as hex
- backgroundSecondaryHex: suggested secondary background as hex
- shadowToneHex: ideal shadow tone as hex
- productFinishType: surface finish (matte, glossy, satin, metallic, textured, frosted)
- materialPrimary: main material
- materialSecondary: secondary material if visible
- textureType: surface texture description
- transparencyType: none, translucent, transparent, frosted
- metalTone: if metallic elements exist (gold, silver, rose-gold, bronze, gunmetal, chrome)
- heroFeature: the single most photogenic/marketable feature
- detailFocusAreas: comma-separated areas worth macro shots
- scaleType: tiny, palm-sized, handheld, carried, worn, furniture-scale
- wearabilityMode: how product is used (held, worn-neck, worn-wrist, carried, placed, applied, consumed)
- bodyPlacementSuggested: where on body/in space the product naturally goes
- colorFamily: primary color description
- materialFamily: primary material family
- finish: surface finish
- packagingRelevant: boolean
- personCompatible: boolean
- accentColor: dominant accent hex

GLOBAL SEMANTIC (return when applicable — leave empty string if truly not relevant):
- ingredientFamilyPrimary: primary ingredient/material family (e.g. "citrus", "floral", "botanical", "grain")
- ingredientFamilySecondary: secondary ingredient family
- fruitsRelated: visually related fruits for styling (e.g. "blood orange, bergamot")
- flowersRelated: visually related flowers for styling (e.g. "white rose, jasmine, peony")
- botanicalsRelated: related botanicals/herbs
- woodsRelated: related wood types for styling props
- spicesRelated: related spices
- greensRelated: related greenery/leaves
- materialsRelated: related styling materials (silk, linen, stone)
- regionRelated: geographic/cultural association
- landscapeRelated: landscape association for lifestyle shots

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

Use the IMAGE as primary signal. Be vivid and specific. All hex colors must be valid (#RRGGBB).`;

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

    const allProps: Record<string, any> = {
      // Global required
      category: {
        type: "string",
        enum: [
          "fragrance", "beauty-skincare", "makeup-lipsticks",
          "bags-accessories", "hats-small", "shoes",
          "garments", "home-decor", "tech-devices",
          "food-beverage", "supplements-wellness", "other",
        ],
      },
      sizeClass: { type: "string", enum: ["very-small", "small", "medium", "large", "extra-large"] },
      colorFamily: { type: "string" },
      materialFamily: { type: "string" },
      finish: { type: "string" },
      packagingRelevant: { type: "boolean" },
      personCompatible: { type: "boolean" },
      accentColor: { type: "string" },
      // Global visual
      productSubcategory: { type: "string" },
      productForm: { type: "string" },
      productSilhouette: { type: "string" },
      productMainHex: { type: "string" },
      productSecondaryHex: { type: "string" },
      productAccentHex: { type: "string" },
      backgroundBaseHex: { type: "string" },
      backgroundSecondaryHex: { type: "string" },
      shadowToneHex: { type: "string" },
      productFinishType: { type: "string" },
      materialPrimary: { type: "string" },
      materialSecondary: { type: "string" },
      textureType: { type: "string" },
      transparencyType: { type: "string", enum: ["none", "translucent", "transparent", "frosted"] },
      metalTone: { type: "string" },
      heroFeature: { type: "string" },
      detailFocusAreas: { type: "string" },
      scaleType: { type: "string" },
      wearabilityMode: { type: "string" },
      bodyPlacementSuggested: { type: "string" },
      // Global semantic
      ingredientFamilyPrimary: { type: "string" },
      ingredientFamilySecondary: { type: "string" },
      fruitsRelated: { type: "string" },
      flowersRelated: { type: "string" },
      botanicalsRelated: { type: "string" },
      woodsRelated: { type: "string" },
      spicesRelated: { type: "string" },
      greensRelated: { type: "string" },
      materialsRelated: { type: "string" },
      regionRelated: { type: "string" },
      landscapeRelated: { type: "string" },
      // Category-specific (all optional)
      garmentType: { type: "string" }, fitType: { type: "string" }, fabricType: { type: "string" }, fabricWeight: { type: "string" }, drapeBehavior: { type: "string" },
      packagingType: { type: "string" }, formulaType: { type: "string" }, formulaTexture: { type: "string" }, applicationMode: { type: "string" }, skinAreaSuggested: { type: "string" },
      fragranceFamily: { type: "string" }, bottleType: { type: "string" }, capStyle: { type: "string" }, liquidColorHex: { type: "string" }, glassTintType: { type: "string" }, noteObjectsPrimary: { type: "string" }, noteObjectsSecondary: { type: "string" }, scentWorld: { type: "string" },
      jewelryType: { type: "string" }, gemType: { type: "string" }, gemColorHex: { type: "string" }, metalPrimary: { type: "string" }, metalFinish: { type: "string" }, wearPlacement: { type: "string" }, sparkleLevel: { type: "string" },
      accessoryType: { type: "string" }, carryMode: { type: "string" }, strapType: { type: "string" }, hardwareType: { type: "string" }, hardwareFinish: { type: "string" }, structureType: { type: "string" }, signatureDetail: { type: "string" },
      decorType: { type: "string" }, placementType: { type: "string" }, objectScale: { type: "string" }, baseMaterial: { type: "string" }, surfaceFinish: { type: "string" }, roomContextSuggested: { type: "string" }, stylingCompanions: { type: "string" },
      foodType: { type: "string" }, servingMode: { type: "string" }, ingredientObjectsPrimary: { type: "string" }, ingredientObjectsSecondary: { type: "string" }, textureCue: { type: "string" }, temperatureCue: { type: "string" }, consumptionContext: { type: "string" },
      deviceType: { type: "string" }, interfaceType: { type: "string" }, screenPresence: { type: "string" }, screenStateSuggested: { type: "string" }, finishMaterialPrimary: { type: "string" }, industrialStyle: { type: "string" }, portDetail: { type: "string" }, buttonDetail: { type: "string" },
      sportType: { type: "string" }, gearType: { type: "string" }, performanceMaterial: { type: "string" }, gripTexture: { type: "string" }, motionCue: { type: "string" }, usageContext: { type: "string" }, surfaceContext: { type: "string" },
      supplementType: { type: "string" }, dosageForm: { type: "string" }, mixingMode: { type: "string" }, wellnessIngredientObjects: { type: "string" }, containerType: { type: "string" }, clinicalCleanlinessLevel: { type: "string" }, routineContext: { type: "string" },
    };

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
        tools: [
          {
            type: "function",
            function: {
              name: "classify_product",
              description: "Classify a product and extract all visual, semantic, and category-specific tokens",
              parameters: {
                type: "object",
                properties: allProps,
                required: ["category", "sizeClass", "colorFamily", "materialFamily", "finish", "packagingRelevant", "personCompatible", "accentColor", "productMainHex", "materialPrimary", "heroFeature"],
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
