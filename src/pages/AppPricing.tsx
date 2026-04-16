import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Check, ChevronDown, ArrowUpRight, Lock, Minus,
  Image, Video, RefreshCw,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { pricingPlans } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { PlanChangeDialog, type PlanChangeMode } from '@/components/app/PlanChangeDialog';
import { UpgradePlanModal } from '@/components/app/UpgradePlanModal';
import type { PricingPlan } from '@/types';

const PLAN_ORDER = ['free', 'starter', 'growth', 'pro', 'enterprise'];
const CREDITS_PER_IMAGE = 5;

const COMPARISON = [
  { role: 'Product photographer', traditional: '$500–2,000/day' },
  { role: 'Studio rental', traditional: '$200–800/day' },
  { role: 'Models & talent', traditional: '$500–3,000/day' },
  { role: 'Retouching', traditional: '$5–25/image' },
];

// ── Feature comparison matrix ──
// value true = ✓ · false = — · string = text value
type Cell = boolean | string;
type FeatureRow = { label: string; values: Record<string, Cell> };
type FeatureGroup = { title: string; rows: FeatureRow[] };

const FEATURE_MATRIX: FeatureGroup[] = [
  {
    title: 'Generation',
    rows: [
      { label: 'Product photography scenes (1,000+)', values: { free: true, starter: true, growth: true, pro: true } },
      { label: 'Lifestyle & editorial scenes', values: { free: true, starter: true, growth: true, pro: true } },
      { label: 'AI Models (on-model imagery)', values: { free: true, starter: true, growth: true, pro: true } },
      { label: 'Brand Models (custom trained)', values: { free: false, starter: false, growth: true, pro: true } },
      { label: 'Bulk generation', values: { free: false, starter: true, growth: true, pro: true } },
      { label: 'Multi-angle / perspectives', values: { free: true, starter: true, growth: true, pro: true } },
      { label: 'Freestyle (text-to-image)', values: { free: true, starter: true, growth: true, pro: true } },
      { label: 'Image editing & background swap', values: { free: true, starter: true, growth: true, pro: true } },
    ],
  },
  {
    title: 'Video',
    rows: [
      { label: 'Product videos', values: { free: false, starter: true, growth: true, pro: true } },
      { label: 'Short Films (AI Director)', values: { free: false, starter: false, growth: true, pro: true } },
      { label: 'Audio & dialog', values: { free: false, starter: false, growth: false, pro: true } },
    ],
  },
  {
    title: 'Quality & output',
    rows: [
      { label: '2K resolution', values: { free: true, starter: true, growth: true, pro: true } },
      { label: '4K upscaling', values: { free: false, starter: true, growth: true, pro: true } },
      { label: 'All aspect ratios (1:1, 4:5, 3:4, 16:9, 9:16)', values: { free: true, starter: true, growth: true, pro: true } },
      { label: 'PNG / JPG export', values: { free: true, starter: true, growth: true, pro: true } },
    ],
  },
  {
    title: 'Brand & workflow',
    rows: [
      { label: 'Brand Profiles', values: { free: false, starter: true, growth: true, pro: true } },
      { label: 'Saved aesthetics & color systems', values: { free: false, starter: false, growth: true, pro: true } },
      { label: 'Catalog Studio', values: { free: false, starter: false, growth: true, pro: true } },
      { label: 'Trend Watch (curated drops)', values: { free: false, starter: false, growth: false, pro: true } },
      { label: 'Bulk export (ZIP)', values: { free: false, starter: true, growth: true, pro: true } },
    ],
  },
  {
    title: 'Account',
    rows: [
      { label: 'Generation queue speed', values: { free: 'Standard', starter: 'Standard', growth: 'Priority', pro: 'Fastest' } },
      { label: 'Monthly credits', values: { free: '20', starter: '500', growth: '1,500', pro: '5,000' } },
      { label: 'Support', values: { free: 'Community', starter: 'Email', growth: 'Email', pro: 'Priority' } },
    ],
  },
];

