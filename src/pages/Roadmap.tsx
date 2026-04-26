import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Send, Sparkles, Loader2 } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PAGE_URL = `${SITE_URL}/roadmap`;

const columns = [
  {
    label: 'Now · Live this quarter',
    accent: 'bg-emerald-500',
    items: [
      { title: 'More shots per category', text: 'Scaling the scene library across every product category — more editorial, lifestyle and ecommerce variants per upload.' },
      { title: 'Stronger brand-locking', text: 'Tighter Brand Profile fidelity so generations feel cohesive across PDP, ads and social.' },
      { title: 'Faster generation pipeline', text: 'Reducing wait times and improving throughput on multi-product batches.' },
    ],
  },
  {
    label: 'Next · Building',
    accent: 'bg-amber-500',
    items: [
      { title: 'Seasonal drops', text: 'Auto-generated holiday and seasonal scene packs so your visuals stay current year-round.' },
      { title: 'Special campaign packs', text: 'Curated scene sets for Black Friday, Valentine\'s Day, summer launches and gifting moments.' },
      { title: 'New video features', text: 'Extended Short Film durations, more cinematic styles, and richer voiceover variants.' },
    ],
  },
  {
    label: 'Exploring · Researching',
    accent: 'bg-sky-500',
    items: [
      { title: 'Multi-product set photography', text: 'Compose multiple SKUs together for collection covers, gift sets and bundle visuals.' },
      { title: 'Auto-resize for marketplaces', text: 'One generation, every marketplace ratio — Amazon, Shopify, Etsy, TikTok Shop.' },
      { title: 'Team collaboration spaces', text: 'Shared brand profiles, libraries and approval flows for marketing teams.' },
    ],
  },
];

const recentlyShipped = [
  'Freestyle Studio with open prompts and reference mixing',
  'Brand Models system for repeatable on-model visuals',
  'Category-aware shot selection in Product Images wizard',
  'Learn hub with in-app guides at /app/learn',
  'Picture Perspectives — 1 photo, endless angles',
  'Image Editing in Freestyle Studio',
  'Catalog Studio (BETA) for ecommerce hero photography',
  'Resilience layer with Gemini → Seedream → Gemini Flash fallback chain',
];

const categories = [
  'Product images',
  'Video',
  'Brand & style',
  'Workflows',
  'Other',
];

const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'VOVV.AI Roadmap · What We\'re Shipping Next',
  url: PAGE_URL,
  inLanguage: 'en',
  isPartOf: { '@type': 'WebSite', name: 'VOVV.AI', url: SITE_URL },
  description:
    'See what VOVV.AI is shipping next — scene library expansion, seasonal drops, special campaign packs, and new video features. Submit a feature request.',
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Roadmap', item: PAGE_URL },
  ],
};

