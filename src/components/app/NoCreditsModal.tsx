import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, Check, Sparkles, Zap, Building2 } from 'lucide-react';
import { creditPacks, pricingPlans } from '@/data/mockData';
import { useCredits, PLAN_CONFIG } from '@/contexts/CreditContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { type ConversionCategory, getLayer3Headline, getLayer3Subline } from '@/lib/conversionCopy';

interface NoCreditsModalProps {
  open: boolean;
  onClose: () => void;
  category?: ConversionCategory;
  generationCount?: number;
  previewPlan?: string;
}

const subscribablePlans = pricingPlans.filter(
  (p) => p.planId !== 'free' && !p.isEnterprise,
);

const PLAN_DESCRIPTORS: Record<string, string> = {
  starter: 'BEST TO START',
  growth: 'BEST VALUE',
  pro: 'FOR SCALE',
};

const PLAN_CTA_LABELS: Record<string, string> = {
  starter: 'Get Starter',
  growth: 'Get Growth',
  pro: 'Get Pro',
};

const PLAN_DIFFERENTIATORS: Record<string, { text: string; badge?: string }[]> = {
  starter: [
    { text: 'No watermarks on AI images' },
    { text: 'Bulk generations' },
    { text: 'Up to 100 products' },
  ],
  growth: [
    { text: 'Faster generation' },
    { text: 'Up to 250 products' },
    { text: 'Brand Models', badge: 'NEW' },
  ],
  pro: [
    { text: 'Fastest generation' },
    { text: 'Unlimited products' },
    { text: 'Brand Models', badge: 'NEW' },
  ],
};

/* ─── Free users: subscription plan grid ─── */
function FreePlanSection({
  onPlanSelect,
}: {
  onPlanSelect: (plan: typeof subscribablePlans[0], isAnnual: boolean) => void;
}) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const isAnnual = billingCycle === 'annual';
  const isMobile = useIsMobile();

  const displayPlans = isMobile
    ? [...subscribablePlans].sort((a, b) => {
        if (a.highlighted) return -1;
        if (b.highlighted) return 1;
        return 0;
      })
    : subscribablePlans;

  return (
    <div className="space-y-5">
      {/* Subtitle */}
      <p className="text-sm text-muted-foreground text-center">
        Pick a plan to keep creating
      </p>

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
              isAnnual ? 'bg-primary-foreground/25 text-primary-foreground' : 'bg-primary text-primary-foreground'
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
          const credits = typeof p.credits === 'number' ? p.credits : 0;
          const imageEstimate = credits > 0 ? Math.round(credits / 5) : null;
          const descriptor = PLAN_DESCRIPTORS[p.planId] ?? '';
          
          const ctaLabel = PLAN_CTA_LABELS[p.planId] ?? `Choose ${p.name}`;
          const differentiators = PLAN_DIFFERENTIATORS[p.planId] ?? [];

          // Starter baseline for save % calculation
          const starterPlan = subscribablePlans.find(sp => sp.planId === 'starter');
          const starterCredits = typeof starterPlan?.credits === 'number' ? starterPlan.credits : 0;
          const starterPrice = isAnnual && starterPlan ? Math.round(starterPlan.annualPrice / 12) : (starterPlan?.monthlyPrice ?? 0);
          const starterPPC = starterCredits > 0 ? starterPrice / starterCredits : 0;
          const currentPPC = credits > 0 && displayPrice > 0 ? displayPrice / credits : 0;
          const savePct = starterPPC > 0 && currentPPC > 0 && p.planId !== 'starter'
            ? Math.round((1 - currentPPC / starterPPC) * 100)
            : 0;

          return (
            <div
              key={p.planId}
              className={`relative rounded-2xl text-center transition-all duration-200 flex flex-col ${
                isHighlighted
                  ? 'bg-card border-2 border-primary shadow-md hover:shadow-lg'
                  : 'bg-card border border-border/60 shadow-sm hover:shadow-lg'
              }`}
            >
              {isHighlighted && (
                <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider px-3 py-1 border-0 shadow-sm z-10">
                  MOST POPULAR
                </Badge>
              )}
              <div className="p-5 sm:p-6 flex flex-col flex-1">
                {/* Plan name + descriptor */}
                <div className="mb-5">
                  <p className="text-lg font-semibold tracking-tight">{p.name}</p>
                  {descriptor && (
                    <p className="text-sm mt-1 text-muted-foreground">{descriptor}</p>
                  )}
                </div>

                {/* Price */}
                <div className="mb-5 text-center">
                  <p className="tracking-tight">
                    {isAnnual && p.monthlyPrice > displayPrice && (
                      <span className="text-sm line-through mr-1.5 text-muted-foreground">${p.monthlyPrice}</span>
                    )}
                    <span className="text-4xl font-bold">${displayPrice}</span>
                    <span className="text-base font-normal text-muted-foreground">/mo</span>
                  </p>
                </div>

                {/* Unified bullet list */}
                <div className="space-y-2 text-left flex-1">
                  {(() => {
                    const bullets: { text: string; badge?: string; color?: string }[] = [];
                    if (imageEstimate) {
                      bullets.push({ text: `~${imageEstimate} images / month` });
                      bullets.push({ text: `${credits.toLocaleString()} credits / month` });
                      if (displayPrice > 0) {
                        const saveBadge = savePct > 0 ? `SAVE ${savePct}%` : (isAnnual ? 'SAVE 20%' : undefined);
                        bullets.push({ text: `$${(displayPrice / credits).toFixed(3)} per credit`, badge: saveBadge });
                      }
                    }
                    bullets.push(...differentiators);
                    return bullets.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary/60" />
                        <span className="text-sm leading-snug inline-flex items-center gap-1.5 text-muted-foreground">
                          <span className="font-normal">{feat.text}</span>
                          {feat.badge && (
                            <Badge className="text-[10px] px-1.5 py-0.5 leading-tight font-bold border-0 bg-primary text-primary-foreground">
                              {feat.badge}
                            </Badge>
                          )}
                        </span>
                      </div>
                    ));
                  })()}
                </div>

                {/* CTA */}
                <div className="pt-4 mt-auto">
                  <Button
                    variant={isHighlighted ? 'default' : 'outline'}
                    className="w-full min-h-[44px] rounded-xl text-sm font-medium"
                    onClick={() => onPlanSelect(p, isAnnual)}
                  >
                    {ctaLabel}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reassurance */}
      <div className="space-y-2.5 pt-5 border-t border-border/15">
        <p className="text-xs text-muted-foreground font-medium text-center">
          Cancel anytime · No commitment
        </p>
        <p className="text-xs text-muted-foreground/70 text-center">
          All paid plans include product visuals, freestyle creation, and 1,000+ scenes.
        </p>
      </div>
    </div>
  );
}

