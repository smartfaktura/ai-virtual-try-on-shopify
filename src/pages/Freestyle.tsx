import { useState, useRef, useCallback } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { ImageLightbox } from '@/components/app/ImageLightbox';
import { FreestyleGallery } from '@/components/app/freestyle/FreestyleGallery';
import { FreestylePromptPanel } from '@/components/app/freestyle/FreestylePromptPanel';
import { useGenerateFreestyle } from '@/hooks/useGenerateFreestyle';
import { useFreestyleImages } from '@/hooks/useFreestyleImages';
import { useCredits } from '@/contexts/CreditContext';
import { convertImageToBase64 } from '@/lib/imageUtils';
import type { ModelProfile, TryOnPose } from '@/types';
import type { FreestyleAspectRatio } from '@/components/app/freestyle/FreestyleSettingsChips';

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
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
  const [scenePopoverOpen, setScenePopoverOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { generate, isLoading, progress } = useGenerateFreestyle();
  const { balance, deductCredits, openBuyModal } = useCredits();
  const { images: savedImages, isLoading: isLoadingImages, saveImage, deleteImage } = useFreestyleImages();

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

    let sceneImageBase64: string | undefined;
    if (selectedScene) {
      sceneImageBase64 = await convertImageToBase64(selectedScene.previewUrl);
    }

    let finalPrompt = prompt;
    if (selectedScene) {
      finalPrompt = `${prompt}. Scene/Environment: ${selectedScene.description}`;
    }

    const result = await generate({
      prompt: finalPrompt,
      sourceImage: sourceImage || undefined,
      modelImage: modelImageBase64,
      sceneImage: sceneImageBase64,
      aspectRatio,
      imageCount,
      quality,
      polishPrompt,
    });

    if (result && result.images.length > 0) {
      deductCredits(creditCost);
      // Save each generated image to storage + DB
      for (const imageUrl of result.images) {
        await saveImage(imageUrl, finalPrompt, aspectRatio, quality);
      }
    }
  }, [canGenerate, balance, creditCost, openBuyModal, selectedModel, selectedScene, generate, prompt, sourceImage, aspectRatio, imageCount, quality, polishPrompt, deductCredits, saveImage]);

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

  const handleDelete = useCallback(async (imageId: string) => {
    await deleteImage(imageId);
  }, [deleteImage]);

  const hasImages = savedImages.length > 0;
  const showLoading = isLoadingImages && !hasImages;

  // Map saved images to gallery format
  const galleryImages = savedImages.map(img => ({
    id: img.id,
    url: img.url,
    prompt: img.prompt,
    aspectRatio: img.aspectRatio,
  }));

  const panelProps = {
    prompt,
    onPromptChange: setPrompt,
    sourceImagePreview,
    onUploadClick: () => fileInputRef.current?.click(),
    onRemoveImage: removeSourceImage,
    onGenerate: handleGenerate,
    canGenerate,
    isLoading,
    progress,
    creditCost,
    selectedModel,
    onModelSelect: setSelectedModel,
    modelPopoverOpen,
    onModelPopoverChange: setModelPopoverOpen,
    selectedScene,
    onSceneSelect: setSelectedScene,
    scenePopoverOpen,
    onScenePopoverChange: setScenePopoverOpen,
    aspectRatio,
    onAspectRatioChange: setAspectRatio,
    quality,
    onQualityToggle: () => setQuality(q => q === 'standard' ? 'high' : 'standard'),
    polishPrompt,
    onPolishChange: setPolishPrompt,
    imageCount,
    onImageCountChange: setImageCount,
  };

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mb-4 sm:-mb-6 lg:-mb-8 -mt-4 sm:-mt-6 lg:-mt-8 bg-muted/30 overflow-hidden" style={{ height: 'calc(100vh)', minHeight: '100%' }}>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      {/* Scrollable content area */}
      <div className="h-full overflow-y-auto pb-72">
        {showLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-muted-foreground/40 animate-spin" />
          </div>
        ) : hasImages ? (
          <FreestyleGallery
            images={galleryImages}
            onDownload={handleDownload}
            onExpand={openLightbox}
            onDelete={handleDelete}
            onCopyPrompt={setPrompt}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-4 sm:px-6">
            <div className="w-20 h-20 rounded-3xl bg-muted/50 border border-border/50 flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h2 className="text-2xl font-light tracking-tight text-foreground/80 mb-2">
              Freestyle Studio
            </h2>
            <p className="text-sm text-muted-foreground/60 max-w-sm leading-relaxed text-center">
              Describe what you want to create, attach a reference, pick a model or scene.
            </p>
          </div>
        )}
      </div>

      {/* Gradient fade above prompt bar */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-muted/80 via-muted/40 to-transparent pointer-events-none" />

      {/* Always-pinned Prompt Bar */}
      <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-4 sm:pb-5 pt-2 pointer-events-none z-10">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <FreestylePromptPanel {...panelProps} />
        </div>
      </div>

      {savedImages.length > 0 && (
        <ImageLightbox
          images={savedImages.map(i => i.url)}
          currentIndex={lightboxIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
          onDownload={(idx) => handleDownload(savedImages[idx].url, idx)}
        />
      )}
    </div>
  );
}
