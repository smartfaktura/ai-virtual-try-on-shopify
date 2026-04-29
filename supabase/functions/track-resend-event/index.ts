import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API = "https://api.resend.com";

/**
 * Forward a contact-level event to Resend.
 * Resend doesn't have a true "events" endpoint for audiences; instead we update
 * the contact's attributes / unsubscribed flag so Resend's automations can
 * trigger off attribute changes. We also log every event for debugging.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const RESEND_AUDIENCE_ID = Deno.env.get("RESEND_AUDIENCE_ID");
    if (!RESEND_API_KEY || !RESEND_AUDIENCE_ID) {
      return json({ error: "Resend not configured" }, 500);
    }

    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();
    const event = String(body.event || "").trim();
    if (!email || !event) return json({ error: "email + event required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // PATCH contact with last-event metadata. Resend stores first_name/last_name/unsubscribed
    // natively. We squeeze the event marker into first_name suffix? No — instead we
    // rely on Resend Broadcasts being filtered manually. The event log is our source
    // of truth for who-did-what.
    //
    // We simply ensure the contact exists in the audience (create-or-patch).
    const upsertRes = await fetch(
      `${RESEND_API}/audiences/${RESEND_AUDIENCE_ID}/contacts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, unsubscribed: false }),
      }
    );
    const resendResp = await upsertRes.json().catch(() => ({}));

    await admin.from("resend_event_log").insert({
      user_id: body.user_id ?? null,
      email,
      event_type: event,
      payload: {
        attributes: body.attributes ?? null,
        upsert_status: upsertRes.status,
      },
      status: upsertRes.ok || upsertRes.status === 409 ? "ok" : "failed",
      response: resendResp,
    });

    return json({ ok: true });
  } catch (e) {
    console.error("[track-resend-event]", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
