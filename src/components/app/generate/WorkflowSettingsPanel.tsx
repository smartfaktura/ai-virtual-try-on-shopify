import { useEffect } from 'react';
import { MissingRequestBanner } from '@/components/app/MissingRequestBanner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Check, Sparkles, Ban, Info, Smartphone, Layers, AlertCircle, Lock, Package, Clock, Palette, Loader2 } from 'lucide-react';
import { AspectRatioSelector, AspectRatioMultiSelector } from '@/components/app/AspectRatioPreview';
import { FramingSelector, FramingMultiSelector } from '@/components/app/FramingSelector';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { toast } from '@/lib/brandedToast';
import type { Product, ScratchUpload, GenerationSourceType, AspectRatio, ImageQuality, FramingOption, ModelProfile } from '@/types';
import type { Workflow, WorkflowVariationStrategy, WorkflowUIConfig, WorkflowGenerationConfig } from '@/types/workflow';
import type { BrandProfile } from '@/pages/BrandProfiles';
import type { Tables } from '@/integrations/supabase/types';
type UserProduct = Tables<'user_products'>;

const MAX_IMAGES_PER_JOB = 4;
const FREE_SCENE_LIMIT = 1;
const PAID_SCENE_LIMIT = 99;
const FLAT_LAY_SURFACE_LIMIT = 6;

const FLAT_LAY_AESTHETICS = [
  { id: 'minimal', label: 'Minimal', hint: 'clean, few props, whitespace' },
  { id: 'botanical', label: 'Botanical', hint: 'dried flowers, eucalyptus leaves, greenery accents' },
  { id: 'coffee-books', label: 'Coffee & Books', hint: 'coffee cup, open book pages' },
  { id: 'textured', label: 'Textured', hint: 'linen fabric, kraft paper, washi tape' },
  { id: 'soft-glam', label: 'Soft Glam', hint: 'silk ribbon, dried petals, soft fabric swatches' },
  { id: 'cozy', label: 'Cozy', hint: 'knit blanket, candle, warm tones' },
  { id: 'seasonal', label: 'Seasonal', hint: 'seasonal elements matching current time of year' },
];

type UgcMood = 'excited' | 'chill' | 'confident' | 'surprised' | 'focused';
const UGC_MOODS: Array<{ id: UgcMood; label: string; emoji: string; desc: string; example: string; recommended?: boolean }> = [
  { id: 'excited', emoji: '🤩', label: 'Excited', desc: '"OMG I love this!" energy', example: 'Wide smile, bright eyes', recommended: true },
  { id: 'chill', emoji: '😌', label: 'Chill', desc: 'Everyday casual vibe', example: 'Soft smile, relaxed gaze' },
  { id: 'confident', emoji: '😎', label: 'Confident', desc: '"I know what works" energy', example: 'Subtle smile, direct eye contact' },
  { id: 'surprised', emoji: '😲', label: 'Surprised', desc: '"Wait, this actually works?!"', example: 'Raised eyebrows, open mouth' },
  { id: 'focused', emoji: '🧐', label: 'Focused', desc: 'Tutorial / demo mode', example: 'Concentrated, friendly' },
];

interface WorkflowSettingsPanelProps {
  // Product
  selectedProduct: Product | null;
  scratchUpload: ScratchUpload | null;
  sourceType: GenerationSourceType | null;
  isMultiProductMode: boolean;
  productQueue: Product[];
  userProducts: UserProduct[];

  // Workflow
  activeWorkflow: Workflow | null;
  workflowConfig: WorkflowGenerationConfig | null;
  variationStrategy: WorkflowVariationStrategy | null | undefined;
  uiConfig: WorkflowUIConfig | null | undefined;

  // Workflow flags
  isFlatLay: boolean;
  isMirrorSelfie: boolean;
  isSelfieUgc: boolean;
  isInteriorDesign: boolean;

  // Variation state
  selectedVariationIndices: Set<number>;
  setSelectedVariationIndices: (s: Set<number> | ((prev: Set<number>) => Set<number>)) => void;
  sceneFilterCategory: string;
  setSceneFilterCategory: (s: string) => void;

