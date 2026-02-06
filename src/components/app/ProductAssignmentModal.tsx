import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, CheckCircle } from 'lucide-react';
import type { Product } from '@/types';

interface ProductAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  selectedProduct: Product | null;
  onSelectProduct: (product: Product) => void;
  onPublish: (product: Product, mode: 'add' | 'replace') => void;
  selectedImageCount: number;
}

export function ProductAssignmentModal({ open, onClose, products, selectedProduct, onSelectProduct, onPublish, selectedImageCount }: ProductAssignmentModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [publishMode, setPublishMode] = useState<'add' | 'replace'>('add');
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(p => p.title.toLowerCase().includes(query) || p.vendor.toLowerCase().includes(query) || p.productType.toLowerCase().includes(query));
  }, [products, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign to Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {!selectedProduct ? (
            <>
              <p className="text-muted-foreground">Search and select a product to assign your generated images to.</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by name, vendor, or type..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <Alert><AlertDescription>No products found matching "{searchQuery}"</AlertDescription></Alert>
                ) : filteredProducts.slice(0, 10).map(product => (
                  <button key={product.id} type="button" onClick={() => onSelectProduct(product)} className="w-full p-3 border border-border rounded-lg hover:bg-muted transition-colors text-left flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 border border-border">
                      <img src={product.images[0]?.url || '/placeholder.svg'} alt={product.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm">{product.title}</p>
                      <p className="text-xs text-muted-foreground">{product.vendor} • {product.productType}</p>
                      <div className="flex gap-1 mt-1">{product.tags.slice(0, 3).map(tag => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="p-4 border border-primary rounded-lg bg-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 border border-border">
                    <img src={selectedProduct.images[0]?.url || '/placeholder.svg'} alt={selectedProduct.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-primary" /><p className="font-semibold text-sm">{selectedProduct.title}</p></div>
                    <p className="text-xs text-muted-foreground">{selectedProduct.vendor}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onSelectProduct(null as unknown as Product)}>Change</Button>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Download Mode</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setPublishMode('add')} className={`p-4 rounded-lg border-2 text-left ${publishMode === 'add' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <p className="font-semibold text-sm">Add to Product</p>
                    <p className="text-xs text-muted-foreground">Keep existing images</p>
                  </button>
                  <button type="button" onClick={() => setPublishMode('replace')} className={`p-4 rounded-lg border-2 text-left ${publishMode === 'replace' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <p className="font-semibold text-sm">Replace All</p>
                    <p className="text-xs text-muted-foreground">Use only new images</p>
                  </button>
                </div>
              </div>
              <Alert>
                <AlertDescription>
                  {selectedImageCount} image{selectedImageCount !== 1 ? 's' : ''} will be {publishMode === 'add' ? 'added to' : 'set as the images for'} <strong>{selectedProduct.title}</strong>
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => selectedProduct && onPublish(selectedProduct, publishMode)} disabled={!selectedProduct}>
            Download {selectedImageCount} Image{selectedImageCount !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
