import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Clock,
  DollarSign,
  Sparkles,
  Layers,
  Camera,
  ShoppingBag,
  Megaphone,
  Users,
  Building2,
  Shield,
  Zap,
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/constants';

const PAGE_URL = `${SITE_URL}/why-vovv`;

const stats = [
  { value: '~95%', label: 'lower cost vs traditional shoots', sub: 'Industry-typical $1.5k–$10k per shoot day, replaced with a fixed monthly plan.' },
  { value: 'Minutes', label: 'not weeks', sub: 'Generate a full visual set the same day, instead of waiting 3–6 weeks for a shoot.' },
  { value: '8+', label: 'scene styles per upload', sub: 'Studio, lifestyle, editorial, on-model, flatlay — from one product photo.' },
  { value: '50+', label: 'category-tuned scenes', sub: 'Built for fashion, beauty, fragrance, jewelry, food, supplements, electronics and more.' },
];

const benefits = [
  { icon: Shield, title: 'Brand-locked outputs', text: 'Use Brand Profiles to lock palette, mood, lighting and styling cues across every generation.' },
  { icon: Layers, title: 'Category-tuned scenes', text: 'Editorial, lifestyle, and ecommerce scenes hand-tuned per category — not generic templates.' },
  { icon: Users, title: 'On-model & lifestyle', text: 'Place products on model-style figures or in real-world contexts that match your aesthetic.' },
  { icon: Camera, title: 'Multi-angle consistency', text: 'Front, side, back and detail angles that stay faithful to the same product.' },
  { icon: ShoppingBag, title: 'Ad-ready aspect ratios', text: '1:1, 4:5, 9:16, 16:9 — sized for PDPs, stories, reels, banners and email.' },
  { icon: Megaphone, title: 'Channel-ready exports', text: 'Optimized for Shopify, Amazon, Meta, TikTok and Pinterest at native dimensions.' },
];

const faqs = [
  {
    q: 'How much can I really save vs a traditional product shoot?',
    a: 'A typical product day-rate covers a model, photographer, studio, lighting, retouching and styling — easily $1,500 to $10,000 per shoot, before re-shoots. VOVV replaces most of that with a fixed monthly plan, so the per-image cost drops dramatically once you generate more than a handful of scenes.',
  },
  {
    q: 'Will the visuals stay consistent with my brand?',
    a: 'Yes. Brand Profiles let you lock palette, lighting, composition bias and styling cues. Every generation is built around your saved profile, so outputs feel cohesive across PDPs, ads and social.',
  },
  {
    q: 'How fast can I have a full set of visuals?',
    a: 'Most users generate a complete set — hero shot, lifestyle, on-model, and ad variants — within minutes of uploading a single product photo.',
  },
  {
    q: 'Do I own the images I generate?',
    a: 'Yes. You retain rights to the visuals you generate from your own products and use them across your owned channels and paid media.',
  },
  {
    q: 'Can I use VOVV visuals for paid ads?',
    a: 'Yes. Outputs are sized and styled for Meta, TikTok, Google and Pinterest. We always recommend reviewing the final visual before publishing.',
  },
];

const audiences = [
  {
    icon: ShoppingBag,
    title: 'Founders & DTC owners',
    text: 'Launch new SKUs without booking another shoot. Refresh PDPs and ads in an afternoon.',
  },
  {
    icon: Megaphone,
    title: 'Marketing & growth teams',
    text: 'Test 10× more creative variants per week. Keep performance pipelines fed without waiting on production.',
  },
  {
    icon: Building2,
    title: 'Agencies & creative studios',
    text: 'Pitch faster, prototype more directions, and scale output across multiple client brands.',
  },
];

const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Why VOVV.AI · Better Product Photography ROI for Ecommerce Brands',
  url: PAGE_URL,
  inLanguage: 'en',
  isPartOf: { '@type': 'WebSite', name: 'VOVV.AI', url: SITE_URL },
  description:
    'Replace expensive product shoots with AI. VOVV.AI delivers studio-grade product photography in minutes — at a fraction of traditional costs.',
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Why VOVV.AI', item: PAGE_URL },
  ],
};

