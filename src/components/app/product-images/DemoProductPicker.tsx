import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const DEMO_PRODUCTS = [
  { id: 'demo_scarf', title: 'Silk Scarf', category: 'Scarves', src: '/images/demos/demo-scarf.png' },
  { id: 'demo_cap', title: 'Baseball Cap', category: 'Hats', src: '/images/demos/demo-cap.png' },
  { id: 'demo_shampoo', title: 'Luxury Shampoo', category: 'Beauty', src: '/images/demos/demo-shampoo.png' },
  { id: 'demo_jeans', title: 'High-Rise Jeans', category: 'Jeans', src: '/images/demos/demo-jeans.png' },
  { id: 'demo_hoodie', title: 'Zip Hoodie', category: 'Hoodies', src: '/images/demos/demo-hoodie.png' },
  { id: 'demo_backpack', title: 'Urban Backpack', category: 'Backpacks', src: '/images/demos/demo-backpack.png' },
  { id: 'demo_eyewear', title: 'Cat-Eye Glasses', category: 'Eyewear', src: '/images/demos/demo-eyewear.png' },
];

interface DemoProductPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (file: File) => void;
}

export function DemoProductPicker({ open, onOpenChange, onSelect }: DemoProductPickerProps) {
  const isMobile = useIsMobile();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSelect = async (product: typeof DEMO_PRODUCTS[0]) => {
    setLoadingId(product.id);
    try {
      const response = await fetch(product.src);
      const blob = await response.blob();
      const file = new File([blob], `${product.id}.png`, { type: 'image/png' });
      onOpenChange(false);
      onSelect(file);
    } catch {
      console.error('Failed to load demo product');
    } finally {
      setLoadingId(null);
    }
  };

  const grid = (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
      {DEMO_PRODUCTS.map((product) => (
        <button
          key={product.id}
          disabled={!!loadingId}
          onClick={() => handleSelect(product)}
          className={cn(
            'group relative flex flex-col items-center rounded-xl border border-border/60 bg-card p-2.5 transition-all',
            'hover:border-primary/40 hover:shadow-md hover:shadow-primary/5',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            'disabled:opacity-50 disabled:pointer-events-none',
          )}
        >
          <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted/40 mb-2">
            <ShimmerImage
              src={product.src}
              alt={product.title}
              className="w-full h-full object-contain"
            />
            {loadingId === product.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
          </div>
          <span className="text-xs font-medium text-foreground truncate w-full text-center">{product.title}</span>
          <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0">{product.category}</Badge>
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
            <DrawerDescription>Pick one to see how it works</DrawerDescription>
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Try a demo product</DialogTitle>
          <DialogDescription>Pick one to see how it works</DialogDescription>
        </DialogHeader>
        {grid}
      </DialogContent>
    </Dialog>
  );
}
