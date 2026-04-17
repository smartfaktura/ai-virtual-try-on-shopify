import { useState, useEffect, useRef, useMemo, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Check, ArrowUpRight, Lock, Minus,
  Image, Video, RefreshCw, ArrowRight,
} from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PageHeader } from '@/components/app/PageHeader';
import { pricingPlans } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { PlanChangeDialog, type PlanChangeMode } from '@/components/app/PlanChangeDialog';
import { UpgradePlanModal } from '@/components/app/UpgradePlanModal';
import type { PricingPlan } from '@/types';
import { cn } from '@/lib/utils';

const PLAN_ORDER = ['free', 'starter', 'growth', 'pro', 'enterprise'];

const COMPARISON = [
  { role: 'Product photographer', traditional: '$500–2,000/day' },
  { role: 'Studio rental', traditional: '$200–800/day' },
  { role: 'Models & talent', traditional: '$500–3,000/day' },
  { role: 'Retouching', traditional: '$5–25/image' },
];

// ── Feature comparison matrix ──
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
      { label: 'Monthly credits', values: { free: '20', starter: '500', growth: '1,500', pro: '4,500' } },
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

function renderCell(val: Cell) {
  if (val === true) return <Check className="w-4 h-4 text-primary mx-auto" strokeWidth={2.5} />;
  if (val === false) return <Minus className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-xs font-medium text-foreground">{val}</span>;
}

// Billing toggle (reused mobile + desktop)
function BillingToggle({ isAnnual, onChange }: { isAnnual: boolean; onChange: (v: 'monthly' | 'annual') => void }) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-full bg-muted/50 border border-border/40 text-xs">
      <button
        onClick={() => onChange('monthly')}
        className={`px-4 py-1.5 rounded-full transition-colors ${
          !isAnnual ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'
        }`}
      >
        Monthly
      </button>
      <button
        onClick={() => onChange('annual')}
        className={`px-4 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
          isAnnual ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'
        }`}
      >
        Annual
        <span className="text-[10px] text-primary font-semibold">−20%</span>
      </button>
    </div>
  );
}

