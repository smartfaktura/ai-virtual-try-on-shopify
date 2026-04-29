import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { email, token } = await req.json();
    if (!email || !token) return json({ error: "Missing email or token" }, 400);

    const normalized = String(email).toLowerCase().trim();

    const { data: tokenRow, error: tErr } = await admin
      .from("email_unsubscribe_tokens")
      .select("email, used_at")
      .eq("token", token)
      .maybeSingle();

    if (tErr || !tokenRow) return json({ error: "Invalid token" }, 400);
    if (tokenRow.email.toLowerCase() !== normalized) return json({ error: "Token / email mismatch" }, 400);

    // Mark token used
    await admin.from("email_unsubscribe_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("token", token);

    // Lookup user
    const { data: profile } = await admin.from("profiles")
      .select("user_id").eq("email", normalized).maybeSingle();

    // Add to marketing_unsubscribes
    await admin.from("marketing_unsubscribes").upsert({
      email: normalized,
      user_id: profile?.user_id ?? null,
      reason: "user_unsubscribed",
    }, { onConflict: "email" });

    // Add to suppressed_emails so even targeted sends are blocked
    await admin.from("suppressed_emails").upsert({
      email: normalized,
      reason: "unsubscribed",
    }, { onConflict: "email" });

    return json({ ok: true });
  } catch (e) {
    console.error("[handle-marketing-unsubscribe]", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
