import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const encoder = new TextEncoder();
  const aBuf = encoder.encode(a);
  const bBuf = encoder.encode(b);
  let result = 0;
  for (let i = 0; i < aBuf.length; i++) {
    result |= aBuf[i] ^ bBuf[i];
  }
  return result === 0;
}

async function verifyHmac(query: URLSearchParams, clientSecret: string): Promise<boolean> {
  const hmac = query.get("hmac");
  if (!hmac) return false;

  // Build sorted param string excluding hmac
  const params = new URLSearchParams();
  for (const [key, val] of query.entries()) {
    if (key !== "hmac") params.set(key, val);
  }
  const sortedParams = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(clientSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(sortedParams));
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return timingSafeEqual(computed, hmac);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const shop = url.searchParams.get("shop");
    const state = url.searchParams.get("state"); // JSON: { token, origin }

    if (!code || !shop || !state) {
      return new Response("Missing code, shop, or state", { status: 400 });
    }

    const clientId = Deno.env.get("SHOPIFY_CLIENT_ID");
    const clientSecret = Deno.env.get("SHOPIFY_CLIENT_SECRET");
    if (!clientId || !clientSecret) {
      return new Response("Server misconfigured", { status: 500 });
    }

    // Validate HMAC from Shopify
    const hmacValid = await verifyHmac(url.searchParams, clientSecret);
    if (!hmacValid) {
      console.error("HMAC validation failed");
      return new Response("Invalid HMAC signature", { status: 403 });
    }

    // Parse state — supports both legacy (plain JWT) and new (JSON with origin)
    let userToken: string;
    let appOrigin: string;
    try {
      const parsed = JSON.parse(state);
      userToken = parsed.token;
      appOrigin = parsed.origin || "https://vovvai.lovable.app";
    } catch {
      // Legacy: state is just the JWT token
      userToken = state;
      appOrigin = "https://vovvai.lovable.app";
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

    // Validate the user JWT
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${userToken}` } } }
    );

    const { data: { user }, error: userErr } = await supabaseUser.auth.getUser(userToken);
    if (userErr || !user) {
      console.error("JWT validation failed:", userErr);
      return new Response("Invalid or expired session. Please try connecting again.", { status: 401 });
    }

    const userId = user.id;

    // Save connection using service role (upsert now works with unique constraint)
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

    // Redirect back to app using dynamic origin
    const redirectUrl = `${appOrigin}/app/products/add?tab=shopify&shopify=connected`;
    return new Response(null, {
      status: 302,
      headers: { Location: redirectUrl },
    });
  } catch (err) {
    console.error("shopify-oauth-callback error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
