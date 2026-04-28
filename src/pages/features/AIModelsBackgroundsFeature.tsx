import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Layers, Camera, Palette, Grid3X3, Maximize, Sparkles, ImagePlus, Download } from 'lucide-react';
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
    icon: Users,
    title: 'Diverse Model Library',
    description: 'Access 50+ AI models spanning every body type, ethnicity, age range, and gender — or upload your own.',
  },
  {
    icon: Layers,
    title: '30+ Scene Environments',
    description: 'Studio, lifestyle, editorial, streetwear — place products in any professional setting instantly.',
  },
  {
    icon: Camera,
    title: 'No Photoshoots Needed',
    description: 'Skip the studio. Generate premium on-model and lifestyle photography from a single product image.',
  },
  {
    icon: Palette,
    title: 'Brand Consistency',
    description: 'Apply brand profiles to every generation — your colors, your mood, your aesthetic, every time.',
  },
  {
    icon: Grid3X3,
    title: 'Any Product Category',
    description: 'Fashion, jewelry, accessories, home décor, beauty — our AI adapts to every product type.',
  },
  {
    icon: Maximize,
    title: 'All Aspect Ratios',
    description: 'Generate in 1:1, 4:5, 9:16, 16:9 — optimized for every platform from Instagram to Shopify.',
  },
];

const steps = [
  {
    number: '01',
    icon: ImagePlus,
    title: 'Upload Your Product',
    description: 'Drop in a product photo — flat lay, packshot, or any angle. Our AI isolates and understands it automatically.',
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'Choose Model & Scene',
    description: 'Browse 50+ diverse AI models and 30+ professional scenes. Mix and match for your perfect visual.',
  },
  {
    number: '03',
    icon: Download,
    title: 'Download Brand Visuals',
    description: 'Get photo-realistic, brand-ready images in seconds. Ready for your store, social media, and ad campaigns.',
  },
];

const stats = [
  { value: '10,000+', label: 'Images Generated' },
  { value: '50+', label: 'AI Models' },
  { value: '30+', label: 'Scene Environments' },
  { value: '< 30s', label: 'Per Image' },
];

export default function AIModelsBackgroundsFeature() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <SEOHead
        title="AI Models & Backgrounds for Product Photography — VOVV.AI"
        description="Add AI models and scene backgrounds to your product photos. 50+ diverse models, 30+ environments. Create premium brand visuals without photoshoots."
        canonical={`${SITE_URL}/features/ai-models-backgrounds`}
      />
      <JsonLd data={buildBreadcrumbJsonLd([{ name: 'Features', path: '/features/workflows' }, { name: 'AI Models & Backgrounds', path: '/features/ai-models-backgrounds' }])} />
      <JsonLd data={buildWebPageJsonLd({ name: 'AI Models & Backgrounds', description: 'Add AI models and scene backgrounds to your product photos. 50+ diverse models, 30+ environments.', path: '/features/ai-models-backgrounds' })} />

      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI Models & Backgrounds
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
            Add Models and Scenes{' '}
            <span className="text-primary">with AI</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            Create premium brand visuals without expensive photoshoots. Choose from 50+ diverse AI models and 30+ professional scenes — and generate stunning product imagery in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="rounded-full px-10 py-6 text-base font-semibold gap-2 shadow-xl shadow-primary/25"
              onClick={() => navigate('/auth')}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-sm text-muted-foreground">No credit card required</p>
          </div>
        </div>
      </section>

      {/* Model Showcase — reused from landing */}
      <ModelShowcaseSection />

      {/* Scene/Environment Showcase — reused from landing */}
      <EnvironmentShowcaseSection />

      {/* Mid CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Every Model. Every Scene. One Platform.
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Stop spending thousands on photoshoots. Generate unlimited combinations of models and backgrounds from a single product image.
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
              Why VOVV.AI
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Everything You Need for Visual Content
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
            Start Creating — Free
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Upload your first product and generate professional visuals with AI models and scenes. No photoshoot required.
          </p>
          <Button
            size="lg"
            className="rounded-full px-12 py-6 text-base font-semibold gap-2 shadow-xl shadow-primary/25"
            onClick={() => navigate('/auth')}
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">Free plan includes credits to get started</p>
        </div>
      </section>
    </PageLayout>
  );
}
