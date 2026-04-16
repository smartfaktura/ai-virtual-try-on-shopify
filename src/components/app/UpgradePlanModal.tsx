import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ExternalLink, Lock, Loader2, Check } from 'lucide-react';
import { useCredits } from '@/contexts/CreditContext';
import { pricingPlans } from '@/data/mockData';

interface UpgradePlanModalProps {
  open: boolean;
  onClose: () => void;
  /** Admin showroom only: override the user's plan to preview upgrade options */
  previewPlan?: string;
}

const CREDITS_PER_IMAGE = 5;
const PLAN_ORDER = ['free', 'starter', 'growth', 'pro', 'enterprise'];

export function UpgradePlanModal({ open, onClose, previewPlan }: UpgradePlanModalProps) {
  const navigate = useNavigate();
  const { plan, planConfig, billingInterval, startCheckout } = useCredits();
  const effectivePlan = previewPlan ?? plan;
  const [isAnnual, setIsAnnual] = useState(billingInterval === 'annual');
  const [loading, setLoading] = useState(false);

  // All plans strictly higher than current, excluding enterprise (no checkout)
  const upgradePlans = useMemo(() => {
    const currentIdx = PLAN_ORDER.indexOf(effectivePlan);
    return pricingPlans.filter((p) => {
      const idx = PLAN_ORDER.indexOf(p.planId);
      return idx > currentIdx && !p.isEnterprise && p.stripePriceIdMonthly;
    });
  }, [effectivePlan]);

  const [selectedPlanId, setSelectedPlanId] = useState<string>(upgradePlans[0]?.planId ?? '');

  // Keep selection valid when list changes
  useEffect(() => {
    if (upgradePlans.length && !upgradePlans.find((p) => p.planId === selectedPlanId)) {
      setSelectedPlanId(upgradePlans[0].planId);
    }
  }, [upgradePlans, selectedPlanId]);

  if (!upgradePlans.length) {
    // In admin preview mode, surface an explanatory dialog instead of silently rendering nothing
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
    const priceId = isAnnual ? selectedPlan.stripePriceIdAnnual : selectedPlan.stripePriceIdMonthly;
    if (!priceId) return;
    setLoading(true);
    try {
      await startCheckout(priceId, 'subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleSeeAll = () => {
    onClose();
    navigate('/app/settings');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden border-border/50 shadow-2xl">
        {/* Header */}
        <div className="px-8 pt-8 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-primary/10">
              <ArrowUpRight className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Upgrade your plan</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choose the plan that fits
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 pb-5 space-y-5">
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
                      {/* Radio */}
                      <span
                        className={`mt-0.5 inline-flex w-4 h-4 rounded-full border items-center justify-center shrink-0 ${
                          isSelected ? 'border-primary' : 'border-muted-foreground/40'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 text-primary" strokeWidth={3} />}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{p.name}</span>
                          {p.badge && (
                            <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {credits.toLocaleString()} credits · ~{approxImages} images/mo
                        </p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 shrink-0">
                      <span className="text-xl font-semibold tracking-tight">${displayPrice}</span>
                      <span className="text-[11px] text-muted-foreground">/mo</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-muted-foreground">
            Estimates based on ~5 credits per standard image.
          </p>
        </div>

        {/* Redirect hint */}
        <div className="px-8 pb-5 pt-0 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" />
          <span>You'll be securely redirected to complete checkout</span>
        </div>

        <DialogFooter className="px-8 pb-8 pt-0 gap-3 sm:gap-3">
          <Button variant="outline" onClick={handleSeeAll} disabled={loading} className="rounded-xl min-h-[44px]">
            See all plans
          </Button>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
