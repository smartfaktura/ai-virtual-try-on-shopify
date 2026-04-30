import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Authn: validate caller JWT and confirm admin role
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims();
    if (claimsErr || !claimsData?.claims?.sub) {
      return json({ error: "Invalid session" }, 401);
    }
    const callerId = claimsData.claims.sub as string;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: isAdmin, error: roleErr } = await admin.rpc("has_role", {
      _user_id: callerId,
      _role: "admin",
    });
    if (roleErr || !isAdmin) {
      return json({ error: "Forbidden — admin only" }, 403);
    }

    // Input
    let body: { email?: string };
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }
    const emailRaw = (body?.email ?? "").toString().trim().toLowerCase();
    if (!emailRaw || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) {
      return json({ error: "Valid 'email' is required" }, 400);
    }

    console.log(`[admin-hard-delete-user] caller=${callerId} target=${emailRaw}`);

    // Find auth user by email (paginate just in case)
    let targetUserId: string | null = null;
    {
      // Try profiles first (fast path)
      const { data: prof } = await admin
        .from("profiles")
        .select("user_id")
        .eq("email", emailRaw)
        .maybeSingle();
      if (prof?.user_id) targetUserId = prof.user_id as string;
    }

    if (!targetUserId) {
      // Fallback: scan auth users
      let page = 1;
      while (page <= 20 && !targetUserId) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
        if (error) break;
        const found = data.users.find((u) => (u.email ?? "").toLowerCase() === emailRaw);
        if (found) targetUserId = found.id;
        if (!data.users.length || data.users.length < 200) break;
        page++;
      }
    }

    const removed = {
      auth: false as boolean,
      profiles: 0,
      suppressed: 0,
      unsub: 0,
      email_log: 0,
      unsub_tokens: 0,
    };

    // Always clear email-related rows by email, even if no auth user exists
    const { count: supCount } = await admin
      .from("suppressed_emails")
      .delete({ count: "exact" })
      .eq("email", emailRaw);
    removed.suppressed = supCount ?? 0;

    const { count: unsubCount } = await admin
      .from("marketing_unsubscribes")
      .delete({ count: "exact" })
      .eq("email", emailRaw);
    removed.unsub = unsubCount ?? 0;

    // best-effort: unsubscribe tokens
    try {
      const { count } = await admin
        .from("email_unsubscribe_tokens")
        .delete({ count: "exact" })
        .eq("email", emailRaw);
      removed.unsub_tokens = count ?? 0;
    } catch (_) { /* table may not allow delete */ }

    if (targetUserId) {
      const { count: profCount } = await admin
        .from("profiles")
        .delete({ count: "exact" })
        .eq("user_id", targetUserId);
      removed.profiles = profCount ?? 0;

      const { error: delErr } = await admin.auth.admin.deleteUser(targetUserId);
      if (delErr) {
        console.error("[admin-hard-delete-user] auth deleteUser failed", delErr);
        return json(
          { error: `Auth delete failed: ${delErr.message}`, partial: removed },
          500,
        );
      }
      removed.auth = true;
    }

    return json({
      ok: true,
      email: emailRaw,
      target_user_id: targetUserId,
      removed,
    });
  } catch (e) {
    console.error("[admin-hard-delete-user] unexpected", e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
