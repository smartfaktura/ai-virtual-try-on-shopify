import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Check, ChevronDown, ArrowUpRight, Lock,
  Image, Video, RefreshCw,
  Camera, Users, Film, Wand2, Palette, Layers,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { pricingPlans } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { PlanChangeDialog, type PlanChangeMode } from '@/components/app/PlanChangeDialog';
import { UpgradePlanModal } from '@/components/app/UpgradePlanModal';
import { toast } from '@/lib/brandedToast';
import type { PricingPlan } from '@/types';

const PLAN_ORDER = ['free', 'starter', 'growth', 'pro', 'enterprise'];
const CREDITS_PER_IMAGE = 5;

const VALUE_PILLARS = [
  { icon: Camera, title: 'Replace your photo studio', desc: '1,000+ scenes, lighting setups, and props — no booking, no setup, no waiting.' },
  { icon: Users, title: 'Models without the model fee', desc: 'Diverse AI Models and custom Brand Models trained on your aesthetic.' },
  { icon: Layers, title: 'From product to ad in minutes', desc: 'Bulk generation, multi-angle shots, and 4K upscaling in a single flow.' },
  { icon: Film, title: 'Video, not just stills', desc: 'Short Films and product videos powered by AI cinematography.' },
  { icon: Palette, title: 'On-brand, every time', desc: 'Brand Profiles lock your colors, tone, and visual language across every asset.' },
  { icon: Wand2, title: 'Edit anything, anytime', desc: 'Freestyle prompts, background swaps, and intelligent retouching built in.' },
];

const COMPARISON = [
  { role: 'Product photographer', traditional: '$500–2,000/day' },
  { role: 'Studio rental', traditional: '$200–800/day' },
  { role: 'Models & talent', traditional: '$500–3,000/day' },
  { role: 'Retouching', traditional: '$5–25/image' },
];

const FAQS = [
  { q: 'Is there a free trial?', a: 'Every account starts with 20 free credits — no credit card required. Generate your first visuals before committing to a plan.' },
  { q: 'How much does a single image cost?', a: 'Each image typically costs 4–6 credits depending on workflow. On the Growth plan that works out to around 5¢ per credit, or roughly $0.25 per image.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel from settings in one click — no commitment, no cancellation fees. Your plan stays active until the end of the billing period.' },
  { q: 'What is a Brand Profile?', a: 'A saved set of brand rules — colors, tone, photography references, do-not lists — that VOVV applies automatically to every generation for visual consistency.' },
  { q: 'What formats and resolutions do I get?', a: 'High-resolution PNG and JPG, with 1:1, 4:5, 3:4, 16:9, and 9:16 aspect ratios. Upscale anything to print-ready 4K when you need it.' },
  { q: 'What can I create with VOVV?', a: 'Product photography, lifestyle scenes, on-model imagery, editorial campaigns, ad creative, and short product videos — all from a single product photo.' },
];

