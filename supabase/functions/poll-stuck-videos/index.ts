// Server-side cron poller for stuck Kling video jobs.
// Runs every minute via pg_cron. No user auth required.
// Resolves rows in `generated_videos` with status='processing' that the
// browser-side poller never finished.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const KLING_API_BASE = "https://api-singapore.klingai.com/v1";
const MAX_BATCH = 100;
const TIMEOUT_MIN = 30;

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

type SvcClient = ReturnType<typeof getServiceClient>;

async function saveVideoToStorage(svc: SvcClient, tempUrl: string, userId: string, taskId: string): Promise<string> {
  const r = await fetch(tempUrl);
  if (!r.ok) throw new Error(`download ${r.status}`);
  const bytes = new Uint8Array(await r.arrayBuffer());
  const path = `${userId}/${taskId}.mp4`;
  const { error } = await svc.storage.from("generated-videos").upload(path, bytes, {
    contentType: "video/mp4",
    upsert: true,
  });
  if (error) return tempUrl;
  return svc.storage.from("generated-videos").getPublicUrl(path).data.publicUrl;
}

async function savePreview(svc: SvcClient, coverUrl: string, userId: string, taskId: string): Promise<string | null> {
  try {
    const r = await fetch(coverUrl);
    if (!r.ok) return null;
    const bytes = new Uint8Array(await r.arrayBuffer());
    const path = `${userId}/${taskId}_preview.jpg`;
    const { error } = await svc.storage.from("generated-videos").upload(path, bytes, {
      contentType: "image/jpeg",
      upsert: true,
    });
    if (error) return null;
    return svc.storage.from("generated-videos").getPublicUrl(path).data.publicUrl;
  } catch {
    return null;
  }
}

async function resolveQueueForTask(svc: SvcClient, taskId: string, finalStatus: "completed" | "failed", videoUrl?: string, errorMsg?: string) {
  // Find queue rows where result->>'kling_task_id' matches and they're still open
  const { data: jobs } = await svc
    .from("generation_queue")
    .select("id, user_id, credits_reserved, status")
    .in("job_type", ["video", "video_multishot"])
    .in("status", ["processing", "queued"])
    .filter("result->>kling_task_id", "eq", taskId);

  if (!jobs || jobs.length === 0) return;

  for (const j of jobs) {
    if (finalStatus === "completed") {
      await svc.from("generation_queue").update({
        status: "completed",
        result: { kling_task_id: taskId, video_url: videoUrl },
        completed_at: new Date().toISOString(),
      }).eq("id", j.id);
    } else {
      await svc.from("generation_queue").update({
        status: "failed",
        error_message: errorMsg || "Video generation failed",
        completed_at: new Date().toISOString(),
      }).eq("id", j.id);
      // Refund credits
      if (j.credits_reserved && j.credits_reserved > 0) {
        await svc.rpc("refund_credits", {
          p_user_id: j.user_id,
          p_amount: j.credits_reserved,
        });
      }
    }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const svc = getServiceClient();
    const KLING_ACCESS_KEY = Deno.env.get("KLING_ACCESS_KEY")!;
    const KLING_SECRET_KEY = Deno.env.get("KLING_SECRET_KEY")!;
    const jwt = await createKlingJWT(KLING_ACCESS_KEY, KLING_SECRET_KEY);
    const headers = { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" };

    // Pull stuck rows from last 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: stuck, error: qErr } = await svc
      .from("generated_videos")
      .select("id, user_id, kling_task_id, model_name, created_at")
      .eq("status", "processing")
      .not("kling_task_id", "is", null)
      .gte("created_at", since)
      .limit(MAX_BATCH);

    if (qErr) {
      console.error("[poll-stuck-videos] query error:", qErr);
      return new Response(JSON.stringify({ error: qErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rows = stuck || [];
    let completed = 0, failed = 0, timedOut = 0, pending = 0, errors = 0;
    const timeoutCutoff = Date.now() - TIMEOUT_MIN * 60 * 1000;

    await Promise.all(rows.map(async (row) => {
      const taskId = row.kling_task_id as string;
      const isOmni = row.model_name === "kling-v3-omni";
      const url = isOmni
        ? `${KLING_API_BASE}/videos/omni-video/${taskId}`
        : `${KLING_API_BASE}/videos/image2video/${taskId}`;

      try {
        const res = await fetch(url, { method: "GET", headers });
        const result = await res.json();

        if (!res.ok || result.code !== 0) {
          // Treat unknown task as a failure if we're past the timeout
          if (new Date(row.created_at).getTime() < timeoutCutoff) {
            await svc.from("generated_videos").update({
              status: "failed",
              error_message: result.message || `Kling status error ${res.status}`,
              completed_at: new Date().toISOString(),
            }).eq("id", row.id);
            await resolveQueueForTask(svc, taskId, "failed", undefined, result.message || "Kling status error");
            timedOut++;
          } else {
            pending++;
          }
          return;
        }

        const taskData = result.data;
        const tStatus = taskData?.task_status;

        if (tStatus === "succeed" && taskData?.task_result?.videos?.length > 0) {
          const tempUrl = taskData.task_result.videos[0].url as string;
          let permanentUrl = tempUrl;
          try { permanentUrl = await saveVideoToStorage(svc, tempUrl, row.user_id, taskId); } catch { /* keep temp */ }

          let previewUrl: string | null = null;
          const coverUrl = taskData.task_result.videos[0].cover_image_url as string | undefined;
          if (coverUrl) previewUrl = await savePreview(svc, coverUrl, row.user_id, taskId);

          const update: Record<string, unknown> = {
            video_url: permanentUrl,
            status: "complete",
            completed_at: new Date().toISOString(),
          };
          if (previewUrl) update.preview_url = previewUrl;

          await svc.from("generated_videos").update(update).eq("id", row.id);
          await resolveQueueForTask(svc, taskId, "completed", permanentUrl);
          completed++;
        } else if (tStatus === "failed") {
          const msg = taskData?.task_status_msg || "Video generation failed";
          await svc.from("generated_videos").update({
            status: "failed",
            error_message: msg,
            completed_at: new Date().toISOString(),
          }).eq("id", row.id);
          await resolveQueueForTask(svc, taskId, "failed", undefined, msg);
          failed++;
        } else {
          // submitted / processing → check timeout
          if (new Date(row.created_at).getTime() < timeoutCutoff) {
            const msg = `Timed out waiting for Kling result after ${TIMEOUT_MIN} minutes`;
            await svc.from("generated_videos").update({
              status: "failed",
              error_message: msg,
              completed_at: new Date().toISOString(),
            }).eq("id", row.id);
            await resolveQueueForTask(svc, taskId, "failed", undefined, msg);
            timedOut++;
          } else {
            pending++;
          }
        }
      } catch (err) {
        errors++;
        console.error(`[poll-stuck-videos] error for ${taskId}:`, err);
      }
    }));

    const summary = { checked: rows.length, completed, failed, timed_out: timedOut, pending, errors };
    console.log("[poll-stuck-videos]", JSON.stringify(summary));
    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[poll-stuck-videos] fatal:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
