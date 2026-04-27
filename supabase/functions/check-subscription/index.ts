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

function safeISODate(value: any): string | null {
  if (!value) return null;
  try {
    const ts = typeof value === 'number' ? value * 1000 : Date.parse(value);
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d.toISOString();
  } catch { return null; }
}

// Map Stripe price IDs to our plan names, credits, and billing interval
const PRICE_TO_PLAN: Record<string, { plan: string; credits: number; interval: 'monthly' | 'annual' }> = {
  // Monthly
  "price_1T26oWC8WPO5rhKrKggeWeLh": { plan: "starter", credits: 500, interval: "monthly" },
  "price_1T26pOC8WPO5rhKrjBpH0lgw": { plan: "growth", credits: 1500, interval: "monthly" },
  "price_1T26psC8WPO5rhKrGbOwmpNy": { plan: "pro", credits: 4500, interval: "monthly" },
  // Annual
  "price_1T26pAC8WPO5rhKrvWHK7Lvb": { plan: "starter", credits: 500, interval: "annual" },
  "price_1T26pcC8WPO5rhKr4w4koC4C": { plan: "growth", credits: 1500, interval: "annual" },
  "price_1T26qCC8WPO5rhKrKubiCvsd": { plan: "pro", credits: 4500, interval: "annual" },
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
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAdmin.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      logStep("Auth failed", { error: claimsError?.message });
      return new Response(JSON.stringify({ error: "Auth session missing or expired" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;
    if (!userId || !userEmail) {
      return new Response(JSON.stringify({ error: "Invalid token claims" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    logStep("User authenticated", { userId, email: userEmail });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find Stripe customer
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    if (customers.data.length === 0) {
      logStep("No Stripe customer found — using DB plan as fallback");
      const { data: profile } = await supabaseAdmin.from("profiles")
        .select("credits_balance, plan")
        .eq("user_id", userId)
        .single();

      const currentPlan = profile?.plan || "free";
      logStep("Returning DB plan", { plan: currentPlan });

      return new Response(JSON.stringify({
        plan: currentPlan,
        subscription_status: "none",
        credits_balance: profile?.credits_balance ?? 0,
        current_period_end: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for completed one-time payments (credit packs) that haven't been fulfilled
    const sessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 10,
    });

    let creditsToAdd = 0;
    // Most recent newly-fulfilled credit pack purchase (for verified GTM purchase event).
    // Only set on the same call where we transition the session to fulfilled=true,
    // so refresh / revisit will not re-emit.
    let lastCreditPackPurchase: {
      payment_intent_id: string | null;
      session_id: string;
      amount: number;
      currency: string;
      credits: number;
      plan_name: string;
    } | null = null;

    for (const session of sessions.data) {
      if (session.mode === "payment" && session.payment_status === "paid") {
        if (session.metadata?.fulfilled === "true") continue;

        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        let sessionCredits = 0;
        for (const item of lineItems.data) {
          const priceId = item.price?.id;
          if (priceId && CREDIT_PACK_AMOUNTS[priceId]) {
            const c = CREDIT_PACK_AMOUNTS[priceId];
            creditsToAdd += c;
            sessionCredits += c;
            logStep("Found unfulfilled credit pack", { priceId, credits: c });
          }
        }

        if (sessionCredits > 0 && !lastCreditPackPurchase) {
          const piId = typeof session.payment_intent === "string"
            ? session.payment_intent
            : (session.payment_intent as Stripe.PaymentIntent | null)?.id ?? null;
          lastCreditPackPurchase = {
            payment_intent_id: piId,
            session_id: session.id,
            amount: (session.amount_total ?? 0) / 100,
            currency: session.currency ?? "usd",
            credits: sessionCredits,
            plan_name: `${sessionCredits} Credits`,
          };
        }

        await stripe.checkout.sessions.update(session.id, {
          metadata: { ...session.metadata, fulfilled: "true" },
        });
      }
    }

    if (creditsToAdd > 0) {
      logStep("Adding purchased credits", { amount: creditsToAdd });
      await supabaseAdmin.rpc("add_purchased_credits", {
        p_user_id: userId,
        p_amount: creditsToAdd,
      });
    }

    // Check active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 5,
    });

    const activeSub = subscriptions.data.find(s => s.status === "active" || s.status === "trialing");
    const cancelingSub = subscriptions.data.find(s => s.status === "active" && s.cancel_at_period_end);

    // Read current DB plan + period end as fallback
    const { data: currentProfile } = await supabaseAdmin.from("profiles")
      .select("plan, current_period_end")
      .eq("user_id", userId)
      .single();

    let plan = currentProfile?.plan || "free";
    let subscriptionStatus = "none";
    let subscriptionId: string | null = null;
    let periodEnd: string | null = null;
    let billingInterval: string | null = null;
    let planInfo: { plan: string; credits: number; interval: string } | null = null;

    if (activeSub) {
      const priceId = activeSub.items.data[0]?.price?.id;
      planInfo = priceId ? PRICE_TO_PLAN[priceId] : null;

      if (planInfo) {
        plan = planInfo.plan;
        billingInterval = planInfo.interval;
      }

      subscriptionStatus = cancelingSub ? "canceling" : "active";
      subscriptionId = activeSub.id;

      // Safe date conversion — handle both number and string formats
      const rawPeriodEnd = activeSub.items?.data?.[0]?.current_period_end ?? activeSub.current_period_end;
      logStep("current_period_end raw value", { value: rawPeriodEnd, type: typeof rawPeriodEnd });
      periodEnd = safeISODate(rawPeriodEnd);

      logStep("Active subscription found", { plan, subscriptionStatus, periodEnd, billingInterval });
    } else {
      plan = "free";
      logStep("No active subscription — free plan");
    }

    // Detect plan change (e.g. free → starter) → grant credits via change_user_plan
    if (plan !== currentProfile?.plan && plan !== "free" && planInfo) {
      logStep("Plan changed, granting credits via change_user_plan", {
        from: currentProfile?.plan,
        to: plan,
        credits: planInfo.credits,
      });
      await supabaseAdmin.rpc("change_user_plan", {
        p_user_id: userId,
        p_new_plan: plan,
        p_new_credits: planInfo.credits,
      });
    }

    // Detect billing cycle rollover → reset credits (use-it-or-lose-it)
    // Only when plan is UNCHANGED but current_period_end has changed (new billing cycle)
    if (
      plan === currentProfile?.plan &&
      plan !== "free" &&
      planInfo &&
      periodEnd &&
      periodEnd !== currentProfile?.current_period_end
    ) {
      logStep("Billing cycle rolled over — resetting credits", {
        plan,
        oldPeriodEnd: currentProfile?.current_period_end,
        newPeriodEnd: periodEnd,
        allotment: planInfo.credits,
      });
      await supabaseAdmin.rpc("reset_plan_credits", {
        p_user_id: userId,
        p_plan_credits: planInfo.credits,
      });
    }

    // Sync metadata to database
    const updateData: Record<string, any> = {
      stripe_customer_id: customerId,
      subscription_status: subscriptionStatus,
      stripe_subscription_id: subscriptionId,
      current_period_end: periodEnd,
      plan,
      billing_interval: billingInterval,
    };

    await supabaseAdmin.from("profiles").update(updateData).eq("user_id", userId);
    logStep("Profile synced to database", updateData);

    // Get the latest balance
    const { data: profile } = await supabaseAdmin.from("profiles")
      .select("credits_balance, plan")
      .eq("user_id", userId)
      .single();

    // Pick the most recent paid checkout session for this customer (for GTM
    // purchase attribution on the frontend).
    let latestSessionId: string | null = null;
    for (const s of sessions.data) {
      if (s.payment_status === "paid") {
        latestSessionId = s.id;
        break;
      }
    }

    // Resolve latest invoice id from the active subscription if available.
    let latestInvoiceId: string | null = null;
    if (activeSub?.latest_invoice) {
      latestInvoiceId = typeof activeSub.latest_invoice === "string"
        ? activeSub.latest_invoice
        : (activeSub.latest_invoice as Stripe.Invoice).id ?? null;
    }

    // Resolve subscription unit amount + currency for purchase value.
    let subAmount: number | null = null;
    let subCurrency: string | null = null;
    if (activeSub) {
      const item = activeSub.items?.data?.[0];
      const unit = item?.price?.unit_amount;
      if (unit != null) subAmount = unit / 100;
      subCurrency = item?.price?.currency ?? null;
    }

    return new Response(JSON.stringify({
      plan,
      subscription_status: subscriptionStatus,
      credits_balance: profile?.credits_balance ?? 0,
      current_period_end: periodEnd,
      billing_interval: billingInterval,
      // Extra fields for GTM purchase event dedup + payload (frontend picks
      // strongest transaction id: invoice → session → subscription).
      stripe_subscription_id: subscriptionId,
      latest_invoice_id: latestInvoiceId,
      latest_session_id: latestSessionId,
      amount: subAmount,
      currency: subCurrency,
      // Newly-fulfilled credit pack purchase (verified this call only). null
      // on subsequent calls so refresh / revisit will not re-emit.
      last_credit_pack_purchase: lastCreditPackPurchase,
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
