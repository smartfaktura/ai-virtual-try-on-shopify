import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, CheckCircle } from 'lucide-react';
import type { Product } from '@/types';
import { MAX_PRODUCTS_PER_BATCH } from '@/types/bulk';
import { detectProductCategory, categoryLabels } from '@/lib/categoryUtils';

interface ProductMultiSelectProps {
  products: Product[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  enforceSameCategory?: boolean;
}

export function ProductMultiSelect({ products, selectedIds, onSelectionChange, searchQuery, onSearchChange, enforceSameCategory = true }: ProductMultiSelectProps) {
  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.vendor.toLowerCase().includes(searchQuery.toLowerCase()));
  const selectedProducts = products.filter(p => selectedIds.has(p.id));
  const dominantCategory = selectedProducts.length > 0 ? detectProductCategory(selectedProducts[0]) : null;
  const selectedCategories = new Set(selectedProducts.map(p => detectProductCategory(p)).filter(Boolean));
  const isCategoryMismatch = selectedCategories.size > 1;

  const handleToggle = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newSelection = new Set(selectedIds);
    if (newSelection.has(productId)) { newSelection.delete(productId); }
    else if (newSelection.size < MAX_PRODUCTS_PER_BATCH) {
      if (enforceSameCategory && dominantCategory) {
        const productCategory = detectProductCategory(product);
        if (productCategory && productCategory !== dominantCategory) return;
      }
      newSelection.add(productId);
    }
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    let productsToSelect = filteredProducts;
    if (enforceSameCategory && dominantCategory) {
      productsToSelect = filteredProducts.filter(p => { const cat = detectProductCategory(p); return cat === dominantCategory || cat === null; });
    }
    onSelectionChange(new Set(productsToSelect.slice(0, MAX_PRODUCTS_PER_BATCH).map(p => p.id)));
  };

  const getCategoryBadgeText = () => {
    if (selectedProducts.length === 0) return null;
    if (isCategoryMismatch) return `Mixed: ${Array.from(selectedCategories).map(c => c && categoryLabels[c]).filter(Boolean).join(', ')}`;
    if (dominantCategory) return categoryLabels[dominantCategory];
    return null;
  };

  return (
    <div className="space-y-4">
      {isCategoryMismatch && (
        <Alert><AlertDescription>Products from different categories selected. The same template will be applied to all, which may produce inconsistent results.</AlertDescription></Alert>
      )}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="pl-9" />
        </div>
        <Button size="sm" variant="outline" onClick={handleSelectAll}>Select All</Button>
        <Button size="sm" variant="outline" onClick={() => onSelectionChange(new Set())}>Clear</Button>
      </div>
      <div className="flex gap-2 items-center">
        <Badge variant={selectedIds.size >= 2 ? 'default' : 'secondary'}>{selectedIds.size} selected</Badge>
        {getCategoryBadgeText() && <Badge variant={isCategoryMismatch ? 'destructive' : 'secondary'}>{getCategoryBadgeText()}</Badge>}
        <span className="text-xs text-muted-foreground">(max {MAX_PRODUCTS_PER_BATCH})</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-1">
        {filteredProducts.map(product => {
          const isSelected = selectedIds.has(product.id);
          const productCategory = detectProductCategory(product);
          const isIncompatible = enforceSameCategory && dominantCategory && productCategory && productCategory !== dominantCategory && !isSelected;
          const isDisabled = isIncompatible || (!isSelected && selectedIds.size >= MAX_PRODUCTS_PER_BATCH);
          return (
            <div key={product.id} onClick={() => !isDisabled && handleToggle(product.id)}
              className={`relative rounded-lg border-2 p-2 cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'} ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''} ${isIncompatible ? 'grayscale' : ''}`}>
              <div className="absolute top-1 left-1 z-10">
                <Checkbox checked={isSelected} disabled={isDisabled} onCheckedChange={() => handleToggle(product.id)} />
              </div>
              {isSelected && <div className="absolute top-1 right-1 z-10 text-primary"><CheckCircle className="w-4 h-4" /></div>}
              <div className="aspect-square rounded overflow-hidden mb-2 bg-muted">
                {product.images[0] ? <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>}
              </div>
              <p className="text-xs font-medium truncate">{product.title}</p>
              <p className="text-xs text-muted-foreground truncate">{product.productType}</p>
            </div>
          );
        })}
      </div>
      {filteredProducts.length === 0 && <p className="text-center text-muted-foreground py-4">No products found</p>}
    </div>
  );
}
