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

const VOICES_EN = ["commercial_lady_en_f-v1", "reader_en_m-v1", "uk_man2", "uk_boy1"];
const VOICES_ZH = ["oversea_male1", "oversea_male2", "oversea_female1", "oversea_female2"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const jwt = await createKlingJWT(Deno.env.get("KLING_ACCESS_KEY")!, Deno.env.get("KLING_SECRET_KEY")!);
  const headers = { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" };

  // Use confirmed-working base video
  const path = "fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/885307269657796671.mp4";
  const { data: signed, error: signErr } = await svc.storage.from("generated-videos").createSignedUrl(path, 3600);
  if (signErr || !signed?.signedUrl) {
    return new Response(JSON.stringify({ error: "sign failed", details: signErr }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const videoUrl = signed.signedUrl;

  const results: any[] = [];
  const candidates: Array<{ id: string; lang: string }> = [
    ...VOICES_EN.map(id => ({ id, lang: "en" })),
    ...VOICES_ZH.map(id => ({ id, lang: "zh" })),
  ];

  for (const c of candidates) {
    try {
      const r = await fetch(`${KLING_API_BASE}/videos/lip-sync`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          input: {
            video_url: videoUrl,
            mode: "text2video",
            text: "Hello, this is a voice test.",
            voice_id: c.id,
            voice_language: c.lang,
            voice_speed: 1,
          },
        }),
      });
      const j = await r.json();
      results.push({ voice_id: c.id, lang: c.lang, http: r.status, code: j.code, message: j.message, task_id: j.data?.task_id ?? null });
    } catch (e) {
      results.push({ voice_id: c.id, lang: c.lang, error: String(e) });
    }
  }

  // Retry oversea_* with en if zh failed
  for (const c of VOICES_ZH) {
    const zhResult = results.find(r => r.voice_id === c && r.lang === "zh");
    if (zhResult?.code !== 0) {
      try {
        const r = await fetch(`${KLING_API_BASE}/videos/lip-sync`, {
          method: "POST", headers,
          body: JSON.stringify({
            input: { video_url: videoUrl, mode: "text2video", text: "Hello, this is a voice test.", voice_id: c, voice_language: "en", voice_speed: 1 },
          }),
        });
        const j = await r.json();
        results.push({ voice_id: c, lang: "en(retry)", http: r.status, code: j.code, message: j.message, task_id: j.data?.task_id ?? null });
      } catch (e) {
        results.push({ voice_id: c, lang: "en(retry)", error: String(e) });
      }
    }
  }

  return new Response(JSON.stringify({ results }, null, 2), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
