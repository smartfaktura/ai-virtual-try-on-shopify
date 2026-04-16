import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Layers, TrendingUp, Zap, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type ConversionCategory,
  type BehaviorHint,
  type Layer1ValueBlock,
  getLayer1Copy,
  getLayer1Subline,
} from '@/lib/conversionCopy';

const ICON_MAP = {
  'layers': Layers,
  'trending-up': TrendingUp,
  'zap': Zap,
} as const;

interface PostGenerationUpgradeCardProps {
  category: ConversionCategory;
  onSeeMore: () => void;
  onDismiss: () => void;
  behaviorHint?: BehaviorHint;
  /** Skip the 3s delay (used in admin preview) */
  forceVisible?: boolean;
}

function ValueBlock({ block }: { block: Layer1ValueBlock }) {
  const Icon = ICON_MAP[block.icon];
  return (
    <div className="flex-1 min-w-0 rounded-xl border border-border/50 bg-background p-3 space-y-1.5">
      <div className="p-1.5 rounded-lg bg-primary/8 w-fit">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <p className="text-xs font-semibold tracking-tight">{block.title}</p>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{block.detail}</p>
    </div>
  );
}

export function PostGenerationUpgradeCard({
  category,
  onSeeMore,
  onDismiss,
  behaviorHint,
  forceVisible = false,
}: PostGenerationUpgradeCardProps) {
  const [visible, setVisible] = useState(forceVisible);
  const copy = getLayer1Copy(category);
  const subline = getLayer1Subline(category, behaviorHint);

  useEffect(() => {
    if (forceVisible) return;
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [forceVisible]);

  if (!visible) return null;

  return (
    <Card className={cn(
      'relative overflow-hidden border-l-2 border-l-primary border-border/40 bg-background',
      'animate-in fade-in slide-in-from-bottom-2 duration-500'
    )}>
      {/* Dismiss */}
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-2.5 rounded-full hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-2.5 pr-8">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 mt-0.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-semibold tracking-tight leading-snug">{copy.headline}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{subline}</p>
          </div>
        </div>

        {/* Value blocks */}
        <div className="flex flex-col sm:flex-row gap-2.5 pl-0 sm:pl-9">
          {copy.valueBlocks.map((block) => (
            <ValueBlock key={block.title} block={block} />
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-4 pl-0 sm:pl-9">
          <Button
            size="sm"
            className="min-h-[36px] text-xs font-medium px-5"
            onClick={onSeeMore}
          >
            See Plans & Features
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="min-h-[36px] text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={onDismiss}
          >
            Maybe Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
