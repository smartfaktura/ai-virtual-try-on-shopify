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

  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!
  );
  const { data: { user }, error } = await supabaseAuth.auth.getUser(authHeader.replace("Bearer ", ""));
  if (error || !user) throw new Error("Unauthorized");
  return user.id;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const userId = await getUserId(req);
    const body = await req.json();
    const { action, video_url, audio_url, task_id } = body;

    const accessKey = Deno.env.get("KLING_ACCESS_KEY");
    const secretKey = Deno.env.get("KLING_SECRET_KEY");
    if (!accessKey || !secretKey) throw new Error("Kling credentials not configured");

    const jwt = await createKlingJWT(accessKey, secretKey);
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    };

    // --- Create lip-sync task ---
    if (action === "create") {
      if (!video_url || !audio_url) {
        return new Response(JSON.stringify({ error: "video_url and audio_url are required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`[kling-lip-sync] Creating lip-sync for user ${userId}, video: ${video_url.slice(0, 80)}...`);

      const createRes = await fetch(`${KLING_API_BASE}/videos/lip-sync`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          input: {
            video_url,
            audio_url,
            audio_type: "file",
          },
        }),
      });

      const result = await createRes.json();
      console.log(`[kling-lip-sync] Create response:`, JSON.stringify(result));

      if (!createRes.ok || result.code !== 0) {
        throw new Error(result.message || `Kling Lip-Sync API error: ${createRes.status}`);
      }

      return new Response(JSON.stringify({
        task_id: result.data.task_id,
        status: "submitted",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Poll lip-sync status ---
    if (action === "status") {
      if (!task_id) {
        return new Response(JSON.stringify({ error: "task_id is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const statusRes = await fetch(`${KLING_API_BASE}/videos/lip-sync/${task_id}`, {
        method: "GET",
        headers,
      });

      const statusResult = await statusRes.json();

      if (!statusRes.ok || statusResult.code !== 0) {
        throw new Error(statusResult.message || `Kling status error: ${statusRes.status}`);
      }

      const taskData = statusResult.data;
      const taskStatus = taskData.task_status;

      if (taskStatus === "succeed") {
        const videoUrl = taskData.task_result?.videos?.[0]?.url;
        return new Response(JSON.stringify({
          status: "succeed",
          video_url: videoUrl,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (taskStatus === "failed") {
        return new Response(JSON.stringify({
          status: "failed",
          error: taskData.task_status_msg || "Lip-sync failed",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        status: taskStatus || "processing",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use 'create' or 'status'." }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[kling-lip-sync] Error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
