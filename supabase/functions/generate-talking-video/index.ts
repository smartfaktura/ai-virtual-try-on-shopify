// Talking Video orchestrator — stage 1 of the Kling-only pipeline.
//
// Worker mode (dispatched by process-queue):
//   1. Validate payload (script + voice + reference image).
//   2. Submit Kling image2video with locked camera / talking-head prompt.
//   3. Insert generated_videos row with workflow_type='talking_video',
//      metadata = { stage: 'base_video', voice_id, voice_language, voice_speed, script }.
//   4. Save kling_task_id to queue.result so poll-stuck-videos can advance to stage 2.
//
// The chained lip-sync call happens inside poll-stuck-videos when stage 1 completes.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const KLING_API_BASE = "https://api-singapore.klingai.com/v1";

const STABLE_PROMPT_PREFIX =
  "Locked-off camera, zero camera movement, no pan, no zoom, no dolly. " +
  "Subject centred in frame, medium close-up talking-head composition, " +
  "shoulders and head visible, mouth fully visible to camera. " +
  "Eyes engaged with lens. Natural breathing, gentle blinks, subtle micro-expressions. ";

const NEGATIVE_PROMPT =
  "camera movement, panning, zooming, dolly, tracking shot, fast motion, " +
  "head turning away, mouth occluded, hand over mouth, dramatic action, " +
  "warping, distortion, multiple people, crowd";

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
  const KILL_SWITCH = (Deno.env.get("TALKING_VIDEO_ENABLED") || "true").toLowerCase() !== "false";
  const svc = getServiceClient();

  if (!KILL_SWITCH) {
    console.warn("[talking-video] Disabled by TALKING_VIDEO_ENABLED=false — failing job and refunding");
    await svc.from("generation_queue").update({
      status: "failed",
      error_message: "Talking Video is temporarily disabled",
      completed_at: new Date().toISOString(),
    }).eq("id", jobId);
    if (creditsReserved > 0) {
      await svc.rpc("refund_credits", { p_user_id: userId, p_amount: creditsReserved });
    }
    return new Response(JSON.stringify({ error: "Disabled" }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!KLING_ACCESS_KEY || !KLING_SECRET_KEY) {
    console.error("[talking-video] Missing Kling credentials");
    await svc.from("generation_queue").update({
      status: "failed",
      error_message: "Video service not configured",
      completed_at: new Date().toISOString(),
    }).eq("id", jobId);
    await svc.rpc("refund_credits", { p_user_id: userId, p_amount: creditsReserved });
    return new Response(JSON.stringify({ error: "Kling not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // --- Payload extraction + validation ---
    const imageUrl = body.image_url as string;
    const rawScript = ((body.script as string) || "").trim();
    const voiceId = (body.voice_id as string) || "oversea_male1";
    const voiceLanguage = (body.voice_language as string) || "en";
    const voiceSpeedRaw = Number(body.voice_speed ?? 1);
    const voiceSpeed = Math.min(2.0, Math.max(0.8, isFinite(voiceSpeedRaw) ? voiceSpeedRaw : 1));
    const duration = (body.duration as string) === "10" ? "10" : "5";
    const aspectRatio = (body.aspect_ratio as string) || "9:16";

    if (!imageUrl) throw new Error("image_url (reference model) is required");
    if (!rawScript) throw new Error("script is required");
    if (rawScript.length > 120) throw new Error("Script too long (max 120 characters)");

    // Truncate prompt to safe length
    const userIntent = (body.scene_hint as string) || "professional studio setting, neutral background";
    const fullPrompt =
      `${STABLE_PROMPT_PREFIX}${userIntent}. The person is speaking calmly to the camera.`.slice(0, 1800);

    console.log(
      `[talking-video] Job ${jobId} user ${userId} — submitting base video. ` +
      `duration=${duration} ratio=${aspectRatio} voice=${voiceId}/${voiceLanguage} speed=${voiceSpeed}`,
    );

    // --- Stage 1: submit Kling image2video (locked camera, talking-head) ---
    const jwt = await createKlingJWT(KLING_ACCESS_KEY, KLING_SECRET_KEY);
    const headers = { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" };

    const klingBody = {
      model_name: "kling-v2-master",
      image: imageUrl,
      prompt: fullPrompt,
      negative_prompt: NEGATIVE_PROMPT,
      duration,
      mode: "std",
      cfg_scale: 0.5,
      // Note: kling-v2-master does not support camera_control — locked framing
      // is enforced via STABLE_PROMPT_PREFIX + NEGATIVE_PROMPT instead.
    };

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
      stage: "base_video",
      script: rawScript,
      voice_id: voiceId,
      voice_language: voiceLanguage,
      voice_speed: voiceSpeed,
      base_video_url: null as string | null,
      lipsync_task_id: null as string | null,
      silent_fallback: false,
    };

    // Prefer updating the placeholder row created at enqueue time (so the
    // Video Hub card transitions from queued → processing without dupes).
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

    await svc.from("generation_queue").update({
      status: "failed",
      error_message: errorMsg,
      completed_at: new Date().toISOString(),
    }).eq("id", jobId);

    if (creditsReserved > 0) {
      await svc.rpc("refund_credits", { p_user_id: userId, p_amount: creditsReserved });
    }

    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
