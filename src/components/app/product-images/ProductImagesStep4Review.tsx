import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Coins, Package, Layers, AlertTriangle, Pencil, Paintbrush, User, Shirt, Settings2, ImageIcon, Sparkles, ChevronRight, Plus, RotateCcw, X, ArrowUpRight } from 'lucide-react';
import { useCredits } from '@/contexts/CreditContext';
import { useProductImageScenes } from '@/hooks/useProductImageScenes';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { RatioShape, MiniRatioChips, PropPickerModal } from './ProductImagesStep3Refine';
import { ASPECT_RATIOS, IMAGE_COUNT_OPTIONS } from './constants';
import { computeTotalImages, computeTotalImagesPerCategory } from '@/lib/sceneVariations';
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
  perCategoryScenes?: Map<string, Set<string>>;
  categoryGroups?: Map<string, string[]>;
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

export function ProductImagesStep4Review({ selectedProducts, selectedSceneIds, details, balance, onEditStep, onDetailsChange, allProducts = [], selectedProductIds = new Set(), perCategoryScenes, categoryGroups }: Step4Props) {
  const { openBuyModal } = useCredits();
  const { allScenes: dbScenes } = useProductImageScenes();
  const selectedScenes = dbScenes.filter(s => selectedSceneIds.has(s.id));
  const update = useCallback((partial: Partial<DetailSettings>) => {
    onDetailsChange?.({ ...details, ...partial });
  }, [details, onDetailsChange]);

  const imageCount = parseInt(details.imageCount || '1', 10);
  const modelCount = (details.selectedModelIds?.length || (details.selectedModelId ? 1 : 0)) || 1;
  const categoryProductCounts = useMemo(() => {
    const counts = new Map<string, number>();
    if (categoryGroups) {
      for (const [catId, productIds] of categoryGroups) {
        counts.set(catId, productIds.length);
      }
    }
    return counts;
  }, [categoryGroups]);
  const totalImages = (perCategoryScenes && perCategoryScenes.size > 0)
    ? computeTotalImagesPerCategory(perCategoryScenes, categoryProductCounts, dbScenes, imageCount, details, modelCount)
    : computeTotalImages(selectedProducts.length, selectedScenes, imageCount, details, modelCount);
  const costPerImage = 6;
  const totalCredits = totalImages * costPerImage;
  const canAfford = balance >= totalCredits;
  const isLargeBatch = totalImages > 20;

  const selectedRatios = details.selectedAspectRatios || [];
  const globalRatio = selectedRatios[0] || '1:1';
  const overrides = details.sceneAspectOverrides || {};
  const sceneProps = details.sceneProps || {};
  const hasOverrides = Object.keys(overrides).length > 0;
  const hasAnyProps = Object.values(sceneProps).some(arr => arr.length > 0);

  const ratioOptions = ASPECT_RATIOS.map(r => ({ ...r, icon: <RatioShape ratio={r.value} /> }));

  const toggleRatio = (ratio: string) => {
    if (selectedRatios.includes(ratio)) {
      const next = selectedRatios.filter(r => r !== ratio);
      update({ selectedAspectRatios: next, aspectRatio: next[0] || '1:1' });
    } else {
      const next = [...selectedRatios, ratio];
      update({ selectedAspectRatios: next, aspectRatio: next[0] });
    }
  };

  const [overridesOpen, setOverridesOpen] = useState(false);
  const [propModalOpen, setPropModalOpen] = useState(false);
  const [propModalSceneId, setPropModalSceneId] = useState<string | null>(null);

  const handleSceneRatioChange = (sceneId: string, ratios: string[]) => {
    const next = { ...overrides };
    const sameAsGlobal = ratios.length === selectedRatios.length && ratios.every(r => selectedRatios.includes(r));
    if (sameAsGlobal) delete next[sceneId]; else next[sceneId] = ratios;
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
  if (details.selectedModelIds && details.selectedModelIds.length > 0) {
    personEntries.push({ label: 'Models', value: `${details.selectedModelIds.length} selected` });
  } else if (details.selectedModelId) {
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
        <h2 className="text-xl font-semibold tracking-tight">Review & generate</h2>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Aspect Ratio — multi-select */}
          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold">Format</span>
                  <p className="text-xs text-muted-foreground">Choose one or more aspect ratios</p>
                </div>
                {selectedRatios.length > 1 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">×{selectedRatios.length}</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ratioOptions.map(o => (
                  <button key={o.value} type="button" onClick={() => toggleRatio(o.value)}
                    className={cn(
                      'flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all border cursor-pointer',
                      selectedRatios.includes(o.value)
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-muted/40 text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground',
                    )}>
                    {o.icon}{o.label}
                  </button>
                ))}
              </div>
              {selectedRatios.length === 0 && (
                <p className="text-[11px] text-destructive font-medium">Pick at least 1 format to continue</p>
              )}
            </CardContent>
          </Card>

          {/* Images per scene */}
          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold">Images per scene</span>
                <p className="text-xs text-muted-foreground">Select how many images to generate per scene</p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {IMAGE_COUNT_OPTIONS.map(o => {
                  const active = (details.imageCount || '1') === o.value;
                  return (
                    <button key={o.value} type="button" onClick={() => update({ imageCount: o.value })}
                      className={cn(
                        'flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all border cursor-pointer',
                        active
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-muted/40 text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground',
                      )}>
                        <span className="sm:hidden">{o.value}</span>
                        <span className="hidden sm:inline">{o.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}





      {/* ── SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Products */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold tracking-tight">{selectedProducts.length} Product{selectedProducts.length !== 1 ? 's' : ''}</h3>
              {onEditStep && (
                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground" onClick={() => onEditStep(1)}>
                  <Pencil className="w-3 h-3" />Edit
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedProducts.slice(0, 24).map(p => (
                <span key={p.id} className="flex items-center gap-1.5 pl-0.5 pr-2 py-0.5 rounded-full bg-muted border border-border text-[11px] font-medium text-foreground max-w-full">
                  <img src={getOptimizedUrl(p.image_url, { quality: 60 })} alt={p.title} width={20} height={20} loading="eager" decoding="async" className="w-5 h-5 rounded-full object-cover bg-muted flex-shrink-0" />
                  <span className="truncate max-w-[120px]">{p.title}</span>
                </span>
              ))}
              {selectedProducts.length > 24 && (
                <span className="flex items-center px-2 py-0.5 rounded-full bg-muted text-[11px] font-medium text-muted-foreground">+{selectedProducts.length - 24}</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scenes */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold tracking-tight">{selectedScenes.length} Scene{selectedScenes.length !== 1 ? 's' : ''}</h3>
              {onEditStep && (
                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground" onClick={() => onEditStep(2)}>
                  <Pencil className="w-3 h-3" />Edit
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {perCategoryScenes && perCategoryScenes.size > 0 && categoryGroups ? (
                Array.from(categoryGroups.entries()).map(([catId, productIds]) => {
                  const catSceneIds = perCategoryScenes.get(catId);
                  if (!catSceneIds || catSceneIds.size === 0) return null;
                  const catScenes = dbScenes.filter(s => catSceneIds.has(s.id));
                  const catLabel = catId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  return (
                    <div key={catId} className="w-full space-y-1">
                      <span className="text-[10px] font-medium text-muted-foreground">{catLabel} ({productIds.length} product{productIds.length !== 1 ? 's' : ''})</span>
                      <div className="flex flex-wrap gap-1.5">
                        {catScenes.slice(0, 8).map(s => (
                          <span key={s.id} className="flex items-center gap-1.5 pl-0.5 pr-2 py-0.5 rounded-full bg-muted border border-border text-[11px] font-medium text-foreground">
                            {s.previewUrl ? (
                              <img src={getOptimizedUrl(s.previewUrl, { quality: 60 })} alt={s.title} width={20} height={20} loading="eager" decoding="async" className="w-5 h-5 rounded-full object-cover bg-muted flex-shrink-0" />
                            ) : (
                              <span className="w-5 h-5 rounded-full bg-muted-foreground/15 flex-shrink-0" />
                            )}
                            <span className="truncate max-w-[140px]">{s.title}</span>
                          </span>
                        ))}
                        {catScenes.length > 8 && (
                          <span className="flex items-center px-2 py-0.5 rounded-full bg-muted text-[11px] font-medium text-muted-foreground">+{catScenes.length - 8}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
                  {selectedScenes.slice(0, 12).map(s => (
                    <span key={s.id} className="flex items-center gap-1.5 pl-0.5 pr-2 py-0.5 rounded-full bg-muted border border-border text-[11px] font-medium text-foreground">
                      {s.previewUrl ? (
                        <img src={getOptimizedUrl(s.previewUrl, { quality: 60 })} alt={s.title} width={20} height={20} loading="eager" decoding="async" className="w-5 h-5 rounded-full object-contain bg-muted flex-shrink-0" />
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-muted-foreground/15 flex-shrink-0" />
                      )}
                      <span className="truncate max-w-[140px]">{s.title}</span>
                    </span>
                  ))}
                  {selectedScenes.length > 12 && (
                    <span className="flex items-center px-2 py-0.5 rounded-full bg-muted text-[11px] font-medium text-muted-foreground">+{selectedScenes.length - 12}</span>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Credits */}
        <Card className={!canAfford ? 'border-destructive/50' : 'border-primary/30'}>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-base font-semibold tracking-tight">Credits</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Format{selectedRatios.length > 1 ? 's' : ''}</span>
                <span className="font-medium">{selectedRatios.join(', ')}{selectedRatios.length > 1 ? ` (×${selectedRatios.length})` : ''}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Images per scene</span>
                <span className="font-medium">{imageCount}</span>
              </div>
              {modelCount > 1 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Models</span>
                  <span className="font-medium">×{modelCount}</span>
                </div>
              )}
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
              {!canAfford && (
                <Button
                  size="sm"
                  className="w-full mt-3 gap-1.5"
                  onClick={() => openBuyModal('product_images_review')}
                >
                  Get Credits
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>




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

      {/* ── ADVANCED SCENE CONTROLS (last section) ── */}
      {onDetailsChange && selectedScenes.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <Collapsible open={overridesOpen} onOpenChange={setOverridesOpen}>
              <CollapsibleTrigger className="flex items-start justify-between gap-3 w-full text-left cursor-pointer group">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold tracking-tight">Advanced Scene Controls</h3>
                    <Badge variant="outline" className="text-[9px] tracking-wider px-1.5 py-0 h-4 border-primary/40 text-primary bg-primary/5 uppercase">Beta</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Fine-tune format and props for individual scenes</p>
                </div>

                <ChevronRight className={cn('w-5 h-5 text-muted-foreground transition-transform mt-1', overridesOpen && 'rotate-90')} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-4 space-y-3">
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
                    const sceneRatios = overrides[scene.id] || selectedRatios;
                    const isCustomRatio = !!overrides[scene.id];
                    const props = sceneProps[scene.id] || [];
                    return (
                      <div key={scene.id} className={cn('flex flex-col gap-2 p-2 rounded-lg transition-colors', (isCustomRatio || props.length > 0) ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30')}>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="flex items-center gap-2 min-w-0 sm:w-44">
                            <span className={cn('text-xs font-medium truncate', (isCustomRatio || props.length > 0) ? 'text-foreground' : 'text-muted-foreground')}>{scene.title}</span>
                            {isCustomRatio && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex-shrink-0">custom</span>}
                          </div>
                          <MiniRatioChips activeRatios={sceneRatios} globalRatios={selectedRatios} onChange={(r) => handleSceneRatioChange(scene.id, r)} />
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
                                  <img src={getOptimizedUrl(product.image_url, { width: 32, quality: 40 })} alt={product.title} className="w-4 h-4 rounded-full object-cover flex-shrink-0" />
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
                </div>
              </CollapsibleContent>
            </Collapsible>
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
