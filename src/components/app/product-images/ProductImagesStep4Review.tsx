import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Coins, Package, Layers, AlertTriangle, Pencil, Paintbrush, User, Shirt, Settings2, ImageIcon, Sparkles, ChevronRight, Plus, RotateCcw, X } from 'lucide-react';
import { ALL_SCENES } from './sceneData';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { cn } from '@/lib/utils';
import { RatioShape, MiniRatioChips, PropPickerModal, ASPECT_RATIOS, IMAGE_COUNT_OPTIONS } from './ProductImagesStep3Refine';
import { computeTotalImages } from '@/lib/sceneVariations';
import type { UserProduct, DetailSettings, ProductImageScene } from './types';

/* ── Chip Selector (local) ── */
function ChipSelector({ label, value, onChange, options }: {
  label: string; value: string | undefined;
  onChange: (v: string) => void;
  options: { value: string; label: string; icon?: React.ReactNode }[];
}) {
  return (
    <div className="space-y-1.5">
      {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
      <div className="flex flex-wrap gap-1.5">
        {options.map(o => (
          <button key={o.value} type="button" onClick={() => onChange(o.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer',
              value === o.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/40 text-muted-foreground border-border/60 hover:border-primary/40',
            )}>
            {o.icon}{o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface Step4Props {
  selectedProducts: UserProduct[];
  selectedSceneIds: Set<string>;
  details: DetailSettings;
  balance: number;
  onEditStep?: (step: number) => void;
  onDetailsChange?: (d: DetailSettings) => void;
  allProducts?: UserProduct[];
  selectedProductIds?: Set<string>;
}

const AESTHETIC_LABELS: Record<string, string> = {
  'auto': 'Auto', 'warm-neutral': 'Warm neutrals', 'cool-neutral': 'Cool neutrals',
  'monochrome': 'Soft monochrome', 'brand-led': 'Brand-led',
  'pure-white': 'Pure white', 'soft-white': 'Soft white', 'light-grey': 'Light grey',
  'warm-beige': 'Warm beige', 'taupe': 'Taupe', 'stone': 'Stone',
  'minimal-studio': 'Minimal studio', 'stone-plaster': 'Stone / plaster',
  'warm-wood': 'Warm wood', 'fabric': 'Fabric', 'glossy': 'Glossy',
  'soft-diffused': 'Soft diffused', 'warm-editorial': 'Warm editorial',
  'crisp-studio': 'Crisp studio', 'natural-daylight': 'Natural daylight', 'side-lit': 'Side-lit',
  'none': 'None', 'soft': 'Soft', 'natural': 'Natural', 'defined': 'Defined',
  'minimal-luxury': 'Minimal luxury', 'clean-commercial': 'Clean commercial',
  'fashion-editorial': 'Fashion editorial', 'beauty-clean': 'Beauty clean',
  'organic-natural': 'Organic natural', 'modern-sleek': 'Modern sleek',
  'product-accent': 'Product accent', 'brand-accent': 'Brand accent',
  'subtle': 'Subtle', 'strong': 'Strong',
  'auto-balance': 'Auto-balance', 'anchor-first': 'Anchor first', 'manual': 'Manual',
  'strict': 'Strict',
};

function friendlyLabel(val: string | undefined): string {
  if (!val) return '';
  return AESTHETIC_LABELS[val] || val.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function ProductImagesStep4Review({ selectedProducts, selectedSceneIds, details, balance, onEditStep, onDetailsChange, allProducts = [], selectedProductIds = new Set() }: Step4Props) {
  const selectedScenes = ALL_SCENES.filter(s => selectedSceneIds.has(s.id));
  const update = useCallback((partial: Partial<DetailSettings>) => {
    onDetailsChange?.({ ...details, ...partial });
  }, [details, onDetailsChange]);

  const imageCount = parseInt(details.imageCount || '1', 10);
  const totalImages = computeTotalImages(selectedProducts.length, selectedScenes, imageCount, details);
  const costPerImage = 6;
  const totalCredits = totalImages * costPerImage;
  const canAfford = balance >= totalCredits;
  const isLargeBatch = totalImages > 20;

  const globalRatio = details.aspectRatio || '1:1';
  const overrides = details.sceneAspectOverrides || {};
  const sceneProps = details.sceneProps || {};
  const hasOverrides = Object.values(overrides).some(v => v !== globalRatio);
  const hasAnyProps = Object.values(sceneProps).some(arr => arr.length > 0);

  const ratioOptions = ASPECT_RATIOS.map(r => ({ ...r, icon: <RatioShape ratio={r.value} /> }));

  const [overridesOpen, setOverridesOpen] = useState(false);
  const [propModalOpen, setPropModalOpen] = useState(false);
  const [propModalSceneId, setPropModalSceneId] = useState<string | null>(null);

  const handleSceneRatioChange = (sceneId: string, ratio: string) => {
    const next = { ...overrides };
    if (ratio === globalRatio) delete next[sceneId]; else next[sceneId] = ratio;
    update({ sceneAspectOverrides: next });
  };

  const openPropModal = (sceneId: string | null) => { setPropModalSceneId(sceneId); setPropModalOpen(true); };
  const handlePropConfirm = (ids: string[]) => {
    const next = { ...sceneProps };
    if (propModalSceneId === null) { for (const scene of selectedScenes) next[scene.id] = ids; }
    else next[propModalSceneId] = ids;
    update({ sceneProps: next });
  };
  const removeProp = (sceneId: string, propId: string) => {
    const next = { ...sceneProps };
    next[sceneId] = (next[sceneId] || []).filter(id => id !== propId);
    if (next[sceneId].length === 0) delete next[sceneId];
    update({ sceneProps: next });
  };
  const getProductById = (id: string) => allProducts.find(p => p.id === id);
  const modalAlreadySelected = propModalSceneId === null ? [] : sceneProps[propModalSceneId] || [];

  const aestheticEntries: { label: string; value: string }[] = [];
  const isNonDefault = (val: string | undefined, defaultVal?: string) => val && val !== '' && val !== 'auto' && val !== defaultVal;
  if (isNonDefault(details.backgroundTone)) aestheticEntries.push({ label: 'Color world', value: friendlyLabel(details.backgroundTone) });
  if (isNonDefault(details.negativeSpace)) aestheticEntries.push({ label: 'Background', value: friendlyLabel(details.negativeSpace) });
  if (isNonDefault(details.surfaceType)) aestheticEntries.push({ label: 'Surface', value: friendlyLabel(details.surfaceType) });
  if (isNonDefault(details.lightingStyle, 'soft-diffused')) aestheticEntries.push({ label: 'Lighting', value: friendlyLabel(details.lightingStyle) });
  if (isNonDefault(details.shadowStyle, 'natural')) aestheticEntries.push({ label: 'Shadow', value: friendlyLabel(details.shadowStyle) });
  if (isNonDefault(details.mood)) aestheticEntries.push({ label: 'Style', value: friendlyLabel(details.mood) });
  if (isNonDefault(details.brandingVisibility, 'product-accent')) aestheticEntries.push({ label: 'Accent', value: friendlyLabel(details.brandingVisibility) });
  if (details.consistency) aestheticEntries.push({ label: 'Consistency', value: friendlyLabel(details.consistency) });

  const personEntries: { label: string; value: string }[] = [];
  if (details.selectedModelId) {
    personEntries.push({ label: 'Model', value: 'Selected' });
  } else {
    if (details.presentation) personEntries.push({ label: 'Presentation', value: friendlyLabel(details.presentation) });
    if (details.ageRange) personEntries.push({ label: 'Age', value: details.ageRange });
    if (details.skinTone) personEntries.push({ label: 'Skin', value: friendlyLabel(details.skinTone) });
  }

  const outfitEntries: { label: string; value: string }[] = [];
  if (details.outfitConfig) {
    const oc = details.outfitConfig;
    if (oc.top) outfitEntries.push({ label: 'Top', value: [oc.top.fit, oc.top.color, oc.top.material, oc.top.garment].filter(Boolean).join(' ') });
    if (oc.bottom) outfitEntries.push({ label: 'Bottom', value: [oc.bottom.fit, oc.bottom.color, oc.bottom.material, oc.bottom.garment].filter(Boolean).join(' ') });
    if (oc.shoes) outfitEntries.push({ label: 'Shoes', value: [oc.shoes.fit, oc.shoes.color, oc.shoes.material, oc.shoes.garment].filter(Boolean).join(' ') });
    if (oc.accessories) outfitEntries.push({ label: 'Accessories', value: oc.accessories });
  }

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Review & configure output</h2>
        <p className="text-sm text-muted-foreground mt-1">Set format, quality, and confirm your selections before generating.</p>
      </div>

      {isLargeBatch && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Large batch — {totalImages} images</p>
              <p className="text-xs text-muted-foreground mt-0.5">Generation may take several minutes. You can leave this page and find results in your library.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── FORMAT & OUTPUT (editable) ── */}
      {onDetailsChange && (
        <Card className="border-primary/20">
          <CardContent className="p-5 space-y-5">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Format & Output</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Aspect Ratio */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <RatioShape ratio={globalRatio} />
                  <span className="text-xs font-semibold">Format</span>
                  <span className="text-[10px] text-muted-foreground">(all scenes)</span>
                </div>
                <ChipSelector label="" value={globalRatio} onChange={v => update({ aspectRatio: v })} options={ratioOptions} />
              </div>

              {/* Images per scene */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold">Images per scene</span>
                </div>
                <ChipSelector label="" value={details.imageCount || '1'} onChange={v => update({ imageCount: v })} options={IMAGE_COUNT_OPTIONS} />
              </div>

              {/* Quality */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold">Quality</span>
                </div>
                <ChipSelector label="" value={quality} onChange={v => update({ quality: v })} options={[
                  { value: 'standard', label: 'Standard (3 cr)' },
                  { value: 'high', label: 'Pro (6 cr)' },
                ]} />
              </div>
            </div>

            {/* Per-scene overrides */}
            {selectedScenes.length > 0 && (
              <Collapsible open={overridesOpen} onOpenChange={setOverridesOpen}>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer group w-full">
                  <ChevronRight className={cn('w-4 h-4 transition-transform', overridesOpen && 'rotate-90')} />
                  <span>Scene Ratios & Props</span>
                  <span className="text-xs text-muted-foreground/70">Set per-scene aspect ratios or add styling accessories</span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card className="mt-3">
                    <CardContent className="p-3 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => openPropModal(null)}>
                          <Plus className="w-3 h-3" />Add prop to all scenes
                        </Button>
                        {hasAnyProps && (
                          <button type="button" onClick={() => update({ sceneProps: {} })} className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1">
                            <RotateCcw className="w-3 h-3" />Clear all props
                          </button>
                        )}
                      </div>
                      {selectedScenes.map(scene => {
                        const sceneRatio = overrides[scene.id] || globalRatio;
                        const isCustomRatio = overrides[scene.id] && overrides[scene.id] !== globalRatio;
                        const props = sceneProps[scene.id] || [];
                        return (
                          <div key={scene.id} className={cn('flex flex-col gap-2 p-2 rounded-lg transition-colors', (isCustomRatio || props.length > 0) ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30')}>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <div className="flex items-center gap-2 min-w-0 sm:w-44">
                                <span className={cn('text-xs font-medium truncate', (isCustomRatio || props.length > 0) ? 'text-foreground' : 'text-muted-foreground')}>{scene.title}</span>
                                {isCustomRatio && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex-shrink-0">custom</span>}
                              </div>
                              <MiniRatioChips value={sceneRatio} globalValue={globalRatio} onChange={(r) => handleSceneRatioChange(scene.id, r)} />
                              <button type="button" onClick={() => openPropModal(scene.id)} className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium text-muted-foreground border border-border/60 hover:border-primary/40 hover:text-foreground transition-all cursor-pointer ml-auto">
                                <Plus className="w-3 h-3" />Add Prop
                              </button>
                            </div>
                            {props.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pl-1">
                                {props.map(propId => {
                                  const product = getProductById(propId);
                                  if (!product) return null;
                                  return (
                                    <span key={propId} className="flex items-center gap-1 pl-1 pr-1.5 py-0.5 rounded-full bg-muted border border-border text-[10px] font-medium text-foreground">
                                      <img src={product.image_url} alt={product.title} className="w-4 h-4 rounded-full object-cover flex-shrink-0" />
                                      <span className="truncate max-w-[80px]">{product.title}</span>
                                      <button type="button" onClick={() => removeProp(scene.id, propId)} className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"><X className="w-3 h-3" /></button>
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {hasOverrides && (
                        <button type="button" onClick={() => update({ sceneAspectOverrides: {} })} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1 ml-auto cursor-pointer">
                          <RotateCcw className="w-3 h-3" />Reset all ratios
                        </button>
                      )}
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Products */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">{selectedProducts.length} Product{selectedProducts.length !== 1 ? 's' : ''}</span>
              </div>
              {onEditStep && (
                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground" onClick={() => onEditStep(1)}>
                  <Pencil className="w-3 h-3" />Edit
                </Button>
              )}
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {selectedProducts.slice(0, 12).map(p => (
                <div key={p.id} className="space-y-1">
                  <div className="aspect-square rounded-lg overflow-hidden bg-white border border-border/40 p-1">
                    <ShimmerImage src={p.image_url} alt={p.title} className="w-full h-full object-contain" />
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{p.title}</p>
                </div>
              ))}
              {selectedProducts.length > 12 && (
                <div className="aspect-square rounded-lg bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                  +{selectedProducts.length - 12}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scenes */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">{selectedScenes.length} Scene{selectedScenes.length !== 1 ? 's' : ''}</span>
              </div>
              {onEditStep && (
                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground" onClick={() => onEditStep(2)}>
                  <Pencil className="w-3 h-3" />Edit
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedScenes.slice(0, 12).map(s => (
                <Badge key={s.id} variant="outline" className="text-[10px]">{s.title}</Badge>
              ))}
              {selectedScenes.length > 12 && (
                <Badge variant="secondary" className="text-[10px]">+{selectedScenes.length - 12} more</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Credits */}
        <Card className={!canAfford ? 'border-destructive/50' : 'border-primary/30'}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Credits</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Format</span>
                <span className="font-medium">{globalRatio}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Quality</span>
                <span className="font-medium">{quality === 'high' ? 'Pro' : 'Standard'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Images per scene</span>
                <span className="font-medium">{imageCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total images</span>
                <span className="font-medium">{totalImages}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Cost per image</span>
                <span className="font-medium">{costPerImage} credits</span>
              </div>
              <Separator className="my-1.5" />
              <div className="flex justify-between text-sm font-semibold">
                <span>Total cost</span>
                <span className={canAfford ? 'text-primary' : 'text-destructive'}>{totalCredits} credits</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Your balance</span>
                <span>{balance} credits</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aesthetic summary */}
      {aestheticEntries.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Paintbrush className="w-3.5 h-3.5 text-primary" />
                <p className="text-xs font-semibold">Aesthetic settings</p>
              </div>
              {onEditStep && (
                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground" onClick={() => onEditStep(3)}>
                  <Pencil className="w-3 h-3" />Edit
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {aestheticEntries.map(e => (
                <Badge key={e.label} variant="secondary" className="text-[10px]">
                  {e.label}: {e.value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Person styling summary */}
      {personEntries.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-primary" />
                <p className="text-xs font-semibold">Person styling</p>
              </div>
              {onEditStep && (
                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground" onClick={() => onEditStep(3)}>
                  <Pencil className="w-3 h-3" />Edit
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {personEntries.map(e => (
                <Badge key={e.label} variant="secondary" className="text-[10px]">
                  {e.label}: {e.value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Outfit summary */}
      {outfitEntries.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shirt className="w-3.5 h-3.5 text-primary" />
                <p className="text-xs font-semibold">Locked outfit</p>
              </div>
              {onEditStep && (
                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground" onClick={() => onEditStep(3)}>
                  <Pencil className="w-3 h-3" />Edit
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {outfitEntries.map(e => (
                <Badge key={e.label} variant="secondary" className="text-[10px]">
                  {e.label}: {e.value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom note */}
      {details.customNote && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold">Custom note</p>
              {onEditStep && (
                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground" onClick={() => onEditStep(3)}>
                  <Pencil className="w-3 h-3" />Edit
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{details.customNote}</p>
          </CardContent>
        </Card>
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

export default ProductImagesStep4Review;