export default function AppPricing() {
  const navigate = useNavigate();
  const { plan, subscriptionStatus, startCheckout, openCustomerPortal } = useCredits();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<PlanChangeMode>('upgrade');
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [topupOpen, setTopupOpen] = useState(false);

  const isAnnual = billingPeriod === 'annual';
  const mainPlans = pricingPlans.filter(p => !p.isEnterprise);
  const currentIdx = PLAN_ORDER.indexOf(plan);
  const planConfig = pricingPlans.find(p => p.planId === plan);

  const handlePlanSelect = (planId: string) => {
    if (planId === 'enterprise') {
      navigate('/contact');
      return;
    }
    const targetPlan = pricingPlans.find(p => p.planId === planId);
    if (!targetPlan) return;
    const targetIdx = PLAN_ORDER.indexOf(planId);
    if (planId === plan && subscriptionStatus === 'canceling') setDialogMode('reactivate');
    else if (planId === 'free') setDialogMode('cancel');
    else if (targetIdx > currentIdx) setDialogMode('upgrade');
    else setDialogMode('downgrade');
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 sm:py-16 pb-20 space-y-20 sm:space-y-24">

      {/* ── Hero ── */}
      <header className="text-center space-y-4 max-w-2xl mx-auto">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Pricing</p>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.05]">
          Studio-grade visuals.<br className="hidden sm:block" /> Without the studio.
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Pick the plan that matches your output. Cancel anytime — no commitment.
        </p>

        {/* Billing toggle (modal pill style) */}
        <div className="flex justify-center pt-3">
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-muted/50 border border-border/40 text-xs">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-1.5 rounded-full transition-colors ${
                !isAnnual ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-4 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
                isAnnual ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'
              }`}
            >
              Annual
              <span className="text-[10px] text-primary font-semibold">−20%</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Plan Cards ── */}
      <section className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {mainPlans.map((p) => {
            const isCurrent = p.planId === plan;
            const targetIdx = PLAN_ORDER.indexOf(p.planId);
            const isFree = p.planId === 'free';
            const isRecommended = p.planId === 'growth';
            const credits = typeof p.credits === 'number' ? p.credits : 0;
            const imageEstimate = credits > 0 ? Math.round(credits / CREDITS_PER_IMAGE) : null;
            const displayPrice = isAnnual ? Math.round(p.annualPrice / 12) : p.monthlyPrice;
            const annualSavings = isAnnual && p.monthlyPrice > 0 ? (p.monthlyPrice * 12) - p.annualPrice : 0;

            const features = p.features.map(f => typeof f === 'string' ? f : f.text);
            const topFeatures = features.slice(0, 4);
            const extraFeatures = features.slice(4);

            let ctaLabel: string;
            if (isCurrent && subscriptionStatus === 'canceling') ctaLabel = 'Reactivate';
            else if (isCurrent) ctaLabel = 'Current plan';
            else if (targetIdx > currentIdx) ctaLabel = isFree ? 'Get started free' : 'Continue to checkout';
            else ctaLabel = `Downgrade to ${p.name}`;

            const isDisabled = isCurrent && subscriptionStatus !== 'canceling';

            return (
              <div
                key={p.planId}
                className={`relative rounded-2xl border p-5 flex flex-col transition-all ${
                  isRecommended
                    ? 'border-primary bg-primary/[0.04] ring-1 ring-primary/30 shadow-lg'
                    : isCurrent
                      ? 'border-primary/60 bg-card shadow-sm'
                      : 'border-border/50 bg-card hover:border-border'
                }`}
              >
                {/* Badge row */}
                <div className="flex items-center gap-2 mb-4 min-h-[18px] flex-wrap">
                  {isRecommended && (
                    <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold">
                      Recommended for You
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                      Current plan
                    </span>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-base font-semibold tracking-tight mb-3">{p.name}</h3>

                {/* Price */}
                <div className="mb-4">
                  {isFree ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-semibold tracking-tight">$0</span>
                      <span className="text-xs text-muted-foreground">/mo</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-semibold tracking-tight">${displayPrice}</span>
                        <span className="text-xs text-muted-foreground">/mo</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {isAnnual ? `billed yearly · save $${annualSavings}` : 'billed monthly'}
                      </p>
                    </>
                  )}
                </div>

                {/* Credits */}
                {imageEstimate ? (
                  <div className="mb-4 pb-4 border-b border-border/40">
                    <p className="text-sm font-medium text-foreground">{credits.toLocaleString()} credits/mo</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">~{imageEstimate.toLocaleString()} images</p>
                    {displayPrice > 0 && (
                      <p className="text-[10px] text-primary font-medium mt-1">
                        {(displayPrice / credits * 100).toFixed(1)}¢ per credit
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mb-4 pb-4 border-b border-border/40">
                    <p className="text-sm font-medium text-foreground">{credits} credits</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">to try the platform</p>
                  </div>
                )}

                {/* Features */}
                <ul className="space-y-2 flex-1 mb-5">
                  {topFeatures.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary" strokeWidth={2.5} />
                      <span className="text-[12px] text-foreground/80 leading-snug">{f}</span>
                    </li>
                  ))}
                  {extraFeatures.length > 0 && (
                    <li className="text-[11px] text-muted-foreground pl-5.5">+ {extraFeatures.length} more</li>
                  )}
                </ul>

                {/* CTA */}
                <Button
                  variant={isDisabled ? 'secondary' : isRecommended || (targetIdx > currentIdx && !isFree) ? 'default' : 'outline'}
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

        {/* Trust line */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-1">
          <Lock className="w-3 h-3" />
          <span>Cancel anytime · No commitment · Secure checkout</span>
        </div>
      </section>

      {/* ── Value pillars ── */}
      <section className="space-y-8">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">What you actually get</h2>
          <p className="text-sm text-muted-foreground">
            Six things that replace the rest of your creative production stack.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {VALUE_PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-2xl border border-border/50 bg-card p-5 space-y-3"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <pillar.icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold tracking-tight">{pillar.title}</h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ROI snapshot ── */}
      <section className="space-y-8">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">The math, simply</h2>
          <p className="text-sm text-muted-foreground">
            What a typical brand spends on production — and what VOVV replaces.
          </p>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { stat: '~$0.04', label: 'per credit on Pro plan' },
            { stat: '$8,000+', label: 'saved per shoot vs traditional' },
            { stat: '5 min', label: 'from upload to first visual' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border/50 bg-card p-6 text-center">
              <p className="text-3xl font-semibold tracking-tight text-primary">{s.stat}</p>
              <p className="text-xs text-muted-foreground mt-2">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Compact comparison */}
        <div className="rounded-2xl border border-border/50 overflow-hidden">
          <div className="grid grid-cols-3 bg-muted/40 px-5 py-3">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Role</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Traditional</span>
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider text-right">VOVV</span>
          </div>
          {COMPARISON.map((row) => (
            <div key={row.role} className="grid grid-cols-3 px-5 py-3.5 border-t border-border/40 bg-card">
              <span className="text-sm font-medium">{row.role}</span>
              <span className="text-sm text-muted-foreground text-center line-through decoration-muted-foreground/40">{row.traditional}</span>
              <span className="text-sm font-medium text-primary text-right">Included</span>
            </div>
          ))}
          <div className="grid grid-cols-3 px-5 py-4 border-t border-border bg-muted/30">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-sm font-semibold text-muted-foreground text-center line-through decoration-muted-foreground/40">$4,500–22,000+</span>
            <span className="text-sm font-semibold text-primary text-right">From $0/mo</span>
          </div>
        </div>
      </section>

      {/* ── How credits work ── */}
      <section className="space-y-8">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">How credits work</h2>
          <p className="text-sm text-muted-foreground">One simple currency powers everything you create.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Image, title: 'Generate images', desc: '4–6 credits per image depending on the workflow — product, lifestyle, editorial, or on-model.' },
            { icon: Video, title: 'Video & upscaling', desc: 'Use credits for video generation, 2K and 4K upscaling, and Brand Model training.' },
            { icon: RefreshCw, title: 'Monthly refresh', desc: 'Credits refresh every billing cycle. Higher plans unlock better per-credit value and faster queues.' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border/50 bg-card p-5 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold tracking-tight">{item.title}</h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="space-y-6 max-w-3xl mx-auto w-full">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Questions, answered</h2>
        </div>
        <div className="space-y-2">
          {FAQS.map((faq) => (
            <Collapsible key={faq.q}>
              <CollapsibleTrigger className="w-full flex items-center justify-between rounded-2xl border border-border/50 bg-card px-5 py-4 hover:border-border transition-colors text-left group">
                <span className="text-sm font-medium">{faq.q}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-5 pt-2 pb-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </section>

      {/* ── Final CTA strip ── */}
      <section className="rounded-2xl border border-border/50 bg-card p-8 sm:p-10 text-center space-y-5">
        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Need credits sooner?</h2>
          <p className="text-sm text-muted-foreground">
            Top up instantly without changing plans, or talk to us about custom volume.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => setTopupOpen(true)}
            className="rounded-xl min-h-[44px] gap-2"
          >
            Top up credits
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/contact')}
            className="rounded-xl min-h-[44px]"
          >
            Talk to sales
          </Button>
        </div>
      </section>

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

      <UpgradePlanModal
        open={topupOpen}
        onClose={() => setTopupOpen(false)}
        variant="topup"
      />
    </div>
  );
}
