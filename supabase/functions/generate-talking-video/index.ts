// Talking Video orchestrator — stage 1 of the new audio-first pipeline.
//
// Pipeline (worker mode, dispatched by process-queue):
//   0. Validate payload (script + voice + reference image + performance).
//   1. Generate ElevenLabs voiceover (mapped from the chosen Kling voice id),
//      upload it to the private `generated-audio` bucket. We store the bucket
//      PATH (not the URL) — poll-stuck-videos signs it fresh when Kling needs it.
//   2. Submit Kling image2video with a structured talking-head prompt.
//   3. Persist generated_videos row with metadata = {
//        stage: 'base_video', script, voice_id, voice_speed,
//        audio_storage_path, audio_duration_sec, performance
//      }.
//   4. Save kling_task_id to queue.result so poll-stuck-videos advances stage 2.
//
// poll-stuck-videos then calls /videos/lip-sync with audio_type:"file" and the
// freshly signed audio URL — Kling no longer does any TTS, so the user hears
// the exact ElevenLabs voice they previewed.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const KLING_API_BASE = "https://api-singapore.klingai.com/v1";

// Back-compat: legacy Kling alias ids -> ElevenLabs voice ids.
// New clients send ElevenLabs ids directly; we pass them through unchanged.
const LEGACY_VOICE_MAP: Record<string, string> = {
  ai_kaiya: "9BWtsMINqrJLrRacOk9x",
  girlfriend_4_speech02: "EXAVITQu4vr4xnSDxMaL",
  calm_story1: "XrExE9yKIg1WjnnlVkGX",
  oversea_male1: "nPczCjzI2devNBz1zQrb",
  uk_man2: "JBFqnCBsd6RMkjVDRZzb",
  uk_boy1: "N2lVS1w4EtoT3dr4eOWO",
};

function resolveElevenVoiceId(id: string): string {
  return LEGACY_VOICE_MAP[id] || id || "nPczCjzI2devNBz1zQrb";
}

type ElevenVoiceSettings = {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
  speed: number;
};

