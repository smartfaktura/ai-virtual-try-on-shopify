import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { getShotDefinition } from '@/lib/catalogEngine';
import { cn } from '@/lib/utils';
import { ChevronLeft, ArrowRight, Plus, X, SkipForward, Gem } from 'lucide-react';
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
  /** All user products from library */
  allProducts: PropProduct[];
  /** IDs of hero products (excluded from props selection) */
  heroProductIds: Set<string>;
  /** Selected hero products for combo generation */
  heroProducts: Array<{ id: string; title: string; imageUrl: string }>;
  /** Selected models */
  models: ComboModel[];
  /** Product-only mode */
  productOnlyMode: boolean;
  /** Selected shots */
  selectedShots: Set<CatalogShotId>;
  /** Per-combo prop assignments: key = productId__modelId__shotId */
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

function PropPickerPopover({
  availableProps,
  selectedIds,
  onToggle,
  trigger,
}: {
  availableProps: PropProduct[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  trigger: React.ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-72 p-3 max-h-80 overflow-y-auto" align="end" sideOffset={6}>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Select props</p>
        {availableProps.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No additional products available.</p>
        ) : (
          <div className="space-y-1">
            {availableProps.map(p => {
              const checked = selectedIds.has(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => onToggle(p.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 rounded-lg p-2 text-left transition-colors',
                    checked ? 'bg-primary/5' : 'hover:bg-muted/60',
                  )}
                >
                  <Checkbox checked={checked} className="pointer-events-none flex-shrink-0" />
                  <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                    <ShimmerImage
                      src={getOptimizedUrl(p.image_url, { width: 64, quality: 50 })}
                      alt={p.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium truncate text-foreground">{p.title}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{p.product_type}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function CatalogStepProps({
  allProducts, heroProductIds, heroProducts, models, productOnlyMode,
  selectedShots, propAssignments, onPropAssignmentsChange, onBack, onNext,
}: CatalogStepPropsProps) {
  const availableProps = useMemo(
    () => allProducts.filter(p => !heroProductIds.has(p.id)),
    [allProducts, heroProductIds],
  );

  // Build combo list
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

  const handleToggleProp = (comboKey: string, propId: string) => {
    const current = new Set(propAssignments[comboKey] || []);
    if (current.has(propId)) current.delete(propId);
    else current.add(propId);
    onPropAssignmentsChange({
      ...propAssignments,
      [comboKey]: Array.from(current),
    });
  };

  const handleRemoveProp = (comboKey: string, propId: string) => {
    const current = (propAssignments[comboKey] || []).filter(id => id !== propId);
    onPropAssignmentsChange({
      ...propAssignments,
      [comboKey]: current,
    });
  };

  const handleApplyToAll = (propId: string) => {
    const next = { ...propAssignments };
    for (const combo of combos) {
      const current = new Set(next[combo.key] || []);
      if (current.has(propId)) current.delete(propId);
      else current.add(propId);
      next[combo.key] = Array.from(current);
    }
    onPropAssignmentsChange(next);
  };

  const handleClearAll = () => {
    onPropAssignmentsChange({});
  };

  return (
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
          {/* Global apply controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <PropPickerPopover
              availableProps={availableProps}
              selectedIds={new Set()}
              onToggle={handleApplyToAll}
              trigger={
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Add prop to all shots
                </Button>
              }
            />
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
                    <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                      <ShimmerImage
                        src={getOptimizedUrl(combo.product.imageUrl, { width: 64, quality: 50 })}
                        alt={combo.product.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-foreground truncate">
                        {combo.product.title}
                        {combo.model && <span className="text-muted-foreground"> × {combo.model.name}</span>}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{combo.shot.label}</p>
                    </div>
                    <PropPickerPopover
                      availableProps={availableProps}
                      selectedIds={new Set(assignedIds)}
                      onToggle={(propId) => handleToggleProp(combo.key, propId)}
                      trigger={
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] gap-1 text-muted-foreground hover:text-foreground">
                          <Plus className="w-3 h-3" />
                          {assignedIds.length > 0 ? `${assignedIds.length} prop${assignedIds.length !== 1 ? 's' : ''}` : 'Add prop'}
                        </Button>
                      }
                    />
                  </div>

                  {/* Assigned props chips */}
                  {assignedProducts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 ml-9 pl-0.5">
                      {assignedProducts.map(p => (
                        <span
                          key={p.id}
                          className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary rounded-md px-2 py-0.5 font-medium"
                        >
                          {p.title}
                          <button
                            onClick={() => handleRemoveProp(combo.key, p.id)}
                            className="hover:text-destructive transition-colors"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
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
    </div>
  );
}
