import React from 'react';
import type { GuideStepKey } from './FreestyleGuide';
import {
  Square, RectangleHorizontal, ChevronDown,
  Smartphone, Camera, Lock, SlidersHorizontal,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ModelSelectorChip } from './ModelSelectorChip';
import { SceneSelectorChip } from './SceneSelectorChip';
import { ProductSelectorChip } from './ProductSelectorChip';
import { BrandProfileChip } from './BrandProfileChip';
import { NegativesChip } from './NegativesChip';
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
  quality: 'standard' | 'high';
  onQualityChange: (q: 'standard' | 'high') => void;
  selectedBrandProfile: BrandProfile | null;
  onBrandProfileSelect: (profile: BrandProfile | null) => void;
  brandProfilePopoverOpen: boolean;
  onBrandProfilePopoverChange: (open: boolean) => void;
  brandProfiles: BrandProfile[];
  isLoadingBrandProfiles: boolean;
  negatives: string[];
  onNegativesChange: (negatives: string[]) => void;
  negativesPopoverOpen: boolean;
  onNegativesPopoverChange: (open: boolean) => void;
  cameraStyle: 'pro' | 'natural';
  onCameraStyleChange: (s: 'pro' | 'natural') => void;
  framing: FramingOption | null;
  onFramingChange: (f: FramingOption | null) => void;
  framingPopoverOpen: boolean;
  onFramingPopoverChange: (open: boolean) => void;
  hasModelSelected?: boolean;
  highlightedChip?: GuideStepKey | null;
  disabledChips?: { product?: boolean; model?: boolean; scene?: boolean };
}

