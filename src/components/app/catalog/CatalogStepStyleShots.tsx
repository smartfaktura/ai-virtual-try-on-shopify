import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Wand2, Plus, X, Search, Package, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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

/* ── Reusable product picker popover ── */
function ProductPickerPopover({
  products, excludeIds, onSelect, trigger,
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
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} className="h-8 pl-8 text-xs" autoFocus />
          </div>
        </div>
        <div className="overflow-y-auto max-h-56 p-1.5">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground p-3 text-center">
              {available.length === 0 ? 'No more products available' : 'No match'}
            </p>
          ) : filtered.map(p => (
            <button key={p.id} onClick={() => { onSelect(p); setOpen(false); setSearch(''); }}
              className="flex items-center gap-2.5 w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted transition-colors">
              <div className="w-9 h-9 rounded-md bg-muted overflow-hidden flex-shrink-0">
                <img src={p.images[0]?.url} alt={p.title} className="w-full h-full object-contain" loading="lazy" />
              </div>
              <span className="truncate font-medium">{p.title}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ── Main component ── */
export function CatalogStepStyleShots({
  products, selectedProductIds, models, selectedModelIds,
  extraItems, onExtraItemsChange, onBack, onNext,
}: CatalogStepStyleShotsProps) {
  const selectedProducts = useMemo(() => products.filter(p => selectedProductIds.has(p.id)), [products, selectedProductIds]);
  const selectedModels = useMemo(() => models.filter(m => selectedModelIds.has(m.modelId)), [models, selectedModelIds]);

  const [globalExtras, setGlobalExtras] = useState<ExtraItem[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

  // Build combo keys
  const comboKeys = useMemo(() =>
    selectedProducts.flatMap(p => selectedModels.map(m => ({ productId: p.id, modelId: m.modelId, key: `${p.id}_${m.modelId}` }))),
    [selectedProducts, selectedModels]
  );

  const totalCombos = comboKeys.length;
  const extraCount = Array.from(extraItems.values()).reduce((sum, list) => sum + list.length, 0);

  // Helpers
  const addGlobalExtra = (product: Product) => {
    if (globalExtras.some(e => e.productId === product.id)) return;
    const item: ExtraItem = { productId: product.id, productTitle: product.title, productImage: product.images[0]?.url };
    const next = [...globalExtras, item];
    setGlobalExtras(next);
    const nextMap = new Map(extraItems);
    for (const c of comboKeys) {
      const list = nextMap.get(c.key) || [];
      if (!list.some(e => e.productId === product.id)) nextMap.set(c.key, [...list, item]);
    }
    onExtraItemsChange(nextMap);
  };

  const removeGlobalExtra = (productId: string) => {
    setGlobalExtras(prev => prev.filter(e => e.productId !== productId));
    const nextMap = new Map(extraItems);
    for (const c of comboKeys) {
      const list = (nextMap.get(c.key) || []).filter(e => e.productId !== productId);
      if (list.length === 0) nextMap.delete(c.key); else nextMap.set(c.key, list);
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
    if (list.length === 0) nextMap.delete(comboKey); else nextMap.set(comboKey, list);
    onExtraItemsChange(nextMap);
    setGlobalExtras(prev => prev.filter(e => e.productId !== productId));
  };

  const addExtraToAllModelsForProduct = (productId: string, extraProduct: Product) => {
    const nextMap = new Map(extraItems);
    for (const m of selectedModels) {
      const key = `${productId}_${m.modelId}`;
      const list = nextMap.get(key) || [];
      if (!list.some(e => e.productId === extraProduct.id)) {
        nextMap.set(key, [...list, { productId: extraProduct.id, productTitle: extraProduct.title, productImage: extraProduct.images[0]?.url }]);
      }
    }
    onExtraItemsChange(nextMap);
  };

  // Filter products by search
  const filteredProducts = searchFilter.trim()
    ? selectedProducts.filter(p => p.title.toLowerCase().includes(searchFilter.trim().toLowerCase()))
    : selectedProducts;

  const globalExcludeIds = globalExtras.map(e => e.productId);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Style Shots</h3>
          <Badge variant="secondary" className="text-[10px]">{totalCombos} combos</Badge>
          {extraCount > 0 && <Badge variant="outline" className="text-[10px]">{extraCount} extras</Badge>}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Add extra products (accessories, props) to shots. Use "Apply to All" or add per product/model.
        </p>
        <p className="text-[11px] text-muted-foreground/60 italic mt-0.5">Optional — skip if no extras needed.</p>
      </div>

      {/* Apply to All */}
      <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2 border-l-2 border-l-primary/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">Apply to all shots</span>
          </div>
          <ProductPickerPopover products={products} excludeIds={globalExcludeIds} onSelect={addGlobalExtra}
            trigger={<Button size="sm" variant="outline" className="h-7 text-xs gap-1.5"><Plus className="w-3.5 h-3.5" /> Add to all</Button>} />
        </div>
        {globalExtras.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {globalExtras.map(item => (
              <Badge key={item.productId} variant="secondary" className="text-[10px] gap-1 pr-1">
                {item.productImage && <img src={item.productImage} alt="" className="w-4 h-4 rounded object-contain" />}
                {item.productTitle}
                <button onClick={() => removeGlobalExtra(item.productId)} className="ml-0.5 hover:text-destructive"><X className="w-2.5 h-2.5" /></button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Search filter */}
      {selectedProducts.length > 4 && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Filter products…" value={searchFilter} onChange={e => setSearchFilter(e.target.value)} className="h-8 pl-8 text-xs" />
        </div>
      )}

      {/* Grouped product list */}
      <div className="space-y-2">
        {filteredProducts.map((product, idx) => {
          const productExtrasCount = selectedModels.reduce((sum, m) => sum + (extraItems.get(`${product.id}_${m.modelId}`) || []).length, 0);
          const productExcludeIds = [product.id, ...globalExcludeIds];

          return (
            <Collapsible key={product.id} defaultOpen>
              <div className="rounded-lg border border-border overflow-hidden">
                {/* Product header */}
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-muted/50 transition-colors text-left">
                    <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">#{idx + 1}</span>
                    <div className="w-8 h-8 rounded-md bg-muted overflow-hidden shrink-0">
                      <img src={product.images[0]?.url} alt={product.title} className="w-full h-full object-contain" loading="lazy" />
                    </div>
                    <span className="text-xs font-medium truncate flex-1">{product.title}</span>
                    {productExtrasCount > 0 && (
                      <Badge variant="secondary" className="text-[10px] shrink-0">{productExtrasCount} extra{productExtrasCount !== 1 ? 's' : ''}</Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground shrink-0">{selectedModels.length} models</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t border-border">
                    {/* Per-product "add to all models" */}
                    <div className="px-3 py-1.5 bg-muted/20 border-b border-border flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Add extra to all models for this product</span>
                      <ProductPickerPopover products={products} excludeIds={productExcludeIds}
                        onSelect={(p) => addExtraToAllModelsForProduct(product.id, p)}
                        trigger={<Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 px-2"><Plus className="w-3 h-3" /> All models</Button>} />
                    </div>

                    {/* Model rows */}
                    {selectedModels.map(model => {
                      const comboKey = `${product.id}_${model.modelId}`;
                      const items = extraItems.get(comboKey) || [];
                      const comboExcludeIds = [product.id, ...items.map(e => e.productId)];

                      return (
                        <div key={comboKey} className="flex items-center gap-2 px-3 py-1.5 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                          {/* Model avatar + name */}
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-muted shrink-0">
                            <img src={model.previewUrl} alt={model.name} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          <span className="text-xs text-muted-foreground truncate w-20 shrink-0">{model.name}</span>

                          {/* Extra badges */}
                          <div className="flex items-center gap-1 flex-1 flex-wrap min-w-0">
                            {items.map(item => (
                              <Badge key={item.productId} variant="secondary" className="text-[10px] gap-0.5 pr-0.5 max-w-[140px]">
                                {item.productImage && <img src={item.productImage} alt="" className="w-3.5 h-3.5 rounded object-contain" />}
                                <span className="truncate">{item.productTitle}</span>
                                <button onClick={() => removeExtraFromCombo(comboKey, item.productId)} className="ml-0.5 hover:text-destructive">
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </Badge>
                            ))}
                          </div>

                          {/* Add button */}
                          <ProductPickerPopover products={products} excludeIds={comboExcludeIds}
                            onSelect={(p) => addExtraToCombo(comboKey, p)}
                            trigger={
                              <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 px-2 shrink-0 text-muted-foreground hover:text-foreground">
                                <Plus className="w-3 h-3" /> Add
                              </Button>
                            } />
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2"><ChevronLeft className="w-4 h-4" /> Back</Button>
        <Button onClick={onNext} className="gap-2">Next: Review <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}
