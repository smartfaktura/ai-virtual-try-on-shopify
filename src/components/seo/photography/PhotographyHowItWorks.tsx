import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDown, ImagePlus, Wand2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
  {
    num: '01',
    title: 'Upload your product photo',
    text: 'Start with one clean image of your product.',
    Icon: ImagePlus,
  },
  {
    num: '02',
    title: 'Choose a visual direction',
    text: 'Pick product page shots, lifestyle scenes, campaign visuals, social content, or category-specific styles.',
    Icon: Wand2,
  },
  {
    num: '03',
    title: 'Generate brand-ready visuals',
    text: 'Create images for your store, ads, emails, social, and product launches.',
    Icon: Sparkles,
  },
];

export function PhotographyHowItWorks() {
  return (
    <section className="py-16 lg:py-32 bg-background">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            How it works
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            Create AI product photos in minutes
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Three steps. No studio, no models, no setup.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-4">
          {STEPS.map((step, i) => (
            <div key={step.num} className="contents">
              <div className="flex-1 max-w-sm mx-auto w-full bg-white rounded-3xl border border-[#f0efed] shadow-sm p-7 lg:p-8 relative overflow-hidden">
                <span className="absolute top-5 right-6 text-[11px] font-mono font-medium tracking-[0.18em] text-foreground/30">
                  {step.num}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-[#1a1a2e] text-white flex items-center justify-center mb-5 shadow-sm">
                  <step.Icon size={20} strokeWidth={1.75} />
                </div>
                <h3 className="text-[#1a1a2e] text-lg font-semibold mb-2 tracking-tight">{step.title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{step.text}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex items-center justify-center text-muted-foreground/50 shrink-0">
                  <ArrowDown size={20} className="lg:hidden" strokeWidth={1.5} />
                  <ArrowRight size={20} className="hidden lg:block" strokeWidth={1.5} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3 mt-12 lg:mt-16">
          <Button asChild size="lg" className="rounded-full px-8 h-[3.25rem] text-base font-semibold shadow-lg shadow-primary/25">
            <Link to="/app/generate/product-images">
              Create your first visuals free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">Free credits · No card required</p>
        </div>
      </div>
    </section>
  );
}
