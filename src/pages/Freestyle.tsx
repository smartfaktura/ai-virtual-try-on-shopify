import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Loader2, Camera, X as XIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ImageLightbox } from '@/components/app/ImageLightbox';
import { QueuePositionIndicator } from '@/components/app/QueuePositionIndicator';
import { FreestyleGallery } from '@/components/app/freestyle/FreestyleGallery';
import type { BlockedEntry } from '@/components/app/freestyle/FreestyleGallery';
import { FreestylePromptPanel } from '@/components/app/freestyle/FreestylePromptPanel';
import { STYLE_PRESETS } from '@/components/app/freestyle/StylePresetChips';
import { useFreestyleImages } from '@/hooks/useFreestyleImages';
import { useGenerationQueue } from '@/hooks/useGenerationQueue';
import { useCredits } from '@/contexts/CreditContext';
import { useAuth } from '@/contexts/AuthContext';
import { convertImageToBase64 } from '@/lib/imageUtils';
import { mockTryOnPoses } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import type { ModelProfile, TryOnPose, FramingOption } from '@/types';
import type { FreestyleAspectRatio } from '@/components/app/freestyle/FreestyleSettingsChips';
import type { Tables } from '@/integrations/supabase/types';

type UserProduct = Tables<'user_products'>;
type BrandProfile = Tables<'brand_profiles'>;

