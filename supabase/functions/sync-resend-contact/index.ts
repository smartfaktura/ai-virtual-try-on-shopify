import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API = "https://api.resend.com";

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
    if (!email) return json({ error: "email required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Check unsubscribe flag — if user is unsubscribed, mark in Resend
    const unsubscribed = !!body.unsubscribed;

    // Pull profile metadata. Try by user_id first, then by email as fallback
    // (handles race conditions where profile row isn't created yet during signup).
    let profile: any = null;
    if (body.user_id) {
      const { data } = await admin
        .from("profiles")
        .select("first_name, last_name, display_name, plan, product_categories, created_at")
        .eq("user_id", body.user_id)
        .maybeSingle();
      profile = data;
    }
    if (!profile) {
      const { data } = await admin
        .from("profiles")
        .select("first_name, last_name, display_name, plan, product_categories, created_at")
        .eq("email", email)
        .maybeSingle();
      profile = data;
    }

    // Priority: explicit body fields > profile DB fields > email prefix fallback.
    // This fixes race conditions where the profile row hasn't been written yet
    // but the client already knows the user's name (e.g. signup form input).
    const firstName =
      body.first_name ||
      body.display_name ||
      profile?.first_name ||
      profile?.display_name ||
      email.split("@")[0] ||
      null;
    const lastName = body.last_name || profile?.last_name || null;

    // Try POST first (create); on 409/conflict, PATCH.
    // NOTE: Resend REST API expects camelCase: firstName / lastName
    // (snake_case is silently ignored — that's why dashboard showed empty names).
    const createRes = await fetch(`${RESEND_API}/audiences/${RESEND_AUDIENCE_ID}/contacts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        unsubscribed,
      }),
    });

    let resendResp: any = await createRes.json().catch(() => ({}));
    let action = "created";

    if (!createRes.ok) {
      // Try update via PATCH on email
      const patchRes = await fetch(
        `${RESEND_API}/audiences/${RESEND_AUDIENCE_ID}/contacts/${encodeURIComponent(email)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: firstName ?? undefined,
            last_name: lastName ?? undefined,
            unsubscribed,
          }),
        }
      );
      resendResp = await patchRes.json().catch(() => ({}));
      action = patchRes.ok ? "updated" : "failed";
    }

    // Log (include incoming properties for debugging — Resend audience contacts
    // only support first_name/last_name/unsubscribed natively, so other fields
    // live in the log + Custom Events).
    await admin.from("resend_event_log").insert({
      user_id: body.user_id ?? null,
      email,
      event_type: body.event || "contact.sync",
      payload: {
        action,
        first_name: firstName,
        last_name: lastName,
        plan: body.properties?.plan ?? profile?.plan,
        product_categories: body.properties?.product_categories ?? profile?.product_categories,
        properties: body.properties ?? null,
        unsubscribed,
      },
      status: action === "failed" ? "failed" : "ok",
      response: resendResp,
    });

    return json({ ok: action !== "failed", action });
  } catch (e) {
    console.error("[sync-resend-contact]", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
