import { Fragment, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';
import {
  Check, ArrowRight, Building2, X, Minus,
  Layers, Users, Sparkles, Film, ZoomIn, RefreshCw,
  ScanLine, Wand2, Paintbrush, Palette, FolderOpen, Download,
  Image, Video, Clock,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { pricingPlans } from '@/data/mockData';
import { CompetitorComparison } from '@/components/app/CompetitorComparison';

const PLAN_ORDER = ['free', 'starter', 'growth', 'pro'];

// ── Feature comparison matrix (mirrors /app/pricing) ──
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
    title: 'Brand & studio',
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

function renderCell(val: Cell) {
  if (val === true) return <Check className="w-4 h-4 text-primary mx-auto" strokeWidth={2.5} />;
  if (val === false) return <Minus className="w-3.5 h-3.5 text-muted-foreground/30 mx-auto" />;
  return <span className="text-xs font-medium text-foreground">{val}</span>;
}

/* ── Data ────────────────────────────────────────────────────────── */

const TEAM_COMPARISON = [
  { role: 'Product Photographer', traditional: '$500–2,000/day', vovv: 'Included' },
  { role: 'Photo Studio Rental', traditional: '$200–800/day', vovv: 'Included' },
  { role: 'Styling & Props', traditional: '$300–1,000/shoot', vovv: 'Included' },
  { role: 'Models & Talent', traditional: '$500–3,000/day', vovv: 'AI Models included' },
  { role: 'Photo Retouching', traditional: '$5–25/image', vovv: 'Automatic' },
  { role: 'Social Media Content', traditional: '$1,000–5,000/mo', vovv: 'Included' },
  { role: 'Videography', traditional: '$2,000–10,000/project', vovv: 'Included' },
];

const PLATFORM_FEATURES = [
  { icon: Layers, title: '1,000+ Scenes', desc: 'Editorial, lifestyle, studio, seasonal, and custom scenes for every product category.' },
  { icon: Users, title: 'AI Models', desc: 'Virtual models with consistent identity, diverse body types, and professional poses.' },
  { icon: Sparkles, title: 'Brand Models', desc: 'Train custom AI models on your brand aesthetic for on-brand consistency. Growth+ plans.' },
  { icon: Film, title: 'Video Generation', desc: 'Product videos, ad sequences, and short films powered by AI cinematography.' },
  { icon: ZoomIn, title: '4K Upscaling', desc: 'Upscale any generation to print-ready 4K resolution with zero quality loss.' },
  { icon: RefreshCw, title: 'Bulk Generation', desc: 'Generate hundreds of images in one batch across multiple products and scenes.' },
  { icon: ScanLine, title: 'Multi-Angle Shots', desc: 'Front, back, side, and detail perspectives from a single product photo.' },
  { icon: Wand2, title: 'Freestyle Studio', desc: 'Create anything with custom prompts — full creative control over every detail.' },
  { icon: Paintbrush, title: 'Image Editing', desc: 'AI-powered retouching, background swap, and intelligent object removal.' },
  { icon: Palette, title: 'Brand Profiles', desc: 'Save brand colors, tone, typography, and style preferences for consistency.' },
  { icon: FolderOpen, title: 'Product Library', desc: 'Organize unlimited products with multi-angle references and metadata.' },
  { icon: Download, title: 'Export & Download', desc: 'ZIP bulk downloads, individual high-res files, and direct sharing links.' },
];

const CREDIT_CARDS = [
  { icon: Image, title: 'Images', detail: '5 credits per image on average. Visual Types cost 6, Freestyle costs 4.' },
  { icon: Video, title: 'Video & Upscale', detail: 'Short films and 4K upscaling deducted from the same credit pool.' },
  { icon: Clock, title: 'Monthly Refresh', detail: "Credits reset each billing cycle. Unused credits don't roll over. Top-ups never expire." },
];

const FAQS = [
  { q: 'What can I create with VOVV.AI?', a: 'Product photography, virtual try-ons, lifestyle imagery, flat lays, interior staging, videos, and more — all from a single product photo.' },
  { q: 'Do I need photography experience?', a: 'Not at all. Choose a scene, upload your product, and the AI handles lighting, composition, and styling automatically.' },
  { q: 'How many credits does each generation cost?', a: 'A standard image is ~4–6 credits depending on complexity. Video runs 30–60 credits per clip. 4K upscaling is ~5 credits. Brand Model training is a one-time ~50 credits. You always see the cost before you generate.' },
  { q: 'Is there a free trial?', a: "Every new account gets 20 free credits — no credit card required. That's enough to try multiple Visual Types and see the quality." },
  { q: 'What image formats and sizes are supported?', a: 'We support all common aspect ratios (1:1, 4:5, 16:9, 9:16) and output high-resolution images suitable for e-commerce, social media, ads, and print.' },
  { q: 'Can I cancel my subscription anytime?', a: "Absolutely. Cancel, upgrade, or downgrade at any time — no contracts or fees. Unused monthly credits don't roll over, but top-up credits never expire." },
  { q: 'How does Brand Profile work?', a: 'Set your preferred tone, lighting, background, and composition rules. Every future generation uses this profile automatically so visuals stay on-brand.' },
  { q: 'What is the Content Calendar?', a: 'The Content Calendar automates recurring visual runs. Pick products and Visual Types, set a schedule, and fresh visuals arrive on autopilot. Growth+ plans.' },
];

/* ── Component ───────────────────────────────────────────────────── */

export function LandingPricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plan: currentPlan, subscriptionStatus } = useCredits();
  const [annual, setAnnual] = useState(false);

  const currentPlanIndex = PLAN_ORDER.indexOf(currentPlan);
  const mainPlans = pricingPlans.filter((p) => !p.isEnterprise);
  const enterprisePlan = pricingPlans.find((p) => p.isEnterprise);

  return (
    <>
    {/* ═══ BAND 1 · Hero + Pricing cards (off-white) ═══ */}
    <section id="pricing" className="bg-[#FAFAF8] pt-24 sm:pt-28 lg:pt-32 pb-20 lg:pb-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Pricing
          </p>
          <h1 className="text-foreground text-[2.5rem] sm:text-5xl lg:text-[3.75rem] leading-[1.08] font-semibold tracking-[-0.03em] mb-6">
            Simple pricing.
            <br />
            <span className="text-[#4a5578]">Real production output.</span>
          </h1>
          <p className="mx-auto max-w-xl text-muted-foreground text-lg leading-relaxed mb-10">
            Start free. Scale when you're ready. Every plan unlocks the full visual library.
          </p>

          <div className="inline-flex items-center p-1 rounded-full bg-white border border-[#f0efed] shadow-[0_1px_3px_hsl(var(--primary)/0.05)]">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                !annual ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                annual ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${annual ? 'bg-white text-primary' : 'bg-primary text-primary-foreground'}`}>
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* ── Plan Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {mainPlans.map((plan) => {
            const price = annual ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;
            const planIndex = PLAN_ORDER.indexOf(plan.planId);
            const isCurrentPlan = !!user && plan.planId === currentPlan;
            const isHigher = !!user && planIndex > currentPlanIndex;
            const isLower = !!user && planIndex < currentPlanIndex && planIndex >= 0;
            const isDisabled = isCurrentPlan && subscriptionStatus !== 'canceling';

            let ctaLabel = plan.ctaText;
            let ctaRoute = user ? '/app' : '/auth';
            if (user) {
              if (isCurrentPlan) {
                ctaLabel = subscriptionStatus === 'canceling' ? 'Reactivate Plan' : 'Current Plan';
                ctaRoute = '/app/settings';
              } else if (isHigher) {
                ctaLabel = `Upgrade to ${plan.name}`;
                ctaRoute = '/app/settings';
              } else if (isLower) {
                ctaLabel = `Downgrade to ${plan.name}`;
                ctaRoute = '/app/settings';
              }
            }

            return (
              <div
                key={plan.planId}
                className={`relative rounded-2xl border bg-white p-7 flex flex-col transition-shadow ${
                  isCurrentPlan
                    ? 'border-primary/20 ring-1 ring-primary/10 shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.18)]'
                    : plan.highlighted && !user
                      ? 'border-primary/20 ring-1 ring-primary/10 shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.18)]'
                      : 'border-[#f0efed] hover:shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.12)]'
                }`}
              >
                {isCurrentPlan ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-semibold px-4 py-1 rounded-full">
                    Current Plan
                  </span>
                ) : plan.badge && !user ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-semibold px-4 py-1 rounded-full">
                    {plan.badge}
                  </span>
                ) : null}

                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-foreground text-base font-semibold">{plan.name}</h3>
                    {isCurrentPlan && subscriptionStatus === 'canceling' && (
                      <Badge variant="destructive" className="text-[10px]">Canceling</Badge>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-foreground text-[2.75rem] font-semibold tracking-[-0.02em] leading-none">${price}</span>
                    <span className="text-muted-foreground text-sm">/mo</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {typeof plan.credits === 'number'
                      ? `${plan.credits.toLocaleString()} credits / month`
                      : 'Unlimited visuals'}
                  </p>
                  {typeof plan.credits === 'number' && (
                    <>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                        ≈ {Math.round(plan.credits / 5)} images
                      </p>
                      {price > 0 && plan.credits > 0 && (
                        <p className="text-[10px] text-primary/70 font-medium mt-0.5">
                          ${(price / plan.credits).toFixed(3)} per credit
                        </p>
                      )}
                    </>
                  )}
                </div>

                <ul className="flex-1 space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-foreground/75">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
                      {typeof feature === 'string' ? feature : (
                        <span className="inline-flex items-center gap-1.5">
                          {feature.text}
                          {feature.badge && (
                            <Badge className="text-[9px] px-1.5 py-0 leading-tight bg-primary text-primary-foreground">
                              {feature.badge}
                            </Badge>
                          )}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                {(() => {
                  const usePrimary = user
                    ? (!isCurrentPlan && (isHigher || (!isHigher && !isLower)))
                    : plan.highlighted;
                  if (isDisabled) {
                    return (
                      <button
                        disabled
                        className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-full border border-[#f0efed] bg-[#f5f5f3] text-[#6b7280] text-sm font-medium w-full cursor-not-allowed"
                      >
                        {ctaLabel}
                      </button>
                    );
                  }
                  return (
                    <Link
                      to={ctaRoute}
                      className={`inline-flex items-center justify-center gap-2 h-12 px-5 rounded-full text-sm font-semibold w-full transition-colors ${
                        usePrimary
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'border border-[#d4d4d4] text-foreground hover:bg-[#f5f5f3]'
                      }`}
                    >
                      {ctaLabel}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  );
                })()}
              </div>
            );
          })}
        </div>

        {/* ── Trust microcopy ────────────────────────────────────── */}
        <p className="mt-8 text-center text-[11px] tracking-[0.12em] uppercase text-muted-foreground/60 font-medium">
          Cancel anytime · No commitment · Secure checkout
        </p>

      </div>
    </section>

    {/* ═══ BAND 2 · Compare every feature (white) ═══ */}
    <section className="bg-white py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Compare plans
          </p>
          <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] mb-4">
            Compare every feature
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            Every plan, side-by-side. Pick the one that matches your output.
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block rounded-2xl border border-[#eceae6] overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="bg-white border-b border-[#eceae6]">
                  <th className="text-left px-5 py-5 align-bottom w-[28%]">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Plans
                    </span>
                  </th>
                  {mainPlans.map((p) => {
                    const isRec = p.planId === 'growth';
                    const isFree = p.planId === 'free';
                    const displayPrice = annual ? Math.round(p.annualPrice / 12) : p.monthlyPrice;
                    const annualSavings = annual && p.monthlyPrice > 0 ? (p.monthlyPrice * 12) - p.annualPrice : 0;
                    const credits = typeof p.credits === 'number' ? p.credits : 0;
                    return (
                      <th
                        key={p.planId}
                        className={`px-3 py-5 align-bottom min-w-[150px] relative ${isRec ? 'bg-primary/[0.025]' : ''}`}
                      >
                        {isRec && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" aria-hidden />}
                        <div className="flex flex-col items-center gap-2 text-center">
                          {isRec ? (
                            <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold whitespace-nowrap">
                              Recommended
                            </span>
                          ) : (
                            <span className="h-[18px]" aria-hidden />
                          )}
                          <span className="text-sm font-semibold text-foreground">
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
                            {annual && annualSavings > 0 && (
                              <span className="text-[10px] text-primary font-semibold mt-0.5">Save ${annualSavings}/yr</span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant={isRec ? 'default' : 'outline'}
                            onClick={() => navigate(user ? '/app/settings' : '/auth')}
                            className="w-full text-[11px] font-medium h-8 px-2"
                          >
                            {isFree ? 'Start Free' : `Get ${p.name}`}
                          </Button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {FEATURE_MATRIX.map((group, gi) => (
                  <Fragment key={group.title}>
                    <tr className={gi === 0 ? '' : 'border-t border-[#eceae6]'}>
                      <td colSpan={mainPlans.length + 1} className="px-5 pt-5 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
                        {group.title}
                      </td>
                    </tr>
                    {group.rows.map((row) => (
                      <tr key={row.label} className="border-t border-[#f3f1ed]">
                        <td className="px-5 py-3 text-[13px] text-foreground/85">{row.label}</td>
                        {mainPlans.map((p) => {
                          const isRec = p.planId === 'growth';
                          return (
                            <td key={p.planId} className={`px-3 py-3 text-center ${isRec ? 'bg-primary/[0.025]' : ''}`}>
                              {renderCell(row.values[p.planId] ?? false)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile collapsible feature lists per plan */}
        <div className="md:hidden space-y-3">
          {mainPlans.map((p) => {
            const isRec = p.planId === 'growth';
            const isFree = p.planId === 'free';
            const displayPrice = annual ? Math.round(p.annualPrice / 12) : p.monthlyPrice;
            const credits = typeof p.credits === 'number' ? p.credits : 0;
            return (
              <div
                key={p.planId}
                className={`rounded-2xl border bg-card p-4 ${isRec ? 'border-primary/25 ring-1 ring-primary/10' : 'border-[#f0efed]'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-foreground">{p.name}</span>
                      {isRec && (
                        <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {credits > 0 ? `${credits.toLocaleString()} credits / month` : 'Trial credits'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-1 justify-end">
                      <span className="text-xl font-semibold text-foreground">${isFree ? 0 : displayPrice}</span>
                      <span className="text-[11px] text-muted-foreground">/mo</span>
                    </div>
                  </div>
                </div>

                <Collapsible>
                  <CollapsibleTrigger className="w-full flex items-center justify-between mt-3 pt-3 border-t border-[#f0efed] text-xs text-muted-foreground hover:text-foreground transition-colors group">
                    <span>See all features</span>
                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    {FEATURE_MATRIX.map((group) => (
                      <div key={group.title} className="space-y-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{group.title}</p>
                        <ul className="space-y-1.5">
                          {group.rows.map((row) => {
                            const v = row.values[p.planId] ?? false;
                            return (
                              <li key={row.label} className="flex items-start gap-2 text-[13px]">
                                {v === false ? (
                                  <Minus className="w-3.5 h-3.5 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-foreground mt-0.5 flex-shrink-0" strokeWidth={2.5} />
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
      </div>
    </section>

    {/* ═══ BAND 3 · Replaces a studio + Platform features (off-white) ═══ */}
    <section className="bg-[#FAFAF8] py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Replaces a studio ──────────────────────────────────── */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Replaces a studio
            </p>
            <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] mb-4">
              One platform replaces your entire creative team
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
              Stop hiring photographers, renting studios, and booking models. VOVV.AI handles it all.
            </p>
          </div>

          <div className="rounded-2xl border border-[#eceae6] overflow-hidden bg-white">
            {/* Header */}
            <div className="grid grid-cols-3 bg-white text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground border-b border-[#eceae6]">
              <div className="px-5 py-3.5">Role</div>
              <div className="px-5 py-3.5 text-center">Traditional</div>
              <div className="px-5 py-3.5 text-center text-primary">VOVV.AI</div>
            </div>
            {TEAM_COMPARISON.map((row) => (
              <div
                key={row.role}
                className="grid grid-cols-3 text-sm bg-white border-t border-[#f3f1ed]"
              >
                <div className="px-5 py-3.5 font-medium text-foreground">{row.role}</div>
                <div className="px-5 py-3.5 text-center text-muted-foreground flex items-center justify-center gap-1.5">
                  <X className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                  {row.traditional}
                </div>
                <div className="px-5 py-3.5 text-center font-medium text-foreground flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={2.5} />
                  {row.vovv}
                </div>
              </div>
            ))}
            {/* Total */}
            <div className="grid grid-cols-3 border-t border-[#eceae6] bg-primary/[0.04] font-semibold text-sm">
              <div className="px-5 py-4 text-foreground">Total per shoot</div>
              <div className="px-5 py-4 text-center text-muted-foreground">$4,500–22,000+</div>
              <div className="px-5 py-4 text-center text-primary text-base font-semibold">From $0/mo</div>
            </div>
          </div>
        </div>

        {/* ── Platform Features Grid ─────────────────────────────── */}
        <div className="mt-20 lg:mt-28">
          <div className="text-center mb-12 lg:mb-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
              The platform
            </p>
            <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] mb-4">
              Everything you get with VOVV.AI
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
              A complete visual production studio — photography, video, editing, and brand management in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLATFORM_FEATURES.map((feat) => (
              <div
                key={feat.title}
                className="rounded-2xl border border-[#f0efed] bg-white p-6 transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(26,26,46,0.10)]"
              >
                <div className="w-9 h-9 rounded-xl bg-foreground/[0.06] flex items-center justify-center mb-4">
                  <feat.icon className="w-4 h-4 text-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1.5">{feat.title}</h3>
                <p className="text-[12.5px] leading-relaxed text-muted-foreground">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>

    {/* ═══ BAND 4 · Cost comparison + How credits work (white) ═══ */}
    <section className="bg-white py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Cost Comparison ────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto">
          <CompetitorComparison />
        </div>

        {/* ── How Credits Work ───────────────────────────────────── */}
        <div className="mt-20 lg:mt-28">
          <div className="text-center mb-12 lg:mb-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Credits
            </p>
            <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] mb-4">
              How credits work
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
              One simple currency for every creative tool on the platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {CREDIT_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-[#f0efed] bg-[#FAFAF8] p-6 text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-foreground/[0.06] flex items-center justify-center mx-auto mb-4">
                  <card.icon className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1.5">{card.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>

    {/* ═══ BAND 5 · FAQ (off-white) ═══ */}
    <section className="bg-[#FAFAF8] py-20 lg:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            FAQ
          </p>
          <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] mb-4">
            Pricing questions, answered
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            The most common questions about plans, credits, and billing.
          </p>
        </div>

        <Accordion type="single" collapsible className="flex flex-col gap-3">
          {FAQS.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`faq-${idx}`}
              className="border border-[#f0efed] bg-white rounded-2xl px-5 sm:px-6"
            >
              <AccordionTrigger className="text-left text-foreground text-base font-semibold py-5 hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-8 text-center">
          <Link
            to="/faq"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-foreground/70 transition-colors"
          >
            See all FAQs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>

    {/* ═══ BAND 6 · Enterprise (off-white, contained) ═══ */}
    {enterprisePlan && (
      <section className="bg-[#FAFAF8] pt-20 lg:pt-28 pb-16 lg:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#eceae6] bg-white p-7 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-11 h-11 rounded-xl bg-primary/[0.08] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground text-lg font-semibold">{enterprisePlan.name}</h3>
                  <p className="text-sm text-muted-foreground">Custom pricing for large teams</p>
                </div>
              </div>

              <ul className="flex-1 flex flex-wrap gap-x-6 gap-y-2">
                {enterprisePlan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-foreground/80">
                    <Check className="w-4 h-4 text-primary shrink-0" strokeWidth={2.5} />
                    {typeof feature === 'string' ? feature : feature.text}
                  </li>
                ))}
              </ul>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-[#d4d4d4] text-foreground text-sm font-semibold hover:bg-[#f5f5f3] transition-colors shrink-0"
              >
                Contact sales
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    )}

    {/* ═══ BAND 7 · Start Free CTA · full-bleed crescendo ═══ */}
    <section className="bg-primary py-24 sm:py-28 lg:py-36 text-center">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground/50 mb-5">
          Get started
        </p>
        <h3 className="text-primary-foreground text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold tracking-[-0.025em] leading-[1.05] mb-5">
          Start with 20 free credits
        </h3>
        <p className="text-primary-foreground/65 text-base sm:text-lg leading-relaxed mb-10 max-w-lg mx-auto">
          No credit card required. Try every Visual Type and see the quality before committing to a plan.
        </p>
        <Link
          to={user ? '/app' : '/auth'}
          className="inline-flex items-center justify-center gap-2 h-[3.5rem] px-9 rounded-full bg-white text-primary text-base font-semibold shadow-[0_10px_40px_-10px_rgba(0,0,0,0.35)] hover:bg-white/95 hover:-translate-y-px transition-all"
        >
          {user ? 'Open Visual Studio' : 'Get started free'}
          <ArrowRight size={16} />
        </Link>
        <p className="mt-6 text-[11px] tracking-[0.12em] uppercase text-primary-foreground/40 font-medium">
          Cancel anytime · No commitment
        </p>
      </div>
    </section>
    </>
  );
}
