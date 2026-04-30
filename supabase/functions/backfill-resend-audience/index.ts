import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const RESEND_AUDIENCE_ID = Deno.env.get("RESEND_AUDIENCE_ID");
    if (!RESEND_AUDIENCE_ID) throw new Error("RESEND_AUDIENCE_ID not configured");

    // Require service role (admin-only operation)
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (token !== serviceRoleKey) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: roleData } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (!roleData) {
        return new Response(JSON.stringify({ error: "Admin only" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: profiles, error: dbError } = await adminClient
      .from("profiles")
      .select("user_id, email, first_name, last_name, display_name, plan, product_categories, credits_balance, created_at")
      .eq("marketing_emails_opted_in", true);

    if (dbError) throw dbError;

    let added = 0;
    let updated = 0;
    let failed = 0;

    for (const profile of profiles ?? []) {
      const email = String(profile.email || "").toLowerCase().trim();
      if (!email) { failed++; continue; }

      const firstName = profile.first_name || profile.display_name || email.split("@")[0] || null;
      const lastName = profile.last_name || null;

      const properties = buildProperties({
        plan: profile.plan,
        product_categories: profile.product_categories,
        signup_date: profile.created_at ? new Date(profile.created_at).toISOString() : undefined,
        credits_balance: profile.credits_balance,
      });

      const payload: Record<string, unknown> = {
        email,
        first_name: firstName ?? undefined,
        last_name: lastName ?? undefined,
        unsubscribed: false,
      };
      if (Object.keys(properties).length > 0) payload.properties = properties;

      // Try create; if exists, update
      const createRes = await fetch(
        `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (createRes.ok) {
        added++;
      } else {
        const patchPayload: Record<string, unknown> = {
          first_name: firstName ?? undefined,
          last_name: lastName ?? undefined,
          unsubscribed: false,
        };
        if (Object.keys(properties).length > 0) patchPayload.properties = properties;

        const patchRes = await fetch(
          `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts/${encodeURIComponent(email)}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(patchPayload),
          }
        );
        if (patchRes.ok) {
          updated++;
        } else {
          failed++;
          console.error(`Failed for ${email}:`, patchRes.status, await patchRes.text());
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, total: profiles?.length ?? 0, added, updated, failed }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("backfill-resend-audience error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
