import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowUpRight, ArrowRight, X, Loader2, Building2 } from 'lucide-react';
import { creditPacks, pricingPlans } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { PlanChangeDialog, type PlanChangeMode } from '@/components/app/PlanChangeDialog';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/lib/brandedToast';
import type { PricingPlan } from '@/types';

const PLAN_ORDER = ['free', 'starter', 'growth', 'pro', 'enterprise'];
const isPro = (p: string) => p === 'pro';
const isFreeUser = (p: string) => p === 'free';

export function BuyCreditsModal() {
  const { balance, plan, planConfig, buyModalOpen, closeBuyModal, subscriptionStatus, billingInterval, currentPeriodEnd, startCheckout, openCustomerPortal } = useCredits();
  const navigate = useNavigate();

  const effectiveInterval = billingInterval || (plan !== 'free' ? 'monthly' : null);
  const isPaidUser = plan !== 'free';

  const showTabs = !isFreeUser(plan) && !isPro(plan);
  const defaultTab = isFreeUser(plan) ? 'upgrade' : 'topup';
  const [activeTab, setActiveTab] = useState<'topup' | 'upgrade'>(() => defaultTab);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>(effectiveInterval === 'annual' ? 'annual' : 'monthly');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<PlanChangeMode>('upgrade');
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [topUpLoadingId, setTopUpLoadingId] = useState<string | null>(null);
  const [switchLoading, setSwitchLoading] = useState(false);

  // Reset tab when modal opens
  useEffect(() => {
    if (buyModalOpen) {
      setActiveTab(isFreeUser(plan) ? 'upgrade' : 'topup');
    }
  }, [buyModalOpen, plan]);

  const anyLoading = checkoutLoading || !!topUpLoadingId || switchLoading;
  const isAnnual = billingPeriod === 'annual';
  const mainPlans = pricingPlans.filter(p => !p.isEnterprise);
  const plansToShow = mainPlans.filter(p => {
    if (isFreeUser(plan)) return p.planId !== 'free';
    const currentIdx = PLAN_ORDER.indexOf(plan);
    const targetIdx = PLAN_ORDER.indexOf(p.planId);
    return targetIdx >= currentIdx;
  });
  const currentPlanData = pricingPlans.find(p => p.planId === plan);

  // Show the focused "switch to annual" card when a monthly paid user toggles to annual
  const showAnnualSwitchCard = isPaidUser && effectiveInterval === 'monthly' && isAnnual && currentPlanData;

  const handlePurchase = async (packId: string, stripePriceId: string | undefined) => {
    if (!stripePriceId || anyLoading) return;
    setTopUpLoadingId(packId);
    try {
      await startCheckout(stripePriceId, 'payment');
    } catch {
      setTopUpLoadingId(null);
    }
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

  const handleDialogConfirm = async () => {
    setCheckoutLoading(true);
    try {
      if (dialogMode === 'cancel' || dialogMode === 'reactivate') {
        await openCustomerPortal();
      } else if (selectedPlan && (dialogMode === 'upgrade' || dialogMode === 'downgrade')) {
        if (subscriptionStatus === 'active' || subscriptionStatus === 'canceling') {
          await openCustomerPortal();
        } else {
          const priceId = isAnnual ? selectedPlan.stripePriceIdAnnual : selectedPlan.stripePriceIdMonthly;
          if (priceId) {
            await startCheckout(priceId, 'subscription');
          }
        }
      }
    } catch {
      setCheckoutLoading(false);
    }
  };

  const handleSwitchToAnnual = async () => {
    if (anyLoading) return;
    setSwitchLoading(true);
    try {
      if (subscriptionStatus === 'active' || subscriptionStatus === 'canceling') {
        await openCustomerPortal();
      } else if (currentPlanData?.stripePriceIdAnnual) {
        await startCheckout(currentPlanData.stripePriceIdAnnual, 'subscription');
      }
    } catch {
      setSwitchLoading(false);
    }
  };

  const handleViewAllPlans = () => {
    closeBuyModal();
    navigate('/app/settings');
  };

  return (
    <>
      <Dialog open={buyModalOpen} onOpenChange={(open) => { if (!open && !anyLoading) closeBuyModal(); }}>
        <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden rounded-none sm:rounded-2xl border-border/50 shadow-2xl max-h-[100dvh] sm:max-h-[90dvh] h-full sm:h-auto flex flex-col [&>button:last-child]:hidden top-0 sm:top-[50%] translate-y-0 sm:translate-y-[-50%] data-[state=open]:slide-in-from-bottom-0 data-[state=closed]:slide-out-to-bottom-0 data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100 bg-background">

          {/* Header */}
          <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3 flex items-start justify-between">
            <div>
              <p className="text-xl font-semibold tracking-tight">
                 {balance === 0
                   ? (isPaidUser ? "You've used all your credits" : "You're out of credits")
                   : (isPaidUser ? 'Get more from VOVV' : 'Upgrade your creative power')}
               </p>
               <p className="text-sm text-muted-foreground/80 mt-1">
                {balance === 0
                  ? (isPaidUser ? 'Top up or upgrade your plan' : 'Pick a plan to keep creating')
                  : (isPaidUser ? 'Top up credits or switch plans' : 'Unlock faster generation and more credits')}
              </p>
              {isPaidUser && currentPeriodEnd && (
                <p className={`text-[11px] mt-1.5 ${subscriptionStatus === 'canceling' ? 'text-amber-600' : 'text-muted-foreground'}`}>
                  {subscriptionStatus === 'canceling'
                    ? `Cancels ${currentPeriodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                    : `Renews ${currentPeriodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · billed ${effectiveInterval || 'monthly'}`
                  }
                </p>
              )}
            </div>
            <button
              onClick={() => { if (!anyLoading) closeBuyModal(); }}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
              disabled={anyLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab switcher only */}
          {showTabs && (
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
          )}

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
                              className="w-full min-h-[44px] text-sm font-medium gap-2"
                              onClick={() => handlePurchase(pack.packId, pack.stripePriceId)}
                              disabled={!!topUpLoadingId || switchLoading}
                            >
                              {topUpLoadingId === pack.packId ? (
                                <><Loader2 className="w-4 h-4 animate-spin" />Redirecting…</>
                              ) : (
                                <>Buy {pack.credits.toLocaleString()} credits</>
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {showTabs && (
                    <button
                      onClick={() => setActiveTab('upgrade')}
                      className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
                    >
                      Or upgrade your plan for monthly credits →
                    </button>
                  )}

                  {/* Your Plan card for paid users */}
                  {isPaidUser && (
                    <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 flex items-center justify-between gap-4 mt-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="uppercase text-[10px] font-bold tracking-wider px-2 py-0.5">{plan}</Badge>
                        <div>
                          <p className="text-sm font-semibold tracking-tight">Your Plan</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {planConfig.monthlyCredits === Infinity ? 'Unlimited' : planConfig.monthlyCredits.toLocaleString()} credits/mo
                            {effectiveInterval && ` · Billed ${effectiveInterval}`}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs font-medium shrink-0" onClick={handleViewAllPlans}>
                        Manage Plan
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  )}

                  {/* Enterprise CTA for Pro users */}
                  {isPro(plan) && (
                    <div className="rounded-2xl border border-border/50 bg-muted/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                          <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm tracking-tight">Need more? Talk to our team</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Custom credit volumes, dedicated support & integrations</p>
                        </div>
                      </div>
                      <Button variant="outline" className="min-h-[44px] text-xs font-medium shrink-0" asChild>
                        <a href="mailto:hello@vovv.ai">
                          Contact Sales
                          <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* === PLANS TAB === */}
            {activeTab === 'upgrade' && (
              <div className="space-y-3">

                {/* Billing toggle — directly above cards */}
                <div className="flex justify-center">
                  <div className="inline-flex rounded-full border border-border p-0.5 bg-muted/40">
                    <button
                      className={`px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all ${
                        billingPeriod === 'monthly'
                          ? 'bg-card text-foreground shadow-sm border border-border/60'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setBillingPeriod('monthly')}
                    >
                      Monthly
                    </button>
                    <button
                      className={`px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all flex items-center gap-1 ${
                        billingPeriod === 'annual'
                          ? 'bg-card text-foreground shadow-sm border border-border/60'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setBillingPeriod('annual')}
                    >
                      Annual
                      <span className="inline-flex rounded-full text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 leading-none bg-muted text-muted-foreground">
                        SAVE 20%
                      </span>
                    </button>
                  </div>
                </div>

                {/* Focused "Switch to Annual" card for monthly users viewing annual prices */}
                {showAnnualSwitchCard && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-foreground">
                        Save <span className="text-emerald-600">${currentPlanData.monthlyPrice * 12 - currentPlanData.annualPrice}/yr</span> — switch to annual billing
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Pay ${Math.round(currentPlanData.annualPrice / 12)}/mo instead of ${currentPlanData.monthlyPrice}/mo
                      </p>
                    </div>
                    <Button
                      onClick={handleSwitchToAnnual}
                      size="sm"
                      className="shrink-0 gap-1.5"
                      disabled={switchLoading || !!topUpLoadingId}
                    >
                      {switchLoading ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" />Redirecting…</>
                      ) : (
                        <>Switch<ArrowRight className="w-3.5 h-3.5" /></>
                      )}
                    </Button>
                  </div>
                )}

                {/* Plan cards */}
                <div className={`grid grid-cols-1 ${plansToShow.length <= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'} gap-2.5 sm:gap-3`}>
                  {plansToShow.map((p) => {
                    const isCurrent = p.planId === plan;
                    const currentIdx = PLAN_ORDER.indexOf(plan);
                    const targetIdx = PLAN_ORDER.indexOf(p.planId);
                    const displayPrice = isAnnual ? Math.round(p.annualPrice / 12) : p.monthlyPrice;
                    const isFree = p.planId === 'free';
                    const credits = typeof p.credits === 'number' ? p.credits : 0;
                    const imageEstimate = credits > 0 ? Math.round(credits / 5) : null;

                    const PLAN_DESCRIPTORS: Record<string, string> = {
                      starter: 'BEST TO START',
                      growth: 'BEST VALUE',
                      pro: 'FOR SCALE',
                    };
                    const PLAN_CTA_MAP: Record<string, string> = {
                      starter: 'Get Starter',
                      growth: 'Get Growth',
                      pro: 'Get Pro',
                    };
                    const descriptor = PLAN_DESCRIPTORS[p.planId] ?? '';

                    // Starter baseline for save % calculation
                    const starterPlan = plansToShow.find(sp => sp.planId === 'starter');
                    const starterCredits = typeof starterPlan?.credits === 'number' ? starterPlan.credits : 0;
                    const starterPrice = isAnnual && starterPlan ? Math.round(starterPlan.annualPrice / 12) : (starterPlan?.monthlyPrice ?? 0);
                    const starterPPC = starterCredits > 0 ? starterPrice / starterCredits : 0;
                    const currentPPC = credits > 0 && displayPrice > 0 ? displayPrice / credits : 0;
                    const savePct = starterPPC > 0 && currentPPC > 0 && p.planId !== 'starter'
                      ? Math.round((1 - currentPPC / starterPPC) * 100)
                      : 0;

                    // Build unified bullet list
                    const unifiedBullets: { text: string; badge?: string; color?: string }[] = [];
                    if (imageEstimate) {
                      unifiedBullets.push({ text: `~${imageEstimate} images / month` });
                      unifiedBullets.push({ text: `${credits.toLocaleString()} credits / month` });
                      if (displayPrice > 0) {
                        const ppc = `$${(displayPrice / credits).toFixed(3)} per credit`;
                        const saveBadge = savePct > 0 ? `SAVE ${savePct}%` : (isAnnual && p.planId === 'starter' ? 'SAVE 20%' : undefined);
                        unifiedBullets.push({ text: ppc, badge: saveBadge });
                      }
                    }
                    const PLAN_EXTRAS: Record<string, { text: string; badge?: string }[]> = {
                      starter: [{ text: 'No watermarks on AI images' }, { text: 'Bulk generations' }, { text: 'Up to 100 products' }],
                      growth: [{ text: 'Faster generation' }, { text: 'Up to 250 products' }, { text: 'Brand Models', badge: 'NEW' }],
                      pro: [{ text: 'Fastest generation' }, { text: 'Unlimited products' }, { text: 'Brand Models', badge: 'NEW' }],
                    };
                    unifiedBullets.push(...(PLAN_EXTRAS[p.planId] ?? []));

                    let ctaLabel = PLAN_CTA_MAP[p.planId] ?? `Choose ${p.name}`;
                    if (isCurrent && subscriptionStatus === 'canceling') ctaLabel = 'Reactivate';
                    else if (isCurrent) ctaLabel = 'Current Plan';
                    else if (targetIdx < currentIdx) ctaLabel = `Downgrade to ${p.name}`;
                    const isDisabled = isCurrent && subscriptionStatus !== 'canceling';

                    return (
                      <div
                        key={p.planId}
                      className={`relative rounded-2xl p-5 sm:p-6 flex flex-col transition-all duration-200 ${
                          p.highlighted && !isCurrent && (plan === 'free' || targetIdx > currentIdx)
                            ? 'bg-card border-2 border-primary shadow-md hover:shadow-lg'
                            : isCurrent && p.planId !== 'free'
                            ? 'bg-card border-2 border-primary ring-1 ring-primary/10 hover:shadow-lg'
                              : 'bg-card border border-border/60 shadow-sm hover:shadow-lg'
                        }`}
                      >
                        {/* Most Popular badge — top-right corner */}
                        {p.highlighted && !isCurrent && (plan === 'free' || targetIdx > currentIdx) && (
                          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider px-3 py-1 border-0 shadow-sm z-10">
                            MOST POPULAR
                          </Badge>
                        )}

                        {/* Name + descriptor */}
                        <div className="mb-5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-lg font-semibold">{p.name}</h4>
                            {isCurrent && (
                              <Badge variant="secondary" className="text-[10px] tracking-wider uppercase">Current</Badge>
                            )}
                          </div>
                          {descriptor && (
                            <p className="text-sm mt-1 text-muted-foreground">{descriptor}</p>
                          )}
                        </div>

                        {/* Price */}
                        <div className="mb-5">
                          {isFree ? (
                            <span className="text-4xl font-bold tracking-tight">Free</span>
                          ) : (
                            <p className="tracking-tight">
                              {isAnnual && p.monthlyPrice > displayPrice && (
                                <span className="text-sm line-through mr-1.5 text-muted-foreground">${p.monthlyPrice}</span>
                              )}
                              <span className="text-4xl font-bold">${displayPrice}</span>
                              <span className="text-base font-normal text-muted-foreground">/mo</span>
                            </p>
                          )}
                        </div>

                        {/* Unified bullet list */}
                        <div className="space-y-2 flex-1 mb-4">
                          {unifiedBullets.map((feat, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary/60" />
                               <span className="text-sm leading-snug inline-flex items-center gap-1.5 text-muted-foreground">
                                 <span className="font-normal">{feat.text}</span>
                                 {feat.badge && (
                                   <Badge className="text-[10px] px-1.5 py-0.5 leading-tight font-bold border-0 bg-muted text-muted-foreground">
                                     {feat.badge}
                                   </Badge>
                                 )}
                               </span>
                            </div>
                          ))}
                        </div>

                        {/* CTA */}
                        <Button
                          variant={isDisabled ? 'secondary' : (p.highlighted && !isCurrent && (plan === 'free' || targetIdx > currentIdx)) ? 'default' : 'outline'}
                          className="w-full min-h-[44px] text-sm font-medium mt-auto"
                          onClick={() => handlePlanSelect(p.planId)}
                          disabled={isDisabled}
                        >
                          {ctaLabel}
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {/* Reassurance + links */}
                <div className="space-y-2.5 pt-5 border-t border-border/15">
                  <p className="text-xs text-muted-foreground font-medium text-center">
                    Cancel anytime · No commitment
                  </p>
                  <p className="text-xs text-muted-foreground/70 text-center">
                    All paid plans include product visuals, freestyle creation, and 1,000+ scenes.
                  </p>
                  <div className="flex items-center justify-center gap-4 pt-1">
                    <a href="/app/pricing" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                      Compare all features
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                    <span className="text-muted-foreground/30">·</span>
                    <button
                      onClick={() => handlePlanSelect('enterprise')}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                    >
                      Contact Sales
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <PlanChangeDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setCheckoutLoading(false); }}
        onConfirm={handleDialogConfirm}
        mode={dialogMode}
        targetPlan={selectedPlan || undefined}
        currentPlanName={planConfig.name}
        isAnnual={isAnnual}
        currentBalance={balance}
        hasActiveSubscription={subscriptionStatus === 'active' || subscriptionStatus === 'canceling'}
        loading={checkoutLoading}
      />
    </>
  );
}
