import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useDiscoverPresets, type DiscoverPreset } from '@/hooks/useDiscoverPresets';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { SITE_URL } from '@/lib/constants';
import {
  ArrowRight, Upload, Palette, Download, Zap, Camera, ShoppingBag,
  Image as ImageIcon, Mail, Store, LayoutGrid, CheckCircle2, X,
  Sparkles, RefreshCw, Layers, Eye
} from 'lucide-react';

/* ─── PAGE CONFIG (swap for variant pages) ─── */

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

/* ─── OUTCOME TABS config ─── */

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
  const matches = presets.filter(p =>
    (p.discover_categories?.includes(category) || p.category === category) && !exclude.has(p.id)
  );
  return matches.slice(0, count);
}

function pickFeatured(presets: DiscoverPreset[], count: number): DiscoverPreset[] {
  const featured = presets.filter(p => p.is_featured);
  if (featured.length >= count) return featured.slice(0, count);
  return presets.slice(0, count);
}

/* ─── COMPONENT ─── */

export default function AIProductPhotographyEcommerce() {
  const { data: presets = [] } = useDiscoverPresets();

  const heroImages = useMemo(() => pickFeatured(presets, 6), [presets]);

  const tabImages = useMemo(() => {
    const used = new Set<string>();
    const map: Record<string, DiscoverPreset | null> = {};
    for (const tab of OUTCOME_TABS) {
      const picks = pickByCategory(presets, tab.category, 1, used);
      const pick = picks[0] ?? null;
      if (pick) used.add(pick.id);
      map[tab.id] = pick;
    }
    return map;
  }, [presets]);

  const showcaseImages = useMemo(() => pickFeatured(presets, 12), [presets]);

  const faqSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }), []);

  const webPageSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: PAGE.h1,
    description: PAGE.description,
    url: CANONICAL,
    publisher: {
      '@type': 'Organization',
      name: 'VOVV AI',
      url: SITE_URL,
    },
  }), []);

  return (
    <PageLayout>
      <SEOHead
        title={PAGE.title}
        description={PAGE.description}
        canonical={CANONICAL}
        ogType="website"
      />
      <JsonLd data={faqSchema} />
      <JsonLd data={webPageSchema} />

      {/* ── 1. HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              {PAGE.h1}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              {PAGE.subheadline} Turn one product photo into multiple ecommerce-ready visuals for your online store and campaigns with AI product photography for ecommerce.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/auth">Start Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8 py-6">
                <Link to="/discover">See Real Examples</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> 20 free credits</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Start in seconds</span>
            </div>
          </div>

          {/* Hero visual grid */}
          {heroImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-4xl mx-auto">
              {heroImages.map((img, i) => (
                <div key={img.id} className="rounded-xl overflow-hidden border border-border shadow-sm bg-muted">
                  <ShimmerImage
                    src={getOptimizedUrl(img.image_url, { width: 400, quality: 75 })}
                    alt={`AI product photography for ecommerce example – ${img.title}`}
                    aspectRatio={img.aspect_ratio?.replace(':', '/') || '3/4'}
                    className="w-full h-full object-contain"
                    fetchPriority={i < 3 ? 'high' : 'low'}
                    loading={i < 3 ? 'eager' : 'lazy'}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 2. QUICK PROOF BAR ── */}
      <section className="py-12 border-y border-border bg-card">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: ImageIcon, text: 'One photo → multiple visuals' },
              { icon: Store, text: 'Stores, ads, email, marketplaces' },
              { icon: Zap, text: 'Faster than photoshoots' },
              { icon: Layers, text: 'More scalable than editing' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. OUTCOME TABS ── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ecommerce Product Images for Every Channel
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Generate the right visual for every ecommerce use case — from clean product cutouts to lifestyle scenes and ad creatives.
            </p>
          </div>
          <Tabs defaultValue="white-bg" className="w-full">
            <TabsList className="flex flex-wrap justify-center gap-1 h-auto bg-muted/50 p-1.5 rounded-xl mb-8">
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
                    <div className="rounded-xl overflow-hidden border border-border shadow-md bg-muted">
                      {img ? (
                        <ShimmerImage
                          src={getOptimizedUrl(img.image_url, { width: 600, quality: 80 })}
                          alt={`${tab.title} – ecommerce product image generator example`}
                          aspectRatio={img.aspect_ratio?.replace(':', '/') || '3/4'}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Camera className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-semibold text-foreground">{tab.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-lg">{tab.desc}</p>
                      <Button asChild variant="outline" size="sm">
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

      {/* ── 4. WHY ECOMMERCE BRANDS ── */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
            Why Ecommerce Brands Use VOVV.ai
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Sparkles, title: 'Create More from One Photo', desc: 'Reuse existing product images to generate new visual directions across every sales channel.' },
              { icon: Zap, title: 'Move Faster Than Photoshoots', desc: 'Launch campaigns, update product pages, and test creatives without waiting on production.' },
              { icon: RefreshCw, title: 'Scale Without Bottlenecks', desc: 'Generate multiple visual outputs without designing each asset one by one.' },
              { icon: Eye, title: 'Stay Visually Consistent', desc: 'Create cohesive images for storefronts, ads, social, and email from a single source.' },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="border-border">
                <CardContent className="pt-6 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. COMPARISON ── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
            Faster Than Photoshoots. More Scalable Than Editing Manually.
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-border">
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Traditional Photography</h3>
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
              </CardContent>
            </Card>
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">VOVV.ai</h3>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── 6. SHOPIFY SECTION ── */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Built for Shopify Brands and Modern Ecommerce Teams
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you're running a Shopify store, selling on marketplaces, or managing campaigns across channels, VOVV.ai helps you create stronger product visuals faster.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left mb-10">
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
            <Button asChild size="lg" className="px-8">
              <Link to="/auth">Start Creating <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/features/shopify-image-generator">Learn more about Shopify support →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 7. DISCOVERY SHOWCASE ── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Explore Real Ecommerce Visual Styles
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              All examples below are pulled from our discovery library, showing how one product photo can become multiple ecommerce-ready creative directions.
            </p>
          </div>
          {showcaseImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
              {showcaseImages.map(img => (
                <div key={img.id} className="group relative rounded-xl overflow-hidden border border-border bg-card aspect-[3/4]">
                  <ShimmerImage
                    src={getOptimizedUrl(img.image_url, { width: 350, quality: 70 })}
                    alt={`Ecommerce product image example – ${img.title}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
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
            <Button asChild variant="outline" size="lg">
              <Link to="/discover">Explore Discovery <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 8. HOW IT WORKS ── */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
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
                <span className="text-xs font-bold text-primary tracking-widest">{step}</span>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. USE CASES GRID ── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
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
              <Card key={title} className="border-border hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-5 space-y-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-sm text-foreground">{title}</h3>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. SEO CONTENT BLOCK ── */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-foreground mb-6">
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

          <h3 className="text-2xl font-bold text-foreground mt-12 mb-4">
            Why Ecommerce Brands Need More Than Basic Product Cutouts
          </h3>
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
            <p>
              Today's ecommerce landscape demands more than a single product image on a white background. Brands need PDP visuals that convert, social content that stops the scroll, ad creatives that perform, email visuals that drive clicks, product-in-context imagery that tells a story, and marketplace-ready formats that meet listing requirements. An ecommerce product image generator like VOVV.ai helps brands create all of these visual types from existing product photos, making it possible to maintain a consistent, high-quality visual presence across every channel without scaling production costs linearly.
            </p>
          </div>
        </div>
      </section>

      {/* ── 11. FAQ ── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-foreground text-center mb-10">
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

      {/* ── 12. FINAL CTA ── */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Create Ecommerce-Ready Product Images from One Photo
          </h2>
          <p className="text-lg opacity-90 mb-10">
            Generate visuals for PDP, ads, social, email, and marketplaces without another photoshoot.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button asChild size="lg" variant="secondary" className="text-base px-8 py-6">
              <Link to="/auth">Start Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-base px-8 py-6 text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/discover">See Real Examples</Link>
            </Button>
          </div>
          <p className="text-sm opacity-70">No credit card required · 20 free credits · Start in seconds</p>
        </div>
      </section>
    </PageLayout>
  );
}
