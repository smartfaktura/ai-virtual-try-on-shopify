import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { cn } from '@/lib/utils';
import { ChevronRight, Package, Search, LayoutGrid, List, Check, Globe, Upload, Download } from 'lucide-react';

interface UserProduct {
  id: string;
  title: string;
  image_url: string;
  product_type: string;
}

const PRODUCTS_PER_PAGE = 24;

interface CatalogStepProductsProps {
  products: UserProduct[];
  productsLoading: boolean;
  selectedProductIds: Set<string>;
  onProductSelectionChange: (ids: Set<string>) => void;
  maxProducts: number;
  onNext: () => void;
  canProceed: boolean;
  onAddProduct: () => void;
}

export function CatalogStepProducts({
  products, productsLoading, selectedProductIds, onProductSelectionChange,
  maxProducts, onNext, canProceed, onAddProduct,
}: CatalogStepProductsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.product_type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const visible = filtered.slice(0, visibleCount);

  const toggleProduct = (id: string) => {
    const next = new Set(selectedProductIds);
    if (next.has(id)) next.delete(id);
    else if (next.size < maxProducts) next.add(id);
    onProductSelectionChange(next);
  };

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">Select Products</h3>
        <p className="text-sm text-muted-foreground mt-1">Choose products for your catalog photoshoot.</p>
      </div>

      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-9">
          <TabsTrigger value="library" className="gap-1.5 text-xs">
            <Package className="w-3.5 h-3.5" /> My Products
          </TabsTrigger>
          <TabsTrigger value="url" className="gap-1.5 text-xs">
            <Globe className="w-3.5 h-3.5" /> Import URL
          </TabsTrigger>
          <TabsTrigger value="csv" className="gap-1.5 text-xs">
            <Upload className="w-3.5 h-3.5" /> Upload CSV
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library">
          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground rounded-lg border border-dashed border-border">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No products yet</p>
              <p className="text-xs mb-3">Add products first to get started</p>
              <Button size="sm" onClick={onAddProduct}>Add Products</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setVisibleCount(PRODUCTS_PER_PAGE); }}
                    className="h-8 text-xs pl-8"
                  />
                </div>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => {
                  onProductSelectionChange(new Set(filtered.slice(0, maxProducts).map(p => p.id)));
                }}>Select All</Button>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => onProductSelectionChange(new Set())}>Clear</Button>
                <div className="flex border border-border rounded overflow-hidden">
                  <button onClick={() => setViewMode('grid')} className={cn('p-1.5 transition-colors', viewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted')}>
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={cn('p-1.5 transition-colors', viewMode === 'list' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted')}>
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {selectedProductIds.size > 0 && (
                <div className="flex gap-2 items-center">
                  <Badge variant={selectedProductIds.size >= 2 ? 'default' : 'secondary'} className="text-[10px]">{selectedProductIds.size} selected</Badge>
                  <span className="text-xs text-muted-foreground">(max {maxProducts})</span>
                </div>
              )}

              {filtered.length === 0 && searchQuery && (
                <p className="text-center text-sm text-muted-foreground py-6">No products match "{searchQuery}"</p>
              )}

              {filtered.length > 0 && viewMode === 'list' && (
                <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
                  {visible.map(up => {
                    const isSelected = selectedProductIds.has(up.id);
                    const isDisabled = !isSelected && selectedProductIds.size >= maxProducts;
                    return (
                      <button
                        key={up.id}
                        type="button"
                        onClick={() => toggleProduct(up.id)}
                        disabled={isDisabled}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-all text-left',
                          isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/50',
                          isDisabled && 'opacity-40 cursor-not-allowed'
                        )}
                      >
                        <ShimmerImage src={getOptimizedUrl(up.image_url, { quality: 60 })} alt={up.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{up.title}</p>
                          {up.product_type && <p className="text-[10px] text-muted-foreground truncate">{up.product_type}</p>}
                        </div>
                        <div className={cn(
                          'w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors',
                          isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                        )}>
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {filtered.length > 0 && viewMode === 'grid' && (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                    {visible.map(up => {
                      const isSelected = selectedProductIds.has(up.id);
                      const isDisabled = !isSelected && selectedProductIds.size >= maxProducts;
                      return (
                        <button
                          key={up.id}
                          type="button"
                          onClick={() => toggleProduct(up.id)}
                          disabled={isDisabled}
                          className={cn(
                            'group relative flex flex-col rounded-lg overflow-hidden border transition-all text-left',
                            isSelected ? 'border-primary ring-1 ring-primary/20' : 'border-transparent hover:border-border',
                            isDisabled && 'opacity-40 cursor-not-allowed'
                          )}
                        >
                          <div className={cn(
                            'absolute top-1.5 left-1.5 z-10 w-4 h-4 rounded-full border flex items-center justify-center transition-all',
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-background/80 bg-background/60 opacity-0 group-hover:opacity-100'
                          )}>
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </div>
                          <ShimmerImage src={getOptimizedUrl(up.image_url, { quality: 60 })} alt={up.title} className="w-full aspect-square object-cover rounded-t-lg" />
                          <div className="px-1.5 py-1.5 bg-card">
                            <p className="text-[10px] font-medium text-foreground leading-tight line-clamp-2">{up.title}</p>
                            {up.product_type && (
                              <p className="text-[9px] text-muted-foreground truncate mt-0.5">{up.product_type}</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={onAddProduct}
                      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border hover:border-primary/30 hover:bg-muted/30 transition-all aspect-square text-muted-foreground"
                    >
                      <Package className="w-6 h-6 mb-1 opacity-50" />
                      <span className="text-[10px] font-medium">Add New</span>
                    </button>
                  </div>
                  {filtered.length > visibleCount && (
                    <Button variant="outline" size="sm" onClick={() => setVisibleCount(c => c + PRODUCTS_PER_PAGE)} className="w-full mt-3">
                      Load more ({filtered.length - visibleCount} remaining)
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="url">
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-foreground">Import from Website</h4>
              <p className="text-xs text-muted-foreground mt-1">Paste a product page URL to extract product details.</p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/product/blue-jacket"
                value={importUrl}
                onChange={e => setImportUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                disabled={!importUrl.trim() || isImporting}
                onClick={() => {
                  setIsImporting(true);
                  setTimeout(() => setIsImporting(false), 2000);
                }}
              >
                {isImporting ? 'Importing...' : 'Import'}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">Supports Shopify, WooCommerce, and direct product pages.</p>
          </div>
        </TabsContent>

        <TabsContent value="csv">
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-foreground">Upload Product CSV</h4>
              <p className="text-xs text-muted-foreground mt-1">Bulk-import products from a CSV file.</p>
            </div>
            <div className="rounded-lg border border-dashed border-border hover:border-primary/30 transition-colors p-8 text-center cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-sm font-medium text-muted-foreground">Drag & drop your CSV here</p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Download className="w-3.5 h-3.5" /> Download Template
            </Button>
            <p className="text-[11px] text-muted-foreground">Columns: title, image_url, product_type</p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-2">
        <Button onClick={onNext} disabled={!canProceed} className="gap-2">
          Next: Style <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
