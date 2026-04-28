import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Sparkles, Image as ImageIcon, Package, Compass, ExternalLink } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';
import { supabase } from '@/integrations/supabase/client';
import { gtmPurchase, pickTransactionId, isGtmDebugEnabled } from '@/lib/gtm';
import { pricingPlans } from '@/data/mockData';

type CheckResp = {
  plan?: string;
  subscription_status?: 'none' | 'active' | 'past_due' | 'canceling';
  credits_balance?: number;
  current_period_end?: string | null;
  billing_interval?: 'monthly' | 'annual' | null;
  stripe_subscription_id?: string | null;
  latest_invoice_id?: string | null;
  latest_session_id?: string | null;
  amount?: number | null;
  currency?: string | null;
  last_credit_pack_purchase?: {
    payment_intent_id: string | null;
    session_id: string;
    amount: number;
    currency: string;
    credits: number;
    plan_name: string;
  } | null;
};

const PLAN_LABELS: Record<string, { name: string; credits: number }> = {
  free: { name: 'Free', credits: 20 },
  starter: { name: 'Starter', credits: 500 },
  growth: { name: 'Growth', credits: 1500 },
  pro: { name: 'Pro', credits: 4500 },
  enterprise: { name: 'Enterprise', credits: Infinity },
};

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openCustomerPortal } = useCredits();

  const returnedSessionId = params.get('session_id');

  const [phase, setPhase] = useState<'verifying' | 'ready' | 'timeout'>('verifying');
  const [data, setData] = useState<CheckResp | null>(null);
  const [purchaseType, setPurchaseType] = useState<'subscription' | 'credits' | null>(null);
  const purchaseFiredRef = useRef(false);

  // Poll check-subscription until verified or timeout (~24s)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const debug = isGtmDebugEnabled();

    const firePurchase = (type: 'subscription' | 'credits', r: CheckResp) => {
      if (purchaseFiredRef.current || !user) return;
      purchaseFiredRef.current = true;

      if (type === 'credits' && r.last_credit_pack_purchase) {
        const pack = r.last_credit_pack_purchase;
        gtmPurchase({
          userId: user.id,
          transactionId: pack.payment_intent_id || pack.session_id,
          purchaseType: 'credits',
          planName: pack.plan_name,
          value: pack.amount,
          currency: pack.currency,
        });
        return;
      }

      const txId = pickTransactionId({
        invoiceId: r.latest_invoice_id,
        sessionId: returnedSessionId || r.latest_session_id,
        subscriptionId: r.stripe_subscription_id,
      });
      if (!txId) return;
      gtmPurchase({
        userId: user.id,
        transactionId: txId,
        purchaseType: 'subscription',
        planName: r.plan || 'subscription',
        value: r.amount ?? 0,
        currency: r.currency || 'USD',
      });
    };

    const poll = async () => {
      const MAX = 12;
      for (let attempt = 1; attempt <= MAX; attempt++) {
        if (cancelled) return;
        try {
          const { data: resp, error } = await supabase.functions.invoke('check-subscription');
          if (error) {
            if (debug) console.warn('[payment-success] check-subscription error', error);
          } else if (resp) {
            setData(resp as CheckResp);
            const r = resp as CheckResp;

            if (r.last_credit_pack_purchase) {
              setPurchaseType('credits');
              firePurchase('credits', r);
              setPhase('ready');
              return;
            }

            if (
              r.subscription_status === 'active' &&
              (r.latest_invoice_id || r.stripe_subscription_id || returnedSessionId)
            ) {
              setPurchaseType('subscription');
              firePurchase('subscription', r);
              setPhase('ready');
              return;
            }
          }
        } catch (err) {
          if (debug) console.warn('[payment-success] poll exception', err);
        }
        const wait = Math.min(1000 + attempt * 250, 3000);
        await new Promise((r) => setTimeout(r, wait));
      }
      if (!cancelled) setPhase('timeout');
    };

    poll();
    return () => { cancelled = true; };
  }, [user, returnedSessionId]);

  const planLabel = useMemo(() => {
    const key = data?.plan || 'starter';
    return PLAN_LABELS[key] || PLAN_LABELS.starter;
  }, [data?.plan]);

  const renewDate = data?.current_period_end
    ? new Date(data.current_period_end).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  const planMonthlyPrice = useMemo(() => {
    const p = pricingPlans.find((x) => x.planId === (data?.plan || 'starter'));
    if (!p) return null;
    return data?.billing_interval === 'annual' ? Math.round(p.annualPrice / 12) : p.monthlyPrice;
  }, [data?.plan, data?.billing_interval]);

  const isCredits = purchaseType === 'credits';
  const pack = data?.last_credit_pack_purchase;

  return (
    <>
      <SEOHead title="Payment successful — VOVV.AI" description="Your VOVV.AI plan is active." noindex />
      <div className="min-h-[calc(100vh-3.5rem)] bg-[#FAFAF8]">
        <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 lg:pt-32 lg:pb-28">
          {/* Verifying */}
          {phase === 'verifying' && (
            <div className="flex flex-col items-center text-center gap-5 py-20 animate-in fade-in duration-500">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-[pulse_1.4s_ease-in-out_infinite]" />
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-[pulse_1.4s_ease-in-out_0.2s_infinite]" />
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-[pulse_1.4s_ease-in-out_0.4s_infinite]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                Confirming your payment
              </h1>
              <p className="text-base text-muted-foreground max-w-md leading-relaxed">
                We're verifying your transaction with our payment provider — usually just a few seconds
              </p>
            </div>
          )}

          {(phase === 'ready' || phase === 'timeout') && (
            <div className="space-y-14 animate-in fade-in slide-in-from-bottom-2 duration-700">
              {/* Hero */}
              <div className="text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-5">
                  {phase === 'timeout' ? 'Almost there' : 'Payment confirmed'}
                </p>

                {phase === 'timeout' ? (
                  <h1 className="text-[2rem] sm:text-5xl lg:text-[3.5rem] font-semibold text-foreground tracking-[-0.03em] leading-[1.08] mb-6">
                    Your payment is processing
                  </h1>
                ) : isCredits ? (
                  <h1 className="text-[2rem] sm:text-5xl lg:text-[3.5rem] font-semibold text-foreground tracking-[-0.03em] leading-[1.08] mb-6">
                    +{pack?.credits.toLocaleString()} credits added
                  </h1>
                ) : (
                  <h1 className="text-[2rem] sm:text-5xl lg:text-[3.5rem] font-semibold text-foreground tracking-[-0.03em] leading-[1.08] mb-6">
                    You're now on {planLabel.name}
                  </h1>
                )}

                <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                  {phase === 'timeout' ? (
                    <>It's taking a little longer than usual to confirm — you'll receive an email once it's set, and your account will update automatically</>
                  ) : isCredits ? (
                    <>Your new balance is <span className="text-foreground font-medium">{(data?.credits_balance ?? 0).toLocaleString()}</span> credits — receipt sent to <span className="text-foreground">{user?.email}</span></>
                  ) : (
                    <>{planLabel.credits === Infinity ? 'Unlimited credits' : `${planLabel.credits.toLocaleString()} credits`} ready to use{user?.email ? <> — receipt sent to <span className="text-foreground">{user.email}</span></> : null}</>
                  )}
                </p>
              </div>

              {/* Plan summary */}
              {!isCredits && data?.subscription_status === 'active' && (
                <div className="bg-white rounded-3xl border border-[#f0efed] shadow-sm p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Plan
                    </span>
                    <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-foreground/[0.06] text-xs font-medium text-foreground">
                      {planLabel.name}
                    </span>
                    {data.billing_interval && (
                      <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-foreground/[0.04] text-xs font-medium text-muted-foreground capitalize">
                        {data.billing_interval}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                        Price
                      </div>
                      <div className="text-xl font-semibold tracking-tight text-foreground">
                        {planMonthlyPrice !== null ? `$${planMonthlyPrice}/mo` : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                        Monthly credits
                      </div>
                      <div className="text-xl font-semibold tracking-tight text-foreground">
                        {planLabel.credits === Infinity ? 'Unlimited' : planLabel.credits.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                        Renews
                      </div>
                      <div className="text-xl font-semibold tracking-tight text-foreground">
                        {renewDate ?? '—'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* What's next */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-5 text-center">
                  What's next
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <NextStep
                    icon={<Sparkles className="w-4 h-4" />}
                    title="Create your first visual"
                    desc="Browse Visual Studio and pick a workflow"
                    to="/app/workflows"
                    delay={0}
                  />
                  <NextStep
                    icon={<Package className="w-4 h-4" />}
                    title="Upload a product"
                    desc="Add your products to the Library"
                    to="/app/products"
                    delay={100}
                  />
                  <NextStep
                    icon={<Compass className="w-4 h-4" />}
                    title="Explore presets"
                    desc="Discover 800+ scenes ready to use"
                    to="/app/explore"
                    delay={200}
                  />
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex flex-col items-center gap-5 pt-6">
                <button
                  onClick={() => navigate('/app/workflows')}
                  className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
                >
                  <ImageIcon className="w-4 h-4" />
                  Start creating
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openCustomerPortal()}
                  className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground/60 font-medium hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
                >
                  Manage billing & invoices
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function NextStep({ icon, title, desc, to, delay }: { icon: React.ReactNode; title: string; desc: string; to: string; delay: number }) {
  return (
    <Link
      to={to}
      className="group block bg-white rounded-3xl border border-[#f0efed] shadow-sm p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-500"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-9 h-9 rounded-xl bg-foreground/[0.04] flex items-center justify-center text-foreground/70 mb-4 group-hover:bg-foreground/[0.06] transition-colors">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1.5 tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </Link>
  );
}
