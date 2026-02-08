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
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims) throw new Error("Unauthorized");
  return data.claims.sub as string;
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
      const { image_url, prompt, duration = "5", model_name = "kling-v2-1", mode = "std", aspect_ratio = "16:9" } = body;

      if (!image_url) throw new Error("image_url is required");

      console.log(`[generate-video] Creating task for user ${userId}, model=${model_name}, mode=${mode}, duration=${duration}`);

      const klingBody: Record<string, unknown> = {
        model_name,
        image: image_url,
        duration,
        mode,
      };

      if (prompt) klingBody.prompt = prompt;
      if (aspect_ratio) klingBody.aspect_ratio = aspect_ratio;

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

      return new Response(
        JSON.stringify({ task_id: result.data.task_id, status: result.data.task_status }),
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
        response.video_url = taskData.task_result.videos[0].url;
        response.duration = taskData.task_result.videos[0].duration;
      }

      if (taskData.task_status === "failed") {
        response.error = taskData.task_status_msg || "Video generation failed";
      }

      return new Response(JSON.stringify(response), {
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