export function FreestyleSettingsChips({
  uploadButton,
  selectedModel, onModelSelect, modelPopoverOpen, onModelPopoverChange,
  selectedScene, onSceneSelect, scenePopoverOpen, onScenePopoverChange,
  selectedProduct, onProductSelect, productPopoverOpen, onProductPopoverChange,
  products, isLoadingProducts,
  aspectRatio, onAspectRatioChange,
  quality, onQualityChange,
  selectedBrandProfile, onBrandProfileSelect, brandProfilePopoverOpen, onBrandProfilePopoverChange,
  brandProfiles, isLoadingBrandProfiles,
  negatives, onNegativesChange, negativesPopoverOpen, onNegativesPopoverChange,
  cameraStyle, onCameraStyleChange,
  framing, onFramingChange, framingPopoverOpen, onFramingPopoverChange,
  hasModelSelected = false,
  highlightedChip,
  disabledChips,
}: FreestyleSettingsChipsProps) {
  const isMobile = useIsMobile();
  const [aspectPopoverOpen, setAspectPopoverOpen] = React.useState(false);
  const [qualityPopoverOpen, setQualityPopoverOpen] = React.useState(false);
  const [cameraPopoverOpen, setCameraPopoverOpen] = React.useState(false);
  const [advancedOpen, setAdvancedOpen] = React.useState(false);

  // Count active advanced settings for badge
  const advancedActiveCount = [
    selectedBrandProfile !== null,
    negatives.length > 0,
  ].filter(Boolean).length;

  // --- Shared chip renderers ---

  const aspectRatioChip = (
    <Popover open={aspectPopoverOpen} onOpenChange={setAspectPopoverOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border border-border bg-muted/50 text-foreground/70 hover:bg-muted transition-colors">
          <Square className="w-3.5 h-3.5" />
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

  const qualityChip = hasModelSelected ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border border-primary/30 bg-primary/10 text-primary cursor-default">
          <Lock className="w-3 h-3" />
          Pro Model
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[220px] text-center">
        Pro model is required for model-reference generations to preserve identity. 6 credits/image.
      </TooltipContent>
    </Tooltip>
  ) : (
    <Popover open={qualityPopoverOpen} onOpenChange={setQualityPopoverOpen}>
      <PopoverTrigger asChild>
        <button className={cn(
          'inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border transition-colors',
          quality === 'high'
            ? 'border-primary/30 bg-primary/10 text-primary'
            : 'border-border bg-muted/50 text-foreground/70 hover:bg-muted'
        )}>
          {quality === 'high' ? (isMobile ? '✦ High' : 'Quality: ✦ High') : (isMobile ? 'Standard' : 'Quality: Standard')}
          <ChevronDown className="w-3 h-3 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1.5" align="start">
        {([
          { value: 'standard' as const, label: 'Standard', desc: 'Fast generation at standard resolution. 4 credits per image.' },
          { value: 'high' as const, label: '✦ High', desc: 'Higher detail and resolution output. 6 credits per image.' },
        ]).map(opt => (
          <button
            key={opt.value}
            onClick={() => { onQualityChange(opt.value); setQualityPopoverOpen(false); }}
            className={cn(
              'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-start gap-3',
              quality === opt.value ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
            )}
          >
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

  // --- Mobile: inline flow layout ---
  if (isMobile) {
    return (
      <TooltipProvider delayDuration={300}>
        <div className="space-y-2">
          {/* All chips in one flow */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <div className="flex items-center gap-2 flex-wrap">
              {uploadButton}
              <div className={cn(
                highlightedChip === 'product' && 'ring-2 ring-primary/50 rounded-full animate-pulse',
                disabledChips?.product && 'opacity-40 pointer-events-none'
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
              {aspectRatioChip}
              <div className={cn(
                highlightedChip === 'model' && 'ring-2 ring-primary/50 rounded-full animate-pulse',
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
              <div className={cn(highlightedChip === 'scene' && 'ring-2 ring-primary/50 rounded-full animate-pulse')}>
                <SceneSelectorChip
                  selectedScene={selectedScene}
                  open={scenePopoverOpen}
                  onOpenChange={onScenePopoverChange}
                  onSelect={onSceneSelect}
                  modal={isMobile}
                />
              </div>
              <FramingSelectorChip
                framing={framing}
                onFramingChange={onFramingChange}
                open={framingPopoverOpen}
                onOpenChange={onFramingPopoverChange}
                modal={isMobile}
              />
              {qualityChip}
              {cameraStyleChip}
              <CollapsibleTrigger asChild>
                <button className={cn(
                  'inline-flex items-center gap-1 h-8 px-2 rounded-full text-xs font-medium border transition-colors',
                  advancedActiveCount > 0
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-border bg-muted/50 text-foreground/70 hover:bg-muted'
                )}>
                  <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                  <span>More</span>
                  {advancedActiveCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center shrink-0">
                      {advancedActiveCount}
                    </span>
                  )}
                  <ChevronDown className={cn('w-3 h-3 opacity-40 transition-transform shrink-0', advancedOpen && 'rotate-180')} />
                </button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="pt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <BrandProfileChip
                  selectedProfile={selectedBrandProfile}
                  open={brandProfilePopoverOpen}
                  onOpenChange={onBrandProfilePopoverChange}
                  onSelect={onBrandProfileSelect}
                  profiles={brandProfiles}
                  isLoading={isLoadingBrandProfiles}
                />
                <NegativesChip
                  negatives={negatives}
                  onNegativesChange={onNegativesChange}
                  open={negativesPopoverOpen}
                  onOpenChange={onNegativesPopoverChange}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </TooltipProvider>
    );
  }

  // --- Desktop: grouped chips with subtle dividers ---
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Group 1: References — what goes INTO the image */}
        {uploadButton}
        <div className={cn(highlightedChip === 'product' && 'ring-2 ring-primary/50 rounded-full animate-pulse')}>
          <ProductSelectorChip
            selectedProduct={selectedProduct}
            open={productPopoverOpen}
            onOpenChange={onProductPopoverChange}
            onSelect={onProductSelect}
            products={products}
            isLoading={isLoadingProducts}
            modal={false}
          />
        </div>
        <div className={cn(highlightedChip === 'model' && 'ring-2 ring-primary/50 rounded-full animate-pulse')}>
          <ModelSelectorChip
            selectedModel={selectedModel}
            open={modelPopoverOpen}
            onOpenChange={onModelPopoverChange}
            onSelect={onModelSelect}
            modal={false}
          />
        </div>
        <div className={cn(highlightedChip === 'scene' && 'ring-2 ring-primary/50 rounded-full animate-pulse')}>
          <SceneSelectorChip
            selectedScene={selectedScene}
            open={scenePopoverOpen}
            onOpenChange={onScenePopoverChange}
            onSelect={onSceneSelect}
            modal={false}
          />
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-border/60 mx-1" />

        {/* Group 2: Creative — HOW it looks */}
        <FramingSelectorChip
          framing={framing}
          onFramingChange={onFramingChange}
          open={framingPopoverOpen}
          onOpenChange={onFramingPopoverChange}
          modal={false}
        />
        <BrandProfileChip
          selectedProfile={selectedBrandProfile}
          open={brandProfilePopoverOpen}
          onOpenChange={onBrandProfilePopoverChange}
          onSelect={onBrandProfileSelect}
          profiles={brandProfiles}
          isLoading={isLoadingBrandProfiles}
        />
        <NegativesChip
          negatives={negatives}
          onNegativesChange={onNegativesChange}
          open={negativesPopoverOpen}
          onOpenChange={onNegativesPopoverChange}
        />

        {/* Divider */}
        <div className="h-5 w-px bg-border/60 mx-1" />

        {/* Group 3: Output — technical settings */}
        {aspectRatioChip}
        {qualityChip}
        {cameraStyleChip}

      </div>
    </TooltipProvider>
  );
}
