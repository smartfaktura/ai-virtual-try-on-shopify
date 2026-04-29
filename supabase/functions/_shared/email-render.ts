// Shared email rendering for admin campaigns + automations.
// Wraps subject/body in the VOVV.AI branded shell + appends marketing-unsubscribe footer.

const BRAND = {
  navy: "#0f172a",
  navyCta: "#1e293b",
  muted: "#64748b",
  stone: "#f5f5f4",
  border: "#e7e5e4",
  white: "#ffffff",
};

export interface RenderOptions {
  bodyHtml: string;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  unsubscribeUrl: string;
  recipientEmail: string;
}

export function renderMarketingEmail(opts: RenderOptions): string {
  const cta = opts.ctaLabel && opts.ctaUrl
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px 0;">
  <tr>
    <td style="background-color:${BRAND.navyCta};border-radius:8px;">
      <a href="${escapeAttr(opts.ctaUrl)}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:'Inter',sans-serif;font-size:14px;font-weight:600;color:${BRAND.white};text-decoration:none;letter-spacing:-0.01em;">
        ${escapeHtml(opts.ctaLabel)}
      </a>
    </td>
  </tr>
</table>`
    : "";

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
          <span style="font-family:'Inter',sans-serif;font-weight:700;font-size:20px;letter-spacing:-0.03em;color:${BRAND.navy};">VOVV.AI</span>
        </td></tr>
        <tr><td style="font-family:'Inter',sans-serif;font-size:15px;color:${BRAND.navy};line-height:1.6;">
          ${opts.bodyHtml}
          ${cta}
        </td></tr>
        <tr><td style="padding-top:40px;border-top:1px solid ${BRAND.border};">
          <p style="font-family:'Inter',sans-serif;font-size:12px;color:${BRAND.muted};margin:16px 0 0 0;line-height:1.5;">
            You're receiving this because you have an account on VOVV.AI.
            <a href="${escapeAttr(opts.unsubscribeUrl)}" style="color:${BRAND.muted};text-decoration:underline;">Unsubscribe from marketing emails</a>.
          </p>
          <p style="font-family:'Inter',sans-serif;font-size:12px;color:${BRAND.muted};margin:4px 0 0 0;">
            &copy; 2026 VOVV.AI · A product by 123Presets
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;").replace(/&/g, "&amp;");
}

export function buildUnsubscribeUrl(baseUrl: string, email: string, token: string): string {
  const u = new URL("/marketing-unsubscribe", baseUrl);
  u.searchParams.set("email", email);
  u.searchParams.set("token", token);
  return u.toString();
}

export function genUnsubscribeToken(email: string): string {
  // Simple deterministic token using email + a project secret salt.
  const salt = Deno.env.get("SUPABASE_JWKS") || "vovv-marketing-salt";
  let h = 5381;
  const s = email.toLowerCase() + salt;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36) + Math.random().toString(36).slice(2, 10);
}

export const RESEND_FROM = "VOVV.AI <notifications@vovv.ai>";
