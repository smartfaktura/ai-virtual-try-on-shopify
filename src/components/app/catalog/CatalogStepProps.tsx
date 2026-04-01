import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { getShotDefinition } from '@/lib/catalogEngine';
import { cn } from '@/lib/utils';
import { ChevronLeft, ArrowRight, Plus, X, SkipForward, Gem, Search, Check } from 'lucide-react';
import type { CatalogShotId } from '@/types/catalog';

interface PropProduct {
  id: string;
  title: string;
  image_url: string;
  product_type: string;
}

interface ComboModel {
  id: string;
  name: string;
  previewUrl?: string;
}

interface CatalogStepPropsProps {
  allProducts: PropProduct[];
  heroProductIds: Set<string>;
  heroProducts: Array<{ id: string; title: string; imageUrl: string }>;
  models: ComboModel[];
  productOnlyMode: boolean;
  selectedShots: Set<CatalogShotId>;
  propAssignments: Record<string, string[]>;
  onPropAssignmentsChange: (assignments: Record<string, string[]>) => void;
  onBack: () => void;
  onNext: () => void;
}

interface GenerationCombo {
  key: string;
  product: { id: string; title: string; imageUrl: string };
  model: { id: string; name: string } | null;
  shot: { id: CatalogShotId; label: string };
}

