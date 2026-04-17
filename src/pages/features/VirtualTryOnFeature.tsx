import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, Shirt, RotateCcw, Users, ScanFace, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';

const benefits = [
  {
    icon: Users,
    title: 'Diverse Model Library',
    description: 'Access 40+ AI models spanning every body type, ethnicity, and age range — or upload your own custom models.',
  },
  {
    icon: ScanFace,
    title: 'Realistic Fitting',
    description: 'Our AI understands fabric drape, body proportions, and garment construction for true-to-life results.',
  },
  {
    icon: Maximize,
    title: 'Multiple Angles & Framings',
    description: 'Full body, upper body, close-up — generate every angle you need from a single product image.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Upload Your Garment',
    description: 'Drop in a flat lay, hanger shot, or ghost mannequin photo. Our AI isolates the garment automatically.',
  },
  {
    number: '02',
    title: 'Choose Your Models',
    description: 'Browse our diverse AI model library or upload your own. Select body types, poses, and framings.',
  },
  {
    number: '03',
    title: 'Get On-Model Shots',
    description: 'Receive photo-realistic on-model images ready for your product pages, social media, and ads.',
  },
];

export default function VirtualTryOnFeature() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <SEOHead title="Virtual Try-On for Fashion Brands — VOVV.AI" description="AI-powered virtual try-on with 40+ diverse models. Upload a clothing item and get realistic on-model photography in seconds. Reduce returns by 40%." canonical={`${SITE_URL}/features/virtual-try-on`} />
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Shirt className="w-4 h-4" />
            Virtual Try-On
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-6">
            See Your Products on Real AI Models
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            Skip the photoshoot. Upload a garment and instantly generate on-model shots with diverse AI models — realistic fitting, every angle, every body type.
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
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Why Virtual Try-On?</h2>
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
          <h2 className="text-3xl font-bold text-foreground mb-4">Try It On — Without the Photoshoot</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Upload your first garment and generate on-model shots in minutes. Free to start.
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
