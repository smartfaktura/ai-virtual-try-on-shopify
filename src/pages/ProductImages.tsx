import { useState, useCallback, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { NoCreditsModal } from '@/components/app/NoCreditsModal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SEOHead } from '@/components/SEOHead';
import { PageHeader } from '@/components/app/PageHeader';
import { CatalogStepper } from '@/components/app/catalog/CatalogStepper';
import { Package, Layers, Paintbrush, ClipboardCheck, Sparkles, CheckCircle, Search, Check, History, RefreshCw, Loader2, Upload, FlaskConical } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';
import { supabase } from '@/integrations/supabase/client';
import { enqueueWithRetry, isEnqueueError, sendWake, paceDelay } from '@/lib/enqueueGeneration';
import { computeTotalImages, expandMultiSelects, computeTotalImagesPerProduct, computeTotalImagesPerCategory } from '@/lib/sceneVariations';
import { convertImageToBase64 } from '@/lib/imageUtils';
import { injectActiveJob } from '@/lib/optimisticJobInjection';
import { toast } from '@/lib/brandedToast';
import { useProductImageScenes, dbToFrontend } from '@/hooks/useProductImageScenes';
import { CATEGORY_KEYWORDS } from '@/components/app/product-images/ProductImagesStep2Scenes';
import { getTriggeredBlocks, BLOCK_FIELD_MAP, REFERENCE_TRIGGERS } from '@/components/app/product-images/detailBlockConfig';
import { AddProductModal, type AddProductTab } from '@/components/app/AddProductModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { ProductContextStrip } from '@/components/app/product-images/ProductContextStrip';
import { ProductImagesStickyBar } from '@/components/app/product-images/ProductImagesStickyBar';
import { DemoProductPicker } from '@/components/app/product-images/DemoProductPicker';
import { DiscoverPreselectedCard } from '@/components/app/product-images/DiscoverPreselectedCard';
import type { DemoProduct } from '@/data/demoProducts';

// Lazy-load step components for faster initial render
const step2Loader = () => import('@/components/app/product-images/ProductImagesStep2Scenes');
const ProductImagesStep2Scenes = lazy(step2Loader);
const ProductImagesStep3Refine = lazy(() => import('@/components/app/product-images/ProductImagesStep3Refine'));
const ProductImagesStep4Review = lazy(() => import('@/components/app/product-images/ProductImagesStep4Review'));
const ProductImagesStep5Generating = lazy(() => import('@/components/app/product-images/ProductImagesStep5Generating'));
const ProductImagesStep6Results = lazy(() => import('@/components/app/product-images/ProductImagesStep6Results'));

import { useUserModels } from '@/hooks/useUserModels';
import { useCustomModels } from '@/hooks/useCustomModels';
import { useModelSortOrder } from '@/hooks/useModelSortOrder';
import { mockModels } from '@/data/mockData';
import { useProductAnalysis } from '@/hooks/useProductAnalysis';
import type { PIStep, UserProduct, DetailSettings, ProductAnalysis } from '@/components/app/product-images/types';
import { buildDynamicPrompt } from '@/lib/productImagePromptBuilder';

const STEP_DEFS = [
  { number: 1, label: 'Product', icon: Package },
  { number: 2, label: 'Shots', icon: Layers },
  { number: 3, label: 'Setup', icon: Paintbrush },
  { number: 4, label: 'Generate', icon: Sparkles },
];

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
const PASTE_SHORTCUT = IS_MAC ? '⌘ V' : 'Ctrl + V';


export default function ProductImages() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { balance, setBalanceFromServer, refreshBalance } = useCredits();
  const queryClient = useQueryClient();
  const { analyses, isAnalyzing, analyzeProducts, reAnalyzeProduct, pendingIds } = useProductAnalysis();
  const { allScenes: baseScenes, fetchSceneById } = useProductImageScenes();
  // Out-of-category scene injected when Recreate from Explore points to a
  // scene_ref scoped to a different product family than the current product.
  const [injectedScene, setInjectedScene] = useState<typeof baseScenes[number] | null>(null);
  const allScenes = useMemo(() => {
    if (!injectedScene) return baseScenes;
    if (baseScenes.some(s => s.id === injectedScene.id)) return baseScenes;
    return [...baseScenes, injectedScene];
  }, [baseScenes, injectedScene]);

  // Discover Recreate: pre-select scene from ?sceneId=<uuid> (preferred) or ?scene=<Title>
  const [discoverScene, setDiscoverScene] = useState<{ sceneId: string; title: string } | null>(null);
  const discoverSceneConsumedRef = useRef(false);

  const INITIAL_DETAILS: DetailSettings = {
    aspectRatio: '1:1', quality: 'high', imageCount: '1',
    backgroundTone: 'auto', negativeSpace: 'auto', surfaceType: 'auto',
    lightingStyle: 'soft-diffused', shadowStyle: 'natural', mood: 'auto',
    brandingVisibility: 'product-accent',
    selectedAspectRatios: [],
  };

  const [step, setStep] = useState<PIStep>(1);
  const [noCreditsModalOpen, setNoCreditsModalOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [selectedSceneIds, setSelectedSceneIds] = useState<Set<string>>(new Set());
  const [perCategoryScenes, setPerCategoryScenes] = useState<Map<string, Set<string>>>(new Map());
  const [forcedActiveCategoryId, setForcedActiveCategoryId] = useState<string | null>(null);
  const [sceneExtraRefs, setSceneExtraRefs] = useState<Record<string, string>>({});
  const [details, setDetails] = useState<DetailSettings>(INITIAL_DETAILS);
  const [showLastSettingsBanner, setShowLastSettingsBanner] = useState(false);
  const [lastSettingsCategory, setLastSettingsCategory] = useState<string | null>(null);
  const prevProductIdsRef = useRef<string | null>(null);

  // Discover Recreate resolver. Match priority:
  //   1. ?sceneRef (text scene_id from product_image_scenes — deterministic, hard-stop on miss)
  //   2. ?sceneId (UUID — legacy)
  //   3. ?sceneCategory (origin category from Discover — legacy)
  //   4. Product analysis category (when products selected AND analyses ready)
  //   5. First candidate (only as last resort with no products selected at all)
  useEffect(() => {
    if (discoverSceneConsumedRef.current) return;
    const sceneRefParam = searchParams.get('sceneRef');
    const sceneIdParam = searchParams.get('sceneId');
    const sceneTitle = searchParams.get('scene');
    const sceneCategoryParam = searchParams.get('sceneCategory');
    const sceneImageParam = searchParams.get('sceneImage');
    if (!sceneRefParam && !sceneIdParam && !sceneTitle) return;

    // Fast path: sceneRef is deterministic (text scene_id). Resolve immediately
    // without waiting for the full scene library to load. Check cache first,
    // then fall back to a single-row DB fetch + injectedScene render so the
    // "Pre-selected from Explore" card appears within ~200ms of landing.
    if (sceneRefParam) {
      const cached = allScenes.find(s => s.id === sceneRefParam);
      if (cached) {
        setDiscoverScene({ sceneId: cached.id, title: cached.title });
        discoverSceneConsumedRef.current = true;
        setSearchParams(prev => {
          const next = new URLSearchParams(prev);
          next.delete('scene');
          next.delete('sceneId');
          next.delete('sceneRef');
          next.delete('sceneCategory');
          return next;
        }, { replace: true });
        return;
      }

      // Not in cache yet (cold library OR out-of-category). Fetch the single
      // row directly from DB — instant, doesn't wait for the full library.
      discoverSceneConsumedRef.current = true;
      (async () => {
        try {
          const dbRow = await fetchSceneById(sceneRefParam);
          if (!dbRow) {
            setSearchParams(prev => {
              const next = new URLSearchParams(prev);
              next.delete('sceneRef');
              return next;
            }, { replace: true });
            toast.info('That Explore scene is no longer available. Pick another shot to continue.');
            return;
          }
          const fe = dbToFrontend(dbRow);
          setInjectedScene(fe);
          setDiscoverScene({ sceneId: fe.id, title: fe.title });
          setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.delete('scene');
            next.delete('sceneId');
            next.delete('sceneRef');
            next.delete('sceneCategory');
            return next;
          }, { replace: true });
        } catch (err) {
          console.warn('[ProductImages] sceneRef DB fetch failed:', err);
        }
      })();
      return;
    }

    // sceneId / title resolvers still need the full library to disambiguate.
    if (allScenes.length === 0) return;

    let match: typeof allScenes[number] | null = null;

    if (!match && sceneIdParam) {
      match = allScenes.find(s => s.id === sceneIdParam) ?? null;
    }

    if (!match && sceneTitle) {
      const target = sceneTitle.trim().toLowerCase();
      let candidates = allScenes.filter(s => s.title.trim().toLowerCase() === target);

      if (candidates.length === 0) {
        // No matching title — give up so we don't re-run forever
        console.warn('[ProductImages] Discover scene title did not resolve:', sceneTitle);
        discoverSceneConsumedRef.current = true;
        return;
      }

      // HARD FILTER: when products are selected, restrict candidates to the
      // product's category FIRST. This guarantees we never return a watch
      // scene for a beverage product, even if URL hints are missing/wrong.
      if (selectedProductIds.size > 0) {
        const resolvedCats = Array.from(selectedProductIds)
          .map(pid => analyses[pid]?.category)
          .filter(Boolean) as string[];
        if (resolvedCats.length === 0) {
          // Products selected but analyses not back yet — WAIT. Don't fall through.
          return;
        }
        const userCats = new Set(resolvedCats.map(c => c.toLowerCase()));
        const filtered = candidates.filter(c => {
          const cc = (c.categoryCollection ?? '').toLowerCase();
          return cc && userCats.has(cc);
        });
        // Only narrow when the filter actually keeps something — otherwise
        // fall through to URL hints so we don't strand the user with no scene.
        if (filtered.length > 0) candidates = filtered;
      }

      // 2. URL category hint (highest priority after sceneId, within filtered set)
      if (sceneCategoryParam) {
        const hint = sceneCategoryParam.trim().toLowerCase();
        match =
          candidates.find(c => (c.categoryCollection ?? '').toLowerCase() === hint) ??
          candidates.find(c => (c.categoryCollection ?? '').toLowerCase() === hint.replace(/s$/, '')) ??
          candidates.find(c => {
            const cc = (c.categoryCollection ?? '').toLowerCase();
            return cc.includes(hint) || hint.includes(cc);
          }) ??
          null;
      }

      // 2b. Preview image URL exact match — bulletproof fallback if sceneCategory
      // misses (slug drift) or wasn't passed. preview_image_url is unique per row.
      if (!match && sceneImageParam) {
        match = candidates.find(c => (c as any).previewUrl === sceneImageParam) ?? null;
      }

      // 3. First in (already category-filtered) candidates.
      if (!match) {
        match = candidates[0] ?? null;
      }

      // Still no match and products are selected — wait, hopefully analyses come back.
      if (!match && selectedProductIds.size > 0) return;
    }

    if (match) {
      setDiscoverScene({ sceneId: match.id, title: match.title });
      discoverSceneConsumedRef.current = true;
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.delete('scene');
        next.delete('sceneId');
        next.delete('sceneRef');
        next.delete('sceneCategory');
        return next;
      }, { replace: true });
    }
  }, [allScenes, selectedProductIds, analyses, searchParams, setSearchParams]);

  // Resolve full scene object for instant "From Explore" rendering in Step 2.
  const discoverSceneFull = useMemo(() => {
    if (!discoverScene?.sceneId) return null;
    const fromAll = allScenes.find(s => s.id === discoverScene.sceneId);
    if (fromAll) return fromAll;
    if (injectedScene && injectedScene.id === discoverScene.sceneId) return injectedScene;
    return null;
  }, [discoverScene?.sceneId, allScenes, injectedScene]);

  // Preload the Step 2 lazy chunk as soon as we detect a Discover Recreate
  // landing — eliminates Suspense fallback flash when user clicks Continue.
  useEffect(() => {
    const hasDiscoverParam =
      searchParams.get('sceneRef') ||
      searchParams.get('sceneId') ||
      searchParams.get('scene');
    if (hasDiscoverParam) {
      step2Loader().catch(() => {});
    }
  }, [searchParams]);

  // Auto-add the discoverScene to selection the moment it resolves — runs at
  // page level so selection happens regardless of Step 2 mount/analysis state.
  const autoAddedDiscoverRef = useRef<string | null>(null);
  useEffect(() => {
    if (!discoverScene?.sceneId) return;
    if (autoAddedDiscoverRef.current === discoverScene.sceneId) return;
    if (selectedSceneIds.has(discoverScene.sceneId)) {
      autoAddedDiscoverRef.current = discoverScene.sceneId;
      return;
    }
    const next = new Set(selectedSceneIds);
    next.add(discoverScene.sceneId);
    setSelectedSceneIds(next);
    autoAddedDiscoverRef.current = discoverScene.sceneId;
  }, [discoverScene?.sceneId, selectedSceneIds]);


  // Load models for Refine step
  // Defer model queries until Refine step
  const { asProfiles: userModelProfiles } = useUserModels({ enabled: step >= 3 });
  const { asProfiles: customModelProfiles } = useCustomModels({ enabled: step >= 3 });
  const { sortModels, applyOverrides, applyNameOverrides, filterHidden } = useModelSortOrder();
  const globalModelProfiles = useMemo(
    () => sortModels(filterHidden(applyNameOverrides(applyOverrides([...mockModels, ...(customModelProfiles || [])])))),
    [customModelProfiles, sortModels, applyOverrides, applyNameOverrides, filterHidden]
  );

  const [addProductOpen, setAddProductOpen] = useState(false);
  const [addProductCompact, setAddProductCompact] = useState(true);
  const [addProductTab, setAddProductTab] = useState<AddProductTab>('manual');
  const [productSearch, setProductSearch] = useState('');
  
  const [visibleCount, setVisibleCount] = useState(25);
  const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null);
  const MAX_PRODUCTS = 20;

  // Quick upload state
  const [quickUploading, setQuickUploading] = useState(false);
  const [quickUploadProgress, setQuickUploadProgress] = useState('');
  const quickUploadInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [demoPickerOpen, setDemoPickerOpen] = useState(false);

  const handleQuickUpload = useCallback(async (file: File) => {
    if (!user) { toast.error('Please sign in to upload'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    if (file.size > 20 * 1024 * 1024) { toast.error('Image must be under 20MB'); return; }

    setQuickUploading(true);
    setQuickUploadProgress('Uploading…');

    try {
      // 1. Upload to storage
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${timestamp}-${randomId}.${extension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-uploads')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData } = supabase.storage
        .from('product-uploads')
        .getPublicUrl(uploadData.path);

      const imageUrl = urlData.publicUrl;

      // 2. Analyze product image
      setQuickUploadProgress('Analyzing…');
      let title = 'Untitled Product';
      let productType = '';
      let description = '';

      try {
        const { data: session } = await supabase.auth.getSession();
        const token = session?.session?.access_token;
        if (token) {
          const { data: analysisData } = await supabase.functions.invoke('analyze-product-image', {
            body: { imageUrl },
          });
          if (analysisData?.title) title = analysisData.title;
          if (analysisData?.productType) productType = analysisData.productType;
          if (analysisData?.description) description = analysisData.description;
        }
      } catch {
        // Analysis failed — proceed with defaults
      }

      // 3. Insert product
      setQuickUploadProgress('Creating product…');
      const { data: newProduct, error: insertError } = await supabase
        .from('user_products')
        .insert({
          user_id: user.id,
          title,
          product_type: productType,
          description,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);

      // 4. Optimistically insert into cache, auto-select, then reconcile
      queryClient.setQueryData<UserProduct[]>(['user-products', user.id], (old) => {
        const list = old ?? [];
        if (list.some(p => p.id === newProduct.id)) return list;
        return [newProduct as UserProduct, ...list];
      });
      setSelectedProductIds(prev => {
        const next = new Set(prev);
        next.add(newProduct.id);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['user-products'] });

      // Product appearing in grid is sufficient feedback — no toast needed
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      toast.error(msg);
    } finally {
      setQuickUploading(false);
      setQuickUploadProgress('');
    }
  }, [user, queryClient]);

  // Instant demo product insert — uses pre-baked metadata, zero AI cost
  const handleDemoSelect = useCallback(async (demo: DemoProduct) => {
    if (!user) { toast.error('Please sign in to try a demo'); return; }
    try {
      const { data: newProduct, error } = await supabase
        .from('user_products')
        .insert({
          user_id: user.id,
          title: demo.title,
          product_type: demo.productType,
          description: demo.description,
          image_url: demo.image_url,
          analysis_json: demo.analysis_json as never,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      queryClient.setQueryData<UserProduct[]>(['user-products', user.id], (old) => {
        const list = old ?? [];
        if (list.some(p => p.id === newProduct.id)) return list;
        return [newProduct as UserProduct, ...list];
      });
      setSelectedProductIds(prev => {
        const next = new Set(prev);
        next.add(newProduct.id);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['user-products'] });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add demo';
      toast.error(msg);
    }
  }, [user, queryClient]);

  // Paste listener for Step 1
  useEffect(() => {
    if (step !== 1) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) handleQuickUpload(file);
          return;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [step, handleQuickUpload]);


  // Generation state
  const [jobMap, setJobMap] = useState<Map<string, string>>(new Map());
  const [completedJobs, setCompletedJobs] = useState(0);
  const [results, setResults] = useState<Map<string, { images: Array<{ url: string; sceneName: string; sceneId?: string }>; productName: string }>>(new Map());
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [expectedJobCount, setExpectedJobCount] = useState(0);
  const [enqueuedCount, setEnqueuedCount] = useState(0);
  const [completedJobIds, setCompletedJobIds] = useState<Set<string>>(new Set());
  const [failedJobIds, setFailedJobIds] = useState<Set<string>>(new Set());
  const pollingStartRef = useRef<number>(0);

  const resetGenerationState = useCallback(() => {
    setJobMap(new Map());
    setCompletedJobs(0);
    setResults(new Map());
    setExpectedJobCount(0);
    setEnqueuedCount(0);
    setCompletedJobIds(new Set());
    setFailedJobIds(new Set());
    if (pollingRef.current) clearTimeout(pollingRef.current);
    try { sessionStorage.removeItem('pi_generation_session'); } catch {}
  }, []);

  // Load user products
  const { data: userProducts = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['user-products', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as UserProduct[];
    },
    enabled: !!user?.id,
  });

  const selectedProducts = useMemo(
    () => userProducts.filter(p => selectedProductIds.has(p.id)),
    [userProducts, selectedProductIds],
  );

  const selectedScenes = useMemo(
    () => allScenes.filter(s => selectedSceneIds.has(s.id)),
    [allScenes, selectedSceneIds],
  );

  // Primary category for outfit defaults
  const primaryCategory = useMemo(() => {
    for (const p of selectedProducts) {
      // Check live analyses map first
      const liveAnalysis = analyses[p.id];
      if (liveAnalysis?.category) return liveAnalysis.category;
      // Then cached analysis_json
      const analysis = p.analysis_json as any;
      if (analysis?.category) return analysis.category as string;
    }
    // Keyword fallback: map raw product_type to category ID
    const combined = selectedProducts.map(p =>
      `${p.title} ${p.description} ${p.product_type} ${(p.tags || []).join(' ')}`.toLowerCase()
    ).join(' ');
    for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(combined))) return catId;
    }
    return undefined;
  }, [selectedProducts, analyses]);

  // Compute categoryGroups: Map<categoryId, productId[]>
  const categoryGroups = useMemo(() => {
    const groups = new Map<string, string[]>();
    for (const p of selectedProducts) {
      let cat = 'other';
      const liveAnalysis = analyses[p.id];
      if (liveAnalysis?.category) { cat = liveAnalysis.category; }
      else {
        const analysis = p.analysis_json as any;
        if (analysis?.category) { cat = analysis.category; }
        else {
          const combined = `${p.title} ${p.description} ${p.product_type} ${(p.tags || []).join(' ')}`.toLowerCase();
          for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            if (keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(combined))) { cat = catId; break; }
          }
        }
      }
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(p.id);
    }
    return groups;
  }, [selectedProducts, analyses]);

  // Memoize hasMultipleCategories
  const hasMultipleCategories = useMemo(() => {
    return categoryGroups.size > 1;
  }, [categoryGroups]);

  // Category product counts for credit calculation
  const categoryProductCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const [catId, productIds] of categoryGroups) {
      counts.set(catId, productIds.length);
    }
    return counts;
  }, [categoryGroups]);

  // Check for last-used settings when entering Refine step
  useEffect(() => {
    if (step === 3 && primaryCategory) {
      const key = `pi_last_details_${primaryCategory}`;
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          setLastSettingsCategory(primaryCategory);
          setShowLastSettingsBanner(true);
        }
      } catch {}
    } else {
      setShowLastSettingsBanner(false);
    }
  }, [step, primaryCategory]);

  // Save details when moving from Refine to Review
  useEffect(() => {
    if (step === 4 && primaryCategory) {
      try {
        localStorage.setItem(`pi_last_details_${primaryCategory}`, JSON.stringify(details));
      } catch {}
    }
  }, [step, primaryCategory, details]);

  const loadLastSettings = useCallback(() => {
    if (!lastSettingsCategory) return;
    try {
      const saved = localStorage.getItem(`pi_last_details_${lastSettingsCategory}`);
      if (saved) {
        const parsed = JSON.parse(saved) as DetailSettings;
        // Keep format settings from current session but load everything else
        setDetails({ ...parsed, aspectRatio: details.aspectRatio, quality: details.quality, imageCount: details.imageCount });
      }
    } catch {}
    setShowLastSettingsBanner(false);
  }, [lastSettingsCategory, details.aspectRatio, details.quality, details.imageCount]);

  const imageCount = parseInt(details.imageCount || '1', 10);
  const creditsPerImage = 6;
  const modelCount = (details.selectedModelIds?.length || (details.selectedModelId ? 1 : 0)) || 1;
  const totalImages = (perCategoryScenes.size > 0 && hasMultipleCategories)
    ? computeTotalImagesPerCategory(perCategoryScenes, categoryProductCounts, allScenes, imageCount, details, modelCount)
    : computeTotalImages(selectedProducts.length, selectedScenes, imageCount, details, modelCount);
  const totalCredits = totalImages * creditsPerImage;
  const canAfford = balance >= totalCredits;

  // Ref for wizard content area
  const wizardContentRef = useRef<HTMLDivElement>(null);

  // Scroll wizard into view on step change
  useEffect(() => {
    const el = document.getElementById('app-main-scroll');
    if (el) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  // Reset visible count when search changes
  useEffect(() => {
    setVisibleCount(25);
  }, [productSearch]);

  // Infinite scroll observer with proper cleanup
  useEffect(() => {
    if (!sentinelEl) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisibleCount(v => v + 25);
    }, { rootMargin: '200px' });
    obs.observe(sentinelEl);
    return () => obs.disconnect();
  }, [sentinelEl]);

  // Reset downstream state when product selection changes
  useEffect(() => {
    const key = Array.from(selectedProductIds).sort().join(',');
    if (prevProductIdsRef.current !== null && prevProductIdsRef.current !== key) {
      setSelectedSceneIds(new Set());
      setPerCategoryScenes(new Map());
      setSceneExtraRefs({});
      setDetails(INITIAL_DETAILS);
      if (step > 1) setStep(1);
    }
    prevProductIdsRef.current = key;
  }, [selectedProductIds]);

  // Stale detail cleanup when scenes change
  useEffect(() => {
    const triggered = getTriggeredBlocks(selectedSceneIds, allScenes, selectedProducts.length);
    const staleKeys: (keyof DetailSettings)[] = [];
    for (const [block, fields] of Object.entries(BLOCK_FIELD_MAP)) {
      if (!triggered.includes(block)) {
        for (const field of fields) {
          if (details[field as keyof DetailSettings]) staleKeys.push(field as keyof DetailSettings);
        }
      }
    }
    if (staleKeys.length > 0) {
      const cleaned = { ...details };
      for (const key of staleKeys) {
        delete cleaned[key];
      }
      setDetails(cleaned);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSceneIds, selectedProducts.length]);

  // Trigger product analysis when moving from step 1 to step 2
  // Use a serialised ID string as dep to avoid re-triggering on array reference changes
  const selectedProductIdString = selectedProducts.map(p => p.id).sort().join(',');
  useEffect(() => {
    if (step === 2 && selectedProducts.length > 0) {
      analyzeProducts(selectedProducts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedProductIdString, analyzeProducts]);

  // Track which refs were auto-filled from product data vs manually uploaded
  const [autoFilledRefs, setAutoFilledRefs] = useState<Set<string>>(new Set());

  // Auto-fill back/packaging/side/inside/texture references from stored product data when entering step 3
  useEffect(() => {
    if (step === 3 && selectedProducts.length > 0) {
      const newAutoFilled = new Set<string>();
      const isMulti = selectedProducts.length > 1;

      // For single product, keep backward-compatible global keys
      // For multi product, use per-product keys: trigger:{type}:{productId}
      setSceneExtraRefs(prev => {
        const next = { ...prev };
        for (const product of selectedProducts) {
          const p = product as any;
          const suffix = isMulti ? `:${product.id}` : '';

          if (p.back_image_url) {
            const key = `trigger:backView${suffix}`;
            if (!next[key]) { next[key] = p.back_image_url; newAutoFilled.add(key); }
          }
          if (p.packaging_image_url) {
            const key = `trigger:packagingDetails${suffix}`;
            if (!next[key]) { next[key] = p.packaging_image_url; newAutoFilled.add(key); }
          }
          if (p.side_image_url) {
            const key = `trigger:sideView${suffix}`;
            if (!next[key]) { next[key] = p.side_image_url; newAutoFilled.add(key); }
          }
          if (p.inside_image_url) {
            const key = `trigger:interiorDetail${suffix}`;
            if (!next[key]) { next[key] = p.inside_image_url; newAutoFilled.add(key); }
          }
          if (p.texture_image_url) {
            const key = `trigger:textureDetail${suffix}`;
            if (!next[key]) { next[key] = p.texture_image_url; newAutoFilled.add(key); }
          }
        }
        if (Object.keys(next).length === Object.keys(prev).length) return prev;
        return next;
      });

      // Also fill legacy detail fields for single product backward compat
      if (!isMulti) {
        const firstProduct = selectedProducts[0] as any;
        setDetails(prev => {
          const updates: Partial<DetailSettings> = {};
          if (firstProduct.back_image_url && !prev.backReferenceUrl) {
            updates.backReferenceUrl = firstProduct.back_image_url;
            newAutoFilled.add('backReferenceUrl');
          }
          if (firstProduct.packaging_image_url && !prev.packagingReferenceUrl) {
            updates.packagingReferenceUrl = firstProduct.packaging_image_url;
            newAutoFilled.add('packagingReferenceUrl');
          }
          if (Object.keys(updates).length === 0) return prev;
          return { ...prev, ...updates };
        });
      }

      if (newAutoFilled.size > 0) {
        setAutoFilledRefs(prev => new Set([...prev, ...newAutoFilled]));
      }
    }
  }, [step, selectedProducts]);

  // Resolve selected model gender for prompt builder
  const selectedModelGender = useMemo(() => {
    if (!details.selectedModelId) return undefined;
    const allModels = [...(userModelProfiles || []), ...(globalModelProfiles || [])];
    const model = allModels.find(m => m.modelId === details.selectedModelId);
    return model?.gender;
  }, [details.selectedModelId, userModelProfiles, globalModelProfiles]);

  // Build instruction from scene + details — use live analyses map instead of stale DB row
  const buildInstruction = useCallback((scene: typeof allScenes[0], product: UserProduct) => {
    const analysis = analyses[product.id] || (product as any).analysis_json as ProductAnalysis | null;
    return buildDynamicPrompt(scene, product, analysis, details, selectedModelGender);
  }, [details, analyses, selectedModelGender]);

  // Generation handler
  const handleGenerate = useCallback(async () => {
    if (!canAfford) { setNoCreditsModalOpen(true); return; }

    // Cancel any in-flight polling from a previous generation
    if (pollingRef.current) { clearTimeout(pollingRef.current); pollingRef.current = null; }
    setJobMap(new Map());

    const imgCount = parseInt(details.imageCount || '1', 10);
    const mc = (details.selectedModelIds?.length || (details.selectedModelId ? 1 : 0)) || 1;
    const totalExpected = (perCategoryScenes.size > 0 && hasMultipleCategories)
      ? computeTotalImagesPerCategory(perCategoryScenes, categoryProductCounts, allScenes, imgCount, details, mc)
      : computeTotalImages(selectedProducts.length, selectedScenes, imgCount, details, mc);
    setExpectedJobCount(totalExpected);
    setEnqueuedCount(0);
    setCompletedJobs(0);
    setCompletedJobIds(new Set());
    setFailedJobIds(new Set());
    setStep(5);

    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;
    if (!token) { toast.error('Authentication required'); setStep(4); return; }

    // Resolve all selected models
    const modelIds = details.selectedModelIds?.length ? details.selectedModelIds : (details.selectedModelId ? [details.selectedModelId] : []);
    const allModels = [...(userModelProfiles || []), ...(globalModelProfiles || [])];
    const modelRefs: Array<{ name: string; gender: string; ethnicity: string; bodyType: string; ageRange: string; imageUrl: string }> = [];
    for (const mid of modelIds) {
      const found = allModels.find(m => m.modelId === mid);
      if (found) {
        const modelBase64 = await convertImageToBase64(found.sourceImageUrl || found.previewUrl);
        modelRefs.push({
          name: found.name,
          gender: found.gender || '',
          ethnicity: found.ethnicity || '',
          bodyType: found.bodyType || '',
          ageRange: found.ageRange || '',
          imageUrl: modelBase64,
        });
      }
    }

    const WORKFLOW_ID = '4bb79966-42f1-4720-af45-183aa954e8e1';
    const batchId = crypto.randomUUID();
    const newJobMap = new Map<string, string>();
    let lastBalance: number | null = null;
    const aspectRatio = details.aspectRatio || '1:1';
    const selectedRatios = details.selectedAspectRatios || [aspectRatio];
    // imgCount already declared above

    // Phase 1: Build all job descriptors without network calls
    interface JobDescriptor {
      key: string;
      payload: Record<string, unknown>;
      productTitle: string;
      hasModel: boolean;
      batchId: string;
    }
    const allJobs: JobDescriptor[] = [];

    for (const product of selectedProducts) {
      const base64Image = await convertImageToBase64(product.image_url);
      const productAnalysis = analyses[product.id] || (product as any).analysis_json || null;

      const productCategory = (() => {
        for (const [catId, pids] of categoryGroups) {
          if (pids.includes(product.id)) return catId;
        }
        return null;
      })();
      const categorySceneIds = productCategory ? perCategoryScenes.get(productCategory) : null;
      const scenesForProduct = categorySceneIds
        ? selectedScenes.filter(s => categorySceneIds.has(s.id))
        : selectedScenes;

      for (let sceneIdx = 0; sceneIdx < scenesForProduct.length; sceneIdx++) {
        const scene = scenesForProduct[sceneIdx];
        const needsModel = scene.triggerBlocks?.some((b: string) => b === 'personDetails' || b === 'actionDetails');
        // For scenes needing a model, iterate over all selected models; otherwise just once with no model
        const modelsForScene = needsModel && modelRefs.length > 0 ? modelRefs : [undefined];

        for (let mIdx = 0; mIdx < modelsForScene.length; mIdx++) {
          const currentModelRef = modelsForScene[mIdx];
          const variations = expandMultiSelects(scene, details);

          for (let vIdx = 0; vIdx < variations.length; vIdx++) {
            const variationOverride = variations[vIdx];
            // Per-product outfit override: AI Stylist assigns a unique preset per product
            const perProductOutfit = details.outfitConfigByProduct?.[product.id];
            const variationDetails: DetailSettings = {
              ...details,
              ...variationOverride,
              ...(perProductOutfit ? { outfitConfig: perProductOutfit } : {}),
            };
            const variationInstruction = buildDynamicPrompt(scene, product, productAnalysis, variationDetails, currentModelRef?.gender || selectedModelGender);

            const sceneRatios = details.sceneAspectOverrides?.[scene.id] || selectedRatios;
            for (const ratioForJob of sceneRatios) {
              for (let i = 0; i < imgCount; i++) {
                const propProductIds = details.sceneProps?.[scene.id] || [];
                const propProducts = propProductIds
                  .map(pid => userProducts.find(p => p.id === pid))
                  .filter(Boolean)
                  .map(p => p!);
                const additionalProducts = propProducts.length > 0
                  ? await Promise.all(propProducts.map(async pp => ({
                      title: pp.title,
                      productType: pp.product_type,
                      description: pp.description,
                      imageUrl: await convertImageToBase64(pp.image_url),
                    })))
                  : undefined;

                const variationEntry = {
                  label: scene.title + (variations.length > 1 ? ` (${Object.values(variationOverride).join(', ')})` : '') + (sceneRatios.length > 1 ? ` [${ratioForJob}]` : '') + (modelsForScene.length > 1 && currentModelRef ? ` — ${currentModelRef.name}` : ''),
                  instruction: variationInstruction,
                  aspect_ratio: ratioForJob,
                  ...(scene.useSceneReference && scene.previewUrl ? {
                    use_scene_reference: true,
                    preview_url: scene.previewUrl,
                  } : {}),
                };

                const payload: Record<string, unknown> = {
                  workflow_id: WORKFLOW_ID,
                  workflow_name: 'Product Images',
                  workflow_slug: 'product-images',
                  product: {
                    title: product.title,
                    productType: productAnalysis?.category || product.product_type,
                    description: product.description,
                    dimensions: product.dimensions || undefined,
                    weight: (product as any).weight || undefined,
                    materials: (product as any).materials || undefined,
                    color: (product as any).color || undefined,
                    imageUrl: base64Image,
                    analysis: productAnalysis || undefined,
                  },
                  product_name: product.title,
                  product_image_url: product.image_url,
                  extra_variations: [variationEntry],
                  selected_variations: [0],
                  ...(additionalProducts ? { additional_products: additionalProducts } : {}),
                  ...(currentModelRef ? { model: currentModelRef } : {}),
                  ...(details.packagingReferenceUrl ? { packaging_reference_url: details.packagingReferenceUrl } : {}),
                  ...(() => {
                    const triggerBlocks = scene.triggerBlocks || [];
                    const refs: Record<string, string> = {};
                    for (const tb of triggerBlocks) {
                      const perProductKey = `trigger:${tb}:${product.id}`;
                      const globalKey = `trigger:${tb}`;
                      const refUrl = sceneExtraRefs[perProductKey] || sceneExtraRefs[globalKey];
                      if (refUrl && REFERENCE_TRIGGERS[tb]) {
                        refs.extra_reference_image_url = refUrl;
                        refs.extra_reference_label = REFERENCE_TRIGGERS[tb].promptLabel;
                        break;
                      }
                    }
                    if (!refs.extra_reference_image_url) {
                      if (sceneExtraRefs[scene.id]) {
                        refs.extra_reference_image_url = sceneExtraRefs[scene.id];
                      } else if (triggerBlocks.includes('backView')) {
                        const backRef = sceneExtraRefs[`trigger:backView:${product.id}`] || sceneExtraRefs['trigger:backView'] || details.backReferenceUrl;
                        if (backRef) refs.extra_reference_image_url = backRef;
                      }
                    }
                    if (details.brandLogoText && triggerBlocks.includes('brandLogoOverlay')) {
                      refs.brand_logo_text = details.brandLogoText;
                    }
                    return refs;
                  })(),
                  quality: 'high',
                  aspectRatio: ratioForJob,
                  batch_id: batchId,
                  scene_name: scene.title,
                  scene_id: scene.id,
                  batch_outfit_lock: true,
                  batch_size: scenesForProduct.length,
                };

                const key = `${product.id}_${scene.id}_m${mIdx}_v${vIdx}_r${ratioForJob}_${i}`;
                allJobs.push({ key, payload, productTitle: product.title, hasModel: !!currentModelRef, batchId });
              }
            }
          }
        }
      }
    }

    // Phase 2: Send in parallel chunks of 4
    const CONCURRENCY = 4;
    let aborted = false;
    for (let chunkStart = 0; chunkStart < allJobs.length && !aborted; chunkStart += CONCURRENCY) {
      const chunk = allJobs.slice(chunkStart, chunkStart + CONCURRENCY);
      if (chunkStart > 0) await paceDelay(1); // one delay per chunk

      const results = await Promise.allSettled(
        chunk.map(job =>
          enqueueWithRetry(
            { jobType: 'workflow', payload: job.payload, imageCount: 1, quality: 'high', hasModel: job.hasModel, hasScene: false, skipWake: true },
            token,
          ).then(result => ({ ...job, result }))
        )
      );

      for (const settled of results) {
        if (settled.status !== 'fulfilled') continue;
        const { key, result, productTitle, batchId: bid } = settled.value;
        if (!isEnqueueError(result)) {
          newJobMap.set(key, result.jobId);
          lastBalance = result.newBalance;
          injectActiveJob(queryClient, {
            jobId: result.jobId,
            workflow_name: 'Product Images',
            workflow_slug: 'product-images',
            product_name: productTitle,
            job_type: 'workflow',
            quality: 'high',
            imageCount: 1,
            batch_id: bid,
          });
        } else if (result.type === 'insufficient_credits') {
          toast.error(result.message);
          aborted = true;
        }
      }
      setJobMap(new Map(newJobMap));
      setEnqueuedCount(newJobMap.size);
    }

    if (newJobMap.size === 0) {
      toast.error('Could not queue any jobs');
      setStep(4);
      return;
    }

    if (lastBalance !== null) setBalanceFromServer(lastBalance);
    setJobMap(new Map(newJobMap));
    setEnqueuedCount(newJobMap.size);
    setExpectedJobCount(newJobMap.size);
    sendWake(token);

    // Persist session so page refresh can resume polling
    try {
      sessionStorage.setItem('pi_generation_session', JSON.stringify({
        jobMapEntries: Array.from(newJobMap.entries()),
        expectedJobCount: totalExpected,
        startTime: Date.now(),
        selectedProductIds: Array.from(selectedProductIds),
        selectedSceneIds: Array.from(selectedSceneIds),
      }));
    } catch {}

    startPolling(newJobMap);
  }, [selectedProducts, selectedScenes, canAfford, details, setBalanceFromServer, queryClient, analyses, userProducts, userModelProfiles, globalModelProfiles, selectedModelGender]);

  const finishWithResults = useCallback((jobs: any[], productMap: Map<string, { productId: string; sceneName: string; sceneId?: string; aspectRatio?: string }>) => {
    const resultMap = new Map<string, { images: Array<{ url: string; sceneName: string; sceneId?: string; aspectRatio?: string }>; productName: string }>();
    for (const job of jobs) {
      if (job.status !== 'completed' || !job.result) continue;
      const meta = productMap.get(job.id) || { productId: 'unknown', sceneName: 'Scene' };
      const product = selectedProducts.find(p => p.id === meta.productId);
      const r = job.result as any;
      const images: Array<{ url: string; sceneName: string; sceneId?: string; aspectRatio?: string }> = [];
      if (Array.isArray(r.images)) {
        for (const img of r.images) {
          const url = typeof img === 'string' ? img : img?.url || img?.image_url;
          if (url) images.push({ url, sceneName: meta.sceneName, sceneId: meta.sceneId, aspectRatio: meta.aspectRatio });
        }
      }
      if (images.length > 0) {
        const existing = resultMap.get(meta.productId) || { images: [], productName: product?.title || 'Product' };
        existing.images.push(...images);
        resultMap.set(meta.productId, existing);
      }
    }
    setResults(resultMap);
    refreshBalance();
    setStep(6);
    try { sessionStorage.removeItem('pi_generation_session'); } catch {}
  }, [selectedProducts, refreshBalance]);

  const startPolling = useCallback((activeJobMap: Map<string, string>) => {
    const jobIds = Array.from(activeJobMap.values());
    const productMap = new Map<string, { productId: string; sceneName: string; sceneId?: string; aspectRatio?: string }>();
    for (const [key, jobId] of activeJobMap.entries()) {
      const parts = key.split('_');
      const productId = parts[0];
      const sceneId = parts[1] || '';
      const ratioRaw = parts[3] || '';
      const aspectRatio = ratioRaw.startsWith('r') ? ratioRaw.slice(1).replace('-', ':') : undefined;
      const scene = selectedScenes.find(s => s.id === sceneId);
      productMap.set(jobId, { productId, sceneName: scene?.title || 'Scene', sceneId: sceneId || undefined, aspectRatio });
    }
    pollingStartRef.current = Date.now();
    let lastWakeTime = 0;
    const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
    const WAKE_INTERVAL_MS = 30_000; // Re-wake every 30s if queued jobs remain

    const poll = async () => {
      try {
        // Hard timeout — force transition to results
        if (Date.now() - pollingStartRef.current > TIMEOUT_MS) {
          const { data: finalJobs } = await supabase
            .from('generation_queue')
            .select('id, status, result, payload')
            .in('id', jobIds);
          // Enrich scene names from payload for any that fell back to 'Scene'
          for (const j of finalJobs || []) {
            const existing = productMap.get(j.id);
            if (existing && existing.sceneName === 'Scene' && j.payload) {
              const payloadSceneName = (j.payload as Record<string, unknown>)?.scene_name as string | undefined;
              if (payloadSceneName) productMap.set(j.id, { ...existing, sceneName: payloadSceneName });
            }
          }
          toast.warning('Generation timed out — showing available results.');
          finishWithResults(finalJobs || [], productMap);
          return;
        }

        const { data: jobs } = await supabase
          .from('generation_queue')
          .select('id, status, result, payload')
          .in('id', jobIds);

        // Enrich scene names from payload for any that fell back to 'Scene'
        for (const j of jobs || []) {
          const existing = productMap.get(j.id);
          if (existing && existing.sceneName === 'Scene' && j.payload) {
            const payloadSceneName = (j.payload as Record<string, unknown>)?.scene_name as string | undefined;
            if (payloadSceneName) productMap.set(j.id, { ...existing, sceneName: payloadSceneName });
          }
        }

        if (!jobs) { pollingRef.current = setTimeout(poll, 3000); return; }

        const done = jobs.filter(j => j.status === 'completed' || j.status === 'failed');
        const pct = jobIds.length > 0 ? Math.round((done.length / jobIds.length) * 100) : 0;
        const newCompleted = new Set<string>();
        const newFailed = new Set<string>();
        for (const j of done) {
          if (j.status === 'completed') newCompleted.add(j.id);
          if (j.status === 'failed') newFailed.add(j.id);
        }
        setCompletedJobs(done.length);
        setCompletedJobIds(newCompleted);
        setFailedJobIds(newFailed);

        if (done.length >= jobIds.length) {
          if (newFailed.size > 0) {
            toast.warning(`${newFailed.size} image${newFailed.size !== 1 ? 's' : ''} failed — credits refunded.`);
          }
          finishWithResults(jobs, productMap);
          return;
        }

        // Re-wake dispatcher if queued jobs remain (throttled to every 30s)
        const hasQueued = jobs.some(j => j.status === 'queued');
        if (hasQueued && Date.now() - lastWakeTime > WAKE_INTERVAL_MS) {
          lastWakeTime = Date.now();
          supabase.auth.getSession().then(({ data: s }) => {
            const t = s?.session?.access_token;
            if (t) sendWake(t);
          }).catch(() => {});
        }

        // Near-complete auto-finish: if 90%+ done after 90 seconds, show available results
        const elapsedMs = Date.now() - pollingStartRef.current;
        const threshold = Math.ceil(jobIds.length * 0.9);
        if (elapsedMs > 90_000 && done.length >= threshold && done.length > 0) {
          const remaining = jobIds.length - done.length;
          toast.info(`${remaining} image${remaining !== 1 ? 's' : ''} still processing — showing ${done.length} completed results.`);
          finishWithResults(jobs, productMap);
          return;
        }

        pollingRef.current = setTimeout(poll, pct > 80 ? 1500 : 3000);
      } catch (err) {
        console.warn('[ProductImages] polling error, retrying with token refresh:', err);
        try {
          await supabase.auth.refreshSession();
        } catch { /* ignore refresh errors */ }
        pollingRef.current = setTimeout(poll, 5000);
      }
    };

    pollingRef.current = setTimeout(poll, 2000);
  }, [finishWithResults, selectedScenes]);

  useEffect(() => {
    return () => { if (pollingRef.current) clearTimeout(pollingRef.current); };
  }, []);

  // Restore generation session on mount (page refresh recovery)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('pi_generation_session');
      if (!saved || step !== 1) return;
      const session = JSON.parse(saved);
      const entries: [string, string][] = session.jobMapEntries || [];
      if (entries.length === 0) return;
      const restoredMap = new Map(entries);
      setJobMap(restoredMap);
      setExpectedJobCount(session.expectedJobCount || entries.length);
      setEnqueuedCount(entries.length);
      if (session.selectedProductIds) setSelectedProductIds(new Set(session.selectedProductIds));
      if (session.selectedSceneIds) setSelectedSceneIds(new Set(session.selectedSceneIds));
      // Adjust polling start to account for time already elapsed
      pollingStartRef.current = session.startTime || Date.now();
      setStep(5);
      toast.info('Resuming your generation — hang tight!');
      startPolling(restoredMap);
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canNavigateTo = (s: number) => {
    if (s === 1) return true;
    if (s === 2) return selectedProductIds.size > 0;
    if (s === 3) return selectedProductIds.size > 0 && selectedSceneIds.size > 0;
    if (s === 4) return selectedProductIds.size > 0 && selectedSceneIds.size > 0;
    return false;
  };

  const canProceed = (() => {
    switch (step) {
      case 1: return selectedProductIds.size > 0;
      case 2: {
        if (hasMultipleCategories && perCategoryScenes.size > 0) {
          return Array.from(categoryGroups.keys()).every(catId => (perCategoryScenes.get(catId)?.size || 0) > 0);
        }
        return selectedSceneIds.size > 0;
      }
      case 3: return true;
      case 4: return canAfford && totalImages > 0 && (details.selectedAspectRatios?.length || 0) > 0;
      default: return false;
    }
  })();

  const handleNext = () => {
    switch (step) {
      case 1: setStep(2); break;
      case 2: {
        // In multi-category mode, check each category group has at least 1 shot
        if (hasMultipleCategories && perCategoryScenes.size > 0) {
          const incompleteCatId = Array.from(categoryGroups.keys()).find(catId => (perCategoryScenes.get(catId)?.size || 0) === 0);
          if (incompleteCatId) {
            setForcedActiveCategoryId(incompleteCatId);
            toast.warning(`Please select at least one shot for this category`);
            return;
          }
        }
        setStep(3);
        break;
      }
      case 3: {
        // Auto-select model if on-model scenes exist but no model is selected
        const hasOnModelScenes = selectedScenes.some(s =>
          s.triggerBlocks?.some(b => b === 'personDetails' || b === 'actionDetails')
        );
        if (hasOnModelScenes && !details.selectedModelId && !(details.selectedModelIds?.length) && globalModelProfiles.length > 0) {
          setDetails(prev => ({ ...prev, selectedModelId: globalModelProfiles[0].modelId, selectedModelIds: [globalModelProfiles[0].modelId] }));
          toast.info('Smart defaults applied — we auto-selected a model and best settings for your scenes. You can go back to Refine to customize.');
        }
        setStep(4);
        break;
      }
      case 4: handleGenerate(); break;
    }
  };

  const handleBack = () => {
    switch (step) {
      case 2: setStep(1); break;
      case 3: setStep(2); break;
      case 4: setStep(3); break;
    }
  };

  return (
    <div className="space-y-6 pb-24 overflow-x-clip max-w-full min-w-0">
      <SEOHead title="Create Product Visuals — VOVV" description="Generate product visuals" />
      <PageHeader title="Create Product Visuals" subtitle="Create clean, brand-ready visuals for your products"><span /></PageHeader>

      {step <= 4 && (
        <CatalogStepper
          steps={STEP_DEFS}
          currentStep={step}
          canNavigateTo={canNavigateTo}
          onStepClick={(s) => setStep(s as PIStep)}
        />
      )}

      {step >= 2 && step <= 4 && selectedProducts.length > 0 && (
        <ProductContextStrip products={selectedProducts} onChangeProducts={() => setStep(1)} />
      )}

      <div className="mt-2" ref={wizardContentRef}>
        {step === 1 && (
          <>
            <div className="space-y-3">
              {/* Toolbar */}
              {userProducts.length > 0 && (
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder={`Search ${userProducts.length} products…`}
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="h-8 text-xs pl-8"
                  />
                </div>
                
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => {
                  const filtered = userProducts.filter(p =>
                    p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
                    p.product_type.toLowerCase().includes(productSearch.toLowerCase())
                  );
                  setSelectedProductIds(new Set(filtered.slice(0, MAX_PRODUCTS).map(p => p.id)));
                }}>{productSearch ? 'Select Filtered' : 'Select All'}</Button>
                {selectedProductIds.size > 0 && (
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setSelectedProductIds(new Set())}>Clear</Button>
                )}
              </div>
              )}

              {selectedProductIds.size > 0 && (
                <div className="flex gap-2 items-center">
                  <Badge variant={selectedProductIds.size >= 2 ? 'default' : 'secondary'}>{selectedProductIds.size} selected</Badge>
                  {selectedProductIds.size >= 10 && <span className="text-xs text-muted-foreground">(max {MAX_PRODUCTS})</span>}
                </div>
              )}

              {/* Empty state */}
              {quickUploading && userProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4 border-2 border-dashed border-border rounded-xl bg-muted/30">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <div className="text-center space-y-1">
                    <p className="text-base font-semibold">{quickUploadProgress || 'Uploading…'}</p>
                    <p className="text-sm text-muted-foreground">Your product will appear here in a moment</p>
                  </div>
                </div>
              ) : !isLoadingProducts && userProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-5 border-2 border-dashed border-border rounded-xl bg-muted/30">
                  <Package className="w-12 h-12 text-muted-foreground/40" />
                  <div className="text-center space-y-1.5">
                    <p className="text-base font-semibold text-foreground">Upload your first product photo</p>
                    <p className="text-sm text-muted-foreground max-w-xs">Drag and drop an image here, or use the button below.</p>
                  </div>
                  <Button onClick={() => {
                    quickUploadInputRef.current?.click();
                  }} className="gap-2">
                    <Upload className="w-4 h-4" />Upload product photo
                  </Button>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground w-full max-w-xs">
                    <div className="h-px flex-1 bg-border" />
                    <span>or</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <Button variant="outline" onClick={() => setDemoPickerOpen(true)} className="gap-2">
                    <FlaskConical className="w-4 h-4" />
                    Try a demo product
                  </Button>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    You can also paste an image from your clipboard{' '}
                    <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-mono font-medium text-muted-foreground ml-1">{PASTE_SHORTCUT}</kbd>
                  </p>
                  <input
                    ref={quickUploadInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleQuickUpload(file);
                      e.target.value = '';
                    }}
                  />
                </div>
              ) : (
              (() => {
                const filtered = userProducts.filter(p =>
                  p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
                   (p.product_type || '').toLowerCase().includes(productSearch.toLowerCase())
                );

                if (filtered.length === 0 && productSearch) {
                  return <p className="text-center text-sm text-muted-foreground py-6">No products match "{productSearch}"</p>;
                }

                const visible = filtered.slice(0, visibleCount);
                const remaining = filtered.length - visibleCount;

                const hasMore = remaining > 0;

                const loadMoreSentinel = hasMore && (
                  <div className="pt-4 flex justify-center" ref={setSentinelEl}>
                    <span className="text-xs text-muted-foreground">{remaining} more…</span>
                  </div>
                );

                return (
                  <>
                    <div
                      className="relative grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2"
                      onDragOver={(e) => { e.preventDefault(); if (!isDragOver) setIsDragOver(true); }}
                      onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        // only clear when leaving the grid container, not children
                        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                        setIsDragOver(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        const file = Array.from(e.dataTransfer.files || []).find(f => f.type.startsWith('image/'));
                        if (file) handleQuickUpload(file);
                      }}
                    >
                      {/* Drag-and-drop overlay */}
                      {isDragOver && (
                        <div className="absolute inset-0 z-20 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex flex-col items-center justify-center gap-2 backdrop-blur-sm pointer-events-none">
                          <Upload className="w-8 h-8 text-primary animate-bounce" />
                          <p className="text-sm font-medium text-primary">Drop image to add product</p>
                        </div>
                      )}

                      {/* Upload Image Card — quick-saves immediately */}
                      <div className="group relative flex flex-col rounded-lg border-2 border-dashed border-border hover:border-primary/40 transition-all overflow-hidden">
                        <div
                          role="button"
                          tabIndex={quickUploading ? -1 : 0}
                          onClick={() => { if (!quickUploading) quickUploadInputRef.current?.click(); }}
                          onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !quickUploading) { e.preventDefault(); quickUploadInputRef.current?.click(); } }}
                          aria-disabled={quickUploading}
                          className={cn(
                            'flex-1 flex flex-col',
                            quickUploading ? 'cursor-not-allowed' : 'cursor-pointer'
                          )}
                        >
                          <div className="aspect-square flex flex-col items-center justify-center gap-1.5 bg-muted/40">
                            {quickUploading ? (
                              <Loader2 className="w-6 h-6 text-primary animate-spin" />
                            ) : (
                              <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                          </div>
                          <div className="h-[44px] flex flex-col justify-center px-1.5 py-1">
                            <p className="text-[10px] font-medium text-muted-foreground group-hover:text-primary transition-colors">
                              {quickUploading ? (quickUploadProgress || 'Uploading…') : 'Upload Image'}
                            </p>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setAddProductCompact(false); setAddProductTab('manual'); setAddProductOpen(true); }}
                              className="text-[9px] text-muted-foreground/70 hover:text-primary mt-0.5 underline-offset-2 hover:underline text-left self-start"
                            >
                              More options
                            </button>
                          </div>
                        </div>
                        <input
                          ref={quickUploadInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleQuickUpload(file);
                            e.target.value = '';
                          }}
                        />
                      </div>

                      {visible.map(up => {
                        const isSelected = selectedProductIds.has(up.id);
                        const isDisabled = !isSelected && selectedProductIds.size >= MAX_PRODUCTS;
                        return (
                          <div key={up.id} role="button" tabIndex={0} onClick={() => {
                             if (isDisabled) return;
                             const s = new Set(selectedProductIds);
                             if (s.has(up.id)) s.delete(up.id); else if (s.size < MAX_PRODUCTS) s.add(up.id);
                             setSelectedProductIds(s);
                           }} onKeyDown={(e) => {
                             if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (isDisabled) return; const s = new Set(selectedProductIds); if (s.has(up.id)) s.delete(up.id); else if (s.size < MAX_PRODUCTS) s.add(up.id); setSelectedProductIds(s); }
                           }} className={cn(
                             'group relative flex flex-col rounded-lg overflow-hidden border-2 transition-all text-left cursor-pointer',
                             isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-border',
                             isDisabled && 'opacity-40 cursor-not-allowed'
                           )}>
                            <div className={cn(
                              'absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                              isSelected ? 'border-primary bg-primary text-primary-foreground shadow-md' : 'border-background/80 bg-background/60 opacity-0 group-hover:opacity-100'
                            )}>
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                            <ShimmerImage src={getOptimizedUrl(up.image_url, { quality: 60 })} alt={up.title} className="w-full aspect-square object-cover rounded-t-md" />
                            <div className="h-[44px] px-1.5 py-1 bg-card flex flex-col justify-center">
                              <p className="text-[10px] font-medium text-foreground leading-tight line-clamp-1">{up.title}</p>
                              <p className="text-[9px] text-muted-foreground truncate mt-0.5">{up.product_type || '\u00A0'}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {loadMoreSentinel}
                  </>
                );
              })()
              )}
            </div>
            <AddProductModal
              open={addProductOpen}
              onOpenChange={(o) => { setAddProductOpen(o); if (!o) setAddProductCompact(true); }}
              onProductAdded={() => queryClient.invalidateQueries({ queryKey: ['user-products'] })}
              compact={addProductCompact}
              initialTab={addProductTab}
              onSwitchMethod={() => setAddProductCompact(false)}
            />
          </>
        )}

        {step >= 2 && step <= 6 && (
          <>
            {step === 2 && discoverSceneFull && (
              <DiscoverPreselectedCard
                scene={discoverSceneFull}
                selectedSceneIds={selectedSceneIds}
                onSelectionChange={setSelectedSceneIds}
              />
            )}
          <Suspense fallback={<div className="space-y-4 py-8"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}</div></div>}>
            {step === 2 && (() => {
              const needsAnalysis = selectedProducts.some(p => pendingIds.has(p.id) && !analyses[p.id] && !(p as any).analysis_json);
              if (isAnalyzing && needsAnalysis) {
                return (
                  <div className="space-y-4 py-8 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                        {selectedProducts.map(p => {
                          const done = !!analyses[p.id] && !pendingIds.has(p.id);
                          return (
                            <div key={p.id} className="relative w-10 h-10 rounded-lg bg-muted/30 border border-border/40 overflow-hidden flex-shrink-0">
                              {p.image_url && (
                                <img src={p.image_url} alt="" className={`w-full h-full object-cover transition-opacity ${done ? 'opacity-100' : 'opacity-50'}`} />
                              )}
                              {done ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                                  <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                                </div>
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div>
                        {(() => {
                          const doneCount = selectedProducts.filter(p => !!analyses[p.id] && !pendingIds.has(p.id)).length;
                          const total = selectedProducts.length;
                          return (
                            <>
                              <p className="text-sm font-medium">
                                {total === 1 ? 'Analyzing your product…' : `Analyzing your products… ${doneCount}/${total}`}
                              </p>
                              <p className="text-xs text-muted-foreground">Finding the best scenes for {total === 1 ? 'your product category' : 'each product category'}</p>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
                    </div>
                  </div>
                );
              }
              return (
              <ProductImagesStep2Scenes
                selectedSceneIds={selectedSceneIds}
                onSelectionChange={setSelectedSceneIds}
                selectedProducts={selectedProducts}
                productAnalyses={analyses}
                perCategoryScenes={perCategoryScenes}
                onPerCategoryScenesChange={setPerCategoryScenes}
                categoryGroups={categoryGroups}
                hasMultipleCategories={hasMultipleCategories}
                forcedActiveCategoryId={forcedActiveCategoryId}
                onForcedActiveCategoryIdConsumed={() => setForcedActiveCategoryId(null)}
                discoverScene={discoverScene}
                discoverSceneFull={discoverSceneFull}
              />);
            })()}


            {step === 3 && (
              <div>
                {showLastSettingsBanner && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/[0.03] mb-4">
                    <History className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground flex-1">Load your last settings for <span className="font-medium text-foreground">{lastSettingsCategory}</span>?</span>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowLastSettingsBanner(false)}>Dismiss</Button>
                    <Button size="sm" className="h-7 text-xs" onClick={loadLastSettings}>Apply</Button>
                  </div>
                )}
                <ProductImagesStep3Refine
                  selectedSceneIds={selectedSceneIds}
                  productCount={selectedProducts.length}
                  details={details}
                  onDetailsChange={setDetails}
                  userModels={userModelProfiles}
                  globalModels={globalModelProfiles}
                  selectedScenes={selectedScenes}
                  allProducts={userProducts}
                  selectedProductIds={selectedProductIds}
                  hasMultipleCategories={hasMultipleCategories}
                  primaryCategory={primaryCategory}
                  sceneExtraRefs={sceneExtraRefs}
                  onSceneExtraRefsChange={setSceneExtraRefs}
                  analyses={analyses}
                />
              </div>
            )}

            {step === 4 && (
              <ProductImagesStep4Review
                selectedProducts={selectedProducts}
                selectedSceneIds={selectedSceneIds}
                details={details}
                balance={balance}
                onEditStep={(s) => setStep(s as PIStep)}
                onDetailsChange={setDetails}
                allProducts={userProducts}
                selectedProductIds={selectedProductIds}
                perCategoryScenes={perCategoryScenes}
                categoryGroups={categoryGroups}
              />
            )}

            {step === 5 && (
              <ProductImagesStep5Generating
                totalJobs={jobMap.size}
                completedJobs={completedJobs}
                productCount={selectedProducts.length}
                products={selectedProducts}
                jobMap={jobMap}
                completedJobIds={completedJobIds}
                failedJobIds={failedJobIds}
                enqueuedJobs={enqueuedCount}
                expectedJobCount={expectedJobCount}
                onViewResults={() => {
                  if (pollingRef.current) clearTimeout(pollingRef.current);
                  // Fetch final state and transition
                  const jobIds = Array.from(jobMap.values());
                  supabase.from('generation_queue').select('id, status, result, payload').in('id', jobIds).then(({ data }) => {
                    const productMap = new Map<string, { productId: string; sceneName: string; sceneId?: string }>();
                    for (const [key, jobId] of jobMap.entries()) {
                      const parts = key.split('_');
                      const sceneId = parts[1] || '';
                      const scene = selectedScenes.find(s => s.id === sceneId);
                      productMap.set(jobId, { productId: parts[0], sceneName: scene?.title || 'Scene', sceneId: sceneId || undefined });
                    }
                    // Enrich scene names from payload
                    for (const j of data || []) {
                      const existing = productMap.get(j.id);
                      if (existing && existing.sceneName === 'Scene' && j.payload) {
                        const payloadSceneName = (j.payload as Record<string, unknown>)?.scene_name as string | undefined;
                        if (payloadSceneName) productMap.set(j.id, { ...existing, sceneName: payloadSceneName });
                      }
                    }
                    finishWithResults(data || [], productMap);
                  });
                }}
              />
            )}

            {step === 6 && (
              <ProductImagesStep6Results
                results={results}
                onGenerateMore={() => { resetGenerationState(); setStep(2); }}
                onStartNew={() => {
                  resetGenerationState();
                  setSelectedProductIds(new Set());
                  setSelectedSceneIds(new Set());
                  setPerCategoryScenes(new Map());
                  setSceneExtraRefs({});
                  setDetails(INITIAL_DETAILS);
                  setStep(1);
                }}
                onGoToLibrary={() => navigate('/app/library')}
              />
            )}
          </Suspense>
        )}
      </div>

      {/* Sticky bottom bar for Steps 1-4 */}
      {step >= 1 && step <= 4 && !(step === 1 && selectedProducts.length === 0) && (
        <ProductImagesStickyBar
          step={step}
          productCount={selectedProducts.length}
          sceneCount={selectedScenes.length}
          totalImages={totalImages}
          totalCredits={totalCredits}
          balance={balance}
          canProceed={canProceed}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      <DemoProductPicker
        open={demoPickerOpen}
        onOpenChange={setDemoPickerOpen}
        onSelectDemo={handleDemoSelect}
      />
      <NoCreditsModal
        open={noCreditsModalOpen}
        onClose={() => setNoCreditsModalOpen(false)}
        category="fallback"
      />
    </div>
  );
}