/* ─── Paid users: credit top-up packs ─── */
function TopUpSection({
  onPurchase,
}: {
  onPurchase: (stripePriceId: string | undefined) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold tracking-tight">Top Up Credits</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 overflow-visible">
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
            <div className="p-5 sm:p-6 space-y-3">
              <div className="space-y-0.5">
                <p className="text-2xl font-bold tracking-tight">{pack.credits.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold">credits</p>
              </div>
              <div className="h-px bg-border/60 mx-3" />
              <div className="space-y-0.5">
                <p className="text-lg font-semibold tracking-tight">${pack.price}</p>
                <p className="text-xs text-muted-foreground">{(pack.pricePerCredit * 100).toFixed(1)}¢ each</p>
              </div>
              <Button
                variant={pack.popular ? 'default' : 'outline'}
                className="w-full min-h-[44px] rounded-xl text-sm font-medium"
                onClick={() => onPurchase(pack.stripePriceId)}
              >
                Purchase
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Upgrade nudge card for starter/growth ─── */
function UpgradeCard({
  nextPlan,
  isAnnual,
  onSelect,
}: {
  nextPlan: typeof subscribablePlans[0];
  isAnnual: boolean;
  onSelect: () => void;
}) {
  const displayPrice = isAnnual ? Math.round(nextPlan.annualPrice / 12) : nextPlan.monthlyPrice;
  const features = PLAN_DIFFERENTIATORS[nextPlan.planId] ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold tracking-tight">Or upgrade for more monthly credits</h3>
      </div>
      <div className="rounded-2xl border-2 border-primary bg-primary/[0.02] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <p className="text-base font-bold tracking-tight">{nextPlan.name}</p>
              <Badge variant="secondary" className="text-[10px] font-medium">
                {typeof nextPlan.credits === 'number' ? nextPlan.credits.toLocaleString() : nextPlan.credits} credits/mo
              </Badge>
            </div>
            <div className="flex items-baseline gap-1">
              {isAnnual && nextPlan.monthlyPrice > displayPrice && (
                <span className="text-xs text-muted-foreground line-through">${nextPlan.monthlyPrice}</span>
              )}
              <span className="text-xl font-bold tracking-tight">${displayPrice}</span>
              <span className="text-xs text-muted-foreground">/mo</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {typeof nextPlan.credits === 'number' && (
                <span className="text-xs text-muted-foreground">≈ {Math.round(nextPlan.credits / 5)} images</span>
              )}
              {features.map((feat, i) => (
                <span key={i} className="text-xs text-muted-foreground inline-flex items-center gap-1">
                  <Check className="w-3 h-3 text-primary" />
                  {feat.text}
                  {feat.badge && (
                    <Badge className="text-[7px] px-1 py-0 leading-tight bg-primary text-primary-foreground">
                      {feat.badge}
                    </Badge>
                  )}
                </span>
              ))}
            </div>
          </div>
          <Button
            className="min-h-[44px] rounded-xl text-sm font-medium shrink-0 px-6"
            onClick={onSelect}
          >
            Upgrade to {nextPlan.name}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Enterprise CTA for Pro users ─── */
function EnterpriseCTA() {
  return (
    <div className="rounded-2xl border border-border/50 bg-muted/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <Building2 className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm tracking-tight">Need more? Talk to our team</p>
          <p className="text-xs text-muted-foreground mt-0.5">Custom credit volumes, dedicated support & integrations</p>
        </div>
      </div>
      <Button variant="outline" className="min-h-[44px] rounded-xl text-xs font-medium shrink-0" asChild>
        <a href="mailto:hello@vovv.ai">
          Contact Sales
          <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
        </a>
      </Button>
    </div>
  );
}

/* ─── Main Modal ─── */
export function NoCreditsModal({ open, onClose, category = 'fallback', generationCount = 0, previewPlan }: NoCreditsModalProps) {
  const { startCheckout, plan: userPlan, balance } = useCredits();
  const plan = previewPlan ?? userPlan;
  const isFree = plan === 'free';
  const isPro = plan === 'pro';
  const isPaid = !isFree;

  const [upgradeBillingCycle, setUpgradeBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const isUpgradeAnnual = upgradeBillingCycle === 'annual';

  const nextPlanId = PLAN_CONFIG[plan]?.nextPlanId;
  const nextPlan = nextPlanId ? subscribablePlans.find((p) => p.planId === nextPlanId) : null;
  const hasUpgradePath = isPaid && !isPro && nextPlan;

  const handleCreditPurchase = (stripePriceId: string | undefined) => {
    if (!stripePriceId) return;
    startCheckout(stripePriceId, 'payment');
    onClose();
  };

  const handlePlanSelect = (p: typeof subscribablePlans[0], isAnnual: boolean) => {
    const priceId = isAnnual ? p.stripePriceIdAnnual : p.stripePriceIdMonthly;
    if (!priceId) return;
    startCheckout(priceId, 'subscription');
    onClose();
  };

  const handleUpgradeSelect = () => {
    if (!nextPlan) return;
    handlePlanSelect(nextPlan, isUpgradeAnnual);
  };

  const headline = isFree
    ? 'Choose a plan to keep creating with VOVV'
    : getLayer3Headline(category);
  const subline = isFree
    ? 'Create more visuals, faster — with better value on larger plans'
    : generationCount > 0
      ? getLayer3Subline(generationCount)
      : 'Top up credits to continue this session';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:max-h-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:top-0 max-sm:left-0 max-sm:rounded-none p-0 gap-0 overflow-hidden max-sm:overflow-y-auto <DialogContent className="sm:max-w-2xl max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:max-h-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:top-0 max-sm:left-0 max-sm:rounded-none p-0 gap-0 overflow-hidden max-sm:overflow-y-auto border-border/50 shadow-2xl bg-background">
        {/* Header */}
        <div className="px-5 sm:px-8 pt-8 pb-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">{headline}</h2>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">{subline}</p>
            {isPaid && (
              <Badge variant="secondary" className="text-[10px] font-medium shrink-0">
                {balance} credits remaining
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-5 sm:px-8 py-7 space-y-6">
          {isFree ? (
            <FreePlanSection onPlanSelect={handlePlanSelect} />
          ) : (
            <>
              <TopUpSection onPurchase={handleCreditPurchase} />

              {hasUpgradePath && (
                <>
                  {/* Billing toggle for upgrade section */}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border/50" />
                    <div className="inline-flex rounded-full border border-border p-0.5 bg-muted/40">
                      <button
                        className={`px-3 py-1 text-[10px] font-medium rounded-full transition-all ${
                          !isUpgradeAnnual ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => setUpgradeBillingCycle('monthly')}
                      >
                        Monthly
                      </button>
                      <button
                        className={`px-3 py-1 text-[10px] font-medium rounded-full transition-all flex items-center gap-1 ${
                          isUpgradeAnnual ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => setUpgradeBillingCycle('annual')}
                      >
                        Annual
                        <span className={`inline-flex rounded-full text-[7px] font-bold px-1 py-0.5 leading-none ${
                          isUpgradeAnnual ? 'bg-primary-foreground/25 text-primary-foreground' : 'bg-primary text-primary-foreground'
                        }`}>
                          -20%
                        </span>
                      </button>
                    </div>
                    <div className="h-px flex-1 bg-border/50" />
                  </div>

                  <UpgradeCard
                    nextPlan={nextPlan}
                    isAnnual={isUpgradeAnnual}
                    onSelect={handleUpgradeSelect}
                  />
                </>
              )}

              {isPro && <EnterpriseCTA />}
            </>
          )}
        </div>

        <DialogFooter className="px-5 sm:px-8 pb-7 pt-0 flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground mr-auto">
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
