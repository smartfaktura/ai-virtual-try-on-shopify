import { Upload, Palette, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const steps = [
  {
    icon: Upload,
    number: '01',
    title: 'Upload Your Product',
    description: 'Drag & drop your product image or import from your product library. Works with any product type — clothing, cosmetics, food, home goods, and more.',
  },
  {
    icon: Palette,
    number: '02',
    title: 'Set Your Brand Style',
    description: 'Create a Brand Profile once with your preferred tone, lighting, and background style. Every future generation stays on-brand automatically.',
  },
  {
    icon: Calendar,
    number: '03',
    title: 'Get Monthly Visuals',
    description: 'Choose a workflow or set up Creative Drops to receive fresh, professional product visuals on autopilot — monthly or biweekly.',
  },
];

export function HowItWorks() {
  const navigate = useNavigate();
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
            Three Steps to Automated Product Visuals
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Set it once, get fresh visuals forever. No design skills needed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          {steps.map((step, idx) => (
            <div key={step.number} className="relative">
              {/* Connector line (hidden on last) */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-px bg-border" />
              )}

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-card border border-border shadow-sm mb-6 relative">
                  <step.icon className="w-10 h-10 text-primary" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" className="rounded-full px-8 py-6 text-base font-semibold gap-2 shadow-lg shadow-primary/25" onClick={() => navigate('/auth')}>
            Try It Free — Takes 30 Seconds
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
