import { useNavigate } from 'react-router-dom';
import { ArrowRight, RotateCcw, Camera, Eye, Lightbulb, ScanLine, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';

const benefits = [
  {
    icon: RotateCcw,
    title: '8 Angle Types',
    description: 'Front, back, left side, right side, close-up, full body, upper body, and more — all from a single source photo.',
  },
  {
    icon: Eye,
    title: 'Scene-Aware Prompting',
    description: 'Detects on-model shots automatically and preserves pose, clothing fit, and styling across every generated angle.',
  },
  {
    icon: Lightbulb,
    title: 'Matching Lighting & Backgrounds',
    description: 'Every perspective matches the original background, surface material, and lighting setup for a cohesive product gallery.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Upload Your Source',
    description: 'Drop in any product photo — flat lay, on-model, or lifestyle. Our AI analyzes the scene context automatically.',
  },
  {
    number: '02',
    title: 'Select Your Angles',
    description: 'Choose from 8 perspective types. Pick individual angles or generate a complete set for your product listing.',
  },
  {
    number: '03',
    title: 'Get Cohesive Results',
    description: 'Receive a matching set of product angles with consistent lighting, background, and styling. 6 credits per angle.',
  },
];

export default function PerspectivesFeature() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <SEOHead
        title="Product Perspectives — Multi-Angle AI Photography — VOVV.AI"
        description="Generate every angle from a single product photo. Front, back, side, close-up — 8 perspective types with matching lighting and backgrounds. 6 credits per angle."
        canonical={`${SITE_URL}/features/perspectives`}
      />

      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Camera className="w-4 h-4" />
            Perspectives
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-6">
            Generate Every Angle From a Single Photo
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            One product photo in, a complete angle set out. Front, back, side, close-up — all with matching lighting, backgrounds, and styling for a professional product gallery.
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
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Why Perspectives?</h2>
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
          <h2 className="text-3xl font-bold text-foreground mb-4">One Photo, Every Angle</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Stop scheduling reshoots for missing angles. Upload one photo and generate a complete perspective set in minutes.
          </p>
          <Button
            size="lg"
            className="rounded-full px-10 py-6 text-base font-semibold gap-2 shadow-xl shadow-primary/25"
            onClick={() => navigate('/auth')}
          >
            Try Perspectives
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>
    </PageLayout>
  );
}
