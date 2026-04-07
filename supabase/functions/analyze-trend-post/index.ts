import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const ANALYSIS_SCHEMA = {
  name: "extract_visual_direction",
  description: "Extract high-level visual direction from a product/lifestyle image for AI image generation. Do NOT replicate the exact image. Extract only reusable aesthetic signals with maximum precision for prompt engineering.",
  parameters: {
    type: "object",
    properties: {
      category: { type: "string", description: "Product category (e.g. skincare, jewelry, fashion, food, home decor)" },
      subcategory: { type: "string", description: "More specific subcategory (e.g. serum, ring, sneaker)" },
      scene_type: { type: "string", description: "Scene archetype: studio, lifestyle, editorial, flatlay, environmental, abstract" },
      palette: { type: "array", items: { type: "string" }, description: "Dominant color palette as descriptive names (e.g. 'warm sand', 'deep navy', 'blush pink')" },
      dominant_colors: { type: "array", items: { type: "string" }, description: "Hex codes or precise color names of the 3-5 most prominent colors" },
      lighting_type: { type: "string", description: "Primary lighting setup: soft diffused, harsh directional, golden hour, rim-lit, backlit, overhead flat, dramatic side-light, window light, studio strobe" },
      light_direction: { type: "string", description: "Where light comes from: top-left, top-right, frontal, side, back, overhead, 45-degree key" },
      shadow_softness: { type: "string", description: "Shadow quality: razor-sharp, crisp, medium-soft, very soft/diffused, barely visible" },
      depth_of_field: { type: "string", description: "Focus behavior: ultra-shallow (f/1.4 bokeh), shallow (f/2.8), medium (f/5.6), deep (f/11+), tilt-shift selective" },
      background_type: { type: "string", description: "Background family: seamless paper, fabric drape, gradient, solid color, environmental, bokeh blur, abstract" },
      background_detail: { type: "string", description: "Specific background description: e.g. 'crumpled linen in warm cream', 'smooth concrete with subtle grain', 'out-of-focus greenery with warm bokeh circles'" },
      environment_type: { type: "string", description: "Setting: bathroom counter, kitchen marble, outdoor terrace, studio infinity cove, bedroom vanity, café table" },
      crop_type: { type: "string", description: "Framing: tight product close-up, medium with breathing room, wide environmental, macro detail" },
      camera_angle: { type: "string", description: "Viewpoint: eye-level, slightly above (15°), overhead (45°), top-down flat, low angle hero, three-quarter" },
      framing_style: { type: "string", description: "Composition approach: centered hero, rule-of-thirds, asymmetric, diagonal, floating, layered depth" },
      composition_logic: { type: "string", description: "Layout strategy: single hero product centered, grouped arrangement, scattered organic, stacked/nested, in-use context" },
      product_placement: { type: "string", description: "How product sits in frame: dead-center, left-third, right-third, foreground with context behind, floating/suspended" },
      negative_space: { type: "string", description: "Amount of empty space: minimal (product fills frame), moderate (30-40% breathing room), generous (60%+ clean space)" },
      props: { type: "array", items: { type: "string" }, description: "Supporting objects: fresh flowers, water droplets, fabric swatch, citrus slices, greenery, stones" },
      material_cues: { type: "array", items: { type: "string" }, description: "Materials visible: glass, ceramic, brushed metal, velvet, marble, wood grain, concrete" },
      surface_cues: { type: "array", items: { type: "string" }, description: "Surface the product rests on: polished marble slab, raw linen, wet stone, frosted glass, reflective acrylic" },
      texture_detail: { type: "string", description: "Dominant texture quality: ultra-glossy/reflective, satin/semi-matte, matte/powdery, rough/organic, mixed textures" },
      reflections: { type: "string", description: "Reflection behavior: none, subtle surface reflection, prominent mirror-like reflection, caustics/light patterns, wet-look reflections" },
      color_grading: { type: "string", description: "Post-processing color treatment: warm golden tones, cool blue-silver, neutral/true-to-life, desaturated editorial, high-contrast cinematic, pastel-lifted shadows" },
      contrast_level: { type: "string", description: "Tonal contrast: low/flat (airy), medium (balanced), high (punchy), extreme (dramatic darks)" },
      saturation_level: { type: "string", description: "Color intensity: desaturated/muted, natural, slightly boosted, vibrant/rich, hyper-saturated" },
      styling_tone: { type: "string", description: "Overall styling direction: clinical-clean, luxe-editorial, organic-natural, minimalist-zen, maximalist, playful-pop, heritage-classic" },
      mood: { type: "string", description: "Emotional atmosphere: serene, energetic, luxurious, intimate, fresh, mysterious, celebratory, raw/authentic" },
      premium_cues: { type: "array", items: { type: "string" }, description: "Signals of quality/luxury: gold accents, selective focus, high-key lighting, monochromatic palette, negative space, material richness" },
      realism_level: { type: "string", description: "How photographic: hyper-real photograph, slightly stylized, heavily edited/retouched, illustration-like" },
      key_visual_elements: { type: "array", items: { type: "string" }, description: "Most striking visual details that make this image stand out: e.g. 'water droplets catching light on glass bottle', 'dramatic shadow lines from window blinds', 'steam rising from product'" },
      has_model: { type: "boolean" },
      has_hands: { type: "boolean" },
      has_packaging: { type: "boolean" },
      image_mode: { type: "string", description: "product-only or lifestyle" },
      avoid_terms: { type: "array", items: { type: "string" }, description: "Things to NOT include in generation: brand logos, specific celebrity features, copyrighted designs" },
      short_summary: { type: "string", description: "2-3 sentence description of the visual direction suitable for prompting an image generation AI. Focus on actionable visual details." },
      recommended_scene_name: { type: "string", description: "A short evocative name for this scene style (e.g. 'Golden Hour Marble', 'Wet Stone Minimalist')" },
      recommended_aesthetic_family: { type: "string", description: "Broader aesthetic grouping: clean-minimal, warm-organic, dark-luxe, bright-editorial, moody-cinematic" },
    },
    required: ["category", "scene_type", "lighting_type", "mood", "short_summary", "depth_of_field", "color_grading", "texture_detail"],
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
            content: `You are an expert visual direction analyst for VOVV, an AI product photography platform.
Your job: extract PRECISE, ACTIONABLE visual signals from reference images so they can be used to generate new product photos via AI image generation.

CRITICAL RULES:
- Be extremely specific about lighting setup (not just "soft" — describe the direction, quality, falloff)
- Describe depth of field precisely (f-stop equivalent, bokeh character)
- Note exact surface interactions: how light hits materials, reflections, caustics
- Describe color grading in post-production terms (lifted shadows, crushed blacks, split toning)
- Capture texture at a granular level: is glass surface frosted or polished? Is the fabric woven or knit?
- Note every compositional detail: where exactly in the frame is the product, what's the ratio of product to negative space
- Describe the background with enough detail to recreate it (not just "blurred" — what's behind and how blurred)
- Extract mood through concrete visual attributes, not vague feelings

DO NOT: Include brand names, logos, celebrity likenesses, or exact copyrighted elements.
Focus on: palette, lighting setup, surface interactions, depth of field, color grading, texture, composition, prop language, premium cues, mood.`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: `Analyze this image and extract detailed structured visual direction for AI image generation. Be as specific and granular as possible — every detail matters for prompt engineering. Caption context: ${post.caption?.slice(0, 500) || "none"}` },
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
        depth_of_field: analysis.depth_of_field || "",
        color_grading: analysis.color_grading || "",
        texture_detail: analysis.texture_detail || "",
        reflections: analysis.reflections || "",
        contrast_level: analysis.contrast_level || "",
        saturation_level: analysis.saturation_level || "",
        key_visual_elements: analysis.key_visual_elements || [],
        negative_space: analysis.negative_space || "",
        product_placement: analysis.product_placement || "",
        background_detail: analysis.background_detail || "",
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
