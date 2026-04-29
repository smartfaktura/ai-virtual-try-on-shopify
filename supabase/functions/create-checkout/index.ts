import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const d = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${d}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      logStep("Auth failed", { error: userError?.message });
      return new Response(JSON.stringify({ error: "Auth session missing or expired" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = user.id;
    const userEmail = user.email || "";
    if (!userId || !userEmail) {
      return new Response(JSON.stringify({ error: "Invalid token claims" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    logStep("User authenticated", { userId, email: userEmail });

    const { priceId, mode, successUrl, cancelUrl } = await req.json();
    if (!priceId) throw new Error("priceId is required");
    logStep("Request params", { priceId, mode });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find or reference existing Stripe customer
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }
    logStep("Customer lookup", { customerId: customerId || "new" });

    const origin = req.headers.get("origin") || "https://vovv.ai";
    const checkoutMode = mode === "subscription" ? "subscription" : "payment";

    // Look up the price amount so we can pass it to the success URL for tracking
    const priceObj = await stripe.prices.retrieve(priceId);
    const priceAmount = priceObj.unit_amount ? (priceObj.unit_amount / 100).toFixed(2) : "0";
    logStep("Price amount resolved", { priceAmount });

    // Dedicated post-checkout page handles celebration + verified GTM purchase fire.
    // {CHECKOUT_SESSION_ID} is interpolated by Stripe server-side.
    const defaultSuccessUrl = `${origin}/app/payment-success?session_id={CHECKOUT_SESSION_ID}&amount=${priceAmount}`;
    const defaultCancelUrl = `${origin}/app/settings?payment=cancelled`;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: checkoutMode as any,
      success_url: successUrl || defaultSuccessUrl,
      cancel_url: cancelUrl || defaultCancelUrl,
      metadata: {
        user_id: userId,
      },
    };

    // For subscriptions, allow promotion codes
    if (checkoutMode === "subscription") {
      sessionParams.allow_promotion_codes = true;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    logStep("Checkout session created", { sessionId: session.id });

    // Track checkout start for abandoned-checkout automations (best-effort, non-blocking)
    try {
      await supabaseClient.from("checkout_sessions").insert({
        user_id: userId,
        email: userEmail,
        stripe_session_id: session.id,
        plan: priceObj.nickname || null,
        amount_cents: priceObj.unit_amount || null,
        metadata: { mode: checkoutMode, price_id: priceId },
      });
    } catch (trackErr) {
      logStep("checkout_sessions insert failed", { error: (trackErr as Error).message });
    }

    return new Response(JSON.stringify({
      url: session.url,
      sessionId: session.id,
      amount: priceObj.unit_amount ? priceObj.unit_amount / 100 : 0,
      currency: priceObj.currency || "usd", // Stripe lowercase; frontend uppercases
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
