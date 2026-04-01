import { BACKGROUNDS } from '@/lib/catalogEngine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Image, Check } from 'lucide-react';
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
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Image className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Select Background</h3>
        <Badge variant="secondary" className="text-[10px]">Required</Badge>
        <span className="text-xs text-muted-foreground ml-1">Choose one studio background for your entire set</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {BACKGROUNDS.map(bg => {
          const isSelected = selectedBackgroundId === bg.id;
          return (
            <button
              key={bg.id}
              onClick={() => onBackgroundChange(bg.id)}
              className={cn(
                'relative rounded-xl border-2 overflow-hidden transition-all group',
                isSelected
                  ? 'border-primary ring-2 ring-primary/30 shadow-lg scale-[1.02]'
                  : 'border-border hover:border-primary/50 hover:shadow-md',
              )}
            >
              {/* Color swatch */}
              <div
                className="aspect-[4/3] w-full"
                style={{ backgroundColor: bg.hex }}
              />

              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}

              <div className="px-3 py-2 bg-card">
                <p className="text-xs font-semibold text-foreground">{bg.label}</p>
                <p className="text-[10px] text-muted-foreground">{bg.shadowStyle} shadows</p>
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
