import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BRAND = {
  navy: "#0f172a",
  navyCta: "#1e293b",
  muted: "#64748b",
  stone: "#f5f5f4",
  border: "#e7e5e4",
  white: "#ffffff",
};

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background-color:${BRAND.white};font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.white};">
    <tr><td align="center" style="padding:40px 20px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td style="padding-bottom:32px;">
          <span style="font-family:'Inter',sans-serif;font-weight:700;font-size:20px;letter-spacing:-0.03em;color:${BRAND.navy};">VOVV.\u200BAI</span>
        </td></tr>
        <tr><td>${content}</td></tr>
        <tr><td style="padding-top:40px;border-top:1px solid ${BRAND.border};margin-top:40px;">
          <p style="font-family:'Inter',sans-serif;font-size:12px;color:${BRAND.muted};margin:16px 0 0 0;line-height:1.5;">&copy; 2026 VOVV.\u200BAI. All rights reserved.</p>
          <p style="font-family:'Inter',sans-serif;font-size:12px;color:${BRAND.muted};margin:4px 0 0 0;">A product by 123Presets</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildEmail(): string {
  return emailWrapper(`
    <h1 style="font-family:'Inter',sans-serif;font-size:24px;font-weight:700;color:${BRAND.navy};margin:0 0 16px 0;letter-spacing:-0.02em;">
      We're back on track
    </h1>
    <p style="font-family:'Inter',sans-serif;font-size:15px;color:${BRAND.navy};line-height:1.6;margin:0 0 8px 0;">
      Hey there,
    </p>
    <p style="font-family:'Inter',sans-serif;font-size:15px;color:${BRAND.muted};line-height:1.6;margin:0 0 24px 0;">
      We recently experienced longer than usual queue waiting times that may have affected some of your generations. We're sorry for the delay.
    </p>
    <div style="background-color:${BRAND.stone};border-radius:8px;padding:20px;margin:0 0 8px 0;">
      <p style="font-family:'Inter',sans-serif;font-size:14px;color:${BRAND.navy};line-height:1.6;margin:0;">
        The issue has been fully resolved, and credits for any failed generations were <strong>automatically refunded</strong> to your account.
      </p>
    </div>
    <p style="font-family:'Inter',sans-serif;font-size:15px;color:${BRAND.muted};line-height:1.6;margin:16px 0 0 0;">
      Everything is running smoothly now — jump back in and keep creating.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px 0;">
      <tr>
        <td style="background-color:${BRAND.navyCta};border-radius:8px;">
          <a href="https://vovv.ai/app" target="_blank" style="display:inline-block;padding:14px 32px;font-family:'Inter',sans-serif;font-size:14px;font-weight:600;color:${BRAND.white};text-decoration:none;letter-spacing:-0.01em;">
            Start Creating
          </a>
        </td>
      </tr>
    </table>
  `);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { secret } = await req.json().catch(() => ({}));
  if (secret !== "send-notice-2025") {
    return new Response(JSON.stringify({ error: "Invalid secret" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY not set" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const emails = [
    "stewartryananderson@gmail.com",
    "johns101609@gmail.com",
    "tyty.meadors@gmail.com",
    "b@x-art.com",
    "ievute040@gmail.com",
    "ileana.santana@aol.com",
    "mgdesigns@sbcglobal.net",
  ];

  const html = buildEmail();
  const subject = "We\u2019re back on track \u2014 VOVV.\u200BAI";
  const results: Array<{ email: string; ok: boolean; detail?: string }> = [];

  for (const email of emails) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "VOVV.\u200BAI <hello@vovv.ai>",
          to: [email],
          subject,
          html,
        }),
      });
      const body = await res.json();
      results.push({ email, ok: res.ok, detail: JSON.stringify(body) });
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      results.push({ email, ok: false, detail: String(err) });
    }
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
