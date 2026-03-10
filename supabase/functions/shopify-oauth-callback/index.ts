import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const shop = url.searchParams.get("shop");
    const state = url.searchParams.get("state"); // user JWT

    if (!code || !shop || !state) {
      return new Response("Missing code, shop, or state", { status: 400 });
    }

    const clientId = Deno.env.get("SHOPIFY_CLIENT_ID");
    const clientSecret = Deno.env.get("SHOPIFY_CLIENT_SECRET");
    if (!clientId || !clientSecret) {
      return new Response("Server misconfigured", { status: 500 });
    }

    // Exchange code for permanent access token
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      console.error("Token exchange failed:", text);
      return new Response(`Token exchange failed: ${tokenRes.status}`, { status: 502 });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const scope = tokenData.scope || "read_products";

    if (!accessToken) {
      return new Response("No access token returned", { status: 502 });
    }

    // Validate the user JWT from state
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${state}` } } }
    );

    const { data: { user }, error: userErr } = await supabaseUser.auth.getUser(state);
    if (userErr || !user) {
      console.error("JWT validation failed:", userErr);
      return new Response("Invalid or expired session. Please try connecting again.", { status: 401 });
    }

    const userId = user.id;

    // Save connection using service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const cleanShop = shop.replace(/^https?:\/\//, "").replace(/\/+$/, "");

    const { error: upsertErr } = await supabaseAdmin
      .from("shopify_connections")
      .upsert(
        {
          user_id: userId,
          shop_domain: cleanShop,
          access_token: accessToken,
          scope,
        },
        { onConflict: "user_id,shop_domain" }
      );

    if (upsertErr) {
      console.error("DB upsert error:", upsertErr);
      return new Response("Failed to save connection", { status: 500 });
    }

    // Redirect back to app
    const appUrl = "https://vovvai.lovable.app/app/products/add?tab=shopify&shopify=connected";
    return new Response(null, {
      status: 302,
      headers: { Location: appUrl },
    });
  } catch (err) {
    console.error("shopify-oauth-callback error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
