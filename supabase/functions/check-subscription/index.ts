import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const d = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${d}`);
};

// Map Stripe price IDs to our plan names and credits
const PRICE_TO_PLAN: Record<string, { plan: string; credits: number }> = {
  // Monthly
  "price_1T26oWC8WPO5rhKrKggeWeLh": { plan: "starter", credits: 500 },
  "price_1T26pOC8WPO5rhKrjBpH0lgw": { plan: "growth", credits: 1500 },
  "price_1T26psC8WPO5rhKrGbOwmpNy": { plan: "pro", credits: 4500 },
  // Annual
  "price_1T26pAC8WPO5rhKrvWHK7Lvb": { plan: "starter", credits: 500 },
  "price_1T26pcC8WPO5rhKr4w4koC4C": { plan: "growth", credits: 1500 },
  "price_1T26qCC8WPO5rhKrKubiCvsd": { plan: "pro", credits: 4500 },
};

// Credit pack price IDs
const CREDIT_PACK_AMOUNTS: Record<string, number> = {
  "price_1T26qSC8WPO5rhKr4t7gyY8o": 200,
  "price_1T26qgC8WPO5rhKrF3wKkeft": 500,
  "price_1T26qxC8WPO5rhKrEZNQVZdu": 1500,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      logStep("No Stripe customer found — free plan");
      // Update profile to ensure it's on free plan
      await supabaseAdmin.from("profiles").update({
        subscription_status: "none",
        stripe_customer_id: null,
        stripe_subscription_id: null,
        current_period_end: null,
      }).eq("user_id", user.id);

      return new Response(JSON.stringify({
        plan: "free",
        subscription_status: "none",
        credits_balance: null,
        current_period_end: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for completed one-time payments (credit packs) that haven't been fulfilled
    // We look at recent checkout sessions
    const sessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 10,
    });

    let creditsToAdd = 0;
    for (const session of sessions.data) {
      if (session.mode === "payment" && session.payment_status === "paid") {
        // Check if already processed by looking at metadata
        if (session.metadata?.fulfilled === "true") continue;

        // Get line items to determine which credit pack
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        for (const item of lineItems.data) {
          const priceId = item.price?.id;
          if (priceId && CREDIT_PACK_AMOUNTS[priceId]) {
            creditsToAdd += CREDIT_PACK_AMOUNTS[priceId];
            logStep("Found unfulfilled credit pack", { priceId, credits: CREDIT_PACK_AMOUNTS[priceId] });
          }
        }

        // Mark as fulfilled
        await stripe.checkout.sessions.update(session.id, {
          metadata: { ...session.metadata, fulfilled: "true" },
        });
      }
    }

    // Add purchased credits if any
    if (creditsToAdd > 0) {
      logStep("Adding purchased credits", { amount: creditsToAdd });
      await supabaseAdmin.rpc("add_purchased_credits", {
        p_user_id: user.id,
        p_amount: creditsToAdd,
      });
    }

    // Check active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 5,
    });

    // Find the most relevant subscription
    const activeSub = subscriptions.data.find(s => s.status === "active" || s.status === "trialing");
    const cancelingSub = subscriptions.data.find(s => s.status === "active" && s.cancel_at_period_end);

    let plan = "free";
    let subscriptionStatus = "none";
    let subscriptionId: string | null = null;
    let periodEnd: string | null = null;

    if (activeSub) {
      const priceId = activeSub.items.data[0]?.price?.id;
      const planInfo = priceId ? PRICE_TO_PLAN[priceId] : null;

      if (planInfo) {
        plan = planInfo.plan;
      }

      subscriptionStatus = cancelingSub ? "canceling" : "active";
      subscriptionId = activeSub.id;
      periodEnd = new Date(activeSub.current_period_end * 1000).toISOString();

      logStep("Active subscription found", { plan, subscriptionStatus, periodEnd });
    } else {
      logStep("No active subscription — free plan");
    }

    // Sync to database
    const updateData: Record<string, any> = {
      stripe_customer_id: customerId,
      subscription_status: subscriptionStatus,
      stripe_subscription_id: subscriptionId,
      current_period_end: periodEnd,
      plan,
    };

    await supabaseAdmin.from("profiles").update(updateData).eq("user_id", user.id);
    logStep("Profile synced to database", updateData);

    // Get the latest balance
    const { data: profile } = await supabaseAdmin.from("profiles")
      .select("credits_balance, plan")
      .eq("user_id", user.id)
      .single();

    return new Response(JSON.stringify({
      plan,
      subscription_status: subscriptionStatus,
      credits_balance: profile?.credits_balance ?? 0,
      current_period_end: periodEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
