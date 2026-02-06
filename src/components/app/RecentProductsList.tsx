import { Button } from '@/components/ui/button';
import type { Product } from '@/types';

interface RecentProductsListProps {
  products: Product[];
  onSelect: (product: Product) => void;
  maxItems?: number;
}

export function RecentProductsList({ products, onSelect, maxItems = 3 }: RecentProductsListProps) {
  const recentProducts = products.slice(0, maxItems);
  if (recentProducts.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Recent Products</h3>
      <div className="space-y-2">
        {recentProducts.map((product) => (
          <div key={product.id} className="p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors" onClick={() => onSelect(product)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md overflow-hidden border border-border flex-shrink-0">
                <img src={product.images[0]?.url || '/placeholder.svg'} alt={product.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{product.title}</p>
                <p className="text-xs text-muted-foreground">{product.vendor} • {product.images.length} image{product.images.length !== 1 ? 's' : ''}</p>
              </div>
              <Button size="sm" variant="outline">Select</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
