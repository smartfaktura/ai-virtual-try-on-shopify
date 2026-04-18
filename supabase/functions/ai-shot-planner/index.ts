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
      audioLayers,
      // ── Commerce Video Engine inputs (Phase 2) ──────────────────────
      contentIntent, platform, paceMode, productPriority, clarityFirst,
      category, audienceContext, offerContext, soundMode, endingStyle,
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

    // Resolve audio layer preferences — soundMode (commerce) takes precedence when present.
    let wantVoiceover = audioLayers?.voiceover !== false;
    let wantSfx = audioLayers?.sfx !== false;
    if (typeof soundMode === "string") {
      const noVO = ["silent_first", "caption_first", "music_only", "no_voiceover", "music_plus_sfx"];
      if (noVO.includes(soundMode)) wantVoiceover = false;
      if (soundMode === "silent_first" || soundMode === "caption_first") wantSfx = false;
      if (soundMode === "voiceover_plus_music") wantSfx = false;
    }

    // ── Intent-aware guidance block ─────────────────────────────────
    const INTENT_GUIDANCE: Record<string, string> = {
      product_showcase: "Premium product showcase. Hero readability is critical. Avoid heavy abstraction. Pacing elegant. Voiceover (if any) clarifies value without hard sell.",
      product_detail_film: "Slow, premium, macro/detail-led. Emphasize craftsmanship, material, texture. Voiceover may be minimal or omitted. Do NOT force a CTA.",
      pdp_video: "Marketplace clarity-first. High product-visible time. At least one clean hero and one clear detail. Ending must be unambiguous and product-clear. No abstract teasing.",
      social_content: "Vertical-native feel. Faster hook, native energy, more movement. Casual, creator-friendly tone allowed.",
      creator_style_content: "Human/product interaction natural. Framing can feel handheld. Script observational, not promotional.",
      launch_teaser: "Tease → reveal → finish. Build mystery early then commit to product. Avoid hard CTA unless launch offer exists.",
      brand_mood_film: "Atmosphere can lead. Product still legible. Voiceover sparse or omitted. Soft resolve ending.",
      campaign_editorial: "Editorial, human-with-product. Premium pacing. Logo-safe luxury close.",
      feature_benefit_video: "Clear feature beats with benefit payoff. Voiceover allowed and helpful. Soft CTA OK.",
      performance_ad: "Fast hook, dense info, clear close. CTA can be direct.",
    };
    const intentBlock = contentIntent && INTENT_GUIDANCE[contentIntent]
      ? `\nCONTENT INTENT (${contentIntent}): ${INTENT_GUIDANCE[contentIntent]}`
      : "";
    const platformBlock = platform ? `\nPLATFORM: ${platform}` : "";
    const paceBlock = paceMode ? `\nPACE: ${paceMode}` : "";
    const priorityBlock = productPriority ? `\nPRODUCT PRIORITY: ${productPriority}` : "";
    const categoryBlock = category ? `\nPRODUCT CATEGORY: ${category}` : "";
    const audienceBlock = audienceContext ? `\nAUDIENCE: ${audienceContext}` : "";
    const offerBlock = offerContext ? `\nOFFER CONTEXT: ${offerContext}` : "";
    const clarityBlock = clarityFirst
      ? `\nCLARITY-FIRST MODE: prefer stable cameras, ensure hero + detail, avoid silhouette/abstract framing.`
      : "";
    const endingBlock = endingStyle && endingStyle !== "auto"
      ? `\nENDING STYLE: ${endingStyle} (final shot must reflect this).`
      : "";

    // Voiceover guidance now adapts to intent.
    const persuasiveIntent = contentIntent === "performance_ad" || contentIntent === "feature_benefit_video";
    const voiceoverGuidance = persuasiveIntent
      ? `Voiceover should be persuasive and conversion-focused. Sell features and benefits, create desire.`
      : `Voiceover (if any) should clarify value and product presence WITHOUT sounding like a hard sell. For brand_mood_film and product_detail_film, prefer minimal, descriptive, premium phrasing — or omit. For creator/social content, conversational and observational is fine.`;

    const scriptLineInstruction = wantVoiceover
      ? `- script_line (string: ${voiceoverGuidance} Do NOT describe visual aesthetics. Word budget: ~2 words per second of shot duration.)`
      : `- script_line (string: MUST be empty string "" — voiceover is disabled for this sound mode)`;

    const sfxInstruction = wantSfx
      ? `- sfx_prompt (string: descriptive sound effect prompt, 5-20 words, matching scene environment and mood)
- sfx_trigger_at (number: offset in seconds from shot start when SFX should trigger — 0 for impacts/hooks, 0.3-0.5 for reveals/transitions, 0 for ambient)`
      : `- sfx_prompt (string: MUST be empty string "" — SFX is disabled by the user)
- sfx_trigger_at (number: 0)`;

    const systemPrompt = `You are a cinematic director for COMMERCE VIDEO content (product showcases, PDP videos, social, creator-style, brand mood, launch teasers, feature/benefit, performance ads). Adapt your direction to the CONTENT INTENT provided. Do NOT assume every video is a hard-sell ad.
Style/mood presets affect VISUALS ONLY — never reference visual aesthetics in voiceover scripts.
You MUST generate shots that follow the EXACT role sequence provided. Do NOT invent your own roles.

VALID ROLES (use ONLY these): ${VALID_ROLES.join(", ")}

VALID SCENE TYPES: ${VALID_SCENE_TYPES.join(", ")}

VALID CAMERA MOTIONS: ${VALID_CAMERA_MOTIONS.join(", ")}
${intentBlock}${platformBlock}${paceBlock}${priorityBlock}${categoryBlock}${audienceBlock}${offerBlock}${clarityBlock}${endingBlock}

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
${scriptLineInstruction}
${sfxInstruction}

DURATION: Total duration should fit the intent — social/teaser ~6–10s, showcase/PDP ~8–12s, brand mood/editorial ~10–15s. Do NOT force exactly 15s unless the intent calls for it. Use cinematic, role-weighted pacing (NOT equal splits).
Vary camera motions and scene types for cinematic interest.

MUSIC DIRECTION: The "music_direction" field should describe SPECIFIC instrumentation (e.g. "minimal piano with deep sub-bass"), a BPM range, and an energy arc (e.g. "builds from sparse to layered strings at resolve"). Be precise — this drives AI music generation.`;

    const userPrompt = `Film type: ${filmType}${filmDescription ? ` — ${filmDescription}` : ""}
Story structure: ${storyStructure}
REQUIRED ROLE SEQUENCE (follow this exactly): ${roleSequence.join(" → ")}
Number of shots: ${roleSequence.length}
${contentIntent ? `Content intent: ${contentIntent}` : ""}
${platform ? `Platform: ${platform}` : ""}
${tone ? `Tone/mood: ${tone}` : ""}
${tonePresetText ? `VISUAL STYLE ONLY (do NOT reference in script_line — this is for camera/lighting/color only): ${tonePresetText}` : ""}
${stylePresetNames ? `VISUAL STYLE ONLY: ${stylePresetNames}` : ""}
${scenePresetNames ? `Scene environment (visual only): ${scenePresetNames}` : ""}
${referenceDescriptions ? `Reference context: ${referenceDescriptions}` : ""}
Audio preferences: ${wantVoiceover ? "Voiceover ENABLED" : "Voiceover DISABLED"}, ${wantSfx ? "SFX ENABLED" : "SFX DISABLED"}${soundMode ? ` (soundMode=${soundMode})` : ""}

Generate exactly ${roleSequence.length} shots following the role sequence: ${roleSequence.join(", ")}.
Each shot's "role" field MUST match the corresponding role in the sequence.
${wantVoiceover ? 'CRITICAL: script_line word budget is ~2 words per second of shot duration. Match phrasing to content intent. For character_visible shots with script_line, write natural dialogue.' : "IMPORTANT: Leave script_line as empty string for ALL shots — voiceover is disabled."}
Remember: cinematic, intent-appropriate pacing${wantSfx ? ", sfx_prompt for sound effects, sfx_trigger_at for timing" : ""}, and music_direction for the overall music track.`;

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

    // Try to parse as {music_direction, shots} object first, fall back to plain array
    let shots: any[];
    let musicDirection: string | undefined;

    const objMatch = content.match(/\{[\s\S]*\}/);
    const arrMatch = content.match(/\[[\s\S]*\]/);

    if (objMatch) {
      try {
        const parsed = JSON.parse(objMatch[0]);
        if (Array.isArray(parsed.shots)) {
          shots = parsed.shots;
          musicDirection = typeof parsed.music_direction === "string" ? parsed.music_direction : undefined;
        } else if (Array.isArray(parsed)) {
          shots = parsed;
        } else {
          throw new Error("No shots array found");
        }
      } catch {
        if (arrMatch) {
          shots = JSON.parse(arrMatch[0]);
        } else {
          console.error("Could not parse shot plan from AI response:", content);
          throw new Error("Failed to parse AI response into shot plan");
        }
      }
    } else if (arrMatch) {
      shots = JSON.parse(arrMatch[0]);
    } else {
      console.error("Could not parse shot plan from AI response:", content);
      throw new Error("Failed to parse AI response into shot plan");
    }

    // Validate and sanitize — snap roles to valid system roles
    const validShots = shots.map((s: any, i: number) => {
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
        script_line: wantVoiceover ? (s.script_line || "") : "",
        sfx_prompt: wantSfx ? (s.sfx_prompt || "subtle cinematic ambient sound") : "",
        sfx_trigger_at: wantSfx
          ? (typeof s.sfx_trigger_at === "number" ? Math.max(0, Math.min(5, s.sfx_trigger_at)) : (SFX_TRIGGER_DEFAULTS[role] ?? 0))
          : 0,
      };
    });

    // Adaptive duration cap — when commerce intent is provided, cap softly to intent-appropriate max.
    // Falls back to the legacy 15s cap when no intent is supplied.
    const INTENT_MAX: Record<string, number> = {
      social_content: 15, creator_style_content: 15, performance_ad: 15,
      feature_benefit_video: 15, pdp_video: 15, product_showcase: 15,
      product_detail_film: 15, launch_teaser: 15, brand_mood_film: 15, campaign_editorial: 15,
    };
    const cap = (contentIntent && INTENT_MAX[contentIntent]) || 15;
    const total = validShots.reduce((sum: number, s: any) => sum + s.duration_sec, 0);
    if (total > cap) {
      const scale = cap / total;
      let remaining = cap;
      for (let i = 0; i < validShots.length; i++) {
        if (i === validShots.length - 1) {
          validShots[i].duration_sec = Math.max(1, remaining);
        } else {
          validShots[i].duration_sec = Math.max(1, Math.round(validShots[i].duration_sec * scale));
          remaining -= validShots[i].duration_sec;
        }
      }
    }

    return new Response(JSON.stringify({ shots: validShots, ...(musicDirection ? { music_direction: musicDirection } : {}) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("ai-shot-planner error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
