import { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useDiscoverPresets, type DiscoverPreset } from '@/hooks/useDiscoverPresets';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { SITE_URL } from '@/lib/constants';
import {
  ArrowRight, Upload, Palette, Download, Zap, Camera, ShoppingBag,
  Image as ImageIcon, Mail, Store, LayoutGrid, CheckCircle2, X,
  Sparkles, RefreshCw, Layers, Eye, Shield
} from 'lucide-react';

/* ─── useInView hook (matches HowItWorks) ─── */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.unobserve(el); } },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const baseTransition = 'transition-all duration-700 ease-out';
const hidden = 'opacity-0 translate-y-8';
const visible = 'opacity-100 translate-y-0';

/* ─── PAGE CONFIG ─── */

const PAGE = {
  slug: 'ai-product-photography-for-ecommerce',
  title: 'AI Product Photography for Ecommerce | Create Product Images from One Photo | VOVV.ai',
  description: 'Create ecommerce-ready product images from one photo with VOVV.ai. Generate PDP, marketplace, lifestyle, ad, social, and email visuals faster than a traditional photoshoot.',
  h1: 'AI Product Photography for Ecommerce',
  subheadline: 'Create ecommerce-ready product images from one photo for PDP, marketplace, ad, social, and email use.',
};

const CANONICAL = `${SITE_URL}/${PAGE.slug}`;

/* ─── FAQ data ─── */

const FAQS = [
  { q: 'Can I create ecommerce product images from just one photo?', a: 'Yes. VOVV.ai helps turn a single product image into multiple ecommerce-ready visual outputs for product pages, ads, social, email, and more.' },
  { q: 'Can I generate white background and lifestyle product images?', a: 'Yes. You can create different visual directions depending on your ecommerce needs, from clean product imagery to realistic lifestyle scenes.' },
  { q: 'Is this useful for Shopify stores?', a: 'Yes. VOVV.ai is useful for Shopify brands that need stronger visuals for product pages, launches, ads, and campaigns.' },
  { q: 'Can I create visuals for marketplaces too?', a: 'Yes. The platform can help create clean, professional product imagery suitable for multiple ecommerce channels.' },
  { q: 'Will the outputs look realistic?', a: 'VOVV.ai generates premium, brand-ready visuals with realistic lighting, shadows, and composition. The quality is designed for professional ecommerce use.' },
  { q: 'Can I use the images commercially?', a: 'Yes. All images generated through VOVV.ai are yours to use commercially across your ecommerce channels, ads, and marketing materials.' },
  { q: 'Is VOVV.ai faster than a traditional photoshoot?', a: 'VOVV.ai helps brands create and test more visual directions faster, especially when starting from existing product photos. You can go from upload to finished visuals in minutes.' },
  { q: 'Can I create ad creatives and email visuals too?', a: 'Yes. VOVV.ai is designed to support broader ecommerce creative workflows beyond just basic product photos, including ad creatives, email banners, and social content.' },
];

/* ─── OUTCOME TABS ─── */

const OUTCOME_TABS = [
  { id: 'white-bg', label: 'White Background', category: 'commercial', title: 'Clean Product Images', desc: 'Create clean product images for listings, catalogs, and product pages. Perfect for storefronts that need consistent, distraction-free visuals.' },
  { id: 'pdp', label: 'PDP', category: 'photography', title: 'Product Detail Page Visuals', desc: 'Generate polished ecommerce product visuals built for online stores. Showcase your products with professional lighting and composition.' },
  { id: 'lifestyle', label: 'Lifestyle', category: 'lifestyle', title: 'Lifestyle Product Scenes', desc: 'Place products into realistic branded scenes without reshooting. Create context-rich imagery that helps customers visualize ownership.' },
  { id: 'ads', label: 'Ads', category: 'ads', title: 'Ad-Ready Product Creatives', desc: 'Create campaign-ready product creatives for paid social and performance marketing. Test more visual concepts without additional production.' },
  { id: 'email', label: 'Email', category: 'campaign', title: 'Email Campaign Visuals', desc: 'Generate visuals for email campaigns, launches, and promotional sends. Create cohesive imagery that matches your brand across every touchpoint.' },
  { id: 'marketplace', label: 'Marketplace', category: 'commercial', title: 'Marketplace-Ready Images', desc: 'Make clean, professional product imagery for marketplaces and sales channels. Meet listing requirements with consistent, high-quality outputs.' },
];

/* ─── Helpers ─── */

function pickByCategory(presets: DiscoverPreset[], category: string, count = 1, exclude: Set<string> = new Set()): DiscoverPreset[] {
  return presets.filter(p => (p.discover_categories?.includes(category) || p.category === category) && !exclude.has(p.id)).slice(0, count);
}

