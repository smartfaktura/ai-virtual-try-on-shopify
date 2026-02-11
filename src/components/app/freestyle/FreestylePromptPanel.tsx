import React, { useState, useCallback, useRef } from 'react';
import { Plus, X, Sparkles, Loader2, ImagePlus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FreestyleSettingsChips, type FreestyleAspectRatio } from './FreestyleSettingsChips';
import type { ModelProfile, TryOnPose } from '@/types';
import type { Tables } from '@/integrations/supabase/types';

type UserProduct = Tables<'user_products'>;
type BrandProfile = Tables<'brand_profiles'>;

interface FreestylePromptPanelProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  sourceImagePreview: string | null;
  hasAssets?: boolean;
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
  // Drag and drop
  onFileDrop?: (file: File) => void;
  // Insufficient credits
  insufficientCredits?: boolean;
  onBuyCredits?: () => void;
  currentBalance?: number;
}

export function FreestylePromptPanel({
  prompt, onPromptChange,
  hasAssets,
  sourceImagePreview, onUploadClick, onRemoveImage,
  onGenerate, canGenerate, isLoading, progress, creditCost,
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
  onFileDrop,
  insufficientCredits, onBuyCredits, currentBalance,
}: FreestylePromptPanelProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounterRef.current = 0;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/') && onFileDrop) {
      onFileDrop(file);
    }
  }, [onFileDrop]);
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
    <div
      className={`relative bg-background/80 backdrop-blur-xl border rounded-2xl shadow-lg overflow-hidden transition-colors duration-200 ${
        isDragOver
          ? 'border-primary border-2 ring-2 ring-primary/20'
          : 'border-border/60'
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-20 bg-primary/5 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
          <div className="flex flex-col items-center gap-2 text-primary">
            <ImagePlus className="w-8 h-8" />
            <span className="text-sm font-medium">Drop image here</span>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="absolute top-0 left-0 right-0 z-10 h-[2px] bg-muted overflow-hidden rounded-none">
          <div className="h-full w-1/3 bg-primary animate-pulse-slide" />
        </div>
      )}

      {/* Row 1 — Prompt Input */}
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
        <textarea
          value={prompt}
          onChange={e => onPromptChange(e.target.value)}
          placeholder={hasAssets ? "Optional — describe extra details, or leave empty to auto-generate" : "Describe what you want to create..."}
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
          quality={quality} onQualityChange={onQualityChange}
          polishPrompt={polishPrompt} onPolishChange={onPolishChange}
          imageCount={imageCount} onImageCountChange={onImageCountChange}
          stylePresets={stylePresets} onStylePresetsChange={onStylePresetsChange}
          selectedBrandProfile={selectedBrandProfile} onBrandProfileSelect={onBrandProfileSelect}
          brandProfilePopoverOpen={brandProfilePopoverOpen} onBrandProfilePopoverChange={onBrandProfilePopoverChange}
          brandProfiles={brandProfiles} isLoadingBrandProfiles={isLoadingBrandProfiles}
          negatives={negatives} onNegativesChange={onNegativesChange}
          negativesPopoverOpen={negativesPopoverOpen} onNegativesPopoverChange={onNegativesPopoverChange}
          cameraStyle={cameraStyle} onCameraStyleChange={onCameraStyleChange}
        />
      </div>

      {/* Divider */}
      <div className="border-t border-border/40 mx-4 sm:mx-5" />

      {/* Row 3 — Action Bar */}
      <div className="px-4 sm:px-5 py-3 flex items-center justify-end gap-3">
        {insufficientCredits && !isLoading ? (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              You have {currentBalance ?? 0} — need {creditCost}
            </span>
            <Button
              onClick={onBuyCredits}
              size="lg"
              className="h-11 px-8 gap-2.5 rounded-xl shadow-lg text-sm font-semibold w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white border-0"
            >
              <AlertCircle className="w-4 h-4" />
              Not Enough Credits
            </Button>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
