import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Wand2, Plus, X, Search, Package } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Product, ModelProfile } from '@/types';

export interface ExtraItem {
  productId: string;
  productTitle: string;
  productImage?: string;
}

interface CatalogStepStyleShotsProps {
  products: Product[];
  selectedProductIds: Set<string>;
  models: ModelProfile[];
  selectedModelIds: Set<string>;
  extraItems: Map<string, ExtraItem[]>;
  onExtraItemsChange: (extras: Map<string, ExtraItem[]>) => void;
  onBack: () => void;
  onNext: () => void;
}

function ProductPickerPopover({
  products,
  excludeIds,
  onSelect,
  trigger,
}: {
  products: Product[];
  excludeIds: string[];
  onSelect: (product: Product) => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const available = products.filter(p => !excludeIds.includes(p.id));
  const filtered = search.trim()
    ? available.filter(p => p.title.toLowerCase().includes(search.trim().toLowerCase()))
    : available;

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch(''); }}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-72 p-0 max-h-72 overflow-hidden" align="start">
        {/* Search */}
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
              autoFocus
            />
          </div>
        </div>
        {/* List */}
        <div className="overflow-y-auto max-h-56 p-1.5">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground p-3 text-center">
              {available.length === 0 ? 'No more products available' : 'No products match your search'}
            </p>
          ) : (
            filtered.map(p => (
              <button
                key={p.id}
                onClick={() => { onSelect(p); setOpen(false); setSearch(''); }}
                className="flex items-center gap-2.5 w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted transition-colors"
              >
                <div className="w-9 h-9 rounded-md bg-muted overflow-hidden flex-shrink-0">
                  <img src={p.images[0]?.url} alt={p.title} className="w-full h-full object-contain" loading="lazy" />
                </div>
                <span className="truncate font-medium">{p.title}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function CatalogStepStyleShots({
  products, selectedProductIds, models, selectedModelIds,
  extraItems, onExtraItemsChange,
  onBack, onNext,
}: CatalogStepStyleShotsProps) {
  const selectedProducts = useMemo(() => products.filter(p => selectedProductIds.has(p.id)), [products, selectedProductIds]);
  const selectedModels = useMemo(() => models.filter(m => selectedModelIds.has(m.modelId)), [models, selectedModelIds]);

  const [globalExtras, setGlobalExtras] = useState<ExtraItem[]>([]);

  const combos = useMemo(() =>
    selectedProducts.flatMap(p => selectedModels.map(m => ({ product: p, model: m, key: `${p.id}_${m.modelId}` }))),
    [selectedProducts, selectedModels]
  );

  const combosWithExtras = useMemo(() => combos.filter(c => (extraItems.get(c.key) || []).length > 0).length, [combos, extraItems]);

  const addGlobalExtra = (product: Product) => {
    if (globalExtras.some(e => e.productId === product.id)) return;
    const item: ExtraItem = { productId: product.id, productTitle: product.title, productImage: product.images[0]?.url };
    const next = [...globalExtras, item];
    setGlobalExtras(next);
    const nextMap = new Map(extraItems);
    for (const combo of combos) {
      const list = nextMap.get(combo.key) || [];
      if (!list.some(e => e.productId === product.id)) {
        nextMap.set(combo.key, [...list, item]);
      }
    }
    onExtraItemsChange(nextMap);
  };

  const removeGlobalExtra = (productId: string) => {
    setGlobalExtras(prev => prev.filter(e => e.productId !== productId));
    const nextMap = new Map(extraItems);
    for (const combo of combos) {
      const list = nextMap.get(combo.key) || [];
      const filtered = list.filter(e => e.productId !== productId);
      if (filtered.length === 0) nextMap.delete(combo.key);
      else nextMap.set(combo.key, filtered);
    }
    onExtraItemsChange(nextMap);
  };

  const addExtraToCombo = (comboKey: string, product: Product) => {
    const nextMap = new Map(extraItems);
    const list = nextMap.get(comboKey) || [];
    if (list.some(e => e.productId === product.id)) return;
    nextMap.set(comboKey, [...list, { productId: product.id, productTitle: product.title, productImage: product.images[0]?.url }]);
    onExtraItemsChange(nextMap);
  };

  const removeExtraFromCombo = (comboKey: string, productId: string) => {
    const nextMap = new Map(extraItems);
    const list = (nextMap.get(comboKey) || []).filter(e => e.productId !== productId);
    if (list.length === 0) nextMap.delete(comboKey);
    else nextMap.set(comboKey, list);
    onExtraItemsChange(nextMap);
    setGlobalExtras(prev => prev.filter(e => e.productId !== productId));
  };

  const globalExcludeIds = globalExtras.map(e => e.productId);
  const extraCount = Array.from(extraItems.values()).reduce((sum, list) => sum + list.length, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Style Shots</h3>
          <Badge variant="secondary" className="text-[10px]">{combos.length} combos</Badge>
          {extraCount > 0 && <Badge variant="outline" className="text-[10px]">{extraCount} extras</Badge>}
          {combosWithExtras > 0 && (
            <span className="text-[10px] text-muted-foreground ml-auto">
              {combosWithExtras} of {combos.length} combos have extras
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Add extra products (accessories, props) to your shots. Use "Apply to All" or add per combo.
        </p>
        <p className="text-[11px] text-muted-foreground/60 italic mt-0.5">
          This step is optional — skip if no extras needed.
        </p>
      </div>

      {/* Apply to All */}
      <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2 border-l-2 border-l-primary/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">Apply to all shots</span>
          </div>
          <ProductPickerPopover
            products={products}
            excludeIds={globalExcludeIds}
            onSelect={addGlobalExtra}
            trigger={
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add product to all
              </Button>
            }
          />
        </div>
        {globalExtras.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {globalExtras.map(item => (
              <Badge key={item.productId} variant="secondary" className="text-[10px] gap-1 pr-1">
                {item.productImage && (
                  <img src={item.productImage} alt="" className="w-4 h-4 rounded object-contain" />
                )}
                {item.productTitle}
                <button onClick={() => removeGlobalExtra(item.productId)} className="ml-0.5 hover:text-destructive">
                  <X className="w-2.5 h-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Combo List */}
      <div className="space-y-2">
        {combos.map(({ product, model, key }) => {
          const items = extraItems.get(key) || [];
          const comboExcludeIds = [product.id, ...items.map(e => e.productId)];

          return (
            <div key={key} className="rounded-lg border border-border p-3 flex flex-col gap-2.5">
              {/* Product × Model row */}
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
                  <img src={product.images[0]?.url} alt={product.title} className="w-full h-full object-contain" loading="lazy" />
                </div>
                <span className="text-xs font-medium truncate max-w-[180px]">{product.title}</span>
                <span className="text-muted-foreground/50 text-xs">×</span>
                <div className="w-9 h-9 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  <img src={model.previewUrl} alt={model.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">{model.name}</span>
                {items.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] ml-auto">{items.length} extra{items.length !== 1 ? 's' : ''}</Badge>
                )}
              </div>

              {/* Extras row */}
              <div className="flex items-center gap-1.5 flex-wrap pl-12">
                {items.length === 0 && (
                  <span className="text-[11px] text-muted-foreground/50 italic mr-1">No extras</span>
                )}
                {items.map(item => (
                  <Badge key={item.productId} variant="secondary" className="text-[10px] gap-1 pr-1">
                    {item.productImage && (
                      <img src={item.productImage} alt="" className="w-4 h-4 rounded object-contain" />
                    )}
                    {item.productTitle}
                    <button onClick={() => removeExtraFromCombo(key, item.productId)} className="ml-0.5 hover:text-destructive">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </Badge>
                ))}
                <ProductPickerPopover
                  products={products}
                  excludeIds={comboExcludeIds}
                  onSelect={(p) => addExtraToCombo(key, p)}
                  trigger={
                    <Button size="sm" variant="secondary" className="h-8 text-xs gap-1.5 px-3 border border-dashed border-border">
                      <Plus className="w-3.5 h-3.5" /> Add product
                    </Button>
                  }
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} className="gap-2">
          Next: Review <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
