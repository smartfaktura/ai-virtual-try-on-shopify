import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { getExtensionFromContentType, downloadDropAsZip } from '@/lib/dropDownload';
import { SEOHead } from '@/components/SEOHead';
import { useNavigate, useSearchParams, useParams, Link } from 'react-router-dom';
import { useGenerationBatch } from '@/hooks/useGenerationBatch';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AddProductModal } from '@/components/app/AddProductModal';
import { Image, CheckCircle, Download, RefreshCw, Maximize2, X, User, List, Palette, Shirt, Upload as UploadIcon, Package, Loader2, Check, Sparkles, Ban, Info, Smartphone, Layers, AlertCircle, Lock, Search, LayoutGrid, ChevronDown, Clock } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';

import { ContextualFeedbackCard } from '@/components/app/ContextualFeedbackCard';

import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { ShimmerImage } from '@/components/ui/shimmer-image';

const teamAvatar = (file: string) => getOptimizedUrl(getLandingAssetUrl(`team/${file}`), { quality: 60 });
const avatarSophia = teamAvatar('avatar-sophia.jpg');
const avatarZara = teamAvatar('avatar-zara.jpg');
const avatarKenji = teamAvatar('avatar-kenji.jpg');
const avatarLuna = teamAvatar('avatar-luna.jpg');
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/app/PageHeader';
import { TemplatePreviewCard, getTemplateImage } from '@/components/app/TemplatePreviewCard';
import { ImageLightbox } from '@/components/app/ImageLightbox';
import { PublishModal } from '@/components/app/PublishModal';

import { TryOnConfirmModal } from '@/components/app/TryOnConfirmModal';

import { NoCreditsModal } from '@/components/app/NoCreditsModal';
import { useCredits } from '@/contexts/CreditContext';
import { PostGenerationUpgradeCard } from '@/components/app/PostGenerationUpgradeCard';
import { UpgradeValueDrawer } from '@/components/app/UpgradeValueDrawer';
import { useConversionState } from '@/hooks/useConversionState';
import { resolveUgcOutfitPhrase, resolveUgcPairPhrase, isWearingInteraction, detectProductSlot } from '@/lib/ugcOutfitPresets';
import { resolveConversionCategory } from '@/lib/conversionCopy';
import { useGenerationQueue } from '@/hooks/useGenerationQueue';
import { MAX_PRODUCTS_PER_BATCH } from '@/types/bulk';
const MAX_IMAGES_PER_JOB = 4;
const FREE_SCENE_LIMIT = 1;
const PAID_SCENE_LIMIT = 99;
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { QueuePositionIndicator } from '@/components/app/QueuePositionIndicator';
import { MultiProductProgressBanner } from '@/components/app/MultiProductProgressBanner';
import { AspectRatioSelector, AspectRatioMultiSelector } from '@/components/app/AspectRatioPreview';
import { RecentProductsList } from '@/components/app/RecentProductsList';
import { NegativesChipSelector } from '@/components/app/NegativesChipSelector';
import { ModelSelectorCard } from '@/components/app/ModelSelectorCard';
import { PoseSelectorCard } from '@/components/app/PoseSelectorCard';
import { GenerationModeToggle } from '@/components/app/GenerationModeToggle';
import { ModelFilterBar } from '@/components/app/ModelFilterBar';
import { PoseCategorySection } from '@/components/app/PoseCategorySection';
import { MissingRequestBanner } from '@/components/app/MissingRequestBanner';
import { TryOnPreview } from '@/components/app/TryOnPreview';
import { PopularCombinations, createPopularCombinations } from '@/components/app/PopularCombinations';
import { SourceTypeSelector } from '@/components/app/SourceTypeSelector';
import { UploadSourceCard } from '@/components/app/UploadSourceCard';
import { ProductAssignmentModal } from '@/components/app/ProductAssignmentModal';
import { ProductMultiSelect } from '@/components/app/ProductMultiSelect';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { injectActiveJob } from '@/lib/optimisticJobInjection';
import { enqueueWithRetry, isEnqueueError, sendWake, paceDelay } from '@/lib/enqueueGeneration';
import { gtmFirstGenerationStarted, isGtmDebugEnabled, safeLocalGet } from '@/lib/gtm';
import { convertImageToBase64 } from '@/lib/imageUtils';
import { mockProducts, mockTemplates, categoryLabels, mockModels, mockTryOnPoses, poseCategoryLabels } from '@/data/mockData';
import { useCustomModels } from '@/hooks/useCustomModels';
import { useUserModels } from '@/hooks/useUserModels';
import { useModelSortOrder } from '@/hooks/useModelSortOrder';

