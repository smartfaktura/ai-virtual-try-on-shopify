import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Upload, Palette, Sparkles, ArrowRight } from 'lucide-react';

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
    <Card className="card-elevated border-0">
      <CardContent className="p-5 space-y-4">
        {/* Progress bar — thin, restrained */}
        <div className="w-full h-[3px] bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground font-medium">
            {completedCount} of {steps.length} complete
          </span>
        </div>

        <div className="space-y-1">
          {steps.map((step, index) => {
            const done = completionMap[step.key];
            const isLast = index === steps.length - 1;
            return (
              <div
                key={step.key}
                className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
                  done
                    ? 'bg-muted/30'
                    : 'bg-transparent'
                } ${!isLast ? 'border-b border-border/50' : ''}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {done ? (
                    <CheckCircle className="w-5 h-5 text-muted-foreground/60" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground/30" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg font-light text-muted-foreground">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className={`text-sm font-medium ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 ml-[1.85rem]">{step.description}</p>
                </div>
                {!done && (
                  <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground gap-1" onClick={() => navigate(step.path)}>
                    {step.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}