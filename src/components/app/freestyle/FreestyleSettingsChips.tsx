import React from 'react';
import {
  Square, RectangleHorizontal, ChevronDown,
  Minus, Plus, Wand2, Image as ImageIcon,
  Smartphone, Camera, Lock, Palette, SlidersHorizontal,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { getLandingAssetUrl } from '@/lib/landingAssets';
const avatarLuna = getLandingAssetUrl('team/avatar-luna.jpg');
import { ModelSelectorChip } from './ModelSelectorChip';
import { SceneSelectorChip } from './SceneSelectorChip';
import { ProductSelectorChip } from './ProductSelectorChip';
import { StylePresetChips, STYLE_PRESETS } from './StylePresetChips';
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
  polishPrompt: boolean;
  onPolishChange: (v: boolean) => void;
  imageCount: number;
  onImageCountChange: (count: number) => void;
  stylePresets: string[];
  onStylePresetsChange: (ids: string[]) => void;
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
}

export function FreestyleSettingsChips({
  uploadButton,
  selectedModel, onModelSelect, modelPopoverOpen, onModelPopoverChange,
  selectedScene, onSceneSelect, scenePopoverOpen, onScenePopoverChange,
  selectedProduct, onProductSelect, productPopoverOpen, onProductPopoverChange,
  products, isLoadingProducts,
  aspectRatio, onAspectRatioChange,
  quality, onQualityChange,
  polishPrompt, onPolishChange,
  imageCount, onImageCountChange,
  stylePresets, onStylePresetsChange,
  selectedBrandProfile, onBrandProfileSelect, brandProfilePopoverOpen, onBrandProfilePopoverChange,
  brandProfiles, isLoadingBrandProfiles,
  negatives, onNegativesChange, negativesPopoverOpen, onNegativesPopoverChange,
  cameraStyle, onCameraStyleChange,
  framing, onFramingChange, framingPopoverOpen, onFramingPopoverChange,
  hasModelSelected = false,
}: FreestyleSettingsChipsProps) {
  const isMobile = useIsMobile();
  const [aspectPopoverOpen, setAspectPopoverOpen] = React.useState(false);
  const [qualityPopoverOpen, setQualityPopoverOpen] = React.useState(false);
  const [cameraPopoverOpen, setCameraPopoverOpen] = React.useState(false);
  const [presetsPopoverOpen, setPresetsPopoverOpen] = React.useState(false);
  const [advancedOpen, setAdvancedOpen] = React.useState(false);

  // Count active style settings for badge
  const advancedActiveCount = [
    selectedBrandProfile !== null,
    negatives.length > 0,
    !polishPrompt, // non-default
    stylePresets.length > 0,
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
        Pro model is required for model-reference generations to preserve identity. 12 credits/image.
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
          {quality === 'high' ? '✦ High' : 'Standard'}
          <ChevronDown className="w-3 h-3 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1.5" align="start">
        {([
          { value: 'standard' as const, label: 'Standard', desc: 'Fast generation at standard resolution. 4 credits per image.' },
          { value: 'high' as const, label: '✦ High', desc: 'Higher detail and resolution output. 10 credits per image.' },
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

  const polishChip = (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border border-border bg-muted/50 text-foreground/70 cursor-default">
          <Wand2 className="w-3.5 h-3.5" />
          Polish
          <Switch
            checked={polishPrompt}
            onCheckedChange={onPolishChange}
            className="scale-75 -my-1"
          />
        </div>
      </HoverCardTrigger>
      <HoverCardContent side="top" align="center" className="w-72 p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12 flex-shrink-0 ring-2 ring-primary/20">
            <AvatarImage src={avatarLuna} alt="Luna" />
            <AvatarFallback className="text-sm">L</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-semibold">Luna</p>
            <p className="text-xs text-primary font-medium">Retouch Specialist</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Refines your prompt with professional photography lighting, composition, and mood techniques for studio-quality results.
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );

  const imageCountStepper = (
    <div className="inline-flex items-center gap-1 h-8 px-2.5 rounded-full text-xs font-medium border border-border bg-muted/50 text-foreground/70 flex-shrink-0">
      <button
        onClick={() => onImageCountChange(Math.max(1, imageCount - 1))}
        disabled={imageCount <= 1}
        className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-muted-foreground/10 disabled:opacity-30 transition-colors"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="w-5 text-center tabular-nums">{imageCount}</span>
      <button
        onClick={() => onImageCountChange(Math.min(4, imageCount + 1))}
        disabled={imageCount >= 4}
        className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-muted-foreground/10 disabled:opacity-30 transition-colors"
      >
        <Plus className="w-3 h-3" />
      </button>
      <ImageIcon className="w-3.5 h-3.5 ml-0.5" />
    </div>
  );

  const presetsSection = isMobile ? (
    <Popover open={presetsPopoverOpen} onOpenChange={setPresetsPopoverOpen}>
      <PopoverTrigger asChild>
        <button className={cn(
          'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-medium border transition-colors',
          stylePresets.length > 0
            ? 'border-primary/40 bg-primary/10 text-primary'
            : 'border-border/60 bg-muted/30 text-muted-foreground/60'
        )}>
          <Palette className="w-3 h-3" />
          Presets{stylePresets.length > 0 ? ` (${stylePresets.length})` : ''}
          <ChevronDown className="w-3 h-3 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1.5" align="start">
        {STYLE_PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => {
              const next = stylePresets.includes(preset.id)
                ? stylePresets.filter(s => s !== preset.id)
                : [...stylePresets, preset.id];
              onStylePresetsChange(next);
            }}
            className={cn(
              'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between',
              stylePresets.includes(preset.id) ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
            )}
          >
            {preset.label}
            {stylePresets.includes(preset.id) && <span className="text-primary">✓</span>}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  ) : (
    <StylePresetChips selected={stylePresets} onChange={onStylePresetsChange} />
  );

  // --- Mobile: compact 2-row layout ---
  if (isMobile) {
    return (
      <TooltipProvider delayDuration={300}>
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <div className="space-y-2">
            {/* Row 1: Assets + Creative */}
            <div className="flex items-center gap-2 flex-wrap">
              {uploadButton}
              <ProductSelectorChip
                selectedProduct={selectedProduct}
                open={productPopoverOpen}
                onOpenChange={onProductPopoverChange}
                onSelect={onProductSelect}
                products={products}
                isLoading={isLoadingProducts}
              />
              <ModelSelectorChip
                selectedModel={selectedModel}
                open={modelPopoverOpen}
                onOpenChange={onModelPopoverChange}
                onSelect={onModelSelect}
              />
              <SceneSelectorChip
                selectedScene={selectedScene}
                open={scenePopoverOpen}
                onOpenChange={onScenePopoverChange}
                onSelect={onSceneSelect}
              />
              <FramingSelectorChip
                framing={framing}
                onFramingChange={onFramingChange}
                open={framingPopoverOpen}
                onOpenChange={onFramingPopoverChange}
              />
            </div>

            {/* Row 2: Output + Style trigger */}
            <div className="flex items-center gap-2 flex-wrap">
              {aspectRatioChip}
              {qualityChip}
              {cameraStyleChip}
              {imageCountStepper}
              <CollapsibleTrigger asChild>
                <button className={cn(
                  'inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border transition-colors',
                  advancedActiveCount > 0
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-border bg-muted/50 text-foreground/70 hover:bg-muted'
                )}>
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Style
                  {advancedActiveCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                      {advancedActiveCount}
                    </span>
                  )}
                  <ChevronDown className={cn('w-3 h-3 opacity-40 transition-transform', advancedOpen && 'rotate-180')} />
                </button>
              </CollapsibleTrigger>
            </div>

            {/* Collapsible Style content */}
            <CollapsibleContent className="pt-0.5">
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
                {polishChip}
                {presetsSection}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </TooltipProvider>
    );
  }

  // --- Desktop: all chips in a single flow ---
  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {uploadButton}
          <ProductSelectorChip
            selectedProduct={selectedProduct}
            open={productPopoverOpen}
            onOpenChange={onProductPopoverChange}
            onSelect={onProductSelect}
            products={products}
            isLoading={isLoadingProducts}
          />
          <ModelSelectorChip
            selectedModel={selectedModel}
            open={modelPopoverOpen}
            onOpenChange={onModelPopoverChange}
            onSelect={onModelSelect}
          />
          <SceneSelectorChip
            selectedScene={selectedScene}
            open={scenePopoverOpen}
            onOpenChange={onScenePopoverChange}
            onSelect={onSceneSelect}
          />
          <FramingSelectorChip
            framing={framing}
            onFramingChange={onFramingChange}
            open={framingPopoverOpen}
            onOpenChange={onFramingPopoverChange}
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
          {aspectRatioChip}
          {qualityChip}
          {cameraStyleChip}
          {polishChip}
          <div className="flex-1" />
          {imageCountStepper}
        </div>
        {presetsSection}
      </div>
    </TooltipProvider>
  );
}
