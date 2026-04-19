import React from 'react';
import { Sparkles, RefreshCw, Settings2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductThumbnail } from '@/components/app/product-images/ProductThumbnail';
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

export const AiStylistCard: React.FC<Props> = ({ picks, onRestyle, onToggleCustomize, customizeOpen }) => {
  if (picks.length === 0) return null;
  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Our AI stylist preselected the best match</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {picks.length === 1
              ? 'A curated look tailored to your product.'
              : `Each of your ${picks.length} products gets its own styling.`}
          </p>
        </div>
      </div>

      <ul className="space-y-2">
        {picks.map(({ product, presetName }) => (
          <li
            key={product.id}
            className="flex items-center gap-3 rounded-lg bg-card border border-border/60 px-3 py-2"
          >
            <ProductThumbnail imageUrl={product.image_url} alt={product.title} size="sm" className="w-9 h-9 rounded-md flex-shrink-0" />
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
