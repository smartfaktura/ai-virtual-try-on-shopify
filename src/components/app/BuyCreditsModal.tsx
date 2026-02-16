import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, ArrowUpRight, Check, Building2, Sparkles, Zap, Crown, Images, Layers, User, Package, Video, CalendarDays } from 'lucide-react';
import { creditPacks, pricingPlans } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { PlanChangeDialog, type PlanChangeMode } from '@/components/app/PlanChangeDialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { PricingPlan } from '@/types';

const PLAN_ORDER = ['free', 'starter', 'growth', 'pro', 'enterprise'];

// Feature icons mapping for visual scanning
const featureIcon = (feature: string) => {
  const f = feature.toLowerCase();
  if (f.includes('image') || f.includes('credit')) return Images;
  if (f.includes('workflow') || f.includes('bulk')) return Layers;
  if (f.includes('brand') || f.includes('profile')) return User;
  if (f.includes('product')) return Package;
  if (f.includes('video')) return Video;
  if (f.includes('creative') || f.includes('drop')) return CalendarDays;
  if (f.includes('priority') || f.includes('queue')) return Zap;
  return Check;
};

// Pro-exclusive features
const isProExclusive = (feature: string) => {
  const f = feature.toLowerCase();
  return f.includes('video generation') || f.includes('creative drops');
};

// Plan card style tiers
const getPlanCardStyle = (planId: string, highlighted: boolean, isCurrent: boolean) => {
  if (planId === 'pro') {
    return 'border-2 border-foreground/20 bg-foreground text-background shadow-2xl';
  }
  if (highlighted) {
    return 'border-2 border-primary ring-2 ring-primary/20 bg-primary/[0.04] shadow-xl';
  }
  if (isCurrent) {
    return 'border-2 border-dashed border-primary/30 bg-muted/20';
  }
  if (planId === 'starter') {
    return 'border-2 border-border/50 hover:border-primary/20 hover:shadow-md bg-background border-t-amber-400/60';
  }
  // free
  return 'border-2 border-border/50 hover:border-primary/20 hover:shadow-md bg-background';
};