const SAMPLE_LISTING_PRODUCT: Product = {
  id: 'sample_listing_ring',
  title: 'Diamond Engagement Ring',
  vendor: 'Sample',
  productType: 'Jewelry',
  tags: ['ring', 'diamond', 'jewelry', 'engagement'],
  description: 'Pavé-set diamond engagement ring in white gold with signature ruby accent.',
  images: [{ id: 'img_sample_listing', url: '/images/samples/sample-ring.png' }],
  status: 'active',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const SAMPLE_TRYON_PRODUCT: import('@/types').Product = {
  id: 'sample_tryon_crop_top',
  title: 'Ribbed Crop Top',
  vendor: 'Sample',
  productType: 'Tops',
  tags: ['crop-top', 'ribbed', 'basics', 'white'],
  description: 'Classic ribbed crop top in white. Soft stretch fabric with a clean, minimal silhouette.',
  images: [{ id: 'img_sample_tryon', url: '/images/samples/sample-crop-top.png' }],
  status: 'active',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const SAMPLE_UGC_PRODUCT: Product = {
  id: 'sample_ugc_ice_roller',
  title: 'Ice Roller',
  vendor: 'Sample',
  productType: 'Skincare Tools',
  tags: ['ice-roller', 'skincare', 'beauty'],
  description: 'Cooling ice roller for face and body. Soothes skin and reduces puffiness.',
  images: [{ id: 'img_sample_ugc', url: '/images/samples/sample-ice-roller.png' }],
  status: 'active',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const SAMPLE_MIRROR_PRODUCT: Product = {
  id: 'sample_mirror_sweater',
  title: 'Ribbed Knit Sweater',
  vendor: 'Sample',
  productType: 'Knitwear',
  tags: ['sweater', 'knit', 'beige', 'cozy'],
  description: 'Chunky ribbed knit sweater in warm beige. Relaxed cropped fit.',
  images: [{ id: 'img_sample_mirror', url: '/images/samples/sample-sweater.png' }],
  status: 'active',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};
import { useHiddenScenes } from '@/hooks/useHiddenScenes';
import { useCustomScenes } from '@/hooks/useCustomScenes';
import { useSceneSortOrder } from '@/hooks/useSceneSortOrder';
import type { Product, Template, TemplateCategory, BrandTone, BackgroundStyle, AspectRatio, ImageQuality, GenerationMode, ModelProfile, TryOnPose, ModelGender, ModelBodyType, ModelAgeRange, PoseCategory, GenerationSourceType, ScratchUpload, FramingOption } from '@/types';
import { toast } from '@/lib/brandedToast';
import type { Workflow } from '@/types/workflow';
import type { BrandProfile } from '@/pages/BrandProfiles';
import type { Tables } from '@/integrations/supabase/types';
import { TryOnUploadGuide } from '@/components/app/TryOnUploadGuide';
import { FramingSelector, FramingMultiSelector } from '@/components/app/FramingSelector';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { detectDefaultFraming } from '@/lib/framingUtils';
import UpscaleSettingsPanel from '@/components/app/generate/UpscaleSettingsPanel';
import WorkflowSettingsPanel from '@/components/app/generate/WorkflowSettingsPanel';
import TryOnSettingsPanel from '@/components/app/generate/TryOnSettingsPanel';
type UserProduct = Tables<'user_products'>;

/** Upload local sample images (paths starting with /) to storage so the backend gets a public URL */
async function resolveProductImageUrl(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('/')) {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      // Upload to generation-inputs bucket
      const ext = url.split('.').pop() || 'png';
      const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      const fileName = `sample-products/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const byteString = atob(base64.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const file = new File([ab], fileName, { type: contentType });
      const { data, error } = await supabase.storage.from('generation-inputs').upload(fileName, file, { contentType, upsert: false });
      if (error) throw error;
      const { data: publicData } = supabase.storage.from('generation-inputs').getPublicUrl(data.path);
      return publicData.publicUrl;
    } catch (err) {
      console.error('[resolveProductImageUrl] Failed to upload sample image:', err);
      return url; // fallback to original
    }
  }
  return url;
}

const FLAT_LAY_AESTHETICS = [
  { id: 'minimal', label: 'Minimal', hint: 'clean, few props, whitespace' },
  { id: 'botanical', label: 'Botanical', hint: 'dried flowers, eucalyptus leaves, greenery accents' },
  { id: 'coffee-books', label: 'Coffee & Books', hint: 'coffee cup, open book pages' },
  { id: 'textured', label: 'Textured', hint: 'linen fabric, kraft paper, washi tape' },
  { id: 'soft-glam', label: 'Soft Glam', hint: 'silk ribbon, dried petals, soft fabric swatches' },
  { id: 'cozy', label: 'Cozy', hint: 'knit blanket, candle, warm tones' },
  { id: 'seasonal', label: 'Seasonal', hint: 'seasonal elements matching current time of year' },
];

type Step = 'source' | 'product' | 'upload' | 'library' | 'brand-profile' | 'interaction' | 'mode' | 'model' | 'pose' | 'template' | 'settings' | 'generating' | 'results';

// UGC Interaction options per product category (Selfie / UGC Set workflow)
type UgcInteractionOption = { id: string; label: string; description: string; phrase: string; emoji: string };
const UGC_INTERACTION_OPTIONS: Record<string, UgcInteractionOption[]> = {
  beauty: [
    { id: 'apply', label: 'Applying it', description: 'Putting it on skin / face', phrase: 'applying the product to their skin and showing the texture or finish', emoji: '💆' },
    { id: 'near-face', label: 'Holding near face', description: 'Bottle/tube up by the cheek', phrase: 'holding the product up close to their face so the packaging is clearly visible next to their skin', emoji: '🤳' },
    { id: 'texture', label: 'Showing the texture', description: 'On the back of the hand', phrase: 'showing the product texture or shade on the back of their hand toward the camera', emoji: '🖐️' },
    { id: 'packaging', label: 'Showing the packaging', description: 'Bottle / box hero shot', phrase: 'holding the product packaging up to the camera to show the label and design', emoji: '📦' },
  ],
  fragrance: [
    { id: 'spray', label: 'Spraying on wrist/neck', description: 'Mid-spritz moment', phrase: 'spraying the fragrance on their wrist or neck as if just applied', emoji: '💨' },
    { id: 'bottle', label: 'Holding the bottle', description: 'Near collarbone / chest', phrase: 'holding the fragrance bottle elegantly near their neck or collarbone', emoji: '🍾' },
    { id: 'packaging', label: 'Showing the packaging', description: 'Box + bottle to camera', phrase: 'holding the bottle and packaging up to the camera to show the design', emoji: '📦' },
  ],
  haircare: [
    { id: 'hair', label: 'Running through hair', description: 'Product going through strands', phrase: 'running the product through their hair naturally', emoji: '💇' },
    { id: 'near-hair', label: 'Holding near hair', description: 'Bottle next to a strand', phrase: 'holding the product next to a strand of their hair so both are clearly visible', emoji: '🧴' },
    { id: 'bottle', label: 'Showing the bottle', description: 'Label to camera', phrase: 'holding the bottle up to the camera to show the label clearly', emoji: '📦' },
  ],
  garments: [
    { id: 'wear', label: 'Wearing it', description: 'On-body, natural outfit', phrase: 'wearing the item naturally as part of their outfit', emoji: '👕' },
    { id: 'hold-up', label: 'Holding it up', description: 'Showing it to the camera', phrase: 'holding the garment up to the camera so it is fully visible', emoji: '🙌' },
    { id: 'styling', label: 'Styling it', description: 'Adjusting / smoothing it', phrase: 'styling the garment on themselves — adjusting the collar, sleeves or fit', emoji: '✨' },
  ],
  shoes: [
    { id: 'wear', label: 'Wearing on feet', description: 'Showing them on', phrase: 'showing the shoes on their feet, casually angled to the camera', emoji: '👟' },
    { id: 'hold-up', label: 'Holding them up', description: 'Lifted next to face', phrase: 'holding the shoes up next to their face excitedly', emoji: '🙌' },
    { id: 'detail', label: 'Showing the sole/detail', description: 'Close-up of detail', phrase: 'tilting the shoes to show the sole, side profile or material detail', emoji: '🔍' },
  ],
  jewellery: [
    { id: 'wear', label: 'Wearing it', description: 'On finger / wrist / neck', phrase: 'wearing the jewellery piece and casually showing it off (on finger, wrist, neck or ear)', emoji: '💍' },
    { id: 'hold-up', label: 'Holding it up to camera', description: 'Pinched between fingers', phrase: 'holding the jewellery piece up to the camera between their fingers so the detail is clearly visible', emoji: '✨' },
    { id: 'detail', label: 'Showing the detail', description: 'Close-up shot', phrase: 'showing a close-up of the jewellery on themselves, focused on the craftsmanship', emoji: '🔍' },
  ],
  bags: [
    { id: 'carry', label: 'Wearing/carrying it', description: 'On shoulder / in hand', phrase: 'wearing or carrying the bag naturally on their shoulder or in hand', emoji: '👜' },
    { id: 'hold-up', label: 'Holding it up', description: 'Lifted to camera', phrase: 'holding the bag up to the camera so the full silhouette is visible', emoji: '🙌' },
    { id: 'inside', label: 'Showing inside / detail', description: 'Open + interior view', phrase: 'opening the bag to show the interior or a hardware detail to the camera', emoji: '🔍' },
  ],
  food: [
    { id: 'taste', label: 'Tasting / sipping', description: 'Mid-bite or sip', phrase: 'tasting or sipping the product naturally toward the camera', emoji: '😋' },
    { id: 'hold', label: 'Holding the package', description: 'Package to camera', phrase: 'holding the food or drink package up to the camera so the label is clearly visible', emoji: '🥤' },
    { id: 'label', label: 'Showing the label', description: 'Front of the package', phrase: 'angling the package so the label and branding face the camera directly', emoji: '🏷️' },
  ],
  supplements: [
    { id: 'bottle', label: 'Holding the bottle', description: 'Hero in-hand shot', phrase: 'holding the supplement bottle naturally in front of them', emoji: '💊' },
    { id: 'pour', label: 'Pouring into hand', description: 'Capsules in palm', phrase: 'pouring the capsules or powder into their hand to show the dose', emoji: '🥄' },
    { id: 'label', label: 'Showing the label', description: 'Bottle label to camera', phrase: 'tilting the bottle so the label and ingredients face the camera', emoji: '🏷️' },
  ],
  tech: [
    { id: 'use', label: 'Using / demonstrating', description: 'Showing it in action', phrase: 'using or demonstrating the device naturally as if reviewing it', emoji: '📱' },
    { id: 'hold-up', label: 'Holding it up', description: 'Lifted to camera', phrase: 'holding the device up to the camera so the design is clearly visible', emoji: '🙌' },
    { id: 'feature', label: 'Showing the screen/feature', description: 'Close-up of feature', phrase: 'pointing out a specific feature, screen or detail of the device to the camera', emoji: '🔍' },
  ],
  home: [
    { id: 'space', label: 'Showing it in their space', description: 'In context at home', phrase: 'casually showing the item in their home next to where they actually use it', emoji: '🏠' },
    { id: 'point', label: 'Pointing it out', description: 'Look-at-this energy', phrase: 'pointing at the item with a "look at this" expression', emoji: '👉' },
    { id: 'hold', label: 'Holding/placing it', description: 'Placing it down', phrase: 'holding or gently placing the item, showing its size and finish', emoji: '🤲' },
  ],
  default: [
    { id: 'hold', label: 'Holding it', description: 'Naturally near chest/face', phrase: 'holding the product naturally near their face or chest', emoji: '🤲' },
    { id: 'show', label: 'Showing it to camera', description: 'Lifted to camera', phrase: 'holding the product up to the camera so it is fully visible', emoji: '🙌' },
    { id: 'point', label: 'Pointing it out', description: 'Look-at-this energy', phrase: 'pointing at the product with a "look at this" expression', emoji: '👉' },
  ],
};

function getInteractionCategoryKey(category: string | null | undefined, productType?: string): keyof typeof UGC_INTERACTION_OPTIONS {
  const c = (category || '').toLowerCase();
  const t = (productType || '').toLowerCase();
  const hay = `${c} ${t}`;
  if (/fragrance|perfume|cologne|eau de|parfum/.test(hay)) return 'fragrance';
  if (/haircare|shampoo|conditioner|hair/.test(hay)) return 'haircare';
  if (/beauty|skincare|makeup|lipstick|serum|cream|cosmetic|mascara|foundation|lotion/.test(hay)) return 'beauty';
  if (/sneaker|boot|heel|shoe|footwear|loafer|sandal/.test(hay)) return 'shoes';
  if (/jewell?ery|necklace|earring|bracelet|ring|watch|eyewear|sunglass|glasses/.test(hay)) return 'jewellery';
  if (/bag|backpack|wallet|cardholder|belt|scarf|tote|clutch|purse/.test(hay)) return 'bags';
  if (/food|snack|chocolate|cereal|granola|candy|cookie|beverage|drink|coffee|tea|juice|wine|beer|kombucha|water|smoothie/.test(hay)) return 'food';
  if (/supplement|vitamin|capsule|protein|collagen|wellness|probiotic/.test(hay)) return 'supplements';
  if (/tech|device|phone|laptop|headphone|earbuds|speaker|gadget|charger|tablet|keyboard/.test(hay)) return 'tech';
  if (/furniture|home-decor|home decor|candle|vase|lamp|pillow|decor|interior/.test(hay)) return 'home';
  if (/garment|apparel|clothing|dress|hoodie|shirt|jeans|jacket|activewear|swimwear|lingerie|kidswear|skirt|pants|coat|top|sweater/.test(hay)) return 'garments';
  return 'default';
}

export default function Generate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { filterVisible } = useHiddenScenes();
  const { asPoses: customPoses } = useCustomScenes();
  const { sortScenes, applyCategoryOverrides, deriveCategoryOrder } = useSceneSortOrder();
  const { asProfiles: customModelProfiles } = useCustomModels();
  const { asProfiles: userModelProfiles } = useUserModels();
  const { sortModels, applyOverrides, applyNameOverrides, filterHidden } = useModelSortOrder();
  const { workflowSlug } = useParams<{ workflowSlug: string }>();
  const [searchParams] = useSearchParams();
  // Support both slug-based routes and legacy query param
  const workflowIdFromQuery = searchParams.get('workflow');
  const initialTemplateId = searchParams.get('template');
  const prefillModelName = searchParams.get('model');
  const prefillSceneName = searchParams.get('scene');
  const prefillModelImage = searchParams.get('modelImage');
  const prefillSceneImage = searchParams.get('sceneImage');
  const [recreateSource, setRecreateSource] = useState<{ modelName?: string; sceneName?: string; modelImageUrl?: string; sceneImageUrl?: string } | null>(
    (prefillModelName || prefillSceneName) ? { modelName: prefillModelName || undefined, sceneName: prefillSceneName || undefined, modelImageUrl: prefillModelImage || undefined, sceneImageUrl: prefillSceneImage || undefined } : null
  );
  const { balance, isEmpty, openBuyModal, deductCredits, calculateCost, setBalanceFromServer, refreshBalance, plan } = useCredits();
  const { enqueue, activeJob, isProcessing: isQueueProcessing, isEnqueuing, reset: resetQueue, cancel: cancelQueue } = useGenerationQueue({
    jobTypes: ['workflow', 'tryon'],
    onGenerationFailed: (_jobId, _message, errorType) => {
      // Multi-product batches handle failures in their own polling loop
      if (multiProductJobIdsRef.current.size > 0) return;
      const friendlyMessages: Record<string, string> = {
        timeout: 'Generation timed out. Your credits have been refunded.',
        rate_limit: 'Too many generations at once. Please wait and try again.',
        generic: 'Generation failed. Your credits have been refunded — try again.',
      };
      toast.error(friendlyMessages[errorType] || friendlyMessages.generic);
      setCurrentStep('settings');
      refreshBalance();
      resetQueue();
    },
  });
  const { startBatch, batchState, isBatching, resetBatch } = useGenerationBatch({ onCreditRefresh: refreshBalance });
  const isFreeUser = plan === 'free';
  const { isAdmin } = useIsAdmin();
  const [isGeneratingPreviews, setIsGeneratingPreviews] = useState(false);

  // ── Conversion flow ──────────────────────────────────────────
  const conversionState = useConversionState();
  const { data: profileCats } = useQuery({
    queryKey: ['profile-categories', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('profiles').select('product_categories').eq('user_id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id && isFreeUser,
    staleTime: Infinity,
  });
  const conversionCategory = resolveConversionCategory(profileCats?.product_categories);

  // Merge mock + custom + user models, sorted consistently
  const allModels = useMemo(() => {
    const deduped = new Map<string, typeof mockModels[0]>();
    for (const m of applyNameOverrides(applyOverrides(mockModels))) deduped.set(m.modelId, m);
    for (const m of customModelProfiles) deduped.set(m.modelId, m);
    for (const m of userModelProfiles) deduped.set(m.modelId, m);
    return sortModels(filterHidden([...deduped.values()]));
  }, [customModelProfiles, userModelProfiles, sortModels, applyOverrides, applyNameOverrides, filterHidden]);

  const handleGenerateScenePreviews = async () => {
    if (!workflowId) return;
    setIsGeneratingPreviews(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-scene-previews', {
        body: { workflow_id: workflowId, force_regenerate: true },
      });
      if (error) throw error;
      toast.success('Scene previews generated! Refreshing...');
      // Refetch workflow data
      window.location.reload();
    } catch (e) {
      toast.error('Failed to generate scene previews');
      console.error(e);
    } finally {
      setIsGeneratingPreviews(false);
    }
  };

  // Workflow & Brand Profile from DB
  const workflowLookupKey = workflowSlug || workflowIdFromQuery;

  const { data: activeWorkflow } = useQuery({
    queryKey: ['workflow', workflowLookupKey],
    queryFn: async () => {
      if (!workflowLookupKey) return null;
      // If we have a slug from the route, query by slug; otherwise by id (legacy)
      const query = workflowSlug
        ? supabase.from('workflows').select('*').eq('slug', workflowSlug).single()
        : supabase.from('workflows').select('*').eq('id', workflowIdFromQuery!).single();
      const { data, error } = await query;
      if (error) return null;
      return data as unknown as Workflow;
    },
    enabled: !!workflowLookupKey,
  });

  // Derive workflowId for downstream usage
  const workflowId = activeWorkflow?.id ?? workflowIdFromQuery;

  // Redirect angle workflows (Picture Perspectives) to the standalone page
  useEffect(() => {
    if (activeWorkflow?.generation_config) {
      const config = activeWorkflow.generation_config as any;
      if (config?.variation_strategy?.type === 'angle') {
        navigate('/app/perspectives', { replace: true });
      }
    }
  }, [activeWorkflow, navigate]);

  const prefillProductId = searchParams.get('product');
  const prefillAppliedRef = useRef(false);

  // GTM: component-level guard so first_generation_started fires at most once
  // per page lifetime. The gtm helper itself dedupes per user_id across sessions.
  const firstgenStartedFiredRef = useRef(false);
  const fireFirstgenStartedOnce = useCallback((opts: {
    jobId: string;
    productId: string | null;
    visualType: string;
  }) => {
    if (firstgenStartedFiredRef.current) return;
    if (!user?.id || !opts.jobId) return;
    if (isGtmDebugEnabled()) {
      // eslint-disable-next-line no-console
      console.log('[GTM DEBUG first_generation_started]', {
        flow: 'generate',
        hasUser: true,
        userId: user.id,
        jobId: opts.jobId,
        isError: false,
        productId: opts.productId,
        visualType: opts.visualType,
        dedupKey: `gtm:firstgen-started:${user.id}`,
        dedupExists: safeLocalGet(`gtm:firstgen-started:${user.id}`),
        willFire: true,
      });
    }
    gtmFirstGenerationStarted({
      userId: user.id,
      productId: opts.productId,
      generationId: opts.jobId,
      visualType: opts.visualType,
    });
    // Set ONLY after a successful jobId AND after calling the helper.
    firstgenStartedFiredRef.current = true;
  }, [user]);

  const { data: brandProfiles = [] } = useQuery({
    queryKey: ['brand-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('brand_profiles').select('*').order('name');
      if (error) return [];
      return data as BrandProfile[];
    },
    enabled: !!user,
  });

  // Fetch real user products from database for try-on workflows
  const { data: userProducts = [], isLoading: isLoadingUserProducts } = useQuery({
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

  // Fetch previous room uploads for interior/exterior staging reuse
  const { data: previousUploads = [] } = useQuery({
    queryKey: ['previous-uploads', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data: files, error } = await supabase.storage
        .from('product-uploads')
        .list(user.id, { limit: 20, sortBy: { column: 'created_at', order: 'desc' } });
      if (error || !files) return [];
      return files
        .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f.name))
        .map(f => {
          const { data: urlData } = supabase.storage.from('product-uploads').getPublicUrl(`${user.id}/${f.name}`);
          return { name: f.name, url: urlData.publicUrl, created_at: f.created_at };
        });
    },
    enabled: !!user?.id && activeWorkflow?.slug === 'interior-exterior-staging',
  });

  const [currentStep, setCurrentStep] = useState<Step>('source');
  const [completedFeedbackJobId, setCompletedFeedbackJobId] = useState<string | null>(null);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tryOnSearchQuery, setTryOnSearchQuery] = useState('');
  const [productViewMode, setProductViewMode] = useState<'grid' | 'list'>('grid');
  const PRODUCTS_PER_PAGE = 22;
  const [visibleProductCount, setVisibleProductCount] = useState(PRODUCTS_PER_PAGE);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  const [sourceType, setSourceType] = useState<GenerationSourceType | null>(null);
  const [scratchUpload, setScratchUpload] = useState<ScratchUpload | null>(null);
  const [saveToLibrary, setSaveToLibrary] = useState(false);
  const [assignToProduct, setAssignToProduct] = useState<Product | null>(null);
  const [productAssignmentModalOpen, setProductAssignmentModalOpen] = useState(false);
  const [selectedLibraryIds, setSelectedLibraryIds] = useState<Set<string>>(new Set());
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');

  // Fetch library items for "From Library" source
  const { data: libraryItems = [], isLoading: isLoadingLibrary } = useQuery({
    queryKey: ['generate-library-items', user?.id],
    queryFn: async () => {
      const [fsResult, jobsResult] = await Promise.all([
        supabase.from('freestyle_generations').select('id, image_url, prompt, created_at').order('created_at', { ascending: false }).limit(50),
        supabase.from('generation_jobs').select('id, results, created_at, status, prompt_final').eq('status', 'completed').order('created_at', { ascending: false }).limit(50),
      ]);
      const items: Array<{ id: string; imageUrl: string; label: string; createdAt: string }> = [];
      if (fsResult.data) {
        for (const f of fsResult.data) {
          items.push({ id: `fs-${f.id}`, imageUrl: f.image_url, label: f.prompt?.slice(0, 60) || 'Freestyle', createdAt: f.created_at });
        }
      }
      if (jobsResult.data) {
        for (const job of jobsResult.data) {
          const results = job.results as any;
          if (!Array.isArray(results)) continue;
          for (let i = 0; i < results.length; i++) {
            const r = results[i];
            const url = typeof r === 'string' ? r : r?.url || r?.image_url;
            if (!url || url.startsWith('data:')) continue;
            items.push({ id: `job-${job.id}-${i}`, imageUrl: url, label: job.prompt_final?.slice(0, 60) || 'Generated', createdAt: job.created_at });
          }
        }
      }
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return items;
    },
    enabled: !!user?.id && sourceType === 'library',
  });

  const { upload: uploadFile, isUploading } = useFileUpload();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSourceImages, setSelectedSourceImages] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    initialTemplateId ? mockTemplates.find(t => t.templateId === initialTemplateId) || null : null
  );
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');

  const [selectedBrandProfileId, setSelectedBrandProfileId] = useState<string>('');
  const selectedBrandProfile = brandProfiles.find(bp => bp.id === selectedBrandProfileId) || null;

  const [generationMode, setGenerationMode] = useState<GenerationMode>('product-only');
  const [selectedModel, setSelectedModel] = useState<ModelProfile | null>(null);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [selectedModelMap, setSelectedModelMap] = useState<Map<string, ModelProfile>>(new Map());
  const [selectedPose, setSelectedPose] = useState<TryOnPose | null>(null);
  const [selectedPoses, setSelectedPoses] = useState<Set<string>>(new Set());
  const [selectedPoseMap, setSelectedPoseMap] = useState<Map<string, TryOnPose>>(new Map());
  const [modelGenderFilter, setModelGenderFilter] = useState<ModelGender | 'all'>('all');
  const [modelBodyTypeFilter, setModelBodyTypeFilter] = useState<ModelBodyType | 'all'>('all');
  const [modelAgeFilter, setModelAgeFilter] = useState<ModelAgeRange | 'all'>('all');

  const [brandKitOpen, setBrandKitOpen] = useState(true);
  const [brandTone, setBrandTone] = useState<BrandTone>('clean');
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>('studio');
  const [negatives, setNegatives] = useState<string[]>(['text overlays', 'busy backgrounds']);
  const [consistencyEnabled, setConsistencyEnabled] = useState(true);

  const [imageCount, setImageCount] = useState<'1' | '2' | '3' | '4'>('1');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [selectedAspectRatios, setSelectedAspectRatios] = useState<Set<AspectRatio>>(new Set());
  const [quality, setQuality] = useState<ImageQuality>('high');
  const [framing, setFraming] = useState<FramingOption | null>(null);
  const [selectedFramings, setSelectedFramings] = useState<Set<string>>(new Set(['auto']));

  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedForPublish, setSelectedForPublish] = useState<Set<number>>(new Set());

  // Multi-product queue state
  const [productQueue, setProductQueue] = useState<Product[]>([]);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [multiProductResults, setMultiProductResults] = useState<Map<string, { images: string[]; labels: string[] }>>(new Map());
  const [multiProductAutoAdvancing, setMultiProductAutoAdvancing] = useState(false);
  const isMultiProductMode = productQueue.length > 1;
  // Upfront multi-product: map of productId → jobId for all enqueued products
  const [multiProductJobIds, setMultiProductJobIds] = useState<Map<string, string>>(new Map());
  const multiProductJobIdsRef = useRef(multiProductJobIds);
  useEffect(() => { multiProductJobIdsRef.current = multiProductJobIds; }, [multiProductJobIds]);
  const hasMultipleJobs = multiProductJobIds.size > 1;
  // Per-job metadata for reliable grouping (avoids brittle key parsing)
  const [jobMetadata, setJobMetadata] = useState<Map<string, { productName: string; ratio: string; framing: string | null }>>(new Map());
  const multiProductPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isFinalizingResults, setIsFinalizingResults] = useState(false);

  
  const [tryOnConfirmModalOpen, setTryOnConfirmModalOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [noCreditsModalOpen, setNoCreditsModalOpen] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const queryClient = useQueryClient();


  // Workflow generation config shortcuts
  const workflowConfig = activeWorkflow?.generation_config ?? null;
  const hasWorkflowConfig = !!workflowConfig;
  const rawVariationStrategy = workflowConfig?.variation_strategy;
  const uiConfig = workflowConfig?.ui_config;

  // On-model categories are a small stable set; everything else is a product scene
  const ON_MODEL_CATEGORIES: PoseCategory[] = ['studio', 'lifestyle', 'editorial', 'streetwear'];

  // Merge Freestyle product scenes into workflow variation strategy
  const variationStrategy = useMemo(() => {
    if (!rawVariationStrategy || rawVariationStrategy.type !== 'scene') return rawVariationStrategy;
    // Only inject library scenes into Product Listing Set; all other workflows keep their DB scenes unchanged
    if (activeWorkflow?.slug !== 'product-listing-set') return rawVariationStrategy;

    const dbVariations = rawVariationStrategy.variations;
    const dbLabelsLower = new Set(dbVariations.map(v => v.label.toLowerCase()));

    // Include only product-category scenes (exclude on-model categories) from both built-in and custom admin scenes
    const allLibraryScenes = sortScenes(applyCategoryOverrides([...filterVisible(mockTryOnPoses), ...customPoses]));
    const freestyleScenes = allLibraryScenes
      .filter(s => !ON_MODEL_CATEGORIES.includes(s.category))
      .filter(s => !dbLabelsLower.has(s.name.toLowerCase()));

    if (freestyleScenes.length === 0) return rawVariationStrategy;

    const mappedScenes = freestyleScenes.map(s => ({
      label: s.name,
      instruction: s.promptHint?.trim() || s.description?.trim() || `Place the product in a ${s.name} environment, styled as ${poseCategoryLabels[s.category] || s.category} product photography`,
      preview_url: s.previewUrl,
      prompt_only: s.promptOnly || false,
      use_scene_reference: !s.promptOnly && !!s.previewUrl,
      category: poseCategoryLabels[s.category] || s.category,
    }));

    return {
      ...rawVariationStrategy,
      variations: [...dbVariations, ...mappedScenes],
    };
  }, [rawVariationStrategy, customPoses, activeWorkflow?.slug, sortScenes, applyCategoryOverrides, filterVisible]);

  // Track how many variations came from DB vs dynamic
  const dbVariationCount = rawVariationStrategy?.variations?.length ?? 0;

  // Remap frontend variation indices to backend-compatible indices.
  // Frontend merges DB variations + all dynamic scenes into one big array.
  // Backend rebuilds: [...DB variations, ...only the selected extras].
  // So extras at frontend index N must be remapped to dbCount + position within the selected extras list.
  const remapVariationIndices = useCallback((frontendIndices: number[]): { remapped: number[]; extras: Array<Record<string, unknown>> } => {
    const extraFrontendIndices = frontendIndices.filter(i => i >= dbVariationCount).sort((a, b) => a - b);
    const extras = extraFrontendIndices
      .map(i => variationStrategy?.variations[i])
      .filter(Boolean) as Array<Record<string, unknown>>;

    const remapped = frontendIndices.map(idx => {
      if (idx < dbVariationCount) return idx;
      const posInExtras = extraFrontendIndices.indexOf(idx);
      return dbVariationCount + posInExtras;
    });

    return { remapped, extras: extras.length > 0 ? extras : [] };
  }, [dbVariationCount, variationStrategy]);

  // Selected variation indices for workflow generation
  const [selectedVariationIndices, setSelectedVariationIndices] = useState<Set<number>>(new Set());
  const variationInitRef = useRef<string | null>(null);
  const [workflowVariationLabels, setWorkflowVariationLabels] = useState<string[]>([]);
  const [productAngle, setProductAngle] = useState<'front' | 'front-side' | 'front-back' | 'all'>('front');
  const [sceneFilterCategory, setSceneFilterCategory] = useState<string>('all');
  const [mirrorSettingsPhase, setMirrorSettingsPhase] = useState<'scenes' | 'final'>('scenes');

  // Flat Lay Set detection and state
  const isFlatLay = activeWorkflow?.slug === 'flat-lay-set';
  const isUpscale = activeWorkflow?.slug === 'image-upscaling';
  const isAngleWorkflow = false; // Angle workflows redirect to /app/perspectives
  const [flatLayPhase, setFlatLayPhase] = useState<'surfaces' | 'details'>('surfaces');
  const [upscaleResolution, setUpscaleResolution] = useState<'2k' | '4k'>('2k');
  const [stylingNotes, setStylingNotes] = useState('');
  const [selectedAesthetics, setSelectedAesthetics] = useState<string[]>([]);
  const [selectedFlatLayProductIds, setSelectedFlatLayProductIds] = useState<Set<string>>(new Set());
  const [flatLayPropStyle, setFlatLayPropStyle] = useState<'clean' | 'decorated'>('clean');

  // UGC mood selector
  type UgcMood = 'excited' | 'chill' | 'confident' | 'surprised' | 'focused';
  const UGC_MOODS: Array<{ id: UgcMood; label: string; emoji: string; desc: string; example: string; recommended?: boolean }> = [
    { id: 'excited', emoji: '🤩', label: 'Excited', desc: '"OMG I love this!" energy', example: 'Wide smile, bright eyes', recommended: true },
    { id: 'chill', emoji: '😌', label: 'Chill', desc: 'Everyday casual vibe', example: 'Soft smile, relaxed gaze' },
    { id: 'confident', emoji: '😎', label: 'Confident', desc: '"I know what works" energy', example: 'Subtle smile, direct eye contact' },
    { id: 'surprised', emoji: '😲', label: 'Surprised', desc: '"Wait, this actually works?!"', example: 'Raised eyebrows, open mouth' },
    { id: 'focused', emoji: '🧐', label: 'Focused', desc: 'Tutorial / demo mode', example: 'Concentrated, friendly' },
  ];
  const [ugcMood, setUgcMood] = useState<UgcMood>('excited');
  const [ugcInteraction, setUgcInteraction] = useState<string | null>(null);
  const [ugcOutfit, setUgcOutfit] = useState<string>('auto');

  // Mirror Selfie detection
  const isMirrorSelfie = activeWorkflow?.slug === 'mirror-selfie-set';

  // Selfie / UGC Set detection
  const isSelfieUgc = activeWorkflow?.slug === 'selfie-ugc-set';

  // Interior / Exterior Staging detection and state
  const isInteriorDesign = activeWorkflow?.slug === 'interior-exterior-staging';
  const [interiorType, setInteriorType] = useState<'interior' | 'exterior'>('interior');
  const [interiorRoomType, setInteriorRoomType] = useState('');
  const [interiorWallColor, setInteriorWallColor] = useState('Keep Original');
  const [interiorFlooring, setInteriorFlooring] = useState('Keep Original');
  const [interiorFurnitureStyle, setInteriorFurnitureStyle] = useState('Match Design Style');
  const [interiorLightingMood, setInteriorLightingMood] = useState('Keep Original');
  const [interiorFurnitureHandling, setInteriorFurnitureHandling] = useState('Keep & Restyle');
  const [interiorRoomSize, setInteriorRoomSize] = useState('Medium');
  const [interiorKeyPieces, setInteriorKeyPieces] = useState<string[]>([]);
  const [interiorDesignNotes, setInteriorDesignNotes] = useState('');
  const [interiorColorPalette, setInteriorColorPalette] = useState('');
  const [interiorTimeOfDay, setInteriorTimeOfDay] = useState('As Photographed');
  const [interiorPurpose, setInteriorPurpose] = useState('');
  const [interiorIsEmptyRoom, setInteriorIsEmptyRoom] = useState(false);
  const [interiorCeilingHeight, setInteriorCeilingHeight] = useState('Standard');
  const [interiorRoomDimensions, setInteriorRoomDimensions] = useState('');
  const [interiorExactCeilingHeight, setInteriorExactCeilingHeight] = useState('');
  const ROOM_FURNITURE_PRESETS: Record<string, string[]> = {
    'Living Room': ['Sofa', 'Sectional', 'Coffee Table', 'TV Console', 'Bookshelf', 'Side Table', 'Kitchen Island', 'Bar Cart', 'Floor Lamp', 'Area Rug'],
    'Bedroom (Master)': ['King Bed', 'Queen Bed', 'Nightstands', 'Dresser', 'Vanity', 'Armchair', 'Floor Mirror'],
    'Bedroom (Guest)': ['Double Bed', 'Single Bed', 'Sofa Bed', 'Nightstand', 'Small Desk', 'Armchair'],
    'Kids Room (Girl)': ['Single Bed', 'Bunk Bed', 'Loft Bed', 'Study Desk', 'Bookshelf', 'Toy Storage', 'Bean Bag', 'Wall Shelves'],
    'Kids Room (Boy)': ['Single Bed', 'Bunk Bed', 'Loft Bed', 'Study Desk', 'Bookshelf', 'Toy Storage', 'Bean Bag', 'Wall Shelves'],
    'Kids Room (Twins/Shared)': ['Twin Beds', 'Bunk Bed', 'Shared Desk', 'Individual Nightstands', 'Toy Storage', 'Bookshelf'],
    'Baby Nursery (Girl)': ['Crib', 'Changing Table', 'Rocking Chair', 'Dresser', 'Wall Shelves', 'Storage Baskets'],
    'Baby Nursery (Boy)': ['Crib', 'Changing Table', 'Rocking Chair', 'Dresser', 'Wall Shelves', 'Storage Baskets'],
    'Kitchen': ['Kitchen Island', 'Bar Stools', 'Dining Nook', 'Open Shelving', 'Pendant Lights'],
    'Dining Room': ['Dining Table (4-seat)', 'Dining Table (6-seat)', 'Sideboard', 'Display Cabinet', 'Chandelier'],
    'Bathroom (Master)': ['Vanity', 'Freestanding Tub', 'Shower', 'Storage Cabinet', 'Mirror', 'Towel Rack'],
    'Bathroom (Guest)': ['Vanity', 'Shower', 'Storage Cabinet', 'Mirror', 'Towel Rack'],
    'Home Office / Work Room': ['Desk', 'Ergonomic Chair', 'Bookshelf', 'Filing Cabinet', 'Monitor Stand', 'Floor Lamp'],
    'Walk-in Closet': ['Shelving Unit', 'Hanging Rails', 'Drawer Unit', 'Island Dresser', 'Mirror', 'Shoe Rack'],
    'Hallway / Entryway': ['Console Table', 'Mirror', 'Coat Hooks', 'Shoe Storage', 'Bench'],
    'Laundry Room': ['Folding Table', 'Storage Shelves', 'Baskets', 'Drying Rack'],
    'Storage Room / Utility': ['Shelving Units', 'Labeled Containers', 'Workbench', 'Pegboard'],
    'Basement / Rec Room': ['Sofa', 'TV Console', 'Game Table', 'Bar Area', 'Bookshelf'],
    // Exterior types
    'Front Facade': ['Lounge Chairs', 'Planters', 'Outdoor Lighting', 'Welcome Mat'],
    'Backyard': ['Lounge Chairs', 'Dining Set', 'Planters', 'Fire Pit', 'Pergola', 'Outdoor Rug'],
    'Garden': ['Garden Bench', 'Planters', 'Water Feature', 'Pathway Lighting'],
    'Pool Area': ['Lounge Chairs', 'Umbrellas', 'Side Tables', 'Planters', 'Outdoor Shower'],
    'Driveway': ['Planters', 'Pathway Lighting', 'Gate', 'Bollards'],
    'Rooftop Terrace': ['Lounge Set', 'Planters', 'Privacy Screen', 'String Lights', 'Outdoor Rug'],
    'Entrance / Porch': ['Rocking Chair', 'Bench', 'Planters', 'Pendant Light', 'Welcome Mat'],
    'Patio / Outdoor Living': ['Dining Set', 'Lounge Set', 'Planters', 'Fire Pit', 'Pergola', 'Outdoor Rug'],
    'Balcony / Terrace': ['Compact Table', 'Chairs', 'Planters', 'String Lights'],
    'Garage': ['Tool Storage', 'Workbench', 'Wall-mounted Racks', 'Floor Mat'],
  };

  const INTERIOR_ROOM_TYPES = [
    'Living Room', 'Bedroom (Master)', 'Bedroom (Guest)',
    'Kids Room (Girl)', 'Kids Room (Boy)', 'Kids Room (Twins/Shared)',
    'Baby Nursery (Girl)', 'Baby Nursery (Boy)',
    'Kitchen', 'Dining Room',
    'Bathroom (Master)', 'Bathroom (Guest)',
    'Home Office / Work Room', 'Walk-in Closet', 'Hallway / Entryway',
    'Laundry Room', 'Storage Room / Utility',
    'Basement / Rec Room',
  ];

  const EXTERIOR_ROOM_TYPES = [
    'Front Facade', 'Backyard', 'Garden', 'Pool Area',
    'Driveway', 'Rooftop Terrace', 'Entrance / Porch',
    'Patio / Outdoor Living', 'Balcony / Terrace', 'Garage',
  ];

  // Auto-set scratch source type for interior design (upload-based)
  useEffect(() => {
    if (isInteriorDesign) {
      setSourceType('scratch');
    }
  }, [isInteriorDesign]);

  // Reset room type and key pieces when switching interior/exterior
  useEffect(() => {
    setInteriorRoomType('');
    setInteriorKeyPieces([]);
    setInteriorColorPalette('');
    setInteriorTimeOfDay('As Photographed');
    setInteriorIsEmptyRoom(false);
    setInteriorCeilingHeight('Standard');
    setInteriorRoomDimensions('');
    setInteriorExactCeilingHeight('');
    setSelectedVariationIndices(new Set());
    setSceneFilterCategory('all');
  }, [interiorType]);

  // Reset key pieces when room type changes (but NOT design notes)
  useEffect(() => {
    setInteriorKeyPieces([]);
  }, [interiorRoomType]);

  // When empty room is toggled on, force "Replace All"
  useEffect(() => {
    if (interiorIsEmptyRoom) {
      setInteriorFurnitureHandling('Replace All');
    }
  }, [interiorIsEmptyRoom]);

  // When workflow is loaded, set generation mode and defaults
  useEffect(() => {
    if (activeWorkflow) {
      if (activeWorkflow.uses_tryon) {
        setGenerationMode('virtual-try-on');
      }
      // Set aspect ratio from workflow config or recommendations
      if (workflowConfig?.fixed_settings?.aspect_ratios?.length) {
        const firstRatio = workflowConfig.fixed_settings.aspect_ratios[0] as AspectRatio;
        if (['1:1', '4:5', '9:16', '16:9'].includes(firstRatio)) {
          setAspectRatio(firstRatio);
        }
      } else if (activeWorkflow.recommended_ratios?.length > 0) {
        const firstRatio = activeWorkflow.recommended_ratios[0] as AspectRatio;
        if (['1:1', '4:5', '9:16', '16:9'].includes(firstRatio)) {
          setAspectRatio(firstRatio);
        }
      }
      // Quality is user-controlled — workflow defaults no longer override it
      // Start with none selected for scene-type workflows, auto-select all for others
      if (variationStrategy?.variations?.length && variationInitRef.current !== activeWorkflow.id) {
        variationInitRef.current = activeWorkflow.id;
        if (variationStrategy.type === 'scene') {
          setSelectedVariationIndices(new Set());
        } else {
          setSelectedVariationIndices(new Set(variationStrategy.variations.map((_, i) => i)));
        }
      }
      // Auto-select template from workflow's template_ids (only if no config)
      if (!workflowConfig && activeWorkflow.template_ids?.length > 0) {
        const matchingTemplate = mockTemplates.find(t =>
          activeWorkflow.template_ids.some(tid => t.templateId.includes(tid) || t.name.toLowerCase().includes(tid.replace(/-/g, ' ')))
        );
        if (matchingTemplate) setSelectedTemplate(matchingTemplate);
      }
    }
  }, [activeWorkflow, workflowConfig]);

  // Pre-fill model and scene from URL params (Discover "Recreate this")
  useEffect(() => {
    if (!prefillModelName && !prefillSceneName) return;
    // Wait for scenes/models to be available
    const allScenes = [...filterVisible(mockTryOnPoses), ...customPoses];

    if (prefillModelName) {
      const matchedModel = allModels.find(m => m.name.toLowerCase() === prefillModelName.toLowerCase());
      if (matchedModel) {
        setSelectedModel(matchedModel);
        setSelectedModels(new Set([matchedModel.modelId]));
        setSelectedModelMap(new Map([[matchedModel.modelId, matchedModel]]));
      }
    }

    if (prefillSceneName) {
      const matchedScene = allScenes.find(s => s.name.toLowerCase() === prefillSceneName.toLowerCase());
      if (matchedScene) {
        setSelectedPose(matchedScene);
        setSelectedPoses(new Set([matchedScene.poseId]));
        setSelectedPoseMap(new Map([[matchedScene.poseId, matchedScene]]));
      }
      // Also pre-select in workflow variation grid if applicable
      if (variationStrategy?.type === 'scene' && variationStrategy.variations?.length) {
        const matchIdx = variationStrategy.variations.findIndex(
          v => v.label.toLowerCase() === prefillSceneName.toLowerCase()
        );
        if (matchIdx >= 0) {
          setSelectedVariationIndices(prev => {
            const next = new Set(prev);
            next.add(matchIdx);
            return next;
          });
        }
      }
    }
  }, [prefillModelName, prefillSceneName, customPoses, allModels, variationStrategy]);

  // Resolve missing image URLs for recreate banner (when DB fields are null)
  useEffect(() => {
    if (!recreateSource) return;
    let updated = false;
    const patch = { ...recreateSource };

    if (!patch.modelImageUrl && patch.modelName) {
      const found = allModels.find(m => m.name.toLowerCase() === patch.modelName!.toLowerCase());
      if (found) { patch.modelImageUrl = found.previewUrl; updated = true; }
    }

    if (!patch.sceneImageUrl && patch.sceneName) {
      const allPoses = [...mockTryOnPoses, ...customPoses];
      const found = allPoses.find(p => p.name.toLowerCase() === patch.sceneName!.toLowerCase());
      if (found) { patch.sceneImageUrl = found.previewUrl; updated = true; }
    }

    if (updated) setRecreateSource(patch);
  }, [allModels, customPoses]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to top when step changes
  useEffect(() => {
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Apply brand profile settings when selected
  useEffect(() => {
    if (selectedBrandProfile) {
      setBrandTone(selectedBrandProfile.tone as BrandTone);
      setBackgroundStyle(selectedBrandProfile.background_style as BackgroundStyle);
      if (selectedBrandProfile.do_not_rules?.length > 0) {
        setNegatives(selectedBrandProfile.do_not_rules);
      }
    }
  }, [selectedBrandProfile]);

  const categories: Array<{ id: TemplateCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All Templates' },
    { id: 'garments', label: 'Clothing' },
    { id: 'beauty-skincare', label: 'Cosmetics' },
    { id: 'food', label: 'Food' },
    { id: 'beverages', label: 'Beverages' },
    { id: 'furniture', label: 'Furniture' },
    { id: 'home-decor', label: 'Home Decor' },
    { id: 'supplements-wellness', label: 'Supplements' },
    { id: 'other', label: 'Universal' },
  ];

  const filteredTemplates = mockTemplates.filter(t => {
    if (!t.enabled) return false;
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    return true;
  });

  const filteredProducts = mockProducts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.vendor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredModels = allModels.filter(m => {
    if (modelGenderFilter !== 'all' && m.gender !== modelGenderFilter) return false;
    if (modelBodyTypeFilter !== 'all' && m.bodyType !== modelBodyTypeFilter) return false;
    if (modelAgeFilter !== 'all' && m.ageRange !== modelAgeFilter) return false;
    return true;
  });

  const onModelCategories: PoseCategory[] = ['studio', 'lifestyle', 'editorial', 'streetwear'];
  const allScenePoses = sortScenes(applyCategoryOverrides([...filterVisible(mockTryOnPoses), ...customPoses]));
  const posesByCategory = allScenePoses.reduce((acc, pose) => {
    // For Virtual Try-On, only show on-model categories
    if (activeWorkflow?.uses_tryon && !onModelCategories.includes(pose.category)) return acc;
    if (!acc[pose.category]) acc[pose.category] = [];
    acc[pose.category].push(pose);
    return acc;
  }, {} as Record<PoseCategory, TryOnPose[]>);

  const popularCombinations = createPopularCombinations(allModels, allScenePoses);

  const isClothingProduct = (product: Product | null) => {
    if (!product) return false;
    const productType = product.productType.toLowerCase();
    const clothingKeywords = ['sweater', 'shirt', 'apparel', 'dress', 'jacket', 'pants', 'jeans', 'coat', 'blouse', 'skirt', 'suit', 'hoodie', 't-shirt', 'clothing', 'legging', 'bra', 'sports bra', 'tank', 'jogger', 'shorts', 'top', 'long sleeve', 'crop', 'bodysuit', 'romper', 'jumpsuit', 'sweatshirt', 'pullover', 'cardigan', 'vest', 'active', 'athletic', 'yoga', 'workout'];
    return clothingKeywords.some(kw => productType.includes(kw)) ||
      product.tags.some(tag => clothingKeywords.some(kw => tag.toLowerCase().includes(kw)));
  };

  // Map a DB UserProduct to the app's Product type
  const mapUserProductToProduct = (up: UserProduct): Product => ({
    id: up.id,
    title: up.title,
    vendor: 'My Products',
    productType: up.product_type,
    tags: up.tags || [],
    description: up.description,
    images: [{ id: `img-${up.id}`, url: up.image_url }],
    status: 'active',
    createdAt: up.created_at,
    updatedAt: up.updated_at,
  });

  const detectProductCategory = (product: Product | null): TemplateCategory | null => {
    if (!product) return null;
    const type = product.productType.toLowerCase();
    const tags = product.tags.map(t => t.toLowerCase()).join(' ');
    const combined = `${type} ${tags}`;
    const cosmeticsKeywords = ['serum', 'moisturizer', 'lipstick', 'foundation', 'mascara', 'skincare', 'beauty', 'makeup', 'cream', 'treatment', 'powder', 'lip'];
    if (cosmeticsKeywords.some(kw => combined.includes(kw))) return 'beauty-skincare';
    const beverageKeywords = ['coffee', 'tea', 'juice', 'beverage', 'soda', 'wine', 'beer', 'water', 'drink', 'kombucha', 'smoothie'];
    if (beverageKeywords.some(kw => combined.includes(kw))) return 'beverages';
    const foodKeywords = ['cereal', 'granola', 'chocolate', 'honey', 'snack', 'food', 'organic', 'candy', 'chips', 'cookie'];
    if (foodKeywords.some(kw => combined.includes(kw))) return 'food';
    const furnitureKeywords = ['sofa', 'couch', 'sectional', 'loveseat', 'armchair', 'recliner', 'dining table', 'coffee table', 'desk', 'bookshelf', 'bookcase', 'cabinet', 'dresser', 'wardrobe', 'sideboard', 'credenza', 'nightstand', 'ottoman', 'bench', 'stool', 'bed frame', 'headboard', 'futon', 'mattress', 'tv stand', 'media console', 'kitchen island', 'bar cart', 'furniture'];
    if (furnitureKeywords.some(kw => combined.includes(kw))) return 'furniture';
    const homeKeywords = ['candle', 'vase', 'planter', 'pillow', 'lamp', 'decor', 'home', 'interior', 'carafe', 'ceramic', 'diffuser', 'figurine', 'tray', 'coaster'];
    if (homeKeywords.some(kw => combined.includes(kw))) return 'home-decor';
    const supplementKeywords = ['vitamin', 'supplement', 'capsule', 'protein', 'collagen', 'omega', 'wellness', 'greens', 'superfood'];
    if (supplementKeywords.some(kw => combined.includes(kw))) return 'supplements-wellness';
    if (isClothingProduct(product)) return 'garments';
    return null;
  };

  // Returns the UGC interaction option list filtered for the selected product's category.
  const getInteractionOptionsForProduct = useCallback((product: Product | null): UgcInteractionOption[] => {
    if (!product) return UGC_INTERACTION_OPTIONS.default;
    const analysisCat = (product as unknown as { analysis_json?: { category?: string } }).analysis_json?.category;
    const fallbackCat = detectProductCategory(product);
    const key = getInteractionCategoryKey(analysisCat || fallbackCat || '', product.productType);
    return UGC_INTERACTION_OPTIONS[key] || UGC_INTERACTION_OPTIONS.default;
  }, []);

  // Resolve the chosen interaction phrase for the current product (defaults to first option if none picked).
  const resolveUgcInteractionPhrase = useCallback((product: Product | null): string | undefined => {
    if (!isSelfieUgc) return undefined;
    const opts = getInteractionOptionsForProduct(product);
    const picked = opts.find(o => o.id === ugcInteraction) || opts[0];
    return picked?.phrase;
  }, [isSelfieUgc, ugcInteraction, getInteractionOptionsForProduct]);

  // Detect which wardrobe slot the selected product occupies (for pair-mode).
  const resolveProductSlot = useCallback((product: Product | null) => {
    if (!product) return 'other' as const;
    const cat = (product as unknown as { analysis_json?: { category?: string } }).analysis_json?.category
      || detectProductCategory(product) || '';
    return detectProductSlot(cat, `${product.title || ''} ${product.productType || ''}`);
  }, []);

  // Resolve outfit phrase: pair-mode when wearing interaction, otherwise standard preset.
  const resolveOutfitPhraseForProduct = useCallback((product: Product | null): string | undefined => {
    if (!isSelfieUgc) return undefined;
    const interaction = resolveUgcInteractionPhrase(product);
    if (isWearingInteraction(interaction)) {
      return resolveUgcPairPhrase(ugcOutfit, resolveProductSlot(product));
    }
    return resolveUgcOutfitPhrase(ugcOutfit, interaction);
  }, [isSelfieUgc, ugcOutfit, resolveUgcInteractionPhrase, resolveProductSlot]);

  // Reset outfit selection to "auto" whenever the wearing-mode flips to avoid carrying stale IDs.
  const wearingModeRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (!isSelfieUgc) return;
    const wearing = isWearingInteraction(resolveUgcInteractionPhrase(selectedProduct));
    if (wearingModeRef.current !== null && wearingModeRef.current !== wearing) {
      setUgcOutfit('auto');
    }
    wearingModeRef.current = wearing;
  }, [isSelfieUgc, ugcInteraction, selectedProduct, resolveUgcInteractionPhrase]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductPickerOpen(false);
    if (product.images.length > 0) {
      setSelectedSourceImages(new Set([product.images[0].id]));
    } else {
      setSelectedSourceImages(new Set());
    }
    const detectedCategory = detectProductCategory(product);
    if (detectedCategory) setSelectedCategory(detectedCategory);
    // Auto-detect framing
    const detectedFraming = detectDefaultFraming(product.productType, product.tags);
    if (detectedFraming) setFraming(detectedFraming);
    // Upscale workflow: skip straight to settings
    if (isUpscale) {
      setCurrentStep('settings');
      return;
    }
    // Angle workflow: skip brand profile, go straight to settings
    if (isAngleWorkflow) {
      setCurrentStep('settings');
      return;
    }
    // Selfie / UGC: skip brand entirely → choose Interaction
    if (isSelfieUgc) {
      const opts = getInteractionOptionsForProduct(product);
      setUgcInteraction(opts[0]?.id ?? null);
      setCurrentStep('interaction');
      return;
    }
    // Go to brand profile step if profiles exist
    if (brandProfiles.length > 0) {
      setCurrentStep('brand-profile');
    } else if (activeWorkflow?.uses_tryon || uiConfig?.show_model_picker) {
      // Go to model step for try-on or selfie/UGC workflows
      setCurrentStep('model');
    } else if (uiConfig?.skip_template && hasWorkflowConfig) {
      // Workflow config skips template — go straight to settings
      setCurrentStep('settings');
    } else if (isClothingProduct(product)) {
      setCurrentStep('mode');
    } else {
      setCurrentStep('template');
    }
  };

  // Auto-select product from query param (StartWorkflowModal flow)
  useEffect(() => {
    if (!prefillProductId || prefillAppliedRef.current || !activeWorkflow) return;
    if (isLoadingUserProducts) return;

    let product: Product | null = null;

    const sampleMap: Record<string, Product> = {
      sample_tryon_crop_top: SAMPLE_TRYON_PRODUCT,
      sample_listing_ring: SAMPLE_LISTING_PRODUCT,
      sample_ugc_ice_roller: SAMPLE_UGC_PRODUCT,
      sample_mirror_sweater: SAMPLE_MIRROR_PRODUCT,
    };
    if (sampleMap[prefillProductId]) {
      product = sampleMap[prefillProductId];
    } else {
      const userProduct = userProducts.find(p => p.id === prefillProductId);
      if (userProduct) {
        product = mapUserProductToProduct(userProduct);
      }
    }

    if (!product) return;
    prefillAppliedRef.current = true;

    setSelectedProduct(product);
    setSourceType('products' as GenerationSourceType);
    if (product.images.length > 0) {
      setSelectedSourceImages(new Set([product.images[0].id]));
    }
    setSelectedProductIds(new Set([product.id]));

    const detectedFraming = detectDefaultFraming(product.productType, product.tags);
    if (detectedFraming) setFraming(detectedFraming);

    // Skip brand profile for modal-initiated flows
    if (isSelfieUgc) {
      const opts = getInteractionOptionsForProduct(product);
      setUgcInteraction(opts[0]?.id ?? null);
      setCurrentStep('interaction');
    } else if (activeWorkflow.uses_tryon || uiConfig?.show_model_picker) {
      setCurrentStep('model');
    } else if (uiConfig?.skip_template && hasWorkflowConfig) {
      setCurrentStep('settings');
    } else {
      setCurrentStep('template');
    }
  }, [prefillProductId, activeWorkflow, userProducts, isLoadingUserProducts]);

  const handleBrandProfileContinue = () => {
    if (isFlatLay) {
      setFlatLayPhase('surfaces');
      setCurrentStep('settings');
    } else if (activeWorkflow?.uses_tryon || uiConfig?.show_model_picker) {
      setCurrentStep('model');
    } else if (uiConfig?.skip_template && hasWorkflowConfig) {
      setCurrentStep('settings');
    } else if (isClothingProduct(selectedProduct)) {
      setCurrentStep('mode');
    } else {
      setCurrentStep('template');
    }
  };

  const toggleSourceImage = (imageId: string) => {
    setSelectedSourceImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) { if (newSet.size > 1) newSet.delete(imageId); }
      else newSet.add(imageId);
      return newSet;
    });
  };

  const selectAllSourceImages = () => {
    if (selectedProduct) setSelectedSourceImages(new Set(selectedProduct.images.map(img => img.id)));
  };
  const clearSourceImages = () => {
    if (selectedProduct?.images.length) setSelectedSourceImages(new Set([selectedProduct.images[0].id]));
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setAspectRatio(template.defaults.aspectRatio);
    setQuality(template.defaults.quality);
    toast.success(`"${template.name}" selected! Click Continue when ready.`);
  };

  const handleSelectModel = (model: ModelProfile) => {
    setSelectedModels(prev => {
      const next = new Set(prev);
      const nextMap = new Map(selectedModelMap);
      if (next.has(model.modelId)) {
        next.delete(model.modelId);
        nextMap.delete(model.modelId);
      } else {
        if (isFreeUser && next.size >= 1) {
          conversionState.openUpgradeDrawer('model_limit');
          return prev;
        }
        next.add(model.modelId);
        nextMap.set(model.modelId, model);

        // Credit warning for paid users
        if (!isFreeUser && next.size > 1) {
          const newModelCount = next.size;
          const sceneCount = Math.max(1, selectedPoses.size);
          const imgCount = parseInt(imageCount);
          const prodCount = isMultiProductMode ? productQueue.length : 1;
          const projectedCost = newModelCount * sceneCount * imgCount * 6 * prodCount;
          if (projectedCost > balance) {
            toast.warning(`${newModelCount} models × ${sceneCount} scenes will cost ${projectedCost} credits — you have ${balance}. Top up before generating.`, { duration: 4000 });
          }
        }
      }
      setSelectedModelMap(nextMap);
      // Keep selectedModel in sync (first selected) for backward compat
      const firstId = Array.from(next)[0];
      setSelectedModel(firstId ? nextMap.get(firstId) || null : null);
      return next;
    });
  };
  const handleSelectPose = (pose: TryOnPose) => {
    const maxScenes = isFreeUser ? FREE_SCENE_LIMIT : PAID_SCENE_LIMIT;
    setSelectedPoses(prev => {
      const next = new Set(prev);
      const nextMap = new Map(selectedPoseMap);
      if (next.has(pose.poseId)) {
        next.delete(pose.poseId);
        nextMap.delete(pose.poseId);
      } else {
        if (isFreeUser && next.size >= FREE_SCENE_LIMIT) {
          conversionState.openUpgradeDrawer('scene_limit');
          return prev;
        }
        next.add(pose.poseId);
        nextMap.set(pose.poseId, pose);

        // Credit warning for paid users
        if (!isFreeUser) {
          const newSceneCount = next.size;
          const imgCount = parseInt(imageCount);
          const prodCount = isMultiProductMode ? productQueue.length : 1;
          const projectedCost = newSceneCount * imgCount * 6 * prodCount;
          if (projectedCost > balance) {
            toast.warning(`${newSceneCount} scenes will cost ${projectedCost} credits — you have ${balance}. Top up before generating.`, { duration: 4000 });
          }
        }
      }
      setSelectedPoseMap(nextMap);
      // Keep selectedPose in sync for backward compat
      const firstId = Array.from(next)[0];
      setSelectedPose(firstId ? nextMap.get(firstId) || null : null);
      return next;
    });
  };
  const handleCancelGeneration = () => { setCurrentStep('settings'); setGeneratingProgress(0); toast.info('Generation cancelled'); };

  const handleUpscaleWorkflowGenerate = async () => {
    try {
      if (!selectedProduct && !scratchUpload) return;
      setCurrentStep('generating');
      setGeneratingProgress(0);

      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) { toast.error('Authentication required'); setCurrentStep('settings'); return; }


      // Gather source images — either from selected products or scratch upload
      const sources: Array<{ imageUrl: string; sourceType: 'generation' | 'freestyle'; sourceId: string; title: string }> = [];

      if (isMultiProductMode) {
        for (const product of productQueue) {
          const imgUrl = product.images[0]?.url;
          if (imgUrl) sources.push({ imageUrl: imgUrl, sourceType: 'generation', sourceId: product.id, title: product.title });
        }
      } else if (sourceType === 'scratch' && scratchUpload?.uploadedUrl) {
        sources.push({ imageUrl: scratchUpload.uploadedUrl, sourceType: 'freestyle', sourceId: 'scratch', title: scratchUpload.productInfo.title || 'Upload' });
      } else if (selectedProduct) {
        const imgUrl = selectedProduct.images[0]?.url;
        if (imgUrl) sources.push({ imageUrl: imgUrl, sourceType: 'generation', sourceId: selectedProduct.id, title: selectedProduct.title });
      }

      if (sources.length === 0) { toast.error('No source image available'); setCurrentStep('settings'); return; }

      const jobMap = new Map<string, string>();
      let lastBalance: number | null = null;

      for (let i = 0; i < sources.length; i++) {
        const src = sources[i];
        await paceDelay(i);

        const result = await enqueueWithRetry(
          {
            jobType: 'upscale',
            payload: {
              imageUrl: src.imageUrl,
              sourceType: src.sourceType,
              sourceId: src.sourceId,
              resolution: upscaleResolution,
            },
            imageCount: 1,
            quality: 'standard',
            resolution: upscaleResolution,
            skipWake: true,
          },
          token,
        );

        if (isEnqueueError(result)) {
          if (result.type === 'insufficient_credits') toast.error(result.message);
          else if (result.type === 'rate_limit') toast.error('Rate limited. Please wait.');
          else toast.error(result.message || `Failed to enqueue upscale for "${src.title}"`);
          break;
        }

        jobMap.set(src.sourceId, result.jobId);
        lastBalance = result.newBalance;
        fireFirstgenStartedOnce({
          jobId: result.jobId,
          productId: src.sourceType === 'generation' ? (src.sourceId ?? null) : null,
          visualType: 'upscale',
        });
        injectActiveJob(queryClient, {
          jobId: result.jobId, workflow_id: activeWorkflow?.id, workflow_name: activeWorkflow?.name,
          workflow_slug: activeWorkflow?.slug, product_name: src.title,
          job_type: 'upscale', quality: 'standard', resolution: upscaleResolution,
        });
      }

      if (jobMap.size === 0) {
        toast.error('Could not queue any images');
        setCurrentStep('settings');
        return;
      }
      if (lastBalance !== null) setBalanceFromServer(lastBalance);
      setMultiProductJobIds(jobMap);
      sendWake(token);
      const resLabel = upscaleResolution === '4k' ? '4K' : '2K';
      toast.success(`Upscaling ${jobMap.size} image${jobMap.size > 1 ? 's' : ''} to ${resLabel}…`);
      queryClient.invalidateQueries({ queryKey: ['workflow-active-jobs'] });
    } catch (err) {
      console.error('Upscale workflow failed:', err);
      toast.error('Something went wrong starting the upscale. Please try again.');
      setCurrentStep('settings');
    }
  };

  const handleGenerateClick = () => {
    if (!selectedProduct && !(sourceType === 'scratch' && scratchUpload)) {
      toast.error('Pick a product first');
      return;
    }
    if (balance < creditCost) { setNoCreditsModalOpen(true); return; }
    // Upscale workflow path
    if (isUpscale) {
      handleUpscaleWorkflowGenerate();
      return;
    }
    if (generationMode === 'virtual-try-on' && !isSelfieUgc) {
      if (selectedModels.size === 0 || selectedPoses.size === 0) { toast.error('Please select a model and at least one scene'); return; }
      handleTryOnConfirmGenerate(); return;
    }
    // Workflow-config path: skip template requirement
    if (hasWorkflowConfig) {
      handleWorkflowGenerate();
      return;
    }
    if (!selectedTemplate) { toast.error('Please select a Visual Type first'); return; }
    toast.error('This Visual Type is no longer supported. Please pick another from Visual Studio.');
  };

  const handleWorkflowGenerate = async () => {
    try {
    // Allow queuing multiple workflows — backend enforces per-plan concurrency limits
    if (!selectedProduct && !scratchUpload) return;

    // Multi-product upfront enqueue for workflow mode
    if (isMultiProductMode) {
      setCurrentStep('generating');
      setGeneratingProgress(0);
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) { toast.error('Authentication required'); setCurrentStep('settings'); return; }

      const batchId = crypto.randomUUID();
      const needsModel = uiConfig?.show_model_picker && selectedModel;
      const modelsToGenerate = (isSelfieUgc || isMirrorSelfie) && selectedModels.size > 0
        ? Array.from(selectedModels).map(id => selectedModelMap.get(id)!).filter(Boolean)
        : needsModel ? [selectedModel!] : [];
      const jobMap = new Map<string, string>();
      let lastBalance: number | null = null;

      for (const product of productQueue) {
        const sourceImage = product.images[0];
        const sourceImageUrl = sourceImage?.url || '';
        if (!sourceImageUrl) continue;

        const originalUp = userProducts.find(up => up.id === product.id);
        const productData = { title: product.title, productType: product.productType, description: product.description, dimensions: originalUp?.dimensions || undefined };

        const base64Image = await convertImageToBase64(sourceImageUrl);

        const variationIndices = selectedVariationIndices.size > 0 ? Array.from(selectedVariationIndices) : [0];
        const ratiosToGen = selectedAspectRatios.size > 0 ? Array.from(selectedAspectRatios) : [aspectRatio];
        const framingsToGen: Array<FramingOption | null> = selectedFramings.has('auto') ? [null] : Array.from(selectedFramings) as FramingOption[];

        // Model loop — at least one iteration even without models
        const modelIterator = modelsToGenerate.length > 0 ? modelsToGenerate : [null];

        for (const modelProfile of modelIterator) {
          const base64ModelImage = modelProfile ? await convertImageToBase64(modelProfile.previewUrl) : undefined;

        for (const varIdx of variationIndices) {
         for (const ratioVal of ratiosToGen) {
          for (const framingVal of framingsToGen) {
          const payload: Record<string, unknown> = {
            workflow_id: activeWorkflow!.id,
            workflow_name: activeWorkflow!.name,
            workflow_slug: activeWorkflow!.slug,
            product: { ...productData, imageUrl: base64Image },
            product_name: product.title,
            product_image_url: await resolveProductImageUrl(product.images[0]?.url),
            brand_profile: selectedBrandProfile ? {
              tone: selectedBrandProfile.tone, background_style: selectedBrandProfile.background_style,
              lighting_style: selectedBrandProfile.lighting_style, color_temperature: selectedBrandProfile.color_temperature,
              brand_keywords: selectedBrandProfile.brand_keywords, color_palette: selectedBrandProfile.color_palette,
              target_audience: selectedBrandProfile.target_audience, do_not_rules: selectedBrandProfile.do_not_rules,
              composition_bias: selectedBrandProfile.composition_bias, preferred_scenes: selectedBrandProfile.preferred_scenes,
              photography_reference: selectedBrandProfile.photography_reference,
            } : undefined,
            selected_variations: (() => {
              const { remapped } = remapVariationIndices([varIdx]);
              return remapped;
            })(),
            extra_variations: (() => {
              const { extras } = remapVariationIndices([varIdx]);
              return extras.length > 0 ? extras : undefined;
            })(),
            product_angles: productAngle !== 'front' ? productAngle : undefined,
            quality, aspectRatio: ratioVal,
            framing: framingVal || undefined,
            ugc_mood: isSelfieUgc ? ugcMood : undefined,
            interaction_phrase: resolveUgcInteractionPhrase(product),
            outfit_phrase: isSelfieUgc ? resolveOutfitPhraseForProduct(product) : undefined,
            batch_id: batchId,
          };
          if (modelProfile && base64ModelImage) {
            payload.model = {
              name: modelProfile.name, gender: modelProfile.gender, ethnicity: modelProfile.ethnicity,
              bodyType: modelProfile.bodyType, ageRange: modelProfile.ageRange, imageUrl: base64ModelImage,
            };
          }

          await paceDelay(jobMap.size);

          const result = await enqueueWithRetry(
            {
              jobType: 'workflow',
              payload,
              imageCount: angleMultiplier,
              quality,
              additionalProductCount: 0,
              hasModel: !!modelProfile,
              hasScene: false,
              skipWake: true,
            },
            token,
          );

          if (!isEnqueueError(result)) {
            jobMap.set(`${product.id}_${modelProfile?.modelId || 'no-model'}_${varIdx}_${ratioVal}_${framingVal}`, result.jobId);
            lastBalance = result.newBalance;
            fireFirstgenStartedOnce({
              jobId: result.jobId,
              productId: ((payload as Record<string, unknown>)?.product_id as string | undefined) ?? product?.id ?? null,
              visualType: activeWorkflow?.slug || activeWorkflow?.name || 'workflow',
            });
            injectActiveJob(queryClient, {
              jobId: result.jobId, workflow_id: activeWorkflow?.id, workflow_name: activeWorkflow?.name,
              workflow_slug: activeWorkflow?.slug, product_name: product.title,
              job_type: 'workflow', quality, imageCount: 1, batch_id: batchId,
            });
          } else if (result.type === 'insufficient_credits') {
            toast.error(result.message); break;
          }
          } // end framingVal loop
         } // end ratioVal loop
        } // end varIdx loop
        } // end model loop
      } // end product loop

      if (jobMap.size === 0) {
        toast.error('Could not queue any products');
        setCurrentStep('settings');
        return;
      }
      if (lastBalance !== null) setBalanceFromServer(lastBalance);
      setMultiProductJobIds(jobMap);
      sendWake(token);
      return;
    }

    let sourceImageUrl = '';
    let productData: { title: string; productType: string; description: string; dimensions?: string } = { title: '', productType: '', description: '' };
    if (sourceType === 'scratch' && scratchUpload?.uploadedUrl) {
      sourceImageUrl = scratchUpload.uploadedUrl;
      productData = scratchUpload.productInfo;
    } else if (selectedProduct) {
      const selectedImageId = Array.from(selectedSourceImages)[0];
      const sourceImage = selectedProduct.images.find(img => img.id === selectedImageId);
      sourceImageUrl = sourceImage?.url || selectedProduct.images[0]?.url || '';
      // Look up original UserProduct to get dimensions
      const originalUp = userProducts.find(up => up.id === selectedProduct.id);
      productData = { title: selectedProduct.title, productType: selectedProduct.productType, description: selectedProduct.description, dimensions: originalUp?.dimensions || undefined };
    }
    if (!sourceImageUrl) { toast.error('No source image available'); return; }
    setCurrentStep('generating');
    setGeneratingProgress(0);

    // Convert product image
    const needsModel = uiConfig?.show_model_picker && selectedModel;
    const base64Image = await convertImageToBase64(sourceImageUrl);

    // Determine models to iterate over
    const modelsToGenerate = (isSelfieUgc || isMirrorSelfie) && selectedModels.size > 0
      ? Array.from(selectedModels).map(id => selectedModelMap.get(id)!).filter(Boolean)
      : needsModel ? [selectedModel!] : [];

    // Build styling notes for flat lay
    const flatLayStylingNotes = isFlatLay ? [
      ...selectedAesthetics.map(id => FLAT_LAY_AESTHETICS.find(a => a.id === id)?.hint).filter(Boolean),
      stylingNotes,
    ].filter(Boolean).join(', ') : undefined;

    // Build additional products array for flat lay multi-product (convert images to base64)
    const additionalProducts = isFlatLay && selectedFlatLayProductIds.size > 1
      ? await Promise.all(
          (userProducts.length > 0 ? userProducts : [])
            .filter(up => selectedFlatLayProductIds.has(up.id) && up.id !== selectedProduct?.id)
            .map(async up => ({
              title: up.title,
              productType: up.product_type,
              description: up.description,
              imageUrl: await convertImageToBase64(up.image_url),
            }))
        )
      : undefined;

    // If multiple models for selfie/UGC, use multi-combo path for all
    const useMultiModelLoop = modelsToGenerate.length > 1;

    const buildBasePayload = (): Record<string, unknown> => ({
      workflow_id: activeWorkflow!.id,
      workflow_name: activeWorkflow!.name,
      workflow_slug: activeWorkflow!.slug,
      product: { ...productData, imageUrl: base64Image },
      brand_profile: selectedBrandProfile ? {
        tone: selectedBrandProfile.tone, background_style: selectedBrandProfile.background_style,
        lighting_style: selectedBrandProfile.lighting_style, color_temperature: selectedBrandProfile.color_temperature,
        brand_keywords: selectedBrandProfile.brand_keywords, color_palette: selectedBrandProfile.color_palette,
        target_audience: selectedBrandProfile.target_audience, do_not_rules: selectedBrandProfile.do_not_rules,
        composition_bias: selectedBrandProfile.composition_bias, preferred_scenes: selectedBrandProfile.preferred_scenes,
        photography_reference: selectedBrandProfile.photography_reference,
      } : undefined,
      selected_variations: (() => {
        if (selectedVariationIndices.size === 0) return undefined;
        const { remapped } = remapVariationIndices(Array.from(selectedVariationIndices));
        return remapped;
      })(),
      extra_variations: (() => {
        if (selectedVariationIndices.size === 0) return undefined;
        const { extras } = remapVariationIndices(Array.from(selectedVariationIndices));
        return extras.length > 0 ? extras : undefined;
      })(),
      product_angles: productAngle !== 'front' ? productAngle : undefined,
      quality,
      aspectRatio: selectedAspectRatios.size > 0 ? Array.from(selectedAspectRatios)[0] : aspectRatio,
      framing: selectedFramings.has('auto') ? undefined : (selectedFramings.size > 0 ? Array.from(selectedFramings)[0] : (framing || undefined)),
      styling_notes: flatLayStylingNotes || undefined,
      prop_style: isFlatLay ? flatLayPropStyle : undefined,
      additional_products: additionalProducts,
      ugc_mood: isSelfieUgc ? ugcMood : undefined,
      interaction_phrase: resolveUgcInteractionPhrase(selectedProduct),
      outfit_phrase: isSelfieUgc ? resolveOutfitPhraseForProduct(selectedProduct) : undefined,
      // Interior Design fields
      room_type: isInteriorDesign ? interiorRoomType : undefined,
      wall_color: isInteriorDesign ? interiorWallColor : undefined,
      flooring_preference: isInteriorDesign ? interiorFlooring : undefined,
      interior_type: isInteriorDesign ? interiorType : undefined,
      furniture_style: isInteriorDesign ? interiorFurnitureStyle : undefined,
      lighting_mood: isInteriorDesign ? interiorLightingMood : undefined,
      furniture_handling: isInteriorDesign ? interiorFurnitureHandling : undefined,
      room_size: isInteriorDesign ? interiorRoomSize : undefined,
      key_pieces: isInteriorDesign && interiorKeyPieces.length > 0 ? interiorKeyPieces : undefined,
      design_notes: isInteriorDesign && interiorDesignNotes ? interiorDesignNotes : undefined,
      color_palette_preference: isInteriorDesign && interiorColorPalette ? interiorColorPalette : undefined,
      time_of_day: isInteriorDesign && interiorTimeOfDay !== 'As Photographed' ? interiorTimeOfDay : undefined,
      staging_purpose: isInteriorDesign && interiorPurpose ? interiorPurpose : undefined,
      is_empty_room: isInteriorDesign ? interiorIsEmptyRoom : undefined,
      ceiling_height: isInteriorDesign && interiorCeilingHeight !== 'Standard' ? interiorCeilingHeight : undefined,
      room_dimensions: isInteriorDesign && interiorRoomDimensions ? interiorRoomDimensions : undefined,
      exact_ceiling_height: isInteriorDesign && interiorExactCeilingHeight ? interiorExactCeilingHeight : undefined,
    });

    // Build all ratio × framing combos
    const ratiosToGenerate = selectedAspectRatios.size > 0 ? Array.from(selectedAspectRatios) : [aspectRatio];
    const framingsToGenerate: Array<FramingOption | null> = selectedFramings.has('auto') ? [null] : Array.from(selectedFramings) as FramingOption[];

    // Single ratio/framing combo + single model — use original enqueue/batch logic
    if (ratiosToGenerate.length === 1 && framingsToGenerate.length === 1 && !useMultiModelLoop) {
      const payload = buildBasePayload();
      payload.aspectRatio = ratiosToGenerate[0];
      payload.framing = framingsToGenerate[0] || undefined;

      // Attach single model
      if (modelsToGenerate.length === 1) {
        const m = modelsToGenerate[0];
        const base64ModelImage = await convertImageToBase64(m.previewUrl);
        payload.model = {
          name: m.name, gender: m.gender, ethnicity: m.ethnicity,
          bodyType: m.bodyType, ageRange: m.ageRange, imageUrl: base64ModelImage,
        };
      }

      const baseImageCount = hasWorkflowConfig ? selectedVariationIndices.size * angleMultiplier : parseInt(imageCount);

      if (baseImageCount <= 1) {
        const enqueueResult = await enqueue({
          jobType: 'workflow', payload, imageCount: baseImageCount, quality: 'high', additionalProductCount: 0,
        }, { imageCount: baseImageCount, quality: 'high', hasModel: modelsToGenerate.length > 0, hasScene: false, hasProduct: true });
        if (enqueueResult) {
          setBalanceFromServer(enqueueResult.newBalance);
          injectActiveJob(queryClient, { jobId: enqueueResult.jobId, workflow_id: activeWorkflow?.id, workflow_name: activeWorkflow?.name, workflow_slug: activeWorkflow?.slug, product_name: productData.title, job_type: 'workflow', quality: 'high', imageCount: baseImageCount });
        } else { setCurrentStep('settings'); }
      } else {
        const batchResult = await startBatch({
          payload, selectedVariationIndices: remapVariationIndices(Array.from(selectedVariationIndices)).remapped, angleMultiplier, quality: 'high', imageCount: baseImageCount, hasModel: modelsToGenerate.length > 0, hasScene: false,
          onJobEnqueued: (jobId) => injectActiveJob(queryClient, { jobId, workflow_id: activeWorkflow?.id, workflow_name: activeWorkflow?.name, workflow_slug: activeWorkflow?.slug, product_name: productData.title, job_type: 'workflow', quality: 'high', imageCount: 1 }),
        });
        if (batchResult.success && batchResult.newBalance !== null) { setBalanceFromServer(batchResult.newBalance); }
        if (!batchResult.success) { setCurrentStep('settings'); }
      }
    } else {
      // Multiple combos or multiple models — enqueue each as a separate job
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) { toast.error('Authentication required'); setCurrentStep('settings'); return; }

      
      const batchId = crypto.randomUUID();
      const jobMap = new Map<string, string>();
      let lastBalance: number | null = null;
      const variationIndices = selectedVariationIndices.size > 0 ? Array.from(selectedVariationIndices) : [0];

      const modelIterator = modelsToGenerate.length > 0 ? modelsToGenerate : [null as ModelProfile | null];

      for (const modelProfile of modelIterator) {
        const base64ModelImage = modelProfile ? await convertImageToBase64(modelProfile.previewUrl) : undefined;

        for (const ratio of ratiosToGenerate) {
          for (const framingVal of framingsToGenerate) {
            for (const varIdx of variationIndices) {
              const { remapped: remappedVar, extras: varExtras } = remapVariationIndices([varIdx]);
              const comboPayload: Record<string, unknown> = { ...buildBasePayload(), aspectRatio: ratio, framing: framingVal || undefined, selected_variations: remappedVar, extra_variations: varExtras.length > 0 ? varExtras : undefined, batch_id: batchId };
              if (modelProfile && base64ModelImage) {
                comboPayload.model = {
                  name: modelProfile.name, gender: modelProfile.gender, ethnicity: modelProfile.ethnicity,
                  bodyType: modelProfile.bodyType, ageRange: modelProfile.ageRange, imageUrl: base64ModelImage,
                };
              }
              await paceDelay(jobMap.size);

              const result = await enqueueWithRetry(
                { jobType: 'workflow', payload: comboPayload, imageCount: angleMultiplier, quality: 'high', hasModel: !!modelProfile, hasScene: false, skipWake: true },
                token,
              );

              if (!isEnqueueError(result)) {
                jobMap.set(`${modelProfile?.modelId || 'no-model'}_${varIdx}_${ratio}_${framingVal}`, result.jobId);
                lastBalance = result.newBalance;
                fireFirstgenStartedOnce({
                  jobId: result.jobId,
                  productId: ((comboPayload as Record<string, unknown>)?.product_id as string | undefined) ?? null,
                  visualType: activeWorkflow?.slug || activeWorkflow?.name || 'workflow',
                });
                injectActiveJob(queryClient, { jobId: result.jobId, workflow_id: activeWorkflow?.id, workflow_name: activeWorkflow?.name, workflow_slug: activeWorkflow?.slug, product_name: productData.title, job_type: 'workflow', quality: 'high', imageCount: 1, batch_id: batchId });
              } else if (result.type === 'insufficient_credits') {
                toast.error('Insufficient credits'); break;
              }
            }
          }
        }
      }

      if (jobMap.size === 0) { toast.error('Could not queue any images'); setCurrentStep('settings'); return; }
      if (lastBalance !== null) setBalanceFromServer(lastBalance);
      setMultiProductJobIds(jobMap);
      queryClient.invalidateQueries({ queryKey: ['workflow-active-jobs'] });
      sendWake(token);
    }
    } catch (err) {
      console.error('Workflow generation failed:', err);
      toast.error('Something went wrong starting the generation. Please try again.');
      setCurrentStep('settings');
    }
  };

  // Helper: enqueue a single try-on job via shared retry helper (used for multi-product upfront)
  const enqueueTryOnForProduct = async (product: Product, token: string, poseOverride?: TryOnPose, modelOverride?: ModelProfile, ratioOverride?: AspectRatio, framingOverride?: FramingOption | null, batchId?: string): Promise<{ jobId: string; newBalance: number } | null> => {
    const pose = poseOverride || selectedPose;
    const model = modelOverride || selectedModel;
    if (!model || !pose) return null;
    const selectedImageId = Array.from(selectedSourceImages)[0];
    const sourceImage = product.images.find(img => img.id === selectedImageId);
    const sourceImageUrl = sourceImage?.url || product.images[0]?.url || '';
    if (!sourceImageUrl) return null;

    const [base64ProductImage, base64ModelImage, base64SceneImage] = await Promise.all([
      convertImageToBase64(sourceImageUrl),
      convertImageToBase64(model.previewUrl),
      pose.previewUrl ? convertImageToBase64(pose.previewUrl) : Promise.resolve(undefined),
    ]);

    const effectiveRatio = ratioOverride || (selectedAspectRatios.size > 0 ? Array.from(selectedAspectRatios)[0] : aspectRatio);
    const effectiveFraming = framingOverride !== undefined ? framingOverride : (selectedFramings.has('auto') ? null : (selectedFramings.size > 0 ? Array.from(selectedFramings)[0] as FramingOption : framing));

    const result = await enqueueWithRetry(
      {
        jobType: 'tryon',
        payload: {
          product: { title: product.title, description: product.description, productType: product.productType, imageUrl: base64ProductImage },
          model: { name: model.name, gender: model.gender, ethnicity: model.ethnicity, bodyType: model.bodyType, ageRange: model.ageRange, imageUrl: base64ModelImage, originalImageUrl: model.previewUrl },
          pose: { name: pose.name, description: pose.promptHint || pose.description, category: pose.category, imageUrl: base64SceneImage, originalImageUrl: pose.previewUrl },
          aspectRatio: effectiveRatio, imageCount: parseInt(imageCount),
          framing: effectiveFraming || undefined,
          workflow_id: activeWorkflow?.id || null,
          workflow_name: activeWorkflow?.name || null,
          workflow_slug: activeWorkflow?.slug || null,
          product_id: userProducts.some(up => up.id === product.id) ? product.id : null,
          product_name: product.title,
          product_image_url: sourceImageUrl || await resolveProductImageUrl(product.images[0]?.url),
          brand_profile_id: selectedBrandProfileId || null,
          batch_id: batchId || undefined,
        },
        imageCount: parseInt(imageCount),
        quality,
        hasModel: true,
        hasScene: true,
        skipWake: true,
      },
      token,
    );

    if (isEnqueueError(result)) {
      if (result.type === 'insufficient_credits') {
        toast.error(`Not enough credits for "${product.title}"`);
      } else if (result.type !== 'rate_limit') {
        toast.error(result.message || `Failed to queue "${product.title}"`);
      }
      return null;
    }

    fireFirstgenStartedOnce({
      jobId: result.jobId,
      productId: userProducts.some(up => up.id === product.id) ? product.id : null,
      visualType: activeWorkflow?.slug || activeWorkflow?.name || 'tryon',
    });

    return { jobId: result.jobId, newBalance: result.newBalance };
  };

  const handleTryOnConfirmGenerate = async () => {
    try {
    if (selectedModels.size === 0 || selectedPoses.size === 0) return;
    const posesToGenerate = Array.from(selectedPoses).map(id => selectedPoseMap.get(id)!).filter(Boolean);
    const modelsToGenerate = Array.from(selectedModels).map(id => selectedModelMap.get(id)!).filter(Boolean);

    // Multi-product upfront enqueue
    if (isMultiProductMode) {
      // Pre-check total credits needed before starting
      const ratiosToGen = selectedAspectRatios.size > 0 ? Array.from(selectedAspectRatios) : [aspectRatio];
      const framingsToGen: Array<FramingOption | null> = selectedFramings.has('auto') ? [null] : Array.from(selectedFramings) as FramingOption[];
      const totalJobs = productQueue.length * modelsToGenerate.length * posesToGenerate.length * ratiosToGen.length * framingsToGen.length;
      const creditsPerJob = parseInt(imageCount) * 6;
      const totalCreditsNeeded = totalJobs * creditsPerJob;

      if (balance < totalCreditsNeeded) {
        toast.error(`Need ${totalCreditsNeeded} credits for ${totalJobs} generations but you only have ${balance}. Please top up first.`);
        setNoCreditsModalOpen(true);
        return;
      }

      setTryOnConfirmModalOpen(false);
      setCurrentStep('generating');
      setGeneratingProgress(0);

      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) { toast.error('Authentication required'); setCurrentStep('settings'); return; }

      const batchId = crypto.randomUUID();
      const jobMap = new Map<string, string>();
      const metaMap = new Map<string, { productName: string; ratio: string; framing: string | null }>();
      let lastBalance: number | null = null;
      let enqueueCount = 0;
      for (const product of productQueue) {
        for (const model of modelsToGenerate) {
          for (const pose of posesToGenerate) {
            for (const ratioVal of ratiosToGen) {
              for (const framingVal of framingsToGen) {
                // Stagger requests to avoid platform rate limits
                if (enqueueCount > 0) {
                  await new Promise(r => setTimeout(r, 300));
                }
                const result = await enqueueTryOnForProduct(product, token, pose, model, ratioVal, framingVal, batchId);
                if (result) {
                  const compositeKey = `${product.id}::${model.modelId}::${pose.poseId}::${ratioVal}::${framingVal}`;
                  jobMap.set(compositeKey, result.jobId);
                  metaMap.set(compositeKey, { productName: product.title, ratio: ratioVal, framing: framingVal });
                  lastBalance = result.newBalance;
                  injectActiveJob(queryClient, {
                    jobId: result.jobId, workflow_id: activeWorkflow?.id, workflow_name: activeWorkflow?.name,
                    workflow_slug: activeWorkflow?.slug, product_name: product.title,
                    job_type: 'tryon', quality, imageCount: parseInt(imageCount), batch_id: batchId,
                  });
                }
                enqueueCount++;
              }
            }
          }
        }
      }

      // Single wake to process-queue after all jobs are enqueued
      if (jobMap.size > 0) {
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
        fetch(`${SUPABASE_URL}/functions/v1/enqueue-generation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ jobType: 'tryon', payload: {}, imageCount: 0, wakeOnly: true }),
        }).catch(() => {});
      }

      if (jobMap.size === 0) {
        toast.error('Could not queue any products');
        setCurrentStep('settings');
        return;
      }
      if (lastBalance !== null) setBalanceFromServer(lastBalance);
      setJobMetadata(metaMap);
      setMultiProductJobIds(jobMap);
      queryClient.invalidateQueries({ queryKey: ['workflow-active-jobs'] });
      return;
    }

    // Single product path — enqueue one job per pose
    let sourceImageUrl = '';
    let productData: { title: string; productType: string; description: string } | null = null;
    if (sourceType === 'scratch' && scratchUpload?.uploadedUrl) {
      sourceImageUrl = scratchUpload.uploadedUrl;
      productData = { title: scratchUpload.productInfo.title, productType: scratchUpload.productInfo.productType, description: scratchUpload.productInfo.description };
    } else if (selectedProduct) {
      const selectedImageId = Array.from(selectedSourceImages)[0];
      const sourceImage = selectedProduct.images.find(img => img.id === selectedImageId);
      sourceImageUrl = sourceImage?.url || selectedProduct.images[0]?.url || '';
      productData = { title: selectedProduct.title, productType: selectedProduct.productType, description: selectedProduct.description };
    }
    if (!sourceImageUrl || !productData) { toast.error('No source image available'); return; }
    setTryOnConfirmModalOpen(false);
    setCurrentStep('generating');
    setGeneratingProgress(0);

    const ratiosToGen = selectedAspectRatios.size > 0 ? Array.from(selectedAspectRatios) : [aspectRatio];
    const framingsToGen: Array<FramingOption | null> = selectedFramings.has('auto') ? [null] : Array.from(selectedFramings) as FramingOption[];
    const needsMultiJobs = modelsToGenerate.length > 1 || posesToGenerate.length > 1 || ratiosToGen.length > 1 || framingsToGen.length > 1;

    if (!needsMultiJobs) {
      // Single model + single scene + single ratio + single framing
      const model = modelsToGenerate[0];
      const pose = posesToGenerate[0];
      const base64ProductImage = await convertImageToBase64(sourceImageUrl);
      const base64ModelImage = await convertImageToBase64(model.previewUrl);
      const base64SceneImage = pose.previewUrl ? await convertImageToBase64(pose.previewUrl) : undefined;
      const enqueueResult = await enqueue({
        jobType: 'tryon',
        payload: {
          product: { title: productData.title, description: productData.description, productType: productData.productType, imageUrl: base64ProductImage },
          model: { name: model.name, gender: model.gender, ethnicity: model.ethnicity, bodyType: model.bodyType, ageRange: model.ageRange, imageUrl: base64ModelImage },
          pose: { name: pose.name, description: pose.promptHint || pose.description, category: pose.category, imageUrl: base64SceneImage },
          aspectRatio: ratiosToGen[0], imageCount: parseInt(imageCount),
          framing: framingsToGen[0] || undefined,
          workflow_id: activeWorkflow?.id || null,
          workflow_name: activeWorkflow?.name || null,
          workflow_slug: activeWorkflow?.slug || null,
          product_id: selectedProduct && userProducts.some(up => up.id === selectedProduct.id) ? selectedProduct.id : null,
          product_name: selectedProduct?.title || productData.title,
          product_image_url: await resolveProductImageUrl(selectedProduct?.images[0]?.url),
          brand_profile_id: selectedBrandProfileId || null,
        },
        imageCount: parseInt(imageCount),
        quality,
      }, {
        imageCount: parseInt(imageCount),
        quality,
        hasModel: true,
        hasScene: true,
        hasProduct: true,
      });
      if (enqueueResult) {
        setBalanceFromServer(enqueueResult.newBalance);
        injectActiveJob(queryClient, {
          jobId: enqueueResult.jobId, workflow_id: activeWorkflow?.id, workflow_name: activeWorkflow?.name,
          workflow_slug: activeWorkflow?.slug, product_name: selectedProduct?.title || productData?.title,
          job_type: 'tryon', quality, imageCount: parseInt(imageCount),
        });
        queryClient.invalidateQueries({ queryKey: ['workflow-active-jobs'] });
      } else {
        setCurrentStep('settings');
      }
    } else {
      // Multi-model/scene/ratio/framing — use direct fetch for each combination
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) { toast.error('Authentication required'); setCurrentStep('settings'); return; }

      const batchId = crypto.randomUUID();
      const jobMap = new Map<string, string>();
      const metaMap = new Map<string, { productName: string; ratio: string; framing: string | null }>();
      let lastBalance: number | null = null;
      const product = selectedProduct || { id: 'scratch', title: productData.title, description: productData.description, productType: productData.productType, vendor: '', tags: [], images: [{ id: 'scratch-img', url: sourceImageUrl }], status: 'active' as const, createdAt: '', updatedAt: '' };
      const productName = selectedProduct?.title || productData?.title || '';

      for (const model of modelsToGenerate) {
        for (const pose of posesToGenerate) {
          for (const ratioVal of ratiosToGen) {
            for (const framingVal of framingsToGen) {
              await paceDelay(jobMap.size);
              const result = await enqueueTryOnForProduct(product as Product, token, pose, model, ratioVal, framingVal, batchId);
              if (result) {
                const compositeKey = `${model.modelId}::${pose.poseId}::${ratioVal}::${framingVal}`;
                jobMap.set(compositeKey, result.jobId);
                metaMap.set(compositeKey, { productName, ratio: ratioVal, framing: framingVal });
                lastBalance = result.newBalance;
                injectActiveJob(queryClient, {
                  jobId: result.jobId, workflow_id: activeWorkflow?.id, workflow_name: activeWorkflow?.name,
                  workflow_slug: activeWorkflow?.slug, product_name: productName,
                  job_type: 'tryon', quality, imageCount: parseInt(imageCount), batch_id: batchId,
                });
              }
            }
          }
        }
      }

      if (jobMap.size === 0) {
        toast.error('Could not queue any combinations');
        setCurrentStep('settings');
        return;
      }
      if (lastBalance !== null) setBalanceFromServer(lastBalance);
      setJobMetadata(metaMap);
      setMultiProductJobIds(jobMap);
      queryClient.invalidateQueries({ queryKey: ['workflow-active-jobs'] });
      sendWake(token);
    }
    } catch (err) {
      console.error('Try-on generation failed:', err);
      toast.error('Something went wrong starting the generation. Please try again.');
      setCurrentStep('settings');
    }
  };

  // Watch queue job completion to transition to results (single-product only)
  useEffect(() => {
    if (!activeJob) return;
    // Multi-product uses its own polling, skip here
    if (multiProductJobIds.size > 0) return;
    // When a batch is active, let the batch watcher handle aggregation
    if (batchState) return;
    // Don't let stale activeJob overwrite results already on screen
    if (currentStep === 'results') return;
    if (activeJob.status === 'completed' && activeJob.result) {
      const result = activeJob.result as { images?: string[]; variations?: Array<{ label: string }> };
      if (result.images && result.images.length > 0) {
        setGeneratedImages(result.images);
        setWorkflowVariationLabels(result.variations?.map(v => v.label) || []);
        setGeneratingProgress(100);
        setCompletedFeedbackJobId(activeJob.id);
        setCurrentStep('results');
        toast.success(`Generated ${result.images.length} images!`);
        refreshBalance();
        queryClient.invalidateQueries({ queryKey: ['library'] });
        queryClient.invalidateQueries({ queryKey: ['recent-creations'] });
        resetQueue();
      }
    }
    // Failed status is now handled by onGenerationFailed callback in useGenerationQueue
  }, [activeJob, refreshBalance, resetQueue, multiProductJobIds.size, batchState, currentStep]);

  // Watch batch completion (single-product only)
  useEffect(() => {
    if (!batchState) return;
    if (multiProductJobIds.size > 0) return;
    if (batchState.allDone) {
      if (batchState.aggregatedImages.length > 0) {
        setGeneratedImages(batchState.aggregatedImages);
        setWorkflowVariationLabels(batchState.aggregatedLabels);
        setGeneratingProgress(100);
        setCompletedFeedbackJobId(batchState.jobs.find(j => j.status === 'completed')?.jobId || null);
        setCurrentStep('results');
        if (batchState.hasPartialFailure) {
          toast.warning(`Generated ${batchState.aggregatedImages.length} images. ${batchState.failedJobs} batch${batchState.failedJobs > 1 ? 'es' : ''} failed — credits refunded for those.`);
        } else {
          toast.success(`Generated ${batchState.aggregatedImages.length} images!`);
        }
        refreshBalance();
        queryClient.invalidateQueries({ queryKey: ['library'] });
        queryClient.invalidateQueries({ queryKey: ['recent-creations'] });
        resetBatch();
      } else {
        toast.error('All generation batches failed. Credits have been refunded.');
        setCurrentStep('settings');
        refreshBalance();
        resetBatch();
      }
    }
  }, [batchState, refreshBalance, resetBatch, multiProductJobIds.size]);

  // Multi-product upfront polling: watch all enqueued job IDs
  useEffect(() => {
    if (multiProductJobIds.size === 0) return;
    // Cleanup on unmount
    return () => {
      if (multiProductPollingRef.current) {
        clearInterval(multiProductPollingRef.current);
        multiProductPollingRef.current = null;
      }
    };
  }, [multiProductJobIds.size]);

  useEffect(() => {
    if (multiProductJobIds.size === 0) return;

    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const jobIds = Array.from(multiProductJobIds.values());

    const poll = async () => {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token || SUPABASE_KEY;

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/generation_queue?id=in.(${jobIds.join(',')})&select=id,status,result,error_message,completed_at`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return;
      const rows = await res.json() as Array<{ id: string; status: string; result: { images?: string[]; variations?: Array<{ label: string }> } | null; error_message: string | null; completed_at: string | null }>;

      // Build a map from job ID → row for reliable lookup
      const rowMap = new Map<string, (typeof rows)[number]>();
      for (const row of rows) rowMap.set(row.id, row);

      // Check ALL expected jobs (not just returned rows) for terminal status
      const completedResults = new Map<string, { images: string[]; labels: string[] }>();
      let allTerminal = true;
      let completedCount = 0;
      let failedCount = 0;

      for (const [prodId, jobId] of multiProductJobIds.entries()) {
        const row = rowMap.get(jobId);
        if (!row) {
          // Job not returned by API yet — not terminal
          allTerminal = false;
          continue;
        }
        if (row.status === 'completed' && row.result?.images) {
          completedCount++;
          completedResults.set(prodId, {
            images: row.result.images,
            labels: row.result.variations?.map(v => v.label) || [],
          });
        } else if (row.status === 'failed' || row.status === 'cancelled') {
          failedCount++;
        } else {
          allTerminal = false;
        }
      }

      // Update progress
      const totalJobs = multiProductJobIds.size;
      const doneCount = completedCount + failedCount;
      setGeneratingProgress(Math.round((doneCount / totalJobs) * 100));
      setCurrentProductIndex(doneCount);
      setMultiProductResults(completedResults);

      if (allTerminal) {
        // Stop polling
        if (multiProductPollingRef.current) {
          clearInterval(multiProductPollingRef.current);
          multiProductPollingRef.current = null;
        }

        // Aggregate results using stored metadata for reliable grouping
        const allImages: string[] = [];
        const allLabels: string[] = [];
        for (const [key] of multiProductJobIds) {
          const r = completedResults.get(key);
          if (r) {
            const meta = jobMetadata.get(key);
            const prefix = meta?.productName || '';

            // Use edge function labels if provided, otherwise build from metadata
            const labels = r.labels.length > 0
              ? r.labels
              : r.images.map(() => {
                  const parts: string[] = [];
                  if (meta?.ratio && meta.ratio !== 'null') parts.push(meta.ratio);
                  if (meta?.framing && meta.framing !== 'null' && meta.framing !== 'auto') parts.push(String(meta.framing).replace(/_/g, ' '));
                  return parts.join(' · ') || 'Generated';
                });

            allImages.push(...r.images);
            allLabels.push(...labels.map(l => prefix ? `${prefix} — ${l}` : l));
          }
        }

        if (allImages.length > 0) {
          // Finalizing handoff: brief pause before showing results
          setIsFinalizingResults(true);
          setGeneratingProgress(100);
          await new Promise(r => setTimeout(r, 1500));
          setGeneratedImages(allImages);
          setWorkflowVariationLabels(allLabels);
          setIsFinalizingResults(false);
          setCompletedFeedbackJobId([...multiProductJobIds.keys()][0] || null);
          setCurrentStep('results');
          if (failedCount > 0) {
            toast.warning(`Completed with ${failedCount} failure${failedCount > 1 ? 's' : ''}. ${allImages.length} images generated.`);
          } else {
            toast.success(`Generated ${allImages.length} images!`);
          }
        } else {
          toast.error('All generations failed. Credits refunded.');
          setCurrentStep('settings');
        }
        refreshBalance();
        queryClient.invalidateQueries({ queryKey: ['library'] });
        queryClient.invalidateQueries({ queryKey: ['recent-creations'] });
        resetQueue();
        setMultiProductJobIds(new Map());
        setJobMetadata(new Map());
      }
    };

    // Poll immediately, then every 3 seconds
    poll();
    multiProductPollingRef.current = setInterval(poll, 3000);

    return () => {
      if (multiProductPollingRef.current) {
        clearInterval(multiProductPollingRef.current);
        multiProductPollingRef.current = null;
      }
    };
  }, [multiProductJobIds, productQueue, refreshBalance, queryClient]);

  const handlePublishClick = () => {
    if (selectedForPublish.size === 0) { toast.error('Please select at least one image to download'); return; }
    selectedForPublish.forEach(idx => handleDownloadImage(idx));
    navigate('/app/library');
  };
  const handlePublish = (mode: 'add' | 'replace') => {
    
    setPublishModalOpen(false);
    navigate('/app/library');
  };
  const toggleImageSelection = (index: number) => {
    setSelectedForPublish(prev => { const s = new Set(prev); s.has(index) ? s.delete(index) : s.add(index); return s; });
  };
  const handleImageClick = (index: number) => { setLightboxIndex(index); setLightboxOpen(true); };
  const buildFileName = (index: number) => {
    const sanitize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').substring(0, 30);
    const parts: string[] = [];
    const productName = selectedProduct?.title || scratchUpload?.productInfo.title;
    if (productName) parts.push(sanitize(productName));
    if (activeWorkflow?.name) parts.push(sanitize(activeWorkflow.name));
    if (selectedModel?.name) parts.push(sanitize(selectedModel.name));
    // Add variation label if available
    if (variationStrategy?.variations?.length && selectedVariationIndices.size > 0) {
      const sortedIndices = Array.from(selectedVariationIndices).sort((a, b) => a - b);
      const variationIndex = sortedIndices[index % sortedIndices.length];
      const label = variationStrategy.variations[variationIndex]?.label;
      if (label) parts.push(sanitize(label));
    }
    parts.push(String(index + 1));
    return parts.join('-') + '.png';
  };

  const handleDownloadImage = async (index: number) => {
    const url = generatedImages[index];
    try {
      const response = await fetch(url);
      const contentType = response.headers.get('content-type');
      const ext = getExtensionFromContentType(contentType);
      const baseName = buildFileName(index).replace(/\.[^.]+$/, '');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${baseName}${ext}`;
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error('Download failed');
    }
  };
  const [zipDownloading, setZipDownloading] = useState(false);
  const [zipPct, setZipPct] = useState(0);
  const handleDownloadZip = async (indices?: number[]) => {
    const urls = indices ? indices.map(i => generatedImages[i]) : generatedImages;
    if (urls.length === 0) return;
    if (urls.length === 1) { await handleDownloadImage(indices?.[0] ?? 0); return; }
    setZipDownloading(true);
    setZipPct(0);
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const workflowName = activeWorkflow?.name || 'Virtual Try On Set';
      const zipName = `${dateStr}-${workflowName} (VOVV.AI)`;

      // Build per-product counters for sequential numbering
      const counters: Record<string, number> = {};
      const images = urls.map((url, i) => {
        const originalIdx = indices?.[i] ?? i;
        const label = workflowVariationLabels[originalIdx] || '';
        const productName = (label.split(' — ')[0] || selectedProduct?.title || scratchUpload?.productInfo.title || 'Generated').trim();
        counters[productName] = (counters[productName] || 0) + 1;
        return { url, workflow_name: zipName, scene_name: `${productName}_${counters[productName]}` };
      });
      await downloadDropAsZip(images, zipName, pct => setZipPct(pct));
    } catch { toast.error('Download failed'); }
    finally { setZipDownloading(false); }
  };
  const handleRegenerate = (index: number) => toast.info('Regenerating variation... (this would cost 1 credit)');

  const getStepNumber = () => {
    if (isUpscale) {
      const map: Record<string, number> = { source: 1, product: 1, upload: 1, library: 1, settings: 2, generating: 3, results: 3 };
      return map[currentStep] || 1;
    }
    if (isFlatLay) {
      if (currentStep === 'settings' && flatLayPhase === 'surfaces') return 3;
      if (currentStep === 'settings' && flatLayPhase === 'details') return 4;
      const map: Record<string, number> = { source: 1, product: 1, upload: 1, 'brand-profile': 2, generating: 5, results: 5 };
      return map[currentStep] || 1;
    }
    if (isMirrorSelfie) {
      if (currentStep === 'settings' && mirrorSettingsPhase === 'scenes') {
        return 2;
      }
      if (currentStep === 'settings' && mirrorSettingsPhase === 'final') {
        return 4;
      }
      const map: Record<string, number> = { source: 1, product: 1, upload: 1, model: 3, generating: 5, results: 5 };
      return map[currentStep] || 1;
    }
    if (isSelfieUgc) {
      const map: Record<string, number> = { source: 1, product: 1, upload: 1, interaction: 2, model: 3, settings: 4, generating: 5, results: 5 };
      return map[currentStep] || 1;
    }
    if (generationMode === 'virtual-try-on') {
      const map: Record<string, number> = { source: 1, product: 1, upload: 1, 'brand-profile': 2, mode: 2, model: 3, pose: 4, settings: 5, generating: 6, results: 6 };
      return map[currentStep] || 1;
    }
    if (isInteriorDesign) {
      const map: Record<string, number> = { source: 1, upload: 2, settings: 3, generating: 4, results: 4 };
      return map[currentStep] || 1;
    }
    if (isAngleWorkflow) {
      const map: Record<string, number> = { source: 1, product: 1, upload: 1, library: 1, settings: 2, generating: 3, results: 3 };
      return map[currentStep] || 1;
    }
    if (hasWorkflowConfig && uiConfig?.skip_template) {
      if (uiConfig?.show_model_picker) {
        const map: Record<string, number> = { source: 1, product: 1, upload: 1, 'brand-profile': 2, mode: 2, model: 3, settings: 4, generating: 5, results: 5 };
        return map[currentStep] || 1;
      }
      const map: Record<string, number> = { source: 1, product: 1, upload: 1, 'brand-profile': 2, mode: 2, settings: 3, generating: 4, results: 4 };
      return map[currentStep] || 1;
    }
    const map: Record<string, number> = { source: 1, product: 1, upload: 1, 'brand-profile': 2, mode: 2, template: 3, settings: 4, generating: 5, results: 5 };
    return map[currentStep] || 1;
  };

  const getSteps = () => {
    if (isUpscale) {
      return [
        { name: sourceType === 'scratch' ? 'Upload' : sourceType === 'library' ? 'Library' : 'Product(s)' },
        { name: 'Settings' },
        { name: 'Results' },
      ];
    }
    if (isFlatLay) {
      return [
        { name: sourceType === 'scratch' ? 'Source' : 'Product(s)' },
        { name: 'Brand' },
        { name: 'Surfaces' },
        { name: 'Details' },
        { name: 'Results' },
      ];
    }
    if (isMirrorSelfie) {
      return [
        { name: sourceType === 'scratch' ? 'Source' : 'Product' },
        { name: 'Scenes' },
        { name: 'Model' },
        { name: 'Settings' },
        { name: 'Results' },
      ];
    }
    if (isSelfieUgc) {
      return [
        { name: sourceType === 'scratch' ? 'Source' : 'Product' },
        { name: 'Interaction' }, { name: 'Model' }, { name: 'Settings' }, { name: 'Results' },
      ];
    }
    if (generationMode === 'virtual-try-on') {
      return [
        { name: sourceType === 'scratch' ? 'Source' : 'Product' },
        { name: 'Brand' },
        { name: 'Model' }, { name: 'Scene' }, { name: 'Settings' }, { name: 'Results' },
      ];
    }
    if (isInteriorDesign) {
      return [{ name: 'Type' }, { name: 'Upload Photo' }, { name: 'Style' }, { name: 'Results' }];
    }
    if (isAngleWorkflow) {
      return [
        { name: sourceType === 'scratch' ? 'Source' : sourceType === 'library' ? 'Library' : 'Product(s)' },
        { name: 'Settings' },
        { name: 'Results' },
      ];
    }
    if (hasWorkflowConfig && uiConfig?.skip_template) {
      if (uiConfig?.show_model_picker) {
        return [{ name: sourceType === 'scratch' ? 'Source' : 'Product' }, { name: 'Brand' }, { name: 'Model' }, { name: 'Settings' }, { name: 'Results' }];
      }
      return [{ name: sourceType === 'scratch' ? 'Source' : 'Product' }, { name: 'Brand' }, { name: 'Settings' }, { name: 'Results' }];
    }
    return [{ name: sourceType === 'scratch' ? 'Source' : 'Product' }, { name: 'Brand' }, { name: 'Template' }, { name: 'Settings' }, { name: 'Results' }];
  };

  const angleMultiplier = productAngle === 'all' ? 3 : productAngle === 'front' ? 1 : 2;
  const aspectRatioCount = Math.max(1, selectedAspectRatios.size);
  const framingCount = selectedFramings.has('auto') ? 1 : Math.max(1, selectedFramings.size);
  const workflowModelCount = (isSelfieUgc || isMirrorSelfie) && selectedModels.size > 1 ? selectedModels.size : 1;
  const workflowImageCount = hasWorkflowConfig ? selectedVariationIndices.size * angleMultiplier * aspectRatioCount * framingCount * workflowModelCount : parseInt(imageCount);
  const extraProductCount = isFlatLay && selectedFlatLayProductIds.size > 1 ? selectedFlatLayProductIds.size - 1 : 0;
  const extraProductCredits = extraProductCount * 2 * workflowImageCount;
  const multiProductCount = isMultiProductMode ? productQueue.length : 1;
  const tryOnSceneCount = generationMode === 'virtual-try-on' ? Math.max(1, selectedPoses.size) : 1;
  const tryOnModelCount = generationMode === 'virtual-try-on' ? Math.max(1, selectedModels.size) : 1;
  const upscaleImageCount = isUpscale ? (isMultiProductMode ? productQueue.length : 1) : 0;
  const upscaleCreditCost = isUpscale ? upscaleImageCount * (upscaleResolution === '4k' ? 15 : 10) : 0;
  const workflowCostPerImage = 6;
  const singleProductCreditCost = isUpscale ? 0 : (generationMode === 'virtual-try-on' && !isSelfieUgc && !isMirrorSelfie ? parseInt(imageCount) * 6 * tryOnSceneCount * tryOnModelCount * aspectRatioCount * framingCount : (hasWorkflowConfig ? workflowImageCount * workflowCostPerImage : parseInt(imageCount) * 6 * tryOnSceneCount));
  const creditCost = isUpscale ? upscaleCreditCost : (singleProductCreditCost * multiProductCount) + extraProductCredits;

  const pageTitle = activeWorkflow ? `Create: ${activeWorkflow.name}` : 'Generate Visuals';

  return (
    <PageHeader title={pageTitle} backAction={{ content: activeWorkflow ? 'Visual Studio' : 'Dashboard', onAction: () => navigate(activeWorkflow ? '/app/workflows' : '/app') }}>
      <SEOHead title="Generate — VOVV.AI" description="Generate AI product visuals." noindex />
      <div className="space-y-6 overflow-x-hidden">
        

        {/* Workflow Info Banner */}
        {activeWorkflow && (
          <Alert className="hidden sm:block">
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{activeWorkflow.name}</p>
                  <p className="text-xs text-muted-foreground">{activeWorkflow.description}</p>
                </div>
                <Badge variant="secondary">{activeWorkflow.uses_tryon ? 'Try-On' : 'Visual Type'}</Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Recreate from Discover banner */}
        {recreateSource && (
          <Alert className="border-primary/20 bg-primary/5">
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">Recreating look from Explore</span>
                  {recreateSource.modelName && (
                    <Badge variant="secondary" className="text-xs gap-1.5 pl-1 pr-2">
                      {recreateSource.modelImageUrl && (
                        <img src={getOptimizedUrl(recreateSource.modelImageUrl, { quality: 40 })} alt="" className="w-5 h-5 rounded object-cover" />
                      )}
                      {recreateSource.modelName}
                    </Badge>
                  )}
                  {recreateSource.sceneName && (
                    <Badge variant="secondary" className="text-xs gap-1.5 pl-1 pr-2">
                      {recreateSource.sceneImageUrl && (
                        <img src={getOptimizedUrl(recreateSource.sceneImageUrl, { quality: 40 })} alt="" className="w-5 h-5 rounded object-cover" />
                      )}
                      {recreateSource.sceneName}
                    </Badge>
                  )}
                </div>
                <button onClick={() => setRecreateSource(null)} className="text-muted-foreground/60 hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-1 sm:gap-2 overflow-hidden">
              {getSteps().map((step, index) => (
                <div key={step.name} className="flex items-center gap-1 sm:gap-2 min-w-0">
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-medium flex-shrink-0 ${
                    getStepNumber() > index + 1 ? 'bg-primary text-primary-foreground'
                    : getStepNumber() === index + 1 ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                  }`}>
                    {getStepNumber() > index + 1 ? '✓' : index + 1}
                  </div>
                  <span className={`text-xs hidden md:inline truncate ${getStepNumber() === index + 1 ? 'font-semibold' : 'text-muted-foreground'}`}>
                    {step.name}
                  </span>
                  {index < getSteps().length - 1 && (
                    <div className={`w-3 sm:w-6 md:w-10 h-0.5 flex-shrink ${getStepNumber() > index + 1 ? 'bg-primary' : 'bg-muted'}`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Source Selection — Interior Design: Type Toggle */}
        {currentStep === 'source' && isInteriorDesign && (
          <Card><CardContent className="p-5 space-y-5">
            <div>
              <h2 className="text-base font-semibold">Choose Staging Type</h2>
              <p className="text-sm text-muted-foreground">Are you staging an interior room or an exterior/facade?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: 'interior' as const, label: 'Interior', desc: 'Rooms & indoor spaces' },
                { id: 'exterior' as const, label: 'Exterior', desc: 'Building facades & outdoor' },
              ]).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setInteriorType(opt.id)}
                  className={cn(
                    'p-4 sm:p-6 rounded-xl border-2 text-left transition-all cursor-pointer',
                    interiorType === opt.id
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/40'
                  )}
                >
                  <p className="text-base sm:text-lg font-semibold">{opt.label}</p>
                  <p className="text-sm text-muted-foreground mt-1">{opt.desc}</p>
                  {interiorType === opt.id && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm font-medium">Selected</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep('upload')}>Continue</Button>
            </div>
          </CardContent></Card>
        )}

        {/* Source Selection — Non-Interior */}
        {currentStep === 'source' && !isInteriorDesign && (
          <Card><CardContent className="p-5 space-y-5">
            <div>
              <h2 className="text-base font-semibold">
                {activeWorkflow?.uses_tryon ? 'Add Your Product' : 'How do you want to start?'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {activeWorkflow?.uses_tryon
                  ? 'Choose a clothing item from your products or upload a new photo to try on.'
                  : 'Choose whether to use existing products or upload your own image file.'}
              </p>
            </div>
            {activeWorkflow?.uses_tryon ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => { setSourceType('product'); setSelectedProduct(null); setScratchUpload(null); }}
                  className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer ${
                    sourceType === 'product'
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50 hover:bg-muted'
                  }`}
                >
                  <div className="space-y-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${
                      sourceType === 'product' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Shirt className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base sm:text-lg font-semibold">From My Products</p>
                      <p className="text-sm text-muted-foreground">Select a clothing item you've already added to your product library</p>
                    </div>
                    {sourceType === 'product' && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => { setSourceType('scratch'); setSelectedProduct(null); setScratchUpload(null); }}
                  className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer ${
                    sourceType === 'scratch'
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50 hover:bg-muted'
                  }`}
                >
                  <div className="space-y-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${
                      sourceType === 'scratch' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <UploadIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base sm:text-lg font-semibold">Upload New Photo</p>
                      <p className="text-sm text-muted-foreground">Upload a clothing photo — model shots, mannequin, or hanger photos work best</p>
                    </div>
                    {sourceType === 'scratch' && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            ) : (
              <SourceTypeSelector sourceType={sourceType} onChange={type => { setSourceType(type); setSelectedProduct(null); setScratchUpload(null); setSelectedLibraryIds(new Set()); }} showLibrary={isAngleWorkflow || isUpscale} />
            )}
            <div className="flex justify-end">
              <Button disabled={!sourceType} onClick={() => setCurrentStep(sourceType === 'product' ? 'product' : sourceType === 'library' ? 'library' as Step : 'upload')}>Continue</Button>
            </div>
          </CardContent></Card>
        )}

        {/* Upload Step for Interior Design — show room details below upload */}

        {/* Upload Step */}
        {currentStep === 'upload' && (
          <Card><CardContent className="p-5 space-y-5">
            <div className={cn(
              activeWorkflow?.uses_tryon && !scratchUpload
                ? 'grid grid-cols-1 lg:grid-cols-[1fr,220px] gap-4'
                : ''
            )}>
              {/* Left column: Upload area */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold">
                    {isInteriorDesign ? 'Upload Your Photo' : activeWorkflow?.uses_tryon ? 'Upload Your Clothing Photo' : 'Upload Your Image'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isInteriorDesign
                      ? 'Upload a photo of the room or building you want to transform. Empty rooms or plain exteriors work best.'
                      : activeWorkflow?.uses_tryon
                      ? 'Upload a clear photo of the clothing item you want to try on.'
                      : 'Upload a product image from your computer.'}
                  </p>
                </div>

                {/* Contextual upload tips for interior/exterior */}
                {isInteriorDesign && !scratchUpload && (
                  <Alert className="border-primary/20 bg-primary/5">
                    <Info className="w-4 h-4 text-primary" />
                    <AlertDescription className="text-xs space-y-1">
                      {interiorType === 'interior' ? (
                        <ul className="list-disc list-inside text-muted-foreground">
                          <li>Shoot from a corner to capture two walls for best depth</li>
                          <li>Use well-lit, daytime photos — avoid heavy shadows</li>
                          <li>Avoid extreme wide-angle or fisheye lens distortion</li>
                        </ul>
                      ) : (
                        <ul className="list-disc list-inside text-muted-foreground">
                          <li>Shoot straight-on or at a 30° angle for best results</li>
                          <li>Include the full facade — avoid cutting off edges</li>
                          <li>Daytime photos with even lighting work best</li>
                        </ul>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <UploadSourceCard scratchUpload={scratchUpload} onUpload={setScratchUpload} onRemove={() => { setScratchUpload(null); setSaveToLibrary(false); }}
                  onUpdateProductInfo={info => { setScratchUpload(prev => prev ? { ...prev, productInfo: info } : prev); }}
                  isUploading={isUploading}
                  variant={isInteriorDesign ? 'room' : 'product'}
                  saveToLibrary={saveToLibrary}
                  onSaveToLibraryChange={isInteriorDesign ? undefined : setSaveToLibrary}
                />

                {/* Recent uploads as collapsible section below upload area */}
                {isInteriorDesign && previousUploads.length > 0 && !scratchUpload && (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group w-full">
                      <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                      Or reuse a previous photo ({previousUploads.length} available)
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-3">
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {previousUploads.slice(0, 10).map((upload) => (
                          <button
                            key={upload.name}
                            type="button"
                            onClick={() => {
                              setScratchUpload({
                                file: new File([], upload.name),
                                previewUrl: upload.url,
                                uploadedUrl: upload.url,
                                productInfo: { title: 'Uploaded Room', productType: 'Room', description: '' },
                              });
                            }}
                            className="aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors bg-muted"
                          >
                            <img src={upload.url} alt="Previous upload" className="w-full h-full object-cover" loading="lazy" />
                          </button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Interior / Exterior Staging: Room Details right below the upload */}
                {isInteriorDesign && scratchUpload && (
                  <Card><CardContent className="p-5 space-y-4">
                    <div>
                      <h3 className="text-base font-semibold flex items-center gap-2">
                        Room Details
                      </h3>
                      <p className="text-sm text-muted-foreground">Specify the space type and optional preferences</p>
                    </div>
                    <div className="space-y-4">
                      {/* Staging Purpose */}
                      <div className="space-y-2">
                        <Label>Staging Purpose <span className="text-xs text-muted-foreground">(optional)</span></Label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: 'real-estate', label: 'Real Estate Listing' },
                            { id: 'design-portfolio', label: 'Design Portfolio' },
                            { id: 'airbnb', label: 'Airbnb / Rental' },
                            { id: 'personal', label: 'Personal Inspiration' },
                          ].map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setInteriorPurpose(interiorPurpose === p.id ? '' : p.id)}
                              className={cn(
                                'px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
                                interiorPurpose === p.id
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-card border-border hover:border-primary hover:bg-primary/5'
                              )}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Room / Space Type */}
                      <div className="space-y-2">
                        <Label>{interiorType === 'interior' ? 'Room Type' : 'Exterior Area'} <span className="text-destructive">*</span></Label>
                        <Select value={interiorRoomType} onValueChange={setInteriorRoomType}>
                          <SelectTrigger><SelectValue placeholder="Select room type..." /></SelectTrigger>
                          <SelectContent>
                            {(interiorType === 'interior' ? INTERIOR_ROOM_TYPES : EXTERIOR_ROOM_TYPES).map(rt => (
                              <SelectItem key={rt} value={rt}>{rt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Empty Room Toggle */}
                      {interiorType === 'interior' && (
                        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                          <div>
                            <Label className="text-sm font-medium">Empty Room</Label>
                            <p className="text-xs text-muted-foreground">Room has no furniture — stage from scratch</p>
                          </div>
                          <Switch checked={interiorIsEmptyRoom} onCheckedChange={setInteriorIsEmptyRoom} />
                        </div>
                      )}

                      {/* Furniture Handling (interior only) */}
                      {interiorType === 'interior' && (
                      <div className="space-y-2">
                        <Label>Furniture <span className="text-xs text-muted-foreground">(how to handle existing pieces)</span></Label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'Keep & Restyle', label: 'Keep & Restyle', desc: 'Keep pieces, update style' },
                            { value: 'Replace All', label: 'Replace All', desc: 'Fully restage the room' },
                            { value: 'Keep Layout, Swap Style', label: 'Keep Layout', desc: 'Same layout, new pieces' },
                          ].map(opt => {
                            const isDisabledByEmpty = interiorIsEmptyRoom && opt.value !== 'Replace All';
                            return (
                            <button
                              key={opt.value}
                              type="button"
                              disabled={isDisabledByEmpty}
                              onClick={() => {
                                setInteriorFurnitureHandling(opt.value);
                                if (opt.value === 'Keep & Restyle') setInteriorFurnitureStyle('Match Design Style');
                              }}
                              className={cn(
                                'rounded-lg border-2 p-3 text-left transition-colors',
                                isDisabledByEmpty && 'opacity-40 cursor-not-allowed',
                                interiorFurnitureHandling === opt.value
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/40'
                              )}
                            >
                              <span className="text-sm font-medium block">{opt.label}</span>
                              <span className="text-xs text-muted-foreground">{opt.desc}</span>
                            </button>
                            );
                          })}
                        </div>
                      </div>
                      )}

                      {/* Room Size + Ceiling Height */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{interiorType === 'interior' ? 'Room Size' : 'Area Size'} <span className="text-xs text-muted-foreground">({interiorType === 'interior' ? 'helps scale furniture' : 'helps scale elements'})</span></Label>
                          <Select value={interiorRoomSize} onValueChange={setInteriorRoomSize}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Small">Small (under 10 sqm / 100 sqft)</SelectItem>
                              <SelectItem value="Medium">Medium (10–20 sqm / 100–200 sqft)</SelectItem>
                              <SelectItem value="Large">Large (20–40 sqm / 200–400 sqft)</SelectItem>
                              <SelectItem value="Very Large">Very Large (40+ sqm / 400+ sqft)</SelectItem>
                            </SelectContent>
                          </Select>
                          {/* Exact Room Dimensions */}
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Exact Dimensions <span className="text-xs">(optional)</span></Label>
                            <input
                              type="text"
                              placeholder="e.g. 4.5m x 3.2m or 15ft x 10ft"
                              value={interiorRoomDimensions}
                              onChange={e => setInteriorRoomDimensions(e.target.value)}
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                          </div>
                        </div>
                        {interiorType === 'interior' && (
                        <div className="space-y-2">
                          <Label>Ceiling Height <span className="text-xs text-muted-foreground">(optional)</span></Label>
                          <Select value={interiorCeilingHeight} onValueChange={setInteriorCeilingHeight}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Low">Low (under 2.4m / 8ft)</SelectItem>
                              <SelectItem value="Standard">Standard (2.4–2.7m / 8–9ft)</SelectItem>
                              <SelectItem value="High">High (2.7m+ / 9ft+)</SelectItem>
                              <SelectItem value="Double Height">Double Height (5m+ / 16ft+)</SelectItem>
                            </SelectContent>
                          </Select>
                          {/* Exact Ceiling Height */}
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Exact Height <span className="text-xs">(optional)</span></Label>
                            <input
                              type="text"
                              placeholder="e.g. 2.8m or 9.5ft"
                              value={interiorExactCeilingHeight}
                              onChange={e => setInteriorExactCeilingHeight(e.target.value)}
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                          </div>
                        </div>
                        )}
                      </div>

                      {/* Wall Color & Flooring (interior only) */}
                      {interiorType === 'interior' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Wall Color <span className="text-xs text-muted-foreground">(optional)</span></Label>
                            <Select value={interiorWallColor} onValueChange={setInteriorWallColor}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {['Keep Original', 'White', 'Warm White', 'Light Gray', 'Beige / Cream', 'Sage Green', 'Navy Blue', 'Terracotta', 'Blush Pink', 'Charcoal', 'Olive Green'].map(c => (
                                  <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Flooring <span className="text-xs text-muted-foreground">(optional)</span></Label>
                            <Select value={interiorFlooring} onValueChange={setInteriorFlooring}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {['Keep Original', 'Hardwood Light', 'Hardwood Dark', 'Marble White', 'Marble Dark', 'Ceramic Tiles', 'Carpet', 'Polished Concrete', 'Herringbone Parquet'].map(f => (
                                  <SelectItem key={f} value={f}>{f}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {/* Furniture Style & Lighting Mood */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{interiorType === 'interior' ? 'Furniture Style' : 'Outdoor Style'} <span className="text-xs text-muted-foreground">(optional)</span></Label>
                          <Select value={interiorFurnitureStyle} onValueChange={setInteriorFurnitureStyle} disabled={interiorType === 'interior' && interiorFurnitureHandling === 'Keep & Restyle'}>
                            <SelectTrigger className={interiorType === 'interior' && interiorFurnitureHandling === 'Keep & Restyle' ? 'opacity-50' : ''}><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {(interiorType === 'interior'
                                ? ['Match Design Style', 'Modern Minimalist', 'Mid-Century Modern', 'Scandinavian', 'Industrial', 'Traditional / Classic', 'Bohemian / Eclectic', 'Art Deco', 'Japandi', 'Coastal / Hampton']
                                : ['Match Design Style', 'Modern', 'Tropical', 'Mediterranean', 'Rustic', 'Contemporary', 'Coastal', 'Desert / Arid', 'Japanese Garden', 'English Garden']
                              ).map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Lighting Mood <span className="text-xs text-muted-foreground">(optional)</span></Label>
                          <Select value={interiorLightingMood} onValueChange={setInteriorLightingMood}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {(interiorType === 'interior'
                                ? ['Keep Original', 'Warm & Cozy', 'Bright & Airy', 'Dramatic / Moody', 'Natural Daylight', 'Soft Evening / Golden Hour']
                                : ['Keep Original', 'Golden Hour Glow', 'Bright Daylight', 'Dramatic Twilight', 'Soft Overcast', 'Night / Uplighting']
                              ).map(l => (
                                <SelectItem key={l} value={l}>{l}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Key Furniture & Features (optional) */}
                      {interiorRoomType && ROOM_FURNITURE_PRESETS[interiorRoomType] && (
                        <div className="space-y-2">
                          <Label>Key Furniture & Features <span className="text-xs text-muted-foreground">(optional — helps the AI pick the right pieces)</span></Label>
                          <div className="flex flex-wrap gap-2">
                            {ROOM_FURNITURE_PRESETS[interiorRoomType].map(piece => {
                              const isSelected = interiorKeyPieces.includes(piece);
                              return (
                                <button
                                  key={piece}
                                  type="button"
                                  onClick={() => {
                                    setInteriorKeyPieces(prev =>
                                      isSelected ? prev.filter(p => p !== piece) : [...prev, piece]
                                    );
                                  }}
                                  className={cn(
                                    'px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
                                    isSelected
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-card border-border hover:border-primary hover:bg-primary/5'
                                  )}
                                >
                                  {piece}
                                </button>
                              );
                            })}
                          </div>
                          {interiorKeyPieces.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Selected: {interiorKeyPieces.join(', ')}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Color Palette */}
                      <div className="space-y-2">
                        <Label>Color Palette <span className="text-xs text-muted-foreground">(optional)</span></Label>
                        <div className="flex flex-wrap gap-2">
                          {['Neutral / Earth Tones', 'Cool & Calming', 'Warm & Inviting', 'Monochrome', 'Bold & Vibrant', 'Pastel Soft'].map(palette => (
                            <button
                              key={palette}
                              type="button"
                              onClick={() => setInteriorColorPalette(interiorColorPalette === palette ? '' : palette)}
                              className={cn(
                                'px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
                                interiorColorPalette === palette
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-card border-border hover:border-primary hover:bg-primary/5'
                              )}
                            >
                              {palette}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Time of Day / Natural Light */}
                      <div className="space-y-2">
                        <Label>Natural Light / Time of Day <span className="text-xs text-muted-foreground">(optional)</span></Label>
                        <Select value={interiorTimeOfDay} onValueChange={setInteriorTimeOfDay}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['As Photographed', 'Morning Light', 'Midday Bright', 'Golden Hour', 'Blue Hour / Twilight', 'Overcast Soft'].map(t => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Design Notes */}
                      <div className="space-y-2">
                        <Label>Design Notes <span className="text-xs text-muted-foreground">(optional)</span></Label>
                        <Textarea
                          placeholder="e.g. client prefers warm Japandi feel, no curtains, maximize natural light, shutters only..."
                          value={interiorDesignNotes}
                          onChange={e => setInteriorDesignNotes(e.target.value)}
                          className="min-h-[60px]"
                        />
                        <p className="text-xs text-muted-foreground">Add specific instructions for the AI designer</p>
                      </div>
                    </div>
                  </CardContent></Card>
                )}
              </div>

              {/* Right column: Compact guide (try-on only, before upload) */}
              {activeWorkflow?.uses_tryon && !scratchUpload && (
                <div className="order-first lg:order-last">
                  <TryOnUploadGuide />
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('source')}>Back</Button>
              <Button disabled={!scratchUpload || (!isInteriorDesign && !isUpscale && (!scratchUpload.productInfo.title || !scratchUpload.productInfo.productType)) || (isInteriorDesign && !interiorRoomType)}
                onClick={async () => {
                  if (!scratchUpload) return;
                  // Skip upload if reusing a previously uploaded image
                  let finalUrl = scratchUpload.uploadedUrl;
                  if (!finalUrl) {
                    finalUrl = await uploadFile(scratchUpload.file) || undefined;
                  }
                  if (finalUrl) {
                    setScratchUpload({ ...scratchUpload, uploadedUrl: finalUrl });
                    // Save to library if checkbox was checked
                    if (saveToLibrary && user) {
                      supabase.from('user_products').insert({
                        user_id: user.id,
                        title: scratchUpload.productInfo.title,
                        product_type: scratchUpload.productInfo.productType,
                        description: scratchUpload.productInfo.description,
                        image_url: finalUrl,
                      }).then(({ error }) => {
                        if (!error) {
                          queryClient.invalidateQueries({ queryKey: ['user-products'] });
                        }
                      });
                    }
                    if (isUpscale) {
                      setCurrentStep('settings');
                    } else if (isSelfieUgc) {
                      setCurrentStep('interaction');
                    } else if (activeWorkflow?.uses_tryon) {
                      setCurrentStep(brandProfiles.length > 0 ? 'brand-profile' : 'model');
                    } else if (isInteriorDesign) {
                      setCurrentStep('settings');
                    } else if (isAngleWorkflow) {
                      setCurrentStep('settings');
                    } else if (brandProfiles.length > 0) {
                      setCurrentStep('brand-profile');
                    } else if (uiConfig?.skip_template && hasWorkflowConfig) {
                      setCurrentStep('settings');
                    } else {
                      const isClothing = ['leggings', 'hoodie', 't-shirt', 'sports bra', 'jacket', 'tank top', 'joggers'].some(kw => scratchUpload.productInfo.productType.toLowerCase().includes(kw));
                      setCurrentStep(isClothing ? 'mode' : 'template');
                    }
                  }
                }}
              >{isUploading ? 'Uploading...' : 'Continue'}</Button>
            </div>
          </CardContent></Card>
        )}

        {/* Product Selection */}
        {currentStep === 'product' && (
          <div className="space-y-4 pb-20">
          <Card><CardContent className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">
                   {isFlatLay ? 'Select Products for Flat Lay'
                     : isMirrorSelfie ? 'Select Product(s) for Mirror Selfie'
                    : activeWorkflow?.uses_tryon ? 'Select Clothing Item(s)' : 'Select Product(s)'}
                 </h2>
                 <p className="text-sm text-muted-foreground">
                   {isFlatLay
                     ? 'Select 1–3 products to arrange together in your flat lay composition'
                     : isMirrorSelfie
                     ? 'Choose the product(s) your model will wear or hold in the mirror selfie'
                     : activeWorkflow?.uses_tryon
                     ? 'Choose one or more clothing items to try on a model.'
                     : 'Choose one or multiple products. 2+ products will use bulk generation.'}
                 </p>
              </div>
              <Button variant="link" onClick={() => setCurrentStep('source')}>Change source</Button>
            </div>

            {isAngleWorkflow && (
              <Alert className="border-primary/20 bg-primary/5">
                <Info className="w-4 h-4 text-primary" />
                <AlertDescription className="text-xs text-muted-foreground">
                  The primary product image will be used as the source for perspective generation.
                </AlertDescription>
              </Alert>
            )}

            {/* Show real DB products for all workflows */}
            {isLoadingUserProducts ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : userProducts.length === 0 ? (
              activeWorkflow?.uses_tryon ? (() => {
                const sampleProduct = isSelfieUgc ? SAMPLE_UGC_PRODUCT : SAMPLE_TRYON_PRODUCT;
                return (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">Sample</Badge>
                    <span className="text-xs text-muted-foreground">Try with a sample product, or add your own</span>
                  </div>

                  {/* Sample product card */}
                  <div
                    className={`relative rounded-lg border-2 cursor-pointer transition-all overflow-hidden ${
                      selectedProductIds.has(sampleProduct.id)
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/40'
                    }`}
                    onClick={() => {
                      const next = new Set(selectedProductIds);
                      if (next.has(sampleProduct.id)) {
                        next.delete(sampleProduct.id);
                        setSelectedProduct(null);
                      } else {
                        next.clear();
                        next.add(sampleProduct.id);
                        setSelectedProduct(sampleProduct);
                      }
                      setSelectedProductIds(next);
                    }}
                  >
                    <div className="flex items-center gap-4 p-3">
                      <div className="w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img src={getOptimizedUrl(sampleProduct.images[0].url, { quality: 60 })} alt={sampleProduct.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{sampleProduct.title}</p>
                        <p className="text-xs text-muted-foreground">{sampleProduct.productType}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{sampleProduct.description}</p>
                      </div>
                      {selectedProductIds.has(sampleProduct.id) && (
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 border-t border-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="flex-1 border-t border-border" />
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => setShowAddProduct(true)}>Add Your Products</Button>
                    <Button variant="secondary" size="sm" onClick={() => { setSourceType('scratch'); setCurrentStep('upload'); }}>
                      Upload Instead
                    </Button>
                  </div>
                </div>);
                })() : (() => {
                const nonTryOnSample = isMirrorSelfie ? SAMPLE_MIRROR_PRODUCT : SAMPLE_LISTING_PRODUCT;
                return (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">Sample</Badge>
                    <span className="text-xs text-muted-foreground">Try with a sample product, or add your own</span>
                  </div>

                  {/* Sample product card */}
                  <div
                    className={`relative rounded-lg border-2 cursor-pointer transition-all overflow-hidden ${
                      selectedProductIds.has(nonTryOnSample.id)
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/40'
                    }`}
                    onClick={() => {
                      const next = new Set(selectedProductIds);
                      if (next.has(nonTryOnSample.id)) {
                        next.delete(nonTryOnSample.id);
                        setSelectedProduct(null);
                      } else {
                        next.clear();
                        next.add(nonTryOnSample.id);
                        setSelectedProduct(nonTryOnSample);
                      }
                      setSelectedProductIds(next);
                    }}
                  >
                    <div className="flex items-center gap-4 p-3">
                      <div className="w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img src={getOptimizedUrl(nonTryOnSample.images[0].url, { quality: 60 })} alt={nonTryOnSample.title} className="w-full h-full object-cover" loading="eager" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{nonTryOnSample.title}</p>
                        <p className="text-xs text-muted-foreground">{nonTryOnSample.productType}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{nonTryOnSample.description}</p>
                      </div>
                      {selectedProductIds.has(nonTryOnSample.id) && (
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 border-t border-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="flex-1 border-t border-border" />
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => setShowAddProduct(true)}>Add Your Products</Button>
                    <Button variant="secondary" size="sm" onClick={() => { setSourceType('scratch'); setCurrentStep('upload'); }}>
                      Upload Instead
                    </Button>
                  </div>
                </div>);
                })()
            ) : activeWorkflow?.uses_tryon ? (
              <div className="space-y-3">
                {/* Toolbar: Search + Actions */}
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={tryOnSearchQuery}
                      onChange={e => { setTryOnSearchQuery(e.target.value); setVisibleProductCount(PRODUCTS_PER_PAGE); }}
                      className="h-8 text-xs pl-8"
                    />
                  </div>
                  {!isFreeUser && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => {
                          const filtered = userProducts.filter(p =>
                            p.title.toLowerCase().includes(tryOnSearchQuery.toLowerCase()) ||
                            p.product_type.toLowerCase().includes(tryOnSearchQuery.toLowerCase())
                          );
                          setSelectedProductIds(new Set(filtered.slice(0, MAX_PRODUCTS_PER_BATCH).map(p => p.id)));
                        }}
                      >
                        Select All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => setSelectedProductIds(new Set())}
                      >
                        Clear
                      </Button>
                    </>
                  )}
                  <div className="flex border border-border rounded-md overflow-hidden">
                    <button
                      onClick={() => setProductViewMode('grid')}
                      className={cn('p-1.5 transition-colors', productViewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted')}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setProductViewMode('list')}
                      className={cn('p-1.5 transition-colors', productViewMode === 'list' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted')}
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {!isFreeUser && selectedProductIds.size > 0 && (
                  <div className="flex gap-2 items-center">
                    <Badge variant={selectedProductIds.size >= 2 ? 'default' : 'secondary'}>{selectedProductIds.size} selected</Badge>
                    <span className="text-xs text-muted-foreground">(max {MAX_PRODUCTS_PER_BATCH})</span>
                  </div>
                )}

                {(() => {
                  const filteredProducts = userProducts.filter(p =>
                    p.title.toLowerCase().includes(tryOnSearchQuery.toLowerCase()) ||
                    p.product_type.toLowerCase().includes(tryOnSearchQuery.toLowerCase())
                  );
                   const visibleProducts = filteredProducts.slice(0, visibleProductCount);
                   const canMultiSelect = !isFreeUser;

                  if (filteredProducts.length === 0 && tryOnSearchQuery) {
                    return <p className="text-center text-sm text-muted-foreground py-6">No products match "{tryOnSearchQuery}"</p>;
                  }

                  if (productViewMode === 'list') {
                    return (
                      <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
                        {visibleProducts.map(up => {
                          const isSelected = selectedProductIds.has(up.id);
                          const isDisabled = !isSelected && canMultiSelect && selectedProductIds.size >= MAX_PRODUCTS_PER_BATCH;
                          return (
                            <button
                              key={up.id}
                              type="button"
                              onClick={() => {
                                if (canMultiSelect) {
                                  const newSet = new Set(selectedProductIds);
                                  if (newSet.has(up.id)) { newSet.delete(up.id); }
                                  else if (newSet.size < MAX_PRODUCTS_PER_BATCH) { newSet.add(up.id); }
                                  setSelectedProductIds(newSet);
                                } else {
                                  setSelectedProductIds(new Set([up.id]));
                                }
                              }}
                              disabled={isDisabled}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2 rounded-lg border-2 transition-all text-left',
                                isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/50',
                                isDisabled && 'opacity-40 cursor-not-allowed'
                              )}
                            >
                              <ShimmerImage src={getOptimizedUrl(up.image_url, { quality: 60 })} alt={up.title} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">{up.title}</p>
                                {up.product_type && <p className="text-[10px] text-muted-foreground truncate">{up.product_type}</p>}
                              </div>
                              {canMultiSelect && (
                                <div className={cn(
                                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                                  isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                                )}>
                                  {isSelected && <Check className="w-3 h-3" />}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  }

                  return (
                    <>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {visibleProducts.map(up => {
                          const isSelected = selectedProductIds.has(up.id);
                          const isDisabled = !isSelected && canMultiSelect && selectedProductIds.size >= MAX_PRODUCTS_PER_BATCH;
                          return (
                            <button
                              key={up.id}
                              type="button"
                              onClick={() => {
                                if (canMultiSelect) {
                                  const newSet = new Set(selectedProductIds);
                                  if (newSet.has(up.id)) { newSet.delete(up.id); }
                                  else if (newSet.size < MAX_PRODUCTS_PER_BATCH) { newSet.add(up.id); }
                                  setSelectedProductIds(newSet);
                                } else {
                                  setSelectedProductIds(new Set([up.id]));
                                }
                              }}
                              disabled={isDisabled}
                              className={cn(
                                'group relative flex flex-col rounded-lg overflow-hidden border-2 transition-all text-left',
                                isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-border',
                                isDisabled && 'opacity-40 cursor-not-allowed'
                              )}
                            >
                              {canMultiSelect && (
                                <div className={cn(
                                  'absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                                  isSelected
                                    ? 'border-primary bg-primary text-primary-foreground shadow-md'
                                    : 'border-background/80 bg-background/60 opacity-0 group-hover:opacity-100'
                                )}>
                                  {isSelected && <Check className="w-3 h-3" />}
                                </div>
                              )}
                              <ShimmerImage src={getOptimizedUrl(up.image_url, { quality: 60 })} alt={up.title} className="w-full aspect-square object-cover rounded-t-md" />
                              <div className="px-1.5 py-1.5 bg-card">
                                <p className="text-[10px] font-medium text-foreground leading-tight line-clamp-2">{up.title}</p>
                                {up.product_type && (
                                  <p className="text-[9px] text-muted-foreground truncate mt-0.5">{up.product_type}</p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                        {/* Add New Product card */}
                        <button
                          type="button"
                          onClick={() => setShowAddProduct(true)}
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary/40 hover:bg-muted/50 transition-all aspect-square text-muted-foreground"
                        >
                          <Package className="w-6 h-6 mb-1 opacity-50" />
                          <span className="text-[10px] font-medium">Add New</span>
                        </button>
                      </div>
                      {filteredProducts.length > visibleProductCount && (
                        <Button variant="outline" size="sm" onClick={() => setVisibleProductCount(c => c + PRODUCTS_PER_PAGE)} className="w-full mt-3">
                          Load more ({filteredProducts.length - visibleProductCount} remaining)
                        </Button>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Toolbar: Search + Actions */}
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={tryOnSearchQuery}
                      onChange={e => { setTryOnSearchQuery(e.target.value); setVisibleProductCount(PRODUCTS_PER_PAGE); }}
                      className="h-8 text-xs pl-8"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => {
                      const filtered = userProducts.filter(p =>
                        p.title.toLowerCase().includes(tryOnSearchQuery.toLowerCase()) ||
                        p.product_type.toLowerCase().includes(tryOnSearchQuery.toLowerCase())
                      );
                      setSelectedProductIds(new Set(filtered.slice(0, MAX_PRODUCTS_PER_BATCH).map(p => p.id)));
                    }}
                  >
                    Select All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => setSelectedProductIds(new Set())}
                  >
                    Clear
                  </Button>
                  <div className="flex border border-border rounded-md overflow-hidden">
                    <button
                      onClick={() => setProductViewMode('grid')}
                      className={cn('p-1.5 transition-colors', productViewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted')}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setProductViewMode('list')}
                      className={cn('p-1.5 transition-colors', productViewMode === 'list' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted')}
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {selectedProductIds.size > 0 && (
                  <div className="flex gap-2 items-center">
                    <Badge variant={selectedProductIds.size >= 2 ? 'default' : 'secondary'}>{selectedProductIds.size} selected</Badge>
                    <span className="text-xs text-muted-foreground">(max {MAX_PRODUCTS_PER_BATCH})</span>
                  </div>
                )}

                {(() => {
                  const filteredProducts = userProducts.filter(p =>
                    p.title.toLowerCase().includes(tryOnSearchQuery.toLowerCase()) ||
                    p.product_type.toLowerCase().includes(tryOnSearchQuery.toLowerCase())
                   );
                   const visibleProducts = filteredProducts.slice(0, visibleProductCount);

                  if (filteredProducts.length === 0 && tryOnSearchQuery) {
                    return <p className="text-center text-sm text-muted-foreground py-6">No products match "{tryOnSearchQuery}"</p>;
                  }

                  if (productViewMode === 'list') {
                    return (
                      <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
                        {filteredProducts.map(up => {
                          const isSelected = selectedProductIds.has(up.id);
                          const isDisabled = !isSelected && selectedProductIds.size >= MAX_PRODUCTS_PER_BATCH;
                          return (
                            <button
                              key={up.id}
                              type="button"
                              onClick={() => {
                                const newSet = new Set(selectedProductIds);
                                if (newSet.has(up.id)) { newSet.delete(up.id); }
                                else if (newSet.size < MAX_PRODUCTS_PER_BATCH) { newSet.add(up.id); }
                                setSelectedProductIds(newSet);
                              }}
                              disabled={isDisabled}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2 rounded-lg border-2 transition-all text-left',
                                isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/50',
                                isDisabled && 'opacity-40 cursor-not-allowed'
                              )}
                            >
                              <ShimmerImage src={getOptimizedUrl(up.image_url, { quality: 60 })} alt={up.title} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">{up.title}</p>
                                {up.product_type && <p className="text-[10px] text-muted-foreground truncate">{up.product_type}</p>}
                              </div>
                              <div className={cn(
                                'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                                isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                              )}>
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  }

                  return (
                    <>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {visibleProducts.map(up => {
                          const isSelected = selectedProductIds.has(up.id);
                          const isDisabled = !isSelected && selectedProductIds.size >= MAX_PRODUCTS_PER_BATCH;
                          return (
                            <button
                              key={up.id}
                              type="button"
                              onClick={() => {
                                const newSet = new Set(selectedProductIds);
                                if (newSet.has(up.id)) { newSet.delete(up.id); }
                                else if (newSet.size < MAX_PRODUCTS_PER_BATCH) { newSet.add(up.id); }
                                setSelectedProductIds(newSet);
                              }}
                              disabled={isDisabled}
                              className={cn(
                                'group relative flex flex-col rounded-lg overflow-hidden border-2 transition-all text-left',
                                isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-border',
                                isDisabled && 'opacity-40 cursor-not-allowed'
                              )}
                            >
                              <div className={cn(
                                'absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                                isSelected
                                  ? 'border-primary bg-primary text-primary-foreground shadow-md'
                                  : 'border-background/80 bg-background/60 opacity-0 group-hover:opacity-100'
                              )}>
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                              <ShimmerImage src={getOptimizedUrl(up.image_url, { quality: 60 })} alt={up.title} className="w-full aspect-square object-cover rounded-t-md" />
                              <div className="px-1.5 py-1.5 bg-card">
                                <p className="text-[10px] font-medium text-foreground leading-tight line-clamp-2">{up.title}</p>
                                {up.product_type && (
                                  <p className="text-[9px] text-muted-foreground truncate mt-0.5">{up.product_type}</p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                        {/* Add New Product card */}
                        <button
                          type="button"
                          onClick={() => setShowAddProduct(true)}
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary/40 hover:bg-muted/50 transition-all aspect-square text-muted-foreground"
                        >
                          <Package className="w-6 h-6 mb-1 opacity-50" />
                          <span className="text-[10px] font-medium">Add New</span>
                        </button>
                      </div>
                      {filteredProducts.length > visibleProductCount && (
                        <Button variant="outline" size="sm" onClick={() => setVisibleProductCount(c => c + PRODUCTS_PER_PAGE)} className="w-full mt-3">
                          Load more ({filteredProducts.length - visibleProductCount} remaining)
                        </Button>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

          </CardContent></Card>
          <div className="fixed bottom-4 left-0 right-0 lg:left-[var(--sidebar-offset)] z-50 px-4">
            <div className="max-w-3xl mx-auto bg-background border border-border rounded-2xl shadow-lg p-4 flex items-center justify-between gap-4">
              <Button variant="outline" onClick={() => setCurrentStep('source')}>Back</Button>
              {selectedProductIds.size === 0 && (
                <span className="text-xs text-muted-foreground text-center flex-1">Select a product to continue</span>
              )}
              <Button disabled={selectedProductIds.size === 0} onClick={() => {
                if (activeWorkflow?.uses_tryon) {
                  const dbMapped = userProducts.filter(p => selectedProductIds.has(p.id)).map(up => mapUserProductToProduct(up));
                  const sampleSelected = [SAMPLE_TRYON_PRODUCT, SAMPLE_UGC_PRODUCT, SAMPLE_MIRROR_PRODUCT].filter(sp => selectedProductIds.has(sp.id));
                  const candidates = [...dbMapped, ...sampleSelected];
                  if (candidates.length > 0) {
                    setSelectedProduct(candidates[0]);
                    setSelectedSourceImages(new Set([candidates[0].images[0].id]));
                    if (candidates.length > 1) {
                      setProductQueue(candidates);
                      setCurrentProductIndex(0);
                      setMultiProductResults(new Map());
                      if (isMirrorSelfie) {
                        setMirrorSettingsPhase('scenes');
                        setCurrentStep('settings');
                      } else if (isSelfieUgc) {
                        const opts = getInteractionOptionsForProduct(candidates[0]);
                        setUgcInteraction(opts[0]?.id ?? null);
                        setCurrentStep('interaction');
                      } else {
                        setCurrentStep(brandProfiles.length > 0 ? 'brand-profile' : 'model');
                      }
                    } else {
                      setProductQueue([]);
                      if (isSelfieUgc) {
                        const opts = getInteractionOptionsForProduct(candidates[0]);
                        setUgcInteraction(opts[0]?.id ?? null);
                        setCurrentStep('interaction');
                      } else {
                        setCurrentStep(brandProfiles.length > 0 ? 'brand-profile' : 'model');
                      }
                    }
                  }
                } else {
                  const nonTryOnSample = isMirrorSelfie ? SAMPLE_MIRROR_PRODUCT : SAMPLE_LISTING_PRODUCT;
                  const mappedProducts = userProducts.length > 0
                    ? userProducts.map(up => mapUserProductToProduct(up))
                    : [nonTryOnSample];
                  const selected = mappedProducts.filter(p => selectedProductIds.has(p.id));
                  
                  if (isFlatLay) {
                    setSelectedFlatLayProductIds(new Set(selected.map(p => p.id)));
                    setSelectedProduct(selected[0]);
                    if (selected[0].images.length > 0) setSelectedSourceImages(new Set([selected[0].images[0].id]));
                    if (brandProfiles.length > 0) {
                      setCurrentStep('brand-profile');
                    } else {
                      setFlatLayPhase('surfaces');
                      setCurrentStep('settings');
                    }
                    return;
                  }
                  
                  if (isMirrorSelfie) {
                    setSelectedProduct(selected[0]);
                    if (selected[0].images.length > 0) setSelectedSourceImages(new Set([selected[0].images[0].id]));
                    if (selected.length > 1) {
                      setProductQueue(selected);
                      setCurrentProductIndex(0);
                      setMultiProductResults(new Map());
                    } else {
                      setProductQueue([]);
                    }
                    setMirrorSettingsPhase('scenes');
                    setCurrentStep('settings');
                    return;
                  }
                  
                  if (selected.length === 1) {
                    const product = selected[0];
                    setSelectedProduct(product);
                    if (product.images.length > 0) setSelectedSourceImages(new Set([product.images[0].id]));
                    const cat = detectProductCategory(product);
                    if (cat) setSelectedCategory(cat);
                    if (isUpscale) {
                       setCurrentStep('settings');
                     } else if (isAngleWorkflow) {
                       setCurrentStep('settings');
                     } else if (isSelfieUgc) {
                       const opts = getInteractionOptionsForProduct(product);
                       setUgcInteraction(opts[0]?.id ?? null);
                       setCurrentStep('interaction');
                     } else if (brandProfiles.length > 0) {
                       setCurrentStep('brand-profile');
                     } else if (uiConfig?.show_model_picker) {
                       setCurrentStep('model');
                     } else if (uiConfig?.skip_template && hasWorkflowConfig) {
                       setCurrentStep('settings');
                     } else if (isClothingProduct(product)) {
                       setCurrentStep('mode');
                     } else {
                       setCurrentStep('template');
                     }
                  } else {
                    setProductQueue(selected);
                    setCurrentProductIndex(0);
                    setMultiProductResults(new Map());
                    const product = selected[0];
                    setSelectedProduct(product);
                    if (product.images.length > 0) setSelectedSourceImages(new Set([product.images[0].id]));
                    const cat = detectProductCategory(product);
                    if (cat) setSelectedCategory(cat);
                    if (isUpscale) {
                      setCurrentStep('settings');
                    } else if (isAngleWorkflow) {
                      setCurrentStep('settings');
                    } else if (isSelfieUgc) {
                      const opts = getInteractionOptionsForProduct(product);
                      setUgcInteraction(opts[0]?.id ?? null);
                      setCurrentStep('interaction');
                    } else if (brandProfiles.length > 0) {
                      setCurrentStep('brand-profile');
                    } else if (uiConfig?.show_model_picker) {
                      setCurrentStep('model');
                    } else if (uiConfig?.skip_template && hasWorkflowConfig) {
                      setCurrentStep('settings');
                    } else if (isClothingProduct(product)) {
                      setCurrentStep('mode');
                    } else {
                      setCurrentStep('template');
                    }
                  }
                }
              }}>
                {selectedProductIds.size === 0 ? 'Select at least 1' : activeWorkflow?.uses_tryon ? `Continue with ${selectedProductIds.size} product${selectedProductIds.size > 1 ? 's' : ''}` : isFlatLay ? `Continue with ${selectedProductIds.size} product${selectedProductIds.size > 1 ? 's' : ''}` : selectedProductIds.size === 1 ? 'Continue with 1 product' : `Continue with ${selectedProductIds.size} products`}
              </Button>
            </div>
          </div>
        </div>
        )}

        {/* Library Selection Step */}
        {currentStep === 'library' && (
          <Card><CardContent className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Select from Library</h2>
                <p className="text-sm text-muted-foreground">Choose up to 10 previously generated images to create new perspectives from.</p>
              </div>
              <Button variant="link" onClick={() => setCurrentStep('source')}>Change source</Button>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by prompt..."
                value={librarySearchQuery}
                onChange={e => setLibrarySearchQuery(e.target.value)}
                className="h-8 text-xs pl-8"
              />
            </div>

            {selectedLibraryIds.size > 0 && (
              <div className="flex gap-2 items-center">
                <Badge variant="default">{selectedLibraryIds.size} selected</Badge>
                <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setSelectedLibraryIds(new Set())}>Clear</Button>
              </div>
            )}

            {isLoadingLibrary ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : libraryItems.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <Image className="w-12 h-12 mx-auto text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No generated images in your library yet.</p>
                <p className="text-xs text-muted-foreground">Generate some images first, then come back here to create new perspectives.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {libraryItems
                  .filter(item => !librarySearchQuery || item.label.toLowerCase().includes(librarySearchQuery.toLowerCase()))
                  .map(item => {
                    const isSelected = selectedLibraryIds.has(item.id);
                    const isDisabled = !isSelected && selectedLibraryIds.size >= 10;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          const newSet = new Set(selectedLibraryIds);
                          if (newSet.has(item.id)) { newSet.delete(item.id); }
                          else if (newSet.size < 10) { newSet.add(item.id); }
                          setSelectedLibraryIds(newSet);
                        }}
                        disabled={isDisabled}
                        className={cn(
                          'group relative flex flex-col rounded-lg overflow-hidden border-2 transition-all text-left',
                          isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-border',
                          isDisabled && 'opacity-40 cursor-not-allowed'
                        )}
                      >
                        <div className={cn(
                          'absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground shadow-md'
                            : 'border-background/80 bg-background/60 opacity-0 group-hover:opacity-100'
                        )}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <img src={item.imageUrl} alt={item.label} className="w-full aspect-square object-cover rounded-t-md" loading="lazy" />
                        <div className="px-1.5 py-1.5 bg-card">
                          <p className="text-[10px] font-medium text-foreground leading-tight line-clamp-2">{item.label}</p>
                          <p className="text-[9px] text-muted-foreground truncate mt-0.5">
                            {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('source')}>Back</Button>
              <Button disabled={selectedLibraryIds.size === 0} onClick={() => {
                // Map selected library items to products for the generation pipeline
                const selected = libraryItems.filter(item => selectedLibraryIds.has(item.id));
                if (selected.length === 1) {
                  const item = selected[0];
                  setSelectedProduct({
                    id: item.id, title: item.label, vendor: 'Library', productType: 'Generated',
                    tags: [], description: '', images: [{ id: item.id, url: item.imageUrl }],
                    status: 'active', createdAt: item.createdAt, updatedAt: item.createdAt,
                  });
                  setSelectedSourceImages(new Set([item.id]));
                  setCurrentStep('settings');
                } else {
                  const mappedProducts = selected.map(item => ({
                    id: item.id, title: item.label, vendor: 'Library', productType: 'Generated',
                    tags: [] as string[], description: '', images: [{ id: item.id, url: item.imageUrl }],
                    status: 'active' as const, createdAt: item.createdAt, updatedAt: item.createdAt,
                  }));
                  setProductQueue(mappedProducts);
                  setCurrentProductIndex(0);
                  setMultiProductResults(new Map());
                  setSelectedProduct(mappedProducts[0]);
                  setSelectedSourceImages(new Set([mappedProducts[0].images[0].id]));
                  setCurrentStep('settings');
                }
              }}>
                {selectedLibraryIds.size === 0 ? 'Select at least 1' : `Continue with ${selectedLibraryIds.size} image${selectedLibraryIds.size > 1 ? 's' : ''}`}
              </Button>
            </div>
          </CardContent></Card>
        )}

        {/* Brand Profile Selection - NEW STEP */}
        {currentStep === 'brand-profile' && (
          <Card><CardContent className="p-5 space-y-5">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Select Brand Profile
              </h2>
              <p className="text-sm text-muted-foreground">Apply your brand's visual identity to this generation.</p>
            </div>

            {brandProfiles.length > 0 ? (
              <div className="space-y-3">
                {brandProfiles.map(bp => (
                  <div
                    key={bp.id}
                    onClick={() => setSelectedBrandProfileId(bp.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedBrandProfileId === bp.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{bp.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {bp.tone} · {bp.lighting_style} · {bp.background_style}
                        </p>
                      </div>
                      <Badge variant="secondary" className="capitalize">{bp.tone}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Palette className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No brand profiles yet.</p>
                <Button variant="link" onClick={() => navigate('/app/brand-profiles')}>Create one</Button>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(sourceType === 'scratch' ? 'upload' : 'product')}>Back</Button>
              <div className="flex gap-2">
                {!selectedBrandProfileId && (
                  <Button variant="ghost" onClick={handleBrandProfileContinue}>Skip</Button>
                )}
                <Button onClick={handleBrandProfileContinue} disabled={false}>
                  {selectedBrandProfileId ? 'Continue' : 'Continue without profile'}
                </Button>
              </div>
            </div>
          </CardContent></Card>
        )}

        {/* Interaction Selection — Selfie / UGC only */}
        {currentStep === 'interaction' && isSelfieUgc && (selectedProduct || scratchUpload) && (
          <Card><CardContent className="p-5 space-y-5">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                How should the creator engage with your product?
              </h2>
              <p className="text-sm text-muted-foreground">Pick the action that best fits the shot you want — this drives the model's pose and the product's role in the frame.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {getInteractionOptionsForProduct(selectedProduct).map(opt => {
                const active = ugcInteraction === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setUgcInteraction(opt.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="text-2xl mb-2">{opt.emoji}</div>
                    <p className="font-medium text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(sourceType === 'scratch' ? 'upload' : 'product')}>Back</Button>
              <Button disabled={!ugcInteraction} onClick={() => setCurrentStep('model')}>Continue to Model</Button>
            </div>
          </CardContent></Card>
        )}

        {/* Mode Selection */}
        {currentStep === 'mode' && (selectedProduct || scratchUpload) && (
          <Card><CardContent className="p-5 space-y-5">
            <div>
              <h2 className="text-base font-semibold">Choose Generation Mode</h2>
              <p className="text-sm text-muted-foreground">How would you like to showcase your {selectedProduct?.title || scratchUpload?.productInfo.title}?</p>
            </div>
            <div className="flex justify-center">
              <GenerationModeToggle mode={generationMode} onChange={setGenerationMode} />
            </div>
            {generationMode === 'virtual-try-on' && (
              <Alert><AlertDescription>
                <p className="font-semibold">✨ Virtual Try-On Mode</p>
                <p className="text-sm">AI will digitally dress your selected model in your clothing. Uses 3 credits per image.</p>
              </AlertDescription></Alert>
            )}
            {generationMode === 'product-only' && (
              <Alert><AlertDescription>Standard product photography — flat lay, studio, or lifestyle shots.</AlertDescription></Alert>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCurrentStep(brandProfiles.length > 0 ? 'brand-profile' : (sourceType === 'scratch' ? 'upload' : 'product'))}>Back</Button>
              <Button onClick={() => setCurrentStep(generationMode === 'virtual-try-on' ? 'model' : 'template')}>Continue</Button>
            </div>
          </CardContent></Card>
        )}

        {/* Model Selection */}
        {currentStep === 'model' && (selectedProduct || scratchUpload) && (
          <div className="space-y-4 pb-20">
            <TryOnPreview product={selectedProduct} scratchUpload={scratchUpload} model={selectedModel} models={Array.from(selectedModelMap.values())} pose={selectedPose} creditCost={creditCost} selectedGender={selectedModel?.gender} products={isMultiProductMode ? productQueue : undefined} />
            <Card><CardContent className="p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold">Select Model{!isFreeUser ? 's' : ''}</h2>
                    <p className="text-sm text-muted-foreground">
                      {isMirrorSelfie
                        ? 'This model will appear taking a mirror selfie wearing your product'
                        : isFreeUser ? 'Choose the model who will wear your clothing' : 'Select one or more models for your shoot'}
                    </p>
                  </div>
                  {selectedModels.size > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedModels.size} selected{!isFreeUser && selectedModels.size > 0 ? ` · ${selectedModels.size * Math.max(1, selectedPoses.size) * parseInt(imageCount) * 6 * (isMultiProductMode ? productQueue.length : 1)} credits` : ''}
                    </Badge>
                  )}
                </div>
              </div>
              <ModelFilterBar genderFilter={modelGenderFilter} bodyTypeFilter={modelBodyTypeFilter} ageFilter={modelAgeFilter}
                onGenderChange={setModelGenderFilter} onBodyTypeChange={setModelBodyTypeFilter} onAgeChange={setModelAgeFilter} />
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                 {filteredModels.map(model => (
                   <ModelSelectorCard key={model.modelId} model={model} isSelected={selectedModels.has(model.modelId)} onSelect={() => handleSelectModel(model)} />
                 ))}
              </div>
              <MissingRequestBanner
                category="model"
                title="Missing a model? Tell us and we'll create it."
                placeholder="Describe the model you'd like us to create…"
              />
            </CardContent></Card>
            <div className="fixed bottom-4 left-0 right-0 lg:left-[var(--sidebar-offset)] z-50 px-4">
              <div className="max-w-3xl mx-auto bg-background border border-border rounded-2xl shadow-lg p-4 flex items-center justify-between gap-4">
                <Button variant="outline" onClick={() => {
                  if (isMirrorSelfie) {
                    setMirrorSettingsPhase('scenes');
                    setCurrentStep('settings');
                  } else if (isSelfieUgc) {
                    setCurrentStep('interaction');
                  } else {
                    setCurrentStep(brandProfiles.length > 0 ? 'brand-profile' : 'product');
                  }
                }}>Back</Button>
                {selectedModels.size === 0 && (
                  <span className="text-xs text-muted-foreground text-center flex-1">Select a model to continue</span>
                )}
                {isMirrorSelfie ? (
                  <Button disabled={selectedModels.size === 0} onClick={() => { setMirrorSettingsPhase('final'); setCurrentStep('settings'); }}>Continue to Settings</Button>
                ) : isSelfieUgc || (uiConfig?.show_model_picker && !activeWorkflow?.uses_tryon) ? (
                  <Button disabled={selectedModels.size === 0} onClick={() => setCurrentStep('settings')}>Continue to Settings</Button>
                ) : (
                  <Button disabled={selectedModels.size === 0} onClick={() => setCurrentStep('pose')}>
                    Continue to Scene {selectedModels.size > 1 && `(${selectedModels.size} models)`}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pose Selection */}
        {currentStep === 'pose' && selectedModel && (
          <div className="space-y-4 pb-20">
            <TryOnPreview product={selectedProduct} scratchUpload={scratchUpload} model={selectedModel} models={Array.from(selectedModelMap.values())} pose={selectedPose} poses={Array.from(selectedPoses).map(id => selectedPoseMap.get(id)!).filter(Boolean)} creditCost={creditCost} selectedGender={selectedModel?.gender} products={isMultiProductMode ? productQueue : undefined} />
            <Card><CardContent className="p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold">Select Scenes</h2>
                    <p className="text-sm text-muted-foreground">
                      {isFreeUser
                        ? 'Free plan: 1 scene per generation'
                        : 'Select scenes for your shoot'}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {selectedPoses.size} selected{!isFreeUser && selectedPoses.size > 0 ? ` · ${selectedPoses.size * parseInt(imageCount) * 6 * (isMultiProductMode ? productQueue.length : 1)} credits` : ''}
                  </Badge>
                </div>
              </div>
              {selectedPoses.size > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                  <span className="text-xs text-muted-foreground self-center mr-1">Selected:</span>
                  {Array.from(selectedPoses).map(id => {
                    const pose = selectedPoseMap.get(id);
                    if (!pose) return null;
                    return (
                      <div key={id} className="flex items-center gap-1.5 bg-background rounded-md px-2 py-1 border border-border text-xs">
                        <img src={getOptimizedUrl(pose.previewUrl, { quality: 50 })} alt={pose.name} className="w-6 h-6 rounded object-cover" />
                        <span className="font-medium truncate max-w-[120px] text-foreground">{pose.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.values(posesByCategory).flat().map((pose) => {
                  const selectionIndex = selectedPoses.has(pose.poseId)
                    ? Array.from(selectedPoses).indexOf(pose.poseId) + 1
                    : undefined;
                  return (
                    <PoseSelectorCard
                      key={pose.poseId}
                      pose={pose}
                      isSelected={selectedPoses.has(pose.poseId)}
                      onSelect={() => handleSelectPose(pose)}
                      selectedGender={selectedModel?.gender}
                      selectionIndex={selectionIndex}
                    />
                  );
                })}
              </div>
              <MissingRequestBanner
                category="scene"
                title="Missing a scene? Tell us and we'll create it."
                placeholder="Describe the scene or environment you'd like…"
              />
            </CardContent></Card>
            <div className="fixed bottom-4 left-0 right-0 lg:left-[var(--sidebar-offset)] z-50 px-4">
              <div className="max-w-3xl mx-auto bg-background border border-border rounded-2xl shadow-lg p-4 flex items-center justify-between gap-4">
                <Button variant="outline" onClick={() => setCurrentStep('model')}>Back</Button>
                <Button disabled={selectedPoses.size === 0} onClick={() => setCurrentStep('settings')}>
                  Continue to Settings {selectedPoses.size > 0 && `(${selectedPoses.size} scene${selectedPoses.size > 1 ? 's' : ''})`}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Template Selection */}
        {/* Template Selection — only for non-workflow or workflows without config */}
        {!hasWorkflowConfig && (currentStep === 'template' || (currentStep === 'settings' && generationMode === 'product-only')) && (selectedProduct || scratchUpload) && (
          <>
            {/* Selected Product Card */}
            <Card><CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{sourceType === 'scratch' ? 'Uploaded Image' : 'Selected Product'}</span>
                <Button variant="link" size="sm" onClick={() => setCurrentStep(sourceType === 'scratch' ? 'upload' : 'source')}>Change</Button>
              </div>
              {sourceType === 'scratch' && scratchUpload ? (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                    <img src={scratchUpload.previewUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold">{scratchUpload.productInfo.title}</p>
                    <p className="text-sm text-muted-foreground">Custom Upload • {scratchUpload.productInfo.productType}</p>
                  </div>
                </div>
              ) : selectedProduct && (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                      <img src={selectedProduct.images[0]?.url || '/placeholder.svg'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold">{selectedProduct.title}</p>
                      <p className="text-sm text-muted-foreground">{selectedProduct.vendor} • {selectedProduct.productType}</p>
                      <div className="flex gap-1 mt-1">{selectedProduct.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}</div>
                    </div>
                  </div>
                  {selectedProduct.images.length > 1 && (
                    <div className="space-y-2">
                      <Separator />
                      <p className="text-sm font-medium">Source images for generation</p>
                      <div className="flex flex-wrap gap-3">
                        {selectedProduct.images.map(img => {
                          const isSelected = selectedSourceImages.has(img.id);
                          return (
                            <div key={img.id} onClick={() => toggleSourceImage(img.id)}
                              className={`relative cursor-pointer rounded-lg overflow-hidden transition-all ${isSelected ? 'ring-2 ring-primary ring-offset-2' : 'ring-1 ring-border hover:ring-primary'}`}>
                              <img src={getOptimizedUrl(img.url, { quality: 60 })} alt="" loading="lazy" className="w-16 h-16 object-cover" />
                              {isSelected && (
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-3 h-3 text-primary-foreground" />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Show active brand profile if selected */}
              {selectedBrandProfile && (
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{selectedBrandProfile.name}</span>
                      <Badge variant="secondary" className="text-[10px] capitalize">{selectedBrandProfile.tone}</Badge>
                    </div>
                    <Button variant="link" size="sm" onClick={() => setCurrentStep('brand-profile')}>Change</Button>
                  </div>
                </div>
              )}
            </CardContent></Card>

            {/* Template Grid */}
            {currentStep === 'template' && (
              <div className={selectedTemplate ? 'pb-24' : ''}>
                <div className="space-y-4">
                  <Alert><AlertDescription>Visual Types define the photography style. Each Visual Type produces a different look.</AlertDescription></Alert>

                  {/* Top Picks */}
                  {(() => {
                    const productType = (selectedProduct?.productType || scratchUpload?.productInfo.productType || '').toLowerCase();
                    let productCategory: TemplateCategory = 'other';
                    if (['sweater', 'shirt', 'apparel', 'hoodie', 'leggings', 'tank', 'jogger'].some(kw => productType.includes(kw))) productCategory = 'garments';
                    else if (['serum', 'cream', 'beauty'].some(kw => productType.includes(kw))) productCategory = 'beauty-skincare';
                    else if (['food', 'cereal'].some(kw => productType.includes(kw))) productCategory = 'food';
                    else if (['coffee', 'tea', 'juice', 'beverage', 'drink'].some(kw => productType.includes(kw))) productCategory = 'beverages';
                    else if (['sofa', 'couch', 'table', 'desk', 'chair', 'bed', 'shelf', 'cabinet', 'dresser', 'wardrobe', 'furniture'].some(kw => productType.includes(kw))) productCategory = 'furniture';
                    else if (['decor', 'home', 'candle', 'vase', 'lamp', 'pillow'].some(kw => productType.includes(kw))) productCategory = 'home-decor';
                    else if (['supplement', 'vitamin'].some(kw => productType.includes(kw))) productCategory = 'supplements-wellness';

                    const topPicks = mockTemplates.filter(t => t.enabled && t.category === productCategory).slice(0, 3);
                    if (topPicks.length < 3) topPicks.push(...mockTemplates.filter(t => t.enabled && t.category === 'other').slice(0, 3 - topPicks.length));
                    const topPickIds = topPicks.map(t => t.templateId);

                    return (
                      <>
                        <Card><CardContent className="p-5 space-y-4">
                          <div>
                            <h2 className="text-base font-semibold">Top Picks for {categoryLabels[productCategory]}</h2>
                            <p className="text-sm text-muted-foreground">Best Visual Types for {productType || 'your'} products</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {topPicks.map(t => (
                              <TemplatePreviewCard key={t.templateId} template={{ ...t, recommended: false }} isSelected={selectedTemplate?.templateId === t.templateId} onSelect={() => handleSelectTemplate(t)} showCredits={false} />
                            ))}
                          </div>
                        </CardContent></Card>

                        <Card><CardContent className="p-5 space-y-4">
                          <div>
                            <h2 className="text-base font-semibold">Browse All Visual Types</h2>
                            <p className="text-sm text-muted-foreground">Explore all available photography styles</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                              <Button key={cat.id} variant={selectedCategory === cat.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(cat.id)}>
                                {cat.label}
                              </Button>
                            ))}
                          </div>
                          {(() => {
                            const browse = mockTemplates.filter(t => t.enabled && (selectedCategory === 'all' || t.category === selectedCategory) && !topPickIds.includes(t.templateId));
                            return browse.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {browse.map(t => <TemplatePreviewCard key={t.templateId} template={{ ...t, recommended: false }} isSelected={selectedTemplate?.templateId === t.templateId} onSelect={() => handleSelectTemplate(t)} showCredits={false} />)}
                              </div>
                            ) : (
                              <p className="py-8 text-center text-sm text-muted-foreground">
                                {selectedCategory === 'all' ? 'All Visual Types shown above.' : `No additional ${categoryLabels[selectedCategory as TemplateCategory]} Visual Types.`}
                              </p>
                            );
                          })()}
                        </CardContent></Card>
                      </>
                    );
                  })()}
                </div>

                {selectedTemplate && (
                  <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg z-30 lg:left-60">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={getTemplateImage(selectedTemplate.templateId)} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="text-sm font-semibold">{selectedTemplate.name}</p>
                          <p className="text-xs text-muted-foreground">{creditCost} credits</p>
                        </div>
                      </div>
                      <Button onClick={() => setCurrentStep('settings')}>Continue to Settings</Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Settings */}
            {currentStep === 'settings' && generationMode === 'product-only' && (
              <div className="space-y-4">
                <Card><CardContent className="p-5 space-y-4">
                  <h3 className="text-base font-semibold">Generation Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Number of Images</Label>
                      <Select value={imageCount} onValueChange={v => setImageCount(v as '1' | '2' | '3' | '4')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 image</SelectItem>
                          {!isFreeUser && <SelectItem value="2">2 images</SelectItem>}
                          {!isFreeUser && <SelectItem value="3">3 images</SelectItem>}
                          {!isFreeUser && <SelectItem value="4">4 images</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Quality</Label>
                      <Select value={quality} onValueChange={v => setQuality(v as ImageQuality)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard — Fast generation, good quality</SelectItem>
                          <SelectItem value="high">High (Pro Model) — Best quality, ~30-60s per image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                </CardContent></Card>

                <Card><CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setBrandKitOpen(!brandKitOpen)}>
                    <h3 className="text-base font-semibold">
                      {selectedBrandProfile ? `Brand Settings — ${selectedBrandProfile.name}` : 'Brand Settings'}
                    </h3>
                    <span className="text-xs text-muted-foreground">{brandKitOpen ? '▲' : '▼'}</span>
                  </div>
                  {brandKitOpen && (
                    <div className="space-y-4">
                      {selectedBrandProfile && (
                        <Alert>
                          <AlertDescription className="text-xs">
                            Settings pre-filled from your brand profile "{selectedBrandProfile.name}". You can still adjust them below.
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Brand Tone</Label>
                          <Select value={brandTone} onValueChange={v => setBrandTone(v as BrandTone)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="clean">Clean</SelectItem>
                              <SelectItem value="luxury">Luxury</SelectItem>
                              <SelectItem value="playful">Playful</SelectItem>
                              <SelectItem value="bold">Bold</SelectItem>
                              <SelectItem value="minimal">Minimal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Background</Label>
                          <Select value={backgroundStyle} onValueChange={v => setBackgroundStyle(v as BackgroundStyle)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="studio">Studio</SelectItem>
                              <SelectItem value="lifestyle">Lifestyle</SelectItem>
                              <SelectItem value="gradient">Gradient</SelectItem>
                              <SelectItem value="pattern">Pattern</SelectItem>
                              <SelectItem value="contextual">Contextual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <NegativesChipSelector value={negatives} onChange={setNegatives} />
                    </div>
                  )}
                </CardContent></Card>

                <div className={cn("p-4 rounded-lg border flex items-center justify-between", balance >= creditCost ? "border-border bg-muted/30" : "border-destructive/30 bg-destructive/5")}>
                  <div>
                    <p className="text-sm font-semibold">Total: {creditCost} credits</p>
                    <p className="text-xs text-muted-foreground">{imageCount} images × {quality === 'high' ? 2 : 1} credit{quality === 'high' ? 's' : ''}</p>
                  </div>
                  {balance >= creditCost ? (
                    <p className="text-sm text-muted-foreground">{balance} credits available</p>
                  ) : (
                    <button onClick={() => setNoCreditsModalOpen(true)} className="flex items-center gap-1 text-sm text-destructive font-semibold hover:underline">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {balance} credits — need {creditCost}. Top up
                    </button>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCurrentStep('template')}>Back</Button>
                  <Button
                    onClick={balance >= creditCost ? handleGenerateClick : () => setNoCreditsModalOpen(true)}
                    className={balance < creditCost ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
                  >
                    {balance >= creditCost ? `Generate ${imageCount} Images` : 'Buy Credits'}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Upscale Workflow Settings */}
        {isUpscale && currentStep === 'settings' && (selectedProduct || scratchUpload) && (
          <UpscaleSettingsPanel
            selectedProduct={selectedProduct}
            scratchUpload={scratchUpload}
            sourceType={sourceType}
            isMultiProductMode={isMultiProductMode}
            productQueue={productQueue}
            upscaleResolution={upscaleResolution}
            setUpscaleResolution={setUpscaleResolution}
            creditCost={creditCost}
            upscaleImageCount={upscaleImageCount}
            balance={balance}
            openBuyModal={() => setNoCreditsModalOpen(true)}
            handleGenerateClick={handleGenerateClick}
            setCurrentStep={setCurrentStep}
          />
        )}

        {/* Workflow-Specific Settings */}
        {hasWorkflowConfig && !isUpscale && currentStep === 'settings' && (generationMode !== 'virtual-try-on' || isSelfieUgc) && (selectedProduct || scratchUpload) && (
          <WorkflowSettingsPanel
            selectedProduct={selectedProduct}
            scratchUpload={scratchUpload}
            sourceType={sourceType}
            isMultiProductMode={isMultiProductMode}
            productQueue={productQueue}
            userProducts={userProducts}
            activeWorkflow={activeWorkflow ?? null}
            workflowConfig={workflowConfig}
            variationStrategy={variationStrategy}
            uiConfig={uiConfig}
            isFlatLay={isFlatLay}
            isMirrorSelfie={isMirrorSelfie}
            isSelfieUgc={isSelfieUgc}
            isInteriorDesign={isInteriorDesign}
            selectedVariationIndices={selectedVariationIndices}
            setSelectedVariationIndices={setSelectedVariationIndices}
            sceneFilterCategory={sceneFilterCategory}
            setSceneFilterCategory={setSceneFilterCategory}
            flatLayPhase={flatLayPhase}
            setFlatLayPhase={setFlatLayPhase}
            selectedFlatLayProductIds={selectedFlatLayProductIds}
            selectedAesthetics={selectedAesthetics}
            setSelectedAesthetics={setSelectedAesthetics}
            stylingNotes={stylingNotes}
            setStylingNotes={setStylingNotes}
            flatLayPropStyle={flatLayPropStyle}
            setFlatLayPropStyle={setFlatLayPropStyle}
            mirrorSettingsPhase={mirrorSettingsPhase}
            setMirrorSettingsPhase={setMirrorSettingsPhase}
            ugcMood={ugcMood}
            setUgcMood={setUgcMood}
            ugcOutfit={ugcOutfit}
            setUgcOutfit={setUgcOutfit}
            ugcInteractionPhrase={resolveUgcInteractionPhrase(selectedProduct)}
            productSlot={resolveProductSlot(selectedProduct)}
            quality={quality}
            setQuality={setQuality}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            selectedAspectRatios={selectedAspectRatios}
            setSelectedAspectRatios={setSelectedAspectRatios}
            framing={framing}
            setFraming={setFraming}
            selectedFramings={selectedFramings}
            setSelectedFramings={setSelectedFramings}
            productAngle={productAngle}
            setProductAngle={setProductAngle}
            selectedBrandProfile={selectedBrandProfile}
            selectedBrandProfileId={selectedBrandProfileId}
            brandProfiles={brandProfiles}
            balance={balance}
            creditCost={creditCost}
            isFreeUser={isFreeUser}
            workflowImageCount={workflowImageCount}
            workflowModelCount={workflowModelCount}
            multiProductCount={multiProductCount}
            angleMultiplier={angleMultiplier}
            aspectRatioCount={aspectRatioCount}
            framingCount={framingCount}
            interiorType={interiorType}
            isAdmin={isAdmin}
            isGeneratingPreviews={isGeneratingPreviews}
            openBuyModal={() => setNoCreditsModalOpen(true)}
            handleGenerateClick={handleGenerateClick}
            handleGenerateScenePreviews={handleGenerateScenePreviews}
            setCurrentStep={setCurrentStep}
            onFreeLimit={(reason) => conversionState.openUpgradeDrawer(reason)}
          />
        )}

        {currentStep === 'settings' && generationMode === 'virtual-try-on' && selectedModels.size > 0 && selectedPoses.size > 0 && (
          <TryOnSettingsPanel
            selectedProduct={selectedProduct}
            scratchUpload={scratchUpload}
            selectedModel={selectedModel!}
            selectedModels={selectedModels}
            selectedModelMap={selectedModelMap}
            selectedPose={selectedPose}
            selectedPoses={selectedPoses}
            selectedPoseMap={selectedPoseMap}
            creditCost={creditCost}
            imageCount={imageCount}
            setImageCount={setImageCount}
            quality={quality}
            setQuality={setQuality}
            framing={framing}
            setFraming={setFraming}
            selectedFramings={selectedFramings}
            setSelectedFramings={setSelectedFramings}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            selectedAspectRatios={selectedAspectRatios}
            setSelectedAspectRatios={setSelectedAspectRatios}
            balance={balance}
            isFreeUser={isFreeUser}
            isMultiProductMode={isMultiProductMode}
            multiProductCount={multiProductCount}
            productQueue={productQueue}
            tryOnSceneCount={tryOnSceneCount}
            openBuyModal={() => setNoCreditsModalOpen(true)}
            handleGenerateClick={handleGenerateClick}
            setCurrentStep={setCurrentStep}
          />
        )}

        {/* Generating */}
        {currentStep === 'generating' && (
          <Card><CardContent className="p-10 flex flex-col items-center gap-6">
            {(() => {
              const productImg = sourceType === 'scratch' ? scratchUpload?.previewUrl : selectedProduct?.images?.[0]?.url;
              const modelImg = selectedModel?.previewUrl;
              const showModel = (generationMode === 'virtual-try-on' || activeWorkflow?.uses_tryon) && modelImg;

              if (showModel && productImg) {
                return (
                  <div className="relative w-20 h-20">
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/20 animate-pulse-subtle">
                      <img src={getOptimizedUrl(modelImg, { quality: 60 })} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full overflow-hidden border-2 border-background ring-2 ring-primary/20 animate-pulse-subtle">
                      <img src={getOptimizedUrl(productImg, { quality: 60 })} alt="" className="w-full h-full object-cover" />
                    </div>
                  </div>
                );
              }
              if (isFlatLay && selectedFlatLayProductIds.size > 1) {
                const flatLayProducts = userProducts.filter(p => selectedFlatLayProductIds.has(p.id));
                return (
                  <div className="flex -space-x-3 mb-2">
                    {flatLayProducts.map((p) => (
                      <div key={p.id} className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-primary/20 border-2 border-background animate-pulse-subtle">
                        <ShimmerImage src={getOptimizedUrl(p.image_url, { quality: 60 })} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                );
              }
              if (productImg) {
                return (
                  <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/20 animate-pulse-subtle">
                    <img src={getOptimizedUrl(productImg, { quality: 60 })} alt="" className="w-full h-full object-cover" />
                  </div>
                );
              }
              return (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-subtle">
                  {generationMode === 'virtual-try-on' ? <User className="w-7 h-7 text-primary" /> : <Image className="w-7 h-7 text-primary" />}
                </div>
              );
            })()}
            <div className="text-center">
              <h2 className="text-lg font-semibold">
                {isUpscale ? `Enhancing to ${upscaleResolution === '4k' ? '4K' : '2K'}...` :
                 (hasWorkflowConfig || isSelfieUgc || isMirrorSelfie) ? `Creating ${activeWorkflow?.name}...` :
                 generationMode === 'virtual-try-on' ? 'Creating Virtual Try-On...' : 'Creating Your Images...'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isUpscale ? `Upscaling ${upscaleImageCount} image${upscaleImageCount !== 1 ? 's' : ''} — sharpening details & recovering textures` :
                 (generationMode === 'virtual-try-on' || activeWorkflow?.uses_tryon) ? (() => { const tryOnTotal = hasMultipleJobs ? multiProductJobIds.size : (tryOnModelCount * tryOnSceneCount * (selectedAspectRatios.size > 0 ? selectedAspectRatios.size : 1) * (selectedFramings.has('auto') ? 1 : Math.max(1, selectedFramings.size)) * multiProductCount); return `Dressing ${selectedModel?.name} in "${selectedProduct?.title}"${tryOnTotal > 1 ? ` · ${tryOnTotal} images` : ''}`; })() :
                 (hasWorkflowConfig || isSelfieUgc || isMirrorSelfie) ? `Generating ${hasMultipleJobs ? multiProductJobIds.size : selectedVariationIndices.size} image${(hasMultipleJobs ? multiProductJobIds.size : selectedVariationIndices.size) !== 1 ? 's' : ''} of "${selectedProduct?.title || scratchUpload?.productInfo.title}"` :
                 isFlatLay && selectedFlatLayProductIds.size > 1 ? `Arranging ${selectedFlatLayProductIds.size} products on ${selectedVariationIndices.size} surface${selectedVariationIndices.size !== 1 ? 's' : ''}` :
                 isInteriorDesign ? (() => { const styles = Array.from(selectedVariationIndices).map(i => variationStrategy?.variations[i]?.label).filter(Boolean); return styles.length > 1 ? `Staging your ${interiorRoomType || 'room'} in ${styles.length} styles: ${styles.join(', ')}` : `Staging your ${interiorRoomType || 'room'} in ${styles[0] || 'selected'} style`; })() :
                 `Creating ${imageCount} images of "${selectedProduct?.title}"`}
              </p>
            </div>

            {/* Finalizing handoff overlay */}
            {isFinalizingResults && (
              <div className="w-full max-w-md text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="font-medium">Finalizing results…</span>
                </div>
                <Progress value={100} className="h-2" />
                <p className="text-xs text-muted-foreground">Preparing your images for review</p>
              </div>
            )}

            {/* Multi-product progress banner */}
            {(isMultiProductMode || hasMultipleJobs) && !isFinalizingResults && (
              <MultiProductProgressBanner
                productQueue={productQueue}
                multiProductResults={multiProductResults}
                multiProductJobIds={multiProductJobIds}
                generatingProgress={generatingProgress}
                activeJob={activeJob}
                onCancel={cancelQueue}
                totalExpectedImages={multiProductJobIds.size > 0 ? multiProductJobIds.size : undefined}
                totalJobs={multiProductJobIds.size}
                workflowName={activeWorkflow?.name}
                isProModel={generationMode === 'virtual-try-on' || quality === 'high'}
              />
            )}

            {/* Batch progress - enhanced (hidden in multi-product mode) */}
            {batchState && batchState.totalJobs > 1 && !isMultiProductMode && !hasMultipleJobs && (() => {
              const isVariationWorkflow = hasWorkflowConfig && variationStrategy?.variations?.length;
              const sortedIndices = Array.from(selectedVariationIndices).sort((a, b) => a - b);
              const variationLabel = isInteriorDesign ? 'style' : isVariationWorkflow ? 'variation' : 'image';
              const doneCount = batchState.completedJobs + batchState.failedJobs;
              return (
              <div className="w-full max-w-md space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {batchState.allDone
                      ? `All ${batchState.totalJobs} ${variationLabel}s complete`
                      : `${variationLabel.charAt(0).toUpperCase() + variationLabel.slice(1)} ${Math.min(doneCount + 1, batchState.totalJobs)} of ${batchState.totalJobs} generating...`}
                  </span>
                  <span className="text-muted-foreground">
                    {doneCount} of {batchState.totalJobs} done · {batchState.readyImages} image{batchState.readyImages !== 1 ? 's' : ''} ready
                  </span>
                </div>
                <Progress value={doneCount / batchState.totalJobs * 100} className="h-2" />
                {(() => {
                  const estimatePerImage = quality === 'high' ? 12 : 4;
                  const totalEstSeconds = Math.max(batchState.totalJobs * estimatePerImage, 1);
                  const estLowSec = Math.round(totalEstSeconds * 0.8);
                  const estHighSec = Math.round(totalEstSeconds * 1.2);
                  const useSeconds = estHighSec < 60;
                  const estLow = useSeconds ? estLowSec : Math.max(1, Math.ceil(estLowSec / 60));
                  const estHigh = useSeconds ? estHighSec : Math.max(estLow, Math.ceil(estHighSec / 60));
                  const estUnit = useSeconds ? 'sec' : 'min';
                  const pct = Math.round(doneCount / batchState.totalJobs * 100);
                  return (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Est. ~{estLow === estHigh ? estLow : `${estLow}-${estHigh}`} {estUnit} for {batchState.totalJobs} {variationLabel}{batchState.totalJobs !== 1 ? 's' : ''}</span>
                      <span>{pct}%</span>
                    </div>
                  );
                })()}
                {/* Per-variation status chips */}
                {isVariationWorkflow && sortedIndices.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {sortedIndices.map((varIdx, jobIdx) => {
                      const label = variationStrategy!.variations[varIdx]?.label ?? `#${varIdx + 1}`;
                      const job = batchState.jobs[jobIdx];
                      const status = job?.status ?? 'queued';
                      return (
                        <div
                          key={varIdx}
                          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] transition-all ${
                            status === 'completed' ? 'border-primary/30 bg-primary/5 text-foreground' :
                            status === 'processing' ? 'border-primary bg-primary/10 ring-1 ring-primary/30 text-foreground' :
                            status === 'failed' ? 'border-destructive/30 bg-destructive/5 text-destructive' :
                            'border-border bg-muted/30 text-muted-foreground opacity-70'
                          }`}
                        >
                          {status === 'completed' && <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />}
                          {status === 'processing' && <Loader2 className="w-3 h-3 text-primary animate-spin flex-shrink-0" />}
                          {status === 'failed' && <X className="w-3 h-3 text-destructive flex-shrink-0" />}
                          {status === 'queued' && <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                          <span className="truncate max-w-[100px]">{label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                {batchState.failedJobs > 0 && (
                  <p className="text-xs text-amber-600">{batchState.failedJobs} {variationLabel}{batchState.failedJobs > 1 ? 's' : ''} failed — credits refunded</p>
                )}
                {/* Show active job indicator within batch */}
                {activeJob && (
                  <QueuePositionIndicator job={activeJob} onCancel={cancelQueue} />
                )}
              </div>
              );
            })()}

            {/* Single job progress (hidden in multi-product mode) */}
            {(!batchState || batchState.totalJobs <= 1) && !isMultiProductMode && !hasMultipleJobs && (
              <div className="w-full max-w-md">
                {activeJob ? (
                  <QueuePositionIndicator job={activeJob} onCancel={cancelQueue} />
                ) : (
                  <Progress value={0} className="h-2 animate-pulse" />
                )}
              </div>
            )}

            <Button variant="link" onClick={handleCancelGeneration}><X className="w-4 h-4 mr-1" /> Cancel</Button>
          </CardContent></Card>
        )}

        {/* Results */}
        {currentStep === 'results' && (selectedProduct || scratchUpload) && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    {activeWorkflow?.name || (isInteriorDesign ? 'Interior Staging' : sourceType === 'scratch' ? 'Image Generation' : 'Generation Summary')}
                  </h3>
                  {activeWorkflow && (
                    <Badge variant="secondary" className="text-[10px]">Visual Type</Badge>
                  )}
                </div>

                {/* Reference thumbnails row */}
                <div className="flex gap-4 overflow-x-auto pb-1">
                  {isMultiProductMode && productQueue.length > 1 ? (
                    productQueue.map(p => (
                      <div key={p.id} className="flex-shrink-0 text-center">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-muted/30">
                          <img src={p.images?.[0]?.url || '/placeholder.svg'} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 max-w-[56px] truncate">Product</p>
                        <p className="text-[10px] font-medium mt-0.5 max-w-[56px] truncate">{p.title}</p>
                      </div>
                    ))
                  ) : isFlatLay && selectedFlatLayProductIds.size > 1 ? (
                    userProducts.filter(up => selectedFlatLayProductIds.has(up.id)).map(up => (
                      <div key={up.id} className="flex-shrink-0 text-center">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-muted/30">
                          <ShimmerImage src={getOptimizedUrl(up.image_url || '/placeholder.svg', { quality: 60 })} alt={up.title} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 max-w-[56px] truncate">Product</p>
                        <p className="text-[10px] font-medium mt-0.5 max-w-[56px] truncate">{up.title}</p>
                      </div>
                    ))
                  ) : (selectedProduct || scratchUpload) && (
                    <div className="flex-shrink-0 text-center">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-muted/30">
                        <img src={getOptimizedUrl(sourceType === 'scratch' ? scratchUpload?.previewUrl : selectedProduct?.images[0]?.url || '/placeholder.svg', { quality: 60 })} alt="Product" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 max-w-[56px] truncate">Product</p>
                      <p className="text-[10px] font-medium mt-0.5 max-w-[56px] truncate">{sourceType === 'scratch' ? scratchUpload?.productInfo.title : selectedProduct?.title}</p>
                    </div>
                  )}
                  {Array.from(selectedModelMap.values()).map(model => (
                    <div key={model.modelId} className="flex-shrink-0 text-center">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-muted/30">
                        <img src={getOptimizedUrl(model.previewUrl, { quality: 60 })} alt={model.name} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 max-w-[56px] truncate">Model</p>
                      <p className="text-[10px] font-medium mt-0.5 max-w-[56px] truncate">{model.name}</p>
                    </div>
                  ))}
                  {Array.from(selectedPoseMap.values()).map(pose => (
                    <div key={pose.poseId} className="flex-shrink-0 text-center">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-muted/30">
                        <img src={getOptimizedUrl(pose.previewUrl, { quality: 60 })} alt={pose.name} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 max-w-[56px] truncate">Scene</p>
                      <p className="text-[10px] font-medium mt-0.5 max-w-[56px] truncate">{pose.name}</p>
                    </div>
                  ))}
                  {variationStrategy?.type === 'scene' && selectedVariationIndices.size > 0 && variationStrategy.variations
                    .filter((_, i) => selectedVariationIndices.has(i))
                    .map((v, idx) => (
                      <div key={`scene-${idx}`} className="flex-shrink-0 text-center">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-muted/30">
                          {v.preview_url ? (
                            <img src={getOptimizedUrl(v.preview_url, { quality: 60 })} alt={v.label} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">Scene</div>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 max-w-[56px] truncate">Scene</p>
                        <p className="text-[10px] font-medium mt-0.5 max-w-[56px] truncate">{v.label}</p>
                      </div>
                    ))
                  }
                </div>

                {/* Settings chips */}
                <div className="flex flex-wrap gap-1.5">
                  {framing && <Badge variant="outline" className="text-[10px] font-normal">Framing: {framing.replace(/_/g, ' ')}</Badge>}
                  {selectedBrandProfile && (
                    <Badge variant="outline" className="text-[10px] font-normal">Brand: {selectedBrandProfile.name}</Badge>
                  )}
                </div>

              </CardContent>
            </Card>

            {/* Layer 1: Post-generation upgrade card */}
            {isFreeUser && conversionState.canShowLayer1 && (
              <PostGenerationUpgradeCard
                category={conversionCategory}
                onSeeMore={() => {
                  conversionState.dismissLayer1();
                  openBuyModal('post_gen_card');
                }}
                onDismiss={conversionState.dismissLayer1}
              />
            )}

            <Card><CardContent className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">Generated Images</h2>
                  <p className="text-xs text-muted-foreground">Click images to select them</p>
                </div>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm"  onClick={() => {
                    if (selectedForPublish.size === generatedImages.length) {
                      setSelectedForPublish(new Set());
                    } else {
                      setSelectedForPublish(new Set(generatedImages.map((_, i) => i)));
                    }
                  }}>{selectedForPublish.size === generatedImages.length ? 'Deselect All' : 'Select All'}</Button>
                  <Button variant="outline" size="sm"  onClick={() => handleDownloadZip()} disabled={zipDownloading}>
                    {zipDownloading ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{zipPct}%</> : <><Download className="w-3.5 h-3.5 mr-1.5" /> Download All</>}
                  </Button>
                  <Button variant="outline" size="sm"  onClick={() => setCurrentStep('settings')}>Adjust</Button>
                  {isInteriorDesign && (
                    <Button variant="outline" size="sm"  onClick={() => {
                      setGeneratedImages([]);
                      setSelectedForPublish(new Set());
                      setSelectedVariationIndices(new Set());
                      setCurrentStep('settings');
                    }}>
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Try Another Style
                    </Button>
                  )}
                  <Button variant="outline" size="sm"  onClick={() => { setCurrentStep('source'); setSelectedProduct(null); setScratchUpload(null); setSelectedTemplate(null); setGeneratedImages([]); setSelectedForPublish(new Set()); setProductQueue([]); setCurrentProductIndex(0); setMultiProductResults(new Map()); }}>Start Over</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {generatedImages.map((url, index) => (
                  <div key={index} className={`generation-preview relative group cursor-pointer rounded-lg overflow-hidden ${selectedForPublish.has(index) ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                    <ShimmerImage src={url} alt={`Generated ${index + 1}`} className="w-full object-cover aspect-auto rounded" wrapperClassName="bg-muted/10 rounded" onClick={() => toggleImageSelection(index)} />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2" onClick={() => toggleImageSelection(index)}>
                      <button onClick={e => { e.stopPropagation(); handleImageClick(index); }} className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white" title="View full size"><Maximize2 className="w-3.5 h-3.5" /></button>
                      <button onClick={e => { e.stopPropagation(); handleDownloadImage(index); }} className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white" title="Download"><Download className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedForPublish.has(index) ? 'bg-primary border-primary scale-110' : 'border-white bg-black/50'}`} onClick={() => toggleImageSelection(index)}>
                      {selectedForPublish.has(index) ? <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" /> : <span className="text-white text-[9px] font-bold">{index + 1}</span>}
                    </div>
                  </div>
                ))}
              </div>

            </CardContent></Card>

            {/* Contextual feedback card — right after images */}
            <ContextualFeedbackCard
              workflow={activeWorkflow?.slug || 'freestyle'}
              questionText={activeWorkflow?.slug
                ? 'Does this result look right for your product?'
                : 'Did this generation match what you had in mind?'}
              buttonLabels={activeWorkflow?.slug
                ? { yes: 'Yes', almost: 'Almost', no: 'No' }
                : { yes: 'Yes', almost: 'Almost', no: 'No' }}
              reasonChips={activeWorkflow?.slug
                ? ['Fit looks wrong', 'Product not preserved', 'Model doesn\'t match', 'Pose variety is weak', 'Styling feels off', 'Scene/background off', 'Needs more realism', 'Other']
                : ['Prompt too hard to control', 'Product not preserved', 'Model/look is off', 'Scene/style is off', 'Composition is wrong', 'Not realistic enough', 'Needs better quality', 'Too slow', 'Other']}
              textPlaceholder={activeWorkflow?.slug
                ? 'What should improve? e.g. better fit, more natural pose'
                : 'What were you hoping to get instead?'}
              resultId={completedFeedbackJobId || activeJob?.id}
              imageUrl={generatedImages[0]}
              triggerType="result_ready"
            />

            {/* Combined crafted + saved + CTA */}
            <div className="flex flex-col items-center gap-2 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {[avatarSophia, avatarZara, avatarKenji, avatarLuna].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="Team member"
                      className="w-7 h-7 rounded-full border-2 border-background object-cover"
                      style={{ marginLeft: i === 0 ? 0 : '-0.4rem' }}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  Crafted by your studio team
                  <span className="mx-1">·</span>
                  <CheckCircle className="w-3.5 h-3.5 text-primary" />
                  Saved to your library
                </p>
              </div>
              <Button className="min-h-[44px]" onClick={() => navigate('/app/library')}>
                View in Library
              </Button>
            </div>

            {/* Floating selection bar */}
            {selectedForPublish.size > 0 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl px-5 py-3">
                <span className="text-sm font-medium whitespace-nowrap">{selectedForPublish.size} selected</span>
                <Separator orientation="vertical" className="h-6" />
                <Button size="sm" variant="outline"  onClick={() => handleDownloadZip(Array.from(selectedForPublish))} disabled={zipDownloading}>
                  {zipDownloading ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{zipPct}%</> : <><Download className="w-3.5 h-3.5 mr-1.5" />Download ZIP</>}
                </Button>
                <button onClick={() => setSelectedForPublish(new Set())} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <TryOnConfirmModal open={tryOnConfirmModalOpen} onClose={() => setTryOnConfirmModalOpen(false)} onConfirm={handleTryOnConfirmGenerate}
        product={selectedProduct} model={selectedModel} models={Array.from(selectedModelMap.values())} pose={selectedPose}
        imageCount={parseInt(imageCount)} aspectRatio={aspectRatio} creditsRemaining={balance} isLoading={isEnqueuing} onBuyCredits={() => setNoCreditsModalOpen(true)}
        sourceImageUrl={selectedProduct && selectedSourceImages.size > 0 ? selectedProduct.images.find(img => selectedSourceImages.has(img.id))?.url : undefined} />
      <PublishModal open={publishModalOpen} onClose={() => setPublishModalOpen(false)} onPublish={handlePublish}
        selectedImages={Array.from(selectedForPublish).map(i => generatedImages[i])} product={selectedProduct} existingImages={selectedProduct?.images || []} />
      <ProductAssignmentModal open={productAssignmentModalOpen} onClose={() => setProductAssignmentModalOpen(false)}
        products={userProducts.length > 0 ? userProducts.map(up => mapUserProductToProduct(up)) : [SAMPLE_LISTING_PRODUCT]} selectedProduct={assignToProduct} onSelectProduct={setAssignToProduct}
        onPublish={(product, mode) => { toast.success(`${selectedForPublish.size} image(s) ${mode === 'add' ? 'added to' : 'replaced on'} "${product.title}"!`); setProductAssignmentModalOpen(false); navigate('/app/library'); }}
        selectedImageCount={selectedForPublish.size} />
      <ImageLightbox images={generatedImages} currentIndex={lightboxIndex} open={lightboxOpen} onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex} onSelect={toggleImageSelection} onDownload={handleDownloadImage}
        onRegenerate={handleRegenerate} selectedIndices={selectedForPublish} productName={selectedProduct?.title || scratchUpload?.productInfo.title} />
      <NoCreditsModal open={noCreditsModalOpen} onClose={() => setNoCreditsModalOpen(false)} category={conversionCategory} generationCount={generatedImages.length} />
      <AddProductModal
        open={showAddProduct}
        onOpenChange={setShowAddProduct}
        onProductAdded={() => queryClient.invalidateQueries({ queryKey: ['user-products'] })}
      />
      <UpgradeValueDrawer
        open={conversionState.layer2Open}
        onClose={conversionState.dismissLayer2}
        category={conversionCategory}
        source={conversionState.layer2Reason || undefined}
        generationContext={{
          productThumbnail: selectedProduct?.images?.[0]?.url || scratchUpload?.previewUrl,
          productTitle: selectedProduct?.title || scratchUpload?.productInfo.title,
          sceneName: Array.from(selectedPoseMap.values())[0]?.name,
          modelName: Array.from(selectedModelMap.values())[0]?.name,
        }}
      />

    </PageHeader>
  );
}