export default function Roadmap() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !title.trim() || !description.trim()) {
      toast.error('Please fill in your email, a feature title, and a short description.');
      return;
    }
    setSubmitting(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const { error } = await supabase.from('feature_requests').insert({
        email: email.trim(),
        name: name.trim() || null,
        title: title.trim(),
        description: description.trim(),
        category,
        user_id: userRes?.user?.id ?? null,
      });
      if (error) throw error;
      setSubmitted(true);
      setName('');
      setEmail('');
      setTitle('');
      setDescription('');
      toast.success('Thanks — we read every request.');
    } catch (err) {
      console.error('Feature request submission failed', err);
      toast.error('Could not submit your request. Please try again or email us.');
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById('request')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <SEOHead
        title="VOVV.AI Roadmap · What We're Shipping Next"
        description="See what VOVV.AI is shipping next — scene library expansion, seasonal drops, special campaign packs, and new video features. Submit a feature request."
        canonical={PAGE_URL}
        ogImage={DEFAULT_OG_IMAGE}
      />
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <LandingNav />

      <main>
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="pt-20 pb-12 lg:pt-32 lg:pb-20">
          <div className="max-w-[1100px] mx-auto px-6 lg:px-10 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-5">
              Roadmap
            </p>
            <h1 className="text-[#1a1a2e] text-4xl sm:text-5xl lg:text-7xl font-semibold tracking-tight leading-[1.05] mb-6">
              What we're shipping next.
            </h1>
            <p className="max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg leading-relaxed mb-10">
              Honest about what's live, what's near, and what's exploratory. Tell us what you'd like to see and we'll factor it in.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={scrollToForm}
                className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
              >
                Request a feature
                <ArrowRight size={16} />
              </button>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center h-[3.25rem] px-8 rounded-full border border-border text-foreground text-base font-semibold hover:bg-secondary transition-colors"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </section>

        {/* ── Kanban ───────────────────────────────────────────────── */}
        <section className="pb-16 lg:pb-32">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
              {columns.map((col) => (
                <div key={col.label} className="bg-white rounded-3xl border border-[#f0efed] p-6 lg:p-7">
                  <div className="flex items-center gap-2.5 mb-5">
                    <span className={`inline-block w-2 h-2 rounded-full ${col.accent}`} />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {col.label}
                    </p>
                  </div>
                  <ul className="space-y-4">
                    {col.items.map((item) => (
                      <li key={item.title} className="border-t border-[#f0efed] pt-4 first:border-t-0 first:pt-0">
                        <h3 className="text-[#1a1a2e] text-[15px] font-semibold mb-1.5 tracking-tight">{item.title}</h3>
                        <p className="text-[#6b7280] text-[13.5px] leading-relaxed">{item.text}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Recently shipped ─────────────────────────────────────── */}
        <section className="py-16 lg:py-32 bg-[#f5f5f3]">
          <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Recently shipped
              </p>
              <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
                What's live today.
              </h2>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentlyShipped.map((item) => (
                <li key={item} className="flex gap-3 items-start bg-white rounded-2xl border border-[#f0efed] p-4 lg:p-5">
                  <span className="mt-0.5 w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check size={14} />
                  </span>
                  <span className="text-[#1a1a2e] text-[14.5px] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Request a feature form ──────────────────────────────── */}
        <section id="request" className="py-16 lg:py-32 scroll-mt-24">
          <div className="max-w-[820px] mx-auto px-6 lg:px-10">
            <div className="text-center max-w-xl mx-auto mb-10 lg:mb-12">
              <Sparkles size={20} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Request a feature
              </p>
              <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
                Tell us what to build next.
              </h2>
              <p className="mt-4 text-muted-foreground text-base leading-relaxed">
                Every request is read. We prioritize based on how many brands ask for the same thing.
              </p>
            </div>

            {submitted ? (
              <div className="bg-white rounded-3xl border border-[#f0efed] p-8 lg:p-10 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center mb-4">
                  <Check size={20} />
                </div>
                <h3 className="text-[#1a1a2e] text-xl font-semibold mb-2">Thanks — we got it.</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  We read every request and will reach out if we need more detail.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="inline-flex items-center justify-center h-10 px-5 rounded-full border border-border text-foreground text-sm font-semibold hover:bg-secondary transition-colors"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl border border-[#f0efed] p-6 lg:p-8 space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fr-name" className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">
                      Name (optional)
                    </label>
                    <input
                      id="fr-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-[#e8e7e3] bg-[#FAFAF8] text-[#1a1a2e] text-sm focus:outline-none focus:border-foreground/30 transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="fr-email" className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">
                      Email
                    </label>
                    <input
                      id="fr-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-[#e8e7e3] bg-[#FAFAF8] text-[#1a1a2e] text-sm focus:outline-none focus:border-foreground/30 transition-colors"
                      placeholder="you@brand.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="fr-category" className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">
                    Category
                  </label>
                  <select
                    id="fr-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-[#e8e7e3] bg-[#FAFAF8] text-[#1a1a2e] text-sm focus:outline-none focus:border-foreground/30 transition-colors"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="fr-title" className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">
                    Feature title
                  </label>
                  <input
                    id="fr-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-[#e8e7e3] bg-[#FAFAF8] text-[#1a1a2e] text-sm focus:outline-none focus:border-foreground/30 transition-colors"
                    placeholder="e.g. Bulk export to Shopify"
                  />
                </div>

                <div>
                  <label htmlFor="fr-description" className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">
                    What would you like it to do?
                  </label>
                  <textarea
                    id="fr-description"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-[#e8e7e3] bg-[#FAFAF8] text-[#1a1a2e] text-sm leading-relaxed focus:outline-none focus:border-foreground/30 transition-colors resize-y"
                    placeholder="Describe the workflow, the problem you're trying to solve, and how it would help your brand."
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                  <p className="text-[12px] text-muted-foreground">
                    We never share your email. Used only to follow up on your request.
                  </p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {submitting ? 'Sending…' : 'Submit request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────── */}
        <section className="py-16 lg:py-24 bg-[#f5f5f3]">
          <div className="max-w-[1100px] mx-auto px-6 lg:px-10 text-center">
            <h2 className="text-[#1a1a2e] text-2xl sm:text-3xl font-semibold tracking-tight mb-4">
              Have a partnership or enterprise ask?
            </h2>
            <p className="max-w-xl mx-auto text-muted-foreground text-base leading-relaxed mb-7">
              For agency partnerships, enterprise plans or custom integrations, get in touch directly.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-[#1a1a2e] text-white text-sm font-semibold hover:bg-[#1a1a2e]/90 transition-colors"
            >
              Contact us
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
