import { useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import { ArrowRight, Layers, Zap, Palette, Settings2, Users, ShoppingBag, Camera, Layout, Home, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';
import { WorkflowAnimatedThumbnail } from '@/components/app/WorkflowAnimatedThumbnail';
import { workflowScenes } from '@/components/app/workflowAnimationData';

const workflows = [
  {
    icon: Users,
    name: 'Virtual Try-On Set',
    tagline: 'See your products on real AI models — editorial quality, zero photoshoots.',
    description: 'Upload a single product image and instantly generate professional on-model photography. Choose from 30+ diverse models spanning different ethnicities, body types, and age ranges.',
    features: [
      'AI-powered virtual try-on on real models',
      '30+ diverse models & 30+ curated scenes to choose from',
      'Professional editorial-quality results',
      'All aspect ratios supported — portrait, square & landscape',
    ],
    gradient: 'from-primary/20 to-primary/5',
    iconBg: 'bg-primary/15',
  },
  {
    icon: ShoppingBag,
    name: 'Product Listing Set',
    tagline: 'E-commerce-ready product shots in every scene imaginable.',
    description: 'From clean white studio to lifestyle environments — generate 30 unique scene variations for any product. Category-aware lighting adapts automatically to jewelry, apparel, electronics, and more.',
    features: [
      '30 diverse scenes from white studio to lifestyle & beyond',
      'Category-aware lighting and composition',
      'No people — pure product focus',
      'Optimized for Amazon, Shopify & social commerce',
    ],
    gradient: 'from-accent/20 to-accent/5',
    iconBg: 'bg-accent/15',
  },
  {
    icon: Camera,
    name: 'Selfie / UGC Set',
    tagline: 'Authentic creator-style content that builds instant trust.',
    description: 'Generate user-generated content without the creators. Realistic selfie angles, natural lighting, and candid compositions that feel genuine — perfect for social proof and ad creatives.',
    features: [
      'Authentic user-generated content style',
      'Natural, lifestyle-oriented compositions',
      'Perfect for social proof & testimonials',
      'Realistic selfie & candid angles',
    ],
    gradient: 'from-secondary/30 to-secondary/10',
    iconBg: 'bg-secondary/30',
  },
  {
    icon: Layout,
    name: 'Flat Lay Set',
    tagline: 'Styled overhead arrangements — Instagram-ready in seconds.',
    description: 'Curated top-down product layouts with complementary props and textures. Each image is styled for maximum visual impact on social feeds and lookbooks.',
    features: [
      'Curated top-down product arrangements',
      'Stylized with complementary props',
      'Instagram-ready compositions',
      'Multi-product showcase layouts',
    ],
    gradient: 'from-primary/15 to-accent/10',
    iconBg: 'bg-primary/10',
  },
  {
    icon: Camera,
    name: 'Mirror Selfie Set',
    tagline: 'The viral format — realistic mirror selfies with your product.',
    description: 'Generate authentic mirror selfie compositions complete with visible phone and natural room environments. The most relatable content format on social media, now fully automated.',
    features: [
      'Realistic mirror selfie compositions with phone visible',
      'Diverse room and mirror environments to choose from',
      'Identity-preserved model with your product',
      'All aspect ratios supported',
    ],
    gradient: 'from-accent/15 to-primary/10',
    iconBg: 'bg-accent/15',
  },
  {
    icon: Home,
    name: 'Interior / Exterior Staging',
    tagline: 'Transform empty spaces into fully staged rooms — 12 design styles.',
    description: 'Upload an empty room or building exterior and watch it come alive. From Modern Minimalist to Japandi, Scandinavian to Industrial — strict architectural preservation ensures windows, doors, and angles stay untouched.',
    features: [
      'Transform empty rooms into fully staged interiors',
      'Enhance building exteriors with curb appeal & landscaping',
      '12 design styles — Modern, Japandi, Scandinavian & more',
      'Strict architectural preservation — windows, doors, angles unchanged',
    ],
    gradient: 'from-secondary/20 to-primary/5',
    iconBg: 'bg-secondary/20',
  },
];

const benefits = [
  {
    icon: Zap,
    title: 'No Prompts Needed',
    description: 'Select a template and your product — our AI handles the rest. No writing prompts, no guessing parameters.',
  },
  {
    icon: Layers,
    title: 'Batch Processing',
    description: 'Generate on-model, lifestyle, flat lay, and detail shots in a single run. Dozens of images from one upload.',
  },
  {
    icon: Palette,
    title: 'Brand-Consistent Output',
    description: 'Pair templates with Brand Profiles to ensure every image matches your visual identity automatically.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Upload Your Product',
    description: 'Drop in a single product image — packshot, flat lay, even a phone photo. Our AI extracts what it needs.',
  },
  {
    number: '02',
    title: 'Pick a Template',
    description: 'Choose from curated templates like "On-Model Editorial", "Lifestyle Scene", or "Social Media Pack". Each one is a complete visual pipeline.',
  },
  {
    number: '03',
    title: 'Receive Studio-Quality Images',
    description: 'Your images are generated and delivered to your library — ready to download, share, or push to your store.',
  },
];

function WorkflowFeatureCard({ wf, scene, reversed, onCta }: {
  wf: typeof workflows[number];
  scene: (typeof workflowScenes)[keyof typeof workflowScenes] | undefined;
  reversed: boolean;
  onCta: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsActive(entry.isIntersecting),
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="rounded-2xl border bg-card overflow-hidden">
      <div className={`flex flex-col lg:flex-row ${reversed ? 'lg:flex-row-reverse' : ''}`}>
        {/* Visual side */}
        <div className="relative w-full lg:w-[45%] shrink-0">
          {scene ? (
            <div className="aspect-square lg:aspect-[3/4] overflow-hidden">
              <WorkflowAnimatedThumbnail scene={scene} isActive={isActive} />
            </div>
          ) : (
            <div className={`aspect-square lg:aspect-[3/4] bg-gradient-to-br ${wf.gradient} flex items-center justify-center`}>
              <div className={`w-24 h-24 rounded-3xl ${wf.iconBg} flex items-center justify-center`}>
                <wf.icon className="w-12 h-12 text-primary" />
              </div>
            </div>
          )}
        </div>

        {/* Content side */}
        <div className="flex flex-col justify-center gap-5 p-6 lg:p-10 flex-1">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            {wf.name}
          </h2>
          <p className="text-base font-medium text-foreground/80">
            {wf.tagline}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {wf.description}
          </p>

          <ul className="space-y-2.5">
            {wf.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2">
            <Button
              size="lg"
              className="rounded-full font-semibold gap-2 h-11 px-8"
              onClick={onCta}
            >
              Try {wf.name} Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowsFeature() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <SEOHead title="AI Photography Templates — VOVV.AI" description="Six purpose-built AI photography templates: Virtual Try-On, Product Listing, Flat Lay, Mirror Selfie, UGC, and Interior Staging. Professional results in 60 seconds." canonical={`${SITE_URL}/features/workflows`} />
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Settings2 className="w-4 h-4" />
            Templates
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
            6 Visual Pipelines.<br />One Upload. Zero Prompts.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            From on-model editorial to flat lays, UGC selfies to interior staging — each template is a complete creative pipeline that turns a single product image into dozens of studio-quality visuals.
          </p>
          <Button size="lg" className="rounded-full px-10 py-6 text-base font-semibold gap-2 shadow-xl shadow-primary/25" onClick={() => navigate('/auth')}>
            Start Free — No Credit Card
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Workflow Showcase */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {workflows.map((wf, i) => {
            const reversed = i % 2 === 1;
            const scene = workflowScenes[wf.name];
            return (
              <WorkflowFeatureCard
                key={wf.name}
                wf={wf}
                scene={scene}
                reversed={reversed}
                onCta={() => navigate('/auth')}
              />
            );
          })}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Why Templates?</h2>
          <div className="grid md:grid-cols-3 gap-6">
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

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.number} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {s.number}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Stop Scheduling Photoshoots. Start Generating.</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Sign up free and run your first template in under 2 minutes. Upload one image, pick a template, get studio-quality results. No credit card required.
          </p>
          <Button size="lg" className="rounded-full px-10 py-6 text-base font-semibold gap-2 shadow-xl shadow-primary/25" onClick={() => navigate('/auth')}>
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>
    </PageLayout>
  );
}