// Branded plan picker (replaces native <select> in sticky bar)
function PlanPickerPopover({
  plans,
  selectedId,
  onSelect,
  isAnnual,
}: {
  plans: PricingPlan[];
  selectedId: string;
  onSelect: (id: string) => void;
  isAnnual: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = plans.find(p => p.planId === selectedId);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1 -ml-1 px-1 py-0.5 rounded hover:bg-muted/60 transition-colors text-sm font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {selected?.name ?? 'Select plan'}
          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={12}
        className="p-1.5 w-[280px] min-w-[260px] border-border/60 shadow-lg rounded-xl"
      >
        <div className="flex flex-col">
          {plans.map((p) => {
            const isSelected = p.planId === selectedId;
            const isRec = p.planId === 'growth';
            const price = p.planId === 'free'
              ? 0
              : isAnnual
                ? Math.round(p.annualPrice / 12)
                : p.monthlyPrice;
            const credits = typeof p.credits === 'number' ? p.credits : 0;
            return (
              <button
                key={p.planId}
                type="button"
                onClick={() => { onSelect(p.planId); setOpen(false); }}
                className={cn(
                  "flex items-start justify-between gap-2 px-2.5 py-2 rounded-lg text-left transition-colors",
                  isSelected ? "bg-primary/5" : "hover:bg-muted/60"
                )}
              >
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-foreground">{p.name}</span>
                    {isRec && (
                      <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                        Recommended
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] text-muted-foreground mt-0.5">
                    ${price}/mo
                    {credits > 0 && ` · ${credits.toLocaleString()} credits`}
                  </span>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function AppPricing() {
  const navigate = useNavigate();
  const { plan, balance, subscriptionStatus, currentPeriodEnd, startCheckout, openCustomerPortal } = useCredits();
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

  // Sticky bar selected plan — defaults to current plan if paid, otherwise Growth (recommended)
  const defaultStickyPlanId = useMemo(() => {
    if (isFreeUser) return 'growth';
    // If current plan isn't in the picker (e.g. enterprise), fall back to Pro
    if (!mainPlans.find((p) => p.planId === plan)) return 'pro';
    return plan;
  }, [plan, isFreeUser, mainPlans]);
  const [stickyPlanId, setStickyPlanId] = useState<string>(defaultStickyPlanId);
  useEffect(() => { setStickyPlanId(defaultStickyPlanId); }, [defaultStickyPlanId]);

  // Sticky bar visibility — show after user scrolls past the comparison section
  const compareSectionRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);
  const [pastCompare, setPastCompare] = useState(false);
  const [atFinalCta, setAtFinalCta] = useState(false);

  useEffect(() => {
    const compareEl = compareSectionRef.current;
    const ctaEl = finalCtaRef.current;
    if (!compareEl) return;

    const compareObserver = new IntersectionObserver(
      ([entry]) => {
        // past = bottom of compare is above the viewport
        const rect = entry.boundingClientRect;
        setPastCompare(rect.bottom < window.innerHeight * 0.5);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    compareObserver.observe(compareEl);

    let ctaObserver: IntersectionObserver | null = null;
    if (ctaEl) {
      ctaObserver = new IntersectionObserver(
        ([entry]) => setAtFinalCta(entry.isIntersecting),
        { threshold: 0.1 }
      );
      ctaObserver.observe(ctaEl);
    }

    return () => {
      compareObserver.disconnect();
      ctaObserver?.disconnect();
    };
  }, []);

  const showStickyBar = pastCompare && !atFinalCta;

  // Hide the global StudioChat support widget while the sticky plan bar is visible
  useEffect(() => {
    if (showStickyBar) {
      document.body.setAttribute('data-hide-studio-chat', 'true');
    } else {
      document.body.removeAttribute('data-hide-studio-chat');
    }
    return () => {
      document.body.removeAttribute('data-hide-studio-chat');
    };
  }, [showStickyBar]);

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
    } finally {
      setLoading(false);
    }
  };

  const getPlanCta = (p: PricingPlan) => {
    const targetIdx = PLAN_ORDER.indexOf(p.planId);
    const isCurrent = p.planId === plan;
    if (isCurrent && subscriptionStatus === 'canceling') return { label: 'Reactivate', disabled: false, variant: 'default' as const };
    if (isCurrent) return { label: 'Current plan', disabled: true, variant: 'outline' as const };
    if (p.planId === 'free') return { label: 'Cancel plan', disabled: false, variant: 'outline' as const };
    if (targetIdx < currentIdx) return { label: `Downgrade`, disabled: false, variant: 'outline' as const };
    return { label: `Upgrade to ${p.name}`, disabled: false, variant: 'default' as const };
  };

  const handlePlanSelect = (p: PricingPlan) => {
    const targetIdx = PLAN_ORDER.indexOf(p.planId);
    const isCurrent = p.planId === plan;
    if (isCurrent && subscriptionStatus === 'canceling') setDialogMode('reactivate');
    else if (isCurrent) return;
    else if (p.planId === 'free') setDialogMode('cancel');
    else if (targetIdx > currentIdx) setDialogMode('upgrade');
    else setDialogMode('downgrade');
    setSelectedDialogPlan(p);
    setDialogOpen(true);
  };

  // ── Sticky bar derived state ──
  const stickyPlan = pricingPlans.find(p => p.planId === stickyPlanId);
  const stickyPrice = stickyPlan
    ? stickyPlan.planId === 'free'
      ? 0
      : isAnnual
        ? Math.round(stickyPlan.annualPrice / 12)
        : stickyPlan.monthlyPrice
    : 0;
  const stickyCredits = stickyPlan && typeof stickyPlan.credits === 'number' ? stickyPlan.credits : 0;
  const stickyIsCurrent = !!stickyPlan && stickyPlan.planId === plan && subscriptionStatus !== 'canceling';
  const stickyCta = stickyPlan
    ? stickyIsCurrent
      ? { label: 'Top up credits', disabled: false, variant: 'default' as const }
      : getPlanCta(stickyPlan)
    : null;
  const handleStickyCta = () => {
    if (!stickyPlan) return;
    if (stickyIsCurrent) setTopupOpen(true);
    else handlePlanSelect(stickyPlan);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24 space-y-14">
      <PageHeader
        title="Compare plans"
        subtitle="See every feature side-by-side and pick the plan that matches your output. Cancel anytime."
      >
        <></>
      </PageHeader>

      {/* ── Plans / Comparison ── */}
      <section ref={compareSectionRef} id="plans-section" className="space-y-5">
        {/* Billing toggle row */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">All plans · Cancel anytime</p>
          <BillingToggle isAnnual={isAnnual} onChange={setBillingPeriod} />
        </div>

        {/* ─ Desktop comparison table ─ */}
        <div className="hidden md:block rounded-2xl border border-border/50 overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border/50">
                  <th className="text-left px-5 py-5 align-bottom w-[28%]">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Plans
                    </span>
                  </th>
                  {mainPlans.map((p) => {
                    const isRec = p.planId === 'growth';
                    const isCurrent = p.planId === plan;
                    const isFree = p.planId === 'free';
                    const displayPrice = isAnnual ? Math.round(p.annualPrice / 12) : p.monthlyPrice;
                    const annualSavings = isAnnual && p.monthlyPrice > 0 ? (p.monthlyPrice * 12) - p.annualPrice : 0;
                    const credits = typeof p.credits === 'number' ? p.credits : 0;
                    const cta = getPlanCta(p);
                    return (
                      <th
                        key={p.planId}
                        className={`px-3 py-5 align-bottom min-w-[150px] relative ${isRec ? 'bg-primary/[0.04]' : ''}`}
                      >
                        {isRec && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" aria-hidden />}
                        <div className="flex flex-col items-center gap-2 text-center">
                          {isRec ? (
                            <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold whitespace-nowrap">
                              Recommended
                            </span>
                          ) : isCurrent ? (
                            <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold whitespace-nowrap">
                              Current
                            </span>
                          ) : (
                            <span className="h-[18px]" aria-hidden />
                          )}
                          <span className={`text-sm font-semibold ${isRec ? 'text-primary' : 'text-foreground'}`}>
                            {p.name}
                          </span>
                          <div className="flex flex-col items-center">
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-semibold tracking-tight text-foreground">
                                ${isFree ? 0 : displayPrice}
                              </span>
                              <span className="text-[11px] text-muted-foreground">/mo</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground/70 mt-0.5">
                              {credits > 0 ? `${credits.toLocaleString()} credits/mo` : 'trial credits'}
                            </span>
                            {isAnnual && annualSavings > 0 && (
                              <span className="text-[10px] text-primary font-semibold mt-0.5">Save ${annualSavings}/yr</span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant={cta.variant}
                            disabled={cta.disabled}
                            onClick={() => handlePlanSelect(p)}
                            className="w-full rounded-lg text-[11px] font-medium h-8 px-2"
                          >
                            {cta.label}
                          </Button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {FEATURE_MATRIX.map((group) => (
                  <Fragment key={group.title}>
                    <tr className="bg-muted/20 border-t border-border/40">
                      <td colSpan={mainPlans.length + 1} className="px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {group.title}
                      </td>
                    </tr>
                    {group.rows.map((row) => (
                      <tr key={row.label} className="border-t border-border/30 hover:bg-muted/10 transition-colors">
                        <td className="px-5 py-3 text-[13px] text-foreground/90">{row.label}</td>
                        {mainPlans.map((p) => {
                          const isRec = p.planId === 'growth';
                          return (
                            <td key={p.planId} className={`px-3 py-3 text-center ${isRec ? 'bg-primary/[0.04]' : ''}`}>
                              {renderCell(row.values[p.planId] ?? false)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </Fragment>
                ))}
                <tr className="border-t border-border/50 bg-muted/20">
                  <td className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Get started
                  </td>
                  {mainPlans.map((p) => {
                    const isRec = p.planId === 'growth';
                    const cta = getPlanCta(p);
                    return (
                      <td key={p.planId} className={`px-3 py-4 text-center ${isRec ? 'bg-primary/[0.04]' : ''}`}>
                        <Button
                          size="sm"
                          variant={cta.variant}
                          disabled={cta.disabled}
                          onClick={() => handlePlanSelect(p)}
                          className="w-full rounded-lg text-[11px] font-medium h-8 px-2"
                        >
                          {cta.label}
                        </Button>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ─ Mobile stacked plan cards ─ */}
        <div className="md:hidden space-y-3">
          {mainPlans.map((p) => {
            const isRec = p.planId === 'growth';
            const isCurrent = p.planId === plan;
            const isFree = p.planId === 'free';
            const displayPrice = isAnnual ? Math.round(p.annualPrice / 12) : p.monthlyPrice;
            const annualSavings = isAnnual && p.monthlyPrice > 0 ? (p.monthlyPrice * 12) - p.annualPrice : 0;
            const credits = typeof p.credits === 'number' ? p.credits : 0;
            const cta = getPlanCta(p);
            return (
              <div
                key={p.planId}
                className={`rounded-2xl border bg-card p-4 ${isRec ? 'border-primary/60 ring-1 ring-primary/20' : 'border-border/50'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold">{p.name}</span>
                      {isRec && (
                        <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold">
                          Recommended
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {credits > 0 ? `${credits.toLocaleString()} credits / month` : 'Trial credits'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-1 justify-end">
                      <span className="text-xl font-semibold">${isFree ? 0 : displayPrice}</span>
                      <span className="text-[11px] text-muted-foreground">/mo</span>
                    </div>
                    {isAnnual && annualSavings > 0 && (
                      <span className="text-[10px] text-primary font-medium">save ${annualSavings}/yr</span>
                    )}
                  </div>
                </div>

                <Button
                  variant={cta.variant}
                  disabled={cta.disabled}
                  onClick={() => handlePlanSelect(p)}
                  className="w-full mt-4 rounded-lg"
                >
                  {cta.label}
                </Button>

                <Collapsible>
                  <CollapsibleTrigger className="w-full flex items-center justify-between mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground hover:text-foreground transition-colors group">
                    <span>See all features</span>
                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    {FEATURE_MATRIX.map((group) => (
                      <div key={group.title} className="space-y-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{group.title}</p>
                        <ul className="space-y-1.5">
                          {group.rows.map((row) => {
                            const v = row.values[p.planId] ?? false;
                            return (
                              <li key={row.label} className="flex items-start gap-2 text-[13px]">
                                {v === true ? (
                                  <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                                ) : v === false ? (
                                  <Minus className="w-3.5 h-3.5 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                                )}
                                <span className={v === false ? 'text-muted-foreground/60' : 'text-foreground/90'}>
                                  {row.label}
                                  {typeof v === 'string' && <span className="text-muted-foreground"> · {v}</span>}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            );
          })}
        </div>

        {/* Trust block */}
        <div className="flex flex-col gap-1.5 pt-1 px-1">
          <p className="text-[13px] text-muted-foreground">Cancel anytime · No commitment</p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
            <Lock className="w-3 h-3" />
            <span>You'll be securely redirected to complete checkout</span>
          </p>
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
      <section className="space-y-10">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">How credits work</h2>
          <p className="text-sm text-muted-foreground">One simple currency powers everything you create.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {[
            { icon: Image, title: 'Generate images', desc: '4–6 credits per image depending on the workflow — product, lifestyle, editorial, or on-model.' },
            { icon: Video, title: 'Video & upscaling', desc: 'Use credits for video generation, 2K and 4K upscaling, and Brand Model training.' },
            { icon: RefreshCw, title: 'Monthly refresh', desc: 'Credits refresh every billing cycle. Higher plans unlock better per-credit value and faster queues.' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border/50 bg-card p-7 sm:p-8 space-y-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold tracking-tight">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="space-y-8 max-w-3xl mx-auto w-full">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Questions, answered</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {FAQS.map((faq, i) => (
            <AccordionItem
              key={faq.q}
              value={`faq-${i}`}
              className="rounded-2xl border border-border/50 bg-card px-2 border-b"
            >
              <AccordionTrigger className="text-base font-medium py-5 px-4 hover:no-underline text-left">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 px-4 text-[15px] leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* ── Final CTA strip ── */}
      <section ref={finalCtaRef} className="rounded-2xl border border-border/50 bg-card p-8 sm:p-10 text-center space-y-5">
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
            <Button
              onClick={() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="rounded-xl min-h-[44px] gap-2"
            >
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

      {/* ── Sticky plan-selector bar ── */}
      {stickyPlan && stickyCta && (
        <div
          aria-hidden={!showStickyBar}
          className={cn(
            "sticky bottom-4 z-30 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
            showStickyBar
              ? "translate-y-0 opacity-100 pointer-events-auto"
              : "translate-y-[calc(100%+2rem)] opacity-0 pointer-events-none"
          )}
        >
          <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm shadow-lg pointer-events-auto">
            {/* Mobile layout */}
            <div className="flex items-center justify-between gap-3 p-3 sm:hidden">
              <div className="flex flex-col min-w-0 flex-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Selected plan</label>
                <div className="flex items-center gap-1.5 min-w-0">
                  {stickyPlanId === 'growth' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" aria-hidden />
                  )}
                  <PlanPickerPopover
                    plans={mainPlans}
                    selectedId={stickyPlanId}
                    onSelect={setStickyPlanId}
                    isAnnual={isAnnual}
                  />
                </div>
                <span className="text-[13px] text-foreground/80 font-medium mt-0.5 truncate">
                  <span className="font-semibold text-foreground">${stickyPrice}/mo</span>
                  {stickyCredits > 0 && <span className="text-foreground/70"> · {stickyCredits.toLocaleString()} credits</span>}
                  {stickyPlanId === 'growth' && <span className="text-primary font-semibold"> · Best value</span>}
                </span>
              </div>
              <Button
                size="sm"
                disabled={stickyCta.disabled}
                onClick={handleStickyCta}
                className="gap-1.5 flex-shrink-0 h-9"
              >
                {(() => {
                  const label = stickyCta.label;
                  if (label === 'Continue with Growth') return 'Get Growth';
                  if (label.startsWith('Upgrade to ')) return 'Upgrade';
                  if (label.startsWith('Choose ')) return 'Choose';
                  return label;
                })()}
                {!stickyCta.disabled && <ArrowRight className="w-3.5 h-3.5" />}
              </Button>
            </div>

            {/* Desktop layout */}
            <div className="hidden sm:flex items-center justify-between gap-4 p-4">
              <div className="flex flex-col min-w-0">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Selected plan</label>
                <div className="flex items-center gap-2">
                  <PlanPickerPopover
                    plans={mainPlans}
                    selectedId={stickyPlanId}
                    onSelect={setStickyPlanId}
                    isAnnual={isAnnual}
                  />
                  {stickyPlanId === 'growth' && (
                    <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">Recommended</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-base font-semibold text-foreground">${stickyPrice}/mo</span>
                {stickyCredits > 0 && <span className="text-[13px] text-muted-foreground">{stickyCredits.toLocaleString()} credits/mo</span>}
              </div>
              <Button
                disabled={stickyCta.disabled}
                onClick={handleStickyCta}
                className="gap-1.5 flex-shrink-0"
              >
                {stickyCta.label}
                {!stickyCta.disabled && <ArrowRight className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      <PlanChangeDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setLoading(false); }}
        onConfirm={handleDialogConfirm}
        mode={dialogMode}
        targetPlan={selectedDialogPlan || undefined}
        currentPlanName={planConfig?.name || 'Free'}
        isAnnual={isAnnual}
        currentBalance={balance}
        periodEnd={currentPeriodEnd ? currentPeriodEnd.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : undefined}
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
