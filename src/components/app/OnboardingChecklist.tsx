import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Upload, Palette, Sparkles } from 'lucide-react';

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
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Get Started</h2>
          <span className="text-sm text-muted-foreground">
            {completedCount} of {steps.length} complete
          </span>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => {
            const done = completionMap[step.key];
            const StepIcon = step.icon;
            return (
              <div
                key={step.key}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                  done
                    ? 'bg-muted/50 border-border'
                    : 'bg-card border-border hover:border-primary/30'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {done ? (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className={`text-sm font-semibold ${done ? 'text-muted-foreground line-through' : ''}`}>
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                </div>
                {!done && (
                  <Button size="sm" variant="outline" onClick={() => navigate(step.path)}>
                    {step.cta}
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
