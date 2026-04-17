import { useMemo, useState, useEffect, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ExternalLink, Lock, Loader2, Check, Zap } from 'lucide-react';
import { useCredits } from '@/contexts/CreditContext';
import { pricingPlans, creditPacks } from '@/data/mockData';

export type UpgradeModalVariant = 'auto' | 'topup' | 'no-credits';

interface UpgradePlanModalProps {
  open: boolean;
  onClose: () => void;
  /** Admin showroom only: override the user's plan to preview upgrade options */
  previewPlan?: string;
  /** Force a specific variant. 'auto' picks based on plan (Pro → topup, others → upgrade) */
  variant?: UpgradeModalVariant;
}

const CREDITS_PER_IMAGE = 5;
const PLAN_ORDER = ['free', 'starter', 'growth', 'pro', 'enterprise'];

interface ModalCopy {
  title: string;
  subtitle: string;
}

function getCopy(args: {
  variant: UpgradeModalVariant;
  effectivePlan: string;
  balance: number;
  isTopup: boolean;
  planName?: string;
}): ModalCopy {
  const { variant, effectivePlan, balance, isTopup, planName } = args;

  // Zero-credits urgency wins over generic top-up copy
  if (isTopup && variant === 'no-credits') {
    return {
      title: "You've used all your credits",
      subtitle: planName
        ? `Top up to keep creating on your ${planName} plan — credits add instantly`
        : 'Top up to keep creating — credits add instantly',
    };
  }

  if (isTopup) {
    return {
      title: 'Top up your credits',
      subtitle: 'Add credits instantly — no plan change needed',
    };
  }

  // Free user states
  if (effectivePlan === 'free') {
    if (balance === 0 || variant === 'no-credits') {
      return {
        title: "You've used all your credits",
        subtitle: 'Choose a plan to keep creating with VOVV',
      };
    }
    if (balance >= 1 && balance <= 3) {
      return {
        title: `Only ${balance} credit${balance === 1 ? '' : 's'} left`,
        subtitle: 'Pick a plan to keep your visuals flowing',
      };
    }
    return {
      title: 'Choose a plan to keep creating with VOVV',
      subtitle: 'Create more visuals, faster — with better value on larger plans',
    };
  }

  // Paid users upgrading
  return {
    title: 'Upgrade your plan',
    subtitle: 'Unlock more credits and faster output each month',
  };
}

