import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const ANALYSIS_FIELDS = [
  "category", "subcategory", "scene_type", "palette", "dominant_colors",
  "lighting_type", "light_direction", "shadow_softness", "depth_of_field",
  "background_type", "background_detail", "environment_type", "crop_type",
  "camera_angle", "framing_style", "composition_logic", "product_placement",
  "negative_space", "props", "material_cues", "surface_cues", "texture_detail",
  "reflections", "color_grading", "contrast_level", "saturation_level",
  "styling_tone", "mood", "premium_cues", "realism_level", "key_visual_elements",
  "has_model", "has_hands", "has_packaging", "image_mode", "avoid_terms",
  "short_summary", "recommended_scene_name", "recommended_aesthetic_family",
];

function extractJson(text: string): any {
  // Try fenced code block first
  const fenced = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (fenced) {
    return JSON.parse(fenced[1].trim());
  }
  // Try raw JSON object
  const braceStart = text.indexOf("{");
  const braceEnd = text.lastIndexOf("}");
  if (braceStart !== -1 && braceEnd > braceStart) {
    return JSON.parse(text.slice(braceStart, braceEnd + 1));
  }
  throw new Error("No JSON object found in AI response");
}

function normalize(raw: any): Record<string, any> {
  const result: Record<string, any> = {};
  const arrayFields = new Set([
    "palette", "dominant_colors", "props", "material_cues", "surface_cues",
    "premium_cues", "key_visual_elements", "avoid_terms",
  ]);
  const boolFields = new Set(["has_model", "has_hands", "has_packaging"]);

  for (const field of ANALYSIS_FIELDS) {
    const val = raw[field];
    if (boolFields.has(field)) {
      result[field] = val === true;
    } else if (arrayFields.has(field)) {
      result[field] = Array.isArray(val) ? val : [];
    } else {
      result[field] = typeof val === "string" ? val : "";
    }
  }
  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await createClient(
      supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!
    ).auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { watch_post_id } = await req.json();
    if (!watch_post_id) {
      return new Response(JSON.stringify({ error: "watch_post_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: post, error: postError } = await supabaseAdmin
      .from("watch_posts").select("*").eq("id", watch_post_id).single();

    if (postError || !post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageUrl = post.media_url || post.thumbnail_url;
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "No image URL for this post" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not set" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use plain JSON prompt instead of tool-calling to avoid schema-too-complex errors
    const fieldDescriptions = `Return a JSON object with these fields:
- category (string): Product category e.g. skincare, jewelry, fashion
- subcategory (string): More specific e.g. serum, ring, sneaker
- scene_type (string): studio, lifestyle, editorial, flatlay, environmental, abstract
- palette (string[]): Dominant colors as descriptive names
- dominant_colors (string[]): Hex codes or precise color names of 3-5 most prominent colors
- lighting_type (string): Primary lighting setup
- light_direction (string): Where light comes from
- shadow_softness (string): Shadow quality
- depth_of_field (string): Focus behavior with f-stop equivalent
- background_type (string): Background family
- background_detail (string): Specific background description
- environment_type (string): Setting description
- crop_type (string): Framing type
- camera_angle (string): Viewpoint
- framing_style (string): Composition approach
- composition_logic (string): Layout strategy
- product_placement (string): How product sits in frame
- negative_space (string): Amount of empty space
- props (string[]): Supporting objects
- material_cues (string[]): Materials visible
- surface_cues (string[]): Surface the product rests on
- texture_detail (string): Dominant texture quality
- reflections (string): Reflection behavior
- color_grading (string): Post-processing color treatment
- contrast_level (string): Tonal contrast
- saturation_level (string): Color intensity
- styling_tone (string): Overall styling direction
- mood (string): Emotional atmosphere
- premium_cues (string[]): Signals of quality/luxury
- realism_level (string): How photographic
- key_visual_elements (string[]): Most striking visual details
- has_model (boolean): Whether a human model is present
- has_hands (boolean): Whether hands are visible
- has_packaging (boolean): Whether product packaging is visible
- image_mode (string): product-only or lifestyle
- avoid_terms (string[]): Things to NOT include in generation
- short_summary (string): 2-3 sentence visual direction summary for prompt engineering
- recommended_scene_name (string): Short evocative name for this scene style
- recommended_aesthetic_family (string): Broader aesthetic grouping`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert visual direction analyst for AI product photography. Extract PRECISE, ACTIONABLE visual signals from reference images for AI image generation prompt engineering.

Be extremely specific about lighting, depth of field, color grading, textures, composition, and mood. DO NOT include brand names, logos, or copyrighted elements.

IMPORTANT: Respond with ONLY a valid JSON object. No markdown, no explanation, just the JSON.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this image and extract detailed structured visual direction.\n\n${fieldDescriptions}\n\nCaption context: ${post.caption?.slice(0, 500) || "none"}\n\nRespond with ONLY the JSON object.`,
              },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("AI returned empty response");
    }

    let rawAnalysis: any;
    try {
      rawAnalysis = extractJson(content);
    } catch (parseErr) {
      console.error("Failed to parse AI output:", content.slice(0, 500));
      throw new Error("AI returned invalid JSON — please retry");
    }

    const analysis = normalize(rawAnalysis);

    const { data: savedAnalysis, error: saveError } = await supabaseAdmin
      .from("reference_analyses")
      .insert({
        watch_post_id,
        ...analysis,
        raw_analysis_json: rawAnalysis,
      })
      .select()
      .single();

    if (saveError) throw new Error(`Save error: ${saveError.message}`);

    return new Response(JSON.stringify({ success: true, analysis: savedAnalysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-trend-post error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
