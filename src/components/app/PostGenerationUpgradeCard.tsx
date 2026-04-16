import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, TrendingUp, Zap, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { useIsMobile } from '@/hooks/use-mobile';
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

/** Desktop: full card with icon, title, detail */
function ValueBlockFull({ block, index }: { block: Layer1ValueBlock; index: number }) {
  const Icon = ICON_MAP[block.icon];
  return (
    <div
      className="flex-1 min-w-0 rounded-xl bg-muted/30 p-3 space-y-1.5 animate-in fade-in slide-in-from-bottom-1 fill-mode-both"
      style={{ animationDelay: `${600 + index * 120}ms`, animationDuration: '400ms' }}
    >
      <div className="p-1 rounded-lg bg-primary/5 w-fit">
        <Icon className="w-3.5 h-3.5 text-primary/70" />
      </div>
      <p className="text-xs font-medium tracking-tight">{block.title}</p>
      <p className="text-[11px] text-muted-foreground/80 leading-relaxed font-normal">{block.detail}</p>
    </div>
  );
}

/** Mobile: compact inline chip with icon + title only */
function ValueBlockCompact({ block, index }: { block: Layer1ValueBlock; index: number }) {
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
  const isMobile = useIsMobile();
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
      {/* Animated gradient left border */}
      <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-primary/80 via-primary/30 to-primary/80 animate-shimmer-border" />

      {/* Dismiss */}
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-2.5 rounded-full hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <CardContent className="p-5 sm:p-6 space-y-3 sm:space-y-4 pl-5 sm:pl-6">
        {/* Header with avatar + social proof */}
        <div className="flex items-start gap-3 pr-8">
          <Avatar className="h-7 w-7 ring-1 ring-border/50 mt-0.5 shrink-0">
            <AvatarImage src={avatarUrl} alt={avatar.name} />
            <AvatarFallback className="text-[10px]">{avatar.name[0]}</AvatarFallback>
          </Avatar>
          <div className="space-y-0.5 min-w-0">
            <p className="text-sm font-medium tracking-tight leading-snug">{copy.headline}</p>
            <p className="text-[11px] text-muted-foreground/60 leading-relaxed font-normal">
              {avatar.name}, {avatar.role}
            </p>
            <p className="text-xs text-muted-foreground/80 leading-relaxed font-normal mt-0.5">{subline}</p>
          </div>
        </div>

        {/* Value blocks — compact on mobile, full on desktop */}
        {isMobile ? (
          <div className="flex flex-wrap gap-1.5 pl-0">
            {copy.valueBlocks.map((block, i) => (
              <ValueBlockCompact key={block.title} block={block} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex gap-2 pl-10">
            {copy.valueBlocks.map((block, i) => (
              <ValueBlockFull key={block.title} block={block} index={i} />
            ))}
          </div>
        )}

        {/* CTAs + popular badge */}
        <div className="flex items-center gap-3 flex-wrap pl-0 sm:pl-10">
          <Button
            size="sm"
            className="min-h-[36px] text-xs font-medium px-5"
            onClick={onSeeMore}
          >
            Compare Plans
          </Button>
          <Badge
            variant="secondary"
            className="text-[10px] font-normal px-2 py-0.5 bg-primary/5 text-primary/80 border-0 hidden sm:inline-flex"
          >
            Growth — most chosen by brands
          </Badge>
          <button
            className="text-xs font-normal text-muted-foreground/60 hover:text-foreground transition-colors ml-auto"
            onClick={onDismiss}
          >
            Dismiss
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
