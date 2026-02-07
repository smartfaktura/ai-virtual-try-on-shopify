import { useNavigate } from 'react-router-dom';
import { Check, Upload, Palette, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

import imgProduct from '@/assets/products/serum-vitamin-c.jpg';
import imgBrand from '@/assets/showcase/skincare-set-minimal.jpg';
import imgGenerate from '@/assets/showcase/fashion-dress-botanical.jpg';

interface OnboardingChecklistProps {
  productCount: number;
  brandProfileCount: number;
  jobCount: number;
}

const steps = [
  {
    key: 'products',
    title: 'Upload Your First Product',
    description: 'Add a product image to start generating visuals.',
    icon: Upload,
    path: '/app/products',
    cta: 'Go to Products',
    preview: imgProduct,
  },
  {
    key: 'brand',
    title: 'Create Your Brand Profile',
    description: 'Set your visual style — tone, lighting, colors.',
    icon: Palette,
    path: '/app/brand-profiles',
    cta: 'Go to Brand Profiles',
    preview: imgBrand,
  },
  {
    key: 'generate',
    title: 'Generate Your First Visual Set',
    description: 'Product Photos or Virtual Try-On — your choice.',
    icon: Sparkles,
    path: '/app/workflows',
    cta: 'Go to Workflows',
    preview: imgGenerate,
  },
] as const;

export function OnboardingChecklist({ productCount, brandProfileCount, jobCount }: OnboardingChecklistProps) {
  const navigate = useNavigate();

  const completionMap: Record<string, boolean> = {
    products: productCount > 0,
    brand: brandProfileCount > 0,
    generate: jobCount > 0,
  };

  const completedCount = Object.values(completionMap).filter(Boolean).length;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Progress bar */}
      <div className="h-1 w-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        />
      </div>

      <div className="p-6">
        <p className="text-sm text-muted-foreground mb-6">
          {completedCount} of {steps.length} complete
        </p>

        <div className="space-y-0">
          {steps.map((step, index) => {
            const done = completionMap[step.key];
            const isLast = index === steps.length - 1;
            const StepIcon = step.icon;
            return (
              <div
                key={step.key}
                className={`flex items-center gap-4 py-4 ${!isLast ? 'border-b border-border' : ''}`}
              >
                {/* Step number circle — matches landing HowItWorks */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  done
                    ? 'bg-primary/10 text-primary'
                    : 'bg-primary text-primary-foreground'
                }`}>
                  {done ? <Check className="w-4 h-4" /> : String(index + 1).padStart(2, '0')}
                </div>

                {/* Preview thumbnail */}
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-border flex-shrink-0 hidden sm:block">
                  <img src={step.preview} alt={step.title} className="w-full h-full object-cover" loading="lazy" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold ${done ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                </div>

                {!done && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full font-semibold gap-1 flex-shrink-0"
                    onClick={() => navigate(step.path)}
                  >
                    {step.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
