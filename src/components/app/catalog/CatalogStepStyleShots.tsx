import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Wand2, Plus, X, ShoppingBag } from 'lucide-react';
import { CatalogShotStyler } from './CatalogShotStyler';
import { catalogPoses, catalogBackgrounds } from '@/data/catalogPoses';
import type { Product, ModelProfile, TryOnPose } from '@/types';
import type { ShotOverride } from './CatalogShotStyler';

export interface ExtraItem {
  label: string;
  placement: 'head' | 'hand' | 'shoulder' | 'body' | 'scene';
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

const PLACEMENT_OPTIONS = [
  { value: 'head' as const, label: 'Head' },
  { value: 'hand' as const, label: 'Hand' },
  { value: 'shoulder' as const, label: 'Shoulder' },
  { value: 'body' as const, label: 'Body' },
  { value: 'scene' as const, label: 'Scene' },
];

export function CatalogStepStyleShots({
  products, selectedProductIds, models, selectedModelIds,
  shotOverrides, onShotOverridesChange,
  extraItems, onExtraItemsChange,
  onBack, onNext,
}: CatalogStepStyleShotsProps) {
  const [stylerOpen, setStylerOpen] = useState(false);
  const [stylerKey, setStylerKey] = useState<string | null>(null);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemPlacement, setNewItemPlacement] = useState<ExtraItem['placement']>('hand');
  const [activeComboForExtra, setActiveComboForExtra] = useState<string | null>(null);

  const selectedProducts = useMemo(() => products.filter(p => selectedProductIds.has(p.id)), [products, selectedProductIds]);
  const selectedModels = useMemo(() => models.filter(m => selectedModelIds.has(m.modelId)), [models, selectedModelIds]);

  const allPoses = useMemo(() => [...catalogPoses, ...catalogBackgrounds], []);

  const openStyler = (productId: string, modelId: string) => {
    setStylerKey(`${productId}_${modelId}`);
    setStylerOpen(true);
  };

  const addExtraItem = (comboKey: string) => {
    if (!newItemLabel.trim()) return;
    const next = new Map(extraItems);
    const list = next.get(comboKey) || [];
    list.push({ label: newItemLabel.trim(), placement: newItemPlacement });
    next.set(comboKey, list);
    onExtraItemsChange(next);
    setNewItemLabel('');
  };

  const removeExtraItem = (comboKey: string, index: number) => {
    const next = new Map(extraItems);
    const list = [...(next.get(comboKey) || [])];
    list.splice(index, 1);
    if (list.length === 0) next.delete(comboKey);
    else next.set(comboKey, list);
    onExtraItemsChange(next);
  };

  const comboCount = selectedProducts.length * selectedModels.length;
  const overrideCount = shotOverrides.size;
  const extraCount = Array.from(extraItems.values()).reduce((sum, list) => sum + list.length, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Wand2 className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Style Shots</h3>
        <Badge variant="secondary" className="text-[10px]">{comboCount} combos</Badge>
        {overrideCount > 0 && <Badge variant="default" className="text-[10px]">{overrideCount} overrides</Badge>}
        {extraCount > 0 && <Badge variant="outline" className="text-[10px]">{extraCount} extras</Badge>}
      </div>
      <p className="text-xs text-muted-foreground">
        Optionally customize individual product × model combinations. Override pose, background, framing, or add extra items like accessories.
      </p>

      <Tabs defaultValue="overrides">
        <TabsList>
          <TabsTrigger value="overrides">Overrides</TabsTrigger>
          <TabsTrigger value="extras">Extra Items</TabsTrigger>
        </TabsList>

        <TabsContent value="overrides">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-2 text-left font-medium text-muted-foreground">Product \ Model</th>
                  {selectedModels.map(m => (
                    <th key={m.modelId} className="p-2 text-center font-medium text-muted-foreground">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted mx-auto mb-1">
                        <img src={m.previewUrl} alt={m.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="truncate block max-w-[60px]">{m.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedProducts.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="p-2 flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-muted overflow-hidden flex-shrink-0">
                        <img src={p.images[0]?.url} alt={p.title} className="w-full h-full object-contain" />
                      </div>
                      <span className="truncate max-w-[100px]">{p.title}</span>
                    </td>
                    {selectedModels.map(m => {
                      const key = `${p.id}_${m.modelId}`;
                      const hasOverride = shotOverrides.has(key);
                      return (
                        <td key={m.modelId} className="p-2 text-center">
                          <button
                            onClick={() => openStyler(p.id, m.modelId)}
                            className={`w-8 h-8 rounded-md border transition-all text-[10px] font-medium ${
                              hasOverride
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                            }`}
                          >
                            {hasOverride ? '✓' : '+'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="extras">
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Add accessories or props to specific product × model combos (e.g. "beige hat", "gold chain", "mini bag").
            </p>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="p-2 text-left font-medium text-muted-foreground">Combo</th>
                    <th className="p-2 text-left font-medium text-muted-foreground">Extra Items</th>
                    <th className="p-2 text-center font-medium text-muted-foreground w-48">Add</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.flatMap(p =>
                    selectedModels.map(m => {
                      const key = `${p.id}_${m.modelId}`;
                      const items = extraItems.get(key) || [];
                      const isActive = activeComboForExtra === key;
                      return (
                        <tr key={key} className="border-b border-border last:border-0">
                          <td className="p-2">
                            <span className="text-muted-foreground">{p.title}</span>
                            <span className="text-muted-foreground/60 mx-1">×</span>
                            <span className="text-muted-foreground">{m.name}</span>
                          </td>
                          <td className="p-2">
                            <div className="flex flex-wrap gap-1">
                              {items.map((item, i) => (
                                <Badge key={i} variant="secondary" className="text-[10px] gap-1">
                                  <ShoppingBag className="w-2.5 h-2.5" />
                                  {item.label} ({item.placement})
                                  <button onClick={() => removeExtraItem(key, i)} className="ml-0.5 hover:text-destructive">
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </Badge>
                              ))}
                              {items.length === 0 && <span className="text-muted-foreground/50">—</span>}
                            </div>
                          </td>
                          <td className="p-2">
                            {isActive ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  value={newItemLabel}
                                  onChange={e => setNewItemLabel(e.target.value)}
                                  placeholder="e.g. beige hat"
                                  className="h-7 text-[11px] w-24"
                                  onKeyDown={e => e.key === 'Enter' && addExtraItem(key)}
                                />
                                <select
                                  value={newItemPlacement}
                                  onChange={e => setNewItemPlacement(e.target.value as ExtraItem['placement'])}
                                  className="h-7 text-[11px] rounded border border-border bg-background px-1"
                                >
                                  {PLACEMENT_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                  ))}
                                </select>
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => addExtraItem(key)}>
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-[10px] gap-1"
                                onClick={() => { setActiveComboForExtra(key); setNewItemLabel(''); }}
                              >
                                <Plus className="w-3 h-3" /> Add
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

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
