import React from 'react';
import { Plus, X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FreestyleSettingsChips, type FreestyleAspectRatio } from './FreestyleSettingsChips';
import type { ModelProfile, TryOnPose } from '@/types';
import type { Tables } from '@/integrations/supabase/types';

type UserProduct = Tables<'user_products'>;
type BrandProfile = Tables<'brand_profiles'>;

interface FreestylePromptPanelProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  sourceImagePreview: string | null;
  onUploadClick: () => void;
  onRemoveImage: () => void;
  onGenerate: () => void;
  canGenerate: boolean;
  isLoading: boolean;
  progress: number;
  creditCost: number;
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
  onQualityToggle: () => void;
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
}

export function FreestylePromptPanel({
  prompt, onPromptChange,
  sourceImagePreview, onUploadClick, onRemoveImage,
  onGenerate, canGenerate, isLoading, progress, creditCost,
  selectedModel, onModelSelect, modelPopoverOpen, onModelPopoverChange,
  selectedScene, onSceneSelect, scenePopoverOpen, onScenePopoverChange,
  selectedProduct, onProductSelect, productPopoverOpen, onProductPopoverChange,
  products, isLoadingProducts,
  aspectRatio, onAspectRatioChange,
  quality, onQualityToggle,
  polishPrompt, onPolishChange,
  imageCount, onImageCountChange,
  stylePresets, onStylePresetsChange,
}: FreestylePromptPanelProps) {
  const uploadButton = sourceImagePreview ? (
    <div className="relative w-9 h-9 flex-shrink-0">
      <img src={sourceImagePreview} alt="Attached" className="w-9 h-9 rounded-lg object-cover ring-1 ring-border" />
      <button
        onClick={onRemoveImage}
        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </div>
  ) : (
    <button
      onClick={onUploadClick}
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border border-border bg-muted/50 text-foreground/70 hover:bg-muted transition-colors"
    >
      <Plus className="w-3.5 h-3.5" />
      Upload Image
    </button>
  );

  return (
    <div className="relative bg-background/80 backdrop-blur-xl border border-border/60 rounded-2xl shadow-lg overflow-hidden">
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 z-10">
          <Progress value={progress} className="h-[2px] rounded-none bg-muted" />
        </div>
      )}

      {/* Row 1 — Prompt Input */}
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
        <textarea
          value={prompt}
          onChange={e => onPromptChange(e.target.value)}
          placeholder="Describe what you want to create..."
          rows={3}
          className="w-full bg-transparent border-none text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-0 min-h-[72px]"
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              onGenerate();
            }
          }}
        />
      </div>

      {/* Divider */}
      <div className="border-t border-border/40 mx-4 sm:mx-5" />

      {/* Row 2 — Settings Chips */}
      <div className="px-4 sm:px-5 py-3">
        <FreestyleSettingsChips
          uploadButton={uploadButton}
          selectedProduct={selectedProduct} onProductSelect={onProductSelect}
          productPopoverOpen={productPopoverOpen} onProductPopoverChange={onProductPopoverChange}
          products={products} isLoadingProducts={isLoadingProducts}
          selectedModel={selectedModel} onModelSelect={onModelSelect}
          modelPopoverOpen={modelPopoverOpen} onModelPopoverChange={onModelPopoverChange}
          selectedScene={selectedScene} onSceneSelect={onSceneSelect}
          scenePopoverOpen={scenePopoverOpen} onScenePopoverChange={onScenePopoverChange}
          aspectRatio={aspectRatio} onAspectRatioChange={onAspectRatioChange}
          quality={quality} onQualityToggle={onQualityToggle}
          polishPrompt={polishPrompt} onPolishChange={onPolishChange}
          imageCount={imageCount} onImageCountChange={onImageCountChange}
          stylePresets={stylePresets} onStylePresetsChange={onStylePresetsChange}
        />
      </div>

      {/* Divider */}
      <div className="border-t border-border/40 mx-4 sm:mx-5" />

      {/* Row 3 — Action Bar */}
      <div className="px-4 sm:px-5 py-3 flex items-center justify-end">
        <Button
          onClick={onGenerate}
          disabled={!canGenerate}
          size="lg"
          className="h-11 px-8 gap-2.5 rounded-xl shadow-lg shadow-primary/25 text-sm font-semibold w-full sm:w-auto"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate
          <span className="text-xs opacity-70 tabular-nums">({creditCost})</span>
        </Button>
      </div>
    </div>
  );
}