  // Flat lay state
  flatLayPhase: 'surfaces' | 'details';
  setFlatLayPhase: (p: 'surfaces' | 'details') => void;
  selectedFlatLayProductIds: Set<string>;
  selectedAesthetics: string[];
  setSelectedAesthetics: (a: string[] | ((prev: string[]) => string[])) => void;
  stylingNotes: string;
  setStylingNotes: (s: string) => void;
  flatLayPropStyle: 'clean' | 'decorated';
  setFlatLayPropStyle: (s: 'clean' | 'decorated') => void;

  // Mirror selfie state
  mirrorSettingsPhase: 'scenes' | 'final';
  setMirrorSettingsPhase: (p: 'scenes' | 'final') => void;

  // UGC state
  ugcMood: UgcMood;
  setUgcMood: (m: UgcMood) => void;

  // Settings
  quality: ImageQuality;
  setQuality: (q: ImageQuality) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
  selectedAspectRatios: Set<AspectRatio>;
  setSelectedAspectRatios: (s: Set<AspectRatio>) => void;
  framing: FramingOption | null;
  setFraming: (f: FramingOption | null) => void;
  selectedFramings: Set<string>;
  setSelectedFramings: (s: Set<string>) => void;
  productAngle: 'front' | 'front-side' | 'front-back' | 'all';
  setProductAngle: (a: 'front' | 'front-side' | 'front-back' | 'all') => void;

  // Brand
  selectedBrandProfile: BrandProfile | null;
  selectedBrandProfileId: string;
  brandProfiles: BrandProfile[];

  // Credits
  balance: number;
  creditCost: number;
  isFreeUser: boolean;

  // Derived
  workflowImageCount: number;
  workflowModelCount: number;
  multiProductCount: number;
  angleMultiplier: number;
  aspectRatioCount: number;
  framingCount: number;
  interiorType: 'interior' | 'exterior';

  // Admin
  isAdmin: boolean;
  isGeneratingPreviews: boolean;

  // Actions
  openBuyModal: () => void;
  handleGenerateClick: () => void;
  handleGenerateScenePreviews: () => void;
  setCurrentStep: (step: 'source' | 'product' | 'upload' | 'library' | 'brand-profile' | 'mode' | 'model' | 'pose' | 'template' | 'settings' | 'generating' | 'results') => void;
  onFreeLimit?: (reason: string) => void;
}

