import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, Plus, Package } from 'lucide-react';
import { AddProductModal } from '@/components/app/AddProductModal';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import type { UserProduct } from './types';

interface Step1Props {
  products: UserProduct[];
  isLoading: boolean;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onContinue: () => void;
  onProductAdded: () => void;
}

export function ProductImagesStep1Products({ products, isLoading, selectedIds, onSelectionChange, onContinue, onProductAdded }: Step1Props) {
  const [showAdd, setShowAdd] = useState(false);

  const toggleProduct = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Select products</h2>
        <p className="text-sm text-muted-foreground mt-1">Choose one or more products to generate visuals for.</p>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">{selectedIds.size} selected</Badge>
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => onSelectionChange(new Set())}>Clear</Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : products.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <Package className="w-10 h-10 text-muted-foreground/40" />
            <div className="text-center">
              <p className="font-medium text-sm">No products yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add your first product to get started.</p>
            </div>
            <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-1.5" />Add Product</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Add new product card */}
          <button
            onClick={() => setShowAdd(true)}
            className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors min-h-[200px] cursor-pointer"
          >
            <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-xs text-muted-foreground mt-2 group-hover:text-primary">Add Product</span>
          </button>

          {products.map((p) => {
            const selected = selectedIds.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggleProduct(p.id)}
                className={`relative rounded-xl border-2 overflow-hidden transition-all text-left cursor-pointer ${
                  selected
                    ? 'border-primary ring-2 ring-primary/20 shadow-sm'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <div className="aspect-square bg-muted overflow-hidden">
                  <ShimmerImage
                    src={getOptimizedUrl(p.image_url, { width: 280, quality: 70 })}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium truncate">{p.title}</p>
                  {p.product_type && (
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{p.product_type}</p>
                  )}
                </div>
                {selected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-5 h-5 text-primary fill-primary/20" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button size="lg" disabled={selectedIds.size === 0} onClick={onContinue}>
          Continue to scenes
        </Button>
      </div>

      <AddProductModal
        open={showAdd}
        onOpenChange={setShowAdd}
        onProductAdded={() => { onProductAdded(); setShowAdd(false); }}
      />
    </div>
  );
}
