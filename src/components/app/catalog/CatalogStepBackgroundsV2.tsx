import { BACKGROUNDS } from '@/lib/catalogEngine';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CatalogStepBackgroundsV2Props {
  selectedBackgroundId: string | null;
  onBackgroundChange: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
}

export function CatalogStepBackgroundsV2({
  selectedBackgroundId, onBackgroundChange, onBack, onNext, canProceed,
}: CatalogStepBackgroundsV2Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-foreground">Select Background</h3>
        <p className="text-sm text-muted-foreground mt-1">Choose one studio background for your entire set.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {BACKGROUNDS.map(bg => {
          const isSelected = selectedBackgroundId === bg.id;
          return (
            <button
              key={bg.id}
              onClick={() => onBackgroundChange(bg.id)}
              className={cn(
                'relative rounded-lg border overflow-hidden transition-all',
                isSelected
                  ? 'border-primary ring-1 ring-primary/30'
                  : 'border-border hover:border-primary/30',
              )}
            >
              <div
                className="aspect-[4/3] w-full"
                style={{ backgroundColor: bg.hex }}
              />

              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}

              <div className="px-3 py-2 bg-card">
                <p className="text-xs font-medium text-foreground">{bg.label}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-[10px] text-muted-foreground">{bg.shadowStyle} shadows</p>
                  <span className="text-[9px] font-mono text-muted-foreground/70">{bg.hex}</span>
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
          Next: Shots <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
