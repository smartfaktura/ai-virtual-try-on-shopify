import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, ArrowUpRight, Check, Building2, Sparkles } from 'lucide-react';
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

  const [activeTab, setActiveTab] = useState<'topup' | 'upgrade'>(() => plan === 'free' ? 'upgrade' : 'topup');
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
        <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden border-border/50 shadow-2xl">
          
          {/* Premium Balance Header */}
          <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-muted/60 to-background border-b border-border/50">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight">{balance.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground font-medium">credits</span>
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px] tracking-widest uppercase font-semibold px-3 py-1">
                {planConfig.name}
              </Badge>
            </div>
            <div className="h-1 w-full rounded-full bg-secondary/80 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  hasBonus ? 'bg-accent-foreground/50' : 'bg-primary/80'
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2.5">
              <span className="text-xs text-muted-foreground">
                {hasBonus
                  ? `${balance.toLocaleString()} available (includes bonus)`
                  : `${balance.toLocaleString()} / ${monthlyCredits === Infinity ? '∞' : monthlyCredits.toLocaleString()}`
                }
              </span>
              {hasBonus && (
                <span className="text-xs text-primary font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Bonus credits
                </span>
              )}
            </div>
          </div>

          {/* Custom Tab Switcher */}
          <div className="px-6 pt-4">
            <div className="flex gap-1 border-b border-border/50">
              <button
                onClick={() => setActiveTab('topup')}
                className={`px-6 py-3 text-sm font-medium transition-all relative ${
                  activeTab === 'topup'
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground/70'
                }`}
              >
                Top Up
                {activeTab === 'topup' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('upgrade')}
                className={`px-6 py-3 text-sm font-medium transition-all relative ${
                  activeTab === 'upgrade'
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground/70'
                }`}
              >
                Upgrade Plan
                {activeTab === 'upgrade' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="px-6 pb-6 pt-5 max-h-[55vh] overflow-y-auto">
            
            {/* Top Up Tab */}
            {activeTab === 'topup' && (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  One-time credit packs · Never expire · Use across all modes
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {creditPacks.map((pack) => (
                    <div
                      key={pack.packId}
                      className={`relative rounded-2xl border-2 text-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                        pack.popular
                          ? 'border-primary bg-primary/[0.03] shadow-md shadow-primary/5'
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
                      <div className="p-5 sm:p-6 space-y-4">
                        <div className="space-y-1">
                          <p className="text-3xl font-bold tracking-tight">{pack.credits.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold">credits</p>
                        </div>
                        
                        <div className="h-px bg-border/60 mx-4" />
                        
                        <div className="space-y-1">
                          <p className="text-xl font-semibold tracking-tight">${pack.price}</p>
                          <p className="text-xs text-muted-foreground">{(pack.pricePerCredit * 100).toFixed(1)}¢ per credit</p>
                        </div>
                        
                        <p className="text-[11px] text-muted-foreground">≈ {Math.round(pack.credits / 4)} images</p>

                        <Button
                          variant={pack.popular ? 'default' : 'outline'}
                          className="w-full min-h-[44px] rounded-xl text-sm font-medium"
                          onClick={() => handlePurchase(pack.credits)}
                        >
                          Purchase
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleViewAllPlans}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 pt-2"
                >
                  Or upgrade your plan for monthly credits →
                </button>
              </div>
            )}

            {/* Upgrade Plan Tab */}
            {activeTab === 'upgrade' && (
              <div className="space-y-6">
                {/* Billing toggle */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Choose your plan</p>
                  <div className="flex rounded-full border border-border/60 p-0.5 bg-muted/40">
                    <button
                      className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                        billingPeriod === 'monthly'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setBillingPeriod('monthly')}
                    >
                      Monthly
                    </button>
                    <button
                      className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                        billingPeriod === 'annual'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setBillingPeriod('annual')}
                    >
                      Annual
                      <span className="ml-1 text-[10px] opacity-80">-17%</span>
                    </button>
                  </div>
                </div>

                {/* Plan columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {mainPlans.map((p) => {
                    const isCurrent = p.planId === plan;
                    const currentIdx = PLAN_ORDER.indexOf(plan);
                    const targetIdx = PLAN_ORDER.indexOf(p.planId);
                    const displayPrice = isAnnual ? Math.round(p.annualPrice / 12) : p.monthlyPrice;
                    const monthlySavings = p.monthlyPrice * 12 - p.annualPrice;

                    let ctaLabel = targetIdx > currentIdx ? 'Upgrade' : 'Downgrade';
                    if (isCurrent && subscriptionStatus === 'canceling') ctaLabel = 'Reactivate';
                    else if (isCurrent) ctaLabel = 'Current Plan';
                    const isDisabled = isCurrent && subscriptionStatus !== 'canceling';

                    return (
                      <div
                        key={p.planId}
                        className={`relative rounded-2xl p-4 space-y-3 transition-all duration-200 ${
                          p.highlighted
                            ? 'border-2 border-primary bg-primary/[0.03] shadow-lg shadow-primary/5'
                            : isCurrent
                              ? 'border-2 border-dashed border-primary/30 bg-muted/20'
                              : 'border-2 border-border/50 hover:border-primary/20 hover:shadow-md bg-background'
                        }`}
                      >
                        {p.badge && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                            <Badge className="bg-primary text-primary-foreground text-[10px] tracking-widest uppercase px-4 py-0.5 shadow-lg shadow-primary/20">
                              {p.badge}
                            </Badge>
                          </div>
                        )}

                        {/* Header */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-base tracking-tight">{p.name}</h4>
                            {isCurrent && (
                              <Badge variant="secondary" className="text-[9px] tracking-wider uppercase">Current</Badge>
                            )}
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold tracking-tight">${displayPrice}</span>
                            <span className="text-xs text-muted-foreground font-medium">/mo</span>
                          </div>
                          {isAnnual && monthlySavings > 0 && (
                            <p className="text-[10px] text-primary font-semibold tracking-wide">
                              Save ${monthlySavings}/yr
                            </p>
                          )}
                        </div>

                        {/* Credits pill */}
                        <div className="rounded-xl bg-muted/50 border border-border/40 px-4 py-3 text-center">
                          <p className="text-xl font-bold tracking-tight">
                            {typeof p.credits === 'number' ? p.credits.toLocaleString() : p.credits}
                          </p>
                          <p className="text-[10px] text-muted-foreground tracking-wider uppercase font-medium mt-0.5">
                            credits/month
                          </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-2">
                          {p.features.slice(0, 4).map((f, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-[11px] text-muted-foreground leading-relaxed">{f}</span>
                            </div>
                          ))}
                        </div>

                        {/* CTA */}
                        <Button
                          variant={p.highlighted ? 'default' : 'outline'}
                          className="w-full min-h-[44px] rounded-xl text-xs font-medium"
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
                  <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-primary/10 p-3">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm tracking-tight">{enterprisePlan.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Unlimited visuals, custom SLA, dedicated support
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="min-h-[44px] rounded-xl text-xs font-medium shrink-0"
                      onClick={() => handlePlanSelect('enterprise')}
                    >
                      Contact Sales
                      <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>
                )}

                <button
                  onClick={handleViewAllPlans}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                >
                  Compare all plans in Settings
                </button>
              </div>
            )}
          </div>
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
