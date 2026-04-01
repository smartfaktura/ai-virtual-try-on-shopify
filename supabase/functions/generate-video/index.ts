import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const KLING_API_BASE = "https://api-singapore.klingai.com/v1";

// --- JWT helpers (HS256) ---
function base64url(data: Uint8Array): string {
  let bin = "";
  for (const b of data) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createKlingJWT(accessKey: string, secretKey: string): Promise<string> {
  const header = base64url(new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(
    new TextEncoder().encode(JSON.stringify({ iss: accessKey, exp: now + 1800, nbf: now - 5, iat: now }))
  );
  const data = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = base64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data))));
  return `${data}.${sig}`;
}

// --- Supabase service client ---
function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

// --- Auth helper (for user-facing endpoints) ---
async function getUserId(req: Request): Promise<string> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims) throw new Error("Unauthorized");
  return data.claims.sub as string;
}

// --- Helper: download video from Kling and save to storage ---
async function saveVideoToStorage(
  serviceClient: ReturnType<typeof getServiceClient>,
  tempVideoUrl: string,
  userId: string,
  taskId: string
): Promise<string> {
  const videoRes = await fetch(tempVideoUrl);
  if (!videoRes.ok) throw new Error(`Failed to download video: ${videoRes.status}`);

  const videoBytes = new Uint8Array(await videoRes.arrayBuffer());
  const storagePath = `${userId}/${taskId}.mp4`;

  const { error: uploadError } = await serviceClient.storage
    .from("generated-videos")
    .upload(storagePath, videoBytes, { contentType: "video/mp4", upsert: true });

  if (uploadError) {
    console.error("[generate-video] Storage upload error:", uploadError);
    return tempVideoUrl;
  }

  const { data: publicUrlData } = serviceClient.storage
    .from("generated-videos")
    .getPublicUrl(storagePath);
  return publicUrlData.publicUrl;
}

