import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Users, Layers, Zap, Palette, ImagePlus, Download, Sparkles, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from '@/lib/seo/schema';
import { ModelShowcaseSection } from '@/components/landing/ModelShowcaseSection';
import { EnvironmentShowcaseSection } from '@/components/landing/EnvironmentShowcaseSection';
import { SITE_URL } from '@/lib/constants';

const benefits = [
  {
    icon: ShoppingBag,
    title: 'Shopify-Ready Formats',
    description: 'Generate images in 1:1, 4:5, and 16:9 — perfectly sized for Shopify product pages, collections, and banners.',
  },
  {
    icon: Users,
    title: 'Diverse AI Models',
    description: '50+ AI models across every body type, ethnicity, and age range. Represent your audience authentically.',
  },
  {
    icon: Layers,
    title: 'Professional Scenes',
    description: '30+ studio, lifestyle, and editorial backgrounds. Place products in any setting without a photoshoot.',
  },
  {
    icon: Zap,
    title: 'Bulk Generation',
    description: 'Generate images for your entire catalog at once. Update hundreds of listings in minutes, not months.',
  },
  {
    icon: Palette,
    title: 'Brand Consistency',
    description: 'Apply brand profiles to keep every product image on-brand — same mood, same colors, every listing.',
  },
  {
    icon: Camera,
    title: 'No Photography Costs',
    description: 'Skip expensive photoshoots. Create premium on-model and lifestyle imagery from a single product photo.',
  },
];

const steps = [
  {
    number: '01',
    icon: ImagePlus,
    title: 'Upload Your Products',
    description: 'Import product photos directly from your Shopify store or upload them manually. Our AI handles the rest.',
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'Pick Model & Scene',
    description: 'Choose from 50+ diverse AI models and 30+ professional scenes. Mix and match for every product listing.',
  },
  {
    number: '03',
    icon: Download,
    title: 'Download Store-Ready Images',
    description: 'Get photo-realistic, Shopify-optimized images in seconds. Ready to upload to your store immediately.',
  },
];

const stats = [
  { value: '10,000+', label: 'Images Generated' },
  { value: '50+', label: 'AI Models' },
  { value: '30+', label: 'Scene Environments' },
  { value: '< 30s', label: 'Per Image' },
];

export default function ShopifyImageGenerator() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <SEOHead
        title="Shopify Product Image Generator — AI Photos for Your Store | VOVV.AI"
        description="Generate stunning AI product photos for your Shopify store. 50+ diverse models, 30+ scenes. Create professional listing images without photoshoots — try free."
        canonical={`${SITE_URL}/features/shopify-image-generator`}
      />
      <JsonLd data={buildBreadcrumbJsonLd([{ name: 'Features', path: '/features/workflows' }, { name: 'Shopify Image Generator', path: '/features/shopify-image-generator' }])} />
      <JsonLd data={buildWebPageJsonLd({ name: 'Shopify Product Image Generator', description: 'Generate stunning AI product photos for your Shopify store. 50+ diverse models, 30+ scenes.', path: '/features/shopify-image-generator' })} />

      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <ShoppingBag className="w-4 h-4" />
            Shopify Image Generator
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
            Generate Stunning Product Images{' '}
            <span className="text-primary">for Your Shopify Store</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            Add AI models and professional scenes to your product photos. Create scroll-stopping listing images that convert — no photoshoot, no designer, no hassle.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="rounded-full px-10 py-6 text-base font-semibold gap-2 shadow-xl shadow-primary/25"
              onClick={() => navigate('/auth')}
            >
              Try Free
              <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-sm text-muted-foreground">No credit card required</p>
          </div>
        </div>
      </section>

      {/* Model Showcase */}
      <ModelShowcaseSection />

      {/* Scene/Environment Showcase */}
      <EnvironmentShowcaseSection />

      {/* Mid CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Upgrade Every Listing. No Photoshoot Required.
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Turn a single product photo into dozens of professional, on-model images for your Shopify store. Save thousands on photography.
          </p>
          <Button
            size="lg"
            className="rounded-full px-10 py-6 text-base font-semibold gap-2 shadow-xl shadow-primary/25"
            onClick={() => navigate('/auth')}
          >
            Start Creating Free
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 text-xs tracking-wide uppercase">
              Simple Workflow
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              How It Works
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.number} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <s.icon className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-primary mb-2">{s.number}</div>
                <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-xs tracking-wide uppercase">
              Built for Shopify Sellers
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Everything You Need for Better Listings
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <Card key={b.title} className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <b.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Start Generating — Free
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Upload your first Shopify product and create professional AI-generated images. No photoshoot, no designer — just results.
          </p>
          <Button
            size="lg"
            className="rounded-full px-12 py-6 text-base font-semibold gap-2 shadow-xl shadow-primary/25"
            onClick={() => navigate('/auth')}
          >
            Try Free
            <ArrowRight className="w-5 h-5" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">Free plan includes credits to get started</p>
        </div>
      </section>
    </PageLayout>
  );
}