export default function WhyVovv() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <SEOHead
        title="Why VOVV.AI · Better Product Photography ROI for Ecommerce Brands"
        description="Replace expensive product shoots with AI. VOVV.AI delivers studio-grade product photography in minutes — at a fraction of traditional costs."
        canonical={PAGE_URL}
        ogImage={DEFAULT_OG_IMAGE}
      />
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <LandingNav />

      <main>
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="pt-20 pb-16 lg:pt-32 lg:pb-24">
          <div className="max-w-[1100px] mx-auto px-6 lg:px-10 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-5">
              Why VOVV.AI
            </p>
            <h1 className="text-[#1a1a2e] text-4xl sm:text-5xl lg:text-7xl font-semibold tracking-tight leading-[1.05] mb-6">
              Studio-grade product photography.
              <br />
              <span className="text-muted-foreground">Without the studio.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg leading-relaxed mb-10">
              Replace expensive shoots with one upload. Generate every PDP, ad, lifestyle and campaign visual your brand needs — in minutes, on-brand, and at a fraction of the cost.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
              >
                Start free
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center h-[3.25rem] px-8 rounded-full border border-border text-foreground text-base font-semibold hover:bg-secondary transition-colors"
              >
                See pricing
              </Link>
            </div>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12.5px] font-medium text-muted-foreground/70">
              <li>Free to start</li>
              <li aria-hidden className="hidden sm:block h-3 w-px bg-border" />
              <li>No credit card</li>
              <li aria-hidden className="hidden sm:block h-3 w-px bg-border" />
              <li>Cancel anytime</li>
            </ul>
          </div>
        </section>

        {/* ── ROI strip ────────────────────────────────────────────── */}
        <section className="py-16 lg:py-24 bg-[#f5f5f3]">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                The ROI
              </p>
              <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
                Faster, cheaper, more variants.
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
              {stats.map((s) => (
                <div key={s.label} className="bg-white rounded-3xl border border-[#f0efed] p-6 lg:p-7">
                  <div className="text-[#1a1a2e] text-3xl lg:text-4xl font-semibold tracking-tight mb-2">{s.value}</div>
                  <div className="text-[#1a1a2e] text-sm font-semibold mb-2">{s.label}</div>
                  <p className="text-muted-foreground text-[13px] leading-relaxed">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Cost comparison ──────────────────────────────────────── */}
        <section className="py-16 lg:py-32">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Cost & speed
              </p>
              <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
                Two ways to get a product shot.
              </h2>
              <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed">
                Traditional shoots stack costs and weeks of lead time. VOVV gives you the same studio-grade output for a fraction of the spend.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
              <div className="bg-white rounded-3xl border border-[#f0efed] p-7 lg:p-9">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">Traditional shoot</p>
                <h3 className="text-[#1a1a2e] text-xl font-semibold mb-5">Studio · Models · Crew</h3>
                <ul className="space-y-3 text-[15px] text-[#374151]">
                  <li className="flex gap-3"><DollarSign size={16} className="mt-0.5 shrink-0 text-muted-foreground" /> ~$1,500–$10,000 per shoot day (industry typical)</li>
                  <li className="flex gap-3"><Clock size={16} className="mt-0.5 shrink-0 text-muted-foreground" /> 3–6 weeks lead time before usable visuals</li>
                  <li className="flex gap-3"><Camera size={16} className="mt-0.5 shrink-0 text-muted-foreground" /> Locked to one location, one mood, one shot list</li>
                  <li className="flex gap-3"><Layers size={16} className="mt-0.5 shrink-0 text-muted-foreground" /> Re-shoots required for new SKUs, drops or campaigns</li>
                </ul>
              </div>
              <div className="bg-[#1a1a2e] text-white rounded-3xl p-7 lg:p-9 shadow-xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60 mb-3">VOVV.AI</p>
                <h3 className="text-xl font-semibold mb-5">One upload · Every shot</h3>
                <ul className="space-y-3 text-[15px] text-white/85">
                  <li className="flex gap-3"><Check size={16} className="mt-0.5 shrink-0 text-white/70" /> Fixed monthly plan — generate as many variants as you need</li>
                  <li className="flex gap-3"><Check size={16} className="mt-0.5 shrink-0 text-white/70" /> Minutes from upload to a full visual set</li>
                  <li className="flex gap-3"><Check size={16} className="mt-0.5 shrink-0 text-white/70" /> Studio, lifestyle, on-model, editorial — switch instantly</li>
                  <li className="flex gap-3"><Check size={16} className="mt-0.5 shrink-0 text-white/70" /> Re-generate any time a new product, drop or campaign launches</li>
                </ul>
                <Link
                  to="/auth"
                  className="mt-7 inline-flex items-center gap-2 h-11 px-5 rounded-full bg-white text-[#1a1a2e] text-sm font-semibold hover:bg-white/90 transition-colors"
                >
                  Try it free
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Benefits ─────────────────────────────────────────────── */}
        <section className="py-16 lg:py-32 bg-[#f5f5f3]">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                What you get
              </p>
              <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
                Built for the way ecommerce teams ship.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {benefits.map(({ icon: Icon, title, text }) => (
                <div key={title} className="bg-white rounded-3xl border border-[#f0efed] p-6 lg:p-7">
                  <div className="w-10 h-10 rounded-xl bg-[#1a1a2e] text-white flex items-center justify-center mb-4">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-[#1a1a2e] text-base font-semibold mb-1.5 tracking-tight">{title}</h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Audiences ────────────────────────────────────────────── */}
        <section className="py-16 lg:py-32">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Who it's for
              </p>
              <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
                Built for ecommerce teams shipping every week.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
              {audiences.map(({ icon: Icon, title, text }) => (
                <div key={title} className="bg-white rounded-3xl border border-[#f0efed] p-6 lg:p-7">
                  <div className="w-10 h-10 rounded-xl bg-[#1a1a2e] text-white flex items-center justify-center mb-4">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-[#1a1a2e] text-lg font-semibold mb-2 tracking-tight">{title}</h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Speed timeline ───────────────────────────────────────── */}
        <section className="py-16 lg:py-32 bg-[#f5f5f3]">
          <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Speed
              </p>
              <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
                3–6 weeks of work, in minutes.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
              <div className="bg-white rounded-3xl border border-[#f0efed] p-7 lg:p-9">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-4">Traditional timeline</p>
                <ol className="space-y-3 text-[14px] text-[#374151]">
                  <li className="flex gap-3"><Clock size={14} className="mt-1 shrink-0 text-muted-foreground" /> Week 1 — brief, mood board, casting</li>
                  <li className="flex gap-3"><Clock size={14} className="mt-1 shrink-0 text-muted-foreground" /> Week 2 — book studio, lights, stylist</li>
                  <li className="flex gap-3"><Clock size={14} className="mt-1 shrink-0 text-muted-foreground" /> Week 3 — shoot day</li>
                  <li className="flex gap-3"><Clock size={14} className="mt-1 shrink-0 text-muted-foreground" /> Week 4–6 — selects, retouching, delivery</li>
                </ol>
              </div>
              <div className="bg-[#1a1a2e] text-white rounded-3xl p-7 lg:p-9">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60 mb-4">VOVV timeline</p>
                <ol className="space-y-3 text-[14px] text-white/85">
                  <li className="flex gap-3"><Zap size={14} className="mt-1 shrink-0 text-white/70" /> Minute 1 — upload one product photo</li>
                  <li className="flex gap-3"><Zap size={14} className="mt-1 shrink-0 text-white/70" /> Minute 2 — pick category-tuned scenes</li>
                  <li className="flex gap-3"><Zap size={14} className="mt-1 shrink-0 text-white/70" /> Minute 3 — generate hero, lifestyle, on-model</li>
                  <li className="flex gap-3"><Zap size={14} className="mt-1 shrink-0 text-white/70" /> Minute 4 — export ad variants for every channel</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust band ──────────────────────────────────────────── */}
        <section className="py-16 lg:py-24">
          <div className="max-w-[1100px] mx-auto px-6 lg:px-10 text-center">
            <Sparkles size={20} className="mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-[#1a1a2e] text-2xl sm:text-3xl font-semibold tracking-tight mb-4">
              Quality you can ship.
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground text-base leading-relaxed">
              VOVV preserves product silhouette, label artwork, fabric texture and material finish as faithfully as possible. We always recommend reviewing the final visual before publishing — every output is yours to refine.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/ai-product-photography-vs-photoshoot"
                className="inline-flex items-center justify-center h-10 px-5 rounded-full border border-border text-foreground text-sm font-semibold hover:bg-secondary transition-colors"
              >
                vs Traditional photoshoot
              </Link>
              <Link
                to="/ai-product-photography-vs-studio"
                className="inline-flex items-center justify-center h-10 px-5 rounded-full border border-border text-foreground text-sm font-semibold hover:bg-secondary transition-colors"
              >
                vs VOVV Studio workflow
              </Link>
              <Link
                to="/ai-product-photography"
                className="inline-flex items-center justify-center h-10 px-5 rounded-full border border-border text-foreground text-sm font-semibold hover:bg-secondary transition-colors"
              >
                Browse categories
              </Link>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <section className="py-16 lg:py-32 bg-[#f5f5f3]">
          <div className="max-w-[900px] mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                ROI questions
              </p>
              <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
                Why teams switch to VOVV.
              </h2>
            </div>
            <div className="space-y-3">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="group bg-white rounded-2xl border border-[#f0efed] p-5 lg:p-6 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="cursor-pointer flex items-center justify-between gap-4 text-[#1a1a2e] text-base font-semibold">
                    {f.q}
                    <span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                  </summary>
                  <p className="mt-3 text-[#374151] text-[15px] leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────── */}
        <section className="py-20 lg:py-32">
          <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
            <div className="rounded-[28px] bg-gradient-to-br from-[#1a1a2e] to-[#2d2d4d] text-white p-10 lg:p-16 text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
                Stop booking shoots. Start shipping visuals.
              </h2>
              <p className="max-w-xl mx-auto text-white/75 text-base sm:text-lg leading-relaxed mb-8">
                Free to start. No credit card. Cancel anytime.
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-white text-[#1a1a2e] text-base font-semibold hover:bg-white/90 transition-colors"
              >
                Start free
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
