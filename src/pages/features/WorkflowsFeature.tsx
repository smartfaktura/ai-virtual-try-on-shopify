import { useNavigate } from 'react-router-dom';
import { ArrowRight, Layers, Zap, Palette, UploadCloud, Settings2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageLayout } from '@/components/landing/PageLayout';

const benefits = [
  {
    icon: Zap,
    title: 'No Prompts Needed',
    description: 'Select a workflow and your product — our AI handles the rest. No writing prompts, no guessing parameters.',
  },
  {
    icon: Layers,
    title: 'Batch Processing',
    description: 'Generate on-model, lifestyle, flat lay, and detail shots in a single run. Dozens of images from one upload.',
  },
  {
    icon: Palette,
    title: 'Brand-Consistent Output',
    description: 'Pair workflows with Brand Profiles to ensure every image matches your visual identity automatically.',
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
    title: 'Pick a Workflow',
    description: 'Choose from curated workflows like "On-Model Editorial", "Lifestyle Scene", or "Social Media Pack". Each one is a complete visual pipeline.',
  },
  {
    number: '03',
    title: 'Receive Studio-Quality Images',
    description: 'Your images are generated and delivered to your library — ready to download, share, or push to your store.',
  },
];

export default function WorkflowsFeature() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Settings2 className="w-4 h-4" />
            Workflows
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-6">
            Automated Visual Pipelines for Every Product
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            Upload once, get on-model shots, lifestyle scenes, flat lays, and more — all without writing a single prompt. Workflows turn your product images into a complete visual library.
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
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Why Workflows?</h2>
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
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Automate Your Visuals?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Sign up free and run your first workflow in minutes. No credit card required.
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
