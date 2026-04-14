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
Given a film type, story structure, and optional tone/references, generate a creative shot plan.
Return ONLY a valid JSON array of shot objects. Each shot object must have exactly these fields:
- shot_index (number, 1-based)
- role (string: "hook", "hero", "detail", "lifestyle", "closing", "transition", "atmosphere")
- purpose (string: 1-sentence description of what this shot achieves)
- scene_type (string: "product_closeup", "product_hero", "lifestyle_wide", "detail_macro", "atmosphere_mood", "human_interaction", "environment_pan")
- camera_motion (string: "slow_push", "orbit", "static", "pull_back", "crane_up", "dolly_slide", "handheld_drift")
- subject_motion (string: "static", "subtle_rotation", "slow_reveal", "human_gesture", "product_interaction", "environment_motion")
- duration_sec (number: integer 1-15, use cinematic pacing — hooks/teases: 2s, hero reveals: 4-5s, details: 3s, closings: 3s)
- product_visible (boolean)
- character_visible (boolean)
- preservation_strength ("low" | "medium" | "high")
- script_line (string: a SHORT voiceover narration line for this shot, 5-15 words, matching the shot mood and purpose)

Generate 3-5 shots with varied cinematic pacing. The total of all duration_sec values MUST equal exactly 15 seconds. Use shorter durations (2s) for hook/tease shots and longer durations (4-5s) for hero/reveal moments. Maximum 6 shots. Vary camera motions and scene types for cinematic interest.

IMPORTANT: Every shot MUST have a script_line with a compelling voiceover narration.`;

    const userPrompt = `Film type: ${filmType}
Story structure: ${storyStructure}
Target total duration: 15 seconds
${tone ? `Tone/mood: ${tone}` : ""}
${referenceDescriptions ? `Reference context: ${referenceDescriptions}` : ""}

Generate the shot plan as a JSON array. Remember: each shot needs its own duration_sec (use cinematic pacing, NOT equal splits) and a script_line for voiceover.`;

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
      duration_sec: Math.max(1, Math.min(15, Number(s.duration_sec) || 3)),
      product_visible: s.product_visible ?? true,
      character_visible: s.character_visible ?? false,
      preservation_strength: s.preservation_strength || "medium",
      script_line: s.script_line || `Shot ${i + 1} narration.`,
    }));

    // Verify total doesn't exceed 15s
    const total = validShots.reduce((sum: number, s: any) => sum + s.duration_sec, 0);
    if (total > 15) {
      const scale = 15 / total;
      let remaining = 15;
      for (let i = 0; i < validShots.length; i++) {
        if (i === validShots.length - 1) {
          validShots[i].duration_sec = Math.max(1, remaining);
        } else {
          validShots[i].duration_sec = Math.max(1, Math.round(validShots[i].duration_sec * scale));
          remaining -= validShots[i].duration_sec;
        }
      }
    }

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
