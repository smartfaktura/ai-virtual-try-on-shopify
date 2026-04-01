import { useNavigate } from 'react-router-dom';
import { ArrowRight, Palette, Paintbrush, BookmarkCheck, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';

const benefits = [
  {
    icon: Paintbrush,
    title: 'Color & Style Consistency',
    description: 'Define your lighting, color temperature, background style, and tone. Every generated image follows your rules.',
  },
  {
    icon: BookmarkCheck,
    title: 'Reusable Presets',
    description: 'Create once, use forever. Apply your Brand Profile to any template, Content Calendar, or freestyle generation.',
  },
  {
    icon: Users2,
    title: 'Team Sharing',
    description: 'Your entire team generates on-brand visuals without needing a style guide open — the AI knows your brand.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Define Your Brand Identity',
    description: 'Set your brand tone, preferred lighting, color palette, target audience, and "do not" rules in a simple wizard.',
  },
  {
    number: '02',
    title: 'Attach to Workflows',
    description: 'Link your Brand Profile to any workflow or Creative Drop. The AI incorporates your guidelines into every generation.',
  },
  {
    number: '03',
    title: 'Get Consistent Results',
    description: "Every image matches your visual identity — whether it's a social ad, product page hero, or email campaign banner.",
  },
];

export default function BrandProfilesFeature() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <SEOHead title="Brand Profiles — Consistent AI Photography | VOVV AI" description="Define your brand's visual identity once. Every AI-generated image automatically matches your lighting, colors, composition, and tone." canonical={`${SITE_URL}/features/brand-profiles`} />
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Palette className="w-4 h-4" />
            Brand Profiles
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-6">
            Your Brand Guidelines, Built Into Every Image
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            Save your brand's visual identity — colors, tone, lighting, composition — and let the AI apply it consistently across every generation.
          </p>
          <Button size="lg" className="rounded-full px-10 py-6 text-base font-semibold gap-2 shadow-xl shadow-primary/25" onClick={() => navigate('/auth')}>
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Why Brand Profiles?</h2>
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
          <h2 className="text-3xl font-bold text-foreground mb-4">On-Brand Visuals, Every Time</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Create your Brand Profile in minutes and never worry about off-brand images again.
          </p>
          <Button size="lg" className="rounded-full px-10 py-6 text-base font-semibold gap-2 shadow-xl shadow-primary/25" onClick={() => navigate('/auth')}>
            Start Creating
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>
    </PageLayout>
  );
}
