import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API = "https://api.resend.com";

function toPropString(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.length ? v.join(", ") : undefined;
  try { return JSON.stringify(v); } catch { return undefined; }
}

function buildProperties(input: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input)) {
    const s = toPropString(v);
    if (s !== undefined && s !== "") out[k] = s;
  }
  return out;
}

/**
 * Admin-only: bulk push all opted-in profiles to the Resend audience.
 * Hydrates names AND custom properties (plan, product_categories, signup_date, credits_balance).
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const RESEND_AUDIENCE_ID = Deno.env.get("RESEND_AUDIENCE_ID");
    if (!RESEND_API_KEY || !RESEND_AUDIENCE_ID) {
      return json({ error: "Resend not configured" }, 500);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: cErr } = await userClient.auth.getClaims(token);
    if (cErr || !claims?.claims?.sub) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: roleOk } = await admin.rpc("has_role", {
      _user_id: claims.claims.sub,
      _role: "admin",
    });
    if (!roleOk) return json({ error: "Admin only" }, 403);

    const { data: profiles, error: pErr } = await admin
      .from("profiles")
      .select("user_id, email, first_name, last_name, display_name, plan, product_categories, credits_balance, created_at")
      .eq("marketing_emails_opted_in", true);
    if (pErr) throw pErr;

    let added = 0;
    let updated = 0;
    let failed = 0;

    for (const p of profiles ?? []) {
      const email = String(p.email || "").toLowerCase().trim();
      if (!email) { failed++; continue; }

      const firstName = p.first_name || p.display_name || email.split("@")[0] || null;
      const lastName = p.last_name || null;

      const properties = buildProperties({
        plan: p.plan,
        product_categories: p.product_categories,
        signup_date: p.created_at ? new Date(p.created_at).toISOString() : undefined,
        credits_balance: p.credits_balance,
      });

      const payload: Record<string, unknown> = {
        email,
        first_name: firstName ?? undefined,
        last_name: lastName ?? undefined,
        unsubscribed: false,
      };
      if (Object.keys(properties).length > 0) payload.properties = properties;

      const res = await fetch(
        `${RESEND_API}/audiences/${RESEND_AUDIENCE_ID}/contacts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        added++;
      } else {
        // Any non-OK response: try PATCH (covers 409, 422, and other "exists" responses)
        const patchPayload: Record<string, unknown> = {
          first_name: firstName ?? undefined,
          last_name: lastName ?? undefined,
          unsubscribed: false,
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
        if (patchRes.ok) updated++;
        else {
          failed++;
          console.error(`Failed for ${email}: POST ${res.status} / PATCH ${patchRes.status}`);
        }
      }
    }

    return json({ ok: true, total: profiles?.length ?? 0, added, updated, failed });
  } catch (e) {
    console.error("[resync-resend-audience]", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
