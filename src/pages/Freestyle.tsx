import { useState, useRef, useCallback } from 'react';
import { Plus, X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ImageLightbox } from '@/components/app/ImageLightbox';
import { FreestyleGallery } from '@/components/app/freestyle/FreestyleGallery';
import { FreestyleSettingsChips, type FreestyleAspectRatio } from '@/components/app/freestyle/FreestyleSettingsChips';
import { useGenerateFreestyle } from '@/hooks/useGenerateFreestyle';
import { useCredits } from '@/contexts/CreditContext';
import { convertImageToBase64 } from '@/lib/imageUtils';
import type { ModelProfile, TryOnPose } from '@/types';

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export default function Freestyle() {
  const [prompt, setPrompt] = useState('');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceImagePreview, setSourceImagePreview] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelProfile | null>(null);
  const [selectedScene, setSelectedScene] = useState<TryOnPose | null>(null);
  const [aspectRatio, setAspectRatio] = useState<FreestyleAspectRatio>('1:1');
  const [quality, setQuality] = useState<'standard' | 'high'>('standard');
  const [polishPrompt, setPolishPrompt] = useState(true);
  const [imageCount, setImageCount] = useState(1);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
  const [scenePopoverOpen, setScenePopoverOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { generate, isLoading, progress } = useGenerateFreestyle();
  const { balance, deductCredits, openBuyModal } = useCredits();

  const creditCost = imageCount * (quality === 'high' ? 2 : 1);
  const canGenerate = prompt.trim().length > 0 && !isLoading && balance >= creditCost;

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setSourceImagePreview(previewUrl);
    const base64 = await convertImageToBase64(previewUrl);
    setSourceImage(base64);
  }, []);

  const removeSourceImage = useCallback(() => {
    setSourceImage(null);
    setSourceImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) {
      if (balance < creditCost) openBuyModal();
      return;
    }

    let modelImageBase64: string | undefined;
    if (selectedModel) {
      modelImageBase64 = await convertImageToBase64(selectedModel.previewUrl);
    }

    // Build the final prompt with scene context
    let finalPrompt = prompt;
    if (selectedScene) {
      finalPrompt = `${prompt}. Scene/Environment: ${selectedScene.description}`;
    }

    const result = await generate({
      prompt: finalPrompt,
      sourceImage: sourceImage || undefined,
      modelImage: modelImageBase64,
      aspectRatio,
      imageCount,
      quality,
      polishPrompt,
    });

    if (result && result.images.length > 0) {
      deductCredits(creditCost);
      const newImages: GeneratedImage[] = result.images.map(url => ({
        url,
        prompt: finalPrompt,
        timestamp: Date.now(),
      }));
      setGeneratedImages(prev => [...newImages, ...prev]);
    }
  }, [canGenerate, balance, creditCost, openBuyModal, selectedModel, selectedScene, generate, prompt, sourceImage, aspectRatio, imageCount, quality, polishPrompt, deductCredits]);

  const handleDownload = useCallback((imageUrl: string, index: number) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `freestyle-${index + 1}.png`;
    a.click();
  }, []);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Results Gallery */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <FreestyleGallery
          images={generatedImages}
          onDownload={handleDownload}
          onExpand={openLightbox}
        />
      </div>

      {/* Sticky Bottom Prompt Bar — Glassmorphism */}
      <div className="flex-shrink-0 relative">
        {/* Loading progress line */}
        {isLoading && (
          <div className="absolute top-0 left-6 right-6">
            <Progress value={progress} className="h-[2px] rounded-none bg-white/[0.06]" />
          </div>
        )}

        <div className="bg-sidebar/95 backdrop-blur-xl border-t border-white/[0.06] p-4 sm:p-5">
          {/* Prompt Input Row */}
          <div className="flex items-end gap-3 mb-3">
            {/* Attach Image */}
            <div className="flex-shrink-0">
              {sourceImagePreview ? (
                <div className="relative w-11 h-11">
                  <img src={sourceImagePreview} alt="Attached" className="w-11 h-11 rounded-xl object-cover ring-1 ring-white/10" />
                  <button
                    onClick={removeSourceImage}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-11 h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-sidebar-foreground/40 hover:bg-white/[0.07] hover:text-sidebar-foreground/70 transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Prompt Textarea */}
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe what you want to create..."
              rows={2}
              className="flex-1 bg-transparent border-none rounded-xl px-4 py-3 text-[15px] leading-relaxed text-sidebar-foreground placeholder:text-sidebar-foreground/30 resize-none focus:outline-none focus:ring-0"
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />

            {/* Generate Button */}
            <div className="flex-shrink-0">
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate}
                size="lg"
                className="h-11 px-6 gap-2 rounded-xl shadow-lg shadow-primary/20"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span className="hidden sm:inline font-medium">Generate</span>
                <span className="text-xs opacity-70 tabular-nums">({creditCost})</span>
              </Button>
            </div>
          </div>

          {/* Settings Chips Row */}
          <FreestyleSettingsChips
            selectedModel={selectedModel}
            onModelSelect={setSelectedModel}
            modelPopoverOpen={modelPopoverOpen}
            onModelPopoverChange={setModelPopoverOpen}
            selectedScene={selectedScene}
            onSceneSelect={setSelectedScene}
            scenePopoverOpen={scenePopoverOpen}
            onScenePopoverChange={setScenePopoverOpen}
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
            quality={quality}
            onQualityToggle={() => setQuality(q => q === 'standard' ? 'high' : 'standard')}
            polishPrompt={polishPrompt}
            onPolishChange={setPolishPrompt}
            imageCount={imageCount}
            onImageCountChange={setImageCount}
          />
        </div>
      </div>

      {/* Lightbox */}
      {generatedImages.length > 0 && (
        <ImageLightbox
          images={generatedImages.map(i => i.url)}
          currentIndex={lightboxIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
          onDownload={(idx) => handleDownload(generatedImages[idx].url, idx)}
        />
      )}
    </div>
  );
}
