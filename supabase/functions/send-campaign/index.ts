import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { renderMarketingEmail, buildUnsubscribeUrl, genUnsubscribeToken, RESEND_FROM } from "../_shared/email-render.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const APP_URL = "https://vovv.ai";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
    if (!RESEND_API_KEY) {
      return json({ error: "RESEND_API_KEY not configured" }, 500);
    }

    // Auth: require admin user
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: claims } = await userClient.auth.getClaims();
    const userId = claims?.claims?.sub as string | undefined;
    if (!userId) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) return json({ error: "Admin only" }, 403);

    const { campaign_id, test } = await req.json();
    if (!campaign_id) return json({ error: "Missing campaign_id" }, 400);

    const { data: campaign, error: cErr } = await admin
      .from("email_campaigns").select("*").eq("id", campaign_id).maybeSingle();
    if (cErr || !campaign) return json({ error: "Campaign not found" }, 404);

    if (campaign.status === "sent" || campaign.status === "sending") {
      return json({ error: `Campaign already ${campaign.status}` }, 400);
    }

    // Resolve audience
    let recipients: Array<{ user_id: string | null; email: string }> = [];
    if (test?.email) {
      recipients = [{ user_id: null, email: test.email }];
    } else {
      const { data: aud, error: audErr } = await admin.rpc("resolve_email_audience", {
        p_filter: campaign.audience_filter,
      });
      if (audErr) return json({ error: "Audience error: " + audErr.message }, 500);
      recipients = (aud || []).map((r: any) => ({ user_id: r.user_id, email: r.email }));
    }

    if (recipients.length === 0) {
      await admin.from("email_campaigns").update({ status: "sent", sent_at: new Date().toISOString(), recipient_count: 0 }).eq("id", campaign_id);
      return json({ ok: true, sent: 0, message: "No recipients matched" });
    }

    if (!test) {
      await admin.from("email_campaigns").update({
        status: "sending",
        recipient_count: recipients.length,
      }).eq("id", campaign_id);
    }

    let sent = 0, failed = 0, suppressed = 0;
    const concurrency = 5;
    let idx = 0;

    async function worker() {
      while (idx < recipients.length) {
        const i = idx++;
        const r = recipients[i];

        // Suppression check
        const { data: sup } = await admin
          .from("suppressed_emails").select("email").eq("email", r.email.toLowerCase()).maybeSingle();
        if (sup) {
          suppressed++;
          if (!test) {
            await admin.from("email_campaign_recipients").insert({
              campaign_id, user_id: r.user_id, email: r.email, status: "suppressed",
            });
          }
          continue;
        }

        const unsubToken = genUnsubscribeToken(r.email);
        const unsubUrl = buildUnsubscribeUrl(APP_URL, r.email, unsubToken);
        const html = renderMarketingEmail({
          bodyHtml: campaign.body_html,
          ctaLabel: campaign.cta_label,
          ctaUrl: campaign.cta_url,
          unsubscribeUrl: unsubUrl,
          recipientEmail: r.email,
        });

        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: RESEND_FROM,
              to: [r.email],
              subject: campaign.subject,
              html,
              headers: {
                "List-Unsubscribe": `<${unsubUrl}>`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
              },
              tags: [{ name: "campaign_id", value: campaign_id }],
            }),
          });
          const body = await res.json();
          if (!res.ok) throw new Error(body?.message || `HTTP ${res.status}`);
          sent++;
          if (!test) {
            await admin.from("email_campaign_recipients").insert({
              campaign_id, user_id: r.user_id, email: r.email,
              status: "sent", resend_message_id: body.id, sent_at: new Date().toISOString(),
            });
          }
        } catch (e) {
          failed++;
          if (!test) {
            await admin.from("email_campaign_recipients").insert({
              campaign_id, user_id: r.user_id, email: r.email,
              status: "failed", error_message: (e as Error).message,
            });
          }
        }

        // Gentle pacing — Resend free tier ~10/sec
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    await Promise.all(Array.from({ length: concurrency }, worker));

    if (!test) {
      await admin.from("email_campaigns").update({
        status: "sent",
        sent_at: new Date().toISOString(),
        sent_count: sent,
        failed_count: failed,
      }).eq("id", campaign_id);
    }

    return json({ ok: true, sent, failed, suppressed, total: recipients.length });
  } catch (e) {
    console.error("[send-campaign]", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