// =============================================
// WORKER MODE — called by process-queue
// =============================================
async function handleWorkerMode(body: Record<string, unknown>) {
  const jobId = body.job_id as string;
  const userId = body.user_id as string;
  const creditsReserved = body.credits_reserved as number;

  const KLING_ACCESS_KEY = Deno.env.get("KLING_ACCESS_KEY")!;
  const KLING_SECRET_KEY = Deno.env.get("KLING_SECRET_KEY")!;
  const serviceClient = getServiceClient();

  try {
    const jwt = await createKlingJWT(KLING_ACCESS_KEY, KLING_SECRET_KEY);
    const headers = { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" };

    // Extract video params from payload
    const imageUrl = body.image_url as string;
    const prompt = (body.prompt as string) || "";
    const duration = (body.duration as string) || "5";
    const modelName = (body.model_name as string) || "kling-v3";
    const mode = (body.mode as string) || "pro";
    const aspectRatio = (body.aspect_ratio as string) || "16:9";
    const negativePrompt = body.negative_prompt as string | undefined;
    const cfgScale = body.cfg_scale as number | undefined;
    const withAudio = body.with_audio as boolean;
    const projectId = body.project_id as string | undefined;
    const workflowType = body.workflow_type as string | undefined;

    if (!imageUrl) throw new Error("image_url is required in payload");

    console.log(`[generate-video:worker] Job ${jobId}, user ${userId}, model=${modelName}, duration=${duration}, aspect_ratio=${aspectRatio}`);

    // 1. Create Kling task
    const klingBody: Record<string, unknown> = {
      model_name: modelName,
      image: imageUrl,
      duration,
      mode,
    };
    if (prompt) klingBody.prompt = prompt;
    if (negativePrompt) klingBody.negative_prompt = negativePrompt;
    if (aspectRatio) klingBody.aspect_ratio = aspectRatio;
    if (typeof cfgScale === "number") klingBody.cfg_scale = cfgScale;
    klingBody.sound = withAudio ? "on" : "off";

    // Note: kling-v3 image2video does NOT support structured camera_control.
    // All camera motion is driven via prompt text only.

    const createRes = await fetch(`${KLING_API_BASE}/videos/image2video`, {
      method: "POST",
      headers,
      body: JSON.stringify(klingBody),
    });

    const createResult = await createRes.json();
    console.log(`[generate-video:worker] Kling create response:`, JSON.stringify(createResult));

    if (!createRes.ok || createResult.code !== 0) {
      throw new Error(createResult.message || `Kling API error: ${createRes.status}`);
    }

    const taskId = createResult.data.task_id;

    // Save kling_task_id to queue result for debugging
    await serviceClient
      .from("generation_queue")
      .update({ result: { kling_task_id: taskId, status: "submitted" } })
      .eq("id", jobId);

    // Insert generated_videos row (processing state)
    const dbRow: Record<string, unknown> = {
      user_id: userId,
      source_image_url: imageUrl,
      prompt,
      kling_task_id: taskId,
      model_name: modelName,
      duration,
      aspect_ratio: aspectRatio,
      status: "processing",
    };
    if (negativePrompt) dbRow.negative_prompt = negativePrompt;
    if (typeof cfgScale === "number") dbRow.cfg_scale = cfgScale;
    if (projectId) dbRow.project_id = projectId;
    if (workflowType) dbRow.workflow_type = workflowType;
    // Persist camera motion for download naming & metadata display
    const cameraMotionValue = body.cameraMotion as string | undefined;
    if (cameraMotionValue) dbRow.camera_type = cameraMotionValue;

    await serviceClient.from("generated_videos").insert(dbRow);

    // Worker is submit-only — client polls via action: "status"
    console.log(`[generate-video:worker] Job ${jobId} submitted, kling_task_id=${taskId}. Client will poll.`);

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[generate-video:worker] Job ${jobId} error:`, errorMsg);

    // Mark queue job as failed
    await serviceClient
      .from("generation_queue")
      .update({
        status: "failed",
        error_message: errorMsg,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    // Refund credits
    await serviceClient.rpc("refund_credits", { p_user_id: userId, p_amount: creditsReserved });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // ---- WORKER MODE (called by process-queue) ----
    const isQueueInternal = req.headers.get("x-queue-internal") === "true";
    if (isQueueInternal && body.job_id) {
      // Fire-and-forget style: start worker, return 200 immediately
      // The worker updates generation_queue directly
      handleWorkerMode(body).catch(err => {
        console.error("[generate-video] Worker mode unhandled error:", err);
      });

      return new Response(
        JSON.stringify({ ok: true, job_id: body.job_id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ---- USER-FACING ENDPOINTS ----
    const userId = await getUserId(req);
    const { action } = body;

    const KLING_ACCESS_KEY = Deno.env.get("KLING_ACCESS_KEY");
    const KLING_SECRET_KEY = Deno.env.get("KLING_SECRET_KEY");
    if (!KLING_ACCESS_KEY || !KLING_SECRET_KEY) {
      throw new Error("Kling AI credentials not configured");
    }

    const jwt = await createKlingJWT(KLING_ACCESS_KEY, KLING_SECRET_KEY);
    const headers = {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    };

    // ---- STATUS poll (backward compat) ----
    if (action === "status") {
      const { task_id } = body;
      if (!task_id) throw new Error("task_id is required");

      const res = await fetch(`${KLING_API_BASE}/videos/image2video/${task_id}`, {
        method: "GET",
        headers,
      });

      const result = await res.json();
      if (!res.ok || result.code !== 0) {
        throw new Error(result.message || `Kling API status error: ${res.status}`);
      }

      const taskData = result.data;
      const response: Record<string, unknown> = {
        status: taskData.task_status,
        task_id: taskData.task_id,
      };

      const serviceClient = getServiceClient();
      const queueJobId = body.queue_job_id as string | undefined;

      if (taskData.task_status === "succeed" && taskData.task_result?.videos?.length > 0) {
        const tempVideoUrl = taskData.task_result.videos[0].url;
        let permanentUrl = tempVideoUrl;

        // Extract Kling cover image for lightweight grid thumbnails
        const coverImageUrl = taskData.task_result.videos[0].cover_image_url as string | undefined;
        let savedPreviewUrl: string | undefined;

        try {
          permanentUrl = await saveVideoToStorage(serviceClient, tempVideoUrl, userId, task_id);

          // Save cover image to storage as preview thumbnail
          if (coverImageUrl) {
            try {
              const coverRes = await fetch(coverImageUrl);
              if (coverRes.ok) {
                const coverBytes = new Uint8Array(await coverRes.arrayBuffer());
                const previewPath = `${userId}/${task_id}_preview.jpg`;
                const { error: previewUploadErr } = await serviceClient.storage
                  .from("generated-videos")
                  .upload(previewPath, coverBytes, { contentType: "image/jpeg", upsert: true });
                if (!previewUploadErr) {
                  const { data: previewUrlData } = serviceClient.storage
                    .from("generated-videos")
                    .getPublicUrl(previewPath);
                  savedPreviewUrl = previewUrlData.publicUrl;
                }
              }
            } catch (previewErr) {
              console.error("[generate-video] Preview save error:", previewErr);
            }
          }

          const updateData: Record<string, unknown> = {
            video_url: permanentUrl,
            status: "complete",
            completed_at: new Date().toISOString(),
          };
          if (savedPreviewUrl) updateData.preview_url = savedPreviewUrl;

          await serviceClient
            .from("generated_videos")
            .update(updateData)
            .eq("kling_task_id", task_id);
        } catch (saveErr) {
          console.error("[generate-video] Error saving video permanently:", saveErr);
        }

        // Also complete the queue job so useGenerationQueue sees it
        if (queueJobId) {
          await serviceClient
            .from("generation_queue")
            .update({
              status: "completed",
              result: { kling_task_id: task_id, video_url: permanentUrl },
              completed_at: new Date().toISOString(),
            })
            .eq("id", queueJobId);
        }

        response.video_url = permanentUrl;
        response.duration = taskData.task_result.videos[0].duration;
      }

      if (taskData.task_status === "failed") {
        response.error = taskData.task_status_msg || "Video generation failed";
        try {
          await serviceClient
            .from("generated_videos")
            .update({ status: "failed", error_message: response.error as string, completed_at: new Date().toISOString() })
            .eq("kling_task_id", task_id);

          // Also fail the queue job and refund credits
          if (queueJobId) {
            const { data: queueRow } = await serviceClient
              .from("generation_queue")
              .select("credits_reserved, user_id")
              .eq("id", queueJobId)
              .single();

            await serviceClient
              .from("generation_queue")
              .update({
                status: "failed",
                error_message: response.error as string,
                completed_at: new Date().toISOString(),
              })
              .eq("id", queueJobId);

            if (queueRow) {
              await serviceClient.rpc("refund_credits", {
                p_user_id: queueRow.user_id,
                p_amount: queueRow.credits_reserved,
              });
            }
          }
        } catch (dbErr) {
          console.error("[generate-video] DB update (failed) error:", dbErr);
        }
      }

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- RECOVER stuck videos ----
    if (action === "recover") {
      const serviceClient = getServiceClient();
      const { data: stuckVideos, error: queryError } = await serviceClient
        .from("generated_videos")
        .select("kling_task_id")
        .eq("user_id", userId)
        .eq("status", "processing")
        .not("kling_task_id", "is", null);

      if (queryError) {
        return new Response(JSON.stringify({ recovered: 0, error: queryError.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!stuckVideos || stuckVideos.length === 0) {
        return new Response(JSON.stringify({ recovered: 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let recovered = 0;
      for (const video of stuckVideos) {
        if (!video.kling_task_id) continue;
        try {
          const statusRes = await fetch(`${KLING_API_BASE}/videos/image2video/${video.kling_task_id}`, {
            method: "GET",
            headers,
          });
          const statusResult = await statusRes.json();
          if (!statusRes.ok || statusResult.code !== 0) continue;

          const taskData = statusResult.data;
          if (taskData.task_status === "succeed" && taskData.task_result?.videos?.length > 0) {
            let permanentUrl = taskData.task_result.videos[0].url;
            let savedPreviewUrl: string | undefined;
            try {
              permanentUrl = await saveVideoToStorage(serviceClient, permanentUrl, userId, video.kling_task_id);
            } catch (_) { /* keep temp url */ }

            // Capture cover image as preview
            const coverImageUrl = taskData.task_result.videos[0].cover_image_url as string | undefined;
            if (coverImageUrl) {
              try {
                const coverRes = await fetch(coverImageUrl);
                if (coverRes.ok) {
                  const coverBytes = new Uint8Array(await coverRes.arrayBuffer());
                  const previewPath = `${userId}/${video.kling_task_id}_preview.jpg`;
                  const { error: pErr } = await serviceClient.storage
                    .from("generated-videos")
                    .upload(previewPath, coverBytes, { contentType: "image/jpeg", upsert: true });
                  if (!pErr) {
                    const { data: pData } = serviceClient.storage.from("generated-videos").getPublicUrl(previewPath);
                    savedPreviewUrl = pData.publicUrl;
                  }
                }
              } catch (_) { /* ignore preview errors */ }
            }

            const updateData: Record<string, unknown> = {
              video_url: permanentUrl,
              status: "complete",
              completed_at: new Date().toISOString(),
            };
            if (savedPreviewUrl) updateData.preview_url = savedPreviewUrl;

            await serviceClient
              .from("generated_videos")
              .update(updateData)
              .eq("kling_task_id", video.kling_task_id);
            recovered++;
          } else if (taskData.task_status === "failed") {
            await serviceClient
              .from("generated_videos")
              .update({ status: "failed", error_message: taskData.task_status_msg || "Failed", completed_at: new Date().toISOString() })
              .eq("kling_task_id", video.kling_task_id);
            recovered++;
          }
        } catch (err) {
          console.error(`[generate-video] Recovery error for ${video.kling_task_id}:`, err);
        }
      }

      // Also resolve stuck generation_queue entries for video jobs
      const { data: stuckQueueJobs } = await serviceClient
        .from("generation_queue")
        .select("id, result, credits_reserved, user_id")
        .eq("user_id", userId)
        .eq("job_type", "video")
        .in("status", ["processing", "queued"]);

      let queueResolved = 0;
      if (stuckQueueJobs && stuckQueueJobs.length > 0) {
        for (const qJob of stuckQueueJobs) {
          const klingTaskId = (qJob.result as Record<string, unknown>)?.kling_task_id as string | undefined;
          if (!klingTaskId) continue;

          // Check if the corresponding generated_videos row has resolved
          const { data: videoRow } = await serviceClient
            .from("generated_videos")
            .select("status, video_url")
            .eq("kling_task_id", klingTaskId)
            .single();

          if (!videoRow) continue;

          if (videoRow.status === "complete") {
            await serviceClient
              .from("generation_queue")
              .update({
                status: "completed",
                result: { kling_task_id: klingTaskId, video_url: videoRow.video_url },
                completed_at: new Date().toISOString(),
              })
              .eq("id", qJob.id);
            queueResolved++;
          } else if (videoRow.status === "failed") {
            await serviceClient
              .from("generation_queue")
              .update({
                status: "failed",
                error_message: "Video generation failed",
                completed_at: new Date().toISOString(),
              })
              .eq("id", qJob.id);

            await serviceClient.rpc("refund_credits", {
              p_user_id: qJob.user_id,
              p_amount: qJob.credits_reserved,
            });
            queueResolved++;
          }
        }
      }

      return new Response(JSON.stringify({ recovered, checked: stuckVideos.length, queue_resolved: queueResolved }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (e) {
    console.error("[generate-video] Error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
