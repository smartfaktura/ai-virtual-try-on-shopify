import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API = "https://api.resend.com";

/**
 * Forward a contact-level event to Resend so automations with
 * "Custom event" triggers (e.g. user.signup, subscription.started, credits.low)
 * actually fire in the Resend dashboard.
 *
 * SAFETY: every Resend call is wrapped in try/catch. The function ALWAYS
 * returns 200 with { ok: true|false }, so callers (DB triggers, edge fns,
 * client) never crash if Resend is unreachable. The local
 * `resend_event_log` table is the source of truth for debugging.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const RESEND_AUDIENCE_ID = Deno.env.get("RESEND_AUDIENCE_ID");

    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").toLowerCase().trim();
    const event = String(body.event || "").trim();
    if (!email || !event) return json({ error: "email + event required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (!RESEND_API_KEY || !RESEND_AUDIENCE_ID) {
      // Still log so we can see attempts even if Resend isn't configured
      await admin.from("resend_event_log").insert({
        user_id: body.user_id ?? null,
        email,
        event_type: event,
        payload: { attributes: body.attributes ?? null, reason: "resend_not_configured" },
        status: "failed",
        response: null,
      }).then(() => {}, () => {});
      return json({ ok: false, error: "Resend not configured" });
    }

    const auth = { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" };

    // Step A: ensure contact exists in audience (best-effort, ignore failure).
    let upsertStatus: number | null = null;
    try {
      const upsertRes = await fetch(
        `${RESEND_API}/audiences/${RESEND_AUDIENCE_ID}/contacts`,
        {
          method: "POST",
          headers: auth,
          body: JSON.stringify({ email, unsubscribed: false }),
        }
      );
      upsertStatus = upsertRes.status;
      // Drain body to avoid leaks
      await upsertRes.text().catch(() => "");
    } catch (e) {
      console.warn("[track-resend-event] contact upsert failed", e);
    }

    // Step B: send the actual Custom Event to Resend so automation triggers fire.
    // Endpoint: POST /audiences/{audience_id}/contacts/{email}/events
    let eventStatus: number | null = null;
    let eventResp: any = null;
    let eventOk = false;
    try {
      const eventRes = await fetch(
        `${RESEND_API}/audiences/${RESEND_AUDIENCE_ID}/contacts/${encodeURIComponent(email)}/events`,
        {
          method: "POST",
          headers: auth,
          body: JSON.stringify({
            name: event,
            data: body.attributes ?? {},
          }),
        }
      );
      eventStatus = eventRes.status;
      eventResp = await eventRes.json().catch(() => ({}));
      eventOk = eventRes.ok;
    } catch (e) {
      console.warn("[track-resend-event] event POST failed", e);
      eventResp = { error: String(e) };
    }

    // Step C: log everything for debugging
    try {
      await admin.from("resend_event_log").insert({
        user_id: body.user_id ?? null,
        email,
        event_type: event,
        payload: {
          attributes: body.attributes ?? null,
          upsert_status: upsertStatus,
          event_status: eventStatus,
        },
        status: eventOk ? "ok" : "failed",
        response: eventResp,
      });
    } catch (logErr) {
      console.warn("[track-resend-event] log insert failed", logErr);
    }

    // Always 200 — never break callers.
    return json({ ok: eventOk });
  } catch (e) {
    console.error("[track-resend-event] outer error", e);
    // Still return 200 so caller doesn't crash
    return json({ ok: false, error: (e as Error).message });
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
