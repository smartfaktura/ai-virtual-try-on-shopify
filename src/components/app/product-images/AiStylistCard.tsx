import React from 'react';
import { RefreshCw, Settings2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import type { UserProduct } from './types';
import { cn } from '@/lib/utils';

export interface ProductPick {
  product: UserProduct;
  presetName: string;
}

interface Props {
  picks: ProductPick[];
  onRestyle: () => void;
  onToggleCustomize: () => void;
  customizeOpen: boolean;
}

const STYLIST_AVATAR = getOptimizedUrl(getLandingAssetUrl('team/avatar-sienna.jpg'), { quality: 70 });

export const AiStylistCard: React.FC<Props> = ({ picks, onRestyle, onToggleCustomize, customizeOpen }) => {
  if (picks.length === 0) return null;
  const tagline =
    picks.length === 1
      ? 'Personally curated this look for your product'
      : `Personally curated a unique look for each of your ${picks.length} products`;

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background p-5 space-y-4">
      <div className="flex items-start gap-3">
        <img
          src={STYLIST_AVATAR}
          alt="Sienna, VOVV.AI Stylist"
          className="w-10 h-10 rounded-full object-cover ring-1 ring-primary/20 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            Sienna <span className="text-muted-foreground font-normal">· VOVV.AI Stylist</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{tagline}</p>
        </div>
      </div>

      <ul className="space-y-2">
        {picks.map(({ product, presetName }) => (
          <li
            key={product.id}
            className="flex items-center gap-3 rounded-lg bg-card border border-border/60 px-3 py-2"
          >
            <div className="w-12 h-12 rounded-lg border border-border/40 overflow-hidden flex items-center justify-center flex-shrink-0">
              <img
                src={getOptimizedUrl(product.image_url, { quality: 70 })}
                alt={product.title}
                className="w-full h-full object-cover scale-110"
              />
            </div>
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className="text-xs font-medium text-foreground truncate">{product.title}</span>
              <span className="text-muted-foreground/60 text-xs flex-shrink-0">→</span>
              <span className="text-xs text-primary font-medium truncate">{presetName}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRestyle}
          className="h-8 text-xs gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Re-style
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleCustomize}
          className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Settings2 className="w-3.5 h-3.5" />
          Customize
          <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', customizeOpen && 'rotate-180')} />
        </Button>
      </div>
    </div>
  );
};
