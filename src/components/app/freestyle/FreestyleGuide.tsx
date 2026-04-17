import React from 'react';
import { Link } from 'react-router-dom';
import { Package, User, Image, Sparkles, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const GUIDE_STEPS = [
  {
    key: 'product',
    icon: Package,
    title: 'Add Your Product',
    description: 'Select the product you want featured in your image — it will be the hero of the photo.',
  },
  {
    key: 'model',
    icon: User,
    title: 'Choose a Model',
    description: 'Pick a specific model to appear in your photo wearing or showcasing your product.',
  },
  {
    key: 'scene',
    icon: Image,
    title: 'Set the Scene',
    description: 'Choose a background or environment for the shoot — studio, outdoor, lifestyle, etc.',
  },
  {
    key: 'generate',
    icon: Sparkles,
    title: 'Write & Generate',
    description: 'Add extra details in the prompt if you want, then hit Generate to create your image!',
  },
] as const;

export type GuideStepKey = (typeof GUIDE_STEPS)[number]['key'];

interface FreestyleGuideProps {
  currentStep: number;
  onNext: () => void;
  onDismiss: () => void;
}

export function FreestyleGuide({ currentStep, onNext, onDismiss }: FreestyleGuideProps) {
  const step = GUIDE_STEPS[currentStep];
  if (!step) return null;

  const isLast = currentStep === GUIDE_STEPS.length - 1;
  const Icon = step.icon;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="bg-background border border-border/60 rounded-2xl shadow-lg p-4 max-w-sm">

        {/* Step indicator */}
        <div className="flex items-center gap-1.5 mb-3">
          {GUIDE_STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                i === currentStep
                  ? 'w-6 bg-primary'
                  : i < currentStep
                    ? 'w-3 bg-primary/40'
                    : 'w-3 bg-muted-foreground/20'
              )}
            />
          ))}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground font-medium">
              {currentStep + 1}/{GUIDE_STEPS.length}
            </span>
            <button
              onClick={onDismiss}
              className="text-muted-foreground/50 hover:text-foreground transition-colors"
              aria-label="Dismiss guide"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4.5 h-4.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <h4 className="text-sm font-semibold text-foreground mb-0.5">{step.title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
          {isLast ? (
            <Link
              to="/app/learn/freestyle"
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              View full guide →
            </Link>
          ) : (
            <button
              onClick={onDismiss}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip guide
            </button>
          )}
          <Button
            size="sm"
            onClick={onNext}
            className="h-7 px-3 text-xs gap-1 rounded-lg"
          >
            {isLast ? 'Got it!' : 'Next'}
            {!isLast && <ChevronRight className="w-3 h-3" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

export { GUIDE_STEPS };