const FAQS = [
  {
    q: 'How does VOVV compare to a real photoshoot?',
    a: 'A traditional product shoot runs $4,500–22,000+ once you factor in photographer, studio, models, props, and retouching — and takes 2–4 weeks. VOVV delivers comparable visuals in minutes for a fraction of the cost, with unlimited iterations included in your plan.',
  },
  {
    q: 'What exactly counts as 1 credit?',
    a: 'A standard image is ~4–6 credits depending on complexity. Video generation runs 30–60 credits per clip. 4K upscaling is ~5 credits. Brand Model training is a one-time ~50 credits per model. You always see the cost before you generate.',
  },
  {
    q: 'Do unused credits roll over?',
    a: 'Monthly plan credits reset at the end of each billing cycle (use-it-or-lose-it). Top-up credits, however, never expire — buy them once, use them whenever.',
  },
  {
    q: 'Can I use the images commercially?',
    a: 'Yes. Every paid plan includes a full commercial license — use generations in ads, ecommerce, packaging, social, print, anywhere. You own the output.',
  },
  {
    q: 'What happens if I cancel mid-cycle?',
    a: 'Your plan stays active until the end of the current billing period, then drops to Free automatically. No prorated refunds, no surprise charges, no lock-in.',
  },
  {
    q: 'How accurate are AI Models for on-model shots?',
    a: 'Built-in AI Models cover diverse looks out of the box. For full identity consistency — same face, same hands, same product fit across every shot — train a Brand Model on your own references (Growth plan and up).',
  },
  {
    q: 'Can I switch plans anytime?',
    a: 'Yes. Upgrades take effect immediately with prorated credits added to your balance. Downgrades apply at the next renewal so you keep what you paid for.',
  },
  {
    q: 'Is my product data private?',
    a: 'Your uploads, generations, and Brand Profiles are private to your workspace. We never train shared models on your data, and we never expose your assets to other users.',
  },
];

// Helper to render a comparison cell
function renderCell(val: Cell) {
  if (val === true) return <Check className="w-4 h-4 text-primary mx-auto" strokeWidth={2.5} />;
  if (val === false) return <Minus className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-xs font-medium text-foreground">{val}</span>;
}

