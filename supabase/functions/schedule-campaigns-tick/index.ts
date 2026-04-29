import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Periodic worker invoked by pg_cron via service role.
// 1) Detects abandoned checkouts and enqueues `checkout.abandoned` automations
// 2) Picks up scheduled campaigns whose time has come

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${SERVICE_KEY}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const now = new Date();

  // ── 1) Send scheduled campaigns ─────────────────────────────────────
  const { data: dueCampaigns } = await admin
    .from("email_campaigns")
    .select("id")
    .eq("status", "scheduled")
    .lte("scheduled_at", now.toISOString())
    .limit(5);

  for (const c of dueCampaigns || []) {
    // mark sending immediately to avoid double-send
    await admin.from("email_campaigns").update({ status: "sending" }).eq("id", c.id);
    fetch(`${SUPABASE_URL}/functions/v1/send-campaign`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ campaign_id: c.id, _system: true }),
    }).catch((e) => console.error("send-campaign invoke failed", e));
  }

  // ── 2) Process automation triggers ──────────────────────────────────
  // Active automations grouped by trigger
  const { data: automations } = await admin
    .from("email_automations")
    .select("*")
    .eq("is_active", true);

  const byTrigger = new Map<string, any[]>();
  for (const a of automations || []) {
    if (!byTrigger.has(a.trigger_event)) byTrigger.set(a.trigger_event, []);
    byTrigger.get(a.trigger_event)!.push(a);
  }

  let enqueuedAbandoned = 0;
  let enqueuedInactive = 0;

  // 2a) checkout.abandoned — checkout started > delay ago, not completed, not yet processed
  const abandonedRules = byTrigger.get("checkout.abandoned") || [];
  if (abandonedRules.length > 0) {
    // Use the smallest delay among rules to find candidates
    const minDelayMin = Math.min(...abandonedRules.map((a) => a.delay_minutes || 60));
    const cutoff = new Date(Date.now() - minDelayMin * 60 * 1000).toISOString();

    const { data: abandoned } = await admin
      .from("checkout_sessions")
      .select("*")
      .is("completed_at", null)
      .is("abandoned_processed_at", null)
      .lte("started_at", cutoff)
      .limit(100);

    for (const session of abandoned || []) {
      await admin.from("checkout_sessions").update({ abandoned_processed_at: now.toISOString() }).eq("id", session.id);
      for (const rule of abandonedRules) {
        await admin.from("email_automation_queue").insert({
          automation_id: rule.id,
          user_id: session.user_id,
          email: session.email,
          send_at: new Date(new Date(session.started_at).getTime() + (rule.delay_minutes || 60) * 60 * 1000).toISOString(),
        });
        enqueuedAbandoned++;
      }
    }
  }

  // 2b) inactive.user — last generation > N days ago
  const inactiveRules = byTrigger.get("inactive.user") || [];
  if (inactiveRules.length > 0) {
    for (const rule of inactiveRules) {
      const days = Math.max(1, Math.floor((rule.delay_minutes || 14 * 24 * 60) / (24 * 60)));
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      // Find profiles never generated OR last generation older than cutoff,
      // and not already enqueued for this rule.
      const { data: candidates } = await admin
        .from("profiles")
        .select("user_id, email, created_at")
        .not("email", "is", null)
        .lt("created_at", cutoff)
        .limit(200);

      for (const p of candidates || []) {
        // Has any generation more recent than cutoff?
        const { count } = await admin
          .from("generation_jobs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", p.user_id)
          .gte("created_at", cutoff);
        if ((count || 0) > 0) continue;

        // Already logged for this rule recently?
        const { count: logCount } = await admin
          .from("email_automation_log")
          .select("*", { count: "exact", head: true })
          .eq("automation_id", rule.id)
          .eq("user_id", p.user_id);
        if ((logCount || 0) > 0) continue;

        await admin.from("email_automation_queue").insert({
          automation_id: rule.id, user_id: p.user_id, email: p.email,
          send_at: now.toISOString(),
        });
        enqueuedInactive++;
      }
    }
  }

  return new Response(JSON.stringify({
    ok: true,
    scheduled_campaigns: dueCampaigns?.length || 0,
    enqueued_abandoned: enqueuedAbandoned,
    enqueued_inactive: enqueuedInactive,
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