export function BuyCreditsModal() {
  const { balance, plan, planConfig, buyModalOpen, closeBuyModal, addCredits, subscriptionStatus } = useCredits();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'topup' | 'upgrade'>(() => plan === 'free' ? 'upgrade' : 'topup');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
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

  const getPerCreditCost = (p: PricingPlan) => {
    const credits = typeof p.credits === 'number' ? p.credits : 0;
    if (credits === 0) return null;
    const price = isAnnual ? p.annualPrice / 12 : p.monthlyPrice;
    return ((price / credits) * 100).toFixed(1);
  };

  // Image estimate from credits
  const getImageEstimate = (p: PricingPlan) => {
    const credits = typeof p.credits === 'number' ? p.credits : 0;
    if (credits === 0) return null;
    return Math.round(credits / 10);
  };

  return (
    <>
      <Dialog open={buyModalOpen} onOpenChange={closeBuyModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-3xl border-border/50 shadow-2xl backdrop-blur-sm">
          
          {/* Premium Balance Header */}
          <div className="px-6 pt-5 pb-4 bg-gradient-to-b from-muted/60 to-background border-b border-border/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight">{balance.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground font-medium">credits available</span>
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px] tracking-widest uppercase font-semibold px-3 py-1">
                {planConfig.name}
              </Badge>
            </div>
            <div className="h-1.5 w-full rounded-full bg-secondary/80 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  hasBonus ? 'bg-accent-foreground/50 shadow-[0_0_8px_rgba(0,0,0,0.15)]' : 'bg-primary/80'
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {hasBonus
                  ? `${balance.toLocaleString()} available (includes bonus)`
                  : `${balance.toLocaleString()} / ${monthlyCredits === Infinity ? '∞' : monthlyCredits.toLocaleString()}`
                }
              </span>
              <div className="flex items-center gap-2">
                {hasBonus && (
                  <span className="text-xs text-primary font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Bonus credits
                  </span>
                )}
                {plan === 'free' && (
                  <button
                    onClick={() => setActiveTab('upgrade')}
                    className="text-[10px] font-semibold text-primary hover:underline underline-offset-2 flex items-center gap-0.5"
                  >
                    <ArrowUpRight className="w-3 h-3" /> Upgrade
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Custom Tab Switcher */}
          <div className="px-6 pt-2">
            <div className="flex gap-1 border-b border-border/50">
              <button
                onClick={() => setActiveTab('topup')}
                className={`px-6 py-2.5 text-sm font-medium transition-all relative ${
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
                className={`px-6 py-2.5 text-sm font-medium transition-all relative ${
                  activeTab === 'upgrade'
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground/70'
                }`}
              >
                Plans
                {activeTab === 'upgrade' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="px-6 pb-5 pt-4 flex-1 overflow-y-auto">
            
            {/* Top Up Tab */}
            {activeTab === 'topup' && (
              <div className="space-y-4">
                {/* Subscription nudge banner */}
                <div className="flex items-center gap-3 rounded-2xl bg-primary/5 border border-primary/10 px-5 py-3">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Subscriptions start at <span className="font-semibold text-foreground">6.2¢/credit</span> — lower than any top-up.{' '}
                    <button
                      onClick={() => setActiveTab('upgrade')}
                      className="text-primary font-medium hover:underline underline-offset-2"
                    >
                      View Plans →
                    </button>
                  </p>
                </div>

                <p className="text-sm text-muted-foreground">
                  One-time credit packs · Never expire · Use across all modes
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {creditPacks.map((pack) => (
                    <div
                      key={pack.packId}
                      className={`relative rounded-2xl text-center transition-all duration-200 hover:shadow-lg ${
                        pack.popular
                          ? 'border-2 border-primary bg-gradient-to-b from-primary/[0.06] to-background shadow-lg shadow-primary/5 scale-[1.03]'
                          : 'border-2 border-border/60 hover:border-primary/30 bg-gradient-to-b from-muted/30 to-background hover:scale-[1.02]'
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
                        <div className="space-y-1">
                          <p className="text-3xl font-bold tracking-tight">{pack.credits.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold">credits</p>
                        </div>
                        
                        <div className="h-px bg-border/60 mx-4" />
                        
                        <div className="space-y-1">
                          <p className="text-xl font-semibold tracking-tight">${pack.price}</p>
                          <p className="text-xs text-muted-foreground">{(pack.pricePerCredit * 100).toFixed(1)}¢ per credit</p>
                        </div>
                        
                        <p className="text-[11px] text-muted-foreground">≈ {Math.round(pack.credits / 10)} images</p>

                        <Button
                          variant={pack.popular ? 'default' : 'outline'}
                          className="w-full min-h-[44px] rounded-xl text-sm font-medium"
                          onClick={() => handlePurchase(pack.credits)}
                        >
                          Add {pack.credits.toLocaleString()} Credits
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
              <div className="space-y-4">
                {/* Billing toggle - centered */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex rounded-full border border-border/60 p-0.5 bg-muted/40">
                    <button
                      className={`px-5 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                        billingPeriod === 'monthly'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setBillingPeriod('monthly')}
                    >
                      Monthly
                    </button>
                    <button
                      className={`px-5 py-1.5 text-xs font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                        billingPeriod === 'annual'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setBillingPeriod('annual')}
                    >
                      Annual
                      <span className="inline-flex items-center rounded-full bg-emerald-500/20 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 leading-none">
                        SAVE 17%
                      </span>
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {isAnnual ? (
                      <span className="text-emerald-600 font-medium">✓ You're saving up to 17% with annual billing</span>
                    ) : (
                      <span>Switch to annual and <span className="text-primary font-medium">save up to $432/yr</span></span>
                    )}
                  </p>
                </div>

                {/* Plan columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {mainPlans.map((p) => {
                    const isCurrent = p.planId === plan;
                    const currentIdx = PLAN_ORDER.indexOf(plan);
                    const targetIdx = PLAN_ORDER.indexOf(p.planId);
                    const displayPrice = isAnnual ? Math.round(p.annualPrice / 12) : p.monthlyPrice;
                    const monthlySavings = p.monthlyPrice * 12 - p.annualPrice;
                    const perCreditCost = getPerCreditCost(p);
                    const imageEstimate = getImageEstimate(p);
                    const isPro = p.planId === 'pro';
                    const isGrowth = p.highlighted;

                    let ctaLabel = targetIdx > currentIdx ? `Get ${p.name}` : 'Downgrade';
                    if (isCurrent && subscriptionStatus === 'canceling') ctaLabel = 'Reactivate';
                    else if (isCurrent) ctaLabel = 'Current Plan';
                    const isDisabled = isCurrent && subscriptionStatus !== 'canceling';

                    return (
                      <div
                        key={p.planId}
                        className={`relative rounded-2xl p-4 flex flex-col transition-all duration-200 ${getPlanCardStyle(p.planId, !!p.highlighted, isCurrent)} ${
                          isGrowth ? 'plan-card-shimmer' : ''
                        }`}
                      >
                        {p.badge && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                            <Badge className={`text-[10px] tracking-widest uppercase px-4 py-0.5 shadow-lg ${
                              isPro
                                ? 'bg-background text-foreground shadow-foreground/10'
                                : 'bg-primary text-primary-foreground shadow-primary/20'
                            }`}>
                              {p.badge}
                            </Badge>
                          </div>
                        )}

                        {/* Plan name */}
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            {isPro && <Crown className={`w-3.5 h-3.5 ${isPro ? 'text-amber-400' : 'text-primary'}`} />}
                            <h4 className={`font-bold text-sm tracking-tight ${isPro ? 'text-background' : ''}`}>{p.name}</h4>
                          </div>
                          {isCurrent && (
                            <Badge variant="secondary" className="text-[9px] tracking-wider uppercase">Current</Badge>
                          )}
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-1.5 mb-0.5">
                          {isAnnual && p.monthlyPrice > 0 && (
                            <span className={`text-sm line-through ${isPro ? 'text-background/40' : 'text-muted-foreground'}`}>${p.monthlyPrice}</span>
                          )}
                          <span className={`text-2xl font-bold tracking-tight ${isPro ? 'text-background' : ''}`}>${displayPrice}</span>
                          <span className={`text-xs font-medium ${isPro ? 'text-background/60' : 'text-muted-foreground'}`}>/mo</span>
                        </div>
                        {isAnnual && monthlySavings > 0 && (
                          <p className={`text-[10px] font-semibold tracking-wide mb-2 ${isPro ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            Save ${monthlySavings}/yr
                          </p>
                        )}
                        {p.monthlyPrice === 0 && <div className="mb-2" />}

                        {/* Hero metric: image estimate */}
                        {imageEstimate ? (
                          <div className={`rounded-xl py-2.5 px-3 text-center mb-3 ${
                            isPro ? 'bg-background/10' : 'bg-muted/60'
                          }`}>
                            <p className={`text-xl font-bold tracking-tight ${isPro ? 'text-background' : 'text-foreground'}`}>
                              ~{imageEstimate} images
                            </p>
                            <p className={`text-[10px] font-medium ${isPro ? 'text-background/50' : 'text-muted-foreground'}`}>per month</p>
                          </div>
                        ) : (
                          <div className={`rounded-xl py-2.5 px-3 text-center mb-3 ${isPro ? 'bg-background/10' : 'bg-muted/60'}`}>
                            <p className={`text-lg font-bold tracking-tight ${isPro ? 'text-background' : 'text-foreground'}`}>
                              {typeof p.credits === 'number' ? p.credits : p.credits}
                            </p>
                            <p className={`text-[10px] font-medium ${isPro ? 'text-background/50' : 'text-muted-foreground'}`}>one-time credits</p>
                          </div>
                        )}

                        {/* Per-credit cost chip */}
                        {perCreditCost && (
                          <div className={`inline-flex items-center gap-1 self-center rounded-full px-2.5 py-1 text-[10px] font-semibold mb-3 ${
                            isPro ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          }`}>
                            {perCreditCost}¢/credit
                          </div>
                        )}

                        {/* Features with icons */}
                        <div className="space-y-2 flex-1 mb-3">
                          {p.features.slice(0, 4).map((f, i) => {
                            const Icon = featureIcon(f);
                            const exclusive = isProExclusive(f);
                            return (
                              <div key={i} className="flex items-start gap-2">
                                {exclusive ? (
                                  <Sparkles className={`w-3 h-3 mt-0.5 flex-shrink-0 ${isPro ? 'text-amber-400' : 'text-primary'}`} />
                                ) : (
                                  <Icon className={`w-3 h-3 mt-0.5 flex-shrink-0 ${isPro ? 'text-background/50' : 'text-primary/70'}`} />
                                )}
                                <span className={`text-[11px] leading-snug ${
                                  exclusive
                                    ? isPro ? 'text-amber-300 font-medium' : 'text-primary font-medium'
                                    : isPro ? 'text-background/70' : 'text-muted-foreground'
                                }`}>{f}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* CTA */}
                        <Button
                          variant={isPro || isGrowth ? 'default' : 'outline'}
                          className={`w-full min-h-[40px] rounded-xl text-xs font-medium mt-auto ${
                            isPro ? 'bg-background text-foreground hover:bg-background/90' : ''
                          }`}
                          onClick={() => handlePlanSelect(p.planId)}
                          disabled={isDisabled}
                        >
                          {ctaLabel}
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {/* Enterprise + Compare links */}
                <div className="flex items-center justify-between pt-1">
                  {enterprisePlan && (
                    <button
                      onClick={() => handlePlanSelect('enterprise')}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      <Building2 className="w-3 h-3" />
                      Need more? Contact Sales
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={handleViewAllPlans}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 ml-auto"
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
      />
    </>
  );
}
