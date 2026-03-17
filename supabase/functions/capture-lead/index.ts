import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiter: max 3 requests per IP per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email } = await req.json();
    if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const RESEND_AUDIENCE_ID = Deno.env.get("RESEND_AUDIENCE_ID");

    if (!RESEND_API_KEY || !RESEND_AUDIENCE_ID) {
      console.error("[capture-lead] Missing RESEND_API_KEY or RESEND_AUDIENCE_ID");
      return new Response(JSON.stringify({ error: "Service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Add to Resend audience (best-effort, don't block on failure)
    let audienceOk = false;
    try {
      const audienceRes = await fetch(
        `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
            unsubscribed: false,
          }),
        }
      );
      if (audienceRes.ok) {
        audienceOk = true;
      } else {
        const errBody = await audienceRes.text();
        console.error("[capture-lead] Resend audience error:", audienceRes.status, errBody);
      }
    } catch (err) {
      console.error("[capture-lead] Audience request failed:", err);
    }

    // 2. Send lead_welcome email via send-email function
    let emailOk = false;
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "lead_welcome",
          to: cleanEmail,
          data: {},
        }),
      });

      if (emailRes.ok) {
        const emailResult = await emailRes.json();
        if (emailResult.success) {
          emailOk = true;
        } else {
          console.error("[capture-lead] send-email returned error:", JSON.stringify(emailResult));
        }
      } else {
        const errBody = await emailRes.text();
        console.error("[capture-lead] send-email error:", emailRes.status, errBody);
      }
    } catch (err) {
      console.error("[capture-lead] Email request failed:", err);
    }

    // 3. Return truthful status
    if (emailOk) {
      console.log(`[capture-lead] ✓ Captured lead + sent email: ${cleanEmail}`);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (audienceOk) {
      // Lead captured to audience but welcome email failed
      console.log(`[capture-lead] ⚠ Lead added to audience but email failed: ${cleanEmail}`);
      return new Response(JSON.stringify({ success: true, emailSkipped: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Both failed
    console.error(`[capture-lead] ✗ Both audience and email failed for: ${cleanEmail}`);
    return new Response(JSON.stringify({ error: "Could not process your request right now. Please try again later." }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[capture-lead] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
