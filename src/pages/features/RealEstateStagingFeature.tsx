import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Home, DollarSign, Clock, Palette, Camera, Building2, Sofa, BedDouble } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';
import { cn } from '@/lib/utils';

const stagingStyles = [
  { key: 'empty', label: 'Empty Room', image: '/images/staging/staging-empty.png' },
  { key: 'japandi', label: 'Japandi', image: '/images/staging/staging-japandi.png' },
  { key: 'contemporary', label: 'Contemporary', image: '/images/staging/staging-contemporary.png' },
  { key: 'eclectic', label: 'Eclectic', image: '/images/staging/staging-eclectic.png' },
];

const benefits = [
  {
    icon: DollarSign,
    title: 'Save Thousands on Physical Staging',
    description: 'Physical staging costs $2,000–$5,000 per room. AI staging delivers the same impact for a fraction of the cost — stage an entire property for less than one room.',
  },
  {
    icon: Palette,
    title: 'Multiple Styles from One Photo',
    description: 'Upload one empty room and generate Japandi, Contemporary, Eclectic, and more. Show buyers the potential without moving a single piece of furniture.',
  },
  {
    icon: Clock,
    title: 'Ready in Seconds, Not Weeks',
    description: 'Skip the scheduling, delivery, and setup. Get professionally staged photos in under a minute — perfect for fast-moving listings.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Upload Your Room Photo',
    description: 'Take a photo of any empty or unfurnished room. Works with bedrooms, living rooms, kitchens, offices, and more.',
  },
  {
    number: '02',
    title: 'Pick a Design Style',
    description: 'Choose from curated interior styles — Japandi, Contemporary, Eclectic, Scandinavian, Mid-Century Modern, and others.',
  },
  {
    number: '03',
    title: 'Download Staged Images',
    description: 'Get photo-realistic staged images ready for MLS listings, property portals, social media, and print materials.',
  },
];

const useCases = [
  {
    icon: Building2,
    title: 'Real Estate Listings',
    description: 'Stage vacant properties to sell faster and at higher prices. Staged homes sell 73% faster on average.',
  },
  {
    icon: BedDouble,
    title: 'Airbnb & Rental Staging',
    description: 'Show potential guests how a space looks fully furnished. Increase booking rates with aspirational interiors.',
  },
  {
    icon: Sofa,
    title: 'Interior Design Mockups',
    description: 'Present design concepts to clients before purchasing a single item. Iterate on styles in minutes, not weeks.',
  },
  {
    icon: Camera,
    title: 'Pre-Construction Marketing',
    description: 'Market properties before they\'re built. Generate furnished renders from architectural plans and empty shells.',
  },
];

export default function RealEstateStagingFeature() {
  const navigate = useNavigate();
  const [activeStyle, setActiveStyle] = useState('japandi');

  const activeImage = stagingStyles.find(s => s.key === activeStyle)?.image || stagingStyles[0].image;

  return (
    <PageLayout>
      <SEOHead
        title="AI Virtual Staging for Real Estate — VOVV.AI"
        description="Stage any empty room with AI in seconds. Generate Japandi, Contemporary, and Eclectic interiors from one photo. Save thousands vs physical staging."
        canonical={`${SITE_URL}/features/real-estate-staging`}
      />

      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Home className="w-4 h-4" />
            Real Estate Staging
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
            Stage Any Room with AI —{' '}
            <span className="text-primary">In Seconds</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            Transform empty rooms into beautifully furnished spaces. Choose from multiple design styles, 
            get photo-realistic results, and sell properties faster — without moving a single piece of furniture.
          </p>
          <Button
            size="lg"
            className="rounded-full px-10 py-6 text-base font-semibold gap-2 shadow-xl shadow-primary/25"
            onClick={() => navigate('/auth')}
          >
            Stage Your First Room Free
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Interactive Before/After Gallery */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-3">
            One Photo, Endless Possibilities
          </h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            See how one empty room transforms into completely different interiors with a single click.
          </p>

          {/* Style tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {stagingStyles.map((style) => (
              <button
                key={style.key}
                onClick={() => setActiveStyle(style.key)}
                className={cn(
                  'px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
                  activeStyle === style.key
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border hover:border-primary/30'
                )}
              >
                {style.label}
              </button>
            ))}
          </div>

          {/* Image display with crossfade */}
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-muted border border-border shadow-2xl shadow-primary/5">
            {stagingStyles.map((style) => (
              <img
                key={style.key}
                src={style.image}
                alt={`Room staged in ${style.label} style`}
                className={cn(
                  'absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out',
                  activeStyle === style.key ? 'opacity-100' : 'opacity-0'
                )}
                loading="lazy"
              />
            ))}
            {/* Style label overlay */}
            <div className="absolute bottom-4 left-4 px-4 py-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border">
              <span className="text-sm font-medium text-foreground">
                {activeStyle === 'empty' ? 'Before — Empty Room' : `After — ${stagingStyles.find(s => s.key === activeStyle)?.label} Style`}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
            Why AI Virtual Staging?
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Everything physical staging does, for a fraction of the cost and time.
          </p>
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
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">How It Works</h2>
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

      {/* Use Cases */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
            Built for Real Estate Professionals
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Whether you're listing, renting, designing, or marketing — AI staging fits your workflow.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <Card key={uc.title} className="bg-card border-border">
                <CardContent className="pt-6 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <uc.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{uc.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{uc.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Stage Your First Room Free
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            See the transformation yourself. Upload an empty room photo and get a beautifully staged result in seconds — no credit card required.
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
    </PageLayout>
  );
}
