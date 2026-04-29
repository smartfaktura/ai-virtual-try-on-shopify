import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { renderMarketingEmail, buildUnsubscribeUrl, genUnsubscribeToken, RESEND_FROM } from "../_shared/email-render.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const APP_URL = "https://vovv.ai";

// Replace simple {{tokens}} in email body. Currently supports: name, email.
function fillTokens(html: string, ctx: { name?: string | null; email: string }): string {
  return html
    .replace(/\{\{\s*name\s*\}\}/gi, ctx.name || "there")
    .replace(/\{\{\s*email\s*\}\}/gi, ctx.email);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Auth: this is invoked by pg_cron via service role
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${SERVICE_KEY}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), { status: 500, headers: corsHeaders });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  // Pick up to 50 due queue items
  const { data: items } = await admin
    .from("email_automation_queue")
    .select("*")
    .eq("status", "queued")
    .lte("send_at", new Date().toISOString())
    .order("send_at", { ascending: true })
    .limit(50);

  if (!items || items.length === 0) {
    return new Response(JSON.stringify({ ok: true, processed: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  let sent = 0, failed = 0, skipped = 0;

  for (const item of items) {
    // Mark processing
    await admin.from("email_automation_queue").update({ status: "processing", attempts: item.attempts + 1 }).eq("id", item.id);

    try {
      // Fetch automation
      const { data: automation } = await admin
        .from("email_automations").select("*").eq("id", item.automation_id).maybeSingle();
      if (!automation || !automation.is_active) {
        await admin.from("email_automation_queue").update({ status: "cancelled", processed_at: new Date().toISOString() }).eq("id", item.id);
        skipped++;
        continue;
      }

      // Frequency cap check
      if (automation.frequency_cap > 0) {
        const { count } = await admin
          .from("email_automation_log")
          .select("*", { count: "exact", head: true })
          .eq("automation_id", automation.id)
          .eq("email", item.email)
          .eq("status", "sent");
        if ((count || 0) >= automation.frequency_cap) {
          await admin.from("email_automation_queue").update({ status: "skipped", processed_at: new Date().toISOString() }).eq("id", item.id);
          await admin.from("email_automation_log").insert({
            automation_id: automation.id, user_id: item.user_id, email: item.email, status: "skipped",
            error_message: "Frequency cap reached",
          });
          skipped++;
          continue;
        }
      }

      // Suppression
      const { data: sup } = await admin
        .from("suppressed_emails").select("email").eq("email", item.email.toLowerCase()).maybeSingle();
      if (sup) {
        await admin.from("email_automation_queue").update({ status: "skipped", processed_at: new Date().toISOString() }).eq("id", item.id);
        await admin.from("email_automation_log").insert({
          automation_id: automation.id, user_id: item.user_id, email: item.email, status: "suppressed",
        });
        skipped++;
        continue;
      }

      // Marketing unsubscribe check
      const { data: mUnsub } = await admin
        .from("marketing_unsubscribes").select("email").eq("email", item.email.toLowerCase()).maybeSingle();
      if (mUnsub) {
        await admin.from("email_automation_queue").update({ status: "skipped", processed_at: new Date().toISOString() }).eq("id", item.id);
        await admin.from("email_automation_log").insert({
          automation_id: automation.id, user_id: item.user_id, email: item.email, status: "skipped",
          error_message: "Marketing unsubscribed",
        });
        skipped++;
        continue;
      }

      // Get profile for name token
      let displayName: string | null = null;
      if (item.user_id) {
        const { data: p } = await admin.from("profiles").select("display_name").eq("user_id", item.user_id).maybeSingle();
        displayName = p?.display_name ?? null;
      }

      const unsubToken = genUnsubscribeToken(item.email);
      const unsubUrl = buildUnsubscribeUrl(APP_URL, item.email, unsubToken);
      const html = renderMarketingEmail({
        bodyHtml: fillTokens(automation.body_html, { name: displayName, email: item.email }),
        ctaLabel: automation.cta_label,
        ctaUrl: automation.cta_url,
        unsubscribeUrl: unsubUrl,
        recipientEmail: item.email,
      });

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: RESEND_FROM,
          to: [item.email],
          subject: fillTokens(automation.subject, { name: displayName, email: item.email }),
          html,
          headers: {
            "List-Unsubscribe": `<${unsubUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
          tags: [{ name: "automation_id", value: automation.id }],
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message || `HTTP ${res.status}`);

      await admin.from("email_automation_queue").update({
        status: "sent", processed_at: new Date().toISOString(),
      }).eq("id", item.id);
      await admin.from("email_automation_log").insert({
        automation_id: automation.id, user_id: item.user_id, email: item.email,
        status: "sent", resend_message_id: body.id, sent_at: new Date().toISOString(),
      });
      // bump counter
      await admin.rpc("increment_automation_sent", { p_id: automation.id }).catch(() => {});
      sent++;
    } catch (e) {
      const msg = (e as Error).message;
      const giveUp = item.attempts + 1 >= 3;
      await admin.from("email_automation_queue").update({
        status: giveUp ? "failed" : "queued",
        error_message: msg,
        send_at: giveUp ? item.send_at : new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        processed_at: giveUp ? new Date().toISOString() : null,
      }).eq("id", item.id);
      if (giveUp) {
        await admin.from("email_automation_log").insert({
          automation_id: item.automation_id, user_id: item.user_id, email: item.email,
          status: "failed", error_message: msg,
        });
      }
      failed++;
    }
  }

  return new Response(JSON.stringify({ ok: true, sent, failed, skipped }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
