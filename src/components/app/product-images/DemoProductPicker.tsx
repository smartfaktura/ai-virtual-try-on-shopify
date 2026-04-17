import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { DEMO_PRODUCTS, type DemoProduct } from '@/data/demoProducts';

interface DemoProductPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDemo: (demo: DemoProduct) => Promise<void> | void;
}

export function DemoProductPicker({ open, onOpenChange, onSelectDemo }: DemoProductPickerProps) {
  const isMobile = useIsMobile();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSelect = async (demo: DemoProduct) => {
    setLoadingId(demo.id);
    try {
      onOpenChange(false);
      await onSelectDemo(demo);
    } finally {
      setLoadingId(null);
    }
  };

  const grid = (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-1">
      {DEMO_PRODUCTS.map((product) => (
        <button
          key={product.id}
          disabled={!!loadingId}
          onClick={() => handleSelect(product)}
          className={cn(
            'group relative flex flex-col items-center rounded-xl border border-border/60 bg-card p-1.5 transition-all',
            'hover:border-primary/40 hover:shadow-md hover:shadow-primary/5',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            'disabled:opacity-50 disabled:pointer-events-none',
          )}
        >
          <div className="relative w-full overflow-hidden rounded-lg bg-muted/40 mb-1.5" style={{ aspectRatio: '1/1' }}>
            <ShimmerImage
              src={product.previewSrc}
              alt={product.title}
              className="w-full h-full object-cover"
              aspectRatio="1/1"
            />
            {loadingId === product.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
          </div>
          <span className="text-xs font-medium text-foreground truncate w-full text-center">{product.title}</span>
          <Badge variant="secondary" className="mt-0.5 text-[10px] px-1.5 py-0">{product.productType}</Badge>
        </button>
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle>Try a demo product</DrawerTitle>
            <DrawerDescription>Pick one to see how it works — instant, no credits used</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            {grid}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Try a demo product</DialogTitle>
          <DialogDescription>Pick one to see how it works — instant, no credits used</DialogDescription>
        </DialogHeader>
        {grid}
      </DialogContent>
    </Dialog>
  );
}
