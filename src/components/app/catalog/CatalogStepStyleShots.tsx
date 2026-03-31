import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Wand2, Plus, X, Settings2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CatalogShotStyler } from './CatalogShotStyler';
import { catalogPoses, catalogBackgrounds } from '@/data/catalogPoses';
import type { Product, ModelProfile } from '@/types';
import type { ShotOverride } from './CatalogShotStyler';

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
  shotOverrides: Map<string, ShotOverride>;
  onShotOverridesChange: (overrides: Map<string, ShotOverride>) => void;
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
  const available = products.filter(p => !excludeIds.includes(p.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-64 p-2 max-h-60 overflow-y-auto" align="start">
        {available.length === 0 ? (
          <p className="text-xs text-muted-foreground p-2">No more products available</p>
        ) : (
          available.map(p => (
            <button
              key={p.id}
              onClick={() => { onSelect(p); setOpen(false); }}
              className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted transition-colors"
            >
              <div className="w-7 h-7 rounded bg-muted overflow-hidden flex-shrink-0">
                <img src={p.images[0]?.url} alt={p.title} className="w-full h-full object-contain" loading="lazy" />
              </div>
              <span className="truncate">{p.title}</span>
            </button>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
}

export function CatalogStepStyleShots({
  products, selectedProductIds, models, selectedModelIds,
  shotOverrides, onShotOverridesChange,
  extraItems, onExtraItemsChange,
  onBack, onNext,
}: CatalogStepStyleShotsProps) {
  const [stylerOpen, setStylerOpen] = useState(false);
  const [stylerKey, setStylerKey] = useState<string | null>(null);

  const selectedProducts = useMemo(() => products.filter(p => selectedProductIds.has(p.id)), [products, selectedProductIds]);
  const selectedModels = useMemo(() => models.filter(m => selectedModelIds.has(m.modelId)), [models, selectedModelIds]);
  const allPoses = useMemo(() => [...catalogPoses, ...catalogBackgrounds], []);

  // Global extras applied to all combos
  const [globalExtras, setGlobalExtras] = useState<ExtraItem[]>([]);

  const combos = useMemo(() =>
    selectedProducts.flatMap(p => selectedModels.map(m => ({ product: p, model: m, key: `${p.id}_${m.modelId}` }))),
    [selectedProducts, selectedModels]
  );

  const addGlobalExtra = (product: Product) => {
    if (globalExtras.some(e => e.productId === product.id)) return;
    const item: ExtraItem = { productId: product.id, productTitle: product.title, productImage: product.images[0]?.url };
    const next = [...globalExtras, item];
    setGlobalExtras(next);
    // Apply to all combos
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
    // Remove from all combos
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
    // Also remove from global if it was global
    setGlobalExtras(prev => prev.filter(e => e.productId !== productId));
  };

  const globalExcludeIds = globalExtras.map(e => e.productId);
  const extraCount = Array.from(extraItems.values()).reduce((sum, list) => sum + list.length, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Wand2 className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Style Shots</h3>
        <Badge variant="secondary" className="text-[10px]">{combos.length} combos</Badge>
        {extraCount > 0 && <Badge variant="outline" className="text-[10px]">{extraCount} extras</Badge>}
      </div>
      <p className="text-xs text-muted-foreground">
        Add extra products (accessories, props) to your shots. Use "Apply to All" or customize per combo.
      </p>

      {/* Apply to All */}
      <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Apply to all shots</span>
          <ProductPickerPopover
            products={products}
            excludeIds={globalExcludeIds}
            onSelect={addGlobalExtra}
            trigger={
              <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1">
                <Plus className="w-3 h-3" /> Add product to all
              </Button>
            }
          />
        </div>
        {globalExtras.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {globalExtras.map(item => (
              <Badge key={item.productId} variant="secondary" className="text-[10px] gap-1 pr-1">
                {item.productImage && (
                  <img src={item.productImage} alt="" className="w-3.5 h-3.5 rounded object-contain" />
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
      <div className="space-y-1.5">
        {combos.map(({ product, model, key }) => {
          const items = extraItems.get(key) || [];
          const hasOverride = shotOverrides.has(key);
          const comboExcludeIds = [product.id, ...items.map(e => e.productId)];

          return (
            <div key={key} className="rounded-lg border border-border p-3 flex flex-col gap-2">
              {/* Product × Model row */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-muted overflow-hidden flex-shrink-0">
                  <img src={product.images[0]?.url} alt={product.title} className="w-full h-full object-contain" loading="lazy" />
                </div>
                <span className="text-xs font-medium truncate max-w-[120px]">{product.title}</span>
                <span className="text-muted-foreground/50 text-xs">×</span>
                <div className="w-7 h-7 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  <img src={model.previewUrl} alt={model.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <span className="text-xs text-muted-foreground truncate max-w-[80px]">{model.name}</span>

                <div className="ml-auto flex items-center gap-1">
                  <button
                    onClick={() => { setStylerKey(key); setStylerOpen(true); }}
                    className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border transition-colors ${
                      hasOverride
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    <Settings2 className="w-3 h-3" />
                    {hasOverride ? 'Customized' : 'Customize'}
                  </button>
                </div>
              </div>

              {/* Extras row */}
              <div className="flex items-center gap-1.5 flex-wrap pl-10">
                {items.map(item => (
                  <Badge key={item.productId} variant="secondary" className="text-[10px] gap-1 pr-1">
                    {item.productImage && (
                      <img src={item.productImage} alt="" className="w-3.5 h-3.5 rounded object-contain" />
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
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 px-2">
                      <Plus className="w-3 h-3" /> Add
                    </Button>
                  }
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Shot Styler Dialog */}
      {stylerKey && (
        <CatalogShotStyler
          open={stylerOpen}
          onOpenChange={setStylerOpen}
          comboKey={stylerKey}
          currentOverride={shotOverrides.get(stylerKey)}
          allPoses={allPoses}
          onSave={(override) => {
            const next = new Map(shotOverrides);
            if (override) next.set(stylerKey, override);
            else next.delete(stylerKey);
            onShotOverridesChange(next);
            setStylerOpen(false);
          }}
        />
      )}

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
