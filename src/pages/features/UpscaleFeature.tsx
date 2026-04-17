import { useNavigate } from 'react-router-dom';
import { ArrowRight, Maximize2, Image, Layers, Zap, Sparkles, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';

const benefits = [
  {
    icon: Sparkles,
    title: 'Fabric & Texture Recovery',
    description: 'AI reconstructs fine details — thread patterns, weave textures, material grain — that standard upscaling smears away.',
  },
  {
    icon: Maximize2,
    title: '2K & 4K Resolution',
    description: 'Choose between 2K (10 credits) or 4K (15 credits) output. Perfect for hero banners, print-ready assets, and zoom-friendly listings.',
  },
  {
    icon: Grid3X3,
    title: 'Batch Upscaling',
    description: 'Enhance up to 10 images at once. Queue them up, walk away, and come back to a full set of high-res assets.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Select Your Images',
    description: 'Pick images from your library or upload new ones. Any generated or uploaded product photo works.',
  },
  {
    number: '02',
    title: 'Choose Resolution',
    description: 'Select 2K for web-optimized quality or 4K for maximum detail — ideal for print and large displays.',
  },
  {
    number: '03',
    title: 'Get Enhanced Results',
    description: 'Download your upscaled images with recovered textures, sharper edges, and richer detail throughout.',
  },
];

export default function UpscaleFeature() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <SEOHead
        title="AI Image Upscaling for E-Commerce — VOVV.AI"
        description="Upscale product images to 2K or 4K with AI texture recovery. Batch enhance up to 10 images at once. Sharper details, richer textures, print-ready quality."
        canonical={`${SITE_URL}/features/upscale`}
      />

      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Maximize2 className="w-4 h-4" />
            Image Upscaling
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-6">
            Upscale &amp; Enhance Your Product Images
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            Go from standard resolution to stunning 2K or 4K with AI-powered detail reconstruction. Recover fabric textures, sharpen edges, and make every product image print-ready.
          </p>
          <Button
            size="lg"
            className="rounded-full px-10 py-6 text-base font-semibold gap-2 shadow-xl shadow-primary/25"
            onClick={() => navigate('/auth')}
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Why AI Upscaling?</h2>
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
          <h2 className="text-3xl font-bold text-foreground mb-4">Make Every Pixel Count</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Upscale your first images for free and see the difference AI-enhanced resolution makes for your product listings.
          </p>
          <Button
            size="lg"
            className="rounded-full px-10 py-6 text-base font-semibold gap-2 shadow-xl shadow-primary/25"
            onClick={() => navigate('/auth')}
          >
            Try Upscaling
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>
    </PageLayout>
  );
}