export default function AppPricing() {
  const navigate = useNavigate();
  const { plan, subscriptionStatus, startCheckout, openCustomerPortal } = useCredits();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<PlanChangeMode>('upgrade');
  const [selectedDialogPlan, setSelectedDialogPlan] = useState<PricingPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [topupOpen, setTopupOpen] = useState(false);

  const isAnnual = billingPeriod === 'annual';
  const mainPlans = pricingPlans.filter(p => !p.isEnterprise);
  const currentIdx = PLAN_ORDER.indexOf(plan);
  const planConfig = pricingPlans.find(p => p.planId === plan);
  const isFreeUser = plan === 'free';

  // Default selection: current plan if paid, else Growth
  const defaultSelected = useMemo(() => {
    if (currentIdx > 0) return plan;
    return 'growth';
  }, [plan, currentIdx]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(defaultSelected);

  const selectedPlan = mainPlans.find(p => p.planId === selectedPlanId) ?? mainPlans[0];
  const selectedIdx = PLAN_ORDER.indexOf(selectedPlanId);

  // Determine CTA state for the single button
  let ctaLabel = 'Continue to checkout';
  let ctaDisabled = false;
  if (selectedPlanId === plan && subscriptionStatus === 'canceling') ctaLabel = 'Reactivate plan';
  else if (selectedPlanId === plan) { ctaLabel = 'Current plan'; ctaDisabled = true; }
  else if (selectedPlanId === 'free') ctaLabel = 'Cancel subscription';
  else if (selectedIdx < currentIdx) ctaLabel = `Downgrade to ${selectedPlan.name}`;

  const handleConfirmSelection = () => {
    if (ctaDisabled) return;
    const targetPlan = mainPlans.find(p => p.planId === selectedPlanId);
    if (!targetPlan) return;
    if (selectedPlanId === plan && subscriptionStatus === 'canceling') setDialogMode('reactivate');
    else if (selectedPlanId === 'free') setDialogMode('cancel');
    else if (selectedIdx > currentIdx) setDialogMode('upgrade');
    else setDialogMode('downgrade');
    setSelectedDialogPlan(targetPlan);
    setDialogOpen(true);
  };

  const handleDialogConfirm = async () => {
    setLoading(true);
    try {
      if (dialogMode === 'cancel' || dialogMode === 'reactivate') {
        await openCustomerPortal();
      } else if (selectedDialogPlan) {
        if (subscriptionStatus === 'active' || subscriptionStatus === 'canceling') {
          await openCustomerPortal();
        } else {
          const priceId = isAnnual ? selectedDialogPlan.stripePriceIdAnnual : selectedDialogPlan.stripePriceIdMonthly;
          if (priceId) await startCheckout(priceId, 'subscription');
        }
      }
    } catch {
      setLoading(false);
    }
  };

  const scrollToPlans = () => {
    document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16 pb-20 space-y-20 sm:space-y-24">

      {/* ── Hero ── */}
      <header className="text-center space-y-4 max-w-2xl mx-auto">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Pricing</p>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.05]">
          Studio-grade visuals.<br className="hidden sm:block" /> Without the studio.
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Pick the plan that matches your output. Cancel anytime — no commitment.
        </p>

        {/* Billing toggle */}
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

      {/* ── Compact selectable plan rows (modal style) ── */}
      <section id="plans-section" className="space-y-5 max-w-2xl mx-auto w-full">
        <div className="space-y-2.5">
          {mainPlans.map((p) => {
            const isCurrent = p.planId === plan;
            const isSelected = p.planId === selectedPlanId;
            const isFree = p.planId === 'free';
            const isRecommended = p.planId === 'growth';
            const credits = typeof p.credits === 'number' ? p.credits : 0;
            const imageEstimate = credits > 0 ? Math.round(credits / CREDITS_PER_IMAGE) : 0;
            const displayPrice = isAnnual ? Math.round(p.annualPrice / 12) : p.monthlyPrice;
            const annualSavings = isAnnual && p.monthlyPrice > 0 ? (p.monthlyPrice * 12) - p.annualPrice : 0;
            const centsPerCredit = displayPrice > 0 && credits > 0 ? (displayPrice / credits * 100).toFixed(1) : null;

            return (
              <button
                key={p.planId}
                type="button"
                onClick={() => setSelectedPlanId(p.planId)}
                className={`w-full text-left rounded-2xl border p-4 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/[0.04] ring-1 ring-primary/30'
                    : 'border-border/50 hover:border-border bg-card'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={`mt-0.5 inline-flex w-4 h-4 rounded-full border items-center justify-center shrink-0 ${
                        isSelected ? 'border-primary' : 'border-muted-foreground/40'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-primary" strokeWidth={3} />}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{p.name}</span>
                        {isCurrent && (
                          <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold whitespace-nowrap">
                            Current plan
                          </span>
                        )}
                        {isRecommended && !isCurrent && (
                          <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold whitespace-nowrap">
                            Recommended for You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isFree
                          ? `${credits} credits to try the platform`
                          : `${credits.toLocaleString()} credits · ~${imageEstimate.toLocaleString()} images/mo${centsPerCredit ? ` · ${centsPerCredit}¢/credit` : ''}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-semibold tracking-tight">${isFree ? 0 : displayPrice}</span>
                      <span className="text-[11px] text-muted-foreground">/mo</span>
                    </div>
                    {isAnnual && annualSavings > 0 && (
                      <span className="text-[10px] text-primary font-medium mt-0.5">save ${annualSavings}/yr</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Trust block — left-aligned, modal-style */}
        <div className="flex flex-col gap-1.5 pt-2">
          <p className="text-[13px] text-muted-foreground">
            Cancel anytime · No commitment
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
            <Lock className="w-3 h-3" />
            <span>You'll be securely redirected to complete checkout</span>
          </p>
        </div>

        {/* Single CTA */}
        <Button
          className="w-full rounded-xl min-h-[48px] gap-2 text-sm font-medium"
          onClick={handleConfirmSelection}
          disabled={ctaDisabled}
        >
          {ctaLabel}
          {!ctaDisabled && <ArrowUpRight className="w-3.5 h-3.5" />}
        </Button>
      </section>

      {/* ── Feature comparison table ── */}
      <section className="space-y-8">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Compare every feature</h2>
          <p className="text-sm text-muted-foreground">
            Everything that's included on each plan — no fine print.
          </p>
        </div>

        <div className="rounded-2xl border border-border/50 overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/40 sticky top-0">
                <tr>
                  <th className="text-left px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[34%]">
                    Feature
                  </th>
                  {mainPlans.map((p) => {
                    const isRec = p.planId === 'growth';
                    const displayPrice = isAnnual ? Math.round(p.annualPrice / 12) : p.monthlyPrice;
                    return (
                      <th key={p.planId} className="px-3 py-4 text-center min-w-[110px]">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`text-xs font-semibold ${isRec ? 'text-primary' : 'text-foreground'}`}>
                            {p.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-normal">
                            ${displayPrice}/mo
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {FEATURE_MATRIX.map((group) => (
                  <>
                    <tr key={`${group.title}-header`} className="bg-muted/20 border-t border-border/40">
                      <td colSpan={mainPlans.length + 1} className="px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {group.title}
                      </td>
                    </tr>
                    {group.rows.map((row) => (
                      <tr key={row.label} className="border-t border-border/30 hover:bg-muted/10 transition-colors">
                        <td className="px-5 py-3 text-[13px] text-foreground/90">{row.label}</td>
                        {mainPlans.map((p) => (
                          <td key={p.planId} className="px-3 py-3 text-center">
                            {renderCell(row.values[p.planId] ?? false)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
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
                <span className="text-sm font-medium pr-4">{faq.q}</span>
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
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            {isFreeUser ? 'Ready to start creating?' : 'Need credits sooner?'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isFreeUser
              ? 'Pick a plan above to unlock the full platform, or talk to us about custom volume.'
              : 'Top up instantly without changing plans, or talk to us about custom volume.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isFreeUser ? (
            <Button onClick={scrollToPlans} className="rounded-xl min-h-[44px] gap-2">
              Choose a plan
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button onClick={() => setTopupOpen(true)} className="rounded-xl min-h-[44px] gap-2">
              Top up credits
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/contact')} className="rounded-xl min-h-[44px]">
            Talk to sales
          </Button>
        </div>
      </section>

      <PlanChangeDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setLoading(false); }}
        onConfirm={handleDialogConfirm}
        mode={dialogMode}
        targetPlan={selectedDialogPlan || undefined}
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
