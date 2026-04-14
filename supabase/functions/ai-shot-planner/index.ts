import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/* ── Valid system enums ──────────────────────────────────────── */

const VALID_ROLES = [
  "hook", "intro", "tease", "atmosphere", "build",
  "product_reveal", "product_moment", "product_focus",
  "detail_closeup", "highlight", "lifestyle_moment",
  "human_interaction", "resolve", "brand_finish", "end_frame",
];

const VALID_SCENE_TYPES = [
  "atmospheric_lifestyle", "studio_reveal", "macro_closeup", "hero_end_frame",
  "establishing_wide", "product_hero", "lifestyle_context", "end_card",
  "mood_abstract", "studio_detail", "lifestyle_interaction", "abstract_tease",
  "dynamic_sequence", "hero_spotlight", "resolve_wide",
];

const VALID_CAMERA_MOTIONS = [
  "slow_drift", "slow_push_in", "micro_pan", "static", "slow_pan",
  "orbit", "handheld_gentle", "tracking", "push_in", "pull_back",
];

const ROLE_ALIAS_MAP: Record<string, string> = {
  hero: "product_reveal",
  detail: "detail_closeup",
  closing: "brand_finish",
  lifestyle: "lifestyle_moment",
  transition: "atmosphere",
  reveal: "product_reveal",
  focus: "product_focus",
  finale: "brand_finish",
  opener: "hook",
  teaser: "tease",
  end: "end_frame",
  product: "product_moment",
  interaction: "human_interaction",
};

const SFX_TRIGGER_DEFAULTS: Record<string, number> = {
  hook: 0,
  tease: 0,
  product_reveal: 0.5,
  highlight: 0.3,
  closing: 0,
  brand_finish: 0,
  end_frame: 0,
};

