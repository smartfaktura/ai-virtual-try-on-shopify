import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Loader2, ArrowRight, Sparkles, Image as ImageIcon, Package, Compass, ExternalLink } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

            // Credit pack: only present on the call where it was just fulfilled
            if (r.last_credit_pack_purchase) {
              setPurchaseType('credits');
              firePurchase('credits', r);
              setPhase('ready');
              return;
            }

            // Subscription: wait for active + an identifier
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
        // Backoff: 1s, 1.5s, 2s, 2s, 2.5s, 2.5s, 3s, 3s, 3s, …
        const wait = Math.min(1000 + attempt * 250, 3000);
        await new Promise((r) => setTimeout(r, wait));
      }
      if (!cancelled) setPhase('timeout');
    };

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
      <div className="min-h-[calc(100vh-3.5rem)] bg-background animate-in fade-in duration-500">
        <div className="max-w-3xl mx-auto px-6 py-16">
          {/* Verifying state */}
          {phase === 'verifying' && (
            <div className="flex flex-col items-center text-center gap-4 py-24">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <h1 className="text-xl font-medium tracking-tight">Confirming your payment</h1>
              <p className="text-sm text-muted-foreground max-w-md">
                We're verifying your transaction with our payment provider. This usually takes a few seconds
              </p>
            </div>
          )}

          {(phase === 'ready' || phase === 'timeout') && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* Hero */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto">
                  <Check className="w-6 h-6" strokeWidth={2.5} />
                </div>
                {phase === 'timeout' ? (
                  <>
                    <h1 className="text-3xl font-light tracking-tight">Your payment is processing</h1>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      It's taking a little longer than usual to confirm. You'll receive an email once everything is set,
                      and your account will update automatically
                    </p>
                  </>
                ) : isCredits ? (
                  <>
                    <h1 className="text-3xl font-light tracking-tight">
                      +{pack?.credits.toLocaleString()} credits added
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Your new balance: <span className="font-medium text-foreground">{(data?.credits_balance ?? 0).toLocaleString()}</span>
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl font-light tracking-tight">
                      You're now on <span className="font-medium">{planLabel.name}</span>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {planLabel.credits === Infinity ? 'Unlimited credits' : `${planLabel.credits.toLocaleString()} credits`} are ready to use
                      {user?.email ? <> — receipt sent to <span className="text-foreground">{user.email}</span></> : null}
                    </p>
                  </>
                )}
              </div>

              {/* Summary */}
              {!isCredits && data?.subscription_status === 'active' && (
                <Card className="border-border/60">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs uppercase tracking-[0.14em] font-semibold text-muted-foreground">
                        Plan
                      </span>
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10">{planLabel.name}</Badge>
                      {data.billing_interval && (
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {data.billing_interval}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-1">Price</div>
                        <div className="font-medium">
                          {planMonthlyPrice !== null ? `$${planMonthlyPrice}/mo` : '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-1">Monthly credits</div>
                        <div className="font-medium">
                          {planLabel.credits === Infinity ? 'Unlimited' : planLabel.credits.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-1">Renews</div>
                        <div className="font-medium">{renewDate ?? '—'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Next steps */}
              <div className="space-y-3">
                <h2 className="text-xs uppercase tracking-[0.14em] font-semibold text-muted-foreground">
                  What's next
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <NextStep
                    icon={<Sparkles className="w-4 h-4" />}
                    title="Create your first visual"
                    desc="Browse Visual Studio and pick a workflow"
                    to="/app/workflows"
                  />
                  <NextStep
                    icon={<Package className="w-4 h-4" />}
                    title="Upload a product"
                    desc="Add your products to the Library"
                    to="/app/products"
                  />
                  <NextStep
                    icon={<Compass className="w-4 h-4" />}
                    title="Explore presets"
                    desc="Discover 800+ scenes ready to use"
                    to="/app/explore"
                  />
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/60">
                <button
                  onClick={() => openCustomerPortal()}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                >
                  Manage billing & invoices
                  <ExternalLink className="w-3 h-3" />
                </button>
                <Button size="pill" onClick={() => navigate('/app/workflows')}>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Start creating
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function NextStep({ icon, title, desc, to }: { icon: React.ReactNode; title: string; desc: string; to: string }) {
  return (
    <Link
      to={to}
      className="group block rounded-lg border border-border/60 bg-card p-4 hover:border-primary/40 hover:bg-accent/40 transition-all"
    >
      <div className="flex items-center gap-2 text-foreground mb-1.5">
        <span className="text-muted-foreground group-hover:text-primary transition-colors">{icon}</span>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </Link>
  );
}
