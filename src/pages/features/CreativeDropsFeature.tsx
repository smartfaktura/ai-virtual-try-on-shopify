import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';

const benefits = [
  {
    icon: CalendarDays,
    title: 'Fresh Content Monthly',
    description: 'Receive a curated batch of new product visuals on a schedule you set — weekly, bi-weekly, or monthly.',
  },
  {
    icon: TrendingUp,
    title: 'Trending Styles',
    description: 'Each drop is styled around current visual trends — seasonal themes, color palettes, and compositions that convert.',
  },
  {
    icon: RefreshCw,
    title: 'Seasonal Themes',
    description: 'From holiday campaigns to summer collections — the Content Calendar keeps your catalog visually fresh year-round.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Set Your Schedule',
    description: 'Choose your drop frequency and how many images per delivery. Pick the workflows and products to include.',
  },
  {
    number: '02',
    title: 'We Generate & Curate',
    description: 'Our AI creates a batch of visuals based on your brand profile, selected workflows, and current style trends.',
  },
  {
    number: '03',
    title: 'Review & Download',
    description: 'Your drop arrives in your library — review the results, download what you love, and publish to your store.',
  },
];

export default function CreativeDropsFeature() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <SEOHead title="Content Calendar — Automated Visual Content Delivery | VOVV AI" description="Fresh product visuals on autopilot. Schedule your Content Calendar and receive curated batches of AI-generated images monthly or biweekly." canonical={`${SITE_URL}/features/creative-drops`} />
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Content Calendar
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-6">
            Fresh Product Visuals, Delivered on Schedule
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            Stop manually generating images. Set up your Content Calendar and receive curated batches of on-trend product visuals — automatically, on your schedule.
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
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Why Content Calendar?</h2>
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
          <h2 className="text-3xl font-bold text-foreground mb-4">Never Run Out of Fresh Visuals</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Set up your Content Calendar today and keep your product catalog looking fresh — automatically.
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
