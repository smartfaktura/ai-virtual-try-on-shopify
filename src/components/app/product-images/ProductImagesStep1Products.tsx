import { useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle, Upload, Package, Search, Plus } from 'lucide-react';
import { AddProductModal } from '@/components/app/AddProductModal';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import type { UserProduct } from './types';

interface Step1Props {
  products: UserProduct[];
  isLoading: boolean;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onProductAdded: () => void;
}

export function ProductImagesStep1Products({ products, isLoading, selectedIds, onSelectionChange, onProductAdded }: Step1Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const productTypes = useMemo(() => {
    const types = new Set(products.map(p => p.product_type).filter(Boolean));
    return Array.from(types).sort();
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || (p.product_type && p.product_type.toLowerCase().includes(q)));
    }
    if (typeFilter !== 'all') {
      list = list.filter(p => p.product_type === typeFilter);
    }
    return list;
  }, [products, search, typeFilter]);

  const toggleProduct = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Select products</h2>
        <p className="text-sm text-muted-foreground mt-1">Choose one or more products to generate visuals for.</p>
      </div>

      {/* Search & filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        {productTypes.length > 1 && (
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {productTypes.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">{selectedIds.size} selected</Badge>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => onSelectionChange(new Set())}>Clear</Button>
          </div>
        )}
        {filtered.length !== products.length && (
          <span className="text-xs text-muted-foreground">{filtered.length} of {products.length} shown</span>
        )}
      </div>

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
          <button
            onClick={() => setShowAdd(true)}
            className="group flex flex-col rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors cursor-pointer overflow-hidden"
          >
            <div className="aspect-square flex flex-col items-center justify-center bg-muted/30">
              <div className="flex flex-col items-center justify-center w-3/4 h-3/4 rounded-lg border-2 border-dashed border-muted-foreground/30 group-hover:border-primary/40 transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
            <div className="h-[52px] flex flex-col justify-center px-2.5">
              <p className="text-xs font-medium text-muted-foreground group-hover:text-primary">Upload Image</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">or paste / import URL</p>
            </div>
          </button>

          {filtered.map((p) => {
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
                <div className="aspect-square bg-muted overflow-hidden flex items-center justify-center p-2">
                  <ShimmerImage
                    src={getOptimizedUrl(p.image_url, { quality: 70 })}
                    alt={p.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="h-[52px] flex flex-col justify-center px-2.5">
                  <p className="text-xs font-medium truncate leading-tight">{p.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5 leading-tight">
                    {p.product_type || '\u00A0'}
                  </p>
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

      <AddProductModal
        open={showAdd}
        onOpenChange={setShowAdd}
        onProductAdded={() => { onProductAdded(); setShowAdd(false); }}
      />
    </div>
  );
}