export default function WorkflowSettingsPanel(props: WorkflowSettingsPanelProps) {
  const {
    selectedProduct, scratchUpload, sourceType, isMultiProductMode, productQueue, userProducts,
    activeWorkflow, workflowConfig, variationStrategy, uiConfig,
    isFlatLay, isMirrorSelfie, isSelfieUgc, isInteriorDesign,
    selectedVariationIndices, setSelectedVariationIndices,
    sceneFilterCategory, setSceneFilterCategory,
    flatLayPhase, setFlatLayPhase,
    selectedFlatLayProductIds,
    selectedAesthetics, setSelectedAesthetics,
    stylingNotes, setStylingNotes,
    flatLayPropStyle, setFlatLayPropStyle,
    mirrorSettingsPhase,
    ugcMood, setUgcMood,
    quality, setQuality, aspectRatio, setAspectRatio,
    selectedAspectRatios, setSelectedAspectRatios,
    framing, setFraming,
    selectedFramings, setSelectedFramings,
    productAngle, setProductAngle,
    selectedBrandProfile, selectedBrandProfileId, brandProfiles,
    balance, creditCost, isFreeUser,
    workflowImageCount, multiProductCount, angleMultiplier, aspectRatioCount, framingCount, interiorType,
    isAdmin, isGeneratingPreviews,
    openBuyModal, handleGenerateClick, handleGenerateScenePreviews, setCurrentStep,
    onFreeLimit,
  } = props;

  // Force high quality for Selfie / UGC workflows
  useEffect(() => {
    if (isSelfieUgc || isFlatLay) setQuality('high');
  }, [isSelfieUgc, isFlatLay, setQuality]);

  return (
    <div className="space-y-4">
      {/* Product summary — hidden in mirror selfie final phase */}
      {!(isMirrorSelfie && mirrorSettingsPhase === 'final') && !(isFlatLay && flatLayPhase === 'details') && (
      <Card><CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {sourceType === 'scratch' ? 'Uploaded Image' : isFlatLay && selectedFlatLayProductIds.size > 1 ? `Selected Products (${selectedFlatLayProductIds.size})` : isMultiProductMode ? `Selected Products (${productQueue.length})` : 'Selected Product'}
          </span>
          <Button variant="link" size="sm" onClick={() => setCurrentStep(sourceType === 'scratch' ? 'upload' : 'source')}>Change</Button>
        </div>
        {isFlatLay && selectedFlatLayProductIds.size > 1 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {userProducts.filter(up => selectedFlatLayProductIds.has(up.id)).map(up => (
              <div key={up.id} className="flex-shrink-0 w-[72px]">
                <div className="w-14 h-14 rounded-lg overflow-hidden border border-border mx-auto">
                  <img src={getOptimizedUrl(up.image_url || '/placeholder.svg', { quality: 60 })} alt={up.title} className="w-full h-full object-cover" />
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-1 truncate">{up.title}</p>
              </div>
            ))}
          </div>
        ) : isMultiProductMode ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {productQueue.map(p => (
              <div key={p.id} className="flex-shrink-0 w-[72px]">
                <div className="w-14 h-14 rounded-lg overflow-hidden border border-border mx-auto">
                  <img src={getOptimizedUrl(p.images[0]?.url || '/placeholder.svg', { quality: 60 })} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-1 truncate">{p.title}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
              <img src={getOptimizedUrl(sourceType === 'scratch' ? scratchUpload?.previewUrl : selectedProduct?.images[0]?.url || '/placeholder.svg', { quality: 60 })} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-semibold">{sourceType === 'scratch' ? scratchUpload?.productInfo.title : selectedProduct?.title}</p>
              <p className="text-sm text-muted-foreground">{sourceType === 'scratch' ? scratchUpload?.productInfo.productType : `${selectedProduct?.vendor} • ${selectedProduct?.productType}`}</p>
            </div>
          </div>
        )}
        {selectedBrandProfile && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{selectedBrandProfile.name}</span>
                <Badge variant="secondary" className="text-[10px] capitalize">{selectedBrandProfile.tone}</Badge>
              </div>
              <Button variant="link" size="sm" onClick={() => setCurrentStep('brand-profile')}>Change</Button>
            </div>
          </div>
        )}
      </CardContent></Card>
      )}

      {/* Variation Strategy Preview — hidden in mirror selfie final phase */}
      {!(isMirrorSelfie && mirrorSettingsPhase === 'final') && !(isFlatLay && flatLayPhase === 'details') && (
      <Card><CardContent className="p-5 space-y-4">
        {/* Scene count pill on its own line */}
        {variationStrategy?.type === 'scene' && !isFlatLay && !isInteriorDesign && (
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-[10px]">
              {activeWorkflow?.name === 'Mirror Selfie Set'
                ? `${variationStrategy.variations.length} Environments`
                : `${variationStrategy.variations.length} Scenes`}
            </Badge>
            {activeWorkflow?.name === 'Mirror Selfie Set' && (
              <Badge variant="secondary" className="text-[10px]"><Smartphone className="w-3 h-3 mr-1" />Mirror Selfie</Badge>
            )}
          </div>
        )}

        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold">
                {isFlatLay ? 'Select Your Surfaces' : isInteriorDesign ? 'Select Design Style' : variationStrategy?.type === 'scene' ? 'Select Your Scenes' : 'What You\'ll Get'}
              </h3>
              {isFlatLay && (
                <>
                  <Badge variant="secondary" className="text-[10px]"><Layers className="w-3 h-3 mr-1" />Flat Lay</Badge>
                  <Badge variant="outline" className="text-[10px]">{variationStrategy?.variations.length} Surfaces</Badge>
                </>
              )}
              {isInteriorDesign && (
                <>
                  <Badge variant="secondary" className="text-[10px]">{interiorType === 'interior' ? 'Interior' : 'Exterior'}</Badge>
                  <Badge variant="outline" className="text-[10px]">{variationStrategy?.variations.length} Styles</Badge>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isFlatLay ? 'Choose surfaces for your flat lay — select at least 1' :
               isInteriorDesign ? 'Choose 1 design style to generate for your room' :
               variationStrategy?.type === 'scene' ? 'Pick at least 1 scene' :
               variationStrategy?.type === 'seasonal' ? 'Each image captures a different season' :
               variationStrategy?.type === 'multi-ratio' ? 'Images optimized for different platforms' :
               variationStrategy?.type === 'layout' ? 'Different layout compositions' :
               variationStrategy?.type === 'paired' ? 'Before and after comparison' :
               variationStrategy?.type === 'angle' ? 'Multiple angles and perspectives' :
               variationStrategy?.type === 'mood' ? 'Different mood and energy styles' :
               variationStrategy?.type === 'surface' ? 'Different surface and styling options' :
               'Workflow-specific variations'}
            </p>
            {variationStrategy?.type === 'scene' && (
              <p className="text-xs text-muted-foreground/70 mt-1 hidden sm:block">
                Products shown are reference examples only. Our VOVV Studio AI team will generate each scene with your selected product.
              </p>
            )}
          </div>
          {!isInteriorDesign && selectedVariationIndices.size > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-muted-foreground"
            onClick={() => setSelectedVariationIndices(new Set())}
          >
            Deselect All
          </Button>
          )}
        </div>

        {/* Scene category filter tabs */}
        {variationStrategy?.type === 'scene' && (() => {
          if (activeWorkflow?.slug === 'product-listing-set') return null;
          const scopeFilteredVars = isInteriorDesign
            ? variationStrategy.variations.filter((v: any) => !v.scope || v.scope === interiorType)
            : variationStrategy.variations;
          const cats = Array.from(new Set(scopeFilteredVars.map(v => v.category).filter(Boolean))) as string[];
          if (cats.length <= 1) return null;

          const filterButtons = (onSelect?: () => void) => (
            <>
              <button
                onClick={() => { setSceneFilterCategory('all'); onSelect?.(); }}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap',
                  sceneFilterCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >All</button>
              {cats.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setSceneFilterCategory(cat); onSelect?.(); }}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap',
                    sceneFilterCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >{cat}</button>
              ))}
            </>
          );

          return (
            <div className="hidden sm:flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar flex-wrap">
              {filterButtons()}
            </div>
          );
        })()}

        {/* Mirror Selfie Tips */}
        {activeWorkflow?.name === 'Mirror Selfie Set' && (
          <Alert className="border-primary/20 bg-primary/5">
            <Smartphone className="w-4 h-4 text-primary" />
            <AlertDescription className="space-y-1.5">
              <p className="font-semibold text-sm">Mirror Selfie Composition</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Your model will appear holding a smartphone, capturing their reflection in a mirror</li>
                <li>Each environment places your product in a different real-world mirror setting</li>
                <li>Choose any aspect ratio in the next step — 4:5 portrait recommended for Instagram</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Visual scene cards grid */}
        <div className={cn("grid gap-3", (isMirrorSelfie || isSelfieUgc) ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4")}>
          {variationStrategy?.variations
            .map((v, i) => ({ v, i }))
            .filter(({ v }) => {
              if (isInteriorDesign && (v as any).scope) {
                if ((v as any).scope !== interiorType) return false;
              }
              if (sceneFilterCategory !== 'all' && v.category && v.category !== sceneFilterCategory) return false;
              return true;
            })
            .map(({ v, i }) => {
            const isSelected = selectedVariationIndices.has(i);
            const hasPreview = !!v.preview_url;

            return (
              <div key={i}>
                <div
                  onClick={() => {
                    setSelectedVariationIndices(prev => {
                      const next = new Set(prev);
                      if (next.has(i)) { next.delete(i); }
                      else {
                        if (isFreeUser && next.size >= FREE_SCENE_LIMIT) {
                          if (onFreeLimit) onFreeLimit('scene_limit');
                          else toast.error(`Free plan allows 1 scene per generation. Upgrade to unlock more.`);
                          return prev;
                        }
                        if (!isFreeUser && isFlatLay && next.size >= FLAT_LAY_SURFACE_LIMIT) {
                          toast.error(`Maximum ${FLAT_LAY_SURFACE_LIMIT} surfaces per generation.`);
                          return prev;
                        }
                        next.add(i);
                      }
                      return next;
                    });
                  }}
                  className={cn(
                    "relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 group border-2",
                    isSelected
                      ? "border-primary ring-2 ring-primary/20 scale-[1.02]"
                      : "border-border hover:border-primary/40 hover:scale-[1.02]"
                  )}
                >
                  <div className={cn("relative", (isMirrorSelfie || isSelfieUgc) ? "aspect-[9/16]" : "aspect-square")}>
                    {hasPreview ? (
                      <img
                        src={getOptimizedUrl(v.preview_url, { quality: 60 })}
                        alt={v.label}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : v.label === 'AI Creative Pick' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-700 to-slate-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_100%] animate-shimmer" />
                        <Sparkles className="w-8 h-8 text-white drop-shadow-lg relative z-10" />
                        <span className="text-[10px] font-bold text-white/90 mt-1.5 relative z-10 tracking-wide">AI PICKS</span>
                      </div>
                    ) : (
                      <div className={cn(
                        "w-full h-full flex items-center justify-center",
                        i % 8 === 0 ? "bg-gradient-to-br from-gray-100 to-white" :
                        i % 8 === 1 ? "bg-gradient-to-br from-gray-200 to-gray-100" :
                        i % 8 === 2 ? "bg-gradient-to-br from-amber-100 to-orange-50" :
                        i % 8 === 3 ? "bg-gradient-to-br from-pink-50 to-purple-50" :
                        i % 8 === 4 ? "bg-gradient-to-br from-green-100 to-emerald-50" :
                        i % 8 === 5 ? "bg-gradient-to-br from-blue-100 to-sky-50" :
                        i % 8 === 6 ? "bg-gradient-to-br from-yellow-100 to-amber-50" :
                        "bg-gradient-to-br from-gray-700 to-gray-900"
                      )}>
                        <Package className={cn("w-8 h-8", i % 8 === 7 ? "text-gray-400" : "text-muted-foreground/40")} />
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2 pt-6">
                      <p className="text-[11px] font-semibold text-white leading-tight">{v.label}</p>
                      {v.category && (
                        <span className="text-[9px] text-white/60 font-medium">{v.category}</span>
                      )}
                    </div>

                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <MissingRequestBanner
          category="scene"
          title="Missing a scene? Tell us and we'll add it."
        />

        {/* Info note */}
        <div className="flex items-start gap-2 px-1">
          <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            {isInteriorDesign
              ? 'Each style will generate a uniquely staged version of your room while preserving its architecture.'
              : 'Products shown are for demonstration only — your product will be placed in each selected scene.'}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            {isInteriorDesign ? (
              selectedVariationIndices.size === 0 ? (
                <p className="text-xs text-muted-foreground">Tap a style to select it</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {selectedVariationIndices.size} style{selectedVariationIndices.size !== 1 ? 's' : ''} selected
                </p>
              )
            ) : (
              <p className="text-xs text-muted-foreground">
                {selectedVariationIndices.size === 0 ? (
                  <span className="text-destructive font-medium">Select at least 1 scene to continue</span>
                ) : (
                  <>{selectedVariationIndices.size} scene{selectedVariationIndices.size !== 1 ? 's' : ''} selected</>
                )}
              </p>
            )}
            {isFreeUser && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
                <Lock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Free plan: 1 {isInteriorDesign ? 'style' : 'scene'} per generation.{' '}
                  <button onClick={openBuyModal} className="text-primary font-semibold hover:underline">Upgrade</button>
                  {' '}to unlock up to 3.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent></Card>
      )}

      {/* Mirror Selfie scenes phase: Continue to Model */}
      {isMirrorSelfie && mirrorSettingsPhase === 'scenes' && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(sourceType === 'scratch' ? 'upload' : 'product')}>Back</Button>
          <Button disabled={selectedVariationIndices.size === 0} onClick={() => setCurrentStep('model')}>
            Continue to Model
          </Button>
        </div>
      )}

      {/* Flat Lay surfaces phase: Continue to Details */}
      {isFlatLay && flatLayPhase === 'surfaces' && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(brandProfiles.length > 0 ? 'brand-profile' : 'product')}>Back</Button>
          <Button disabled={selectedVariationIndices.size === 0} onClick={() => setFlatLayPhase('details')}>
            Continue to Details
          </Button>
        </div>
      )}

      {/* Flat Lay details phase */}
      {isFlatLay && flatLayPhase === 'details' && (
        <>
          {/* Composition Style Toggle */}
          <Card><CardContent className="p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Composition Style
              </h3>
              <p className="text-sm text-muted-foreground">Choose what appears alongside your products</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([
                { key: 'clean' as const, label: 'Products Only', desc: 'Clean layout with just your products, no extra items' },
                { key: 'decorated' as const, label: 'Add Styling Props', desc: 'Include decorative elements (leaves, fabric, abstract shapes) around your products' },
              ]).map(opt => (
                <button
                  key={opt.key}
                  onClick={() => {
                    setFlatLayPropStyle(opt.key);
                    if (opt.key === 'clean') { setSelectedAesthetics([]); setStylingNotes(''); }
                  }}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all',
                    flatLayPropStyle === opt.key
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'border-border hover:border-primary/40'
                  )}
                >
                  <p className="text-sm font-semibold">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                </button>
              ))}
            </div>
          </CardContent></Card>

          {/* Aesthetic quick-chips — only when decorated */}
          {flatLayPropStyle === 'decorated' && (
          <Card><CardContent className="p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold">Styling & Aesthetics</h3>
              <p className="text-sm text-muted-foreground">Add decorative props and mood to your flat lay</p>
            </div>
            <div className="space-y-2">
              <Label>Quick Aesthetics</Label>
              <div className="flex flex-wrap gap-2">
                {FLAT_LAY_AESTHETICS.map(a => {
                  const isActive = selectedAesthetics.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAesthetics(prev =>
                        isActive ? prev.filter(x => x !== a.id) : [...prev, a.id]
                      )}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                        isActive
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-muted text-muted-foreground hover:border-primary/40'
                      )}
                      title={a.hint}
                    >
                      {a.label}
                    </button>
                  );
                })}
              </div>
              {selectedAesthetics.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Props: {selectedAesthetics.map(id => FLAT_LAY_AESTHETICS.find(a => a.id === id)?.hint).filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Styling Notes (optional)</Label>
              <Textarea
                placeholder="e.g. eucalyptus leaves, silk ribbon, warm tones..."
                value={stylingNotes}
                onChange={e => setStylingNotes(e.target.value)}
                className="min-h-[60px]"
              />
              <p className="text-xs text-muted-foreground">Describe any specific decorative props, colors, or mood (no commercial products)</p>
            </div>
          </CardContent></Card>
          )}

          <Card><CardContent className="p-5 space-y-4">
            <h3 className="text-base font-semibold">Generation Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quality</Label>
                {isFlatLay ? (
                  <p className="text-sm text-muted-foreground mt-1">High — Best quality</p>
                ) : (
                  <Select value={quality} onValueChange={v => setQuality(v as ImageQuality)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard — Fast generation</SelectItem>
                      <SelectItem value="high">High — Best quality</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label>Aspect Ratio</Label>
                <AspectRatioMultiSelector value={selectedAspectRatios} onChange={setSelectedAspectRatios} />
              </div>
            </div>
          </CardContent></Card>

          {/* Cost summary */}
          <div className={cn("p-4 rounded-lg border flex items-center justify-between", balance >= creditCost ? "border-border bg-muted/30" : "border-destructive/30 bg-destructive/5")}>
            <div>
              <p className="text-sm font-semibold">Total: {creditCost} credits</p>
              <p className="text-xs text-muted-foreground">
                {selectedVariationIndices.size} surface{selectedVariationIndices.size !== 1 ? 's' : ''}
                {' '}× 6 credits
                {selectedFlatLayProductIds.size > 1 && ` + ${(selectedFlatLayProductIds.size - 1) * 2 * selectedVariationIndices.size} extra (${selectedFlatLayProductIds.size} products)`}
              </p>
            </div>
            {balance >= creditCost ? (
              <p className="text-sm text-muted-foreground">{balance} credits available</p>
            ) : (
              <button onClick={openBuyModal} className="flex items-center gap-1 text-sm text-destructive font-semibold hover:underline">
                <AlertCircle className="w-3.5 h-3.5" />
                {balance} credits — need {creditCost}. Top up
              </button>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setFlatLayPhase('surfaces')}>Back to Surfaces</Button>
            <Button
              onClick={balance >= creditCost ? handleGenerateClick : openBuyModal}
              disabled={selectedVariationIndices.size === 0}
              className={balance < creditCost && selectedVariationIndices.size > 0 ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
            >
              {balance >= creditCost ? `Generate ${selectedVariationIndices.size} Flat Lay Images` : 'Buy Credits'}
            </Button>
          </div>
        </>
      )}

      {/* UGC Mood / Expression Selector */}
      {isSelfieUgc && (
        <Card><CardContent className="p-5 space-y-4">
          <div>
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Creator Mood
            </h3>
            <p className="text-sm text-muted-foreground">Set the expression and energy for your UGC content</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {UGC_MOODS.map(mood => (
              <button
                key={mood.id}
                onClick={() => setUgcMood(mood.id)}
                className={cn(
                  'relative p-4 rounded-xl border-2 text-left transition-all flex flex-col gap-1',
                  ugcMood === mood.id
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:border-primary/40'
                )}
              >
                {mood.recommended && (
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground rounded-full">
                    Popular
                  </span>
                )}
                <span className="text-2xl">{mood.emoji}</span>
                <p className="text-sm font-semibold">{mood.label}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{mood.desc}</p>
                <p className="text-[10px] text-muted-foreground/70 italic">{mood.example}</p>
              </button>
            ))}
          </div>
        </CardContent></Card>
      )}

      {/* Framing Selector — only for Selfie/UGC */}
      {isSelfieUgc && (
        <Card><CardContent className="p-5">
          <FramingMultiSelector selectedFramings={selectedFramings} onSelectedFramingsChange={setSelectedFramings} />
        </CardContent></Card>
      )}

      {/* Product Angles — hidden for Mirror Selfie, Flat Lay, Selfie/UGC, Interior Design */}
      {variationStrategy?.type === 'scene' && !isMirrorSelfie && !isFlatLay && !isSelfieUgc && !isInteriorDesign && (
        <Card><CardContent className="p-5 space-y-4">
          <div>
            <h3 className="text-base font-semibold">Product Angles</h3>
            <p className="text-sm text-muted-foreground">Choose which angles to generate for each scene</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              { key: 'front' as const, label: 'Front Only', desc: '1 image per scene', multiplier: '×1' },
              { key: 'front-side' as const, label: 'Front + Side', desc: '2 images per scene', multiplier: '×2' },
              { key: 'front-back' as const, label: 'Front + Back', desc: '2 images per scene', multiplier: '×2' },
              { key: 'all' as const, label: 'All Angles', desc: '3 images per scene', multiplier: '×3' },
            ]).map(opt => (
              <button
                key={opt.key}
                onClick={() => setProductAngle(opt.key)}
                className={cn(
                  'p-3 rounded-xl border-2 text-left transition-all',
                  productAngle === opt.key
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:border-primary/40'
                )}
              >
                <p className="text-sm font-semibold">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.desc}</p>
                <Badge variant="secondary" className="mt-1.5 text-[10px]">{opt.multiplier}</Badge>
              </button>
            ))}
          </div>
        </CardContent></Card>
      )}

      {/* Quality & Settings — hidden during mirror selfie scenes phase and flat lay */}
      {!(isMirrorSelfie && mirrorSettingsPhase === 'scenes') && !isFlatLay && (
        <>
          <Card><CardContent className="p-5 space-y-4">
            <h3 className="text-base font-semibold">Generation Settings</h3>
            <div className={cn("grid gap-4", isSelfieUgc ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
              {!isSelfieUgc && (
                <div className="space-y-2">
                  <Label>Quality</Label>
                  <Select value={quality} onValueChange={v => setQuality(v as ImageQuality)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard — Fast generation</SelectItem>
                      <SelectItem value="high">High — Best quality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Aspect Ratio</Label>
                {isInteriorDesign ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Original</Badge>
                    <span className="text-xs text-muted-foreground">Matches uploaded photo</span>
                  </div>
                ) : uiConfig?.lock_aspect_ratio ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{workflowConfig?.fixed_settings?.aspect_ratios?.[0] || aspectRatio}</Badge>
                    <span className="text-xs text-muted-foreground">Locked by Visual Type</span>
                  </div>
                ) : variationStrategy?.type === 'multi-ratio' ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Multiple</Badge>
                    <span className="text-xs text-muted-foreground">Each variation uses its own ratio</span>
                  </div>
                ) : (
                  <AspectRatioMultiSelector value={selectedAspectRatios} onChange={setSelectedAspectRatios} />
                )}
              </div>
            </div>
          </CardContent></Card>

          {/* Cost summary */}
          <div className={cn("p-4 rounded-lg border", balance >= creditCost ? "border-border bg-muted/30" : "border-destructive/30 bg-destructive/5")}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">
                  {workflowImageCount * multiProductCount} image{workflowImageCount * multiProductCount !== 1 ? 's' : ''} · {creditCost} credits
                </p>
                <p className="text-xs text-muted-foreground">
                  {isMultiProductMode ? `${productQueue.length} products × ` : ''}
                  {props.workflowModelCount > 1 ? `${props.workflowModelCount} models × ` : ''}
                  {selectedVariationIndices.size} {isInteriorDesign ? 'style' : 'scene'}{selectedVariationIndices.size !== 1 ? 's' : ''}
                  {angleMultiplier > 1 ? ` × ${angleMultiplier} angles` : ''}
                  {aspectRatioCount > 1 ? ` × ${aspectRatioCount} sizes` : ''}
                  {framingCount > 1 ? ` × ${framingCount} framings` : ''}
                  {' '}× 6 credits
                </p>
              </div>
              {balance >= creditCost ? (
                <p className="text-sm text-muted-foreground whitespace-nowrap">{balance} credits available</p>
              ) : (
                <button onClick={openBuyModal} className="flex items-center gap-1 text-sm text-destructive font-semibold hover:underline whitespace-nowrap">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {balance} / {creditCost} credits. Top up
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              if (isMirrorSelfie) {
                setCurrentStep('model');
              } else if (isInteriorDesign) {
                setCurrentStep('upload');
              } else {
                setCurrentStep(brandProfiles.length > 0 ? 'brand-profile' : (sourceType === 'scratch' ? 'upload' : 'product'));
              }
            }}>Back</Button>
            <Button
              onClick={balance >= creditCost ? handleGenerateClick : openBuyModal}
              disabled={selectedVariationIndices.size === 0 || (!isInteriorDesign && selectedAspectRatios.size === 0)}
              className={balance < creditCost && selectedVariationIndices.size > 0 ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
            >
              {balance >= creditCost ? 'Generate' : 'Buy Credits'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
