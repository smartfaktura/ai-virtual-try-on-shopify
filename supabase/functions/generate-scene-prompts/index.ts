import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EXAMPLE_PROMPT = `High-end editorial product shot featuring a single {product} positioned between two rough volcanic rocks, suspended or naturally supported in a narrow gap, creating a sense of tension and balance. The rocks are dark, porous, and highly textured, with sharp edges and irregular surfaces, framing the {product} from both sides without overpowering it.

Background is a seamless studio gradient with a soft vertical or slightly diagonal color fade, transitioning from warm saturated tones at the bottom to cooler desaturated tones at the top. Color palette can follow a refined gradient such as: deep warm coral/red #E4572E at the base fading through soft peach #F3A683 into a muted sky blue #AFCBFF or pale neutral #EAF2F8 toward the upper area. The gradient is smooth and softly blended with no hard transitions, creating a clean editorial backdrop.

Lighting is controlled and directional, coming from slightly above and to the side, creating defined highlights on the {product} and strong texture visibility on the rocks while maintaining soft shadow falloff. Subtle rim lighting separates the {product} from the darker rock edges.

The {product} is the sharp focal point, with crisp detail and clear readability, while the rocks maintain high texture clarity with slight depth separation. Composition is slightly dynamic, with the {product} subtly angled rather than perfectly straight, enhancing editorial feel.

Shot with an 85mm lens or macro perspective, shallow depth of field, high-detail rendering. Materials are highly realistic, including rock surface roughness, product reflections, and subtle lighting imperfections.

Editorial campaign style — bold, minimal, and sculptural, combining raw natural textures with refined gradient color background for a modern, high-end commercial look.`;

const EXAMPLE_TOKEN_PROMPT = `High-end editorial product shot featuring {{productName}} positioned between two rough volcanic rocks, suspended or naturally supported in a narrow gap. The {{materialPrimary}} body of the product catches light beautifully against the dark, porous stone.

{{background}}. Color palette harmonizes with the product's {{productMainHex}} tone, transitioning through complementary shades to {{backgroundSecondaryHex}} in the upper area. The gradient is smooth and softly blended with no hard transitions.

{{lightingDirective}}. Subtle rim lighting separates {{productName}} from the darker rock edges. {{shadowDirective}}.

{{productName}} is the sharp focal point with {{productFinishType}} surface reflecting controlled highlights. {{cropDirective}}. {{compositionDirective}}.

Shot with {{cameraDirective}}. The {{materialTexture}} is rendered with photographic precision. {{focusArea}} draws the eye immediately.

Scattered {{flowersRelated}} petals and raw {{woodsRelated}} pieces add organic contrast to the sculptural rock arrangement. {{moodDirective}} aesthetic — bold, minimal, combining raw natural textures with refined color treatment for a modern, high-end commercial look. {{consistencyDirective}}.`;

const PROMPT_SCHEMA = {
  name: "generate_scene_prompt",
  description: "Generate a high-end editorial product photography prompt from visual analysis signals.",
  parameters: {
    type: "object",
    properties: {
      master_scene_prompt: {
        type: "string",
        description: "Complete editorial product photography prompt (200-400 words). Structure: opening (shot type + product placement + prop interaction), environment/surface, background (with hex colors for gradients), lighting (direction, quality, rim/fill), product focus + DOF, lens/rendering, closing style statement.",
      },
      environment_prompt: {
        type: "string",
        description: "Surface, props, and environment. Material textures, arrangement, spatial relationships.",
      },
      lighting_prompt: {
        type: "string",
        description: "Lighting: direction, quality, shadow behavior, rim/fill ratios, highlight character.",
      },
      composition_prompt: {
        type: "string",
        description: "Framing, camera angle, lens, depth of field, product placement.",
      },
      styling_prompt: {
        type: "string",
        description: "Mood, tone, editorial style, color grading intent.",
      },
      negative_prompt: {
        type: "string",
        description: "What to avoid: unwanted elements, quality issues, style contradictions.",
      },
      consistency_prompt: {
        type: "string",
        description: "Rules for visual consistency across a series.",
      },
    },
    required: ["master_scene_prompt", "lighting_prompt", "negative_prompt"],
  },
};

