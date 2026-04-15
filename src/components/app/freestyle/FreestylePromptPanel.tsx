import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, X, Sparkles, Loader2, ImagePlus, ChevronUp, RotateCcw, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { FreestyleSettingsChips, type FreestyleAspectRatio } from './FreestyleSettingsChips';
import type { GuideStepKey } from './FreestyleGuide';
import type { ModelProfile, TryOnPose, FramingOption } from '@/types';
import { ImageRoleSelector, type ImageRole, type EditIntent } from './ImageRoleSelector';
import { PromptBuilderQuiz } from './PromptBuilderQuiz';
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
  onFileDrop?: (file: File) => void;
  creditBalance?: number;
  // Image role intent
  imageRole: ImageRole;
  onImageRoleChange: (role: ImageRole) => void;
  editIntent: EditIntent[];
  onEditIntentChange: (intents: EditIntent[]) => void;
  disabledChips?: { product?: boolean; model?: boolean; scene?: boolean; brand?: boolean };
  hideCreditCost?: boolean;
  // Mobile collapse
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  // Guide highlight
  highlightedChip?: GuideStepKey | null;
  // Reset
  onReset?: () => void;
  isDirty?: boolean;
}

const TYPEWRITER_PHRASES = [
  "A luxury perfume on marble with golden hour lighting…",
  "Streetwear jacket on a model in an industrial warehouse…",
  "Minimalist skincare flat-lay with botanicals and morning light…",
  "Sneakers on concrete with dramatic shadow play…",
];

function TypewriterPlaceholder({
  prompt,
  sourceImagePreview,
  imageRole,
  hasAssets,
}: {
  prompt: string;
  sourceImagePreview: string | null;
  imageRole: string;
  hasAssets?: boolean;
}) {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isErasing, setIsErasing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // If there's a custom placeholder context, show static text instead
  const hasCustomPlaceholder = (sourceImagePreview && imageRole === 'edit') || hasAssets;

  useEffect(() => {
    if (prompt.length > 0 || hasCustomPlaceholder) return;

    const phrase = TYPEWRITER_PHRASES[phraseIdx];
    if (!isErasing) {
      if (charIdx < phrase.length) {
        const t = setTimeout(() => setCharIdx(c => c + 1), 40);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setIsErasing(true), 2000);
        return () => clearTimeout(t);
      }
    } else {
      if (charIdx > 0) {
        const t = setTimeout(() => setCharIdx(c => c - 1), 20);
        return () => clearTimeout(t);
      } else {
        setIsErasing(false);
        setPhraseIdx(i => (i + 1) % TYPEWRITER_PHRASES.length);
      }
    }
  }, [charIdx, isErasing, phraseIdx, prompt.length, hasCustomPlaceholder]);

  // Listen for focus/blur on parent textarea
  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    // Find the textarea sibling
    const ta = document.querySelector<HTMLTextAreaElement>('.freestyle-prompt-textarea');
    ta?.addEventListener('focus', handleFocus);
    ta?.addEventListener('blur', handleBlur);
    return () => {
      ta?.removeEventListener('focus', handleFocus);
      ta?.removeEventListener('blur', handleBlur);
    };
  }, []);

  if (prompt.length > 0) return null;

  if (hasCustomPlaceholder) {
    const text = sourceImagePreview && imageRole === 'edit'
      ? "Describe what to change — remove a detail, swap background, adjust colors…"
      : "Optional — describe extra details, or leave empty to auto-generate";
    return (
      <div className="absolute inset-0 pointer-events-none text-base leading-relaxed text-muted-foreground/50 pr-10">
        {text}
      </div>
    );
  }

  if (isFocused) {
    return (
      <div className="absolute inset-0 pointer-events-none text-base leading-relaxed text-muted-foreground/50 pr-10">
        Describe what you want to create…
      </div>
    );
  }

  const displayText = TYPEWRITER_PHRASES[phraseIdx].slice(0, charIdx);

  return (
    <div className="absolute inset-0 pointer-events-none text-base leading-relaxed text-muted-foreground/50 pr-10">
      {displayText}
      <span className="animate-pulse">|</span>
    </div>
  );
}

