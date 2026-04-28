import { ArrowRight, Upload, Sparkles, Download, ShoppingBag, Megaphone, Palette, Camera, CreditCard, Zap, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from '@/lib/seo/schema';
import { PageLayout } from '@/components/landing/PageLayout';

import { ModelShowcaseSection } from '@/components/landing/ModelShowcaseSection';
import { EnvironmentShowcaseSection } from '@/components/landing/EnvironmentShowcaseSection';
import { ChannelShowcase } from '@/components/landing/ChannelShowcase';
import { SITE_URL } from '@/lib/constants';

const TRUST_BADGES = [
  { icon: CreditCard, text: 'No credit card required' },
  { icon: Zap, text: '20 free credits' },
  { icon: Clock, text: 'Results in seconds' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: Upload, title: 'Upload Your Product', description: 'Drop in any product photo — flat lay, packshot, or even a phone snap.' },
  { step: '02', icon: Sparkles, title: 'Pick Models & Scenes', description: 'Choose from 50+ AI models and 30+ professional backgrounds, or describe your own.' },
  { step: '03', icon: Download, title: 'Download & Publish', description: 'Get studio-quality visuals ready for your store, ads, and social in seconds.' },
];

const USE_CASES = [
  { icon: ShoppingBag, title: 'E-commerce Listings', description: 'Product pages that convert — lifestyle shots, on-model imagery, and clean packshots.' },
  { icon: Megaphone, title: 'Social Media Ads', description: 'Scroll-stopping creatives for Instagram, TikTok, and Facebook campaigns.' },
  { icon: Palette, title: 'Brand Campaigns', description: 'Consistent, on-brand visuals across every channel without a single photoshoot.' },
  { icon: Camera, title: 'Lifestyle Content', description: 'Context-rich imagery that tells your product story in real-world settings.' },
];

const STATS = [
  { value: '10,000+', label: 'Images Generated' },
  { value: '50+', label: 'AI Models' },
  { value: '30+', label: 'Pro Scenes' },
  { value: '<30s', label: 'Per Image' },
];


export default function TryFree() {
  return (
    <PageLayout>
      <SEOHead
        title="Try VOVV.AI Free — AI Product Photos in Seconds"
        description="Upload one product photo and get studio-quality visuals with AI models and professional scenes. No credit card required. 20 free credits to start."
        canonical={`${SITE_URL}/try`}
      />
      <JsonLd data={buildBreadcrumbJsonLd([{ name: 'Try Free', path: '/try' }])} />
      <JsonLd data={buildWebPageJsonLd({ name: 'Try VOVV.AI Free', description: 'Upload one product photo and get studio-quality visuals with AI models and professional scenes. No credit card required.', path: '/try' })} />

      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-6 text-xs tracking-wide uppercase">
            Try Free — No Credit Card
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
            Create Stunning Product Visuals with AI
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload one product photo. Pick an AI model and a scene. Download brand-ready images — no photoshoot, no designer, no waiting.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="text-base px-8 py-6 rounded-full shadow-lg">
              <Link to="/auth">
                Try VOVV.AI Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            {TRUST_BADGES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4 text-primary" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Channel Showcase */}
      <ChannelShowcase />


      {/* How It Works */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-xs tracking-wide uppercase">
              How It Works
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Three Steps. Studio-Quality Results.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, description }) => (
              <div key={step} className="relative bg-card border border-border rounded-2xl p-8 text-center shadow-sm">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-5">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="absolute top-4 right-4 text-xs font-bold text-muted-foreground/50">{step}</span>
                <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Model Showcase */}
      <ModelShowcaseSection />

      {/* Environment Showcase */}
      <EnvironmentShowcaseSection />

      {/* Mid CTA */}
      <section className="py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Every Visual You Need. Zero Photoshoots.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From product listings to social ads — generate professional visuals in seconds, not weeks.
          </p>
          <Button asChild size="lg" className="mt-8 text-base px-8 py-6 rounded-full shadow-lg">
            <Link to="/auth">
              Start Creating for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-xs tracking-wide uppercase">
              Use Cases
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Built for Every Visual Need
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {USE_CASES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl sm:text-4xl font-bold text-primary">{value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Start Creating — Free
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Join thousands of brands using VOVV.AI to generate scroll-stopping product visuals. No credit card, no commitment.
          </p>
          <Button asChild size="lg" className="mt-8 text-base px-10 py-6 rounded-full shadow-lg">
            <Link to="/auth">
              Try VOVV.AI Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </PageLayout>
  );
}
