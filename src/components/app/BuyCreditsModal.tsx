import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, ArrowUpRight, Check, Zap, Sparkles, Video, Wand2, Layers, Building2 } from 'lucide-react';
import { creditPacks, pricingPlans } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { PlanChangeDialog, type PlanChangeMode } from '@/components/app/PlanChangeDialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { PricingPlan } from '@/types';

const PLAN_ORDER = ['free', 'starter', 'growth', 'pro', 'enterprise'];

export function BuyCreditsModal() {
  const { balance, plan, planConfig, buyModalOpen, closeBuyModal, addCredits, subscriptionStatus } = useCredits();
  const navigate = useNavigate();

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<PlanChangeMode>('upgrade');
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  const monthlyCredits = planConfig.monthlyCredits;
  const hasBonus = balance > monthlyCredits && monthlyCredits !== Infinity;
  const usagePercent = monthlyCredits === Infinity
    ? 100
    : hasBonus
      ? 100
      : Math.min(100, Math.max(3, (balance / monthlyCredits) * 100));

  const isFree = plan === 'free';
  const isAnnual = billingPeriod === 'annual';

  const mainPlans = pricingPlans.filter(p => !p.isEnterprise);
  const enterprisePlan = pricingPlans.find(p => p.isEnterprise);

  const handlePurchase = (credits: number) => {
    addCredits(credits);
    toast.success(`Added ${credits} credits to your account!`);
    closeBuyModal();
  };

  const handlePlanSelect = (planId: string) => {
    if (planId === 'enterprise') {
      toast.info('Our team will reach out to discuss your needs!');
      return;
    }

    const targetPlan = pricingPlans.find(p => p.planId === planId);
    if (!targetPlan) return;

    const currentIdx = PLAN_ORDER.indexOf(plan);
    const targetIdx = PLAN_ORDER.indexOf(planId);

    if (planId === plan && subscriptionStatus === 'canceling') {
      setDialogMode('reactivate');
    } else if (targetIdx > currentIdx) {
      setDialogMode('upgrade');
    } else {
      setDialogMode('downgrade');
    }

    setSelectedPlan(targetPlan);
    setDialogOpen(true);
  };

  const handleDialogConfirm = () => {
    if (dialogMode === 'upgrade' && selectedPlan) {
      toast.success(`Upgraded to ${selectedPlan.name}!`);
    } else if (dialogMode === 'downgrade' && selectedPlan) {
      toast.success(`Plan will change to ${selectedPlan.name} at end of billing period.`);
    } else if (dialogMode === 'reactivate') {
      toast.success('Subscription reactivated!');
    }
    setDialogOpen(false);
    closeBuyModal();
  };

  const handleViewAllPlans = () => {
    closeBuyModal();
    navigate('/app/settings');
  };

  return (
    <>
      <Dialog open={buyModalOpen} onOpenChange={closeBuyModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden gap-4">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-lg tracking-tight">Credits & Plan</DialogTitle>
            <p className="text-sm text-muted-foreground">Manage your credits and subscription</p>
          </DialogHeader>

          {/* Balance bar */}
          <div className="flex-shrink-0 px-5 py-4 rounded-2xl bg-muted/40 border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                <span className="text-3xl font-bold tracking-tight">{balance}</span>
                <span className="text-sm text-muted-foreground">credits</span>
              </div>
              <Badge variant="secondary" className="text-[10px] tracking-wide">{planConfig.name}</Badge>
            </div>
            <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  hasBonus ? 'bg-accent-foreground/60' : 'bg-primary'
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {hasBonus
                  ? `${balance} available (includes bonus)`
                  : `${balance} / ${monthlyCredits === Infinity ? '∞' : monthlyCredits.toLocaleString()}`
                }
              </span>
              {hasBonus && (
                <span className="text-xs text-primary font-medium">Bonus credits ✓</span>
              )}
            </div>
          </div>

          <Tabs defaultValue={isFree ? 'upgrade' : 'topup'} className="w-full flex-1 flex flex-col min-h-0">
            <TabsList className="w-full flex-shrink-0">
              <TabsTrigger value="topup" className="flex-1 text-sm">Top Up</TabsTrigger>
              <TabsTrigger value="upgrade" className="flex-1 text-sm">Upgrade Plan</TabsTrigger>
            </TabsList>

            {/* Top Up Tab */}
            <TabsContent value="topup" className="flex-1 overflow-y-auto space-y-5 mt-4">
              <p className="text-sm text-muted-foreground">One-time credit packs · Never expire · Use across all modes</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {creditPacks.map((pack) => (
                  <div
                    key={pack.packId}
                    className={`relative p-5 sm:p-6 rounded-2xl border-2 text-center transition-all hover:shadow-md ${
                      pack.popular
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    {pack.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground text-[10px] tracking-wide px-3 py-0.5">
                          Best Value
                        </Badge>
                      </div>
                    )}
                    <div className="space-y-3">
                      <div className="space-y-0.5">
                        <p className="text-3xl font-bold tracking-tight">{pack.credits.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">credits</p>
                      </div>
                      <p className="text-xs text-muted-foreground">≈ {Math.round(pack.credits / 4)} images</p>
                      <div className="space-y-0.5">
                        <p className="text-xl font-semibold">${pack.price}</p>
                        <p className="text-xs text-muted-foreground">{(pack.pricePerCredit * 100).toFixed(1)}¢/cr</p>
                      </div>
                      <Button
                        variant={pack.popular ? 'default' : 'outline'}
                        className="w-full min-h-[44px]"
                        size="sm"
                        onClick={() => handlePurchase(pack.credits)}
                      >
                        Buy
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleViewAllPlans}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2 pt-1"
              >
                Or upgrade your plan for monthly credits →
              </button>
            </TabsContent>

            {/* Upgrade Plan Tab */}
            <TabsContent value="upgrade" className="flex-1 overflow-y-auto space-y-5 mt-4">
              {/* Billing toggle */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Choose your plan</p>
                <div className="flex rounded-xl border border-border overflow-hidden">
                  <button
                    className={`px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      billingPeriod === 'monthly' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
                    }`}
                    onClick={() => setBillingPeriod('monthly')}
                  >
                    Monthly
                  </button>
                  <button
                    className={`px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      billingPeriod === 'annual' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
                    }`}
                    onClick={() => setBillingPeriod('annual')}
                  >
                    Annual (-17%)
                  </button>
                </div>
              </div>

              {/* Plan columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {mainPlans.map((p) => {
                  const isCurrent = p.planId === plan;
                  const currentIdx = PLAN_ORDER.indexOf(plan);
                  const targetIdx = PLAN_ORDER.indexOf(p.planId);
                  const displayPrice = isAnnual ? Math.round(p.annualPrice / 12) : p.monthlyPrice;
                  const monthlySavings = p.monthlyPrice * 12 - p.annualPrice;

                  let ctaLabel = targetIdx > currentIdx ? `Upgrade` : `Downgrade`;
                  if (isCurrent && subscriptionStatus === 'canceling') ctaLabel = 'Reactivate';
                  else if (isCurrent) ctaLabel = 'Current Plan';
                  const isDisabled = isCurrent && subscriptionStatus !== 'canceling';

                  return (
                    <div
                      key={p.planId}
                      className={`relative rounded-2xl border-2 p-5 space-y-4 transition-all hover:shadow-md ${
                        p.highlighted
                          ? 'border-primary bg-primary/5'
                          : isCurrent
                            ? 'border-primary/30 bg-muted/30'
                            : 'border-border hover:border-primary/30'
                      }`}
                    >
                      {p.badge && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-primary text-primary-foreground text-[10px] tracking-wide px-3 py-0.5">
                            {p.badge}
                          </Badge>
                        </div>
                      )}

                      {/* Header */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-base tracking-tight">{p.name}</h4>
                          {isCurrent && <Badge variant="secondary" className="text-[9px]">Current</Badge>}
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold tracking-tight">${displayPrice}</span>
                          <span className="text-xs text-muted-foreground">/mo</span>
                        </div>
                        {isAnnual && monthlySavings > 0 && (
                          <p className="text-[10px] text-primary font-medium">Save ${monthlySavings}/yr</p>
                        )}
                      </div>

                      {/* Credits */}
                      <div className="rounded-xl bg-muted/60 border border-border/50 px-3 py-2.5 text-center">
                        <p className="text-lg font-bold tracking-tight">
                          {typeof p.credits === 'number' ? p.credits.toLocaleString() : p.credits}
                        </p>
                        <p className="text-[10px] text-muted-foreground">credits/month</p>
                      </div>

                      {/* Features */}
                      <div className="space-y-1.5">
                        {p.features.slice(0, 5).map((f, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Check className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-[11px] text-muted-foreground leading-tight">{f}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <Button
                        variant={p.highlighted ? 'default' : 'outline'}
                        className="w-full min-h-[40px] text-xs"
                        size="sm"
                        onClick={() => handlePlanSelect(p.planId)}
                        disabled={isDisabled}
                      >
                        {ctaLabel}
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Enterprise banner */}
              {enterprisePlan && (
                <div className="rounded-2xl border border-border bg-muted/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2.5">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{enterprisePlan.name}</p>
                      <p className="text-xs text-muted-foreground">Unlimited visuals, custom SLA, dedicated support</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="min-h-[40px] text-xs shrink-0" onClick={() => handlePlanSelect('enterprise')}>
                    Contact Sales
                    <ArrowUpRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              )}

              <button
                onClick={handleViewAllPlans}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                Compare all plans in Settings
              </button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <PlanChangeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleDialogConfirm}
        mode={dialogMode}
        targetPlan={selectedPlan || undefined}
        currentPlanName={planConfig.name}
        isAnnual={isAnnual}
        currentBalance={balance}
      />
    </>
  );
}
