import React from 'react';

import {
  Square, RectangleHorizontal, ChevronDown,
  Smartphone, Camera, Lock, Gauge, Sparkles, Palette, Sliders,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ModelSelectorChip } from './ModelSelectorChip';
import { SceneSelectorChip } from './SceneSelectorChip';
import { ProductSelectorChip } from './ProductSelectorChip';
import { BrandProfileChip } from './BrandProfileChip';
import { FramingSelectorChip } from '@/components/app/FramingSelectorChip';
import type { ModelProfile, TryOnPose, FramingOption } from '@/types';
import type { Tables } from '@/integrations/supabase/types';

type UserProduct = Tables<'user_products'>;
type BrandProfile = Tables<'brand_profiles'>;

export type FreestyleAspectRatio = '1:1' | '3:4' | '4:5' | '9:16' | '16:9';

const AspectIcon34 = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 14 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="1" width="12" height="16" rx="2" /></svg>
);
const AspectIcon45 = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 13 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="1" width="11" height="16" rx="2" /></svg>
);
const AspectIcon916 = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 10 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="1" width="8" height="16" rx="2" /></svg>
);

const ASPECT_RATIOS: { value: FreestyleAspectRatio; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: '1:1', label: '1:1', icon: Square },
  { value: '3:4', label: '3:4', icon: AspectIcon34 },
  { value: '4:5', label: '4:5', icon: AspectIcon45 },
  { value: '9:16', label: '9:16', icon: AspectIcon916 },
  { value: '16:9', label: '16:9', icon: RectangleHorizontal },
];

interface FreestyleSettingsChipsProps {
  uploadButton?: React.ReactNode;
  selectedModel: ModelProfile | null;
  onModelSelect: (model: ModelProfile | null) => void;
  modelPopoverOpen: boolean;
  onModelPopoverChange: (open: boolean) => void;
  selectedScene: TryOnPose | null;
  onSceneSelect: (scene: TryOnPose | null) => void;
  scenePopoverOpen: boolean;
  onScenePopoverChange: (open: boolean) => void;
  selectedProduct: UserProduct | null;
  onProductSelect: (product: UserProduct | null) => void;
  productPopoverOpen: boolean;
  onProductPopoverChange: (open: boolean) => void;
  products: UserProduct[];
  isLoadingProducts: boolean;
  aspectRatio: FreestyleAspectRatio;
  onAspectRatioChange: (ar: FreestyleAspectRatio) => void;
  selectedBrandProfile: BrandProfile | null;
  onBrandProfileSelect: (profile: BrandProfile | null) => void;
  brandProfilePopoverOpen: boolean;
  onBrandProfilePopoverChange: (open: boolean) => void;
  brandProfiles: BrandProfile[];
  isLoadingBrandProfiles: boolean;
  cameraStyle: 'pro' | 'natural';
  onCameraStyleChange: (s: 'pro' | 'natural') => void;
  quality: 'standard' | 'high';
  onQualityChange: (q: 'standard' | 'high') => void;
  framing: FramingOption | null;
  onFramingChange: (f: FramingOption | null) => void;
  framingPopoverOpen: boolean;
  onFramingPopoverChange: (open: boolean) => void;
  hasModelSelected?: boolean;
  
  disabledChips?: { product?: boolean; model?: boolean; scene?: boolean; brand?: boolean };
  promptHelperButton?: React.ReactNode;
}

