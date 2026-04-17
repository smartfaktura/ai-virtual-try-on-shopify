import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  if (val === false) return <Minus className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
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
    <section id="pricing" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Start free. Automate as you grow. Content Calendar included on Growth and above.
          </p>

          <div className="inline-flex items-center p-1 rounded-full bg-muted">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                !annual ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                annual ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Annual
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
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
                className={`relative rounded-2xl border bg-card p-6 flex flex-col ${
                  isCurrentPlan
                    ? 'border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20'
                    : plan.highlighted && !user
                      ? 'border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20'
                      : 'border-border'
                }`}
              >
                {isCurrentPlan ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                    Current Plan
                  </span>
                ) : plan.badge && !user ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                    {plan.badge}
                  </span>
                ) : null}

                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                    {isCurrentPlan && subscriptionStatus === 'canceling' && (
                      <Badge variant="destructive" className="text-[10px]">Canceling</Badge>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="text-4xl font-extrabold text-foreground">${price}</span>
                    <span className="text-muted-foreground text-sm">/mo</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {typeof plan.credits === 'number'
                      ? `${plan.credits.toLocaleString()} credits/month`
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
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
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

                <Button
                  variant={
                    user
                      ? (isCurrentPlan ? 'secondary' : isHigher ? 'default' : 'outline')
                      : (plan.highlighted ? 'default' : 'outline')
                  }
                  className="rounded-full font-semibold w-full gap-2"
                  disabled={isDisabled}
                  onClick={() => navigate(ctaRoute)}
                >
                  {ctaLabel}
                  {!isDisabled && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            );
          })}
        </div>

        {/* ── Trust microcopy ────────────────────────────────────── */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Cancel anytime · No commitment · Secure checkout
        </p>

        {/* ── Compare every feature ──────────────────────────────── */}
        <div className="mt-20 max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-3">
              Compare every feature
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every plan, side-by-side. Pick the one that matches your output.
            </p>
          </div>

          {/* Desktop table */}
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
                      const isFree = p.planId === 'free';
                      const displayPrice = annual ? Math.round(p.annualPrice / 12) : p.monthlyPrice;
                      const annualSavings = annual && p.monthlyPrice > 0 ? (p.monthlyPrice * 12) - p.annualPrice : 0;
                      const credits = typeof p.credits === 'number' ? p.credits : 0;
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
                              {annual && annualSavings > 0 && (
                                <span className="text-[10px] text-primary font-semibold mt-0.5">Save ${annualSavings}/yr</span>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant={isRec ? 'default' : 'outline'}
                              onClick={() => navigate(user ? '/app/settings' : '/auth')}
                              className="w-full rounded-lg text-[11px] font-medium h-8 px-2"
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
                    </div>
                  </div>

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
                                  {v === false ? (
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
        </div>

        {/* ── Team Comparison ────────────────────────────────────── */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-3">
              One platform replaces your entire creative team
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Stop hiring photographers, renting studios, and booking models. VOVV.AI handles it all.
            </p>
          </div>

          <div className="rounded-2xl border border-border overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="px-5 py-3">Role</div>
              <div className="px-5 py-3 text-center">Traditional</div>
              <div className="px-5 py-3 text-center text-primary">VOVV.AI</div>
            </div>
            {TEAM_COMPARISON.map((row, i) => (
              <div
                key={row.role}
                className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? 'bg-card' : 'bg-muted/20'} border-t border-border/50`}
              >
                <div className="px-5 py-3.5 font-medium text-foreground">{row.role}</div>
                <div className="px-5 py-3.5 text-center text-muted-foreground flex items-center justify-center gap-1.5">
                  <X className="w-3.5 h-3.5 text-destructive/60 shrink-0" />
                  {row.traditional}
                </div>
                <div className="px-5 py-3.5 text-center font-medium text-primary flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  {row.vovv}
                </div>
              </div>
            ))}
            {/* Total */}
            <div className="grid grid-cols-3 border-t-2 border-border bg-muted/30 font-semibold text-sm">
              <div className="px-5 py-4 text-foreground">Total per shoot</div>
              <div className="px-5 py-4 text-center text-muted-foreground">$4,500–22,000+</div>
              <div className="px-5 py-4 text-center text-primary text-base font-bold">From $0/mo</div>
            </div>
          </div>
        </div>

        {/* ── Platform Features Grid ─────────────────────────────── */}
        <div className="mt-24 max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-3">
              Everything you get with VOVV.AI
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete visual production studio — photography, video, editing, and brand management in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLATFORM_FEATURES.map((feat) => (
              <div
                key={feat.title}
                className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <feat.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{feat.title}</h3>
                <p className="text-[12px] leading-relaxed text-muted-foreground">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Cost Comparison ────────────────────────────────────── */}
        <div className="mt-24 max-w-4xl mx-auto">
          <CompetitorComparison />
        </div>

        {/* ── How Credits Work ───────────────────────────────────── */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-3">
              How credits work
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              One simple currency for every creative tool on the platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CREDIT_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-border bg-card p-5 text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <card.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{card.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <div className="mt-24 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-3">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-2">
            {FAQS.map((faq, idx) => (
              <Collapsible key={idx}>
                <CollapsibleTrigger className="flex items-center justify-between w-full rounded-xl border border-border bg-card px-5 py-4 text-left text-sm font-semibold text-foreground hover:bg-muted/40 transition-colors group">
                  {faq.q}
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-5 pb-4 pt-1 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>

        {/* ── Start Free CTA ─────────────────────────────────────── */}
        <div className="mt-20 max-w-2xl mx-auto text-center rounded-2xl border border-primary/20 bg-primary/[0.04] p-8 sm:p-10">
          <h3 className="text-xl font-bold text-foreground mb-2">
            Start with 20 free credits
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            No credit card required. Try every Visual Type and see the quality before committing to a plan.
          </p>
          <Button
            className="rounded-full font-semibold px-8 gap-2"
            onClick={() => navigate(user ? '/app' : '/auth')}
          >
            {user ? 'Go to Studio' : 'Get Started Free'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* ── Enterprise Banner ───────────────────────────────────── */}
        {enterprisePlan && (
          <div className="mt-10 max-w-6xl mx-auto rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{enterprisePlan.name}</h3>
                  <p className="text-sm text-muted-foreground">Custom pricing for large teams</p>
                </div>
              </div>

              <ul className="flex-1 flex flex-wrap gap-x-6 gap-y-2">
                {enterprisePlan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    {typeof feature === 'string' ? feature : feature.text}
                  </li>
                ))}
              </ul>

              <Button
                variant="outline"
                className="rounded-full font-semibold gap-2 shrink-0"
                onClick={() => navigate('/contact')}
              >
                Contact Sales
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
