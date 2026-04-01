import { FASHION_STYLES } from '@/lib/catalogEngine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Palette, Check } from 'lucide-react';
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
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Fashion Style</h3>
        <Badge variant="secondary" className="text-[10px]">Required</Badge>
        <span className="text-xs text-muted-foreground ml-1">Sets the styling tone for your entire catalog set</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {FASHION_STYLES.map(style => {
          const isSelected = selectedStyle === style.id;
          return (
            <button
              key={style.id}
              onClick={() => onStyleChange(style.id)}
              className={cn(
                'relative rounded-xl border-2 p-4 text-left transition-all group',
                isSelected
                  ? 'border-primary ring-2 ring-primary/30 bg-primary/5 shadow-lg'
                  : 'border-border hover:border-primary/50 hover:shadow-md bg-card',
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">{style.label}</p>
                <p className="text-[11px] text-muted-foreground leading-snug">{style.description}</p>
                <div className="flex gap-1 pt-1">
                  <Badge variant="outline" className="text-[9px] px-1.5">{style.poseEnergy}</Badge>
                  <Badge variant="outline" className="text-[9px] px-1.5">{style.accessoryIntensity === 'none' ? 'no accessories' : style.accessoryIntensity}</Badge>
                </div>
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
