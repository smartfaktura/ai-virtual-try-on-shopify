import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { filmType, storyStructure, shotDuration, tone, referenceDescriptions } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a cinematic short film director specializing in brand and product films.
Given a film type, story structure, duration per shot, and optional tone/references, generate a creative shot plan.
Return ONLY a valid JSON array of shot objects. Each shot object must have exactly these fields:
- shot_index (number, 1-based)
- role (string: "hook", "hero", "detail", "lifestyle", "closing", "transition", "atmosphere")
- purpose (string: 1-sentence description of what this shot achieves)
- scene_type (string: "product_closeup", "product_hero", "lifestyle_wide", "detail_macro", "atmosphere_mood", "human_interaction", "environment_pan")
- camera_motion (string: "slow_push", "orbit", "static", "pull_back", "crane_up", "dolly_slide", "handheld_drift")
- subject_motion (string: "static", "subtle_rotation", "slow_reveal", "human_gesture", "product_interaction", "environment_motion")
- duration_sec (number: must be ${shotDuration || 5})
- product_visible (boolean)
- character_visible (boolean)
- preservation_strength ("low" | "medium" | "high")
- script_line (string: optional voiceover suggestion for this shot)

Generate 4-8 shots that tell a compelling visual story. Vary camera motions and scene types for cinematic interest.`;

    const userPrompt = `Film type: ${filmType}
Story structure: ${storyStructure}
Duration per shot: ${shotDuration || 5} seconds
${tone ? `Tone/mood: ${tone}` : ""}
${referenceDescriptions ? `Reference context: ${referenceDescriptions}` : ""}

Generate the shot plan as a JSON array.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON array from response (handle markdown code blocks)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Could not parse shot plan from AI response:", content);
      throw new Error("Failed to parse AI response into shot plan");
    }

    const shots = JSON.parse(jsonMatch[0]);

    // Validate and sanitize
    const validShots = shots.map((s: any, i: number) => ({
      shot_index: i + 1,
      role: s.role || "detail",
      purpose: s.purpose || "Shot",
      scene_type: s.scene_type || "product_hero",
      camera_motion: s.camera_motion || "slow_push",
      subject_motion: s.subject_motion || "static",
      duration_sec: Number(shotDuration) || 5,
      product_visible: s.product_visible ?? true,
      character_visible: s.character_visible ?? false,
      preservation_strength: s.preservation_strength || "medium",
      script_line: s.script_line || undefined,
    }));

    return new Response(JSON.stringify({ shots: validShots }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("ai-shot-planner error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
