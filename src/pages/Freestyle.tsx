import { useState, useRef, useCallback, useEffect } from 'react';
import { getExtensionFromContentType } from '@/lib/dropDownload';
import { SEOHead } from '@/components/SEOHead';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Camera, X as XIcon, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LibraryDetailModal } from '@/components/app/LibraryDetailModal';
import type { LibraryItem } from '@/components/app/LibraryImageCard';
import { QueuePositionIndicator } from '@/components/app/QueuePositionIndicator';
import { LowCreditsBanner } from '@/components/app/LowCreditsBanner';
import { FreestyleGallery } from '@/components/app/freestyle/FreestyleGallery';
import type { BlockedEntry, FailedEntry } from '@/components/app/freestyle/FreestyleGallery';
import { FreestylePromptPanel } from '@/components/app/freestyle/FreestylePromptPanel';
import { FreestyleGuide, GUIDE_STEPS } from '@/components/app/freestyle/FreestyleGuide';
import type { GuideStepKey } from '@/components/app/freestyle/FreestyleGuide';
import { useFreestyleImages } from '@/hooks/useFreestyleImages';
import { useGenerationQueue } from '@/hooks/useGenerationQueue';

import { useCredits } from '@/contexts/CreditContext';
import { useAuth } from '@/contexts/AuthContext';
import { convertImageToBase64 } from '@/lib/imageUtils';
import { mockTryOnPoses } from '@/data/mockData';
import { useHiddenScenes } from '@/hooks/useHiddenScenes';
import { useCustomScenes } from '@/hooks/useCustomScenes';
import { supabase } from '@/integrations/supabase/client';
import type { ModelProfile, TryOnPose, FramingOption } from '@/types';
import type { FreestyleAspectRatio } from '@/components/app/freestyle/FreestyleSettingsChips';
import type { ImageRole, EditIntent } from '@/components/app/freestyle/ImageRoleSelector';
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
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceImagePreview, setSourceImagePreview] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelProfile | null>(null);
  const [selectedScene, setSelectedScene] = useState<TryOnPose | null>(null);
  const [aspectRatio, setAspectRatio] = useState<FreestyleAspectRatio>('1:1');
  const [quality, setQuality] = useState<'standard' | 'high'>('standard');
  
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
  const [scenePopoverOpen, setScenePopoverOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<UserProduct | null>(null);
  const [productPopoverOpen, setProductPopoverOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [shareImageIndex] = useState<number | null>(null);
  const [selectedBrandProfile, setSelectedBrandProfile] = useState<BrandProfile | null>(null);
  const [brandProfilePopoverOpen, setBrandProfilePopoverOpen] = useState(false);
  const [negatives, setNegatives] = useState<string[]>([]);
  const [cameraStyle, setCameraStyle] = useState<'pro' | 'natural'>('pro');
  const [negativesPopoverOpen, setNegativesPopoverOpen] = useState(false);
  const [blockedEntries, setBlockedEntries] = useState<BlockedEntry[]>([]);
  const [failedEntries, setFailedEntries] = useState<FailedEntry[]>([]);
  const [showSceneHint, setShowSceneHint] = useState(false);
  const [framing, setFraming] = useState<FramingOption | null>(null);
  const [framingPopoverOpen, setFramingPopoverOpen] = useState(false);
  const [isPromptCollapsed, setIsPromptCollapsed] = useState(false);
  const [imageRole, setImageRole] = useState<ImageRole>('edit');
  const [editIntent, setEditIntent] = useState<EditIntent[]>([]);
  const [workflowJustCompleted, setWorkflowJustCompleted] = useState(false);
  const prevActiveJobRef = useRef<typeof activeJob>(null);

  // First-time guide state
  const [showGuide, setShowGuide] = useState(() => !localStorage.getItem('freestyle_guide_dismissed'));
  const [guideStep, setGuideStep] = useState(0);

  const handleGuideNext = useCallback(() => {
    if (guideStep >= GUIDE_STEPS.length - 1) {
      setShowGuide(false);
      localStorage.setItem('freestyle_guide_dismissed', 'true');
    } else {
      setGuideStep(s => s + 1);
    }
  }, [guideStep]);

  const handleGuideDismiss = useCallback(() => {
    setShowGuide(false);
    localStorage.setItem('freestyle_guide_dismissed', 'true');
  }, []);

  const handleReset = useCallback(() => {
    setPrompt('');
    setSourceImage(null);
    setSourceImagePreview(null);
    setSelectedModel(null);
    setSelectedScene(null);
    setSelectedProduct(null);
    setAspectRatio('1:1');
    setQuality('standard');
    setNegatives([]);
    setCameraStyle('pro');
    setFraming(null);
    setSelectedBrandProfile(null);
    setImageRole('edit');
    setEditIntent([]);
  }, []);

  const isDirty = prompt !== '' || sourceImage !== null || sourceImagePreview !== null || selectedModel !== null || selectedScene !== null || selectedProduct !== null || aspectRatio !== '1:1' || quality !== 'standard' || negatives.length > 0 || cameraStyle !== 'pro' || framing !== null || selectedBrandProfile !== null || imageRole !== 'edit' || editIntent.length > 0;

  const highlightedChip: GuideStepKey | null = showGuide ? GUIDE_STEPS[guideStep]?.key ?? null : null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const promptRef = useRef(prompt);
  const [searchParams, setSearchParams] = useSearchParams();
  const { balance, openBuyModal, setBalanceFromServer, refreshBalance, plan } = useCredits();
  const { filterVisible } = useHiddenScenes();
  const { asPoses: customScenePoses } = useCustomScenes();
  const handleContentBlocked = useCallback((jobId: string, reason: string) => {
    setBlockedEntries(prev => [{
      id: crypto.randomUUID(),
      prompt: promptRef.current,
      reason,
    }, ...prev]);
  }, []);
  const handleGenerationFailed = useCallback((jobId: string, message: string, errorType: 'timeout' | 'rate_limit' | 'generic') => {
    setFailedEntries(prev => [{
      id: crypto.randomUUID(),
      prompt: promptRef.current,
      errorType,
      message,
    }, ...prev]);
  }, []);

  const { enqueue, activeJob, isEnqueuing, isProcessing, reset: resetQueue, cancel: cancelQueue } = useGenerationQueue({
    jobTypes: ['freestyle'],
    onContentBlocked: handleContentBlocked,
    onGenerationFailed: handleGenerationFailed,
    onCreditRefresh: refreshBalance,
  });
  const [isUploading, setIsUploading] = useState(false);
  const isLoading = isEnqueuing || isProcessing || isUploading;
  const { user } = useAuth();

  // Detect workflow job completion to show "View Library" banner
  useEffect(() => {
    const prev = prevActiveJobRef.current;
    if (prev && prev.job_type === 'workflow' && prev.status !== 'completed' && !activeJob) {
      setWorkflowJustCompleted(true);
      const timer = setTimeout(() => setWorkflowJustCompleted(false), 15000);
      return () => clearTimeout(timer);
    }
    prevActiveJobRef.current = activeJob;
  }, [activeJob]);

  // Pre-fill from Discover page URL params
  const initialSceneParam = useRef(searchParams.get('scene'));
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
      const matchedScene = filterVisible(mockTryOnPoses).find((s) => s.poseId === sceneParam);
      if (matchedScene) {
        setSelectedScene(matchedScene);
        initialSceneParam.current = null;
        if (!localStorage.getItem('hideSceneAppliedHint')) {
          setShowSceneHint(true);
        }
      }
    }
    if (p || r || q || sceneParam) {
      setSearchParams({}, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Deferred custom scene matching (custom scenes load async)
  useEffect(() => {
    const sceneParam = initialSceneParam.current;
    if (!sceneParam || !sceneParam.startsWith('custom-') || customScenePoses.length === 0) return;
    const matched = customScenePoses.find((s) => s.poseId === sceneParam);
    if (matched) {
      setSelectedScene(matched);
      initialSceneParam.current = null;
      if (!localStorage.getItem('hideSceneAppliedHint')) {
        setShowSceneHint(true);
      }
    }
  }, [customScenePoses]); // eslint-disable-line react-hooks/exhaustive-deps
  const { images: savedImages, isLoading: isLoadingImages, saveImages, deleteImage, refreshImages, fetchNextPage, hasNextPage, isFetchingNextPage } = useFreestyleImages();
  const [isSaving, setIsSaving] = useState(false);

  // Auto-refresh images while processing to self-heal stuck queue state
  const imageCountRef = useRef(savedImages.length);
  useEffect(() => {
    imageCountRef.current = savedImages.length;
  }, [savedImages.length]);

  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(async () => {
      await refreshImages();
      setTimeout(() => {}, 500);
    }, 30_000);
    return () => clearInterval(interval);
  }, [isProcessing, refreshImages]);

  // Detect new images arriving while processing → force-reset queue
  useEffect(() => {
    if (!isProcessing) return;
    if (savedImages.length > imageCountRef.current) {
      console.warn('[freestyle] New images detected while still processing — resetting queue');
      resetQueue();
    }
  }, [savedImages.length, isProcessing, resetQueue]);

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

  // Track which images are currently being upscaled
  const { data: upscalingSourceIds = new Set<string>() } = useQuery({
    queryKey: ['upscaling-jobs', user?.id],
    queryFn: async () => {
      if (!user?.id) return new Set<string>();
      const { data } = await supabase
        .from('generation_queue')
        .select('payload')
        .eq('user_id', user.id)
        .eq('job_type', 'upscale')
        .in('status', ['queued', 'processing']);
      if (!data || data.length === 0) return new Set<string>();
      const ids = new Set<string>();
      for (const row of data) {
        const payload = row.payload as Record<string, unknown> | null;
        const sourceId = payload?.sourceId as string | undefined;
        if (sourceId) ids.add(sourceId);
      }
      return ids;
    },
    enabled: !!user?.id,
    refetchInterval: 4000,
  });

  const hasModel = !!selectedModel;
  const hasScene = !!selectedScene;
  const creditCost = (hasModel || hasScene || quality === 'high') ? 6 : 4;
  const hasAssets = !!selectedProduct || !!selectedModel || !!selectedScene || !!sourceImage;
  const canSubmit = (prompt.trim().length > 0 || hasAssets) && !isLoading;
  const hasEnoughCredits = balance >= creditCost;
  const canGenerate = canSubmit;

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setSourceImagePreview(previewUrl);
    const base64 = await convertImageToBase64(previewUrl);
    setSourceImage(base64);
  }, []);

  const handleFileDrop = useCallback(async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setSourceImagePreview(previewUrl);
    const base64 = await convertImageToBase64(previewUrl);
    setSourceImage(base64);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const removeSourceImage = useCallback(() => {
    setSourceImage(null);
    setSourceImagePreview(null);
    setImageRole('edit');
    setEditIntent([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleProductSelect = useCallback(async (product: UserProduct | null) => {
    if (!product) {
      setSelectedProduct(null);
      return;
    }
    setSelectedProduct(product);

    const { detectDefaultFraming } = await import('@/lib/framingUtils');
    const detected = detectDefaultFraming(product.product_type, product.tags || []);
    if (detected) setFraming(detected);
  }, []);

  // Helper: upload a base64 image to generation-inputs bucket, return storage path URL
  const uploadImageToStorage = useCallback(async (base64Data: string, prefix: string): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    if (!base64Data.startsWith('data:')) return base64Data;

    const response = await fetch(base64Data);
    const blob = await response.blob();

    const ext = (blob.type.split('/')[1]) || 'png';
    const fileName = `${user.id}/${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { data, error } = await supabase.storage
      .from('generation-inputs')
      .upload(fileName, blob, { cacheControl: '3600', upsert: false });

    if (error) throw new Error(`Upload failed: ${error.message}`);

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
    setIsUploading(true);
    try {

    let sourceImageUrl: string | undefined;
    if (sourceImage) {
      try {
        sourceImageUrl = await uploadImageToStorage(sourceImage, 'source');
      } catch (err) {
        console.error('Failed to upload source image:', err);
        toast.error('Failed to upload source image. Please try again.');
        return;
      }
    }

    let productImageUrl: string | undefined;
    if (selectedProduct) {
      try {
        productImageUrl = selectedProduct.image_url.startsWith('data:')
          ? await uploadImageToStorage(selectedProduct.image_url, 'product')
          : selectedProduct.image_url;
      } catch (err) {
        console.error('Failed to upload product image:', err);
      }
    }

    let modelImageUrl: string | undefined;
    if (selectedModel) {
      modelImageUrl = selectedModel.previewUrl;
    }

    let sceneImageUrl: string | undefined;
    if (selectedScene && selectedScene.poseId !== 'scene_038') {
      sceneImageUrl = selectedScene.previewUrl;
    }

    // Auto-build prompt from assets if user left it empty
    let basePrompt = prompt.trim();
    if (!basePrompt) {
      const parts: string[] = [];

      // Edit mode: build prompt from edit intents
      if (sourceImage && imageRole === 'edit') {
        const effectiveIntents = editIntent.length > 0 ? editIntent : ['enhance'];
        const intentPhrases: Record<string, string> = {
          replace_product: 'Replace the product in this image with a new one',
          change_background: 'Change the background/environment while keeping the subject',
          change_model: 'Replace the person while preserving composition and product placement',
          enhance: 'Improve image quality, lighting, and details without changing content',
        };
        parts.push(effectiveIntents.map(i => intentPhrases[i] || i).join('. '));
      } else if (sourceImage && imageRole === 'product') {
        parts.push("High-end product photography featuring the item shown in the uploaded image. Use a fresh angle, creative composition, and professional lighting");
      } else if (sourceImage && imageRole === 'model') {
        parts.push("Professional portrait photography using the person from the uploaded image as the model");
      } else if (sourceImage && imageRole === 'scene') {
        parts.push("Professional photography set in the environment shown in the uploaded image");
      } else if (selectedProduct) {
        parts.push(`High-end product photography of "${selectedProduct.title}"`);
        if (selectedProduct.product_type) parts.push(`(${selectedProduct.product_type})`);
      } else if (sourceImage) {
        parts.push("Create a new professional product photograph featuring the item shown in the reference image. Use a fresh angle, creative composition, and professional lighting");
      }

      if (selectedModel) {
        const modelDesc = [selectedModel.gender, selectedModel.bodyType, selectedModel.ethnicity]
          .filter(Boolean).join(', ');
        if (selectedProduct || (sourceImage && imageRole === 'product')) {
          const interaction = selectedProduct ? getProductModelInteraction(selectedProduct.product_type) : 'showcased/held by';
          parts.push(`${interaction} a ${modelDesc} model`);
        } else {
          parts.push(`Portrait of a ${modelDesc} model`);
        }
      }

      if (selectedScene) {
        parts.push(`set in a ${selectedScene.name} environment`);
        if (selectedScene.promptHint) parts.push(`— ${selectedScene.promptHint}`);
      }

      if (selectedBrandProfile?.tone) {
        parts.push(`with a ${selectedBrandProfile.tone} visual tone`);
      }

      if (parts.length === 0) {
        parts.push("Professional commercial photography");
      }

      basePrompt = parts.join(' ');
    }

    const finalPrompt = basePrompt;

    let modelContext: string | undefined;
    if (selectedModel) {
      modelContext = `${selectedModel.gender}, ${selectedModel.bodyType} build, ${selectedModel.ethnicity}`;
    }

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
      userPrompt: prompt.trim() || null,
      sourceImage: sourceImageUrl,
      productImage: productImageUrl,
      modelImage: modelImageUrl,
      sceneImage: sceneImageUrl,
      aspectRatio,
      imageCount: 1,
      quality,
      polishPrompt: true, // Always polish — toggle removed from UI
      modelContext,
      brandProfile: brandContext,
      negatives: negatives.length > 0 ? negatives : undefined,
      cameraStyle,
      framing: framing || undefined,
      productDimensions: selectedProduct?.dimensions || undefined,
      sceneId: selectedScene?.poseId || undefined,
      imageRole: sourceImage ? imageRole : undefined,
      editIntent: sourceImage && imageRole === 'edit'
        ? (editIntent.length > 0 ? editIntent : ['enhance'])
        : undefined,
    };

    // Enqueue via priority queue
    const enqueueResult = await enqueue({
      jobType: 'freestyle',
      payload: queuePayload,
      imageCount: 1,
      quality,
    }, {
      imageCount: 1,
      quality,
      hasModel: !!selectedModel,
      hasScene: !!selectedScene,
      hasProduct: !!selectedProduct || !!sourceImage,
    });

    if (enqueueResult) {
      setBalanceFromServer(enqueueResult.newBalance);
    }
    } finally {
      setIsUploading(false);
    }
  }, [canSubmit, hasEnoughCredits, openBuyModal, selectedModel, selectedScene, selectedProduct, selectedBrandProfile, negatives, enqueue, prompt, sourceImage, aspectRatio, quality, setBalanceFromServer, saveImages, uploadImageToStorage, user]);

  // Stable refs for callbacks so completion effect doesn't depend on form state
  const refreshImagesRef = useRef(refreshImages);
  const refreshBalanceRef = useRef(refreshBalance);
  const resetQueueRef = useRef(resetQueue);
  useEffect(() => { promptRef.current = prompt; }, [prompt]);
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
        refreshBalanceRef.current();
        resetQueueRef.current();
        toast('Credits refunded', { description: 'Your prompt was flagged — credits have been returned to your balance.' });
      } else {
        setTimeout(() => {
          refreshImagesRef.current();
          refreshBalanceRef.current();
          resetQueueRef.current();
        }, 800);
      }
    }

    if (activeJob.status === 'failed' && prevStatus !== 'failed') {
      refreshBalanceRef.current();
      resetQueueRef.current();
    }
  }, [activeJob]);

  const handleDownload = useCallback(async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const contentType = response.headers.get('content-type');
      const ext = getExtensionFromContentType(contentType);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `freestyle-${index + 1}${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
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

  const handleDismissFailed = useCallback((id: string) => {
    setFailedEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const handleRetryFailed = useCallback((id: string, failedPrompt: string) => {
    setFailedEntries(prev => prev.filter(e => e.id !== id));
    setPrompt(failedPrompt);
    setIsPromptCollapsed(false);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }, []);

  const hasImages = savedImages.length > 0;
  const hasBlocked = blockedEntries.length > 0 || failedEntries.length > 0;
  const showLoading = isLoadingImages && !hasImages;

  const galleryImages = savedImages.map(img => ({
    id: img.id,
    url: img.url,
    prompt: img.prompt,
    userPrompt: img.userPrompt,
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
    highlightedChip,
    onReset: handleReset,
    isDirty,
    imageRole,
    onImageRoleChange: setImageRole,
    editIntent,
    onEditIntentChange: setEditIntent,
    disabledChips: sourceImagePreview ? {
      product: imageRole === 'product',
      model: imageRole === 'model',
      scene: imageRole === 'scene',
    } : undefined,
  };

  return (
    <div className="freestyle-root relative -mx-4 sm:-mx-6 lg:-mx-8 -mb-4 sm:-mb-6 lg:-mb-8 -mt-24 lg:-mt-8 bg-muted/30 overflow-hidden flex flex-col lg:block" style={{ minHeight: '100%' }}>
      <SEOHead title="Freestyle Studio — VOVV AI" description="Create AI product photography with freestyle prompts." noindex />
      <style>{`@media (min-width: 1024px) { .freestyle-root { height: 100dvh !important; margin-top: -2rem; } }`}</style>
      <style>{`@media (max-width: 1023px) { .freestyle-root { height: 100dvh !important; } }`}</style>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      {/* Scrollable content area */}
      <div className="flex-1 lg:h-full overflow-y-auto pt-[5rem] lg:pt-3 pb-4 lg:pb-72">
        <div className="px-3 lg:px-1">
          <LowCreditsBanner />
        </div>
        {showLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-muted-foreground/40 animate-spin" />
          </div>
        ) : hasImages || isLoading || isProcessing || hasBlocked ? (
          <>
            {activeJob && isProcessing && (
              <div className="px-3 lg:px-1 pt-1 pb-2">
                {activeJob.job_type === 'workflow' ? (
                  <div className="rounded-xl bg-card border border-border/60 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">Generating images…</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Results will appear in your Library when ready
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="shrink-0 gap-1 text-xs text-muted-foreground hover:text-foreground" onClick={() => navigate('/app/workflows')}>
                        Workflows <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="px-4 pb-3">
                      <Progress value={(() => {
                        const elapsed = (Date.now() - new Date(activeJob.created_at).getTime()) / 1000;
                        return Math.min(95, (elapsed / 120) * 100);
                      })()} className="h-1" />
                    </div>
                  </div>
                ) : (
                  <QueuePositionIndicator job={activeJob} onCancel={() => cancelQueue()} />
                )}
              </div>
            )}
            {workflowJustCompleted && (
              <div className="px-3 lg:px-1 pt-1 pb-2">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-emerald-500/20 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Generation complete</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Your images are ready in the Library</p>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0 gap-1.5 text-xs" onClick={() => navigate('/app/library')}>
                    View Library <ArrowRight className="w-3 h-3" />
                  </Button>
                  <button className="shrink-0 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setWorkflowJustCompleted(false)}>
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
            <FreestyleGallery
              images={galleryImages}
              onDownload={handleDownload}
              onExpand={openLightbox}
              onDelete={handleDelete}
              onCopyPrompt={setPrompt}
              generatingCount={(isLoading || isSaving || isProcessing) ? 1 : 0}
              generatingProgress={isSaving ? 100 : 0}
              generatingAspectRatio={aspectRatio}
              blockedEntries={blockedEntries}
              onDismissBlocked={handleDismissBlocked}
              onEditBlockedPrompt={handleEditBlockedPrompt}
              failedEntries={failedEntries}
              onDismissFailed={handleDismissFailed}
              onRetryFailed={handleRetryFailed}
              onLoadMore={hasNextPage ? fetchNextPage : undefined}
              hasMore={hasNextPage}
              isFetchingMore={isFetchingNextPage}
              upscalingSourceIds={upscalingSourceIds}
            />
          </>
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center h-full px-4 sm:px-6">
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
          <div className="lg:max-w-3xl lg:mx-auto lg:pointer-events-auto relative z-20">
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
            {showGuide && (
              <div className="mb-3 flex justify-center lg:justify-start">
                <FreestyleGuide
                  currentStep={guideStep}
                  onNext={handleGuideNext}
                  onDismiss={handleGuideDismiss}
                />
              </div>
            )}
            <FreestylePromptPanel {...panelProps} />
          </div>
        </div>
      </div>

      {savedImages.length > 0 && lightboxOpen && savedImages[lightboxIndex] && (() => {
        const img = savedImages[lightboxIndex];
        const displayPrompt = img.userPrompt || img.prompt;
        const libraryItem: LibraryItem = {
          id: img.id,
          imageUrl: img.url,
          source: 'freestyle',
          label: displayPrompt || 'Freestyle',
          prompt: displayPrompt,
          date: '',
          createdAt: '',
          aspectRatio: img.aspectRatio || '1:1',
          quality: 'standard',
        };
        return (
          <LibraryDetailModal
            open={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            item={libraryItem}
            isUpscaling={upscalingSourceIds.has(img.id)}
          />
        );
      })()}
    </div>
  );
}