// Compact token reference for the AI when inject_tokens mode is active
const DYNAMIC_TOKEN_REFERENCE = `
DYNAMIC TOKEN MODE — IMPORTANT:
Instead of using '{product}' as a generic placeholder, weave these dynamic tokens (as {{tokenName}}) into your prompt where contextually appropriate. Each token resolves to a real value from the user's product analysis at generation time.

Available tokens:

[System Directives]
  - {{productName}} — Product title from catalog
  - {{productType}} — Product type / category slug
  - {{materialTexture}} — Resolved material + finish description
  - {{background}} — Full background directive
  - {{lightingDirective}} — Lighting sentence
  - {{shadowDirective}} — Shadow sentence
  - {{moodDirective}} — Styling direction
  - {{surfaceDirective}} — Surface type sentence
  - {{environmentDirective}} — Environment sentence
  - {{consistencyDirective}} — Cross-shot consistency
  - {{cameraDirective}} — Camera/lens specification
  - {{personDirective}} — Person description for on-model
  - {{outfitDirective}} — Outfit lock directive
  - {{handStyle}} — Hand description
  - {{actionDirective}} — Action type + intensity
  - {{focusArea}} — What to focus on
  - {{cropDirective}} — Crop intensity
  - {{compositionDirective}} — Composition framing
  - {{negativeSpaceDirective}} — Negative space usage
  - {{bodyFramingDirective}} — Body framing for on-model
  - {{modelDirective}} — Model reference directive

[Global Visual]
  - {{productCategory}} — Auto-detected category
  - {{productForm}} — Physical form
  - {{productSilhouette}} — Outline shape
  - {{productMainHex}} — Dominant product color hex
  - {{productSecondaryHex}} — Secondary product color hex
  - {{productAccentHex}} — Accent color hex
  - {{backgroundBaseHex}} — AI-suggested background color
  - {{backgroundSecondaryHex}} — Secondary background color
  - {{shadowToneHex}} — Shadow tone hex
  - {{productFinishType}} — Surface finish type
  - {{materialPrimary}} — Main material
  - {{materialSecondary}} — Secondary material
  - {{textureType}} — Surface texture
  - {{transparencyType}} — Transparency level
  - {{metalTone}} — Metal tone
  - {{heroFeature}} — Most photogenic feature
  - {{detailFocusAreas}} — Areas worth close-ups
  - {{scaleType}} — Size scale reference

[Global Semantic]
  - {{ingredientFamilyPrimary}} — Primary ingredient family
  - {{fruitsRelated}} — Related fruits for styling
  - {{flowersRelated}} — Related flowers
  - {{botanicalsRelated}} — Related botanicals/herbs
  - {{woodsRelated}} — Related wood types
  - {{spicesRelated}} — Related spices
  - {{greensRelated}} — Related greenery
  - {{materialsRelated}} — Related styling materials
  - {{regionRelated}} — Geographic association

[Category-Specific — use only if contextually relevant]
  - {{garmentType}}, {{fitType}}, {{fabricType}} — Fashion
  - {{packagingType}}, {{formulaType}}, {{formulaTexture}} — Beauty
  - {{fragranceFamily}}, {{bottleType}}, {{liquidColorHex}}, {{noteObjectsPrimary}} — Fragrance
  - {{jewelryType}}, {{gemType}}, {{metalPrimary}}, {{metalFinish}} — Jewelry
  - {{accessoryType}}, {{hardwareType}}, {{signatureDetail}} — Accessories
  - {{decorType}}, {{baseMaterial}}, {{roomContextSuggested}} — Home
  - {{foodType}}, {{ingredientObjectsPrimary}}, {{textureCue}} — Food
  - {{deviceType}}, {{finishMaterialPrimary}}, {{industrialStyle}} — Electronics
  - {{gearType}}, {{performanceMaterial}}, {{motionCue}} — Sports
  - {{supplementType}}, {{dosageForm}}, {{wellnessIngredientObjects}} — Health

RULES:
1. Use tokens NATURALLY within sentences — never as a bulleted list
2. Only use tokens contextually relevant to this scene
3. Keep the prompt reusable — tokens make it adaptive, not rigid
4. ALWAYS use {{productName}} where you would have used {product}
5. Use directive tokens ({{lightingDirective}}, {{background}}, etc.) as full sentences
6. Use hex tokens ({{productMainHex}}, {{backgroundBaseHex}}) when describing color schemes
7. Use semantic tokens ({{flowersRelated}}, {{woodsRelated}}) for prop/styling descriptions
`;

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

    const body = await req.json();
    const scene_recipe_id = body.scene_recipe_id;
    const inject_tokens = body.inject_tokens === true;

    if (!scene_recipe_id) {
      return new Response(JSON.stringify({ error: "scene_recipe_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: recipe, error: recipeError } = await supabaseAdmin
      .from("scene_recipes").select("*").eq("id", scene_recipe_id).single();

    if (recipeError || !recipe) {
      return new Response(JSON.stringify({ error: "Scene recipe not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch source analysis if available
    let analysis: any = null;
    if (recipe.source_reference_analysis_id) {
      const { data } = await supabaseAdmin
        .from("reference_analyses").select("*").eq("id", recipe.source_reference_analysis_id).single();
      analysis = data;
    }

    // Fetch source post image for visual reference
    let sourceImageUrl: string | null = null;
    if (recipe.source_watch_post_id) {
      const { data: post } = await supabaseAdmin
        .from("watch_posts").select("media_url, thumbnail_url").eq("id", recipe.source_watch_post_id).single();
      sourceImageUrl = post?.media_url || post?.thumbnail_url || null;
    }

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not set" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build context from recipe
    const recipeContext = [
      `Scene name: ${recipe.name}`,
      recipe.short_description ? `Description: ${recipe.short_description}` : null,
      recipe.scene_type ? `Scene type: ${recipe.scene_type}` : null,
      recipe.category ? `Category: ${recipe.category}` : null,
      recipe.aesthetic_family ? `Aesthetic family: ${recipe.aesthetic_family}` : null,
      recipe.mood ? `Mood: ${recipe.mood}` : null,
      recipe.lighting ? `Lighting: ${recipe.lighting}` : null,
      recipe.background ? `Background: ${recipe.background}` : null,
      recipe.composition ? `Composition: ${recipe.composition}` : null,
      recipe.crop ? `Crop: ${recipe.crop}` : null,
      recipe.camera_feel ? `Camera feel: ${recipe.camera_feel}` : null,
      recipe.styling_tone ? `Styling tone: ${recipe.styling_tone}` : null,
      recipe.scene_goal ? `Scene goal: ${recipe.scene_goal}` : null,
      recipe.palette?.length ? `Palette: ${recipe.palette.join(', ')}` : null,
      recipe.props?.length ? `Props: ${recipe.props.join(', ')}` : null,
      recipe.premium_cues?.length ? `Premium cues: ${recipe.premium_cues.join(', ')}` : null,
      recipe.avoid_terms?.length ? `Avoid: ${recipe.avoid_terms.join(', ')}` : null,
    ].filter(Boolean).join('\n');

    let analysisContext = '';
    if (analysis) {
      analysisContext = '\n\nReference analysis signals:\n' + [
        analysis.lighting_type ? `Lighting type: ${analysis.lighting_type}` : null,
        analysis.light_direction ? `Light direction: ${analysis.light_direction}` : null,
        analysis.shadow_softness ? `Shadow: ${analysis.shadow_softness}` : null,
        analysis.background_type ? `Background: ${analysis.background_type}` : null,
        analysis.environment_type ? `Environment: ${analysis.environment_type}` : null,
        analysis.framing_style ? `Framing: ${analysis.framing_style}` : null,
        analysis.camera_angle ? `Camera angle: ${analysis.camera_angle}` : null,
        analysis.composition_logic ? `Composition: ${analysis.composition_logic}` : null,
        analysis.material_cues?.length ? `Materials: ${analysis.material_cues.join(', ')}` : null,
        analysis.surface_cues?.length ? `Surfaces: ${analysis.surface_cues.join(', ')}` : null,
        analysis.dominant_colors?.length ? `Colors: ${analysis.dominant_colors.join(', ')}` : null,
        analysis.mood ? `Mood: ${analysis.mood}` : null,
        analysis.styling_tone ? `Styling: ${analysis.styling_tone}` : null,
        analysis.short_summary ? `Summary: ${analysis.short_summary}` : null,
      ].filter(Boolean).join('\n');
    }

    // Choose placeholder instructions based on inject_tokens mode
    const placeholderInstruction = inject_tokens
      ? `Use dynamic {{tokenName}} placeholders instead of generic '{product}'. See the DYNAMIC TOKEN MODE section below for the complete list of available tokens.`
      : `Use '{product}' as placeholder where the product would be mentioned.`;

    const examplePrompt = inject_tokens ? EXAMPLE_TOKEN_PROMPT : EXAMPLE_PROMPT;
    const tokenSection = inject_tokens ? `\n\n${DYNAMIC_TOKEN_REFERENCE}` : '';

    // Update schema description based on mode
    const dynamicSchema = { ...PROMPT_SCHEMA };
    if (inject_tokens) {
      dynamicSchema.parameters = {
        ...dynamicSchema.parameters,
        properties: {
          ...dynamicSchema.parameters.properties,
          master_scene_prompt: {
            ...dynamicSchema.parameters.properties.master_scene_prompt,
            description: "Complete editorial product photography prompt (200-400 words) using {{tokenName}} dynamic placeholders. Structure: opening, environment/surface, background, lighting, product focus, lens/rendering, closing style statement. Use tokens naturally within sentences.",
          },
        },
      };
    }

    // Build user content (text + optional image)
    const userContent: any[] = [
      {
        type: "text",
        text: `Generate a complete editorial product photography prompt from this scene recipe:\n\n${recipeContext}${analysisContext}\n\nCreate a master prompt and individual layers (environment, lighting, composition, styling, negative, consistency). ${placeholderInstruction}`,
      },
    ];

    if (sourceImageUrl) {
      userContent.push({
        type: "image_url",
        image_url: { url: sourceImageUrl },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert product photography prompt engineer for VOVV, a high-end AI product photography platform.

Your job is to generate a detailed, structured photography prompt from scene recipe data and visual analysis signals.

CRITICAL RULES:
1. The prompt must be REUSABLE for ANY product. ${placeholderInstruction}
2. Do NOT reference any specific brand, logo, or product identity from the source.
3. Focus on: environment, surface textures, prop placement, background treatment (with specific color hex codes when palette is provided), lighting setup, composition, and editorial style.
4. Write in the style of professional photography direction — specific, actionable, detailed.
5. Include specific hex color codes when describing gradients or backgrounds.
6. Describe materials with physical properties (rough, smooth, porous, reflective, matte).
7. The master prompt should be 200-400 words, structured as cohesive paragraph flow.
8. If a reference image is provided, use it as VISUAL INSPIRATION for the aesthetic direction — do NOT describe the exact image.

Here is an example of the quality and style of prompt you should produce:

---
${examplePrompt}
---

Generate prompts at this quality level. Be specific about materials, lighting angles, color transitions, and spatial relationships.${tokenSection}`,
          },
          { role: "user", content: userContent },
        ],
        tools: [{ type: "function", function: dynamicSchema }],
        tool_choice: { type: "function", function: { name: "generate_scene_prompt" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`AI API error: ${aiResponse.status} ${errText}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let prompts: any = {};

    if (toolCall?.function?.arguments) {
      prompts = typeof toolCall.function.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    }

    // Upsert prompt outputs
    const { data: existing } = await supabaseAdmin
      .from("prompt_outputs").select("id").eq("scene_recipe_id", scene_recipe_id).maybeSingle();

    let savedOutput;
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from("prompt_outputs")
        .update({
          master_scene_prompt: prompts.master_scene_prompt || "",
          environment_prompt: prompts.environment_prompt || "",
          lighting_prompt: prompts.lighting_prompt || "",
          composition_prompt: prompts.composition_prompt || "",
          styling_prompt: prompts.styling_prompt || "",
          negative_prompt: prompts.negative_prompt || "",
          consistency_prompt: prompts.consistency_prompt || "",
        })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      savedOutput = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from("prompt_outputs")
        .insert({
          scene_recipe_id,
          master_scene_prompt: prompts.master_scene_prompt || "",
          environment_prompt: prompts.environment_prompt || "",
          lighting_prompt: prompts.lighting_prompt || "",
          composition_prompt: prompts.composition_prompt || "",
          styling_prompt: prompts.styling_prompt || "",
          negative_prompt: prompts.negative_prompt || "",
          consistency_prompt: prompts.consistency_prompt || "",
        })
        .select()
        .single();
      if (error) throw error;
      savedOutput = data;
    }

    // Update recipe status
    await supabaseAdmin
      .from("scene_recipes")
      .update({ status: "prompt_ready" })
      .eq("id", scene_recipe_id);

    return new Response(JSON.stringify({ success: true, prompt_output: savedOutput }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
