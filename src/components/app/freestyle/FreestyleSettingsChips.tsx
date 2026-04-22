import React from 'react';

import {
  Square, RectangleHorizontal, ChevronDown, ChevronRight,
  Smartphone, Camera, Lock, Gauge, Sparkles, Palette, Sliders,
  Crop, RotateCcw,
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
  const [expandedSection, setExpandedSection] = React.useState<
    'camera' | 'quality' | 'framing' | 'brand' | null
  >(null);

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
      isCameraModified || isQualityModified || isFramingModified || isBrandModified;

    const [advancedOpen, setAdvancedOpenLocal] = [advancedOpenState, setAdvancedOpenState] as const;
    const [expandedSection, setExpandedSection] = React.useState<
      'camera' | 'quality' | 'framing' | 'brand' | null
    >(null);

    const resetAdvanced = () => {
      onCameraStyleChange('pro');
      onQualityChange('standard');
      onFramingChange(null);
      onBrandProfileSelect(null);
      setExpandedSection(null);
    };

    const cameraValueLabel = cameraStyle === 'natural' ? 'Natural' : 'Pro';
    const qualityValueLabel = quality === 'high' ? 'Pro' : 'Standard';
    const framingValueLabel = framing ? (framing as any).label ?? (framing as any).name ?? 'Custom' : 'Auto';
    const brandValueLabel = selectedBrandProfile?.name ?? 'None';

    const cellClass = '[&>button]:w-full [&>button]:justify-between';

    const SectionRow = ({
      id, icon: Icon, label, value, modified,
    }: {
      id: 'camera' | 'quality' | 'framing' | 'brand';
      icon: React.ComponentType<{ className?: string }>;
      label: string;
      value: string;
      modified: boolean;
    }) => {
      const open = expandedSection === id;
      return (
        <button
          type="button"
          onClick={() => setExpandedSection(open ? null : id)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
            open ? 'bg-muted/60' : 'hover:bg-muted/40'
          )}
        >
          <Icon className="w-4 h-4 text-foreground/70 shrink-0" />
          <div className="flex-1 min-w-0 flex items-center gap-1.5">
            <span className="text-[13px] font-medium text-foreground">{label}</span>
            {modified && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
          </div>
          <span className="text-[12px] text-muted-foreground truncate max-w-[100px]">{value}</span>
          <ChevronRight className={cn('w-4 h-4 text-muted-foreground/60 transition-transform', open && 'rotate-90')} />
        </button>
      );
    };

    const OptionItem = ({
      icon: Icon, label, desc, active, onClick,
    }: {
      icon: React.ComponentType<{ className?: string }>;
      label: string;
      desc: string;
      active: boolean;
      onClick: () => void;
    }) => (
      <button
        onClick={onClick}
        className={cn(
          'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-start gap-3',
          active ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
        )}
      >
        <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-[13px]">{label}</div>
          <div className={cn('text-[11px] mt-0.5 leading-snug', active ? 'text-primary/80' : 'text-muted-foreground')}>{desc}</div>
        </div>
        {active && <span className="mt-0.5">✓</span>}
      </button>
    );

    return (
      <TooltipProvider delayDuration={300}>
        <div className="grid grid-cols-2 gap-2 w-full">
          {/* Row 1 */}
          <div className={cellClass}>{uploadButton}</div>
          <div className={cellClass}>{productChip}</div>

          {/* Row 2 — Scene Look full width */}
          <div className={cn('col-span-2', cellClass)}>{sceneChip}</div>

          {/* Row 3 — Model + Ratio */}
          <div className={cellClass}>{modelChip}</div>
          <div className={cellClass}>{aspectRatioChip}</div>

          {/* Row 4 — Prompt Helper + Advanced */}
          <div className={cellClass}>{promptHelperButton}</div>
          <div className={cellClass}>
            <Popover open={advancedOpen} onOpenChange={(o) => { setAdvancedOpenLocal(o); if (!o) setExpandedSection(null); }}>
              <PopoverTrigger asChild>
                <button className="relative inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border border-border bg-muted/50 text-foreground/70 hover:bg-muted transition-colors">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Advanced</span>
                  <ChevronDown className="w-3 h-3 opacity-40 ml-auto" />
                  {advancedModified && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[min(360px,calc(100vw-1.5rem))] p-0 overflow-hidden" align="end">
                <div className="px-3 py-2.5 border-b border-border/60">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Advanced settings</p>
                </div>
                <div className="divide-y divide-border/50">
                  {/* Framing */}
                  <div>
                    <SectionRow id="framing" icon={Crop} label="Framing" value={framingValueLabel} modified={isFramingModified} />
                    {expandedSection === 'framing' && (
                      <div className="px-3 pb-3 pt-1">
                        <FramingSelectorChip
                          framing={framing}
                          onFramingChange={onFramingChange}
                          open={framingPopoverOpen}
                          onOpenChange={onFramingPopoverChange}
                          modal={true}
                        />
                      </div>
                    )}
                  </div>

                  {/* Camera Style */}
                  <div>
                    <SectionRow id="camera" icon={cameraStyle === 'natural' ? Smartphone : Camera} label="Camera style" value={cameraValueLabel} modified={isCameraModified} />
                    {expandedSection === 'camera' && (
                      <div className="px-1.5 pb-2 pt-1 space-y-0.5">
                        <OptionItem icon={Camera} label="Pro" desc="Studio-grade commercial look with polished lighting and color grading." active={cameraStyle === 'pro'} onClick={() => onCameraStyleChange('pro')} />
                        <OptionItem icon={Smartphone} label="Natural" desc="Raw iPhone-style photo. Sharp details, true-to-life colors, no heavy editing." active={cameraStyle === 'natural'} onClick={() => onCameraStyleChange('natural')} />
                      </div>
                    )}
                  </div>

                  {/* Quality */}
                  <div>
                    <SectionRow id="quality" icon={quality === 'high' ? Sparkles : Gauge} label="Quality" value={qualityValueLabel} modified={isQualityModified} />
                    {expandedSection === 'quality' && (
                      <div className="px-1.5 pb-2 pt-1 space-y-0.5">
                        <OptionItem icon={Gauge} label="Standard" desc="4 credits/image. Fast generation, great for drafts and iteration." active={quality === 'standard'} onClick={() => onQualityChange('standard')} />
                        <OptionItem icon={Sparkles} label="Pro" desc="6 credits/image. Higher detail and polish for final assets." active={quality === 'high'} onClick={() => onQualityChange('high')} />
                      </div>
                    )}
                  </div>

                  {/* Brand */}
                  <div>
                    <SectionRow id="brand" icon={Palette} label="Brand" value={brandValueLabel} modified={isBrandModified} />
                    {expandedSection === 'brand' && (
                      <div className="px-3 pb-3 pt-1">
                        {disabledChips?.brand ? (
                          <p className="text-[11px] text-muted-foreground px-1">Register to create your brand profile.</p>
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
                    )}
                  </div>
                </div>

                {advancedModified && (
                  <div className="px-3 py-2 border-t border-border/60 flex justify-end">
                    <button
                      onClick={resetAdvanced}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset defaults
                    </button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
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
