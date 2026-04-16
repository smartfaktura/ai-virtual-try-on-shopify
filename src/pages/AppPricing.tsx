import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Check, ChevronDown, ArrowUpRight, Loader2,
  Image, Video, ZoomIn, RefreshCw, Layers, Palette, Sparkles, Shield,
  Camera, Users, Film, Wand2, FolderOpen, Download, ScanLine, Paintbrush, BookOpen,
  DollarSign, Clock, UserX
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { pricingPlans } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { PlanChangeDialog, type PlanChangeMode } from '@/components/app/PlanChangeDialog';
import { CompetitorComparison } from '@/components/app/CompetitorComparison';
import { toast } from '@/lib/brandedToast';
import type { PricingPlan } from '@/types';

const PLAN_ORDER = ['free', 'starter', 'growth', 'pro', 'enterprise'];

const VALUE_ROWS = [
  { planId: 'starter', name: 'Starter', credits: '500', images: '~100', ppc: '$0.078' },
  { planId: 'growth', name: 'Growth', credits: '1,500', images: '~300', ppc: '$0.053' },
  { planId: 'pro', name: 'Pro', credits: '4,500', images: '~900', ppc: '$0.040' },
];

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

export default function AppPricing() {
  const { plan, subscriptionStatus, startCheckout, openCustomerPortal } = useCredits();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<PlanChangeMode>('upgrade');
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const isAnnual = billingPeriod === 'annual';
  const isMobile = useIsMobile();
  const mainPlans = pricingPlans.filter(p => !p.isEnterprise);

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
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 pb-16 space-y-24">

      {/* ── Hero Header ── */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Your complete visual production studio
        </h1>
        <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Replace photographers, stylists, studios, and videographers with one AI-powered platform. Professional product visuals in minutes, not weeks.
        </p>

        {/* Billing toggle */}
        <div className="flex justify-center pt-4">
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
      </div>

      {/* ── Plan Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                  ? 'border-2 border-primary ring-1 ring-primary/10 bg-card shadow-sm'
                  : p.highlighted && targetIdx > currentIdx
                    ? 'border-2 border-primary/60 bg-card shadow-md'
                    : 'border border-border bg-card shadow-sm hover:shadow-md'
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

      {/* ── Team Replacement Comparison ── */}
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            One platform replaces your entire creative team
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Stop paying for photographers, studios, models, and retouchers separately. VOVV.AI handles it all.
          </p>
        </div>

        <div className="rounded-2xl border border-border overflow-hidden shadow-sm">
          {/* Table header */}
          <div className="grid grid-cols-3 bg-muted/50 px-4 sm:px-6 py-3">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Role</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Traditional Cost</span>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider text-right">VOVV.AI</span>
          </div>
          {/* Table rows */}
          {TEAM_COMPARISON.map((row, i) => (
            <div
              key={row.role}
              className={`grid grid-cols-3 px-4 sm:px-6 py-3.5 border-t border-border/50 ${
                i % 2 === 0 ? 'bg-card' : 'bg-muted/20'
              }`}
            >
              <span className="text-sm font-medium text-foreground">{row.role}</span>
              <span className="text-sm text-muted-foreground text-center line-through decoration-muted-foreground/40">{row.traditional}</span>
              <span className="text-sm font-medium text-primary text-right">{row.vovv}</span>
            </div>
          ))}
          {/* Total row */}
          <div className="grid grid-cols-3 px-4 sm:px-6 py-4 border-t-2 border-border bg-muted/30">
            <span className="text-sm font-bold text-foreground">Total per shoot</span>
            <span className="text-sm font-bold text-muted-foreground text-center line-through decoration-muted-foreground/40">$4,500–22,000+</span>
            <span className="text-sm font-bold text-primary text-right">From $0/mo</span>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground/60 text-center max-w-lg mx-auto">
          Based on average US market rates for professional product photography and content creation services.
        </p>
      </div>

      {/* ── Everything You Get — Platform Features ── */}
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Everything you get with VOVV.AI
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            A complete visual production toolkit — from AI photography to video creation, all in one platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PLATFORM_FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="rounded-xl border border-border bg-card p-5 space-y-2.5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <feat.icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold tracking-tight">{feat.title}</h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Cost Comparison (existing) ── */}
      <CompetitorComparison />

      {/* ── How Credits Work ── */}
      <div className="space-y-6">
        <div className="text-center space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">How credits work</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Credits are the simple currency that powers all your visual creation.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Image, title: 'Generate images', desc: '4–6 credits per image depending on the workflow and model selection — product shots, lifestyle, editorial, and more.' },
            { icon: Video, title: 'Create videos & upscale', desc: 'Use credits for video generation, 2K and 4K upscaling, and brand model training.' },
            { icon: RefreshCw, title: 'Monthly refresh', desc: 'Credits refresh every billing cycle. Higher plans unlock better per-credit value and faster queues.' },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-card p-5 space-y-2.5 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Value at a Glance ── */}
      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-center">Value at a glance</h2>
        <div className="rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="grid grid-cols-4 bg-muted/50 px-4 sm:px-6 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Plan</span>
            <span className="text-center">Credits/mo</span>
            <span className="text-center">~Images</span>
            <span className="text-right">Per credit</span>
          </div>
          {VALUE_ROWS.map((row) => (
            <div
              key={row.planId}
              className={`grid grid-cols-4 px-4 sm:px-6 py-3 text-sm border-t border-border/50 ${
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

      {/* ── FAQ ── */}
      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-center">Frequently asked questions</h2>
        <div className="max-w-3xl mx-auto space-y-2">
          {[
            { q: 'What can I create with VOVV?', a: 'Product photography, lifestyle shots, editorial campaigns, on-model imagery, product videos, short films, and ad content — all from a single product photo.' },
            { q: 'Do I need photography experience?', a: 'Not at all. VOVV.AI handles lighting, composition, styling, and retouching automatically. Just upload your product and choose a scene.' },
            { q: 'Do unused credits roll over?', a: 'No — credits reset each billing cycle. Use them or lose them. This keeps plans affordable for everyone.' },
            { q: 'Can I change plans anytime?', a: 'Yes. Upgrade instantly and get the new credit balance right away. Downgrades take effect at your next billing date.' },
            { q: 'What happens when I run out of credits?', a: 'You can purchase one-time credit top-ups without changing your plan, or upgrade to a higher plan for more monthly credits.' },
            { q: 'How does annual billing work?', a: 'Pay for 12 months upfront and save 20%. Credits are still refreshed monthly — you get the same amount each month.' },
            { q: 'Is there a free trial?', a: 'Every account starts with 20 free credits — no credit card required. Generate images and see the quality before committing.' },
            { q: 'How many images can I generate per credit?', a: 'Each image costs 4–6 credits depending on workflow — Freestyle starts at 4, Visual Studio scenes cost 6. Video generation, upscaling, and model training have their own credit costs displayed before each action.' },
          ].map((faq) => (
            <Collapsible key={faq.q}>
              <CollapsibleTrigger className="w-full flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 hover:bg-muted/30 transition-colors text-left shadow-sm">
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

      {/* ── Enterprise CTA ── */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center space-y-4 shadow-sm">
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

      {/* Compare link */}
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
