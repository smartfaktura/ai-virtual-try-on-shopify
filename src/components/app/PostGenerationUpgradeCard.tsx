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
  /** Skip the 3s delay (used in admin preview) */
  forceVisible?: boolean;
}

function ValueBlock({ block }: { block: Layer1ValueBlock }) {
  const Icon = ICON_MAP[block.icon];
  return (
    <div className="flex-1 min-w-0 rounded-xl bg-muted/30 p-3 space-y-1.5">
      <div className="p-1 rounded-lg bg-primary/5 w-fit">
        <Icon className="w-3.5 h-3.5 text-primary/70" />
      </div>
      <p className="text-xs font-medium tracking-tight">{block.title}</p>
      <p className="text-[11px] text-muted-foreground/80 leading-relaxed font-normal">{block.detail}</p>
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
      'relative overflow-hidden border-l-2 border-l-primary/60 border-border/40 bg-background',
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
        {/* Header with avatar */}
        <div className="flex items-start gap-3 pr-8">
          <Avatar className="h-7 w-7 ring-1 ring-border/50 mt-0.5 shrink-0">
            <AvatarImage src={avatarUrl} alt={avatar.name} />
            <AvatarFallback className="text-[10px]">{avatar.name[0]}</AvatarFallback>
          </Avatar>
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-medium tracking-tight leading-snug">{copy.headline}</p>
            <p className="text-xs text-muted-foreground/80 leading-relaxed font-normal">{subline}</p>
          </div>
        </div>

        {/* Value blocks */}
        <div className="flex flex-col sm:flex-row gap-2 pl-0 sm:pl-10">
          {copy.valueBlocks.map((block) => (
            <ValueBlock key={block.title} block={block} />
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-4 pl-0 sm:pl-10">
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
            className="min-h-[36px] text-xs font-normal text-muted-foreground hover:text-foreground"
            onClick={onDismiss}
          >
            Maybe Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