function getProductModelInteraction(productType: string): string {
  const type = productType.toLowerCase();
  if (['dress','shirt','jacket','pants','skirt','top','hoodie','sweater','coat','jeans','clothing','apparel'].some(t => type.includes(t)))
    return 'worn by';
  if (['bag','handbag','purse','backpack','tote'].some(t => type.includes(t)))
    return 'carried by';
  if (['shoes','sneakers','boots','heels','sandals','footwear'].some(t => type.includes(t)))
    return 'worn by';
  if (['jewelry','necklace','ring','bracelet','earrings','watch'].some(t => type.includes(t)))
    return 'worn by';
  if (['hat','cap','beanie','headwear'].some(t => type.includes(t)))
    return 'worn by';
  return 'showcased/held by';
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
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
  const [scenePopoverOpen, setScenePopoverOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<UserProduct | null>(null);
  const [productPopoverOpen, setProductPopoverOpen] = useState(false);
  const [productSourced, setProductSourced] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [stylePresets, setStylePresets] = useState<string[]>([]);
  const [selectedBrandProfile, setSelectedBrandProfile] = useState<BrandProfile | null>(null);
  const [brandProfilePopoverOpen, setBrandProfilePopoverOpen] = useState(false);
  const [negatives, setNegatives] = useState<string[]>([]);
  const [cameraStyle, setCameraStyle] = useState<'pro' | 'natural'>('pro');
  const [negativesPopoverOpen, setNegativesPopoverOpen] = useState(false);
  const [blockedEntries, setBlockedEntries] = useState<BlockedEntry[]>([]);
  const [showSceneHint, setShowSceneHint] = useState(false);
  const [framing, setFraming] = useState<FramingOption | null>(null);
  const [framingPopoverOpen, setFramingPopoverOpen] = useState(false);
  const [isPromptCollapsed, setIsPromptCollapsed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { balance, openBuyModal, setBalanceFromServer, refreshBalance } = useCredits();
  const { enqueue, activeJob, isEnqueuing, isProcessing, reset: resetQueue } = useGenerationQueue();
  const isLoading = isEnqueuing || isProcessing;
  const { user } = useAuth();

  // Pre-fill from Discover page URL params
  useEffect(() => {
    const p = searchParams.get('prompt');
    const r = searchParams.get('ratio');
    const q = searchParams.get('quality');
    const sceneParam = searchParams.get('scene');
    if (p) setPrompt(p);
    if (r && ['1:1', '3:4', '4:5', '9:16', '16:9'].includes(r)) {
      setAspectRatio(r as FreestyleAspectRatio);
    }
    if (q === 'high') setQuality('high');
    if (sceneParam) {
      const matchedScene = mockTryOnPoses.find((s) => s.poseId === sceneParam);
      if (matchedScene) {
        setSelectedScene(matchedScene);
        if (!localStorage.getItem('hideSceneAppliedHint')) {
          setShowSceneHint(true);
        }
      }
    }
    // Clean URL params after reading
    if (p || r || q || sceneParam) {
      setSearchParams({}, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const { images: savedImages, isLoading: isLoadingImages, saveImages, deleteImage, refreshImages, fetchNextPage, hasNextPage, isFetchingNextPage } = useFreestyleImages();
  const [isSaving, setIsSaving] = useState(false);

  // Auto-dismiss scene hint
  useEffect(() => {
    if (!showSceneHint) return;
    const timer = setTimeout(() => setShowSceneHint(false), 4000);
    return () => clearTimeout(timer);
  }, [showSceneHint]);

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

  const { data: brandProfiles = [], isLoading: isLoadingBrandProfiles } = useQuery({
    queryKey: ['brand-profiles', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BrandProfile[];
    },
    enabled: !!user?.id,
  });

  const hasModel = !!selectedModel;
  const hasScene = !!selectedScene;
  const creditCost = hasModel && hasScene
    ? imageCount * 15
    : hasModel
      ? imageCount * 12
      : imageCount * (quality === 'high' ? 10 : 4);
  const hasAssets = !!selectedProduct || !!selectedModel || !!selectedScene || !!sourceImage;
  const canSubmit = (prompt.trim().length > 0 || hasAssets) && !isLoading;
  const hasEnoughCredits = balance >= creditCost;
  const canGenerate = canSubmit && hasEnoughCredits;

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

  const handleFileDrop = useCallback(async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setSourceImagePreview(previewUrl);
    const base64 = await convertImageToBase64(previewUrl);
    setSourceImage(base64);
    setSelectedProduct(null);
    setProductSourced(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

    // Auto-detect framing
    const { detectDefaultFraming } = await import('@/lib/framingUtils');
    const detected = detectDefaultFraming(product.product_type, product.tags || []);
    if (detected) setFraming(detected);
  }, [productSourced]);

  // Helper: upload a base64 image to generation-inputs bucket, return storage path URL
  const uploadImageToStorage = useCallback(async (base64Data: string, prefix: string): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    // If it's already a URL (not base64), return as-is
    if (!base64Data.startsWith('data:')) return base64Data;

    // Convert base64 to blob
    const [header, raw] = base64Data.split(',');
    const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
    const byteString = atob(raw);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: mime });

    const ext = mime.split('/')[1] || 'png';
    const fileName = `${user.id}/${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { data, error } = await supabase.storage
      .from('generation-inputs')
      .upload(fileName, blob, { cacheControl: '3600', upsert: false });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    // Use signed URL since bucket is now private
    const { data: signedData, error: signError } = await supabase.storage
      .from('generation-inputs')
      .createSignedUrl(data.path, 3600);

    if (signError || !signedData?.signedUrl) throw new Error('Failed to create signed URL');
    return signedData.signedUrl;
  }, [user]);

  const handleGenerate = useCallback(async () => {
    if (!canSubmit) return;
    if (!hasEnoughCredits) {
      openBuyModal();
      return;
    }

    // Upload images to storage instead of embedding base64 in payload
    let sourceImageUrl: string | undefined;
    if (sourceImage) {
      try {
        sourceImageUrl = await uploadImageToStorage(sourceImage, 'source');
      } catch (err) {
        console.error('Failed to upload source image:', err);
        const { toast } = await import('sonner');
        toast.error('Failed to upload source image. Please try again.');
        return;
      }
    }

    let modelImageUrl: string | undefined;
    if (selectedModel) {
      try {
        const modelImg = await convertImageToBase64(selectedModel.previewUrl);
        modelImageUrl = await uploadImageToStorage(modelImg, 'model');
      } catch (err) {
        console.error('Failed to upload model image:', err);
        // Fall back to URL if it's already https
        if (selectedModel.previewUrl.startsWith('https://')) {
          modelImageUrl = selectedModel.previewUrl;
        }
      }
    }

    let sceneImageUrl: string | undefined;
    if (selectedScene) {
      try {
        const sceneImg = await convertImageToBase64(selectedScene.previewUrl);
        sceneImageUrl = await uploadImageToStorage(sceneImg, 'scene');
      } catch (err) {
        console.error('Failed to upload scene image:', err);
        if (selectedScene.previewUrl.startsWith('https://')) {
          sceneImageUrl = selectedScene.previewUrl;
        }
      }
    }

    // Auto-build prompt from assets if user left it empty
    let basePrompt = prompt.trim();
    if (!basePrompt) {
      const parts: string[] = [];

      // Product context
      if (selectedProduct) {
        parts.push(`High-end product photography of "${selectedProduct.title}"`);
        if (selectedProduct.product_type) parts.push(`(${selectedProduct.product_type})`);
      } else if (sourceImage) {
        parts.push("Professional photo based on the provided reference image");
      }

      // Model context
      if (selectedModel) {
        const modelDesc = [selectedModel.gender, selectedModel.bodyType, selectedModel.ethnicity]
          .filter(Boolean).join(', ');
        if (selectedProduct) {
          const interaction = getProductModelInteraction(selectedProduct.product_type);
          parts.push(`${interaction} a ${modelDesc} model`);
        } else {
          parts.push(`Portrait of a ${modelDesc} model`);
        }
      }

      // Scene context
      if (selectedScene) {
        parts.push(`set in a ${selectedScene.name} environment`);
        if (selectedScene.promptHint) parts.push(`— ${selectedScene.promptHint}`);
      }

      // Brand tone hint
      if (selectedBrandProfile?.tone) {
        parts.push(`with a ${selectedBrandProfile.tone} visual tone`);
      }

      // Fallback
      if (parts.length === 0) {
        parts.push("Professional commercial photography");
      }

      basePrompt = parts.join(' ');
    }

    // Scene instructions are handled by polishUserPrompt in the backend
    // No need to duplicate them here — avoids conflicting scene directives
    const finalPrompt = basePrompt;

    // Build model text context
    let modelContext: string | undefined;
    if (selectedModel) {
      modelContext = `${selectedModel.gender}, ${selectedModel.bodyType} build, ${selectedModel.ethnicity}`;
    }

    // Gather active style preset keywords
    const activePresetKeywords = stylePresets
      .map(id => STYLE_PRESETS.find(p => p.id === id)?.keywords)
      .filter(Boolean) as string[];

    // Build brand profile context for the edge function
    const brandContext = selectedBrandProfile ? {
      tone: selectedBrandProfile.tone,
      colorFeel: selectedBrandProfile.color_temperature,
      doNotRules: selectedBrandProfile.do_not_rules,
      brandKeywords: (selectedBrandProfile as any).brand_keywords || [],
      colorPalette: (selectedBrandProfile as any).color_palette || [],
      targetAudience: (selectedBrandProfile as any).target_audience || '',
    } : undefined;

    // Build the payload for the queue — URLs instead of base64
    const queuePayload = {
      prompt: finalPrompt,
      sourceImage: sourceImageUrl,
      modelImage: modelImageUrl,
      sceneImage: sceneImageUrl,
      aspectRatio,
      imageCount,
      quality,
      polishPrompt,
      modelContext,
      stylePresets: activePresetKeywords.length > 0 ? activePresetKeywords : undefined,
      brandProfile: brandContext,
      negatives: negatives.length > 0 ? negatives : undefined,
      cameraStyle,
      framing: framing || undefined,
      productDimensions: selectedProduct?.dimensions || undefined,
    };

    // Enqueue via priority queue
    const enqueueResult = await enqueue({
      jobType: 'freestyle',
      payload: queuePayload,
      imageCount,
      quality,
    }, {
      imageCount,
      quality,
      hasModel: !!selectedModel,
      hasScene: !!selectedScene,
      hasProduct: !!selectedProduct || !!sourceImage,
    });

    if (enqueueResult) {
      // Update balance from server response
      setBalanceFromServer(enqueueResult.newBalance);
    }
  }, [canSubmit, hasEnoughCredits, openBuyModal, selectedModel, selectedScene, selectedProduct, selectedBrandProfile, negatives, enqueue, prompt, sourceImage, aspectRatio, imageCount, quality, polishPrompt, setBalanceFromServer, saveImages, stylePresets, uploadImageToStorage, user]);

  // Stable refs for callbacks so completion effect doesn't depend on form state
  const refreshImagesRef = useRef(refreshImages);
  const refreshBalanceRef = useRef(refreshBalance);
  const resetQueueRef = useRef(resetQueue);
  const promptRef = useRef(prompt);
  useEffect(() => { refreshImagesRef.current = refreshImages; }, [refreshImages]);
  useEffect(() => { refreshBalanceRef.current = refreshBalance; }, [refreshBalance]);
  useEffect(() => { resetQueueRef.current = resetQueue; }, [resetQueue]);
  useEffect(() => { promptRef.current = prompt; }, [prompt]);

  // Watch for queue job completion to save images
  const prevJobStatusRef = useRef<string | null>(null);
  useEffect(() => {
    if (!activeJob) return;
    const prevStatus = prevJobStatusRef.current;
    prevJobStatusRef.current = activeJob.status;

    if (activeJob.status === 'completed' && prevStatus !== 'completed') {
      const result = activeJob.result as { images?: string[]; contentBlocked?: boolean; blockReason?: string } | null;
      if (result?.contentBlocked) {
        setBlockedEntries(prev => [{
          id: crypto.randomUUID(),
          prompt: promptRef.current,
          reason: result.blockReason || 'This prompt was flagged by our content safety system.',
        }, ...prev]);
        resetQueueRef.current();
      } else {
        // Delay to ensure DB write has propagated, then refetch
        setTimeout(() => {
          refreshImagesRef.current();
          refreshBalanceRef.current();
          resetQueueRef.current();
        }, 800);
      }
    }

    if (activeJob.status === 'failed' && prevStatus !== 'failed') {
      refreshBalanceRef.current(); // Credits were refunded server-side
      resetQueueRef.current();
    }
  }, [activeJob]);

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

  const handleDismissBlocked = useCallback((id: string) => {
    setBlockedEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const handleEditBlockedPrompt = useCallback((blockedPrompt: string) => {
    setPrompt(blockedPrompt);
  }, []);

  const hasImages = savedImages.length > 0;
  const hasBlocked = blockedEntries.length > 0;
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
    hasAssets,
    sourceImagePreview,
    onUploadClick: () => fileInputRef.current?.click(),
    onRemoveImage: removeSourceImage,
    onGenerate: handleGenerate,
    canGenerate: canSubmit,
    creditBalance: balance,
    isLoading,
    progress: isLoading ? 0 : 100,
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
    onQualityChange: setQuality,
    polishPrompt,
    onPolishChange: setPolishPrompt,
    imageCount,
    onImageCountChange: setImageCount,
    stylePresets,
    onStylePresetsChange: setStylePresets,
    selectedBrandProfile,
    onBrandProfileSelect: setSelectedBrandProfile,
    brandProfilePopoverOpen,
    onBrandProfilePopoverChange: setBrandProfilePopoverOpen,
    brandProfiles,
    isLoadingBrandProfiles,
    onFileDrop: handleFileDrop,
    negatives,
    onNegativesChange: setNegatives,
    negativesPopoverOpen,
    onNegativesPopoverChange: setNegativesPopoverOpen,
    cameraStyle,
    onCameraStyleChange: setCameraStyle,
    framing,
    onFramingChange: setFraming,
    framingPopoverOpen,
    onFramingPopoverChange: setFramingPopoverOpen,
    isCollapsed: isPromptCollapsed,
    onToggleCollapse: () => setIsPromptCollapsed(prev => !prev),
  };

  return (
    <div className="freestyle-root relative -mx-4 sm:-mx-6 lg:-mx-8 -mb-4 sm:-mb-6 lg:-mb-8 -mt-24 lg:-mt-8 bg-muted/30 overflow-hidden flex flex-col lg:block" style={{ minHeight: '100%' }}>
      {/* On lg+ the sidebar is beside content so we reclaim the full height */}
      <style>{`@media (min-width: 1024px) { .freestyle-root { height: 100dvh !important; margin-top: -2rem; } }`}</style>
      <style>{`@media (max-width: 1023px) { .freestyle-root { height: 100dvh !important; } }`}</style>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      {/* Scrollable content area */}
      <div className="flex-1 lg:h-full overflow-y-auto pt-[5rem] lg:pt-3 pb-4 lg:pb-72">
        {showLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-muted-foreground/40 animate-spin" />
          </div>
        ) : hasImages || isLoading || isProcessing || hasBlocked ? (
          <>
            {activeJob && isProcessing && (
              <div className="px-1 pt-1">
                <QueuePositionIndicator job={activeJob} onCancel={() => resetQueue()} />
              </div>
            )}
            <FreestyleGallery
              images={galleryImages}
              onDownload={handleDownload}
              onExpand={openLightbox}
              onDelete={handleDelete}
              onCopyPrompt={setPrompt}
              generatingCount={(isLoading || isSaving || isProcessing) ? imageCount : 0}
              generatingProgress={isSaving ? 100 : 0}
              generatingAspectRatio={aspectRatio}
              blockedEntries={blockedEntries}
              onDismissBlocked={handleDismissBlocked}
              onEditBlockedPrompt={handleEditBlockedPrompt}
              onLoadMore={hasNextPage ? fetchNextPage : undefined}
              hasMore={hasNextPage}
              isFetchingMore={isFetchingNextPage}
            />
          </>
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

      {/* Prompt panel - single instance for all screen sizes */}
      <div className="flex-shrink-0 relative z-20 -mt-4 lg:mt-0 lg:absolute lg:bottom-0 lg:left-0 lg:right-0">
        {/* Desktop gradient fade */}
        <div className="hidden lg:block absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-muted/80 via-muted/40 to-transparent pointer-events-none z-10" />
        <div className="lg:px-4 lg:sm:px-8 lg:pb-3 lg:sm:pb-5 lg:pt-2 lg:pointer-events-none">
          <div className="lg:max-w-3xl lg:mx-auto lg:pointer-events-auto relative">
            {showSceneHint && selectedScene && (
              <div className="absolute -top-14 left-0 right-0 flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-lg">
                  <Camera className="w-3.5 h-3.5" />
                  Scene applied: {selectedScene.name}
                  <button
                    onClick={() => {
                      localStorage.setItem('hideSceneAppliedHint', 'true');
                      setShowSceneHint(false);
                    }}
                    className="ml-1 opacity-70 hover:opacity-100 text-[10px] underline underline-offset-2"
                  >
                    Don't show again
                  </button>
                  <button onClick={() => setShowSceneHint(false)} className="ml-0.5 opacity-70 hover:opacity-100">
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
            <FreestylePromptPanel {...panelProps} />
          </div>
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
          onDelete={(idx) => {
            handleDelete(savedImages[idx].id);
            setLightboxOpen(false);
          }}
          onCopyPrompt={(idx) => {
            setPrompt(savedImages[idx].prompt);
            setLightboxOpen(false);
            import('sonner').then(({ toast }) => toast.success('Prompt copied to editor'));
          }}
        />
      )}
    </div>
  );
}