export function FreestylePromptPanel({
  prompt, onPromptChange,
  hasAssets,
  sourceImagePreview, onUploadClick, onRemoveImage,
  onGenerate, canGenerate, isLoading, progress, creditCost,
  hideCreditCost,
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
  onFileDrop,
  creditBalance,
  imageRole,
  onImageRoleChange,
  editIntent,
  onEditIntentChange,
  disabledChips,
  isCollapsed,
  onToggleCollapse,
  highlightedChip,
  onReset,
  isDirty,
}: FreestylePromptPanelProps) {
  const isMobile = useIsMobile();
  const [isDragOver, setIsDragOver] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const dragCounterRef = useRef(0);
  const touchStartY = useRef<number | null>(null);

  // Clipboard paste support for images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items || !onFileDrop) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) onFileDrop(file);
          return;
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [onFileDrop]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null || !onToggleCollapse) return;
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (delta > 40 && !isCollapsed) onToggleCollapse();
    if (delta < -40 && isCollapsed) onToggleCollapse();
    touchStartY.current = null;
  }, [onToggleCollapse, isCollapsed]);

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
      <Plus className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate">Upload Image</span>
    </button>
  );

  // Prompt Helper button removed from here — now inline with textarea

  return (
    <div
      className={cn(
        'relative bg-background transition-none lg:transition-colors lg:duration-200',
        isMobile
          ? 'rounded-t-3xl border-0 shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.08)]'
          : 'rounded-2xl border shadow-lg backdrop-blur-xl',
        isDragOver
          ? 'border-primary border-2 ring-2 ring-primary/20'
          : !isMobile && 'border-border/60'
      )}
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


      {/* Mobile collapse handle */}
      {isMobile && onToggleCollapse && (
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="w-full flex items-center justify-center py-3 cursor-grab"
        >
          <button
            onClick={onToggleCollapse}
            className="active:scale-[0.98] transition-transform"
            aria-label={isCollapsed ? 'Expand prompt' : 'Collapse prompt'}
          >
            <div className={cn(
              'h-[5px] rounded-full transition-all',
              isCollapsed ? 'w-10 bg-muted-foreground/30' : 'w-9 bg-border/50'
            )} />
          </button>
        </div>
      )}

      {/* Collapsible content */}
      {!(isMobile && isCollapsed) && (
        <>
          {/* Row 1 — Prompt Input */}
          <div className={`relative px-3 sm:px-5 ${isMobile && onToggleCollapse ? 'pt-1' : 'pt-4 sm:pt-5'} pb-2 sm:pb-3`}>
            <TypewriterPlaceholder
              prompt={prompt}
              sourceImagePreview={sourceImagePreview}
              imageRole={imageRole}
              hasAssets={hasAssets}
            />
            <textarea
              value={prompt}
              onChange={e => onPromptChange(e.target.value)}
              placeholder={prompt.length === 0 ? '' : undefined}
              rows={isMobile ? 2 : 3}
              className="w-full bg-transparent border-none text-base leading-relaxed text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-0 min-h-[56px] sm:min-h-[80px] lg:min-h-[72px] pr-10 relative z-[1]"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (canGenerate && !isLoading) onGenerate();
                }
              }}
            />
            {isDirty && onReset && (
              <div className="absolute top-2 right-4 sm:top-3 sm:right-6">
                <button
                  onClick={onReset}
                  className="p-1.5 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted/80 transition-colors"
                  aria-label="Reset all settings"
                >
                  <RotateCcw className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Image Role Selector (only when image is uploaded) */}
          {sourceImagePreview && (
            <>
              <div className="border-t border-border/40 mx-3 sm:mx-5" />
              <div className="px-3 sm:px-5 py-3">
                <ImageRoleSelector
                  imageRole={imageRole}
                  onImageRoleChange={onImageRoleChange}
                  editIntent={editIntent}
                  onEditIntentChange={onEditIntentChange}
                />
              </div>
            </>
          )}

          {/* Divider */}
          <div className="border-t border-border/40 mx-3 sm:mx-5" />

          {/* Row 2 — Settings Chips */}
          <div className="px-3 sm:px-5 py-2 sm:py-3 space-y-2">
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
              selectedBrandProfile={selectedBrandProfile} onBrandProfileSelect={onBrandProfileSelect}
              brandProfilePopoverOpen={brandProfilePopoverOpen} onBrandProfilePopoverChange={onBrandProfilePopoverChange}
              brandProfiles={brandProfiles} isLoadingBrandProfiles={isLoadingBrandProfiles}
              cameraStyle={cameraStyle} onCameraStyleChange={onCameraStyleChange}
              quality={quality} onQualityChange={onQualityChange}
              framing={framing} onFramingChange={onFramingChange}
              framingPopoverOpen={framingPopoverOpen} onFramingPopoverChange={onFramingPopoverChange}
              hasModelSelected={!!selectedModel}
              highlightedChip={highlightedChip}
              disabledChips={disabledChips}
              promptHelperButton={
                <button
                  onClick={() => setQuizOpen(true)}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border border-border bg-muted/50 text-foreground/70 hover:bg-muted transition-colors"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Prompt Helper
                </button>
              }
            />

          </div>

          {/* Divider */}
          <div className="border-t border-border/40 mx-3 sm:mx-5 hidden sm:block" />

          {/* Row 3 — Action Bar */}
          <div className="px-3 sm:px-5 py-2 sm:py-3 flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            {(() => {
              const hasEnoughCredits = hideCreditCost || creditBalance === undefined || creditBalance >= creditCost;
              const showInsufficientCredits = !hideCreditCost && canGenerate && !hasEnoughCredits;

              return (
                <>
                  {!canGenerate && !isLoading ? (
                    <p className="text-xs text-muted-foreground mr-auto truncate hidden sm:block">
                      Type a prompt or add a reference to start
                    </p>
                   ) : showInsufficientCredits ? (
                     <p className="text-xs text-muted-foreground mr-auto w-full sm:w-auto">
                       <span className="hidden sm:inline">Need {creditCost - (creditBalance ?? 0)} more credits</span>
                       <span className="sm:hidden">Need {creditCost - (creditBalance ?? 0)} more credits ({creditBalance ?? 0}/{creditCost})</span>
                     </p>
                  ) : null}

                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {showInsufficientCredits ? (
                          <Button
                            onClick={onGenerate}
                            size="lg"
                            className="h-11 px-8 gap-2.5 rounded-xl text-sm font-semibold w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                          >
                            <Sparkles className="w-4 h-4" />
                            Buy Credits
                          </Button>
                        ) : (
                          <Button
                            onClick={onGenerate}
                            disabled={!canGenerate}
                            size="lg"
                            className={cn(
                              "h-11 px-8 gap-2.5 rounded-xl text-sm font-semibold w-full sm:w-auto",
                              canGenerate
                                ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                                : "bg-muted text-muted-foreground shadow-none pointer-events-none"
                            )}
                          >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Generate
                            {!hideCreditCost && <span className="text-xs opacity-70 tabular-nums">({creditCost})</span>}
                          </Button>
                        )}
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        {hideCreditCost
                          ? 'Sign up to generate'
                          : showInsufficientCredits
                            ? `You need ${creditCost - (creditBalance ?? 0)} more credits to generate`
                            : selectedModel && selectedScene
                              ? `${creditCost} credits: Model + Scene`
                              : selectedModel
                                ? `${creditCost} credits: Model reference`
                                : `${creditCost} credits per image`}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              );
            })()}
          </div>
        </>
      )}
      <PromptBuilderQuiz open={quizOpen} onOpenChange={setQuizOpen} onUsePrompt={onPromptChange} />
    </div>
  );
}
