const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API = "https://api.resend.com";

type PropDef =
  | { key: string; type: "string"; fallback_value: string }
  | { key: string; type: "number"; fallback_value: number };

const PROPERTIES: PropDef[] = [
  { key: "plan", type: "string", fallback_value: "free" },
  { key: "product_categories", type: "string", fallback_value: "" },
  { key: "signup_date", type: "string", fallback_value: "" },
  { key: "credits_balance", type: "number", fallback_value: 0 },
  // Lifecycle bundle
  { key: "lifecycle_stage", type: "string", fallback_value: "lead" },
  { key: "subscription_status", type: "string", fallback_value: "" },
  { key: "subscription_renews_at", type: "string", fallback_value: "" },
  // Activity bundle
  { key: "last_active_at", type: "string", fallback_value: "" },
  { key: "last_generated_at", type: "string", fallback_value: "" },
  { key: "total_generations", type: "number", fallback_value: 0 },
  // Acquisition bundle
  { key: "primary_category", type: "string", fallback_value: "" },
  { key: "referral_source", type: "string", fallback_value: "" },
  // Event-trigger bundle (for Resend automations via property-change triggers)
  { key: "last_event", type: "string", fallback_value: "" },
  { key: "last_event_at", type: "string", fallback_value: "" },
];

/**
 * One-off setup endpoint: registers custom contact properties on the Resend
 * account so that PATCH /audiences/{id}/contacts/{email} actually persists
 * `plan`, `product_categories`, `signup_date`, `credits_balance`.
 *
 * Idempotent: safe to call multiple times. Re-registering an existing key
 * just logs the API's response and continues.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    return json({ error: "RESEND_API_KEY not configured" }, 500);
  }

  const results: Array<Record<string, unknown>> = [];

  for (const prop of PROPERTIES) {
    // Resend rate limit: 5 req/sec — stay under by spacing 250ms apart.
    await new Promise((r) => setTimeout(r, 250));
    try {
      const res = await fetch(`${RESEND_API}/contact-properties`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(prop),
      });
      const text = await res.text();
      let parsed: any = null;
      try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }

      if (res.ok) {
        console.log(`[register-resend-properties] OK ${prop.key} -> id=${parsed?.id}`);
        results.push({ key: prop.key, status: res.status, id: parsed?.id ?? null });
      } else {
        console.warn(`[register-resend-properties] ${prop.key} status=${res.status} body=`, parsed);
        results.push({ key: prop.key, status: res.status, error: parsed });
      }
    } catch (err) {
      console.error(`[register-resend-properties] ${prop.key} threw`, err);
      results.push({ key: prop.key, error: (err as Error).message });
    }
  }

  return json({ ok: true, results }, 200);
});

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
