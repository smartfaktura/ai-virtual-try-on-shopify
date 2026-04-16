import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronDown, ArrowUpRight, Loader2, Image, Video, ZoomIn, RefreshCw, Layers, Palette, Sparkles, Shield } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { pricingPlans } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { PlanChangeDialog, type PlanChangeMode } from '@/components/app/PlanChangeDialog';
import { CompetitorComparison } from '@/components/app/CompetitorComparison';
import { toast } from '@/lib/brandedToast';
import type { PricingPlan } from '@/types';

const PLAN_ORDER = ['free', 'starter', 'growth', 'pro', 'enterprise'];

const DETAILED_FEATURES: Record<string, (string | { text: string; badge: string })[]> = {
  free: [
    '20 credits / month',
    '~4 images',
    '1,000+ scenes',
    'Freestyle creation',
    'All models & scenes',
    'Upscale to 2K & 4K',
    'Video generation',
    '1 brand profile',
    'Up to 5 products',
  ],
  starter: [
    '500 credits / month',
    '~100 images',
    '$0.078 per credit',
    'Bulk generations',
    'All models & scenes',
    'Upscale to 2K & 4K',
    'Video generation',
    '3 brand profiles',
    'Up to 100 products',
  ],
  growth: [
    '1,500 credits / month',
    '~300 images',
    '$0.053 per credit',
    'Faster generation queue',
    { text: 'Brand Models', badge: 'NEW' },
    'All models & scenes',
    'Upscale to 2K & 4K',
    'Video generation',
    '10 brand profiles',
    'Up to 250 products',
  ],
  pro: [
    '4,500 credits / month',
    '~900 images',
    '$0.040 per credit',
    'Fastest generation queue',
    { text: 'Brand Models', badge: 'NEW' },
    'All models & scenes',
    'Upscale to 2K & 4K',
    'Video generation',
    'Unlimited profiles',
    'Unlimited products',
  ],
};

const VALUE_ROWS = [
  { planId: 'starter', name: 'Starter', credits: '500', images: '~100', ppc: '$0.078' },
  { planId: 'growth', name: 'Growth', credits: '1,500', images: '~300', ppc: '$0.053' },
  { planId: 'pro', name: 'Pro', credits: '4,500', images: '~900', ppc: '$0.040' },
];

