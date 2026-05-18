// Free voice preview for Talking Video composer.
// Generates a short ElevenLabs MP3 of the script using the same voice mapping
// as seed-voice-samples, so users can audition pacing before spending credits.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Mirror of VOICE_MAP in seed-voice-samples — keep in sync.
const VOICE_MAP: Record<string, string> = {
  ai_kaiya: "9BWtsMINqrJLrRacOk9x",
  girlfriend_4_speech02: "EXAVITQu4vr4xnSDxMaL",
  calm_story1: "XrExE9yKIg1WjnnlVkGX",
  oversea_male1: "nPczCjzI2devNBz1zQrb",
  uk_man2: "JBFqnCBsd6RMkjVDRZzb",
  uk_boy1: "N2lVS1w4EtoT3dr4eOWO",
};

// In-memory rate limit: 10 previews per user per minute.
const HITS = new Map<string, number[]>();
function rateLimited(userId: string): boolean {
  const now = Date.now();
  const arr = (HITS.get(userId) || []).filter((t) => now - t < 60_000);
  if (arr.length >= 10) {
    HITS.set(userId, arr);
    return true;
  }
  arr.push(now);
  HITS.set(userId, arr);
  return false;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const elevenKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!elevenKey) {
      return new Response(JSON.stringify({ error: "Voice preview not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth check — validate the bearer token explicitly (matches the
    // working pattern used by studio-chat / kling-lip-sync).
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Please sign in to preview voice" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const supa = createClient(supabaseUrl, anonKey);
    const { data: { user }, error: userErr } = await supa.auth.getUser(token);
    if (userErr || !user) {
      console.warn("[preview-talking-voice] auth failed:", userErr?.message);
      return new Response(JSON.stringify({ error: "Your session expired — please sign in again" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = user.id;

    if (rateLimited(userId)) {
      return new Response(JSON.stringify({ error: "Too many previews — try again in a minute" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const rawScript = String(body.script || "").trim();
    const voiceId = String(body.voice_id || "");
    const speed = Math.max(0.7, Math.min(1.2, Number(body.speed ?? 1)));

    if (!rawScript) {
      return new Response(JSON.stringify({ error: "Script is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Trim to keep preview cheap (~8s of speech)
    const script = rawScript.slice(0, 220);
    const elevenVoiceId = VOICE_MAP[voiceId] || VOICE_MAP.ai_kaiya;

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": elevenKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          text: script,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
            speed,
          },
        }),
      },
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("[preview-talking-voice] ElevenLabs error", res.status, err.slice(0, 300));
      return new Response(JSON.stringify({ error: "Voice preview failed" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const buf = await res.arrayBuffer();
    const base64 = base64Encode(buf);
    return new Response(JSON.stringify({ audio_base64: base64 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[preview-talking-voice] error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
