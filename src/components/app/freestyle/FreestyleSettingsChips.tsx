import React from 'react';
import {
  Square, RectangleHorizontal, ChevronDown,
  Minus, Plus, Wand2, Image as ImageIcon,
  Smartphone, Camera,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getLandingAssetUrl } from '@/lib/landingAssets';
const avatarLuna = getLandingAssetUrl('team/avatar-luna.jpg');
import { ModelSelectorChip } from './ModelSelectorChip';
import { SceneSelectorChip } from './SceneSelectorChip';
import { ProductSelectorChip } from './ProductSelectorChip';
import { StylePresetChips } from './StylePresetChips';
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
  // Brand profile
  selectedBrandProfile: BrandProfile | null;
  onBrandProfileSelect: (profile: BrandProfile | null) => void;
  brandProfilePopoverOpen: boolean;
  onBrandProfilePopoverChange: (open: boolean) => void;
  brandProfiles: BrandProfile[];
  isLoadingBrandProfiles: boolean;
  // Negatives
  negatives: string[];
  onNegativesChange: (negatives: string[]) => void;
  negativesPopoverOpen: boolean;
  onNegativesPopoverChange: (open: boolean) => void;
  // Camera style
  cameraStyle: 'pro' | 'natural';
  onCameraStyleChange: (s: 'pro' | 'natural') => void;
  // Framing
  framing: FramingOption | null;
  onFramingChange: (f: FramingOption | null) => void;
  framingPopoverOpen: boolean;
  onFramingPopoverChange: (open: boolean) => void;
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
}: FreestyleSettingsChipsProps) {
  const [aspectPopoverOpen, setAspectPopoverOpen] = React.useState(false);
  const [qualityPopoverOpen, setQualityPopoverOpen] = React.useState(false);
  const [cameraPopoverOpen, setCameraPopoverOpen] = React.useState(false);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-2">
        {/* Row 1: Main settings chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {uploadButton}

          {/* Product Selector */}
          <ProductSelectorChip
            selectedProduct={selectedProduct}
            open={productPopoverOpen}
            onOpenChange={onProductPopoverChange}
            onSelect={onProductSelect}
            products={products}
            isLoading={isLoadingProducts}
          />

          {/* Model Selector */}
          <ModelSelectorChip
            selectedModel={selectedModel}
            open={modelPopoverOpen}
            onOpenChange={onModelPopoverChange}
            onSelect={onModelSelect}
          />

          {/* Scene Selector */}
          <SceneSelectorChip
            selectedScene={selectedScene}
            open={scenePopoverOpen}
            onOpenChange={onScenePopoverChange}
            onSelect={onSceneSelect}
          />

          {/* Framing Selector */}
          <FramingSelectorChip
            framing={framing}
            onFramingChange={onFramingChange}
            open={framingPopoverOpen}
            onOpenChange={onFramingPopoverChange}
          />

          {/* Brand Profile Selector */}
          <BrandProfileChip
            selectedProfile={selectedBrandProfile}
            open={brandProfilePopoverOpen}
            onOpenChange={onBrandProfilePopoverChange}
            onSelect={onBrandProfileSelect}
            profiles={brandProfiles}
            isLoading={isLoadingBrandProfiles}
          />

          {/* Negatives / Exclude Chip */}
          <NegativesChip
            negatives={negatives}
            onNegativesChange={onNegativesChange}
            open={negativesPopoverOpen}
            onOpenChange={onNegativesPopoverChange}
          />

          {/* Aspect Ratio */}
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

          {/* Quality Dropdown */}
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

          {/* Camera Style Dropdown */}
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

          {/* Prompt Polish Toggle with HoverCard */}
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

          {/* Spacer to push image count to the right */}
          <div className="flex-1" />

          {/* Image Count Stepper */}
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
        </div>

        {/* Row 2: Style Presets */}
        <StylePresetChips selected={stylePresets} onChange={onStylePresetsChange} />
      </div>
    </TooltipProvider>
  );
}
