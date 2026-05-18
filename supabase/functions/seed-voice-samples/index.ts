// Admin-only one-off: generates short MP3 previews for each Kling voice using
// ElevenLabs and uploads them to the public `voice-samples` bucket.
// These are approximate previews — Kling doesn't expose a TTS preview endpoint,
// so we match each Kling voice to a similar ElevenLabs voice for playback in the picker.
//
// Invoke once (admin token) to seed; safe to re-run to refresh.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Map our Kling voice IDs → ElevenLabs voice IDs (public defaults)
const VOICE_MAP: Record<string, { elevenlabs_id: string; label: string }> = {
  ai_kaiya:      { elevenlabs_id: "9BWtsMINqrJLrRacOk9x", label: "Kaiya" },  // Aria
  oversea_male1: { elevenlabs_id: "nPczCjzI2devNBz1zQrb", label: "Oliver" }, // Brian
  uk_man2:       { elevenlabs_id: "JBFqnCBsd6RMkjVDRZzb", label: "James" },  // George — British male
  uk_boy1:       { elevenlabs_id: "N2lVS1w4EtoT3dr4eOWO", label: "Theo" },   // Callum — younger British
};

const SAMPLE_SENTENCE = "Hi, welcome to our new collection";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const elevenKey = Deno.env.get("ELEVENLABS_API_KEY");

  if (!elevenKey) {
    return new Response(JSON.stringify({ error: "ELEVENLABS_API_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Admin check
  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await authClient.auth.getUser(authHeader.replace("Bearer ", ""));
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const { data: isAdmin } = await authClient.rpc("has_role", { _user_id: user.id, _role: "admin" });
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Admin only" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const svc = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const results: Record<string, unknown> = {};

  for (const [klingId, { elevenlabs_id, label }] of Object.entries(VOICE_MAP)) {
    try {
      const ttsRes = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${elevenlabs_id}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: {
            "xi-api-key": elevenKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: SAMPLE_SENTENCE,
            model_id: "eleven_turbo_v2_5",
            voice_settings: { stability: 0.5, similarity_boost: 0.75 },
          }),
        },
      );
      if (!ttsRes.ok) {
        const errTxt = await ttsRes.text();
        results[klingId] = { ok: false, error: `TTS ${ttsRes.status}: ${errTxt.slice(0, 200)}` };
        continue;
      }
      const audioBytes = new Uint8Array(await ttsRes.arrayBuffer());

      const { error: upErr } = await svc.storage
        .from("voice-samples")
        .upload(`${klingId}.mp3`, audioBytes, {
          contentType: "audio/mpeg",
          upsert: true,
        });
      if (upErr) {
        results[klingId] = { ok: false, error: upErr.message };
        continue;
      }
      results[klingId] = { ok: true, label, bytes: audioBytes.length };
      console.log(`[seed-voice-samples] ${klingId} (${label}) uploaded, ${audioBytes.length} bytes`);
    } catch (e) {
      results[klingId] = { ok: false, error: (e as Error).message };
    }
  }

  return new Response(
    JSON.stringify({ ok: true, sample_sentence: SAMPLE_SENTENCE, results }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
