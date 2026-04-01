import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Skeleton } from '@/components/ui/skeleton';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { cn } from '@/lib/utils';
import {
  ChevronRight, Package, Search, LayoutGrid, List, Check,
  Globe, Upload, Download, Plus, Sparkles,
} from 'lucide-react';

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

/* ── Skeleton loader ─────────────────────────────────────── */
function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-2.5 space-y-2.5">
      <Skeleton className="w-full aspect-square rounded-xl" />
      <div className="space-y-1.5 px-1">
        <Skeleton className="h-3.5 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

/* ── Underline Tab ───────────────────────────────────────── */
function UnderlineTab({
  active, onClick, icon: Icon, label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-1.5 pb-2.5 text-sm font-medium transition-colors duration-200',
        active
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground/70'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
      {active && (
        <span className="absolute bottom-0 inset-x-0 h-[2px] rounded-full bg-primary" />
      )}
    </button>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export function CatalogStepProducts({
  products, productsLoading, selectedProductIds, onProductSelectionChange,
  maxProducts, onNext, canProceed, onAddProduct,
}: CatalogStepProductsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'url' | 'csv'>('library');

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.product_type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const visible = filtered.slice(0, visibleCount);

  // Track selection order for numbered badges
  const [selectionOrder, setSelectionOrder] = useState<string[]>([]);

  // Sync selectionOrder when selectedProductIds changes externally (e.g. reset)
  useEffect(() => {
    setSelectionOrder(prev => {
      const pruned = prev.filter(id => selectedProductIds.has(id));
      // Add any IDs in selectedProductIds not yet tracked (e.g. from Select All)
      const missing = Array.from(selectedProductIds).filter(id => !pruned.includes(id));
      const merged = [...pruned, ...missing];
      if (merged.length === prev.length && merged.every((id, i) => prev[i] === id)) return prev;
      return merged;
    });
  }, [selectedProductIds]);

  const toggleProduct = (id: string) => {
    const next = new Set(selectedProductIds);
    const nextOrder = [...selectionOrder];
    if (next.has(id)) {
      next.delete(id);
      const idx = nextOrder.indexOf(id);
      if (idx !== -1) nextOrder.splice(idx, 1);
    } else if (next.size < maxProducts) {
      next.add(id);
      nextOrder.push(id);
    }
    setSelectionOrder(nextOrder);
    onProductSelectionChange(next);
  };

  const getSelectionNumber = (id: string) => {
    const idx = selectionOrder.indexOf(id);
    return idx !== -1 ? idx + 1 : null;
  };

  const selectedProducts = useMemo(
    () => products.filter(p => selectedProductIds.has(p.id)),
    [products, selectedProductIds]
  );

  /* ── Loading ─────────────────────────────────────────── */
  if (productsLoading) {
    return (
      <div className="space-y-5">
        <div>
          <h3 className="text-lg font-medium text-foreground">Choose your products</h3>
          <p className="text-sm text-muted-foreground mt-1">Loading your catalog…</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-baseline justify-between">
        <div>
          <h3 className="text-lg font-medium text-foreground">Choose your products</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Select up to {maxProducts} products for your catalog shoot
          </p>
        </div>
        {products.length > 0 && (
          <Badge variant="secondary" className="text-[11px] font-normal">
            {products.length} available
          </Badge>
        )}
      </div>

      {/* ── Underline Tabs ───────────────────────────────── */}
      <div className="flex gap-3 sm:gap-6 border-b border-border overflow-x-auto">
        <UnderlineTab active={activeTab === 'library'} onClick={() => setActiveTab('library')} icon={Package} label="My Products" />
        <UnderlineTab active={activeTab === 'url'} onClick={() => setActiveTab('url')} icon={Globe} label="Import URL" />
        <UnderlineTab active={activeTab === 'csv'} onClick={() => setActiveTab('csv')} icon={Upload} label="Upload CSV" />
      </div>

      {/* ── Tab: Library ─────────────────────────────────── */}
      {activeTab === 'library' && (
        <>
          {products.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border bg-muted/20">
              <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
                <Package className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <p className="text-base font-medium text-foreground">No products yet</p>
              <p className="text-sm text-muted-foreground mt-1 mb-5 max-w-xs mx-auto">
                Add your first product to start building your catalog photoshoot
              </p>
              <Button onClick={onAddProduct} className="gap-2 rounded-xl">
                <Plus className="w-4 h-4" /> Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* ── Toolbar ───────────────────────────────── */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                  <Input
                    placeholder="Search by name or category..."
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setVisibleCount(PRODUCTS_PER_PAGE); }}
                    className="h-10 text-sm pl-10 rounded-xl border-transparent bg-muted/50 focus:bg-background focus:border-border transition-all duration-200"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs rounded-lg"
                      onClick={() => {
                        const ids = filtered.slice(0, maxProducts).map(p => p.id);
                        setSelectionOrder(ids);
                        onProductSelectionChange(new Set(ids));
                      }}
                    >
                      Select All
                    </Button>
                    {selectedProductIds.size > 0 && (
                      <>
                        <span className="text-[11px] text-muted-foreground">•</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs rounded-lg text-muted-foreground"
                          onClick={() => { setSelectionOrder([]); onProductSelectionChange(new Set()); }}
                        >
                          Clear
                        </Button>
                      </>
                    )}
                    <span className="text-[11px] text-muted-foreground ml-1">
                      {selectedProductIds.size > 0
                        ? `${selectedProductIds.size} of ${maxProducts} selected`
                        : `${filtered.length} products`}
                    </span>
                  </div>
                  {/* View toggle pill */}
                  <div className="flex bg-muted/60 rounded-lg p-0.5">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        'p-1.5 rounded-md transition-all duration-200',
                        viewMode === 'grid'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        'p-1.5 rounded-md transition-all duration-200',
                        viewMode === 'list'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {filtered.length === 0 && searchQuery && (
                <div className="text-center py-12">
                  <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No products match "{searchQuery}"</p>
                </div>
              )}

              {/* ── Grid View ─────────────────────────────── */}
              {filtered.length > 0 && viewMode === 'grid' && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {visible.map(up => {
                      const isSelected = selectedProductIds.has(up.id);
                      const isDisabled = !isSelected && selectedProductIds.size >= maxProducts;
                      const selNum = getSelectionNumber(up.id);
                      return (
                        <button
                          key={up.id}
                          type="button"
                          onClick={() => toggleProduct(up.id)}
                          disabled={isDisabled}
                          className={cn(
                            'group relative flex flex-col rounded-2xl bg-card border overflow-hidden transition-all duration-200 text-left',
                            isSelected
                              ? 'ring-2 ring-primary border-primary/30 shadow-md shadow-primary/10'
                              : 'border-border hover:shadow-lg hover:-translate-y-0.5',
                            isDisabled && 'opacity-35 cursor-not-allowed hover:shadow-none hover:translate-y-0'
                          )}
                        >
                          {/* Image area with padding */}
                          <div className="p-2.5 pb-0">
                            <div className="relative rounded-xl overflow-hidden bg-muted/30">
                              <ShimmerImage
                                src={getOptimizedUrl(up.image_url, { quality: 70 })}
                                alt={up.title}
                                className="w-full aspect-square object-cover"
                              />
                              {/* Selection badge — numbered */}
                              <div className={cn(
                                'absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all duration-200',
                                isSelected
                                  ? 'bg-primary text-primary-foreground shadow-lg scale-100'
                                  : 'bg-background/60 backdrop-blur-sm border border-border/50 text-muted-foreground opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
                              )}>
                                {isSelected ? (selNum ?? <Check className="w-3 h-3" />) : <Check className="w-3 h-3" />}
                              </div>
                              {/* Selected gradient overlay */}
                              {isSelected && (
                                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-primary/15 to-transparent pointer-events-none" />
                              )}
                            </div>
                          </div>
                          {/* Info */}
                          <div className="px-3 py-2.5 space-y-1">
                            <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">
                              {up.title}
                            </p>
                            {up.product_type && (
                              <span className="inline-block text-[9px] font-medium text-muted-foreground bg-muted/60 rounded-full px-2 py-0.5">
                                {up.product_type}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}

                    {/* Add New card */}
                    <button
                      type="button"
                      onClick={onAddProduct}
                      className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border hover:border-primary/40 bg-transparent hover:bg-primary/5 transition-all duration-200 min-h-[200px]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center mb-2 transition-colors duration-200">
                        <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                        Add Product
                      </span>
                    </button>
                  </div>

                  {filtered.length > visibleCount && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVisibleCount(c => c + PRODUCTS_PER_PAGE)}
                      className="w-full rounded-xl"
                    >
                      Load more ({filtered.length - visibleCount} remaining)
                    </Button>
                  )}
                </>
              )}

              {/* ── List View ─────────────────────────────── */}
              {filtered.length > 0 && viewMode === 'list' && (
                <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
                  {visible.map((up, idx) => {
                    const isSelected = selectedProductIds.has(up.id);
                    const isDisabled = !isSelected && selectedProductIds.size >= maxProducts;
                    const selNum = getSelectionNumber(up.id);
                    return (
                      <button
                        key={up.id}
                        type="button"
                        onClick={() => toggleProduct(up.id)}
                        disabled={isDisabled}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left',
                          isSelected
                            ? 'bg-primary/5 border border-primary/20'
                            : cn('border border-transparent hover:bg-muted/40', idx % 2 === 1 && 'bg-muted/20'),
                          isDisabled && 'opacity-35 cursor-not-allowed'
                        )}
                      >
                        <ShimmerImage
                          src={getOptimizedUrl(up.image_url, { quality: 60 })}
                          alt={up.title}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{up.title}</p>
                          {up.product_type && (
                            <span className="inline-block text-[10px] text-muted-foreground bg-muted/50 rounded-full px-2 py-0.5 mt-0.5">
                              {up.product_type}
                            </span>
                          )}
                        </div>
                        <div className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-semibold transition-all duration-200',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'border-2 border-muted-foreground/15'
                        )}>
                          {isSelected && (selNum ?? <Check className="w-3 h-3" />)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Tab: Import URL ──────────────────────────────── */}
      {activeTab === 'url' && (
        <div className="rounded-2xl border border-border bg-card p-8 space-y-5">
          <div>
            <h4 className="text-sm font-medium text-foreground">Import from Website</h4>
            <p className="text-xs text-muted-foreground mt-1">Paste a product page URL and we'll extract the details automatically.</p>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/product/blue-jacket"
              value={importUrl}
              onChange={e => setImportUrl(e.target.value)}
              className="flex-1 rounded-xl"
            />
            <Button
              disabled
              className="rounded-xl"
            >
              Coming Soon
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">URL import is coming soon. Use "My Products" to add items for now.</p>
        </div>
      )}

      {/* ── Tab: CSV Upload ──────────────────────────────── */}
      {activeTab === 'csv' && (
        <div className="rounded-2xl border border-border bg-card p-8 space-y-5">
          <div>
            <h4 className="text-sm font-medium text-foreground">Upload Product CSV</h4>
            <p className="text-xs text-muted-foreground mt-1">Bulk-import products from a spreadsheet.</p>
          </div>
          <div className="rounded-2xl border-2 border-dashed border-border hover:border-primary/40 transition-colors duration-200 p-12 text-center cursor-pointer group">
            <div className="w-12 h-12 rounded-xl bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center mx-auto mb-3 transition-colors duration-200">
              <Upload className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors duration-200" />
            </div>
            <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Drag & drop your CSV here</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
          </div>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" className="gap-2 text-xs rounded-xl">
              <Download className="w-3.5 h-3.5" /> Download Template
            </Button>
            <p className="text-[11px] text-muted-foreground">Columns: title, image_url, product_type</p>
          </div>
        </div>
      )}

      {/* ── Floating Selection Bar ────────────────────────── */}
      {selectedProductIds.size > 0 && (
        <div className="sticky bottom-0 z-30 -mx-1 px-1">
          <div className="bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl px-3 sm:px-5 py-3 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
            {/* Mini thumbnails — hide on small screens */}
            <div className="hidden sm:flex -space-x-2">
              {selectedProducts.slice(0, 5).map(p => (
                <img
                  key={p.id}
                  src={getOptimizedUrl(p.image_url, { quality: 40 })}
                  alt={p.title}
                  className="w-8 h-8 rounded-lg object-cover border-2 border-background"
                />
              ))}
              {selectedProducts.length > 5 && (
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground border-2 border-background">
                  +{selectedProducts.length - 5}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {selectedProductIds.size} product{selectedProductIds.size !== 1 ? 's' : ''} selected
              </p>
            </div>
            <Button onClick={onNext} disabled={!canProceed} size="sm" className="gap-1.5 rounded-xl shadow-md flex-shrink-0">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Bottom Next (when nothing selected, for the overall flow) ── */}
      {selectedProductIds.size === 0 && (
        <div className="flex justify-end pt-2">
          <Button onClick={onNext} disabled={!canProceed} variant="outline" className="gap-2 rounded-xl">
            Next: Style <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
