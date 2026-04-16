import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Check, ArrowUpRight, ArrowRight, X, Loader2 } from 'lucide-react';
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

  const [activeTab, setActiveTab] = useState<'topup' | 'upgrade'>(() => plan === 'free' ? 'upgrade' : 'topup');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>(effectiveInterval === 'annual' ? 'annual' : 'monthly');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<PlanChangeMode>('upgrade');
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [topUpLoadingId, setTopUpLoadingId] = useState<string | null>(null);
  const [switchLoading, setSwitchLoading] = useState(false);

  const anyLoading = checkoutLoading || !!topUpLoadingId || switchLoading;
  const isAnnual = billingPeriod === 'annual';
  const mainPlans = pricingPlans.filter(p => !p.isEnterprise);
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
        <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden rounded-none sm:rounded-2xl border-border/50 shadow-2xl max-h-[100dvh] sm:max-h-[90dvh] h-full sm:h-auto flex flex-col [&>button:last-child]:hidden top-0 sm:top-[50%] translate-y-0 sm:translate-y-[-50%] data-[state=open]:slide-in-from-bottom-0 data-[state=closed]:slide-out-to-bottom-0 data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100">

          {/* Balance header */}
          <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-muted">
                <Wallet className="w-4 h-4 text-foreground" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight">{balance.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">credits</span>
                </div>
                {isPaidUser && currentPeriodEnd && (
                  <p className={`text-[11px] mt-0.5 ${subscriptionStatus === 'canceling' ? 'text-amber-600' : 'text-muted-foreground'}`}>
                    {subscriptionStatus === 'canceling'
                      ? `Cancels ${currentPeriodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : `Renews ${currentPeriodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · billed ${effectiveInterval || 'monthly'}`
                    }
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] tracking-widest uppercase font-semibold px-3 py-1">
                {planConfig.name}
              </Badge>
              <button
                onClick={() => { if (!anyLoading) closeBuyModal(); }}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                disabled={anyLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tab switcher + billing toggle — single row */}
          <div className="px-4 sm:px-6 pt-3 pb-1 flex flex-wrap items-center justify-between gap-2">
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
            {activeTab === 'upgrade' && (
              <div className="inline-flex rounded-full border border-border p-0.5 bg-muted/40">
                <button
                  className={`px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all ${
                    billingPeriod === 'monthly'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setBillingPeriod('monthly')}
                >
                  Monthly
                </button>
                <button
                  className={`px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all flex items-center gap-1 ${
                    billingPeriod === 'annual'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setBillingPeriod('annual')}
                >
                  Annual
                  <span className={`inline-flex rounded-full text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 leading-none ${
                    billingPeriod === 'annual' ? 'bg-primary-foreground/25 text-primary-foreground' : 'bg-emerald-500/20 text-emerald-700'
                  }`}>
                    SAVE 20%
                  </span>
                </button>
              </div>
            )}
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
                              className="w-full min-h-[44px] rounded-xl text-sm font-medium gap-2"
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
                      className="rounded-lg shrink-0 gap-1.5"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                  {mainPlans.map((p) => {
                    const isCurrent = p.planId === plan;
                    const currentIdx = PLAN_ORDER.indexOf(plan);
                    const targetIdx = PLAN_ORDER.indexOf(p.planId);
                    const displayPrice = isAnnual ? Math.round(p.annualPrice / 12) : p.monthlyPrice;
                    const isFree = p.planId === 'free';
                    const credits = typeof p.credits === 'number' ? p.credits : 0;
                    const imageEstimate = credits > 0 ? Math.round(credits / 5) : null;

                    let ctaLabel = targetIdx > currentIdx ? `Choose ${p.name}` : targetIdx < currentIdx ? `Downgrade to ${p.name}` : `Choose ${p.name}`;
                    if (isCurrent && subscriptionStatus === 'canceling') ctaLabel = 'Reactivate';
                    else if (isCurrent) ctaLabel = 'Current Plan';
                    const isDisabled = isCurrent && subscriptionStatus !== 'canceling';

                    return (
                      <div
                        key={p.planId}
                        className={`relative rounded-2xl p-4 sm:p-5 flex flex-col transition-all duration-200 ${
                          isCurrent && p.planId !== 'free'
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
                              {displayPrice > 0 && (
                                <p className="text-[10px] text-primary font-medium mt-0.5">
                                  {(displayPrice / credits * 100).toFixed(1)}¢ per credit
                                </p>
                              )}
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
                              <span className="text-[11px] text-muted-foreground leading-snug">
                                {typeof f === 'string' ? f : (
                                  <span className="inline-flex items-center gap-1.5">
                                    {f.text}
                                    {f.badge && (
                                      <Badge className="text-[9px] px-1.5 py-0 leading-tight bg-primary/15 text-primary border-0">
                                        {f.badge}
                                      </Badge>
                                    )}
                                  </span>
                                )}
                              </span>
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
                <div>
                  <button
                    onClick={() => handlePlanSelect('enterprise')}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    Need more? Contact Sales
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
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
