import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, Check, Sparkles, Zap } from 'lucide-react';
import { creditPacks, pricingPlans } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { type ConversionCategory, getLayer3Headline, getLayer3Subline } from '@/lib/conversionCopy';

interface NoCreditsModalProps {
  open: boolean;
  onClose: () => void;
  category?: ConversionCategory;
  generationCount?: number;
  /** Override plan for admin preview */
  previewPlan?: string;
}

function getUpgradeNudge(plan: string): { text: string; targetPlan: string } | null {
  if (plan === 'starter') return { text: 'Upgrade to Growth for 3× more monthly credits', targetPlan: 'growth' };
  if (plan === 'growth') return { text: 'Upgrade to Pro for 3× more monthly credits', targetPlan: 'pro' };
  return null;
}

const subscribablePlans = pricingPlans.filter(
  (p) => p.planId !== 'free' && !p.isEnterprise,
);

const MODAL_PLAN_FEATURES: Record<string, { text: string; badge?: string }[]> = {
  starter: [
    { text: '$0.078 per credit' },
    { text: 'Up to 100 products' },
  ],
  growth: [
    { text: '$0.053 per credit' },
    { text: 'Brand Models', badge: 'NEW' },
  ],
  pro: [
    { text: '$0.040 per credit' },
    { text: 'Unlimited products & profiles' },
  ],
};

