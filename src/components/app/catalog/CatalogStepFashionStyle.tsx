import { FASHION_STYLES } from '@/lib/catalogEngine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FashionStyleId } from '@/types/catalog';

const STYLE_MOODS: Record<FashionStyleId, string[]> = {
  minimal_studio: ['hsl(0 0% 95%)', 'hsl(0 0% 85%)', 'hsl(0 0% 75%)'],
  premium_neutral: ['hsl(35 20% 90%)', 'hsl(30 15% 80%)', 'hsl(25 12% 65%)'],
  editorial_clean: ['hsl(220 15% 92%)', 'hsl(215 10% 80%)', 'hsl(210 8% 60%)'],
  streetwear_clean: ['hsl(0 0% 20%)', 'hsl(0 0% 40%)', 'hsl(0 0% 65%)'],
  luxury_soft: ['hsl(40 30% 92%)', 'hsl(35 25% 82%)', 'hsl(30 20% 70%)'],
};

const RECOMMENDED_STYLE: FashionStyleId = 'premium_neutral';

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
        {FASHION_STYLES.map(style => {
          const isSelected = selectedStyle === style.id;
          const isRecommended = style.id === RECOMMENDED_STYLE;
          const moods = STYLE_MOODS[style.id] || ['hsl(0 0% 90%)', 'hsl(0 0% 80%)', 'hsl(0 0% 70%)'];

          return (
            <button
              key={style.id}
              onClick={() => onStyleChange(style.id)}
              className={cn(
                'relative rounded-xl border overflow-hidden text-left transition-all duration-150 group flex flex-col h-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isSelected
                  ? 'border-primary ring-2 ring-primary/20 bg-card'
                  : 'border-border hover:border-primary/30 bg-card hover:shadow-sm',
              )}
            >
              {/* Color mood strip */}
              <div className="h-2 flex shrink-0" aria-hidden="true">
                {moods.map((color, i) => (
                  <div key={i} className="flex-1" style={{ backgroundColor: color }} />
                ))}
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-semibold text-foreground">{style.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed min-h-[2.5rem] line-clamp-3">{style.description}</p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 ml-2">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>

                <div className="h-5 mt-2">
                  {isRecommended && !isSelected ? (
                    <Badge variant="secondary" className="text-[9px] gap-1">
                      <Star className="w-2.5 h-2.5" /> Popular
                    </Badge>
                  ) : null}
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
          Next: Models <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
