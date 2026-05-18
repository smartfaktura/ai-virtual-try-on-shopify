import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const KLING_API_BASE = "https://api-singapore.klingai.com/v1";

function base64url(data: Uint8Array): string {
  let bin = "";
  for (const b of data) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function createKlingJWT(accessKey: string, secretKey: string): Promise<string> {
  const header = base64url(new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(new TextEncoder().encode(JSON.stringify({ iss: accessKey, exp: now + 1800, nbf: now - 5, iat: now })));
  const data = `${header}.${payload}`;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secretKey), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = base64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data))));
  return `${data}.${sig}`;
}

// Female-leaning candidates from Kling lip-sync catalog
const CANDIDATES = [
  "girlfriend_4_speech02",
  "chat1_female_new-3",
  "chat_0407_5-1",
  "chengshu_jiejie",
  "you_pingjing",
  "calm_story1",
  "ai_shatang",
  "genshin_kirara",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "submit"; // submit | poll
  const taskId = url.searchParams.get("task_id");

  const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const jwt = await createKlingJWT(Deno.env.get("KLING_ACCESS_KEY")!, Deno.env.get("KLING_SECRET_KEY")!);
  const headers = { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" };

  if (action === "poll" && taskId) {
    const r = await fetch(`${KLING_API_BASE}/videos/lip-sync/${taskId}`, { headers });
    const j = await r.json();
    return new Response(JSON.stringify(j, null, 2), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  if (action === "poll-all") {
    const ids = (url.searchParams.get("ids") || "").split(",").filter(Boolean);
    const labels = (url.searchParams.get("labels") || "").split(",");
    const out: any[] = [];
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const label = labels[i] || id;
      const r = await fetch(`${KLING_API_BASE}/videos/lip-sync/${id}`, { headers });
      const j = await r.json();
      const videoUrl = j.data?.task_result?.videos?.[0]?.url;
      let publicUrl: string | null = null;
      let err: string | null = null;
      if (videoUrl) {
        try {
          const vr = await fetch(videoUrl);
          if (!vr.ok) {
            err = `fetch ${vr.status}`;
          } else {
            const bytes = new Uint8Array(await vr.arrayBuffer());
            const path = `probe/${label}.mp4`;
            const { error: upErr } = await svc.storage.from("voice-samples").upload(path, bytes, { contentType: "video/mp4", upsert: true });
            if (upErr) err = `upload: ${upErr.message}`;
            else publicUrl = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/voice-samples/${path}`;
          }
        } catch (e) { err = String(e); }
      } else {
        err = "no video url";
      }
      out.push({ task_id: id, label, status: j.data?.task_status, public_url: publicUrl, err });
    }
    return new Response(JSON.stringify(out, null, 2), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // submit
  const path = "fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/885307269657796671.mp4";
  const { data: signed } = await svc.storage.from("generated-videos").createSignedUrl(path, 3600);
  if (!signed?.signedUrl) {
    return new Response(JSON.stringify({ error: "sign failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const videoUrl = signed.signedUrl;

  const results: any[] = [];
  for (const voiceId of CANDIDATES) {
    for (const lang of ["en", "zh"]) {
      try {
        const r = await fetch(`${KLING_API_BASE}/videos/lip-sync`, {
          method: "POST", headers,
          body: JSON.stringify({
            input: {
              video_url: videoUrl, mode: "text2video",
              text: "Hi, welcome to our new collection. Discover timeless pieces designed for you.",
              voice_id: voiceId, voice_language: lang, voice_speed: 1,
            },
          }),
        });
        const j = await r.json();
        const entry = { voice_id: voiceId, lang, http: r.status, code: j.code, message: j.message, task_id: j.data?.task_id ?? null };
        results.push(entry);
        if (j.code === 0) break; // success on this lang, no need to try other
      } catch (e) {
        results.push({ voice_id: voiceId, lang, error: String(e) });
      }
    }
  }
  return new Response(JSON.stringify({ results }, null, 2), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
