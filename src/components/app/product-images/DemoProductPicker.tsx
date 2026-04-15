import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const DEMO_PRODUCTS = [
  { id: 'demo_scarf', title: 'Silk Scarf', category: 'Scarves', previewSrc: '/images/demos/previews/demo-scarf.webp', sourceSrc: '/images/demos/demo-scarf.png' },
  { id: 'demo_cap', title: 'Baseball Cap', category: 'Hats', previewSrc: '/images/demos/previews/demo-cap.webp', sourceSrc: '/images/demos/demo-cap.png' },
  { id: 'demo_shampoo', title: 'Luxury Shampoo', category: 'Beauty', previewSrc: '/images/demos/previews/demo-shampoo.webp', sourceSrc: '/images/demos/demo-shampoo.png' },
  { id: 'demo_jeans', title: 'High-Rise Jeans', category: 'Jeans', previewSrc: '/images/demos/previews/demo-jeans.webp', sourceSrc: '/images/demos/demo-jeans.png' },
  { id: 'demo_hoodie', title: 'Zip Hoodie', category: 'Hoodies', previewSrc: '/images/demos/previews/demo-hoodie.webp', sourceSrc: '/images/demos/demo-hoodie.png' },
  { id: 'demo_backpack', title: 'Urban Backpack', category: 'Backpacks', previewSrc: '/images/demos/previews/demo-backpack.webp', sourceSrc: '/images/demos/demo-backpack.png' },
  { id: 'demo_eyewear', title: 'Cat-Eye Glasses', category: 'Eyewear', previewSrc: '/images/demos/previews/demo-eyewear.webp', sourceSrc: '/images/demos/demo-eyewear.png' },
  { id: 'demo_chair', title: 'Bouclé Armchair', category: 'Furniture', previewSrc: '/images/demos/previews/demo-chair.webp', sourceSrc: '/images/demos/demo-chair.png' },
  { id: 'demo_handbag', title: 'Leather Handbag', category: 'Bags', previewSrc: '/images/demos/previews/demo-handbag.webp', sourceSrc: '/images/demos/demo-handbag.png' },
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
      const response = await fetch(product.sourceSrc);
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
            'group relative flex flex-col items-center rounded-xl border border-border/60 bg-card p-2 transition-all',
            'hover:border-primary/40 hover:shadow-md hover:shadow-primary/5',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            'disabled:opacity-50 disabled:pointer-events-none',
          )}
        >
          <div className="relative w-full overflow-hidden rounded-lg bg-muted/40 mb-1.5" style={{ aspectRatio: '4/5' }}>
            <ShimmerImage
              src={product.previewSrc}
              alt={product.title}
              className="w-full h-full object-cover"
              aspectRatio="4/5"
            />
            {loadingId === product.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
          </div>
          <span className="text-xs font-medium text-foreground truncate w-full text-center">{product.title}</span>
          <Badge variant="secondary" className="mt-0.5 text-[10px] px-1.5 py-0">{product.category}</Badge>
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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Try a demo product</DialogTitle>
          <DialogDescription>Pick one to see how it works</DialogDescription>
        </DialogHeader>
        {grid}
      </DialogContent>
    </Dialog>
  );
}
