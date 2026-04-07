import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const PROMPT_SCHEMA = {
  name: "generate_prompt_components",
  description: "Generate structured prompt components for a VOVV scene recipe.",
  parameters: {
    type: "object",
    properties: {
      master_scene_prompt: { type: "string", description: "Complete scene description prompt" },
      environment_prompt: { type: "string", description: "Background and environment description" },
      lighting_prompt: { type: "string", description: "Lighting setup description" },
      composition_prompt: { type: "string", description: "Framing and composition directions" },
      styling_prompt: { type: "string", description: "Styling, mood, and aesthetic directions" },
      negative_prompt: { type: "string", description: "Elements to avoid" },
      consistency_prompt: { type: "string", description: "Consistency and quality directions" },
    },
    required: ["master_scene_prompt", "environment_prompt", "lighting_prompt", "composition_prompt", "styling_prompt", "negative_prompt", "consistency_prompt"],
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

    const { scene_recipe_id } = await req.json();
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

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not set" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const recipeDescription = `
Scene: ${recipe.name}
Category: ${recipe.category} / ${recipe.subcategory}
Aesthetic Family: ${recipe.aesthetic_family}
Scene Type: ${recipe.scene_type}
Goal: ${recipe.scene_goal}
Description: ${recipe.short_description}
Palette: ${(recipe.palette || []).join(", ")}
Lighting: ${recipe.lighting}
Background: ${recipe.background}
Composition: ${recipe.composition}
Crop: ${recipe.crop}
Camera Feel: ${recipe.camera_feel}
Props: ${(recipe.props || []).join(", ")}
Mood: ${recipe.mood}
Styling Tone: ${recipe.styling_tone}
Premium Cues: ${(recipe.premium_cues || []).join(", ")}
Avoid: ${(recipe.avoid_terms || []).join(", ")}
`.trim();

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
            content: `You are a prompt engineer for VOVV, a product photography AI platform.
Generate structured prompt components from a scene recipe. Each component should be a clear, descriptive prompt segment.
IMPORTANT: Preserve visual direction, do NOT duplicate any source image. Avoid exact brand names, logos, celebrity likenesses, exact composition cloning, or copyrighted set recreation.
Focus on reusable aesthetic language that can guide AI image generation.`,
          },
          {
            role: "user",
            content: `Generate prompt components for this VOVV scene recipe:\n\n${recipeDescription}`,
          },
        ],
        tools: [{ type: "function", function: PROMPT_SCHEMA }],
        tool_choice: { type: "function", function: { name: "generate_prompt_components" } },
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

    return new Response(JSON.stringify({ success: true, prompt_output: savedOutput }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