export default function AppPricing() {
  const { plan, subscriptionStatus, startCheckout, openCustomerPortal } = useCredits();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<PlanChangeMode>('upgrade');
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const isAnnual = billingPeriod === 'annual';
  const isMobile = useIsMobile();
  const mainPlans = pricingPlans.filter(p => !p.isEnterprise);

  // On mobile, reorder so Growth is first
  const mobilePlans = [...mainPlans].sort((a, b) => {
    if (a.highlighted) return -1;
    if (b.highlighted) return 1;
    return 0;
  });

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
    setLoading(true);
    try {
      if (dialogMode === 'cancel' || dialogMode === 'reactivate') {
        await openCustomerPortal();
      } else if (selectedPlan) {
        if (subscriptionStatus === 'active' || subscriptionStatus === 'canceling') {
          await openCustomerPortal();
        } else {
          const priceId = isAnnual ? selectedPlan.stripePriceIdAnnual : selectedPlan.stripePriceIdMonthly;
          if (priceId) await startCheckout(priceId, 'subscription');
        }
      }
    } catch {
      setLoading(false);
    }
  };

  const currentIdx = PLAN_ORDER.indexOf(plan);
  const planConfig = pricingPlans.find(p => p.planId === plan);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Choose the right plan for your visual production
        </h1>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Credits power your image and video creation. Higher plans give better value per credit and faster generation.
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-full border border-border p-0.5 bg-muted/40">
          <button
            className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${
              !isAnnual ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setBillingPeriod('monthly')}
          >
            Monthly
          </button>
          <button
            className={`px-5 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-1.5 ${
              isAnnual ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setBillingPeriod('annual')}
          >
            Annual
            <span className={`inline-flex rounded-full text-[9px] font-bold px-2 py-0.5 leading-none ${
              isAnnual ? 'bg-primary-foreground/25 text-primary-foreground' : 'bg-emerald-500/20 text-emerald-700'
            }`}>
              SAVE 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Desktop: original order, Mobile: Growth first */}
        {(isMobile ? mobilePlans : mainPlans).map((p) => {
          const isCurrent = p.planId === plan;
          const targetIdx = PLAN_ORDER.indexOf(p.planId);
          const displayPrice = isAnnual ? Math.round(p.annualPrice / 12) : p.monthlyPrice;
          const isFree = p.planId === 'free';
          const credits = typeof p.credits === 'number' ? p.credits : 0;
          const imageEstimate = credits > 0 ? Math.round(credits / 5) : null;

          let ctaLabel = targetIdx > currentIdx ? `Choose ${p.name}` : targetIdx < currentIdx ? `Downgrade to ${p.name}` : 'Current Plan';
          if (isCurrent && subscriptionStatus === 'canceling') ctaLabel = 'Reactivate';
          const isDisabled = isCurrent && subscriptionStatus !== 'canceling';

          return (
            <div
              key={p.planId}
              className={`relative rounded-2xl p-5 flex flex-col transition-all ${
                isCurrent && !isFree
                  ? 'border-2 border-primary ring-1 ring-primary/10 bg-card'
                  : p.highlighted && targetIdx > currentIdx
                    ? 'border-2 border-primary/60 bg-card shadow-md'
                    : 'border border-border bg-card hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <h4 className="text-base font-semibold">{p.name}</h4>
                {p.badge && targetIdx > currentIdx && (
                  <Badge className="bg-primary text-primary-foreground text-[9px] tracking-widest uppercase px-2 py-0.5">
                    {p.badge}
                  </Badge>
                )}
                {isCurrent && (
                  <Badge variant="secondary" className="text-[9px] tracking-wider uppercase">Current</Badge>
                )}
              </div>

              <div className="mb-3">
                {isFree ? (
                  <span className="text-2xl font-bold tracking-tight">Free</span>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1">
                      {isAnnual && p.monthlyPrice > displayPrice && (
                        <span className="text-sm text-muted-foreground line-through">${p.monthlyPrice}</span>
                      )}
                      <span className="text-2xl font-bold tracking-tight">${displayPrice}</span>
                      <span className="text-xs text-muted-foreground">/mo</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {isAnnual ? 'billed annually' : 'billed monthly'}
                    </p>
                  </>
                )}
              </div>

              {imageEstimate ? (
                <div className="mb-4">
                  <p className="text-sm font-medium">~{imageEstimate} images/mo</p>
                  <p className="text-[11px] text-muted-foreground">{credits.toLocaleString()} credits/mo</p>
                  {displayPrice > 0 && (
                    <p className="text-[10px] text-primary font-medium mt-0.5">
                      {(displayPrice / credits * 100).toFixed(1)}¢ per credit
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">{p.credits} credits</p>
              )}

              {/* Short features (max 3 on mobile) */}
              <div className="space-y-1.5 flex-1 mb-4">
                {p.features.slice(0, 3).map((f, i) => (
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

      {/* Value Comparison Strip */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-center">Value at a glance</h2>
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="grid grid-cols-4 bg-muted/50 px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Plan</span>
            <span className="text-center">Credits/mo</span>
            <span className="text-center">~Images</span>
            <span className="text-right">Per credit</span>
          </div>
          {VALUE_ROWS.map((row) => (
            <div
              key={row.planId}
              className={`grid grid-cols-4 px-4 py-3 text-sm border-t border-border/50 ${
                row.planId === plan ? 'bg-primary/5 font-medium' : ''
              }`}
            >
              <span className="font-medium flex items-center gap-2">
                {row.name}
                {row.planId === 'growth' && (
                  <Badge className="bg-primary text-primary-foreground text-[8px] px-1.5 py-0">Best value</Badge>
                )}
              </span>
              <span className="text-center">{row.credits}</span>
              <span className="text-center">{row.images}</span>
              <span className="text-right text-primary font-medium">{row.ppc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expandable Detailed Features */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-center">Detailed feature comparison</h2>
        <div className="space-y-2">
          {Object.entries(DETAILED_FEATURES).map(([planId, features]) => {
            const planData = pricingPlans.find(p => p.planId === planId);
            if (!planData) return null;
            const isOpen = expandedPlan === planId;
            return (
              <div key={planId} className="rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => setExpandedPlan(isOpen ? null : planId)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{planData.name}</span>
                    {planId === plan && (
                      <Badge variant="secondary" className="text-[9px]">Current</Badge>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 space-y-2 border-t border-border/50">
                    {features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary/60" />
                        <span className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
                          {typeof feat === 'string' ? feat : (
                            <>
                              {feat.text}
                              <Badge className="text-[8px] px-1.5 py-0 leading-tight bg-primary text-primary-foreground">
                                {feat.badge}
                              </Badge>
                            </>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cost comparison */}
      <CompetitorComparison />

      {/* What are credits? */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-center">How credits work</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Image, title: 'Generate images', desc: '5 credits per image across all workflows — product shots, lifestyle, editorial, and more.' },
            { icon: Video, title: 'Create videos & upscale', desc: 'Use credits for video generation, 2K and 4K upscaling, and brand model training.' },
            { icon: RefreshCw, title: 'Monthly refresh', desc: 'Credits refresh every billing cycle. Higher plans unlock better per-credit value and faster queues.' },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <item.icon className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Included in every plan */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-center">Included in every plan</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { icon: Layers, label: '1,000+ scenes' },
            { icon: Palette, label: 'All AI models' },
            { icon: ZoomIn, label: '2K & 4K upscale' },
            { icon: Video, label: 'Video generation' },
            { icon: Sparkles, label: 'Freestyle creation' },
            { icon: Shield, label: 'No watermarks' },
          ].map((f) => (
            <div key={f.label} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
              <f.icon className="w-3.5 h-3.5 text-primary/70" />
              <span className="text-[12px] font-medium text-foreground">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-center">Frequently asked questions</h2>
        <div className="max-w-2xl mx-auto space-y-1.5">
          {[
            { q: 'Do unused credits roll over?', a: 'No — credits reset each billing cycle. Use them or lose them. This keeps plans affordable for everyone.' },
            { q: 'Can I change plans anytime?', a: 'Yes. Upgrade instantly and get the new credit balance right away. Downgrades take effect at your next billing date.' },
            { q: 'What happens when I run out of credits?', a: 'You can purchase one-time credit top-ups without changing your plan, or upgrade to a higher plan for more monthly credits.' },
            { q: 'How does annual billing work?', a: 'Pay for 12 months upfront and save 20%. Credits are still refreshed monthly — you get the same amount each month.' },
            { q: 'Is there a free trial?', a: 'Every account starts with 20 free credits — no credit card required. Generate images and see the quality before committing.' },
          ].map((faq) => (
            <Collapsible key={faq.q}>
              <CollapsibleTrigger className="w-full flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 hover:bg-muted/30 transition-colors text-left">
                <span className="text-sm font-medium">{faq.q}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pt-1 pb-3">
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>

      {/* Enterprise section */}
      <div className="rounded-2xl border border-border bg-muted/10 p-6 sm:p-8 text-center space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Need more scale?</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Custom credit volume, dedicated support, custom integrations, and automated workflows for teams.
        </p>
        <Button
          variant="outline"
          className="min-h-[44px] rounded-xl text-sm font-medium gap-1.5"
          onClick={() => handlePlanSelect('enterprise')}
        >
          Contact Sales
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Compare link back */}
      <div className="text-center">
        <a href="/pricing" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          View public pricing page →
        </a>
      </div>

      <PlanChangeDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setLoading(false); }}
        onConfirm={handleDialogConfirm}
        mode={dialogMode}
        targetPlan={selectedPlan || undefined}
        currentPlanName={planConfig?.name || 'Free'}
        isAnnual={isAnnual}
        currentBalance={0}
        hasActiveSubscription={subscriptionStatus === 'active' || subscriptionStatus === 'canceling'}
        loading={loading}
      />
    </div>
  );
}
