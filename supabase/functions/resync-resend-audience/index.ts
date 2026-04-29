import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API = "https://api.resend.com";

/**
 * Admin-only: bulk push all opted-in profiles to the Resend audience.
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

    // Auth: must be admin
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
      .select("user_id, email, first_name, last_name, display_name")
      .eq("marketing_emails_opted_in", true);
    if (pErr) throw pErr;

    let added = 0;
    let updated = 0;
    let failed = 0;

    for (const p of profiles ?? []) {
      const firstName = p.first_name || p.display_name || null;
      const res = await fetch(
        `${RESEND_API}/audiences/${RESEND_AUDIENCE_ID}/contacts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: p.email,
            first_name: firstName ?? undefined,
            last_name: p.last_name ?? undefined,
            unsubscribed: false,
          }),
        }
      );

      if (res.ok) {
        added++;
      } else if (res.status === 409) {
        // Already exists — patch
        const patchRes = await fetch(
          `${RESEND_API}/audiences/${RESEND_AUDIENCE_ID}/contacts/${encodeURIComponent(p.email)}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              first_name: firstName ?? undefined,
              last_name: p.last_name ?? undefined,
              unsubscribed: false,
            }),
          }
        );
        if (patchRes.ok) updated++;
        else failed++;
      } else {
        failed++;
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