export const UpgradePlanModal = forwardRef<HTMLDivElement, UpgradePlanModalProps>(function UpgradePlanModal({ open, onClose, previewPlan, variant = 'auto' }, _ref) {
  const navigate = useNavigate();
  const { plan, balance, billingInterval, startCheckout } = useCredits();
  const effectivePlan = previewPlan ?? plan;
  const [isAnnual, setIsAnnual] = useState(billingInterval === 'annual');
  useEffect(() => {
    if (billingInterval) setIsAnnual(billingInterval === 'annual');
  }, [billingInterval]);
  const [loading, setLoading] = useState(false);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const defaultPackId = creditPacks.find((p) => p.popular)?.packId ?? creditPacks[0]?.packId ?? '';
  const [selectedPackId, setSelectedPackId] = useState<string>(defaultPackId);

  // All plans strictly higher than current, excluding enterprise (no checkout)
  const upgradePlans = useMemo(() => {
    const currentIdx = PLAN_ORDER.indexOf(effectivePlan);
    return pricingPlans.filter((p) => {
      const idx = PLAN_ORDER.indexOf(p.planId);
      return idx > currentIdx && !p.isEnterprise && p.stripePriceIdMonthly;
    });
  }, [effectivePlan]);

  // Determine variant resolution
  const isTopup = variant === 'topup' || (variant === 'auto' && upgradePlans.length === 0);

  // Preselect Growth if available, else first
  const defaultPlanId = upgradePlans.find((p) => p.planId === 'growth')?.planId ?? upgradePlans[0]?.planId ?? '';
  const [selectedPlanId, setSelectedPlanId] = useState<string>(defaultPlanId);

  useEffect(() => {
    if (upgradePlans.length && !upgradePlans.find((p) => p.planId === selectedPlanId)) {
      const growth = upgradePlans.find((p) => p.planId === 'growth');
      setSelectedPlanId(growth?.planId ?? upgradePlans[0].planId);
    }
  }, [upgradePlans, selectedPlanId]);

  const planConfigCurrent = pricingPlans.find((p) => p.planId === effectivePlan);
  const copy = getCopy({ variant, effectivePlan, balance, isTopup, planName: planConfigCurrent?.name });

  // No upgrades available and not topup mode → admin preview fallback / nothing
  if (!isTopup && !upgradePlans.length) {
    if (previewPlan) {
      return (
        <Dialog open={open} onOpenChange={onClose}>
          <DialogContent className="max-w-sm">
            <div className="py-4 space-y-2">
              <h2 className="text-base font-semibold">No higher tier available</h2>
              <p className="text-sm text-muted-foreground">
                <code className="font-mono text-xs">previewPlan={previewPlan}</code> is already at the top tier — there's nothing above it to upgrade to.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={onClose} variant="outline">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }
    return null;
  }

  const selectedPlan = upgradePlans.find((p) => p.planId === selectedPlanId) ?? upgradePlans[0];

  const handleConfirm = async () => {
    if (!selectedPlan) return;
    const priceId = isAnnual ? selectedPlan.stripePriceIdAnnual : selectedPlan.stripePriceIdMonthly;
    if (!priceId) return;
    setLoading(true);
    try {
      await startCheckout(priceId, 'subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    const pack = creditPacks.find((p) => p.packId === selectedPackId);
    if (!pack?.stripePriceId || topUpLoading) return;
    setTopUpLoading(true);
    try {
      await startCheckout(pack.stripePriceId, 'payment');
    } finally {
      setTopUpLoading(false);
    }
  };

  const handleSeeAll = () => {
    onClose();
    navigate('/app/pricing');
  };

  const HeaderIcon = isTopup ? Zap : ArrowUpRight;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden border-border/50 shadow-2xl">
        {/* Header */}
        <div className="px-6 sm:px-8 pt-7 sm:pt-8 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-primary/10 shrink-0">
              <HeaderIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight leading-tight">{copy.title}</h2>
              <p className="text-xs text-muted-foreground mt-1">{copy.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 pb-5 space-y-5">
          {isTopup ? (
            /* === TOPUP VARIANT === */
            <div className="space-y-2.5">
              {creditPacks.map((pack) => {
                const centsPerCredit = (pack.pricePerCredit * 100).toFixed(1);
                const imageEstimate = Math.round(pack.credits / CREDITS_PER_IMAGE);
                const isSelected = pack.packId === selectedPackId;
                return (
                  <button
                    key={pack.packId}
                    type="button"
                    onClick={() => setSelectedPackId(pack.packId)}
                    className={`w-full text-left rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/[0.04] ring-1 ring-primary/30'
                        : 'border-border/50 hover:border-border bg-card'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <span
                          className={`mt-0.5 inline-flex w-4 h-4 rounded-full border items-center justify-center shrink-0 ${
                            isSelected ? 'border-primary' : 'border-muted-foreground/40'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 text-primary" strokeWidth={3} />}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground">{pack.credits.toLocaleString()} credits</span>
                            {pack.popular && (
                              <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold">
                                Best Value
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            ~{imageEstimate} images · {centsPerCredit}¢/credit
                          </p>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1 shrink-0">
                        <span className="text-xl font-semibold tracking-tight">${pack.price}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* === UPGRADE VARIANT === */
            <>
              {/* Billing toggle */}
              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-muted/50 border border-border/40 text-xs">
                <button
                  onClick={() => setIsAnnual(false)}
                  className={`px-3 py-1.5 rounded-full transition-colors ${
                    !isAnnual ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setIsAnnual(true)}
                  className={`px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
                    isAnnual ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'
                  }`}
                >
                  Annual
                  <span className="text-[10px] text-primary font-semibold">−20%</span>
                </button>
              </div>

              {/* Plan list */}
              <div className="space-y-2.5">
                {upgradePlans.map((p) => {
                  const isSelected = p.planId === selectedPlanId;
                  const isRecommended = p.planId === 'growth';
                  const credits = typeof p.credits === 'number' ? p.credits : 0;
                  const approxImages = Math.floor(credits / CREDITS_PER_IMAGE).toLocaleString();
                  const displayPrice = isAnnual ? Math.round(p.annualPrice / 12) : p.monthlyPrice;

                  return (
                    <button
                      key={p.planId}
                      type="button"
                      onClick={() => setSelectedPlanId(p.planId)}
                      className={`w-full text-left rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/[0.04] ring-1 ring-primary/30'
                          : 'border-border/50 hover:border-border bg-card'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <span
                            className={`mt-0.5 inline-flex w-4 h-4 rounded-full border items-center justify-center shrink-0 ${
                              isSelected ? 'border-primary' : 'border-muted-foreground/40'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 text-primary" strokeWidth={3} />}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-foreground">{p.name}</span>
                              {isRecommended ? (
                                <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold whitespace-nowrap">
                                  Recommended for You
                                </span>
                              ) : (
                                p.badge && (
                                  <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                                    {p.badge}
                                  </span>
                                )
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {credits.toLocaleString()} credits · ~{approxImages} images/mo
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-semibold tracking-tight">${displayPrice}</span>
                            <span className="text-[11px] text-muted-foreground">/mo</span>
                          </div>
                          {isAnnual && p.monthlyPrice > 0 && (
                            <span className="text-[10px] text-primary font-semibold mt-0.5 whitespace-nowrap">
                              Save ${(p.monthlyPrice * 12) - p.annualPrice}/yr
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

        </div>

        {/* Trust block — left-aligned, grouped */}
        <div className="px-6 sm:px-8 mt-4 sm:mt-5 mb-4 sm:mb-5 flex flex-col gap-1.5">
          <p className="text-[13px] text-muted-foreground">
            Cancel anytime · No commitment
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
            <Check className="w-3 h-3 text-primary" strokeWidth={3} />
            <span>Credits unlock instantly after checkout</span>
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
            <Lock className="w-3 h-3" />
            <span>You'll be securely redirected to complete checkout</span>
          </p>
        </div>

        <DialogFooter className="px-6 sm:px-8 pb-7 sm:pb-8 pt-0 gap-3 sm:gap-3">
          {isTopup ? (
            <>
              <Button variant="outline" onClick={onClose} disabled={topUpLoading} className="rounded-xl min-h-[44px]">
                Maybe later
              </Button>
              <Button onClick={handleTopUp} disabled={topUpLoading || !selectedPackId} className="rounded-xl min-h-[44px] gap-2">
                {topUpLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  <>
                    Continue to checkout
                    <ExternalLink className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              {typeof window !== 'undefined' && window.location.pathname === '/app/pricing' ? (
                <Button variant="outline" onClick={onClose} disabled={loading} className="rounded-xl min-h-[44px]">
                  Maybe later
                </Button>
              ) : (
                <Button variant="outline" onClick={handleSeeAll} disabled={loading} className="rounded-xl min-h-[44px]">
                  Compare plans
                </Button>
              )}
              <Button onClick={handleConfirm} disabled={loading} className="rounded-xl min-h-[44px] gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  <>
                    Continue to checkout
                    <ExternalLink className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
