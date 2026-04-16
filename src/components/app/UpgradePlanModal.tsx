import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ExternalLink, Lock, Loader2, Check } from 'lucide-react';
import { useCredits } from '@/contexts/CreditContext';
import { pricingPlans } from '@/data/mockData';

interface UpgradePlanModalProps {
  open: boolean;
  onClose: () => void;
}

export function UpgradePlanModal({ open, onClose }: UpgradePlanModalProps) {
  const navigate = useNavigate();
  const { plan, planConfig, billingInterval, startCheckout } = useCredits();
  const [isAnnual, setIsAnnual] = useState(billingInterval === 'annual');
  const [loading, setLoading] = useState(false);

  const targetPlan = useMemo(() => {
    if (!planConfig.nextPlanId) return null;
    return pricingPlans.find((p) => p.planId === planConfig.nextPlanId) || null;
  }, [planConfig.nextPlanId]);

  if (!targetPlan) return null;

  const currentPlanName = planConfig.name;
  const displayPrice = isAnnual
    ? Math.round(targetPlan.annualPrice / 12)
    : targetPlan.monthlyPrice;
  const credits = targetPlan.credits;

  const handleConfirm = async () => {
    const priceId = isAnnual ? targetPlan.stripePriceIdAnnual : targetPlan.stripePriceIdMonthly;
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
                {currentPlanName} → {targetPlan.name}
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 pb-6 space-y-5">
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

          {/* Plan summary */}
          <div className="rounded-2xl bg-muted/30 border border-border/40 p-5 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="font-semibold text-foreground">{targetPlan.name}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold tracking-tight">${displayPrice}</span>
                <span className="text-xs text-muted-foreground">/mo</span>
              </div>
            </div>
            <div className="h-px bg-border/40" />
            <ul className="space-y-2">
              {targetPlan.features.slice(0, 4).map((f, i) => {
                const text = typeof f === 'string' ? f : f.text;
                return (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{text}</span>
                  </li>
                );
              })}
            </ul>
            <div className="pt-1 text-xs text-muted-foreground">
              {typeof credits === 'number' ? credits.toLocaleString() : credits} credits available immediately after upgrade.
            </div>
          </div>
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
