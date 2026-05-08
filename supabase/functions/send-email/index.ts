import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── VOVV.‌AI Brand Colors ──────────────────────────────────────────────────
const BRAND = {
  navy: "#0f172a",        // Primary text
  navyCta: "#1e293b",     // CTA button
  muted: "#64748b",       // Secondary text
  stone: "#f5f5f4",       // Accent surface
  border: "#e7e5e4",      // Border
  white: "#ffffff",       // Body background
};

// ── Shared layout wrapper ─────────────────────────────────────────────────
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
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <!-- Wordmark -->
          <tr>
            <td style="padding-bottom:32px;">
              <span style="font-family:'Inter',sans-serif;font-weight:700;font-size:20px;letter-spacing:-0.03em;color:${BRAND.navy};">VOVV.‌AI</span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td>
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding-top:40px;border-top:1px solid ${BRAND.border};margin-top:40px;">
              <p style="font-family:'Inter',sans-serif;font-size:12px;color:${BRAND.muted};margin:16px 0 0 0;line-height:1.5;">
                &copy; 2026 VOVV.‌AI. All rights reserved.
              </p>
              <p style="font-family:'Inter',sans-serif;font-size:12px;color:${BRAND.muted};margin:4px 0 0 0;">
                A product by 123Presets
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── CTA Button ────────────────────────────────────────────────────────────
function ctaButton(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px 0;">
  <tr>
    <td style="background-color:${BRAND.navyCta};border-radius:8px;">
      <a href="${href}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:'Inter',sans-serif;font-size:14px;font-weight:600;color:${BRAND.white};text-decoration:none;letter-spacing:-0.01em;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

// ── Templates ─────────────────────────────────────────────────────────────

function welcomeEmail(data: { displayName?: string }): string {
  const name = data.displayName || "there";
  return emailWrapper(`
    <h1 style="font-family:'Inter',sans-serif;font-size:24px;font-weight:700;color:${BRAND.navy};margin:0 0 16px 0;letter-spacing:-0.02em;">
      Welcome to VOVV.‌AI
    </h1>
    <p style="font-family:'Inter',sans-serif;font-size:15px;color:${BRAND.navy};line-height:1.6;margin:0 0 8px 0;">
      Hey ${name},
    </p>
    <p style="font-family:'Inter',sans-serif;font-size:15px;color:${BRAND.muted};line-height:1.6;margin:0 0 24px 0;">
      Your account is ready. We've added <strong style="color:${BRAND.navy};">20 free credits</strong> so you can start generating professional product photography right away.
    </p>
    <div style="background-color:${BRAND.stone};border-radius:8px;padding:20px;margin:0 0 8px 0;">
      <p style="font-family:'Inter',sans-serif;font-size:14px;color:${BRAND.navy};margin:0 0 12px 0;font-weight:600;">
        Here's how to get started:
      </p>
      <p style="font-family:'Inter',sans-serif;font-size:14px;color:${BRAND.muted};line-height:1.8;margin:0;">
        1. Upload your first product photo<br/>
        2. Choose a workflow or go freestyle<br/>
        3. Generate studio-quality images in seconds
      </p>
    </div>
    ${ctaButton("Start Creating", "https://vovv.ai/app")}
  `);
}

function generationCompleteEmail(data: { imageCount?: number; jobType?: string; displayName?: string }): string {
  const count = data.imageCount || 1;
  const typeMap: Record<string, string> = {
    freestyle: "Freestyle",
    tryon: "Virtual Try-On",
    workflow: "Workflow",
  };
  const typeName = typeMap[data.jobType || "freestyle"] || "Generation";
  return emailWrapper(`
    <h1 style="font-family:'Inter',sans-serif;font-size:24px;font-weight:700;color:${BRAND.navy};margin:0 0 16px 0;letter-spacing:-0.02em;">
      Your images are ready
    </h1>
    <p style="font-family:'Inter',sans-serif;font-size:15px;color:${BRAND.muted};line-height:1.6;margin:0 0 24px 0;">
      Your ${typeName} generation just finished — <strong style="color:${BRAND.navy};">${count} image${count !== 1 ? "s" : ""}</strong> ${count !== 1 ? "are" : "is"} ready to view.
    </p>
    <div style="background-color:${BRAND.stone};border-radius:8px;padding:20px;margin:0 0 8px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-family:'Inter',sans-serif;font-size:13px;color:${BRAND.muted};padding:4px 0;">Type</td>
          <td align="right" style="font-family:'Inter',sans-serif;font-size:13px;color:${BRAND.navy};font-weight:500;padding:4px 0;">${typeName}</td>
        </tr>
        <tr>
          <td style="font-family:'Inter',sans-serif;font-size:13px;color:${BRAND.muted};padding:4px 0;">Images</td>
          <td align="right" style="font-family:'Inter',sans-serif;font-size:13px;color:${BRAND.navy};font-weight:500;padding:4px 0;">${count}</td>
        </tr>
      </table>
    </div>
    ${ctaButton("View Results", "https://vovv.ai/app/library")}
  `);
}

function lowCreditsEmail(data: { balance?: number; displayName?: string }): string {
  const balance = data.balance ?? 0;
  return emailWrapper(`
    <h1 style="font-family:'Inter',sans-serif;font-size:24px;font-weight:700;color:${BRAND.navy};margin:0 0 16px 0;letter-spacing:-0.02em;">
      Running low on credits
    </h1>
    <p style="font-family:'Inter',sans-serif;font-size:15px;color:${BRAND.muted};line-height:1.6;margin:0 0 24px 0;">
      You have <strong style="color:${BRAND.navy};">${balance} credit${balance !== 1 ? "s" : ""}</strong> remaining. Top up to keep generating studio-quality product photography without interruption.
    </p>
    <div style="background-color:${BRAND.stone};border-radius:8px;padding:20px;text-align:center;margin:0 0 8px 0;">
      <span style="font-family:'Inter',sans-serif;font-size:36px;font-weight:700;color:${BRAND.navy};letter-spacing:-0.03em;">${balance}</span>
      <br/>
      <span style="font-family:'Inter',sans-serif;font-size:13px;color:${BRAND.muted};">credits remaining</span>
    </div>
    ${ctaButton("Get More Credits", "https://vovv.ai/pricing")}
  `);
}

function contactFormEmail(data: { name?: string; email?: string; message?: string; userId?: string; inquiryType?: string }): string {
  const senderName = data.name || "Unknown";
  const senderEmail = data.email || "Unknown";
  const msg = (data.message || "").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
  const timestamp = new Date().toUTCString();
  const inquiryLabels: Record<string, string> = {
    general: "General Question",
    billing: "Billing & Plans",
    technical: "Technical Support",
    feature: "Feature Request",
    enterprise: "Enterprise Inquiry",
    partnership: "Partnership",
  };
  const inquiryLabel = inquiryLabels[data.inquiryType || ""] || data.inquiryType || "General";
  return emailWrapper(`
    <h1 style="font-family:'Inter',sans-serif;font-size:24px;font-weight:700;color:${BRAND.navy};margin:0 0 16px 0;letter-spacing:-0.02em;">
      New Contact Form Message
    </h1>
    <p style="font-family:'Inter',sans-serif;font-size:15px;color:${BRAND.muted};line-height:1.6;margin:0 0 24px 0;">
      A visitor reached out via the contact form.
    </p>
    <div style="background-color:${BRAND.stone};border-radius:8px;padding:20px;margin:0 0 8px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-family:'Inter',sans-serif;font-size:13px;color:${BRAND.muted};padding:6px 0;vertical-align:top;width:80px;">Name</td>
          <td style="font-family:'Inter',sans-serif;font-size:13px;color:${BRAND.navy};font-weight:500;padding:6px 0;">${senderName}</td>
        </tr>
        <tr>
          <td style="font-family:'Inter',sans-serif;font-size:13px;color:${BRAND.muted};padding:6px 0;vertical-align:top;">Email</td>
          <td style="font-family:'Inter',sans-serif;font-size:13px;color:${BRAND.navy};font-weight:500;padding:6px 0;">
            <a href="mailto:${senderEmail}" style="color:${BRAND.navy};text-decoration:underline;">${senderEmail}</a>
          </td>
        </tr>
        <tr>
          <td style="font-family:'Inter',sans-serif;font-size:13px;color:${BRAND.muted};padding:6px 0;vertical-align:top;">Subject</td>
          <td style="font-family:'Inter',sans-serif;font-size:13px;color:${BRAND.navy};font-weight:500;padding:6px 0;">${inquiryLabel}</td>
        </tr>
        <tr>
          <td style="font-family:'Inter',sans-serif;font-size:13px;color:${BRAND.muted};padding:6px 0;vertical-align:top;">Sent</td>
          <td style="font-family:'Inter',sans-serif;font-size:13px;color:${BRAND.navy};font-weight:500;padding:6px 0;">${timestamp}</td>
        </tr>
      </table>
    </div>
    <div style="background-color:${BRAND.white};border:1px solid ${BRAND.border};border-radius:8px;padding:20px;margin:16px 0 0 0;">
      <p style="font-family:'Inter',sans-serif;font-size:13px;color:${BRAND.muted};margin:0 0 8px 0;font-weight:600;">Message</p>
      <p style="font-family:'Inter',sans-serif;font-size:14px;color:${BRAND.navy};line-height:1.7;margin:0;">${msg}</p>
    </div>
  `);
}
function leadWelcomeEmail(): string {
  return emailWrapper(`
    <h1 style="font-family:'Inter',sans-serif;font-size:24px;font-weight:700;color:${BRAND.navy};margin:0 0 16px 0;letter-spacing:-0.02em;">
      You're in
    </h1>
    <p style="font-family:'Inter',sans-serif;font-size:15px;color:${BRAND.muted};line-height:1.6;margin:0 0 24px 0;">
      We'll only send you creative inspiration — AI photography tips, new features, and the occasional behind-the-scenes look. No spam, ever.
    </p>
    <div style="background-color:${BRAND.stone};border-radius:8px;padding:20px;margin:0 0 8px 0;">
      <p style="font-family:'Inter',sans-serif;font-size:15px;color:${BRAND.navy};line-height:1.6;margin:0;">
        Ready to create? Sign up now and get <strong>20 free credits</strong> to generate your first AI product photos.
      </p>
    </div>
    ${ctaButton("Create Your Account", "https://vovv.ai/auth")}
    <p style="font-family:'Inter',sans-serif;font-size:12px;color:${BRAND.muted};line-height:1.5;margin:24px 0 0 0;">
      You can unsubscribe anytime by replying to this email.
    </p>
  `);
}


function generationFailedEmail(data: { jobType?: string; errorMessage?: string; displayName?: string; prompt?: string; productName?: string; modelName?: string; sceneName?: string; workflowName?: string }): string {
  const typeMap: Record<string, string> = {
    freestyle: "Freestyle",
    tryon: "Virtual Try-On",
    workflow: "Workflow",
  };
  const typeName = typeMap[data.jobType || "freestyle"] || "Generation";
  const errorDetail = data.errorMessage || "An unexpected error occurred during image generation.";

  // Build optional context rows
  const contextRows: string[] = [];
  const rowStyle = `font-family:'Inter',sans-serif;font-size:13px;padding:4px 0;`;
  const labelStyle = `${rowStyle}color:${BRAND.muted};`;
  const valueStyle = `${rowStyle}color:${BRAND.navy};font-weight:500;`;

  contextRows.push(`<tr><td style="${labelStyle}">Type</td><td align="right" style="${valueStyle}">${typeName}</td></tr>`);

  if (data.workflowName) {
    contextRows.push(`<tr><td style="${labelStyle}">Workflow</td><td align="right" style="${valueStyle}">${data.workflowName}</td></tr>`);
  }
  if (data.productName) {
    contextRows.push(`<tr><td style="${labelStyle}">Product</td><td align="right" style="${valueStyle}">${data.productName}</td></tr>`);
  }
  if (data.modelName) {
    contextRows.push(`<tr><td style="${labelStyle}">Model</td><td align="right" style="${valueStyle}">${data.modelName}</td></tr>`);
  }
  if (data.sceneName) {
    contextRows.push(`<tr><td style="${labelStyle}">Scene</td><td align="right" style="${valueStyle}">${data.sceneName}</td></tr>`);
  }
  if (data.prompt) {
    const truncated = data.prompt.length > 80 ? data.prompt.slice(0, 80) + "…" : data.prompt;
    const escaped = truncated.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    contextRows.push(`<tr><td style="${labelStyle}vertical-align:top;">Prompt</td><td align="right" style="${rowStyle}color:${BRAND.muted};font-style:italic;">"${escaped}"</td></tr>`);
  }
  contextRows.push(`<tr><td style="${labelStyle}">Details</td><td align="right" style="${valueStyle}">${errorDetail.slice(0, 100)}</td></tr>`);

  return emailWrapper(`
    <h1 style="font-family:'Inter',sans-serif;font-size:24px;font-weight:700;color:${BRAND.navy};margin:0 0 16px 0;letter-spacing:-0.02em;">
      Something went wrong
    </h1>
    <p style="font-family:'Inter',sans-serif;font-size:15px;color:${BRAND.muted};line-height:1.6;margin:0 0 24px 0;">
      Your ${typeName} generation couldn't be completed. Don't worry — your credits have been refunded automatically.
    </p>
    <div style="background-color:${BRAND.stone};border-radius:8px;padding:20px;margin:0 0 8px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${contextRows.join("\n        ")}
      </table>
    </div>
    ${ctaButton("Try Again", "https://vovv.ai/app")}
  `);
}

// ── Handler ───────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth: only allow internal service role calls
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${serviceRoleKey}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("[send-email] RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { type, to, data } = await req.json();

    if (!type || !to) {
      return new Response(JSON.stringify({ error: "Missing type or to" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let subject: string;
    let html: string;

    switch (type) {
      case "welcome":
        subject = "Welcome to VOVV.‌AI";
        html = welcomeEmail(data || {});
        break;
      case "generation_complete":
        subject = "Your images are ready — VOVV.‌AI";
        html = generationCompleteEmail(data || {});
        break;
      case "low_credits":
        subject = "Running low on credits — VOVV.‌AI";
        html = lowCreditsEmail(data || {});
        break;
      case "generation_failed":
        subject = "Generation failed — VOVV.‌AI";
        html = generationFailedEmail(data || {});
        break;
      case "contact_form":
        subject = `[VOVV.‌AI Contact] Message from ${(data?.name || "a user")}`;
        html = contactFormEmail(data || {});
        break;
      case "lead_welcome":
        subject = "You're in — VOVV.‌AI";
        html = leadWelcomeEmail();
        break;
      default:
        return new Response(JSON.stringify({ error: `Unknown email type: ${type}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const replyTo = type === "contact_form" && data?.email ? data.email : undefined;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "VOVV.‌AI <hello@vovv.ai>",
        to: [to],
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject,
        html,
      }),
    });

    const resBody = await res.json();

    if (!res.ok) {
      console.error("[send-email] Resend error:", JSON.stringify(resBody), "status:", res.status);
      return new Response(JSON.stringify({ error: "Failed to send email", details: resBody }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[send-email] ✓ Sent ${type} email to ${to} (resend id: ${resBody.id})`);
    return new Response(JSON.stringify({ success: true, id: resBody.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[send-email] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
