import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Check, Package, Plus, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import type { Tables } from '@/integrations/supabase/types';

type UserProduct = Tables<'user_products'>;

const SAMPLE_PRODUCTS: UserProduct[] = [
  {
    id: 'sample_ring', title: 'Diamond Ring', product_type: 'Jewelry',
    image_url: '/images/samples/sample-ring.png',
    description: '', dimensions: null, tags: null, user_id: '',
    created_at: '', updated_at: '',
  } as UserProduct,
  {
    id: 'sample_crop_top', title: 'Ribbed Crop Top', product_type: 'Clothing',
    image_url: '/images/samples/sample-crop-top.png',
    description: '', dimensions: null, tags: null, user_id: '',
    created_at: '', updated_at: '',
  } as UserProduct,
  {
    id: 'sample_ice_roller', title: 'Ice Roller', product_type: 'Beauty',
    image_url: '/images/samples/sample-ice-roller.png',
    description: '', dimensions: null, tags: null, user_id: '',
    created_at: '', updated_at: '',
  } as UserProduct,
];

const SAMPLE_IDS = new Set(SAMPLE_PRODUCTS.map(p => p.id));

type QuickView = 'all' | 'samples';
type SortKey = 'featured' | 'name' | 'newest';

interface ProductCatalogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProduct: UserProduct | null;
  onSelect: (product: UserProduct | null) => void;
  products: UserProduct[];
  isLoading: boolean;
}

