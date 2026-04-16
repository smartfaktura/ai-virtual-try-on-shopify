import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, TrendingUp, Zap, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import {
  type ConversionCategory,
  type BehaviorHint,
  type Layer1ValueBlock,
  getLayer1Copy,
  getLayer1Subline,
  getLayer1Avatar,
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
  forceVisible?: boolean;
}

function ValueChip({ block, index }: { block: Layer1ValueBlock; index: number }) {
  const Icon = ICON_MAP[block.icon];
  return (
    <div
      className="flex items-center gap-1.5 rounded-lg bg-muted/30 px-2.5 py-1.5 animate-in fade-in fill-mode-both"
      style={{ animationDelay: `${600 + index * 100}ms`, animationDuration: '300ms' }}
    >
      <Icon className="w-3 h-3 text-primary/70 shrink-0" />
      <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">{block.title}</span>
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
  const avatar = getLayer1Avatar(category);
  const avatarUrl = getLandingAssetUrl(`team/avatar-${avatar.avatarKey}.jpg`);

  useEffect(() => {
    if (forceVisible) return;
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [forceVisible]);

  if (!visible) return null;

  return (
    <Card className={cn(
      'relative overflow-hidden border-border/40 bg-background',
      'animate-in fade-in slide-in-from-bottom-2 duration-500'
    )}>
      <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-primary/80 via-primary/30 to-primary/80 animate-shimmer-border" />

      <button
        onClick={onDismiss}
        className="absolute top-2.5 right-2.5 p-2 rounded-full hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground min-w-[36px] min-h-[36px] flex items-center justify-center"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <CardContent className="p-4 sm:p-5 space-y-2.5">
        {/* Header */}
        <div className="flex items-start gap-3 pr-8">
          <Avatar className="h-7 w-7 ring-1 ring-border/50 mt-0.5 shrink-0">
            <AvatarImage src={avatarUrl} alt={avatar.name} />
            <AvatarFallback className="text-[10px]">{avatar.name[0]}</AvatarFallback>
          </Avatar>
          <div className="space-y-0.5 min-w-0">
            <p className="text-sm font-medium tracking-tight leading-snug">{copy.headline}</p>
            <p className="text-xs text-muted-foreground/80 leading-relaxed font-normal">{subline}</p>
          </div>
        </div>

        {/* Value chips — same on all screens */}
        <div className="flex flex-wrap gap-1.5">
          {copy.valueBlocks.map((block, i) => (
            <ValueChip key={block.title} block={block} index={i} />
          ))}
        </div>

        {/* CTA */}
        <div>
          <Button
            size="sm"
            className="min-h-[36px] text-xs font-medium px-5"
            onClick={onSeeMore}
          >
            See Plans
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
