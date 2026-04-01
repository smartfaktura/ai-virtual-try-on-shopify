import { FASHION_STYLES } from '@/lib/catalogEngine';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check, Sparkles, Crown, Zap, Gem, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FashionStyleId } from '@/types/catalog';

const STYLE_ICONS: Record<string, React.ElementType> = {
  minimal_studio: Sparkles,
  premium_neutral: Crown,
  editorial_clean: Star,
  streetwear_clean: Zap,
  luxury_soft: Gem,
};

const STYLE_ACCENTS: Record<string, string> = {
  minimal_studio: 'from-muted/60 to-muted/20',
  premium_neutral: 'from-amber-500/10 to-amber-500/5',
  editorial_clean: 'from-violet-500/10 to-violet-500/5',
  streetwear_clean: 'from-blue-500/10 to-blue-500/5',
  luxury_soft: 'from-rose-500/10 to-rose-500/5',
};

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
        <p className="text-sm text-muted-foreground mt-1">This sets the tone, lighting, and wardrobe for your entire catalog.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FASHION_STYLES.map(style => {
          const isSelected = selectedStyle === style.id;
          const Icon = STYLE_ICONS[style.id] || Sparkles;
          const accent = STYLE_ACCENTS[style.id] || 'from-muted/60 to-muted/20';
          return (
            <button
              key={style.id}
              onClick={() => onStyleChange(style.id)}
              className={cn(
                'relative rounded-2xl border-2 p-6 text-left transition-all group',
                isSelected
                  ? 'border-primary ring-2 ring-primary/30 bg-primary/5 shadow-lg'
                  : 'border-border hover:border-primary/40 hover:shadow-md bg-card',
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
              <div className="space-y-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center',
                  accent,
                )}>
                  <Icon className={cn('w-5 h-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{style.label}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">{style.description}</p>
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