export function NoCreditsModal({ open, onClose, category = 'fallback', generationCount = 0, previewPlan }: NoCreditsModalProps) {
  const { startCheckout, plan: userPlan } = useCredits();
  const plan = previewPlan ?? userPlan;
  const isFree = plan === 'free';
  const isMobile = useIsMobile();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const isAnnual = billingCycle === 'annual';

  const handleCreditPurchase = (stripePriceId: string | undefined) => {
    if (!stripePriceId) return;
    startCheckout(stripePriceId, 'payment');
    onClose();
  };

  const handlePlanSelect = (p: typeof subscribablePlans[0]) => {
    const priceId = isAnnual ? p.stripePriceIdAnnual : p.stripePriceIdMonthly;
    if (!priceId) return;
    startCheckout(priceId, 'subscription');
    onClose();
  };

  const headline = getLayer3Headline(category);
  const subline = generationCount > 0
    ? getLayer3Subline(generationCount)
    : isFree
      ? 'Unlock more credits to keep creating'
      : 'Top up credits to continue this session';

  const upgradeNudge = !isFree ? getUpgradeNudge(plan) : null;

  // On mobile, show Growth first
  const displayPlans = isMobile
    ? [...subscribablePlans].sort((a, b) => {
        if (a.highlighted) return -1;
        if (b.highlighted) return 1;
        return 0;
      })
    : subscribablePlans;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:max-h-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:top-0 max-sm:left-0 max-sm:rounded-none p-0 gap-0 overflow-hidden max-sm:overflow-y-auto border-border/50 shadow-2xl">
        {/* Header */}
        <div className="px-5 sm:px-8 pt-8 pb-5 bg-gradient-to-b from-muted/60 to-background border-b border-border/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">{headline}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{subline}</p>
        </div>

        {/* Content */}
        <div className="px-5 sm:px-8 py-7 space-y-6">
          {isFree ? (
            /* ── Free users: subscription plan cards ── */
            <>
              {/* Billing toggle */}
              <div className="flex justify-center">
                <div className="inline-flex rounded-full border border-border p-0.5 bg-muted/40">
                  <button
                    className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                      !isAnnual ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setBillingCycle('monthly')}
                  >
                    Monthly
                  </button>
                  <button
                    className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                      isAnnual ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setBillingCycle('annual')}
                  >
                    Annual
                    <span className={`inline-flex rounded-full text-[8px] font-bold px-1.5 py-0.5 leading-none ${
                      isAnnual ? 'bg-primary-foreground/25 text-primary-foreground' : 'bg-emerald-500/20 text-emerald-700'
                    }`}>
                      -20%
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 overflow-visible">
                {displayPlans.map((p) => {
                  const isHighlighted = p.highlighted;
                  const displayPrice = isAnnual ? Math.round(p.annualPrice / 12) : p.monthlyPrice;
                  return (
                    <div
                      key={p.planId}
                      className={`relative rounded-2xl border-2 text-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                        isHighlighted
                          ? 'border-primary bg-primary/[0.03] shadow-md shadow-primary/5 pt-4'
                          : 'border-border/60 hover:border-primary/30 bg-background'
                      }`}
                    >
                      {isHighlighted && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-primary text-primary-foreground text-[10px] tracking-widest uppercase px-4 py-0.5 shadow-lg shadow-primary/20">
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      <div className="p-5 sm:p-6 space-y-3">
                        <p className="text-sm font-bold tracking-tight">{p.name}</p>

                        <div className="space-y-0.5">
                          <div className="flex items-baseline justify-center gap-0.5">
                            {isAnnual && p.monthlyPrice > displayPrice && (
                              <span className="text-xs text-muted-foreground line-through mr-1">${p.monthlyPrice}</span>
                            )}
                            <span className="text-2xl font-bold tracking-tight">${displayPrice}</span>
                            <span className="text-xs text-muted-foreground">/mo</span>
                          </div>
                          {isAnnual && (
                            <p className="text-[10px] text-muted-foreground">billed annually</p>
                          )}
                        </div>

                        <div className="rounded-xl bg-muted/60 border border-border/50 px-3 py-2">
                          <p className="text-lg font-bold tracking-tight">
                            {typeof p.credits === 'number' ? p.credits.toLocaleString() : p.credits}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em]">credits/mo</p>
                        </div>

                        {/* Plan-specific differentiators */}
                        <div className="space-y-1.5 text-left">
                          {(MODAL_PLAN_FEATURES[p.planId] ?? []).map((feat, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <Check className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-[11px] text-muted-foreground leading-tight inline-flex items-center gap-1.5">
                                {feat.text}
                                {feat.badge && (
                                  <Badge className="text-[8px] px-1.5 py-0 leading-tight bg-primary text-primary-foreground">
                                    {feat.badge}
                                  </Badge>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>

                        <Button
                          variant={isHighlighted ? 'default' : 'outline'}
                          className="w-full min-h-[44px] rounded-xl text-sm font-medium"
                          onClick={() => handlePlanSelect(p)}
                        >
                          Choose {p.name}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* ── Paid users: credit top-up packs ── */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 overflow-visible">
              {creditPacks.map((pack) => (
                <div
                  key={pack.packId}
                  className={`relative rounded-2xl border-2 text-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                    pack.popular
                      ? 'border-primary bg-primary/[0.03] shadow-md shadow-primary/5 pt-4'
                      : 'border-border/60 hover:border-primary/30 bg-background'
                  }`}
                >
                  {pack.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-primary text-primary-foreground text-[10px] tracking-widest uppercase px-4 py-0.5 shadow-lg shadow-primary/20">
                        Best Value
                      </Badge>
                    </div>
                  )}
                  <div className="p-6 sm:p-7 space-y-4">
                    <div className="space-y-1">
                      <p className="text-3xl font-bold tracking-tight">{pack.credits.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold">credits</p>
                    </div>
                    <div className="h-px bg-border/60 mx-3" />
                    <div className="space-y-1">
                      <p className="text-xl font-semibold tracking-tight">${pack.price}</p>
                      <p className="text-xs text-muted-foreground">{(pack.pricePerCredit * 100).toFixed(1)}¢ each</p>
                    </div>
                    <Button
                      variant={pack.popular ? 'default' : 'outline'}
                      className="w-full min-h-[44px] rounded-xl text-sm font-medium"
                      onClick={() => handleCreditPurchase(pack.stripePriceId)}
                    >
                      Purchase
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upgrade nudge for Starter / Growth users */}
          {upgradeNudge && (
            <div className="rounded-2xl border border-border/50 bg-muted/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm tracking-tight">{upgradeNudge.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Better economics + more monthly credits included</p>
                </div>
              </div>
              <Button variant="outline" className="min-h-[44px] rounded-xl text-xs font-medium shrink-0" asChild>
                <a href="/app/settings">
                  View Plans
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
                </a>
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="px-5 sm:px-8 pb-7 pt-0 flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground mr-auto">
            <a href="/app/pricing" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
              Compare all features
              <ArrowUpRight className="w-3 h-3" />
            </a>
            <a href="mailto:hello@vovv.ai" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
              Contact Sales
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          <Button variant="outline" onClick={onClose} className="rounded-xl min-h-[44px] w-full sm:w-auto">
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