export function FreestyleSettingsChips({
  uploadButton,
  selectedModel, onModelSelect, modelPopoverOpen, onModelPopoverChange,
  selectedScene, onSceneSelect, scenePopoverOpen, onScenePopoverChange,
  selectedProduct, onProductSelect, productPopoverOpen, onProductPopoverChange,
  products, isLoadingProducts,
  aspectRatio, onAspectRatioChange,
  selectedBrandProfile, onBrandProfileSelect, brandProfilePopoverOpen, onBrandProfilePopoverChange,
  brandProfiles, isLoadingBrandProfiles,
  cameraStyle, onCameraStyleChange,
  quality, onQualityChange,
  framing, onFramingChange, framingPopoverOpen, onFramingPopoverChange,
  hasModelSelected = false,
  
  disabledChips,
  promptHelperButton,
}: FreestyleSettingsChipsProps) {
  const isMobile = useIsMobile();
  const [aspectPopoverOpen, setAspectPopoverOpen] = React.useState(false);
  const [cameraPopoverOpen, setCameraPopoverOpen] = React.useState(false);
  const [qualityPopoverOpen, setQualityPopoverOpen] = React.useState(false);
  const [advancedOpenState, setAdvancedOpenState] = React.useState(false);

  // --- Shared chip renderers ---

  const currentAr = ASPECT_RATIOS.find(ar => ar.value === aspectRatio) ?? ASPECT_RATIOS[0];
  const ArIcon = currentAr.icon;
  const aspectRatioChip = (
    <Popover open={aspectPopoverOpen} onOpenChange={setAspectPopoverOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border border-border bg-muted/50 text-foreground/70 hover:bg-muted transition-colors">
          <ArIcon className="w-3.5 h-3.5" />
          {aspectRatio}
          <ChevronDown className="w-3 h-3 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-2" align="start">
        {ASPECT_RATIOS.map(ar => (
          <button
            key={ar.value}
            onClick={() => { onAspectRatioChange(ar.value); setAspectPopoverOpen(false); }}
            className={cn(
              'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2',
              aspectRatio === ar.value ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
            )}
          >
            <ar.icon className="w-3.5 h-3.5" />
            {ar.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );

  const cameraStyleChip = (
    <Popover open={cameraPopoverOpen} onOpenChange={setCameraPopoverOpen}>
      <PopoverTrigger asChild>
        <button className={cn(
          'inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border transition-colors',
          cameraStyle === 'natural'
            ? 'border-primary/30 bg-primary/10 text-primary'
            : 'border-border bg-muted/50 text-foreground/70 hover:bg-muted'
        )}>
          {cameraStyle === 'natural' ? <Smartphone className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
          {cameraStyle === 'natural' ? 'Natural' : 'Pro'}
          <ChevronDown className="w-3 h-3 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1.5" align="start">
        {([
          { value: 'pro' as const, icon: Camera, label: 'Pro', desc: 'Studio-grade commercial look with polished lighting and color grading.' },
          { value: 'natural' as const, icon: Smartphone, label: 'Natural', desc: 'Raw iPhone-style photo. Sharp details, true-to-life colors, no heavy editing.' },
        ]).map(opt => (
          <button
            key={opt.value}
            onClick={() => { onCameraStyleChange(opt.value); setCameraPopoverOpen(false); }}
            className={cn(
              'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-start gap-3',
              cameraStyle === opt.value ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
            )}
          >
            <opt.icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[13px]">{opt.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{opt.desc}</div>
            </div>
            {cameraStyle === opt.value && <span className="text-primary mt-0.5">✓</span>}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );

  const qualityChip = (
    <Popover open={qualityPopoverOpen} onOpenChange={setQualityPopoverOpen}>
      <PopoverTrigger asChild>
        <button className={cn(
          'inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border transition-colors',
          quality === 'high'
            ? 'border-primary/30 bg-primary/10 text-primary'
            : 'border-border bg-muted/50 text-foreground/70 hover:bg-muted'
        )}>
          {quality === 'high' ? <Sparkles className="w-3.5 h-3.5" /> : <Gauge className="w-3.5 h-3.5" />}
          {quality === 'high' ? 'Pro' : 'Standard'}
          <ChevronDown className="w-3 h-3 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1.5" align="start">
        {([
          { value: 'standard' as const, icon: Gauge, label: 'Standard', desc: '4 credits/image. Fast generation, great for drafts and iteration.' },
          { value: 'high' as const, icon: Sparkles, label: 'Pro', desc: '6 credits/image. Higher detail and polish for final assets.' },
        ]).map(opt => (
          <button
            key={opt.value}
            onClick={() => { onQualityChange(opt.value); setQualityPopoverOpen(false); }}
            className={cn(
              'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-start gap-3',
              quality === opt.value ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
            )}
          >
            <opt.icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[13px]">{opt.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{opt.desc}</div>
            </div>
            {quality === opt.value && <span className="text-primary mt-0.5">✓</span>}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );

  // --- Chip wrappers for model/scene/product with disabled + highlight support ---
  const productChipInner = (
    <div className={cn(
      disabledChips?.product && 'opacity-40'
    )}>
      <ProductSelectorChip
        selectedProduct={selectedProduct}
        open={disabledChips?.product ? false : productPopoverOpen}
        onOpenChange={disabledChips?.product ? () => {} : onProductPopoverChange}
        onSelect={onProductSelect}
        products={products}
        isLoading={isLoadingProducts}
        modal={isMobile}
      />
    </div>
  );

  const productChip = disabledChips?.product ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="cursor-default">{productChipInner}</div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        Create an account to upload your product
      </TooltipContent>
    </Tooltip>
  ) : productChipInner;

  const modelChip = (
    <div className={cn(
      disabledChips?.model && 'opacity-40 pointer-events-none'
    )}>
      <ModelSelectorChip
        selectedModel={selectedModel}
        open={disabledChips?.model ? false : modelPopoverOpen}
        onOpenChange={disabledChips?.model ? () => {} : onModelPopoverChange}
        onSelect={onModelSelect}
        modal={isMobile}
      />
    </div>
  );

  const sceneChip = (
    <div className={cn(
      disabledChips?.scene && 'opacity-40 pointer-events-none'
    )}>
      <SceneSelectorChip
        selectedScene={selectedScene}
        open={disabledChips?.scene ? false : scenePopoverOpen}
        onOpenChange={disabledChips?.scene ? () => {} : onScenePopoverChange}
        onSelect={onSceneSelect}
        modal={isMobile}
      />
    </div>
  );

  // --- Mobile: 4 primary chips + Advanced popover for the rest ---
  if (isMobile) {
    const isAspectModified = aspectRatio !== '1:1';
    const isCameraModified = cameraStyle !== 'pro';
    const isQualityModified = quality !== 'standard';
    const isFramingModified = !!framing;
    const isBrandModified = !!selectedBrandProfile;
    const advancedModified =
      isAspectModified || isCameraModified || isQualityModified || isFramingModified || isBrandModified;

    const [advancedOpen, setAdvancedOpenLocal] = [advancedOpenState, setAdvancedOpenState] as const;

    return (
      <TooltipProvider delayDuration={300}>
        <div className="flex items-center gap-1 flex-wrap">
          {uploadButton}
          {productChip}
          {modelChip}
          {sceneChip}

          <Popover open={advancedOpen} onOpenChange={setAdvancedOpenLocal}>
            <PopoverTrigger asChild>
              <button className="relative inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border border-border bg-muted/50 text-foreground/70 hover:bg-muted transition-colors">
                <Sliders className="w-3.5 h-3.5" />
                Advanced
                <ChevronDown className="w-3 h-3 opacity-40" />
                {advancedModified && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[min(320px,calc(100vw-2rem))] p-3 space-y-3" align="start">
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">Framing</p>
                <FramingSelectorChip
                  framing={framing}
                  onFramingChange={onFramingChange}
                  open={framingPopoverOpen}
                  onOpenChange={onFramingPopoverChange}
                  modal={isMobile}
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">Brand</p>
                {disabledChips?.brand ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border border-border bg-muted/50 text-foreground/70 opacity-40 cursor-default"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Palette className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Brand</span>
                        <ChevronDown className="w-3 h-3 opacity-40 shrink-0" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Register to create your brand profile
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <BrandProfileChip
                    selectedProfile={selectedBrandProfile}
                    open={brandProfilePopoverOpen}
                    onOpenChange={onBrandProfilePopoverChange}
                    onSelect={onBrandProfileSelect}
                    profiles={brandProfiles}
                    isLoading={isLoadingBrandProfiles}
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">Aspect ratio</p>
                {aspectRatioChip}
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">Camera style</p>
                {cameraStyleChip}
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">Quality</p>
                {qualityChip}
              </div>
            </PopoverContent>
          </Popover>

          {promptHelperButton}
        </div>
      </TooltipProvider>
    );
  }

  // --- Desktop: grouped chips with subtle dividers ---
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-2 flex-wrap">
        {uploadButton}
        {productChip}
        {modelChip}
        {sceneChip}
        <FramingSelectorChip
          framing={framing}
          onFramingChange={onFramingChange}
          open={framingPopoverOpen}
          onOpenChange={onFramingPopoverChange}
          modal={false}
        />
        {disabledChips?.brand ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border border-border bg-muted/50 text-foreground/70 opacity-40 cursor-default"
                onClick={(e) => e.preventDefault()}
              >
                <Palette className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Brand</span>
                <ChevronDown className="w-3 h-3 opacity-40 shrink-0" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Register to create your brand profile
            </TooltipContent>
          </Tooltip>
        ) : (
          <BrandProfileChip
            selectedProfile={selectedBrandProfile}
            open={brandProfilePopoverOpen}
            onOpenChange={onBrandProfilePopoverChange}
            onSelect={onBrandProfileSelect}
            profiles={brandProfiles}
            isLoading={isLoadingBrandProfiles}
          />
        )}
        {aspectRatioChip}
        {cameraStyleChip}
        {qualityChip}
        {promptHelperButton}
      </div>
    </TooltipProvider>
  );
}
