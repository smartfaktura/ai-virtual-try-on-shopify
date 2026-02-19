import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Check, ArrowUpRight } from 'lucide-react';
import { creditPacks, pricingPlans } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { PlanChangeDialog, type PlanChangeMode } from '@/components/app/PlanChangeDialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { PricingPlan } from '@/types';

const PLAN_ORDER = ['free', 'starter', 'growth', 'pro', 'enterprise'];

export function BuyCreditsModal() {
  const { balance, plan, planConfig, buyModalOpen, closeBuyModal, subscriptionStatus, startCheckout } = useCredits();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'topup' | 'upgrade'>(() => plan === 'free' ? 'upgrade' : 'topup');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<PlanChangeMode>('upgrade');
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  const isAnnual = billingPeriod === 'annual';
  const mainPlans = pricingPlans.filter(p => !p.isEnterprise);

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
      const priceId = isAnnual ? selectedPlan.stripePriceIdAnnual : selectedPlan.stripePriceIdMonthly;
      if (priceId) {
        startCheckout(priceId, 'subscription');
      }
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
        <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden rounded-2xl border-border/50 shadow-2xl max-h-[85dvh] flex flex-col">

          {/* Balance header */}
          <div className="px-6 pt-5 pb-4 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-muted">
                <Wallet className="w-4 h-4 text-foreground" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight">{balance.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">credits</span>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px] tracking-widest uppercase font-semibold px-3 py-1">
              {planConfig.name}
            </Badge>
          </div>

          {/* Tab switcher */}
          <div className="px-6 pt-1">
            <div className="flex gap-1 border-b border-border/40">
              {(['topup', 'upgrade'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 text-sm font-medium transition-all relative ${
                    activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70'
                  }`}
                >
                  {tab === 'topup' ? 'Top Up' : 'Plans'}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 pt-5">

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
              <div className="space-y-5">
                {/* Billing toggle */}
                <div className="flex justify-center">
                  <div className="flex rounded-full border border-border p-0.5 bg-muted/40">
                    <button
                      className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${
                        billingPeriod === 'monthly'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setBillingPeriod('monthly')}
                    >
                      Monthly
                    </button>
                    <button
                      className={`px-6 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-1.5 ${
                        billingPeriod === 'annual'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setBillingPeriod('annual')}
                    >
                      Annual
                      <span className={`inline-flex rounded-full text-[9px] font-bold px-1.5 py-0.5 leading-none ${
                        billingPeriod === 'annual' ? 'bg-white/25 text-white' : 'bg-emerald-500/20 text-emerald-700'
                      }`}>
                        SAVE 17%
                      </span>
                    </button>
                  </div>
                </div>

                {/* Plan cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {mainPlans.map((p) => {
                    const isCurrent = p.planId === plan;
                    const currentIdx = PLAN_ORDER.indexOf(plan);
                    const targetIdx = PLAN_ORDER.indexOf(p.planId);
                    const displayPrice = isAnnual ? Math.round(p.annualPrice / 12) : p.monthlyPrice;
                    const isFree = p.planId === 'free';
                    const credits = typeof p.credits === 'number' ? p.credits : 0;
                    const imageEstimate = credits > 0 ? Math.round(credits / 5) : null;

                    let ctaLabel = targetIdx > currentIdx ? `Get ${p.name}` : `Get ${p.name}`;
                    if (isCurrent && subscriptionStatus === 'canceling') ctaLabel = 'Reactivate';
                    else if (isCurrent) ctaLabel = 'Current Plan';
                    const isDisabled = isCurrent && subscriptionStatus !== 'canceling';

                    return (
                      <div
                        key={p.planId}
                        className={`relative rounded-2xl p-5 flex flex-col transition-all duration-200 ${
                          p.highlighted
                            ? 'border-2 border-primary ring-1 ring-primary/10 bg-card'
                            : isCurrent
                              ? 'border border-primary/30 bg-card'
                              : 'border border-border bg-card hover:shadow-sm'
                        }`}
                      >
                        {/* Name + badges inline */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <h4 className="text-base font-semibold">{p.name}</h4>
                          {p.badge && (
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
                              <span className="text-3xl font-bold tracking-tight">Free</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-baseline gap-1">
                                {isAnnual && p.monthlyPrice > displayPrice && (
                                  <span className="text-sm text-muted-foreground line-through">${p.monthlyPrice}</span>
                                )}
                                <span className="text-3xl font-bold tracking-tight">${displayPrice}</span>
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
                          {p.features.slice(0, 4).map((f, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary/60" />
                              <span className="text-[11px] text-muted-foreground leading-snug">{f}</span>
                            </div>
                          ))}
                        </div>

                        {/* CTA */}
                        <Button
                          variant={isDisabled ? 'secondary' : (p.highlighted || targetIdx > currentIdx) ? 'default' : 'outline'}
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
      />
    </>
  );
}
