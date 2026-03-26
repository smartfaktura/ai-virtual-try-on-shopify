import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData?.user) throw new Error("Unauthorized");

    const body = await req.json();
    const { image_urls, workflow_type = "animate" } = body;

    if (!image_urls || !Array.isArray(image_urls) || image_urls.length === 0) {
      throw new Error("image_urls array is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isSingle = image_urls.length === 1;

    const systemPrompt = `You are a structured vision parser for an ecommerce video generation system. Analyze uploaded images and classify them for commercial video production.

You MUST identify:
1. The ecommerce product category (fashion, beauty, fragrances, jewelry, accessories, home decor, food/beverage, electronics, sports/fitness, health/supplements)
2. The scene type (studio product, on-model, lifestyle, hand-held, flat lay, macro close-up, interior room, action scene, food plated, device on desk, talking portrait)
3. Whether a person is present and what interactive objects exist
4. What realistic motion would work best for a commercial video
5. What preservation risks exist (identity, product details, background stability)

CRITICAL OBJECT GROUNDING RULES:
- You MUST report ONLY objects that are actually visible in the image. Do NOT infer products from category alone.
- visible_product_detected: set to true ONLY if a distinct product/object (bottle, package, garment on display, device, etc.) is clearly visible. A person wearing clothes does NOT count as a visible product unless the garment is the clear focal subject.
- visible_object_list: list ONLY objects you can literally see in frame. Examples: "perfume bottle", "sneaker", "lipstick tube", "basketball". If the image is just a person with no distinct product, return an empty array.
- product_interaction_visible: true ONLY if someone is physically holding, touching, or directly interacting with a product/object in the image.
- Do NOT assume a product exists just because the category is "beauty" or "fashion". Analyze what is actually in the image.

Return deterministic structured analysis. Do NOT generate creative concepts or cinematic descriptions. Only describe and classify what you see.`;

    const userContent: unknown[] = [];

    for (const url of image_urls) {
      userContent.push({ type: "image_url", image_url: { url } });
    }

    if (isSingle) {
      userContent.push({
        type: "text",
        text: `Analyze this image for ecommerce video generation. Classify the product category, scene type, subject type, and recommend the best motion approach for a commercial product video. Identify any interactive objects (balls, cups, bottles, etc.) and assess preservation risks. IMPORTANT: For visible_product_detected and visible_object_list, report ONLY what is literally visible in the image — do not infer from category.`,
      });
    } else {
      userContent.push({
        type: "text",
        text: `Analyze these ${image_urls.length} images as a sequence for ecommerce video. For each image, classify category, scene type, and motion recommendations. Assess continuity. Report only visible objects — do not infer from category.`,
      });
    }

    const singleToolSchema = {
      type: "object",
      properties: {
        // Legacy fields (backward compat)
        subject_category: { type: "string", enum: ["product", "person", "scene", "food", "architecture", "vehicle", "abstract"] },
        scene_type: { type: "string", enum: ["studio", "outdoor", "indoor", "lifestyle", "abstract"] },
        shot_type: { type: "string", enum: ["close-up", "medium", "wide", "detail", "full-body"] },
        camera_angle: { type: "string", enum: ["front", "three-quarter", "side", "top-down", "low-angle"] },
        lighting_style: { type: "string", enum: ["soft diffused", "hard directional", "natural", "studio", "dramatic", "flat"] },
        mood: { type: "string", enum: ["minimal", "luxury", "energetic", "warm", "cool", "dramatic", "neutral"] },
        motion_recommendation: { type: "string", enum: ["slow_push_in", "camera_drift", "product_orbit", "gentle_pan", "premium_handheld", "minimal"] },
        identity_sensitive: { type: "boolean" },
        scene_complexity: { type: "string", enum: ["low", "medium", "high"] },
        risk_flags: {
          type: "object",
          properties: {
            busy_background: { type: "boolean" },
            text_present: { type: "boolean" },
            multiple_people: { type: "boolean" },
            low_resolution: { type: "boolean" },
            transparent_png: { type: "boolean" },
            identity_sensitive: { type: "boolean" },
            product_detail_sensitive: { type: "boolean" },
            background_should_stay_static: { type: "boolean" },
          },
          required: ["busy_background", "text_present", "multiple_people", "low_resolution", "transparent_png", "identity_sensitive", "product_detail_sensitive", "background_should_stay_static"],
        },
        // Ecommerce fields
        category: {
          type: "string",
          enum: ["fashion_apparel", "beauty_skincare", "fragrances", "jewelry", "accessories", "home_decor", "food_beverage", "electronics", "sports_fitness", "health_supplements"],
          description: "Ecommerce product category"
        },
        ecommerce_scene_type: {
          type: "string",
          enum: ["studio_product", "on_model", "lifestyle_scene", "hand_held", "flat_lay", "macro_closeup", "interior_room", "action_scene", "food_plated", "device_on_desk", "talking_portrait"],
          description: "Ecommerce scene classification"
        },
        subject_type: { type: "string", description: "e.g. athlete_with_object, skincare_bottle, fashion_model" },
        has_person: { type: "boolean" },
        interactive_object: { type: "string", description: "e.g. basketball, wine_glass, lipstick, null if none" },
        // Object grounding fields
        visible_product_detected: {
          type: "boolean",
          description: "Is a distinct product or object clearly visible in the image? A person wearing clothes alone does NOT count. Must be a focal product like a bottle, device, package, shoe, etc."
        },
        visible_object_list: {
          type: "array",
          items: { type: "string" },
          description: "List of objects literally visible in the image. Only include what you can see — do NOT infer from category. Empty array if no distinct objects."
        },
        product_interaction_visible: {
          type: "boolean",
          description: "Is someone physically holding, touching, or interacting with a product/object in the image?"
        },
        // Motion recommendations
        recommended_motion_goals: {
          type: "array",
          items: { type: "string" },
          description: "Up to 3 motion goal IDs from the registry that best fit this image"
        },
        recommended_camera_motion: { type: "string", enum: ["static", "slow_push_in", "gentle_pan", "camera_drift", "premium_handheld", "orbit"] },
        recommended_subject_motion: { type: "string", enum: ["minimal", "natural_pose_shift", "action_motion", "hand_object_interaction", "hair_fabric", "auto"] },
        recommended_realism: { type: "string", enum: ["ultra_realistic", "realistic", "slightly_stylized"] },
        recommended_loop_style: { type: "string", enum: ["none", "short_repeatable", "seamless_loop", "one_natural"] },
      },
      required: [
        "subject_category", "scene_type", "shot_type", "camera_angle", "lighting_style",
        "mood", "motion_recommendation", "identity_sensitive", "scene_complexity", "risk_flags",
        "category", "ecommerce_scene_type", "subject_type", "has_person",
        "visible_product_detected", "visible_object_list", "product_interaction_visible",
        "recommended_motion_goals", "recommended_camera_motion", "recommended_subject_motion",
        "recommended_realism", "recommended_loop_style"
      ],
    };

    const analysisTools = [
      {
        type: "function",
        function: {
          name: isSingle ? "analyze_single_image" : "analyze_image_sequence",
          description: isSingle
            ? "Return structured ecommerce-aware analysis of a single image for video generation"
            : "Return structured analysis of multiple images for video sequence generation",
          parameters: isSingle
            ? singleToolSchema
            : {
                type: "object",
                properties: {
                  frames: {
                    type: "array",
                    items: singleToolSchema,
                  },
                  continuity_score: { type: "number" },
                  best_order: { type: "array", items: { type: "number" } },
                  shot_roles: { type: "array", items: { type: "string" } },
                  mismatch_warnings: { type: "array", items: { type: "string" } },
                },
                required: ["frames", "continuity_score", "best_order", "shot_roles", "mismatch_warnings"],
              },
        },
      },
    ];

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        tools: analysisTools,
        tool_choice: {
          type: "function",
          function: { name: isSingle ? "analyze_single_image" : "analyze_image_sequence" },
        },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("[analyze-video-input] AI gateway error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI analysis failed");
    }

    const aiResult = await aiResponse.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("AI did not return structured analysis");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ analysis, workflow_type }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[analyze-video-input] Error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
