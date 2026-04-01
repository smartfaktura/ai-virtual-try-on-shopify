import { FASHION_STYLES } from '@/lib/catalogEngine';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FashionStyleId } from '@/types/catalog';

interface CatalogStepFashionStyleProps {
  selectedStyle: FashionStyleId | null;
  onStyleChange: (id: FashionStyleId) => void;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
}

export function CatalogStepFashionStyle({
  selectedStyle, onStyleChange, onBack, onNext, canProceed,
}: CatalogStepFashionStyleProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-foreground">Choose a styling direction</h3>
        <p className="text-sm text-muted-foreground mt-1">Sets the tone, lighting, and wardrobe for your catalog.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {FASHION_STYLES.map(style => {
          const isSelected = selectedStyle === style.id;
          return (
            <button
              key={style.id}
              onClick={() => onStyleChange(style.id)}
              className={cn(
                'relative rounded-lg border p-5 text-left transition-all',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30 bg-card',
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-foreground">{style.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{style.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed} className="gap-2">
          Next: Model <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
