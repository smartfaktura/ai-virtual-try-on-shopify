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

// --- Auth helper ---
async function getUserId(req: Request): Promise<string> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) throw new Error("Unauthorized");
  return data.user.id;
}

// --- Helper: check Kling status and update DB for a single task ---
async function checkAndUpdateTask(
  serviceClient: ReturnType<typeof getServiceClient>,
  taskId: string,
  userId: string,
  headers: Record<string, string>
): Promise<"succeed" | "failed" | "processing"> {
  const res = await fetch(`${KLING_API_BASE}/videos/image2video/${taskId}`, {
    method: "GET",
    headers,
  });

  const result = await res.json();
  if (!res.ok || result.code !== 0) {
    console.error(`[generate-video] Kling status error for ${taskId}:`, result.message);
    return "processing"; // treat API errors as still processing
  }

  const taskData = result.data;

  if (taskData.task_status === "succeed" && taskData.task_result?.videos?.length > 0) {
    const tempVideoUrl = taskData.task_result.videos[0].url;
    let permanentUrl = tempVideoUrl;

    try {
      const videoRes = await fetch(tempVideoUrl);
      if (videoRes.ok) {
        const videoBytes = new Uint8Array(await videoRes.arrayBuffer());
        const storagePath = `${userId}/${taskId}.mp4`;

        const { error: uploadError } = await serviceClient.storage
          .from("generated-videos")
          .upload(storagePath, videoBytes, { contentType: "video/mp4", upsert: true });

        if (!uploadError) {
          const { data: publicUrlData } = serviceClient.storage
            .from("generated-videos")
            .getPublicUrl(storagePath);
          permanentUrl = publicUrlData.publicUrl;
        }
      }
    } catch (saveErr) {
      console.error(`[generate-video] Error saving video for ${taskId}:`, saveErr);
    }

    await serviceClient
      .from("generated_videos")
      .update({ video_url: permanentUrl, status: "complete", completed_at: new Date().toISOString() })
      .eq("kling_task_id", taskId);

    return "succeed";
  }

  if (taskData.task_status === "failed") {
    const errorMsg = taskData.task_status_msg || "Video generation failed";
    await serviceClient
      .from("generated_videos")
      .update({ status: "failed", error_message: errorMsg, completed_at: new Date().toISOString() })
      .eq("kling_task_id", taskId);

    return "failed";
  }

  return "processing";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const userId = await getUserId(req);

    const KLING_ACCESS_KEY = Deno.env.get("KLING_ACCESS_KEY");
    const KLING_SECRET_KEY = Deno.env.get("KLING_SECRET_KEY");
    if (!KLING_ACCESS_KEY || !KLING_SECRET_KEY) {
      throw new Error("Kling AI credentials not configured");
    }

    const body = await req.json();
    const { action } = body;

    const jwt = await createKlingJWT(KLING_ACCESS_KEY, KLING_SECRET_KEY);
    const headers = {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    };

    // ---- CREATE task ----
    if (action === "create") {
      const { image_url, image_tail, prompt, duration = "5", model_name = "kling-v2-1", mode = "std", aspect_ratio = "16:9" } = body;

      if (!image_url) throw new Error("image_url is required");

      console.log(`[generate-video] Creating task for user ${userId}, model=${model_name}, mode=${mode}, duration=${duration}, has_tail=${!!image_tail}`);

      const klingBody: Record<string, unknown> = {
        model_name,
        image: image_url,
        duration,
        mode,
      };

      if (prompt) klingBody.prompt = prompt;
      if (aspect_ratio) klingBody.aspect_ratio = aspect_ratio;
      if (image_tail) klingBody.image_tail = image_tail;

      const res = await fetch(`${KLING_API_BASE}/videos/image2video`, {
        method: "POST",
        headers,
        body: JSON.stringify(klingBody),
      });

      const result = await res.json();
      console.log(`[generate-video] Kling create response:`, JSON.stringify(result));

      if (!res.ok || result.code !== 0) {
        throw new Error(result.message || `Kling API error: ${res.status}`);
      }

      const taskId = result.data.task_id;

      const serviceClient = getServiceClient();
      const { error: dbError } = await serviceClient.from("generated_videos").insert({
        user_id: userId,
        source_image_url: image_url,
        prompt: prompt || "",
        kling_task_id: taskId,
        model_name,
        duration,
        aspect_ratio,
        status: "processing",
      });

      if (dbError) {
        console.error("[generate-video] DB insert error:", dbError);
      }

      return new Response(
        JSON.stringify({ task_id: taskId, status: result.data.task_status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ---- STATUS poll ----
    if (action === "status") {
      const { task_id } = body;
      if (!task_id) throw new Error("task_id is required");

      const res = await fetch(`${KLING_API_BASE}/videos/image2video/${task_id}`, {
        method: "GET",
        headers,
      });

      const result = await res.json();
      console.log(`[generate-video] Kling status response for ${task_id}:`, JSON.stringify(result));

      if (!res.ok || result.code !== 0) {
        throw new Error(result.message || `Kling API status error: ${res.status}`);
      }

      const taskData = result.data;
      const response: Record<string, unknown> = {
        status: taskData.task_status,
        task_id: taskData.task_id,
      };

      if (taskData.task_status === "succeed" && taskData.task_result?.videos?.length > 0) {
        const tempVideoUrl = taskData.task_result.videos[0].url;
        const videoDuration = taskData.task_result.videos[0].duration;

        let permanentUrl = tempVideoUrl;

        try {
          console.log(`[generate-video] Downloading MP4 from Kling for task ${task_id}...`);
          const videoRes = await fetch(tempVideoUrl);
          if (!videoRes.ok) throw new Error(`Failed to download video: ${videoRes.status}`);

          const videoBuffer = await videoRes.arrayBuffer();
          const videoBytes = new Uint8Array(videoBuffer);
          console.log(`[generate-video] Downloaded ${videoBytes.length} bytes`);

          const serviceClient = getServiceClient();
          const storagePath = `${userId}/${task_id}.mp4`;

          const { error: uploadError } = await serviceClient.storage
            .from("generated-videos")
            .upload(storagePath, videoBytes, { contentType: "video/mp4", upsert: true });

          if (uploadError) {
            console.error("[generate-video] Storage upload error:", uploadError);
          } else {
            const { data: publicUrlData } = serviceClient.storage
              .from("generated-videos")
              .getPublicUrl(storagePath);
            permanentUrl = publicUrlData.publicUrl;
            console.log(`[generate-video] Video stored permanently at: ${permanentUrl}`);
          }

          const { error: dbUpdateError } = await serviceClient
            .from("generated_videos")
            .update({ video_url: permanentUrl, status: "complete", completed_at: new Date().toISOString() })
            .eq("kling_task_id", task_id);

          if (dbUpdateError) {
            console.error("[generate-video] DB update error:", dbUpdateError);
          }
        } catch (saveErr) {
          console.error("[generate-video] Error saving video permanently:", saveErr);
        }

        response.video_url = permanentUrl;
        response.duration = videoDuration;
      }

      if (taskData.task_status === "failed") {
        response.error = taskData.task_status_msg || "Video generation failed";

        try {
          const serviceClient = getServiceClient();
          await serviceClient
            .from("generated_videos")
            .update({ status: "failed", error_message: response.error as string, completed_at: new Date().toISOString() })
            .eq("kling_task_id", task_id);
        } catch (dbErr) {
          console.error("[generate-video] DB update (failed) error:", dbErr);
        }
      }

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- RECOVER stuck videos (status-only, zero Kling cost) ----
    if (action === "recover") {
      const serviceClient = getServiceClient();

      // Find all processing videos for this user older than 10 minutes
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { data: stuckVideos, error: queryError } = await serviceClient
        .from("generated_videos")
        .select("kling_task_id")
        .eq("user_id", userId)
        .eq("status", "processing")
        .lt("created_at", tenMinutesAgo)
        .not("kling_task_id", "is", null);

      if (queryError) {
        console.error("[generate-video] Recovery query error:", queryError);
        return new Response(JSON.stringify({ recovered: 0, error: queryError.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!stuckVideos || stuckVideos.length === 0) {
        return new Response(JSON.stringify({ recovered: 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`[generate-video] Recovering ${stuckVideos.length} stuck video(s) for user ${userId}`);

      let recovered = 0;
      for (const video of stuckVideos) {
        if (!video.kling_task_id) continue;
        try {
          const result = await checkAndUpdateTask(serviceClient, video.kling_task_id, userId, headers);
          if (result !== "processing") {
            recovered++;
            console.log(`[generate-video] Recovered task ${video.kling_task_id} -> ${result}`);
          }
        } catch (err) {
          console.error(`[generate-video] Error recovering task ${video.kling_task_id}:`, err);
        }
      }

      return new Response(JSON.stringify({ recovered, checked: stuckVideos.length }), {
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