function snapToValidValue(val: string, validList: string[], fallback: string): string {
  if (validList.includes(val)) return val;
  // Try partial match
  const lower = val.toLowerCase().replace(/[\s-]/g, "_");
  const match = validList.find(v => v === lower || lower.includes(v) || v.includes(lower));
  return match || fallback;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      filmType, storyStructure, shotDuration, tone,
      referenceDescriptions, customRoles, structureRoles,
      filmDescription, tonePresetText, stylePresetNames, scenePresetNames,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Determine the role sequence the AI must follow
    const roleSequence: string[] =
      storyStructure === "custom" && Array.isArray(customRoles) && customRoles.length > 0
        ? customRoles.slice(0, 6)
        : Array.isArray(structureRoles) && structureRoles.length > 0
          ? structureRoles.slice(0, 6)
          : ["hook", "product_reveal", "detail_closeup", "brand_finish"];

    const systemPrompt = `You are a cinematic short film director specializing in brand and product films.
You MUST generate shots that follow the EXACT role sequence provided. Do NOT invent your own roles.

VALID ROLES (use ONLY these): ${VALID_ROLES.join(", ")}

VALID SCENE TYPES: ${VALID_SCENE_TYPES.join(", ")}

VALID CAMERA MOTIONS: ${VALID_CAMERA_MOTIONS.join(", ")}

Return ONLY valid JSON with this structure:
{
  "music_direction": "one sentence describing the ideal music: specific instruments, BPM range, and energy arc",
  "shots": [array of shot objects]
}

Each shot object MUST have exactly these fields:
- shot_index (number, 1-based)
- role (string: MUST match the role from the provided sequence)
- purpose (string: 1-sentence description of what this shot achieves)
- scene_type (string: from the valid scene types list above)
- camera_motion (string: from the valid camera motions list above)
- subject_motion (string: "minimal", "ambient", "natural_movement")
- duration_sec (number: integer 1-15, use cinematic pacing — hooks/teases: 2s, hero reveals: 4-5s, details: 3s, closings: 3s)
- product_visible (boolean)
- character_visible (boolean)
- preservation_strength ("low" | "medium" | "high")
- script_line (string: voiceover narration — CRITICAL: word count MUST match duration. Budget is ~2 words per second. A 2s shot = max 3-4 words as a punchy tagline. A 3s shot = max 6 words. A 4s shot = max 8 words. A 5s shot = max 10 words. Shots ≤ 2s should be 2-4 words maximum — a punchy tagline, NOT a sentence.)
- sfx_prompt (string: descriptive sound effect prompt, 5-20 words, matching scene environment and mood)
- sfx_trigger_at (number: offset in seconds from shot start when SFX should trigger — 0 for impacts/hooks, 0.3-0.5 for reveals/transitions, 0 for ambient)

The total of all duration_sec values MUST equal exactly 15 seconds.
Use shorter durations (2s) for hook/tease shots and longer durations (4-5s) for hero/reveal moments.
Vary camera motions and scene types for cinematic interest.

MUSIC DIRECTION: The "music_direction" field should describe SPECIFIC instrumentation (e.g. "minimal piano with deep sub-bass"), a BPM range, and an energy arc (e.g. "builds from sparse to layered strings at resolve"). Be precise — this drives AI music generation.`;

    const userPrompt = `Film type: ${filmType}${filmDescription ? ` — ${filmDescription}` : ""}
Story structure: ${storyStructure}
REQUIRED ROLE SEQUENCE (follow this exactly): ${roleSequence.join(" → ")}
Target total duration: 15 seconds
Number of shots: ${roleSequence.length}
${tone ? `Tone/mood: ${tone}` : ""}
${tonePresetText ? `Tone cinematography guidance: ${tonePresetText}` : ""}
${stylePresetNames ? `Selected visual style: ${stylePresetNames}` : ""}
${scenePresetNames ? `Selected scene environment: ${scenePresetNames}` : ""}
${referenceDescriptions ? `Reference context: ${referenceDescriptions}` : ""}

Generate exactly ${roleSequence.length} shots following the role sequence: ${roleSequence.join(", ")}.
Each shot's "role" field MUST match the corresponding role in the sequence.
CRITICAL: script_line word budget is ~2 words per second of shot duration. A 2s hook = "Feel the power." (3 words). A 4s reveal = "Something extraordinary, designed for you." (6 words). Do NOT write long sentences for short shots.
Remember: cinematic pacing (NOT equal splits), sfx_prompt for sound effects, sfx_trigger_at for timing, and music_direction for the overall music track.`;

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

    // Validate and sanitize — snap roles to valid system roles
    const validShots = shots.map((s: any, i: number) => {
      // Map role: try exact match, then alias, then use sequence role
      let role = s.role || roleSequence[i] || "detail_closeup";
      if (!VALID_ROLES.includes(role)) {
        role = ROLE_ALIAS_MAP[role] || roleSequence[i] || "detail_closeup";
      }

      return {
        shot_index: i + 1,
        role,
        purpose: s.purpose || "Shot",
        scene_type: snapToValidValue(s.scene_type || "", VALID_SCENE_TYPES, "product_hero"),
        camera_motion: snapToValidValue(s.camera_motion || "", VALID_CAMERA_MOTIONS, "slow_push_in"),
        subject_motion: s.subject_motion || "minimal",
        duration_sec: Math.max(1, Math.min(15, Number(s.duration_sec) || 3)),
        product_visible: s.product_visible ?? true,
        character_visible: s.character_visible ?? false,
        preservation_strength: s.preservation_strength || "medium",
        script_line: s.script_line || `Shot ${i + 1} narration.`,
        sfx_prompt: s.sfx_prompt || `subtle cinematic ambient sound`,
        sfx_trigger_at: typeof s.sfx_trigger_at === "number"
          ? Math.max(0, Math.min(5, s.sfx_trigger_at))
          : (SFX_TRIGGER_DEFAULTS[role] ?? 0),
      };
    });

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
