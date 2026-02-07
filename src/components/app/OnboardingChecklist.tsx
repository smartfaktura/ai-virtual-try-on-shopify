import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Upload, Palette, Sparkles } from 'lucide-react';

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
  },
  {
    key: 'brand',
    title: 'Create Your Brand Profile',
    description: 'Set your visual style — tone, lighting, colors.',
    icon: Palette,
    path: '/app/brand-profiles',
    cta: 'Go to Brand Profiles',
  },
  {
    key: 'generate',
    title: 'Generate Your First Visual Set',
    description: 'Product Photos or Virtual Try-On — your choice.',
    icon: Sparkles,
    path: '/app/workflows',
    cta: 'Go to Workflows',
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
    <Card className="card-elevated border-0 rounded-xl overflow-hidden">
      {/* Edge-to-edge gradient progress bar */}
      <div className="h-1 w-full bg-muted">
        <div
          className="h-full bg-gradient-to-r from-primary via-primary to-primary/60 transition-all duration-500"
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        />
      </div>

      <CardContent className="p-6 space-y-1">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-muted-foreground font-medium">
            {completedCount} of {steps.length} complete
          </span>
        </div>

        <div className="space-y-0">
          {steps.map((step, index) => {
            const done = completionMap[step.key];
            const isLast = index === steps.length - 1;
            return (
              <div
                key={step.key}
                className={`flex items-start gap-5 py-5 transition-all ${
                  done ? 'opacity-50' : ''
                } ${!isLast ? 'border-b border-border/40' : ''}`}
              >
                {/* Large watermark step number */}
                <span className="text-3xl font-extralight text-foreground/[0.08] leading-none select-none w-10 flex-shrink-0 pt-0.5">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-medium ${done ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {step.title}
                    </h3>
                    {done && <Check className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                </div>

                {!done && (
                  <button
                    onClick={() => navigate(step.path)}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 decoration-foreground/20 hover:decoration-foreground/60 transition-colors flex-shrink-0 pt-0.5"
                  >
                    {step.cta}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
