import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { ImageIcon, Coins, ChevronRight, RotateCcw, Plus, X, Search, PackagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DetailSettings, ProductImageScene, UserProduct } from './types';

interface Step3SettingsProps {
  details: DetailSettings;
  onDetailsChange: (d: DetailSettings) => void;
  productCount?: number;
  sceneCount?: number;
  selectedScenes?: ProductImageScene[];
  allProducts?: UserProduct[];
  selectedProductIds?: Set<string>;
}

/* ── Tiny helpers ── */

function RatioShape({ ratio }: { ratio: string }) {
  const size = 14;
  const shapes: Record<string, { w: number; h: number }> = {
    '1:1': { w: 10, h: 10 }, '4:5': { w: 9, h: 11 }, '3:4': { w: 8, h: 11 },
    '9:16': { w: 7, h: 12 }, '16:9': { w: 12, h: 7 },
  };
  const s = shapes[ratio] || { w: 10, h: 10 };
  const x = (size - s.w) / 2;
  const y = (size - s.h) / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <rect x={x} y={y} width={s.w} height={s.h} rx={1.5} className="fill-none stroke-current" strokeWidth={1.5} />
    </svg>
  );
}

function ChipSelector({ label, value, onChange, options }: { label: string; value?: string; onChange: (v: string) => void; options: { value: string; label: string; icon?: React.ReactNode }[] }) {
  return (
    <div className="space-y-2">
      {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
      <div className="flex flex-wrap gap-1.5">
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(value === o.value ? '' : o.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer ${
              value === o.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
            }`}
          >
            {o.icon}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function MiniRatioChips({ activeRatios, globalRatios, onChange }: { activeRatios: string[]; globalRatios: string[]; onChange: (ratios: string[]) => void }) {
  const ratios = ['1:1', '4:5', '3:4', '9:16', '16:9'];
  const activeSet = new Set(activeRatios);
  const globalSet = new Set(globalRatios);
  const toggle = (r: string) => {
    if (activeSet.has(r)) {
      if (activeSet.size <= 1) return;
      onChange(activeRatios.filter(x => x !== r));
    } else {
      onChange([...activeRatios, r]);
    }
  };
  return (
    <div className="flex gap-1">
      {ratios.map(r => {
        const isActive = activeSet.has(r);
        const isGlobalDefault = globalSet.has(r);
        return (
          <button
            key={r}
            type="button"
            onClick={() => toggle(r)}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all border cursor-pointer',
              isActive
                ? 'bg-primary text-primary-foreground border-primary'
                : isGlobalDefault
                  ? 'bg-muted/60 text-muted-foreground border-border/60 hover:border-primary/40'
                  : 'bg-muted/30 text-muted-foreground/70 border-border/40 hover:border-primary/40'
            )}
          >
            <RatioShape ratio={r} />
            {r}
          </button>
        );
      })}
    </div>
  );
}

/* ── Prop Picker Modal ── */

function PropPickerModal({
  open,
  onOpenChange,
  products,
  excludeIds,
  alreadySelected,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  products: UserProduct[];
  excludeIds: Set<string>;
  alreadySelected: string[];
  onConfirm: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set(alreadySelected));

  const available = products.filter(
    p => !excludeIds.has(p.id) && (p.title.toLowerCase().includes(search.toLowerCase()) || p.product_type.toLowerCase().includes(search.toLowerCase())),
  );

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selected));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <PackagePlus className="w-4 h-4 text-primary" />
            Add Props / Accessories
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground -mt-2">Pick products from your catalog to add as styling props in this scene.</p>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[280px] overflow-y-auto p-0.5">
          {available.map(p => {
            const isSel = selected.has(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                className={cn(
                  'relative rounded-lg border-2 p-1.5 transition-all text-left',
                  isSel ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40',
                )}
              >
                <ShimmerImage src={p.image_url} alt={p.title} className="w-full aspect-square object-contain rounded bg-white" />
                <p className="text-[10px] font-medium truncate mt-1">{p.title}</p>
              </button>
            );
          })}
          {available.length === 0 && <p className="col-span-full text-center text-xs text-muted-foreground py-6">No products available</p>}
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">{selected.size} selected</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button size="sm" onClick={handleConfirm}>Confirm</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Constants ── */

const ASPECT_RATIOS = [
  { value: '1:1', label: 'Square 1:1' },
  { value: '4:5', label: 'Portrait 4:5' },
  { value: '3:4', label: 'Tall 3:4' },
  { value: '9:16', label: 'Story 9:16' },
  { value: '16:9', label: 'Landscape 16:9' },
];

const IMAGE_COUNT_OPTIONS = [
  { value: '1', label: '1 image' },
  { value: '2', label: '2 images' },
  { value: '3', label: '3 images' },
  { value: '4', label: '4 images' },
];

/* ── Main Component ── */

export function ProductImagesStep3Settings({
  details,
  onDetailsChange,
  productCount = 0,
  sceneCount = 0,
  selectedScenes = [],
  allProducts = [],
  selectedProductIds = new Set(),
}: Step3SettingsProps) {
  const [overridesOpen, setOverridesOpen] = useState(false);
  const [propModalOpen, setPropModalOpen] = useState(false);
  const [propModalSceneId, setPropModalSceneId] = useState<string | null>(null); // null = all scenes
  const update = (partial: Partial<DetailSettings>) => onDetailsChange({ ...details, ...partial });

  const globalRatios = details.selectedAspectRatios || [details.aspectRatio || '1:1'];
  const globalRatio = globalRatios[0] || '1:1';
  const overrides = details.sceneAspectOverrides || {};
  const hasOverrides = Object.keys(overrides).length > 0;
  const sceneProps = details.sceneProps || {};
  const hasAnyProps = Object.values(sceneProps).some(arr => arr.length > 0);
  const propSceneCount = Object.values(sceneProps).filter(arr => arr.length > 0).length;

  const ratioOptions = ASPECT_RATIOS.map(r => ({
    ...r,
    icon: <RatioShape ratio={r.value} />,
  }));

  const imgCount = parseInt(details.imageCount || '1', 10);
  const costPerImage = 6;
  const totalImages = productCount * sceneCount * imgCount;
  const totalCredits = totalImages * costPerImage;

  const handleSceneRatioChange = (sceneId: string, ratios: string[]) => {
    const next = { ...overrides };
    // If ratios match global, remove override
    const sameAsGlobal = ratios.length === globalRatios.length && ratios.every(r => globalRatios.includes(r));
    if (sameAsGlobal) { delete next[sceneId]; } else { next[sceneId] = ratios; }
    update({ sceneAspectOverrides: next });
  };

  const resetAllOverrides = () => update({ sceneAspectOverrides: {} });
  const overrideCount = Object.keys(overrides).length;

  /* ── Prop handlers ── */
  const openPropModal = (sceneId: string | null) => {
    setPropModalSceneId(sceneId);
    setPropModalOpen(true);
  };

  const handlePropConfirm = (ids: string[]) => {
    const next = { ...sceneProps };
    if (propModalSceneId === null) {
      // Apply to all scenes
      for (const scene of selectedScenes) {
        next[scene.id] = ids;
      }
    } else {
      next[propModalSceneId] = ids;
    }
    update({ sceneProps: next });
  };

  const removeProp = (sceneId: string, propId: string) => {
    const next = { ...sceneProps };
    next[sceneId] = (next[sceneId] || []).filter(id => id !== propId);
    if (next[sceneId].length === 0) delete next[sceneId];
    update({ sceneProps: next });
  };

  const clearAllProps = () => update({ sceneProps: {} });

  const getProductById = (id: string) => allProducts.find(p => p.id === id);

  // Get already-selected prop IDs for the modal context
  const modalAlreadySelected = propModalSceneId === null
    ? [] // for "all scenes" we start fresh
    : sceneProps[propModalSceneId] || [];

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Generation settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Choose format, image count, and add styling props per scene.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <RatioShape ratio={globalRatio} />
              <span className="text-sm font-semibold">Format</span>
              <span className="text-xs text-muted-foreground">(applies to all)</span>
            </div>
            <ChipSelector label="" value={globalRatio} onChange={v => update({ aspectRatio: v })} options={ratioOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Images per scene</span>
            </div>
            <ChipSelector label="" value={details.imageCount || '1'} onChange={v => update({ imageCount: v })} options={IMAGE_COUNT_OPTIONS} />
          </CardContent>
        </Card>
      </div>

      {selectedScenes.length > 0 && (
        <Collapsible open={overridesOpen} onOpenChange={setOverridesOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer group w-full">
            <ChevronRight className={cn('w-4 h-4 transition-transform', overridesOpen && 'rotate-90')} />
            <span>Customize per scene</span>
            <span className="text-xs text-muted-foreground/70">({selectedScenes.length} scene{selectedScenes.length !== 1 ? 's' : ''})</span>
            {(hasOverrides || hasAnyProps) && (
              <span className="ml-auto text-xs font-medium text-primary">
                {overrideCount > 0 && `${overrideCount} custom ratio`}
                {overrideCount > 0 && propSceneCount > 0 && ' · '}
                {propSceneCount > 0 && `${propSceneCount} with props`}
              </span>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mt-3">
              <CardContent className="p-3 space-y-3">
                {/* Global prop action */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1.5"
                    onClick={() => openPropModal(null)}
                  >
                    <Plus className="w-3 h-3" />
                    Add prop to all scenes
                  </Button>
                  {hasAnyProps && (
                    <button
                      type="button"
                      onClick={clearAllProps}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Clear all props
                    </button>
                  )}
                </div>

                {/* Scene rows */}
                {selectedScenes.map(scene => {
                  const sceneRatios = overrides[scene.id] || globalRatios;
                  const isCustomRatio = !!overrides[scene.id];
                  const props = sceneProps[scene.id] || [];

                  return (
                    <div key={scene.id} className={cn(
                      'flex flex-col gap-2 p-2 rounded-lg transition-colors',
                      (isCustomRatio || props.length > 0) ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'
                    )}>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex items-center gap-2 min-w-0 sm:w-44">
                          <span className={cn(
                            'text-xs font-medium truncate',
                            (isCustomRatio || props.length > 0) ? 'text-foreground' : 'text-muted-foreground'
                          )}>
                            {scene.title}
                          </span>
                          {isCustomRatio && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex-shrink-0">
                              custom
                            </span>
                          )}
                        </div>
                        <MiniRatioChips
                          activeRatios={sceneRatios}
                          globalRatios={globalRatios}
                          onChange={(r) => handleSceneRatioChange(scene.id, r)}
                        />
                        <button
                          type="button"
                          onClick={() => openPropModal(scene.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium text-muted-foreground border border-border/60 hover:border-primary/40 hover:text-foreground transition-all cursor-pointer ml-auto"
                        >
                          <Plus className="w-3 h-3" />
                          Add Prop
                        </button>
                      </div>

                      {/* Prop chips */}
                      {props.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pl-1">
                          {props.map(propId => {
                            const product = getProductById(propId);
                            if (!product) return null;
                            return (
                              <span
                                key={propId}
                                className="flex items-center gap-1 pl-1 pr-1.5 py-0.5 rounded-full bg-muted border border-border text-[10px] font-medium text-foreground"
                              >
                                <img
                                  src={product.image_url}
                                  alt={product.title}
                                  className="w-4 h-4 rounded-full object-cover flex-shrink-0"
                                />
                                <span className="truncate max-w-[80px]">{product.title}</span>
                                <button
                                  type="button"
                                  onClick={() => removeProp(scene.id, propId)}
                                  className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {hasOverrides && (
                  <button
                    type="button"
                    onClick={resetAllOverrides}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1 ml-auto cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset all ratios to default
                  </button>
                )}
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}

      {productCount > 0 && sceneCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2.5 border border-border/60">
          <Coins className="w-4 h-4 text-primary flex-shrink-0" />
          <span>
            <span className="font-medium text-foreground">{productCount}</span> product{productCount !== 1 ? 's' : ''}{' '}
            · <span className="font-medium text-foreground">{sceneCount}</span> scene{sceneCount !== 1 ? 's' : ''}{' '}
            · <span className="font-medium text-foreground">{imgCount}</span> image{imgCount !== 1 ? 's' : ''}{' '}
            = <span className="font-bold text-foreground">{totalImages} images</span>{' '}
            — <span className="font-bold text-primary">{totalCredits} credits</span>
          </span>
        </div>
      )}

      {/* Prop picker modal */}
      <PropPickerModal
        open={propModalOpen}
        onOpenChange={setPropModalOpen}
        products={allProducts}
        excludeIds={selectedProductIds}
        alreadySelected={modalAlreadySelected}
        onConfirm={handlePropConfirm}
      />
    </div>
  );
}
