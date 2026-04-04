import { Button } from '@/components/ui/button';
import { ShimmerImage } from '@/components/ui/shimmer-image';

import { ChevronLeft } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { UserProduct } from './types';

interface ProductContextStripProps {
  products: UserProduct[];
  onChangeProducts: () => void;
}

export function ProductContextStrip({ products, onChangeProducts }: ProductContextStripProps) {
  if (products.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-muted/50 border border-border/60">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs font-semibold text-muted-foreground">Products</span>
          <span className="text-xs font-bold text-foreground bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center">{products.length}</span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {products.slice(0, 12).map(p => (
            <Tooltip key={p.id}>
              <TooltipTrigger asChild>
                <div className="w-8 h-8 rounded-md overflow-hidden bg-white flex-shrink-0 border border-border/40 p-0.5">
                  <ShimmerImage src={p.image_url} alt={p.title} loading="eager" className="w-full h-full object-contain" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">{p.title}</TooltipContent>
            </Tooltip>
          ))}
          {products.length > 12 && (
            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground flex-shrink-0">
              +{products.length - 12}
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm" className="text-xs h-7 ml-auto flex-shrink-0 gap-1" onClick={onChangeProducts}>
          <ChevronLeft className="w-3 h-3" />
          Change
        </Button>
      </div>
    </TooltipProvider>
  );
}
