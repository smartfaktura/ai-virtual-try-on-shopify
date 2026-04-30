import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API = "https://api.resend.com";

// Resend's properties API requires string values. Stringify everything safely.
function toPropString(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.length ? v.join(", ") : undefined;
  try {
    return JSON.stringify(v);
  } catch {
    return undefined;
  }
}

function buildProperties(input: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input)) {
    const s = toPropString(v);
    if (s !== undefined && s !== "") out[k] = s;
  }
  return out;
}

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

    const unsubscribed = !!body.unsubscribed;

    // Pull profile metadata. Try by user_id first, then by email as fallback
    // (handles race conditions where profile row isn't created yet during signup).
    let profile: any = null;
    if (body.user_id) {
      const { data } = await admin
        .from("profiles")
        .select("first_name, last_name, display_name, plan, product_categories, credits_balance, created_at")
        .eq("user_id", body.user_id)
        .maybeSingle();
      profile = data;
    }
    if (!profile) {
      const { data } = await admin
        .from("profiles")
        .select("first_name, last_name, display_name, plan, product_categories, credits_balance, created_at")
        .eq("email", email)
        .maybeSingle();
      profile = data;
    }

    // Priority: explicit body fields > profile DB fields > email prefix fallback.
    const firstName =
      body.first_name ||
      body.display_name ||
      profile?.first_name ||
      profile?.display_name ||
      email.split("@")[0] ||
      null;
    const lastName = body.last_name || profile?.last_name || null;

    // Build custom properties payload (kept for log/debug + future migration to
    // Resend's new /contacts API). NOTE: the legacy /audiences/{id}/contacts
    // endpoint does NOT support custom properties — they are silently dropped.
    // We still log them locally so resend_event_log keeps a complete record.
    const incomingProps = (body.properties ?? {}) as Record<string, unknown>;
    const properties = buildProperties({
      plan: incomingProps.plan ?? profile?.plan,
      primary_family: incomingProps.primary_family,
      primary_subtype: incomingProps.primary_subtype,
      families: incomingProps.families,
      subtypes: incomingProps.subtypes,
      product_categories: incomingProps.product_categories ?? profile?.product_categories,
      product_subcategories: incomingProps.product_subcategories,
      signup_date:
        incomingProps.signup_date ??
        (profile?.created_at ? new Date(profile.created_at).toISOString() : undefined),
      has_generated: incomingProps.has_generated,
      credits_balance: incomingProps.credits_balance ?? profile?.credits_balance,
      marketing_opted_in: incomingProps.marketing_opted_in,
    });

    // IMPORTANT: The Resend audiences REST endpoint expects snake_case
    // (first_name / last_name). The Node SDK accepts camelCase but converts
    // internally — raw REST does NOT. Sending camelCase results in 200 OK
    // but silently dropped name fields. Only first_name / last_name /
    // unsubscribed are persisted by the legacy audiences endpoint.
    const payload: Record<string, unknown> = {
      email,
      first_name: firstName ?? undefined,
      last_name: lastName ?? undefined,
      unsubscribed,
    };

    // Try POST first (create); on conflict, PATCH.
    const createRes = await fetch(`${RESEND_API}/audiences/${RESEND_AUDIENCE_ID}/contacts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let resendResp: any = await createRes.json().catch(() => ({}));
    let action = "created";

    if (!createRes.ok) {
      // Update existing contact via PATCH (don't include email field on update)
      const patchPayload: Record<string, unknown> = {
        first_name: firstName ?? undefined,
        last_name: lastName ?? undefined,
        unsubscribed,
      };
      if (Object.keys(properties).length > 0) patchPayload.properties = properties;

      const patchRes = await fetch(
        `${RESEND_API}/audiences/${RESEND_AUDIENCE_ID}/contacts/${encodeURIComponent(email)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patchPayload),
        }
      );
      resendResp = await patchRes.json().catch(() => ({}));
      action = patchRes.ok ? "updated" : "failed";
    }

    await admin.from("resend_event_log").insert({
      user_id: body.user_id ?? null,
      email,
      event_type: body.event || "contact.sync",
      payload: {
        action,
        first_name: firstName,
        last_name: lastName,
        properties,
        unsubscribed,
      },
      status: action === "failed" ? "failed" : "ok",
      response: resendResp,
    });

    return json({ ok: action !== "failed", action, properties_sent: Object.keys(properties).length });
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