function pickProductLed(presets: DiscoverPreset[], count: number, exclude: Set<string> = new Set()): DiscoverPreset[] {
  // Prefer presets with product context (ecommerce-relevant), deprioritize model-only beauty shots
  const scored = presets
    .filter(p => !exclude.has(p.id))
    .map(p => {
      let score = 0;
      if (p.product_name || p.product_image_url) score += 3;
      if (p.is_featured) score += 2;
      if (!p.model_name) score += 1; // pure product shots rank higher for ecommerce
      return { preset: p, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map(s => s.preset);
}

/* EcommerceImageFrame removed – using simple ShimmerImage + object-cover */

/* ─── COMPONENT ─── */

export default function AIProductPhotographyEcommerce() {
  const { data: presets = [] } = useDiscoverPresets();

  const usedIds = useMemo(() => new Set<string>(), []);

  const heroImages = useMemo(() => {
    usedIds.clear();
    const picks = pickProductLed(presets, 6);
    picks.forEach(p => usedIds.add(p.id));
    return picks;
  }, [presets, usedIds]);

  const tabImages = useMemo(() => {
    const map: Record<string, DiscoverPreset | null> = {};
    for (const tab of OUTCOME_TABS) {
      const picks = pickByCategory(presets, tab.category, 1, usedIds);
      const pick = picks[0] ?? null;
      if (pick) usedIds.add(pick.id);
      map[tab.id] = pick;
    }
    return map;
  }, [presets, usedIds]);

  const showcaseImages = useMemo(() => pickProductLed(presets, 12, usedIds), [presets, usedIds]);

  const faqSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }), []);

  const webPageSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: PAGE.h1,
    description: PAGE.description,
    url: CANONICAL,
    publisher: { '@type': 'Organization', name: 'VOVV AI', url: SITE_URL },
  }), []);

  /* Section animation refs */
  const proof = useInView();
  const tabs = useInView();
  const why = useInView();
  const compare = useInView();
  const shopify = useInView();
  const showcase = useInView();
  const howIt = useInView();
  const useCases = useInView();
  const seoBlock = useInView();
  const faqBlock = useInView();

  return (
    <PageLayout>
      <SEOHead title={PAGE.title} description={PAGE.description} canonical={CANONICAL} ogType="website" />
      <JsonLd data={faqSchema} />
      <JsonLd data={webPageSchema} />

      {/* ── 1. HERO ── */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/8 rounded-full blur-3xl opacity-30" />

        <div className="relative container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-powered product photography
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6 leading-[1.1]">
              {PAGE.h1}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              {PAGE.subheadline} Turn one product photo into multiple ecommerce-ready visuals for your online store and campaigns.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button asChild size="lg" className="rounded-full px-10 py-6 text-base font-semibold gap-2 shadow-lg shadow-primary/25">
                <Link to="/auth">Start Free <ArrowRight className="w-5 h-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 py-6 text-base">
                <Link to="/discover">See Real Examples</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {[
                { icon: Shield, text: 'No credit card required' },
                { icon: Sparkles, text: '20 free credits' },
                { icon: Zap, text: 'Start in seconds' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Icon className="w-4 h-4 text-primary" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual grid */}
          {heroImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-4xl mx-auto">
              {heroImages.map((img, i) => (
                <div key={img.id} className="rounded-2xl overflow-hidden border border-border shadow-sm bg-muted">
                  <ShimmerImage
                    src={getOptimizedUrl(img.image_url, { width: 480, quality: 75 })}
                    alt={`AI product photography for ecommerce example – ${img.title}`}
                    className="w-full h-auto block"
                    wrapperClassName="h-auto"
                    loading={i < 3 ? 'eager' : 'lazy'}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 2. PROOF BAR ── */}
      <div ref={proof.ref} className={`${baseTransition} ${proof.inView ? visible : hidden}`}>
        <section className="py-14 bg-muted/20">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { icon: ImageIcon, text: 'One photo → multiple visuals' },
                { icon: Store, text: 'Stores, ads, email, marketplaces' },
                { icon: Zap, text: 'Faster than photoshoots' },
                { icon: Layers, text: 'More scalable than editing' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── 3. OUTCOME TABS ── */}
      <div ref={tabs.ref} className={`${baseTransition} ${tabs.inView ? visible : hidden}`}>
        <section className="py-20 sm:py-28 bg-background">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-4">
                Ecommerce Product Images for Every Channel
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Generate the right visual for every ecommerce use case — from clean product cutouts to lifestyle scenes and ad creatives.
              </p>
            </div>
            <Tabs defaultValue="white-bg" className="w-full">
              <TabsList className="flex flex-wrap justify-center gap-1 h-auto bg-muted/50 p-1.5 rounded-xl mb-10">
                {OUTCOME_TABS.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id} className="text-sm px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {OUTCOME_TABS.map(tab => {
                const img = tabImages[tab.id];
                return (
                  <TabsContent key={tab.id} value={tab.id}>
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-border shadow-md bg-muted">
                        {img ? (
                          <EcommerceImageFrame
                            src={getOptimizedUrl(img.image_url, { width: 600, quality: 80 })}
                            alt={`${tab.title} – ecommerce product image generator example`}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full aspect-[4/3] flex items-center justify-center text-muted-foreground">
                            <Camera className="h-12 w-12" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-5">
                        <h3 className="text-2xl font-semibold text-foreground">{tab.title}</h3>
                        <p className="text-muted-foreground leading-relaxed text-lg">{tab.desc}</p>
                        <Button asChild variant="outline" size="sm" className="rounded-full">
                          <Link to="/auth">Try This Style <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        </section>
      </div>

      {/* ── 4. WHY ECOMMERCE BRANDS ── */}
      <div ref={why.ref} className={`${baseTransition} ${why.inView ? visible : hidden}`}>
        <section className="py-20 sm:py-28 bg-muted/20">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground text-center mb-14">
              Why Ecommerce Brands Use VOVV.ai
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Sparkles, title: 'Create More from One Photo', desc: 'Reuse existing product images to generate new visual directions across every sales channel.' },
                { icon: Zap, title: 'Move Faster Than Photoshoots', desc: 'Launch campaigns, update product pages, and test creatives without waiting on production.' },
                { icon: RefreshCw, title: 'Scale Without Bottlenecks', desc: 'Generate multiple visual outputs without designing each asset one by one.' },
                { icon: Eye, title: 'Stay Visually Consistent', desc: 'Create cohesive images for storefronts, ads, social, and email from a single source.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow duration-150">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── 5. COMPARISON ── */}
      <div ref={compare.ref} className={`${baseTransition} ${compare.inView ? visible : hidden}`}>
        <section className="py-20 sm:py-28 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground text-center mb-14">
              Faster Than Photoshoots. More Scalable Than Editing.
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-border bg-card p-8 space-y-5">
                <h3 className="text-lg font-semibold text-foreground">Traditional Photography</h3>
                {[
                  'Expensive per-shoot cost',
                  'Slower turnaround',
                  'Harder to scale',
                  'Requires new shoots for new concepts',
                  'Limited creative flexibility',
                  'More coordination overhead',
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-8 space-y-5">
                <h3 className="text-lg font-semibold text-foreground">VOVV.ai</h3>
                {[
                  'Start from one existing product photo',
                  'Generate multiple outputs in minutes',
                  'Explore new scenes without reshoots',
                  'Create assets for multiple channels',
                  'Easier to scale content production',
                  'Faster iteration for campaigns',
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── 6. SHOPIFY SECTION ── */}
      <div ref={shopify.ref} className={`${baseTransition} ${shopify.inView ? visible : hidden}`}>
        <section className="relative py-20 sm:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-primary/10" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/8 rounded-full blur-3xl opacity-30" />
          <div className="relative container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-6">
              Built for Shopify Brands and Modern Ecommerce Teams
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Whether you're running a Shopify store, selling on marketplaces, or managing campaigns across channels, VOVV.ai helps you create stronger product visuals faster.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left mb-12">
              {[
                'Create better visuals for product pages',
                'Refresh creative without another photoshoot',
                'Generate assets for ads and campaigns',
                'Move faster with lean teams',
                'Support product launches and seasonal drops',
                'Test creative directions at scale',
              ].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/25">
                <Link to="/auth">Start Creating <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/features/shopify-image-generator">Learn more about Shopify support →</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* ── 7. DISCOVERY SHOWCASE ── */}
      <div ref={showcase.ref} className={`${baseTransition} ${showcase.inView ? visible : hidden}`}>
        <section className="py-20 sm:py-28 bg-background">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-4">
                Explore Real Ecommerce Visual Styles
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                All examples below are pulled from our discovery library, showing how one product photo can become multiple ecommerce-ready creative directions.
              </p>
            </div>
            {showcaseImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-12">
                {showcaseImages.map(img => (
                  <div key={img.id} className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-border bg-muted">
                    <EcommerceImageFrame
                      src={getOptimizedUrl(img.image_url, { width: 350, quality: 70 })}
                      alt={`Ecommerce product image example – ${img.title}`}
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-xs font-medium text-white truncate">{img.title}</p>
                      {img.category && (
                        <Badge variant="secondary" className="mt-1 text-[10px] bg-white/20 text-white border-0 backdrop-blur-sm">
                          {img.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="text-center">
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link to="/discover">Explore Discovery <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* ── 8. HOW IT WORKS ── */}
      <div ref={howIt.ref} className={`${baseTransition} ${howIt.inView ? visible : hidden}`}>
        <section className="py-20 sm:py-28 bg-muted/20">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground text-center mb-14">
              How It Works
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Upload, step: '01', title: 'Upload a Product Photo', desc: 'Start with a single product image from your existing catalog.' },
                { icon: Palette, step: '02', title: 'Choose a Direction', desc: 'Select a visual style, scene, or use case for your ecommerce needs.' },
                { icon: Camera, step: '03', title: 'Generate Visuals', desc: 'Create ecommerce-ready product images in seconds with AI.' },
                { icon: Download, step: '04', title: 'Export & Use', desc: 'Download and use across your store, ads, email, or marketplace.' },
              ].map(({ icon: Icon, step, title, desc }) => (
                <div key={step} className="text-center space-y-4">
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="inline-block text-xs font-semibold text-primary tracking-widest">{step}</span>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── 9. USE CASES ── */}
      <div ref={useCases.ref} className={`${baseTransition} ${useCases.inView ? visible : hidden}`}>
        <section className="py-20 sm:py-28 bg-background">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground text-center mb-14">
              Built for Ecommerce Workflows
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: ShoppingBag, title: 'Product Detail Pages', desc: 'Create polished visuals that convert browsers into buyers.' },
                { icon: Store, title: 'Marketplace Listings', desc: 'Professional imagery for Amazon, Etsy, and other channels.' },
                { icon: LayoutGrid, title: 'Paid Social Ads', desc: 'Campaign-ready creatives for Meta, TikTok, and Google.' },
                { icon: Mail, title: 'Email Campaigns', desc: 'On-brand visuals for launches, promos, and newsletters.' },
                { icon: ImageIcon, title: 'Organic Social', desc: 'Content-ready product shots for Instagram, TikTok, and Pinterest.' },
                { icon: Sparkles, title: 'Product Launches', desc: 'Launch with a full visual library before your first sale.' },
                { icon: RefreshCw, title: 'Seasonal Campaigns', desc: 'Refresh visuals for holidays and seasonal promotions quickly.' },
                { icon: Eye, title: 'Creative Testing', desc: 'Test multiple visual concepts to find what performs best.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-2xl border border-border bg-card p-5 space-y-2 shadow-sm hover:shadow-md transition-shadow duration-150">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-sm text-foreground">{title}</h3>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── 10. SEO CONTENT ── */}
      <div ref={seoBlock.ref} className={`${baseTransition} ${seoBlock.inView ? visible : hidden}`}>
        <section className="py-20 sm:py-28 bg-muted/20">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-6">
              What Is AI Product Photography for Ecommerce?
            </h2>
            <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
              <p>
                AI product photography for ecommerce is the process of using artificial intelligence to create professional product images from existing photos. Instead of organizing traditional photoshoots for every product variant, scene, or campaign, ecommerce brands can upload a single product photo and generate multiple high-quality visual outputs — from clean white background cutouts to lifestyle scenes, ad creatives, and marketplace-ready imagery.
              </p>
              <p>
                Modern ecommerce brands use AI-generated product images to populate product detail pages, create social content, build ad campaigns, and support email marketing — all from one source image. This approach dramatically reduces the cost and time associated with traditional product photography while enabling faster creative iteration across channels.
              </p>
            </div>

            <h3 className="text-2xl font-semibold tracking-tight text-foreground mt-12 mb-4">
              Why Ecommerce Brands Need More Than Basic Product Cutouts
            </h3>
            <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
              <p>
                Today's ecommerce landscape demands more than a single product image on a white background. Brands need PDP visuals that convert, social content that stops the scroll, ad creatives that perform, email visuals that drive clicks, product-in-context imagery that tells a story, and marketplace-ready formats that meet listing requirements. An ecommerce product image generator like VOVV.ai helps brands create all of these visual types from existing product photos, making it possible to maintain a consistent, high-quality visual presence across every channel without scaling production costs linearly.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ── 11. FAQ ── */}
      <div ref={faqBlock.ref} className={`${baseTransition} ${faqBlock.inView ? visible : hidden}`}>
        <section className="py-20 sm:py-28 bg-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground text-center mb-12">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-foreground font-medium">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </div>

      {/* ── 12. FINAL CTA ── */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-primary/10" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary/8 rounded-full blur-3xl opacity-40" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Start for free today
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-tight mb-6">
            Create Ecommerce-Ready Product Images from One Photo
          </h2>

          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Generate visuals for PDP, ads, social, email, and marketplaces without another photoshoot.
          </p>

          <Button asChild size="lg" className="rounded-full px-10 py-6 text-base font-semibold gap-2 shadow-xl shadow-primary/25">
            <Link to="/auth">Get Started Free <ArrowRight className="w-5 h-5" /></Link>
          </Button>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              No credit card
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-primary" />
              20 free credits
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
