import { Sparkles, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { ShimmerImage } from '@/components/ui/shimmer-image';

const RESULT_IMAGES = [
  getOptimizedUrl(getLandingAssetUrl('showcase/virtual-tryon-1.png'), { quality: 70 }),
  getOptimizedUrl(getLandingAssetUrl('showcase/virtual-tryon-2.png'), { quality: 70 }),
  getOptimizedUrl(getLandingAssetUrl('showcase/cafe-lifestyle.png'), { quality: 70 }),
];

const PROMPT_HINT = 'Shoot my crop top on a court, studio, and café';

interface Props {
  onSelect: () => void;
  mobileCompact?: boolean;
}

export function FreestylePromptCard({ onSelect, mobileCompact }: Props) {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden border transition-all duration-300 flex flex-col cursor-pointer',
        'hover:shadow-lg hover:border-primary/30',
      )}
      onClick={onSelect}
    >
      {/* Visual area */}
      <div className={cn(
        'relative w-full overflow-hidden bg-muted/20',
        mobileCompact ? 'aspect-[2/3]' : 'aspect-[3/4]',
      )}>
        <div className="absolute inset-0 grid grid-cols-3 gap-0.5">
          {RESULT_IMAGES.map((src, i) => (
            <ShimmerImage
              key={i}
              src={src}
              alt={`Freestyle result ${i + 1}`}
              className="w-full h-full object-cover"
            />
          ))}
        </div>

        {/* Frosted prompt hint */}
        <div className="absolute bottom-2 left-2 right-2 z-10">
          <div className="backdrop-blur-md bg-background/60 border border-border/30 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-primary shrink-0" />
            <p className="text-[10px] text-foreground/70 leading-tight truncate">{PROMPT_HINT}</p>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className={cn('flex flex-col gap-1 flex-1', mobileCompact ? 'p-2' : 'p-4')}>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
          <h3 className={cn('font-bold tracking-tight leading-tight', mobileCompact ? 'text-[11px]' : 'text-sm')}>
            Freestyle Studio
          </h3>
        </div>
        {!mobileCompact && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            Describe any shot, scene, or style you want
          </p>
        )}
        <div className="pt-1 mt-auto">
          <Button
            size="sm"
            variant="outline"
            className={cn(
              'rounded-full font-semibold gap-1.5 w-full border-primary/20 hover:bg-primary hover:text-primary-foreground transition-colors',
              mobileCompact ? 'h-8 px-3 text-xs' : 'h-8 px-5',
            )}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
          >
            Create with Prompt
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
