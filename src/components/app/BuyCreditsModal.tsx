import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Check, ArrowUpRight, ArrowRight, Sparkles } from 'lucide-react';
import { creditPacks, pricingPlans } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { PlanChangeDialog, type PlanChangeMode } from '@/components/app/PlanChangeDialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { PricingPlan } from '@/types';

const PLAN_ORDER = ['free', 'starter', 'growth', 'pro', 'enterprise'];

export function BuyCreditsModal() {
  const { balance, plan, planConfig, buyModalOpen, closeBuyModal, subscriptionStatus, billingInterval, startCheckout, openCustomerPortal } = useCredits();
  const navigate = useNavigate();

  const effectiveInterval = billingInterval || (plan !== 'free' ? 'monthly' : null);
  const isPaidUser = plan !== 'free';

  const [activeTab, setActiveTab] = useState<'topup' | 'upgrade'>(() => plan === 'free' ? 'upgrade' : 'topup');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>(effectiveInterval === 'annual' ? 'annual' : 'monthly');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<PlanChangeMode>('upgrade');
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  const isAnnual = billingPeriod === 'annual';
  const mainPlans = pricingPlans.filter(p => !p.isEnterprise);
  const currentPlanData = pricingPlans.find(p => p.planId === plan);

  // Show the focused "switch to annual" card when a monthly paid user toggles to annual
  const showAnnualSwitchCard = isPaidUser && effectiveInterval === 'monthly' && isAnnual && currentPlanData;

  const handlePurchase = (stripePriceId: string | undefined) => {
    if (!stripePriceId) return;
    startCheckout(stripePriceId, 'payment');
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
    } else if (planId === 'free') {
      setDialogMode('cancel');
    } else if (targetIdx > currentIdx) {
      setDialogMode('upgrade');
    } else {
      setDialogMode('downgrade');
    }
    setSelectedPlan(targetPlan);
    setDialogOpen(true);
  };

  const handleDialogConfirm = () => {
    if (selectedPlan && (dialogMode === 'upgrade' || dialogMode === 'downgrade')) {
      if (subscriptionStatus === 'active' || subscriptionStatus === 'canceling') {
        openCustomerPortal();
      } else {
        const priceId = isAnnual ? selectedPlan.stripePriceIdAnnual : selectedPlan.stripePriceIdMonthly;
        if (priceId) {
          startCheckout(priceId, 'subscription');
        }
      }
    }
    setDialogOpen(false);
    closeBuyModal();
  };

  const handleSwitchToAnnual = () => {
    if (subscriptionStatus === 'active' || subscriptionStatus === 'canceling') {
      openCustomerPortal();
    } else if (currentPlanData?.stripePriceIdAnnual) {
      startCheckout(currentPlanData.stripePriceIdAnnual, 'subscription');
    }
    closeBuyModal();
  };

  const handleViewAllPlans = () => {
    closeBuyModal();
    navigate('/app/settings');
  };

  return (
    <>
      <Dialog open={buyModalOpen} onOpenChange={closeBuyModal}>
        <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden rounded-none sm:rounded-2xl border-border/50 shadow-2xl max-h-[100dvh] sm:max-h-[90dvh] h-full sm:h-auto flex flex-col">

          {/* Balance header */}
          <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-muted">
                <Wallet className="w-4 h-4 text-foreground" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight">{balance.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">credits</span>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px] tracking-widest uppercase font-semibold px-3 py-1 mr-8">
              {planConfig.name}
            </Badge>
          </div>

          {/* Tab switcher — pill style */}
          <div className="px-4 sm:px-6 pt-3 pb-1">
            <div className="inline-flex rounded-full border border-border p-0.5 bg-muted/40">
              {(['topup', 'upgrade'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-1.5 text-sm font-medium rounded-full transition-all ${
                    activeTab === tab
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground/70'
                  }`}
                >
                  {tab === 'topup' ? 'Top Up' : 'Plans'}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 pb-6 pt-5 overflow-y-auto flex-1 min-h-0">

            {/* === TOP UP TAB === */}
            {activeTab === 'topup' && (() => {
              const basePPC = creditPacks[0].pricePerCredit;
              return (
                <div className="space-y-5">
                  <p className="text-sm text-muted-foreground">
                    One-time credit packs · Never expire · Use across all modes
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {creditPacks.map((pack) => {
                      const imageEstimate = Math.round(pack.credits / 5);
                      const centsPerCredit = (pack.price / pack.credits * 100).toFixed(1);
                      const savePct = basePPC > pack.pricePerCredit
                        ? Math.round((1 - pack.pricePerCredit / basePPC) * 100)
                        : 0;
                      return (
                        <div
                          key={pack.packId}
                          className={`relative rounded-2xl text-center transition-all duration-200 hover:shadow-md ${
                            pack.popular
                              ? 'border-2 border-primary bg-card'
                              : 'border border-border bg-card hover:border-border/80'
                          }`}
                        >
                          {pack.popular && (
                            <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 z-10">
                              <Badge className="bg-primary text-primary-foreground text-[10px] tracking-widest uppercase px-3 py-0.5">
                                Best Value
                              </Badge>
                            </div>
                          )}
                          <div className="p-5 space-y-3">
                            <p className="text-2xl font-bold tracking-tight">${pack.price}</p>
                            <div className="h-px bg-border/50 mx-4" />
                            <div>
                              <p className="text-base font-semibold">{pack.credits.toLocaleString()} credits</p>
                              <p className="text-xs text-muted-foreground mt-0.5">~{imageEstimate} images · {centsPerCredit}¢/credit</p>
                            </div>
                            {savePct > 0 && (
                              <span className="inline-flex rounded-full text-[10px] font-bold px-2 py-0.5 bg-emerald-500/15 text-emerald-700">
                                Save {savePct}%
                              </span>
                            )}
                            {pack.popular && (
                              <p className="text-[10px] text-muted-foreground">Most popular with creators</p>
                            )}
                            <Button
                              variant={pack.popular ? 'default' : 'outline'}
                              className="w-full min-h-[44px] rounded-xl text-sm font-medium"
                              onClick={() => handlePurchase(pack.stripePriceId)}
                            >
                              Buy {pack.credits.toLocaleString()} credits
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setActiveTab('upgrade')}
                    className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
                  >
                    Or upgrade your plan for monthly credits →
                  </button>
                </div>
              );
            })()}

            {/* === PLANS TAB === */}
            {activeTab === 'upgrade' && (
              <div className="space-y-4">

                {/* Combined plan status + billing toggle card */}
                <div className="rounded-xl bg-muted/30 border border-border/50 p-4 space-y-3">
                  {isPaidUser && (
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] tracking-widest uppercase font-semibold px-2.5 py-0.5">
                          {planConfig.name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {effectiveInterval === 'annual' ? 'Annual billing' : 'Monthly billing'}
                        </span>
                      </div>
                      {effectiveInterval === 'monthly' && (
                        <button
                          onClick={handleSwitchToAnnual}
                          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-full"
                        >
                          Save 20% with annual
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                  <div className="flex justify-center">
                    <div className="flex rounded-full border border-border p-0.5 bg-background">
                      <button
                        className={`px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all ${
                          billingPeriod === 'monthly'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => setBillingPeriod('monthly')}
                      >
                        Monthly
                      </button>
                      <button
                        className={`px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all flex items-center gap-1.5 ${
                          billingPeriod === 'annual'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => setBillingPeriod('annual')}
                      >
                        Annual
                        <span className={`inline-flex rounded-full text-[9px] font-bold px-1.5 py-0.5 leading-none ${
                          billingPeriod === 'annual' ? 'bg-primary-foreground/25 text-primary-foreground' : 'bg-emerald-500/20 text-emerald-700'
                        }`}>
                          SAVE 20%
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Focused "Switch to Annual" card for monthly users viewing annual prices */}
                {showAnnualSwitchCard && (
                  <div className="rounded-2xl border-2 border-primary bg-primary/5 p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Switch your {currentPlanData.name} plan to annual billing</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Current monthly */}
                      <div className="rounded-xl border border-border bg-card p-4 text-center space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Current · Monthly</p>
                        <p className="text-2xl font-bold tracking-tight text-muted-foreground line-through decoration-1">${currentPlanData.monthlyPrice}<span className="text-xs font-normal">/mo</span></p>
                        <p className="text-xs text-muted-foreground">${currentPlanData.monthlyPrice * 12}/year</p>
                      </div>
                      {/* Annual */}
                      <div className="rounded-xl border-2 border-primary bg-card p-4 text-center space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-primary font-medium">Annual</p>
                        <p className="text-2xl font-bold tracking-tight">${Math.round(currentPlanData.annualPrice / 12)}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                        <p className="text-xs text-muted-foreground">${currentPlanData.annualPrice}/year</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="inline-flex rounded-full text-xs font-bold px-3 py-1 bg-emerald-500/15 text-emerald-700">
                        Save ${currentPlanData.monthlyPrice * 12 - currentPlanData.annualPrice}/year
                      </span>
                      <Button
                        onClick={handleSwitchToAnnual}
                        className="rounded-xl min-h-[44px] px-6 text-sm font-medium"
                      >
                        Switch to Annual Billing
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Plan cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                  {mainPlans.map((p) => {
                    const isCurrent = p.planId === plan;
                    const currentIdx = PLAN_ORDER.indexOf(plan);
                    const targetIdx = PLAN_ORDER.indexOf(p.planId);
                    const displayPrice = isAnnual ? Math.round(p.annualPrice / 12) : p.monthlyPrice;
                    const isFree = p.planId === 'free';
                    const credits = typeof p.credits === 'number' ? p.credits : 0;
                    const imageEstimate = credits > 0 ? Math.round(credits / 5) : null;

                    let ctaLabel = targetIdx > currentIdx ? `Upgrade to ${p.name}` : targetIdx < currentIdx ? `Downgrade to ${p.name}` : `Get ${p.name}`;
                    if (isCurrent && subscriptionStatus === 'canceling') ctaLabel = 'Reactivate';
                    else if (isCurrent) ctaLabel = 'Current Plan';
                    const isDisabled = isCurrent && subscriptionStatus !== 'canceling';

                    return (
                      <div
                        key={p.planId}
                        className={`relative rounded-2xl p-4 sm:p-5 flex flex-col transition-all duration-200 ${
                          isCurrent
                            ? 'border-2 border-primary ring-1 ring-primary/10 bg-card'
                            : (p.highlighted && (plan === 'free' || targetIdx > currentIdx))
                              ? 'border-2 border-primary/60 bg-card'
                              : 'border border-border bg-card hover:shadow-sm'
                        }`}
                      >
                        {/* Name + badges inline */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <h4 className="text-base font-semibold">{p.name}</h4>
                          {p.badge && (plan === 'free' || targetIdx > currentIdx) && (
                            <Badge className="bg-primary text-primary-foreground text-[9px] tracking-widest uppercase px-2 py-0.5">
                              {p.badge}
                            </Badge>
                          )}
                          {isCurrent && (
                            <Badge variant="secondary" className="text-[9px] tracking-wider uppercase">Current</Badge>
                          )}
                        </div>

                        {/* Price */}
                        <div className="mb-1">
                          {isFree ? (
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl sm:text-3xl font-bold tracking-tight">Free</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-baseline gap-1">
                                {isAnnual && p.monthlyPrice > displayPrice && (
                                  <span className="text-sm text-muted-foreground line-through">${p.monthlyPrice}</span>
                                )}
                                <span className="text-2xl sm:text-3xl font-bold tracking-tight">${displayPrice}</span>
                                <span className="text-xs text-muted-foreground">/mo</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {isAnnual ? 'billed annually' : 'billed monthly'}
                              </p>
                            </>
                          )}
                        </div>

                        {/* Image estimate */}
                        <div className="mb-4">
                          {imageEstimate ? (
                            <>
                              <p className="text-sm font-medium text-foreground">~{imageEstimate} images/mo</p>
                              <p className="text-[11px] text-muted-foreground">{credits.toLocaleString()} credits/mo</p>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">{p.credits} credits</p>
                          )}
                        </div>

                        {/* Features */}
                        <div className="space-y-2 flex-1 mb-4">
                          {p.features.map((f, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary/60" />
                              <span className="text-[11px] text-muted-foreground leading-snug">{f}</span>
                            </div>
                          ))}
                        </div>

                        {/* CTA */}
                        <Button
                          variant={isDisabled ? 'secondary' : targetIdx > currentIdx ? 'default' : 'outline'}
                          className="w-full min-h-[44px] rounded-xl text-sm font-medium mt-auto"
                          onClick={() => handlePlanSelect(p.planId)}
                          disabled={isDisabled}
                        >
                          {ctaLabel}
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom links */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handlePlanSelect('enterprise')}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    Need more? Contact Sales
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={handleViewAllPlans}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                  >
                    Compare all plans
                  </button>
                </div>
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
        hasActiveSubscription={subscriptionStatus === 'active' || subscriptionStatus === 'canceling'}
      />
    </>
  );
}
