import { useState, useRef, useCallback } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ImageLightbox } from '@/components/app/ImageLightbox';
import { FreestyleGallery } from '@/components/app/freestyle/FreestyleGallery';
import { FreestylePromptPanel } from '@/components/app/freestyle/FreestylePromptPanel';
import { STYLE_PRESETS } from '@/components/app/freestyle/StylePresetChips';
import { useGenerateFreestyle } from '@/hooks/useGenerateFreestyle';
import { useFreestyleImages } from '@/hooks/useFreestyleImages';
import { useCredits } from '@/contexts/CreditContext';
import { useAuth } from '@/contexts/AuthContext';
import { convertImageToBase64 } from '@/lib/imageUtils';
import { supabase } from '@/integrations/supabase/client';
import type { ModelProfile, TryOnPose } from '@/types';
import type { FreestyleAspectRatio } from '@/components/app/freestyle/FreestyleSettingsChips';
import type { Tables } from '@/integrations/supabase/types';

type UserProduct = Tables<'user_products'>;

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
  const [selectedProduct, setSelectedProduct] = useState<UserProduct | null>(null);
  const [productPopoverOpen, setProductPopoverOpen] = useState(false);
  const [productSourced, setProductSourced] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [stylePresets, setStylePresets] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { generate, isLoading, progress } = useGenerateFreestyle();
  const { balance, deductCredits, openBuyModal } = useCredits();
  const { user } = useAuth();
  const { images: savedImages, isLoading: isLoadingImages, saveImage, deleteImage } = useFreestyleImages();

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['user-products', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as UserProduct[];
    },
    enabled: !!user?.id,
  });

  const creditCost = imageCount * (quality === 'high' ? 2 : 1);
  const canGenerate = prompt.trim().length > 0 && !isLoading && balance >= creditCost;

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setSourceImagePreview(previewUrl);
    const base64 = await convertImageToBase64(previewUrl);
    setSourceImage(base64);
    setSelectedProduct(null);
    setProductSourced(false);
  }, []);

  const removeSourceImage = useCallback(() => {
    setSourceImage(null);
    setSourceImagePreview(null);
    setSelectedProduct(null);
    setProductSourced(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleProductSelect = useCallback(async (product: UserProduct | null) => {
    if (!product) {
      if (productSourced) {
        setSourceImage(null);
        setSourceImagePreview(null);
        setProductSourced(false);
      }
      setSelectedProduct(null);
      return;
    }
    setSelectedProduct(product);
    setSourceImagePreview(product.image_url);
    setProductSourced(true);
    const base64 = await convertImageToBase64(product.image_url);
    setSourceImage(base64);
  }, [productSourced]);

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

    // Build model text context
    let modelContext: string | undefined;
    if (selectedModel) {
      modelContext = `${selectedModel.gender}, ${selectedModel.bodyType} build, ${selectedModel.ethnicity}`;
    }

    // Gather active style preset keywords
    const activePresetKeywords = stylePresets
      .map(id => STYLE_PRESETS.find(p => p.id === id)?.keywords)
      .filter(Boolean) as string[];

    const result = await generate({
      prompt: finalPrompt,
      sourceImage: sourceImage || undefined,
      modelImage: modelImageBase64,
      sceneImage: sceneImageBase64,
      aspectRatio,
      imageCount,
      quality,
      polishPrompt,
      modelContext,
      stylePresets: activePresetKeywords.length > 0 ? activePresetKeywords : undefined,
    });

    if (result && result.images.length > 0) {
      deductCredits(creditCost);
      for (const imageUrl of result.images) {
        await saveImage(imageUrl, {
          prompt: finalPrompt,
          aspectRatio,
          quality,
          modelId: selectedModel?.modelId ?? null,
          sceneId: selectedScene?.poseId ?? null,
          productId: selectedProduct?.id ?? null,
        });
      }
    }
  }, [canGenerate, balance, creditCost, openBuyModal, selectedModel, selectedScene, selectedProduct, generate, prompt, sourceImage, aspectRatio, imageCount, quality, polishPrompt, deductCredits, saveImage, stylePresets]);

  const handleDownload = useCallback(async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `freestyle-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Fallback: open in new tab
      window.open(imageUrl, '_blank');
    }
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
    selectedProduct,
    onProductSelect: handleProductSelect,
    productPopoverOpen,
    onProductPopoverChange: setProductPopoverOpen,
    products,
    isLoadingProducts,
    aspectRatio,
    onAspectRatioChange: setAspectRatio,
    quality,
    onQualityToggle: () => setQuality(q => q === 'standard' ? 'high' : 'standard'),
    polishPrompt,
    onPolishChange: setPolishPrompt,
    imageCount,
    onImageCountChange: setImageCount,
    stylePresets,
    onStylePresetsChange: setStylePresets,
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
        ) : hasImages || isLoading ? (
          <FreestyleGallery
            images={galleryImages}
            onDownload={handleDownload}
            onExpand={openLightbox}
            onDelete={handleDelete}
            onCopyPrompt={setPrompt}
            generatingCount={isLoading ? imageCount : 0}
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
