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
    const userId = userData.user.id;

    const body = await req.json();
    const { image_urls, workflow_type = "animate" } = body;

    if (!image_urls || !Array.isArray(image_urls) || image_urls.length === 0) {
      throw new Error("image_urls array is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build analysis prompt based on single vs multiple images
    const isSingle = image_urls.length === 1;
    
    const systemPrompt = `You are a structured vision parser for a video generation system. You MUST return deterministic structured analysis of uploaded images. Do NOT generate creative concepts, prompt ideas, or cinematic descriptions. Only describe what you see and classify it.`;

    const userContent: unknown[] = [];

    // Add images
    for (const url of image_urls) {
      userContent.push({
        type: "image_url",
        image_url: { url },
      });
    }

    // Add analysis instruction
    if (isSingle) {
      userContent.push({
        type: "text",
        text: `Analyze this image and return structured JSON. Extract: subject_category (product/person/scene/food/architecture/vehicle/abstract), scene_type (studio/outdoor/indoor/lifestyle/abstract), shot_type (close-up/medium/wide/detail/full-body), camera_angle (front/three-quarter/side/top-down/low-angle), lighting_style (soft diffused/hard directional/natural/studio/dramatic/flat), mood (minimal/luxury/energetic/warm/cool/dramatic/neutral), motion_recommendation (slow_push_in/camera_drift/product_orbit/gentle_pan/premium_handheld/minimal), identity_sensitive (boolean - true if there is a person whose face is prominent), scene_complexity (low/medium/high), risk_flags object with: busy_background (boolean), text_present (boolean), multiple_people (boolean), low_resolution (boolean - true if image appears pixelated), transparent_png (boolean - true if background appears transparent/checkered).`,
      });
    } else {
      userContent.push({
        type: "text",
        text: `Analyze these ${image_urls.length} images as a sequence. For each image, extract subject_category, scene_type, shot_type, camera_angle, lighting_style, mood, motion_recommendation, identity_sensitive, scene_complexity, risk_flags. Then also assess: continuity_score (0-100, how well they work as a sequence), best_order (array of 0-indexed positions), shot_roles (array of role assignments: opening_hero/detail_reveal/transition/closing), mismatch_warnings (array of warning strings about inconsistencies).`,
      });
    }

    // Call Lovable AI with tool calling for structured output
    const analysisTools = [
      {
        type: "function",
        function: {
          name: isSingle ? "analyze_single_image" : "analyze_image_sequence",
          description: isSingle
            ? "Return structured analysis of a single image for video generation"
            : "Return structured analysis of multiple images for video sequence generation",
          parameters: isSingle
            ? {
                type: "object",
                properties: {
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
                    },
                    required: ["busy_background", "text_present", "multiple_people", "low_resolution", "transparent_png"],
                  },
                },
                required: ["subject_category", "scene_type", "shot_type", "camera_angle", "lighting_style", "mood", "motion_recommendation", "identity_sensitive", "scene_complexity", "risk_flags"],
              }
            : {
                type: "object",
                properties: {
                  frames: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        subject_category: { type: "string" },
                        scene_type: { type: "string" },
                        shot_type: { type: "string" },
                        camera_angle: { type: "string" },
                        lighting_style: { type: "string" },
                        mood: { type: "string" },
                        motion_recommendation: { type: "string" },
                        identity_sensitive: { type: "boolean" },
                        scene_complexity: { type: "string" },
                        risk_flags: {
                          type: "object",
                          properties: {
                            busy_background: { type: "boolean" },
                            text_present: { type: "boolean" },
                            multiple_people: { type: "boolean" },
                            low_resolution: { type: "boolean" },
                            transparent_png: { type: "boolean" },
                          },
                        },
                      },
                    },
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