export function ProductCatalogModal({
  open, onOpenChange, selectedProduct, onSelect, products, isLoading,
}: ProductCatalogModalProps) {
  const navigate = useNavigate();
  const [quickView, setQuickView] = useState<QuickView>('all');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>('featured');
  const [pending, setPending] = useState<UserProduct | null>(null);
  const [search, setSearch] = useState('');

  const handleSheetOpenChange = (next: boolean) => {
    if (!next) setSearch('');
    onOpenChange(next);
  };

  // Combine user products + samples (samples shown when user has none, or in samples view)
  const allProducts = useMemo<UserProduct[]>(() => {
    if (products.length === 0) return SAMPLE_PRODUCTS;
    return [...products, ...SAMPLE_PRODUCTS];
  }, [products]);

  const productTypes = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => p.product_type && set.add(p.product_type));
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    let list = allProducts;
    if (quickView === 'samples') {
      list = list.filter(p => SAMPLE_IDS.has(p.id));
    }
    if (typeFilter) {
      list = list.filter(p => p.product_type === typeFilter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.product_type?.toLowerCase().includes(q),
      );
    }
    if (sort === 'name') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'newest') {
      list = [...list].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    }
    return list;
  }, [allProducts, quickView, typeFilter, sort, search]);

  const anyFilterActive = quickView !== 'all' || typeFilter !== null || sort !== 'featured';

  const clearAll = () => {
    setQuickView('all');
    setTypeFilter(null);
    setSort('featured');
  };

  const handleConfirm = () => {
    if (pending) {
      onSelect(pending);
      setPending(null);
      handleSheetOpenChange(false);
    }
  };

  const handleAddNew = () => {
    handleSheetOpenChange(false);
    navigate('/app/products');
  };

  const currentSelectedId = pending?.id ?? selectedProduct?.id ?? null;
  const footerThumb = pending?.image_url ?? null;
  const footerTitle = pending?.title ?? null;

  const userCount = products.length;
  const sampleCount = SAMPLE_PRODUCTS.length;

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent
        side="right"
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="p-0 gap-0 flex flex-col w-[92vw] max-w-[1500px] sm:max-w-[1500px]"
      >
        {/* Header */}
        <header className="flex flex-col gap-3 px-4 sm:px-6 py-4 pr-12 sm:pr-6 border-b border-border/40">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground">Select a Product</h2>
            <p className="text-sm text-muted-foreground mt-0.5 tracking-tight">
              Pick what to feature in your scene
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your products…"
              className="pl-9 h-9 text-sm"
            />
          </div>
        </header>

        {/* Filter bar */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-border/40">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => { setQuickView('all'); setSort('featured'); }}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors',
                quickView === 'all' && sort !== 'newest'
                  ? 'bg-foreground text-background'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted',
              )}
            >
              All
            </button>
            <button
              onClick={() => setSort('newest')}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors',
                sort === 'newest'
                  ? 'bg-foreground text-background'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted',
              )}
            >
              Recently added
            </button>
            {anyFilterActive && (
              <button
                onClick={clearAll}
                className="ml-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>
          <div className="shrink-0">
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="name">Name A→Z</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex min-h-0">
          {/* Sidebar */}
          <aside className="hidden lg:block w-[240px] shrink-0 border-r border-border/40 overflow-y-auto">
            <div className="p-4 space-y-5">
              <SidebarSection title="Quick">
                <SidebarRow
                  active={false}
                  onClick={() => setQuickView('all')}
                  label="All products"
                  count={userCount + sampleCount}
                />
                <SidebarRow
                  active={quickView === 'samples'}
                  onClick={() => setQuickView('samples')}
                  label="Samples"
                  count={sampleCount}
                />
              </SidebarSection>

              {productTypes.length > 0 && (
                <SidebarSection title="Type">
                  <SidebarRow
                    active={false}
                    onClick={() => setTypeFilter(null)}
                    label="Any"
                  />
                  {productTypes.map(t => (
                    <SidebarRow
                      key={t}
                      active={typeFilter === t}
                      onClick={() => setTypeFilter(t)}
                      label={t}
                      count={products.filter(p => p.product_type === t).length}
                    />
                  ))}
                </SidebarSection>
              )}
            </div>
          </aside>

          {/* Grid */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-4 sm:px-6 py-4 space-y-4">
              {/* Empty user-products hint */}
              {!isLoading && userCount === 0 && (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">No products yet</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Try a sample below or add your own to get started.
                    </p>
                  </div>
                  <Button size="sm" onClick={handleAddNew} className="shrink-0">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Product
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {filtered.map(product => {
                  const isSelected = currentSelectedId === product.id;
                  const isSample = SAMPLE_IDS.has(product.id);
                  return (
                    <button
                      key={product.id}
                      onClick={() => setPending(product)}
                      className={cn(
                        'group relative flex flex-col rounded-xl overflow-hidden border-2 transition-all duration-200 text-left bg-background',
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-transparent hover:border-border/60 hover:shadow-md hover:-translate-y-0.5',
                      )}
                    >
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <ShimmerImage
                          src={getOptimizedUrl(product.image_url, { quality: 65 })}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {isSample && (
                          <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[8px] font-bold text-white uppercase tracking-wider">
                            Sample
                          </span>
                        )}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow">
                            <Check className="w-3.5 h-3.5 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="px-2 py-2 bg-background">
                        <p className="text-xs font-medium text-foreground truncate">{product.title}</p>
                        {product.product_type && (
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                            {product.product_type}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Add new product tile */}
                <button
                  onClick={handleAddNew}
                  className="group relative flex flex-col rounded-xl overflow-hidden border-2 border-dashed border-primary/30 hover:border-primary/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left bg-background"
                >
                  <div className="aspect-square bg-muted/50 flex flex-col items-center justify-center gap-2 p-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="px-2 py-2 bg-background text-center">
                    <p className="text-xs font-semibold text-foreground truncate">
                      Add new product
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      Upload your own
                    </p>
                  </div>
                </button>

                {filtered.length === 0 && !isLoading && (
                  <div className="col-span-full flex flex-col items-center justify-center py-10 gap-2">
                    <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center">
                      <Search className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {search.trim()
                        ? <>No products match &ldquo;{search}&rdquo;</>
                        : 'No products match these filters'}
                    </p>
                    {search.trim() && (
                      <Button variant="ghost" size="sm" onClick={() => setSearch('')}>
                        Clear search
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <footer className="border-t border-border/40 bg-background px-4 sm:px-6 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {footerTitle ? (
              <>
                {footerThumb && (
                  <img
                    src={getOptimizedUrl(footerThumb, { quality: 60 })}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{footerTitle}</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Pick a product to continue.</p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            {selectedProduct && (
              <Button
                variant="ghost"
                onClick={() => { onSelect(null); setPending(null); handleSheetOpenChange(false); }}
              >
                Clear
              </Button>
            )}
            <Button variant="ghost" onClick={() => handleSheetOpenChange(false)}>
              Cancel
            </Button>
            <Button disabled={!pending} onClick={handleConfirm}>
              Use product
            </Button>
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SidebarRow({
  label, active, onClick, count,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left',
        active
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-foreground/80 hover:bg-muted/60',
      )}
    >
      <span className="truncate">{label}</span>
      {typeof count === 'number' && (
        <span className={cn('text-[11px] tabular-nums', active ? 'text-primary/80' : 'text-muted-foreground')}>
          {count}
        </span>
      )}
    </button>
  );
}
