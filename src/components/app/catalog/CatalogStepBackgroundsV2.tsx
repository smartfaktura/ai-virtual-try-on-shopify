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

      <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
        {BACKGROUNDS.map(bg => {
          const isSelected = selectedBackgroundId === bg.id;
          return (
            <button
              key={bg.id}
              onClick={() => onBackgroundChange(bg.id)}
              aria-label={bg.label}
              className={cn(
                'relative rounded-xl overflow-hidden transition-all duration-150 group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isSelected
                  ? 'ring-2 ring-primary shadow-md'
                  : 'ring-1 ring-border hover:ring-primary/30 hover:shadow-sm',
              )}
            >
              {/* Full-bleed color swatch */}
              <div
                className="aspect-[4/3] w-full"
                style={{ backgroundColor: bg.hex }}
              />

              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}

              {/* Label overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent px-3 py-2.5">
                <p className="text-xs font-medium text-white">{bg.label}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-[10px] text-white/70">{bg.shadowStyle} shadows</p>
                  <span className="text-[9px] font-mono text-white/50">{bg.hex}</span>
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
