import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const ANALYSIS_SCHEMA = {
  name: "extract_visual_direction",
  description: "Extract high-level visual direction from a product/lifestyle image. Do NOT replicate the exact image. Extract only reusable aesthetic signals.",
  parameters: {
    type: "object",
    properties: {
      category: { type: "string" },
      subcategory: { type: "string" },
      scene_type: { type: "string" },
      palette: { type: "array", items: { type: "string" } },
      dominant_colors: { type: "array", items: { type: "string" } },
      lighting_type: { type: "string" },
      light_direction: { type: "string" },
      shadow_softness: { type: "string" },
      background_type: { type: "string" },
      environment_type: { type: "string" },
      crop_type: { type: "string" },
      camera_angle: { type: "string" },
      framing_style: { type: "string" },
      composition_logic: { type: "string" },
      props: { type: "array", items: { type: "string" } },
      material_cues: { type: "array", items: { type: "string" } },
      surface_cues: { type: "array", items: { type: "string" } },
      styling_tone: { type: "string" },
      mood: { type: "string" },
      premium_cues: { type: "array", items: { type: "string" } },
      realism_level: { type: "string" },
      has_model: { type: "boolean" },
      has_hands: { type: "boolean" },
      has_packaging: { type: "boolean" },
      image_mode: { type: "string", description: "product-only or lifestyle" },
      avoid_terms: { type: "array", items: { type: "string" } },
      short_summary: { type: "string" },
      recommended_scene_name: { type: "string" },
      recommended_aesthetic_family: { type: "string" },
    },
    required: ["category", "scene_type", "lighting_type", "mood", "short_summary"],
  },
};

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

    // Fetch the post
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

    // Call Lovable AI (Gemini) for analysis
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not set" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://ai.lovable.dev/api/v1/chat/completions", {
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
            content: `You are a visual direction analyst for a product photography AI platform called VOVV.
Analyze the provided image and extract high-level visual direction signals.
IMPORTANT: Do NOT aim to recreate the exact image. Extract only reusable aesthetic signals.
Do NOT include brand names, logos, celebrity likenesses, or exact copyrighted elements.
Focus on: palette, lighting, background family, crop style, composition logic, prop language, premium cues, mood, styling tone.`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: `Analyze this image and extract structured visual direction. Caption context: ${post.caption?.slice(0, 500) || "none"}` },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        tools: [{
          type: "function",
          function: ANALYSIS_SCHEMA,
        }],
        tool_choice: { type: "function", function: { name: "extract_visual_direction" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`AI API error: ${aiResponse.status} ${errText}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let analysis: any = {};

    if (toolCall?.function?.arguments) {
      analysis = typeof toolCall.function.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    }

    // Store analysis
    const { data: savedAnalysis, error: saveError } = await supabaseAdmin
      .from("reference_analyses")
      .insert({
        watch_post_id,
        category: analysis.category || "",
        subcategory: analysis.subcategory || "",
        scene_type: analysis.scene_type || "",
        palette: analysis.palette || [],
        dominant_colors: analysis.dominant_colors || [],
        lighting_type: analysis.lighting_type || "",
        light_direction: analysis.light_direction || "",
        shadow_softness: analysis.shadow_softness || "",
        background_type: analysis.background_type || "",
        environment_type: analysis.environment_type || "",
        crop_type: analysis.crop_type || "",
        camera_angle: analysis.camera_angle || "",
        framing_style: analysis.framing_style || "",
        composition_logic: analysis.composition_logic || "",
        props: analysis.props || [],
        material_cues: analysis.material_cues || [],
        surface_cues: analysis.surface_cues || [],
        styling_tone: analysis.styling_tone || "",
        mood: analysis.mood || "",
        premium_cues: analysis.premium_cues || [],
        realism_level: analysis.realism_level || "",
        has_model: analysis.has_model || false,
        has_hands: analysis.has_hands || false,
        has_packaging: analysis.has_packaging || false,
        image_mode: analysis.image_mode || "",
        avoid_terms: analysis.avoid_terms || [],
        short_summary: analysis.short_summary || "",
        recommended_scene_name: analysis.recommended_scene_name || "",
        recommended_aesthetic_family: analysis.recommended_aesthetic_family || "",
        raw_analysis_json: analysis,
      })
      .select()
      .single();

    if (saveError) throw new Error(`Save error: ${saveError.message}`);

    return new Response(JSON.stringify({ success: true, analysis: savedAnalysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
