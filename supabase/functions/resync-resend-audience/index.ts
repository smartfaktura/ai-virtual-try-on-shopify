import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API = "https://api.resend.com";

const NUMERIC_PROP_KEYS = new Set(["credits_balance", "total_generations"]);

function resolveLifecycleStage(plan?: string | null, subStatus?: string | null): string {
  if (subStatus === "active") return "paid";
  if (subStatus === "canceled" || subStatus === "past_due") return "churned";
  if (!plan || plan === "free") return "lead";
  return "trial";
}

function toPropString(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.length ? v.join(", ") : undefined;
  try { return JSON.stringify(v); } catch { return undefined; }
}

function buildProperties(input: Record<string, unknown>): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(input)) {
    if (NUMERIC_PROP_KEYS.has(k)) {
      const n = typeof v === "number" ? v : v == null ? NaN : Number(v);
      if (Number.isFinite(n)) out[k] = n;
      continue;
    }
    const s = toPropString(v);
    if (s !== undefined && s !== "") out[k] = s;
  }
  return out;
}

/**
 * Admin-only: bulk push opted-in profiles to the Resend audience.
 * Chunked (offset/limit query params) + parallel batches of 10 to fit edge function timeout.
 * Hydrates names AND 12 custom properties.
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

    const url = new URL(req.url);
    const offset = Math.max(0, parseInt(url.searchParams.get("offset") || "0", 10));
    const limit = Math.min(500, Math.max(1, parseInt(url.searchParams.get("limit") || "300", 10)));

    // Count total for has_more reporting
    const { count: totalOptedIn } = await admin
      .from("profiles")
      .select("user_id", { count: "exact", head: true })
      .eq("marketing_emails_opted_in", true);

    const { data: profiles, error: pErr } = await admin
      .from("profiles")
      .select(
        "user_id, email, first_name, last_name, display_name, plan, product_categories, credits_balance, created_at, updated_at, subscription_status, current_period_end, referral_source",
      )
      .eq("marketing_emails_opted_in", true)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);
    if (pErr) throw pErr;

    const rows = profiles ?? [];
    const userIds = rows.map((r) => r.user_id).filter(Boolean) as string[];

    // One bulk aggregate for activity metrics — no N+1.
    const aggregates = new Map<string, { last_generated_at?: string; total_generations: number }>();
    if (userIds.length > 0) {
      const [jobsRes, freestyleRes] = await Promise.all([
        admin
          .from("generation_jobs")
          .select("user_id, created_at")
          .eq("status", "completed")
          .in("user_id", userIds),
        admin
          .from("freestyle_generations")
          .select("user_id, created_at")
          .in("user_id", userIds),
      ]);
      const ingest = (rows: any[] | null) => {
        for (const r of rows ?? []) {
          const uid = r.user_id as string;
          const cur = aggregates.get(uid) ?? { total_generations: 0 };
          cur.total_generations += 1;
          if (!cur.last_generated_at || r.created_at > cur.last_generated_at) {
            cur.last_generated_at = r.created_at;
          }
          aggregates.set(uid, cur);
        }
      };
      ingest(jobsRes.data);
      ingest(freestyleRes.data);
    }

    let added = 0;
    let updated = 0;
    let failed = 0;

    const processOne = async (p: any) => {
      const email = String(p.email || "").toLowerCase().trim();
      if (!email) { failed++; return; }

      const firstName = p.first_name || p.display_name || email.split("@")[0] || null;
      const lastName = p.last_name || null;
      const agg = aggregates.get(p.user_id);
      const primaryCategory =
        Array.isArray(p.product_categories) && p.product_categories.length > 0
          ? p.product_categories[0]
          : undefined;

      const properties = buildProperties({
        plan: p.plan,
        product_categories: p.product_categories,
        signup_date: p.created_at ? new Date(p.created_at).toISOString() : undefined,
        credits_balance: p.credits_balance,
        lifecycle_stage: resolveLifecycleStage(p.plan, p.subscription_status),
        subscription_status: p.subscription_status,
        subscription_renews_at: p.current_period_end ? new Date(p.current_period_end).toISOString() : undefined,
        last_active_at: p.updated_at ? new Date(p.updated_at).toISOString() : undefined,
        last_generated_at: agg?.last_generated_at,
        total_generations: agg?.total_generations ?? 0,
        primary_category: primaryCategory,
        referral_source: p.referral_source,
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
        },
      );

      if (res.ok) {
        added++;
        // POST silently ignores properties — follow up with PATCH to persist them.
        if (Object.keys(properties).length > 0) {
          await fetch(
            `${RESEND_API}/audiences/${RESEND_AUDIENCE_ID}/contacts/${encodeURIComponent(email)}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ properties }),
            },
          );
        }
        return;
      }

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
        },
      );
      if (patchRes.ok) updated++;
      else {
        failed++;
        console.error(`Failed for ${email}: POST ${res.status} / PATCH ${patchRes.status}`);
      }
    };

    // Parallel batches of 10
    const BATCH = 10;
    for (let i = 0; i < rows.length; i += BATCH) {
      const slice = rows.slice(i, i + BATCH);
      await Promise.allSettled(slice.map(processOne));
    }

    const processed = rows.length;
    const nextOffset = offset + processed;
    const hasMore = (totalOptedIn ?? 0) > nextOffset;

    return json({
      ok: true,
      processed_from: offset,
      processed_to: nextOffset,
      processed,
      total_opted_in: totalOptedIn ?? 0,
      added,
      updated,
      failed,
      has_more: hasMore,
      next_offset: hasMore ? nextOffset : null,
    });
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
