import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
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

function ValueChip({ block }: { block: Layer1ValueBlock }) {
  const Icon = ICON_MAP[block.icon];
  return (
    <div className="flex items-center gap-1 rounded-md bg-muted/30 px-2 py-1">
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
      'relative overflow-hidden border-border/30 bg-muted/5',
      'animate-in fade-in duration-500'
    )}>
      {/* Left accent */}
      <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-primary/60 via-primary/20 to-primary/60" />

      {/* Desktop: single row | Mobile: two rows */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 py-2.5 pl-4 pr-3">
        {/* Left: avatar + headline */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="h-6 w-6 ring-1 ring-border/50 shrink-0">
            <AvatarImage src={avatarUrl} alt={avatar.name} />
            <AvatarFallback className="text-[9px]">{avatar.name[0]}</AvatarFallback>
          </Avatar>
          <p className="text-sm font-medium tracking-tight leading-snug truncate">{copy.headline}</p>
        </div>

        {/* Middle: chips */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          {copy.valueBlocks.map((block) => (
            <ValueChip key={block.title} block={block} />
          ))}
        </div>

        {/* Right: CTA + dismiss */}
        <div className="flex items-center gap-2 sm:ml-auto shrink-0">
          {/* Mobile chips inline with CTA */}
          <div className="flex sm:hidden items-center gap-1.5 mr-auto">
            {copy.valueBlocks.map((block) => (
              <ValueChip key={block.title} block={block} />
            ))}
          </div>

          <Button
            size="sm"
            className="h-7 text-xs font-medium px-4"
            onClick={onSeeMore}
          >
            See Plans
          </Button>

          <button
            onClick={onDismiss}
            className="p-1.5 rounded-full hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </Card>
  );
}