// --- Prop Picker Modal ---
function PropPickerModal({
  open,
  onOpenChange,
  availableProps,
  selectedIds,
  onConfirm,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableProps: PropProduct[];
  selectedIds: Set<string>;
  onConfirm: (ids: Set<string>) => void;
  title: string;
}) {
  const [search, setSearch] = useState('');
  const [localSelected, setLocalSelected] = useState<Set<string>>(new Set(selectedIds));

  // Reset local state when opened
  const handleOpenChange = (v: boolean) => {
    if (v) setLocalSelected(new Set(selectedIds));
    onOpenChange(v);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return availableProps;
    const q = search.toLowerCase();
    return availableProps.filter(p =>
      p.title.toLowerCase().includes(q) || p.product_type.toLowerCase().includes(q)
    );
  }, [availableProps, search]);

  const toggleItem = (id: string) => {
    setLocalSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-sm">{title}</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto min-h-0 -mx-1 px-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No products found.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 py-2">
              {filtered.map(p => {
                const checked = localSelected.has(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleItem(p.id)}
                    className={cn(
                      'relative rounded-lg border p-2 text-left transition-all hover:shadow-sm',
                      checked ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border hover:border-foreground/20',
                    )}
                  >
                    {checked && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <div className="w-full aspect-square rounded-md overflow-hidden bg-muted mb-1.5">
                      <ShimmerImage
                        src={getOptimizedUrl(p.image_url, { width: 160, quality: 60 })}
                        alt={p.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[10px] font-medium text-foreground truncate">{p.title}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{p.product_type}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={() => {
              onConfirm(localSelected);
              onOpenChange(false);
            }}
            className="w-full gap-2"
          >
            Select {localSelected.size > 0 ? `${localSelected.size} Prop${localSelected.size !== 1 ? 's' : ''}` : 'Props'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Component ---
export function CatalogStepProps({
  allProducts, heroProductIds, heroProducts, models, productOnlyMode,
  selectedShots, propAssignments, onPropAssignmentsChange, onBack, onNext,
}: CatalogStepPropsProps) {
  const [pickerTarget, setPickerTarget] = useState<{ comboKey: string; title: string } | 'global' | null>(null);

  const availableProps = useMemo(
    () => allProducts.filter(p => !heroProductIds.has(p.id)),
    [allProducts, heroProductIds],
  );

  const combos: GenerationCombo[] = useMemo(() => {
    const shots = Array.from(selectedShots).map(id => {
      const def = getShotDefinition(id);
      return def ? { id, label: def.label } : null;
    }).filter(Boolean) as { id: CatalogShotId; label: string }[];

    const modelEntries = productOnlyMode || models.length === 0
      ? [null]
      : models.map(m => ({ id: m.id, name: m.name }));

    const result: GenerationCombo[] = [];
    for (const product of heroProducts) {
      for (const model of modelEntries) {
        for (const shot of shots) {
          const modelKey = model ? model.id : '__none__';
          result.push({
            key: `${product.id}__${modelKey}__${shot.id}`,
            product,
            model,
            shot,
          });
        }
      }
    }
    return result;
  }, [heroProducts, models, productOnlyMode, selectedShots]);

  const totalWithProps = useMemo(
    () => combos.filter(c => (propAssignments[c.key]?.length ?? 0) > 0).length,
    [combos, propAssignments],
  );

  const handlePickerConfirm = (ids: Set<string>) => {
    if (pickerTarget === 'global') {
      // Apply to all combos
      const next = { ...propAssignments };
      for (const combo of combos) {
        next[combo.key] = Array.from(ids);
      }
      onPropAssignmentsChange(next);
    } else if (pickerTarget && typeof pickerTarget === 'object') {
      onPropAssignmentsChange({
        ...propAssignments,
        [pickerTarget.comboKey]: Array.from(ids),
      });
    }
    setPickerTarget(null);
  };

  const handleRemoveProp = (comboKey: string, propId: string) => {
    const current = (propAssignments[comboKey] || []).filter(id => id !== propId);
    onPropAssignmentsChange({
      ...propAssignments,
      [comboKey]: current,
    });
  };

  const handleClearAll = () => {
    onPropAssignmentsChange({});
  };

  const pickerSelectedIds = useMemo(() => {
    if (pickerTarget === 'global') return new Set<string>();
    if (pickerTarget && typeof pickerTarget === 'object') {
      return new Set(propAssignments[pickerTarget.comboKey] || []);
    }
    return new Set<string>();
  }, [pickerTarget, propAssignments]);

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Add Styling Props</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add extra items to your shots. Pick per shot or apply to all <span className="text-muted-foreground/60">(optional)</span>
          </p>
        </div>

        {availableProps.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center space-y-2">
            <Gem className="w-6 h-6 text-muted-foreground/40 mx-auto" />
            <p className="text-sm text-muted-foreground">No additional products available as props.</p>
            <p className="text-xs text-muted-foreground/60">Add more products to your library to use them as styling accessories.</p>
          </div>
        ) : (
          <>
            {/* Global controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setPickerTarget('global')}
              >
                <Plus className="w-3.5 h-3.5" /> Add prop to all shots
              </Button>
              {totalWithProps > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{totalWithProps}/{combos.length} shots have props</Badge>
                  <button onClick={handleClearAll} className="text-[10px] text-muted-foreground hover:text-foreground underline">Clear all</button>
                </div>
              )}
            </div>

            {/* Combo list */}
            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-0.5">
              {combos.map((combo, idx) => {
                const assignedIds = propAssignments[combo.key] || [];
                const assignedProducts = assignedIds.map(id => availableProps.find(p => p.id === id)).filter(Boolean) as PropProduct[];

                return (
                  <div
                    key={combo.key}
                    className={cn(
                      'rounded-lg border p-3 transition-colors',
                      assignedIds.length > 0 ? 'border-primary/20 bg-primary/[0.02]' : 'border-border bg-card',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-muted-foreground/50 w-6 text-right flex-shrink-0">#{idx + 1}</span>

                      {/* Product thumbnail */}
                      <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                        <ShimmerImage
                          src={getOptimizedUrl(combo.product.imageUrl, { width: 64, quality: 50 })}
                          alt={combo.product.title}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Shot badge with hover preview */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-[9px] cursor-help flex-shrink-0 gap-1">
                            {combo.shot.label}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="p-1">
                          <p className="text-xs font-medium">{combo.shot.label}</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Combo details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-foreground truncate">
                          {combo.product.title}
                          {combo.model && <span className="text-muted-foreground"> × {combo.model.name}</span>}
                        </p>
                      </div>

                      {/* Assigned props as image chips (inline) */}
                      {assignedProducts.length > 0 && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {assignedProducts.slice(0, 3).map(p => (
                            <span
                              key={p.id}
                              className="inline-flex items-center gap-1 text-[9px] bg-primary/10 text-primary rounded-md pl-0.5 pr-1.5 py-0.5 font-medium"
                            >
                              <div className="w-4 h-4 rounded overflow-hidden bg-muted flex-shrink-0">
                                <img src={getOptimizedUrl(p.image_url, { width: 32, quality: 40 })} alt={p.title} className="w-full h-full object-cover" />
                              </div>
                              {p.title.length > 12 ? p.title.slice(0, 10) + '…' : p.title}
                              <button
                                onClick={() => handleRemoveProp(combo.key, p.id)}
                                className="hover:text-destructive transition-colors ml-0.5"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ))}
                          {assignedProducts.length > 3 && (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">+{assignedProducts.length - 3}</Badge>
                          )}
                        </div>
                      )}

                      {/* Add prop button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[10px] gap-1 text-muted-foreground hover:text-foreground flex-shrink-0"
                        onClick={() => setPickerTarget({ comboKey: combo.key, title: `#${idx + 1} ${combo.product.title}` })}
                      >
                        <Plus className="w-3 h-3" />
                        {assignedIds.length > 0 ? 'Edit' : 'Add prop'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex items-center gap-3">
            {totalWithProps === 0 && (
              <button onClick={onNext} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <SkipForward className="w-3.5 h-3.5" /> Skip — no props
              </button>
            )}
            <Button onClick={onNext} className="gap-2">
              {totalWithProps > 0 ? `Next (${totalWithProps} shots with props)` : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Prop Picker Modal */}
        <PropPickerModal
          open={pickerTarget !== null}
          onOpenChange={(v) => { if (!v) setPickerTarget(null); }}
          availableProps={availableProps}
          selectedIds={pickerSelectedIds}
          onConfirm={handlePickerConfirm}
          title={pickerTarget === 'global' ? 'Add props to all shots' : `Add props to ${typeof pickerTarget === 'object' ? pickerTarget?.title : ''}`}
        />
      </div>
    </TooltipProvider>
  );
}
