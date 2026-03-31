import { CATALOG_MOODS } from '@/data/catalogPoses';
import { Button } from '@/components/ui/button';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { ChevronLeft, ChevronRight, Ban, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CatalogStepExpressionProps {
  selectedMood: string;
  onMoodChange: (mood: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function CatalogStepExpression({
  selectedMood, onMoodChange, onBack, onNext,
}: CatalogStepExpressionProps) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base">Choose an expression</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select the mood and facial expression for your model shots
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} size="sm" className="gap-1.5">
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </Button>
          <Button onClick={onNext} size="sm" className="gap-1.5">
            Next: Models <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Mood grid — 3 columns, larger cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl">
        {CATALOG_MOODS.map(mood => {
          const isSelected = selectedMood === mood.id;
          const isAny = mood.id === 'any';

          return (
            <button
              key={mood.id}
              onClick={() => onMoodChange(mood.id)}
              className={cn(
                'relative rounded-xl overflow-hidden border-2 transition-all text-left group',
                isSelected
                  ? 'border-primary ring-2 ring-primary/30 shadow-lg scale-[1.02]'
                  : 'border-border hover:border-primary/50 hover:shadow-md',
              )}
            >
              {isAny ? (
                <div className="aspect-[3/4] bg-muted flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Ban className="w-8 h-8 text-muted-foreground mx-auto" />
                    <span className="text-xs text-muted-foreground">AI decides</span>
                  </div>
                </div>
              ) : mood.previewUrl ? (
                <div className="relative">
                  <ShimmerImage
                    src={mood.previewUrl}
                    alt={mood.name}
                    className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105"
                    aspectRatio="3/4"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                    <p className="text-white text-sm font-bold tracking-wide">{mood.name}</p>
                  </div>
                </div>
              ) : (
                <div className="aspect-[3/4] bg-muted" />
              )}

              <div className="px-3 py-2">
                <p className="text-[11px] text-muted-foreground leading-tight">{mood.description}</p>
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