const DEFAULT_VOICE_SETTINGS: ElevenVoiceSettings = {
  stability: 0.55,
  similarity_boost: 0.8,
  style: 0.25,
  use_speaker_boost: true,
  speed: 1,
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function sanitizeVoiceSettings(raw: unknown, speedFallback: number): ElevenVoiceSettings {
  const r = (raw as Partial<ElevenVoiceSettings>) || {};
  const num = (v: unknown, d: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  };
  return {
    stability:        clamp(num(r.stability, DEFAULT_VOICE_SETTINGS.stability), 0, 1),
    similarity_boost: clamp(num(r.similarity_boost, DEFAULT_VOICE_SETTINGS.similarity_boost), 0, 1),
    style:            clamp(num(r.style, DEFAULT_VOICE_SETTINGS.style), 0, 1),
    use_speaker_boost: typeof r.use_speaker_boost === "boolean" ? r.use_speaker_boost : DEFAULT_VOICE_SETTINGS.use_speaker_boost,
    speed:            clamp(num(r.speed, speedFallback), 0.7, 1.2),
  };
}

const ALLOWED_TTS_MODELS = new Set(["eleven_multilingual_v2", "eleven_turbo_v2_5"]);
function sanitizeTtsModel(raw: unknown): string {
  return typeof raw === "string" && ALLOWED_TTS_MODELS.has(raw) ? raw : "eleven_multilingual_v2";
}

// --- Structured talking-head prompt builder -----------------------------------

type Motion = "locked" | "natural" | "presenter" | "expressive" | "cinematic";
type Gaze = "camera" | "soft";
type CameraMove = "none" | "push_in" | "pull_out" | "arc" | "orbit_lr" | "orbit_rl";

// IMPORTANT: Mouth must stay a CLEAN CANVAS for the lip-sync pass.
// Body, scene and camera motion can move freely — only the mouth is locked.
const MOTION_LINES: Record<Motion, string> = {
  locked:
    "Body completely static. Only eyes, gentle breathing and tiny micro-expressions animate. Shoulders, torso, hair stay locked.",
  natural:
    "Subtle facial life. Small natural blinks, gentle breathing, the faintest head settle. No shoulder or torso motion.",
  presenter:
    "Confident, attentive posture. Small assertive micro-nods, light brow engagement, controlled shoulders. No hand gestures.",
  expressive:
    "Lively, expressive performance. Natural hand gestures freely enter the frame, gentle shoulder shift and torso sway, the subject may take a small step or shift weight, head free to settle within about 20 degrees. Hair and clothing carry soft ambient motion. Scene has gentle environmental life (background figures, soft light shifts, fabric or hair in light air).",
  cinematic:
    "Editorial cinematic performance. Confident full-body language, expressive natural hand gestures, deliberate shoulder shift, the subject may walk slowly, turn, adjust wardrobe or interact with props. Head free to settle within about 25 degrees. Atmospheric scene motion: soft wind on hair and fabric, ambient steam, dust motes or gentle background activity. Shallow parallax between subject and background.",
};

const GAZE_LINES: Record<Gaze, string> = {
  camera: "Eyes locked on the lens the entire time. Direct, engaged eye contact.",
  soft: "Eyes mostly on the lens, occasional soft glance to a point just off-camera. Never turns face away.",
};

const CAMERA_LINES: Record<CameraMove, string> = {
  none: "CAMERA: Locked-off frame, tripod-stable. No pan, zoom, dolly, orbit, shake or reframe.",
  push_in: "CAMERA: Slow, smooth cinematic push-in toward the subject across the full clip. Subtle, controlled, no shake. Face stays visible.",
  pull_out: "CAMERA: Slow, smooth cinematic pull-out from the subject across the full clip. Subtle, controlled, no shake. Face stays visible.",
  arc: "CAMERA: Slow, gentle arc around the subject (no more than about 15 degrees total). Smooth and controlled. Face stays toward the lens.",
  orbit_lr: "CAMERA: Smooth, slow orbit moving from the subject's left around to their right across the full clip, capturing front and 3/4 angles. Editorial pace, no shake, face stays visible.",
  orbit_rl: "CAMERA: Smooth, slow orbit moving from the subject's right around to their left across the full clip, capturing front and 3/4 angles. Editorial pace, no shake, face stays visible.",
};

// Always-on negatives that protect the lip-sync pass (mouth/face).
const MOUTH_NEGATIVES =
  "mouth covered, hand over mouth, hand near face, finger near mouth, object crossing mouth, " +
  "teeth warping, lip distortion, face melting, duplicate face, two heads, extra person, crowd, " +
  "warping, watermark, text overlay, blur, motion blur on face, " +
  "talking, speaking, mouthing words, silent speech, lip flapping, jaw chewing, " +
  "open mouth, parted lips, exaggerated mouth movement, teeth showing, tongue visible";

// Body/camera negatives — relaxed at higher action levels.
const BODY_NEGATIVES_STRICT =
  "camera movement, pan, zoom, dolly, tracking shot, orbit, shake, reframe, fast motion, " +
  "head turning away, profile turn, looking sideways, dramatic gesture, jitter";
const BODY_NEGATIVES_EXPRESSIVE =
  "shake, reframe, fast motion, full back turn, jitter, whip pan, snap zoom";
const BODY_NEGATIVES_CINEMATIC =
  "shake, jitter, whip pan, snap zoom, full back turn, sudden cut";

function negativePromptFor(motion: Motion, cameraMove: CameraMove): string {
  if (motion === "cinematic") {
    return `${MOUTH_NEGATIVES}, ${BODY_NEGATIVES_CINEMATIC}`;
  }
  if (motion === "expressive" || cameraMove !== "none") {
    return `${MOUTH_NEGATIVES}, ${BODY_NEGATIVES_EXPRESSIVE}`;
  }
  return `${MOUTH_NEGATIVES}, ${BODY_NEGATIVES_STRICT}`;
}

// Strip only phrases that would clearly conflict with the downstream lip-sync
// pass. We deliberately keep "smile/laugh" out of the blocklist — they describe
// expression intent, not literal mouth animation we can't control later.
function sanitizeActionPrompt(raw: string): string {
  if (!raw) return "";
  const cleaned = raw
    .replace(/\b(talk(?:s|ing)?|speak(?:s|ing)?|say(?:s|ing)?|mouth(?:s|ing)?|lip[- ]?sync|whisper(?:s|ing)?|shout(?:s|ing)?|sing(?:s|ing)?|yell(?:s|ing)?)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return cleaned.slice(0, 600);
}

function subjectLineFor(motion: Motion): string {
  switch (motion) {
    case "cinematic":
      return "SUBJECT: Single person, medium to wide shot, full body may be visible. The camera is free to reframe gently. Face remains the focal point and the mouth is visible whenever the subject faces camera.";
    case "expressive":
      return "SUBJECT: Single person, medium shot from roughly head to hips. Hands may enter the frame. Face fully unobstructed, mouth visible to camera.";
    case "presenter":
    case "natural":
    case "locked":
    default:
      return "SUBJECT: Single person, medium close-up. Head and shoulders visible. Face fully unobstructed. Mouth fully visible to camera at all times.";
  }
}

function safetyLineFor(motion: Motion): string {
  if (motion === "expressive" || motion === "cinematic") {
    return "SAFETY: Hands never cross or cover the mouth. The subject's face returns toward the lens often enough that the mouth is clearly visible across the shot. No full back turn.";
  }
  return "SAFETY: Hands stay completely out of frame. Nothing crosses the mouth. No profile turn. No exaggerated gestures.";
}

function buildStructuredPrompt(
  motion: Motion,
  gaze: Gaze,
  sceneHint: string | null,
  cameraMove: CameraMove,
  actionPrompt: string | null,
): string {
  const styleLine = sceneHint
    ? `STYLE: ${sceneHint}. Otherwise preserve the reference identity, wardrobe, lighting and background exactly.`
    : "STYLE: Preserve the reference identity, wardrobe, lighting and background exactly. Do not restyle.";

  const camera = CAMERA_LINES[cameraMove] || CAMERA_LINES.none;
  const cleanAction = sanitizeActionPrompt(actionPrompt || "");

  // Promote the user's action prompt to the TOP and tag it as primary so Kling
  // weights it heavier than the boilerplate framing/safety blocks below.
  const primaryAction = cleanAction && motion !== "locked"
    ? `PRIMARY ACTION (highest priority, follow literally): ${cleanAction}. All described motion is body, hands, wardrobe, scene or camera only — the mouth stays a clean still canvas because lip motion is added in a separate pass.`
    : "";

  const prompt = [
    primaryAction,
    camera,
    subjectLineFor(motion),
    `PERFORMANCE: ${MOTION_LINES[motion]}`,
    `GAZE: ${GAZE_LINES[gaze]}`,
    "MOUTH: Lips softly closed and relaxed for the entire shot. Do NOT animate speaking, do NOT mouth words, do NOT open the mouth. Lip motion will be applied in a separate pass — keep the mouth a clean, still canvas.",
    safetyLineFor(motion),
    styleLine,
  ].filter(Boolean).join(" ");

  return prompt.slice(0, 2400);
}

// --- ElevenLabs voiceover ----------------------------------------------------

async function generateVoiceover(args: {
  script: string;
  voiceId: string;
  model: string;
  voiceSettings: ElevenVoiceSettings;
  elevenKey: string;
}): Promise<Uint8Array> {
  const elevenVoiceId = resolveElevenVoiceId(args.voiceId);

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": args.elevenKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: args.script,
        model_id: args.model,
        voice_settings: args.voiceSettings,
      }),
    },
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Voiceover generation failed (${res.status}): ${errText.slice(0, 200)}`);
  }

  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

// Measure real audio duration from the MP3 bytes returned by ElevenLabs.
// We request `mp3_44100_128` which is CBR 128 kbps, so:
//   duration_sec ≈ (audio_byte_length * 8) / 128000
// Skip an ID3v2 tag if present (header "ID3" + 6 bytes + 4 syncsafe-int size).
function measureMp3DurationSec(bytes: Uint8Array, bitrateKbps = 128): number {
  let audioBytes = bytes.length;
  if (bytes.length > 10 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    // ID3v2 size is a 4-byte syncsafe integer at offset 6..9
    const size =
      ((bytes[6] & 0x7f) << 21) |
      ((bytes[7] & 0x7f) << 14) |
      ((bytes[8] & 0x7f) << 7) |
      (bytes[9] & 0x7f);
    audioBytes = Math.max(0, bytes.length - (10 + size));
  }
  return (audioBytes * 8) / (bitrateKbps * 1000);
}

// Rough fallback for clients still on the old word-count path. Only used if
// measureMp3DurationSec returns something obviously bad.
function roughDurationSeconds(script: string, speed: number): number {
  const words = script.trim().split(/\s+/).filter(Boolean).length;
  const wpm = 155 * Math.max(0.5, Math.min(2, speed || 1));
  return (words / wpm) * 60 + 0.6;
}

// --- JWT helpers (HS256) for Kling ---
function base64url(data: Uint8Array): string {
  let bin = "";
  for (const b of data) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createKlingJWT(accessKey: string, secretKey: string): Promise<string> {
  const header = base64url(new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(
    new TextEncoder().encode(JSON.stringify({ iss: accessKey, exp: now + 1800, nbf: now - 5, iat: now })),
  );
  const data = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = base64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data))));
  return `${data}.${sig}`;
}

function getServiceClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const jobId = body.job_id as string;
  const userId = body.user_id as string;
  const creditsReserved = (body.credits_reserved as number) || 0;

  if (!jobId || !userId) {
    return new Response(JSON.stringify({ error: "Missing job_id or user_id" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const KLING_ACCESS_KEY = Deno.env.get("KLING_ACCESS_KEY");
  const KLING_SECRET_KEY = Deno.env.get("KLING_SECRET_KEY");
  const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
  const KILL_SWITCH = (Deno.env.get("TALKING_VIDEO_ENABLED") || "true").toLowerCase() !== "false";
  const svc = getServiceClient();

  const failJob = async (msg: string, status = 500) => {
    await svc.from("generation_queue").update({
      status: "failed",
      error_message: msg,
      completed_at: new Date().toISOString(),
    }).eq("id", jobId);
    if (creditsReserved > 0) {
      await svc.rpc("refund_credits", { p_user_id: userId, p_amount: creditsReserved });
    }
    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  };

  if (!KILL_SWITCH) {
    console.warn("[talking-video] Disabled by TALKING_VIDEO_ENABLED=false");
    return failJob("Talking Video is temporarily disabled", 503);
  }

  if (!KLING_ACCESS_KEY || !KLING_SECRET_KEY) {
    console.error("[talking-video] Missing Kling credentials");
    return failJob("Video service not configured", 500);
  }

  if (!ELEVENLABS_API_KEY) {
    console.error("[talking-video] Missing ELEVENLABS_API_KEY");
    return failJob("Voice service not configured", 500);
  }

  // Defensive guard: avoid re-dispatching a job whose row is already terminal.
  try {
    const { data: existingRow } = await svc
      .from("generated_videos")
      .select("id, status")
      .eq("user_id", userId)
      .eq("workflow_type", "talking_video")
      .filter("metadata->>queue_job_id", "eq", jobId)
      .limit(1)
      .maybeSingle();

    if (existingRow && (existingRow.status === "complete" || existingRow.status === "failed")) {
      console.warn(`[talking-video] Job ${jobId} skipped — generated_videos row already ${existingRow.status}`);
      await svc.from("generation_queue").update({
        status: "completed",
        error_message: `Skipped re-dispatch — video row already ${existingRow.status}`,
        completed_at: new Date().toISOString(),
      }).eq("id", jobId);
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: existingRow.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (guardErr) {
    console.error(`[talking-video] Guard check failed (continuing):`, guardErr);
  }

  try {
    // --- Payload extraction + validation ---
    const imageUrl = body.image_url as string;
    const rawScript = ((body.script as string) || "").trim();
    const voiceId = (body.voice_id as string) || "nPczCjzI2devNBz1zQrb";
    const voiceLanguage = (body.voice_language as string) || "en";
    const voiceSpeedRaw = Number(body.voice_speed ?? 1);
    const voiceSpeedFallback = Math.min(1.2, Math.max(0.7, isFinite(voiceSpeedRaw) ? voiceSpeedRaw : 1));
    const voiceSettings = sanitizeVoiceSettings(body.voice_settings, voiceSpeedFallback);
    const ttsModel = sanitizeTtsModel(body.tts_model);
    const voiceSpeed = voiceSettings.speed;
    const requestedDuration = (body.duration as string) === "10" ? "10" : "5";
    const aspectRatio = (body.aspect_ratio as string) || "9:16";

    const perf = (body.performance as { motion?: Motion; gaze?: Gaze; cameraMove?: CameraMove; actionPrompt?: string } | undefined) || {};
    const ALLOWED_MOTIONS: Motion[] = ["locked", "natural", "presenter", "expressive", "cinematic"];
    const motion: Motion = ALLOWED_MOTIONS.includes(perf.motion as Motion) ? (perf.motion as Motion) : "natural";
    const gaze: Gaze = perf.gaze === "soft" ? "soft" : "camera";
    const ALLOWED_CAMERA: CameraMove[] = ["none", "push_in", "pull_out", "arc"];
    const cameraMove: CameraMove = motion === "cinematic" && ALLOWED_CAMERA.includes(perf.cameraMove as CameraMove)
      ? (perf.cameraMove as CameraMove)
      : "none";
    const actionPrompt = typeof perf.actionPrompt === "string" ? perf.actionPrompt.slice(0, 240) : "";

    if (!imageUrl) throw new Error("image_url (reference model) is required");
    if (!rawScript) throw new Error("script is required");
    if (rawScript.length > 220) throw new Error("Script too long (max 220 characters)");

    // We pick the base video duration AFTER generating the voiceover, using
    // the measured audio length. That's much more accurate than the
    // word-count guess and avoids 10s base clips for 4s scripts (which is
    // what caused the "still talking after audio ends" feel).
    // Provisional pick for logging; will be re-picked below.
    const rough = roughDurationSeconds(rawScript, voiceSpeed);

    // --- Stage 0: generate ElevenLabs voiceover + upload to storage ---
    console.log(`[talking-video] Job ${jobId} — generating voiceover (${rawScript.length} chars, voice=${voiceId}, model=${ttsModel})`);
    const audioBytes = await generateVoiceover({
      script: rawScript,
      voiceId,
      model: ttsModel,
      voiceSettings,
      elevenKey: ELEVENLABS_API_KEY,
    });

    // Real audio duration from the CBR 128kbps MP3 ElevenLabs returned.
    const measuredAudioSec = measureMp3DurationSec(audioBytes, 128);
    const audioDurationSec = measuredAudioSec > 0.2 && measuredAudioSec < 60
      ? measuredAudioSec
      : rough;

    // Pick the tightest base-video length that still fits the audio plus a
    // small ~0.3s tail so lip-sync has room to settle the mouth closed.
    const TAIL_PAD = 0.3;
    const duration: "5" | "10" =
      requestedDuration === "10" ? "10"
        : audioDurationSec + TAIL_PAD > 5 ? "10" : "5";
    if (duration !== requestedDuration) {
      console.log(
        `[talking-video] Auto-bumped duration ${requestedDuration}s → ${duration}s ` +
        `(measured audio ${audioDurationSec.toFixed(2)}s, rough est ${rough.toFixed(2)}s)`,
      );
    } else {
      console.log(
        `[talking-video] Using duration=${duration}s ` +
        `(measured audio ${audioDurationSec.toFixed(2)}s)`,
      );
    }

    const audioPath = `${userId}/talking/${jobId}.mp3`;
    const { error: uploadErr } = await svc.storage
      .from("generated-audio")
      .upload(audioPath, audioBytes, {
        contentType: "audio/mpeg",
        upsert: true,
      });
    if (uploadErr) {
      console.error("[talking-video] Audio upload error:", uploadErr);
      throw new Error("Failed to save voiceover audio");
    }
    console.log(`[talking-video] Job ${jobId} — voiceover uploaded (${audioBytes.length} bytes, ${audioDurationSec.toFixed(2)}s) at ${audioPath}`);

    // --- Stage 1: submit Kling image2video (locked talking-head) ---
    const sceneHint = (body.scene_hint as string) || null;
    const fullPrompt = buildStructuredPrompt(motion, gaze, sceneHint, cameraMove, actionPrompt);
    const negativePrompt = negativePromptFor(motion, cameraMove);

    const jwt = await createKlingJWT(KLING_ACCESS_KEY, KLING_SECRET_KEY);
    const headers = { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" };

    const klingBody = {
      model_name: "kling-v2-master",
      image: imageUrl,
      prompt: fullPrompt,
      negative_prompt: negativePrompt,
      duration,
      mode: "std",
      cfg_scale: 0.5,
    };

    console.log(
      `[talking-video] Job ${jobId} — submitting base video. ` +
      `duration=${duration} ratio=${aspectRatio} motion=${motion} gaze=${gaze} camera=${cameraMove} actionLen=${actionPrompt.length}`,
    );

    const createRes = await fetch(`${KLING_API_BASE}/videos/image2video`, {
      method: "POST",
      headers,
      body: JSON.stringify(klingBody),
    });
    const createResult = await createRes.json();
    console.log(`[talking-video] Kling base-video response:`, JSON.stringify(createResult).slice(0, 500));

    if (!createRes.ok || createResult.code !== 0) {
      throw new Error(createResult.message || `Kling API error: ${createRes.status}`);
    }

    const taskId = createResult.data.task_id as string;

    // --- Persist queue + generated_videos rows ---
    await svc.from("generation_queue").update({
      result: { kling_task_id: taskId, stage: "base_video" },
    }).eq("id", jobId);

    const metadata = {
      stage: "base_video" as const,
      script: rawScript,
      voice_id: voiceId,
      voice_language: voiceLanguage,
      voice_speed: voiceSpeed,
      voice_settings: voiceSettings,
      tts_model: ttsModel,
      audio_storage_path: audioPath,
      audio_duration_sec: Math.round(audioDurationSec * 10) / 10,
      base_video_url: null as string | null,
      lipsync_task_id: null as string | null,
      silent_fallback: false,
      performance: { motion, gaze, cameraMove, actionPrompt: sanitizeActionPrompt(actionPrompt) },
    };

    // Prefer updating the placeholder row created at enqueue time.
    const { data: existing } = await svc
      .from("generated_videos")
      .select("id")
      .eq("user_id", userId)
      .eq("workflow_type", "talking_video")
      .filter("metadata->>queue_job_id", "eq", jobId)
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      await svc.from("generated_videos").update({
        kling_task_id: taskId,
        status: "processing",
        source_image_url: imageUrl,
        prompt: rawScript,
        model_name: "kling-v2-master",
        duration,
        aspect_ratio: aspectRatio,
        metadata: { ...metadata, queue_job_id: jobId },
      }).eq("id", existing.id);
    } else {
      await svc.from("generated_videos").insert({
        user_id: userId,
        source_image_url: imageUrl,
        prompt: rawScript,
        kling_task_id: taskId,
        model_name: "kling-v2-master",
        duration,
        aspect_ratio: aspectRatio,
        status: "processing",
        workflow_type: "talking_video",
        metadata: { ...metadata, queue_job_id: jobId },
      });
    }

    console.log(`[talking-video] Job ${jobId} stage=base_video submitted, kling_task_id=${taskId}`);

    return new Response(JSON.stringify({ ok: true, task_id: taskId, job_id: jobId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[talking-video] Job ${jobId} error:`, errorMsg);
    return failJob(errorMsg, 500);
  }
});
