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

  const hasImages = generatedImages.length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {hasImages ? (
        <>
          {/* Results Gallery — scrollable, prompt bar at bottom */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <FreestyleGallery
              images={generatedImages}
              onDownload={handleDownload}
              onExpand={openLightbox}
            />
          </div>

          {/* Bottom Floating Prompt Bar */}
          <div className="flex-shrink-0 px-4 sm:px-6 pb-4 sm:pb-5 pt-2">
            <div className="relative bg-background/80 backdrop-blur-xl border border-border/60 rounded-2xl shadow-lg p-4 sm:p-5">
              {isLoading && (
                <div className="absolute top-0 left-4 right-4">
                  <Progress value={progress} className="h-[2px] rounded-none bg-muted" />
                </div>
              )}
              <div className="flex items-end gap-3 mb-3">
                <div className="flex-shrink-0">
                  {sourceImagePreview ? (
                    <div className="relative w-11 h-11">
                      <img src={sourceImagePreview} alt="Attached" className="w-11 h-11 rounded-xl object-cover ring-1 ring-border" />
                      <button onClick={removeSourceImage} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 h-11 px-3 rounded-xl border border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200">
                      <Plus className="w-4 h-4" />
                      <span className="text-xs font-medium hidden sm:inline">Upload image</span>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                </div>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Describe what you want to create..."
                  rows={2}
                  className="flex-1 bg-transparent border-none rounded-xl px-4 py-3 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-0"
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleGenerate(); } }}
                />
                <div className="flex-shrink-0">
                  <Button onClick={handleGenerate} disabled={!canGenerate} size="lg" className="h-12 px-8 gap-2.5 rounded-xl shadow-lg shadow-primary/25 text-sm font-semibold">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span className="hidden sm:inline">Generate</span>
                    <span className="text-xs opacity-70 tabular-nums">({creditCost})</span>
                  </Button>
                </div>
              </div>
              <FreestyleSettingsChips
                selectedModel={selectedModel} onModelSelect={setSelectedModel}
                modelPopoverOpen={modelPopoverOpen} onModelPopoverChange={setModelPopoverOpen}
                selectedScene={selectedScene} onSceneSelect={setSelectedScene}
                scenePopoverOpen={scenePopoverOpen} onScenePopoverChange={setScenePopoverOpen}
                aspectRatio={aspectRatio} onAspectRatioChange={setAspectRatio}
                quality={quality} onQualityToggle={() => setQuality(q => q === 'standard' ? 'high' : 'standard')}
                polishPrompt={polishPrompt} onPolishChange={setPolishPrompt}
                imageCount={imageCount} onImageCountChange={setImageCount}
              />
            </div>
          </div>
        </>
      ) : (
        /* Empty State — centered prompt panel */
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6">
          <div className="w-20 h-20 rounded-3xl bg-muted/50 border border-border/50 flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h2 className="text-2xl font-light tracking-tight text-foreground/80 mb-2">
            Freestyle Studio
          </h2>
          <p className="text-sm text-muted-foreground/60 max-w-sm leading-relaxed text-center mb-8">
            Describe what you want to create, attach a reference, pick a model or scene.
          </p>

          <div className="w-full max-w-2xl">
            <div className="relative bg-background/80 backdrop-blur-xl border border-border/60 rounded-2xl shadow-lg p-4 sm:p-5">
              {isLoading && (
                <div className="absolute top-0 left-4 right-4">
                  <Progress value={progress} className="h-[2px] rounded-none bg-muted" />
                </div>
              )}
              <div className="flex items-end gap-3 mb-3">
                <div className="flex-shrink-0">
                  {sourceImagePreview ? (
                    <div className="relative w-11 h-11">
                      <img src={sourceImagePreview} alt="Attached" className="w-11 h-11 rounded-xl object-cover ring-1 ring-border" />
                      <button onClick={removeSourceImage} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 h-11 px-3 rounded-xl border border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200">
                      <Plus className="w-4 h-4" />
                      <span className="text-xs font-medium hidden sm:inline">Upload image</span>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                </div>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Describe what you want to create..."
                  rows={2}
                  className="flex-1 bg-transparent border-none rounded-xl px-4 py-3 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-0"
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleGenerate(); } }}
                />
                <div className="flex-shrink-0">
                  <Button onClick={handleGenerate} disabled={!canGenerate} size="lg" className="h-12 px-8 gap-2.5 rounded-xl shadow-lg shadow-primary/25 text-sm font-semibold">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span className="hidden sm:inline">Generate</span>
                    <span className="text-xs opacity-70 tabular-nums">({creditCost})</span>
                  </Button>
                </div>
              </div>
              <FreestyleSettingsChips
                selectedModel={selectedModel} onModelSelect={setSelectedModel}
                modelPopoverOpen={modelPopoverOpen} onModelPopoverChange={setModelPopoverOpen}
                selectedScene={selectedScene} onSceneSelect={setSelectedScene}
                scenePopoverOpen={scenePopoverOpen} onScenePopoverChange={setScenePopoverOpen}
                aspectRatio={aspectRatio} onAspectRatioChange={setAspectRatio}
                quality={quality} onQualityToggle={() => setQuality(q => q === 'standard' ? 'high' : 'standard')}
                polishPrompt={polishPrompt} onPolishChange={setPolishPrompt}
                imageCount={imageCount} onImageCountChange={setImageCount}
              />
            </div>
          </div>
        </div>
      )}

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
