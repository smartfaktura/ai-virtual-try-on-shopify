import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-action, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || req.headers.get("x-action");

    if (action === "authorize") {
      const shop = url.searchParams.get("shop")?.replace(/^https?:\/\//, "").replace(/\/+$/, "");
      const token = url.searchParams.get("token");
      const origin = url.searchParams.get("origin") || "https://vovvai.lovable.app";

      if (!shop || !token) {
        return new Response("Missing shop or token", { status: 400 });
      }

      const clientId = Deno.env.get("SHOPIFY_CLIENT_ID");
      if (!clientId) {
        return new Response("Server misconfigured", { status: 500 });
      }

      // Validate the JWT before proceeding (hardening item #2)
      const supabaseUser = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      );
      const { data: { user }, error: userErr } = await supabaseUser.auth.getUser(token);
      if (userErr || !user) {
        return new Response("Invalid or expired session", { status: 401 });
      }

      // Generate a nonce and store it in the DB (hardening item #1)
      const nonce = crypto.randomUUID();
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Clean up expired nonces opportunistically
      await supabaseAdmin.rpc("cleanup_expired_nonces");

      const { error: nonceErr } = await supabaseAdmin
        .from("shopify_oauth_nonces")
        .insert({ nonce, user_id: user.id, user_token: token, app_origin: origin });

      if (nonceErr) {
        console.error("Failed to store nonce:", nonceErr);
        return new Response("Internal error", { status: 500 });
      }

      const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/shopify-oauth-callback`;
      const scopes = "read_products";

      const authUrl =
        `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(nonce)}`;

      return new Response(null, {
        status: 302,
        headers: { Location: authUrl, ...corsHeaders },
      });
    }

    if (action === "disconnect") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabaseUser = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userErr } = await supabaseUser.auth.getUser(token);
      if (userErr || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userId = user.id;

      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { error: deleteErr } = await supabaseAdmin
        .from("shopify_connections")
        .delete()
        .eq("user_id", userId);

      if (deleteErr) {
        return new Response(JSON.stringify({ error: deleteErr.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("shopify-oauth error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
