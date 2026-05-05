import { useState, useEffect, useMemo } from 'react';
import { X, Globe, Tag, Sparkles, AlertTriangle, ChevronDown, LayoutGrid } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/brandedToast';
import { mockModels, mockTryOnPoses, poseCategoryLabels } from '@/data/mockData';
import { useDiscoverPickerOptions, type PickerSceneOption, type PickerModelOption, type PickerWorkflowOption } from '@/hooks/useDiscoverPickerOptions';
import { SceneBrowserModal } from '@/components/app/SceneBrowserModal';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import {
  getDiscoverFamilies,
  getDiscoverSubtypes,
  isMultiSubFamily,
  DISCOVER_FAMILY_IDS,
  familyIdForSubtype,
} from '@/lib/discoverTaxonomy';

const FAMILIES = getDiscoverFamilies();

// Map product_type tokens (from analyze-product-category) → product_image_scenes.category_collection.
// Used to disambiguate scene title collisions when scene_id is missing on legacy generation_jobs rows.
const PRODUCT_TYPE_TO_COLLECTION: Record<string, string> = {
  // Wallets / cardholders
  wallet: 'wallets-cardholders',
  cardholder: 'wallets-cardholders',
  'card-holder': 'wallets-cardholders',
  purse: 'wallets-cardholders',
  // Bags & accessories
  bag: 'bags-accessories',
  handbag: 'bags-accessories',
  tote: 'bags-accessories',
  clutch: 'bags-accessories',
  crossbody: 'bags-accessories',
  backpack: 'backpacks',
  // Footwear
  shoe: 'shoes',
  shoes: 'shoes',
  sneaker: 'sneakers',
  sneakers: 'sneakers',
  boot: 'boots',
  boots: 'boots',
  heel: 'high-heels',
  heels: 'high-heels',
  'high-heels': 'high-heels',
  // Apparel
  garment: 'garments',
  clothing: 'garments',
  apparel: 'garments',
  dress: 'dresses',
  hoodie: 'hoodies',
  jeans: 'jeans',
  jacket: 'jackets',
  activewear: 'activewear',
  swimwear: 'swimwear',
  lingerie: 'lingerie',
  kidswear: 'kidswear',
  streetwear: 'streetwear',
  // Accessories
  belt: 'belts',
  scarf: 'scarves',
  hat: 'hats',
  cap: 'caps',
  beanie: 'beanies',
  // Jewellery
  necklace: 'jewellery-necklaces',
  earring: 'jewellery-earrings',
  earrings: 'jewellery-earrings',
  bracelet: 'jewellery-bracelets',
  ring: 'jewellery-rings',
  watch: 'watches',
  eyewear: 'eyewear',
  sunglasses: 'eyewear',
  glasses: 'eyewear',
  // Beauty
  fragrance: 'fragrance',
  perfume: 'fragrance',
  cologne: 'fragrance',
  beauty: 'beauty-skincare',
  skincare: 'beauty-skincare',
  makeup: 'makeup-lipsticks',
  lipstick: 'makeup-lipsticks',
  // Home / tech / consumables
  furniture: 'furniture',
  'home-decor': 'home-decor',
  decor: 'home-decor',
  tech: 'tech-devices',
  device: 'tech-devices',
  electronics: 'tech-devices',
  food: 'food',
  snack: 'food',
  beverage: 'beverages',
  drink: 'beverages',
  supplement: 'supplements-wellness',
  wellness: 'supplements-wellness',
};

function normalizeProductTypeToken(productType?: string | null): string | null {
  if (!productType) return null;
  const t = productType.toLowerCase().trim();
  if (PRODUCT_TYPE_TO_COLLECTION[t]) return PRODUCT_TYPE_TO_COLLECTION[t];
  // Try matching individual words / partial tokens
  for (const key of Object.keys(PRODUCT_TYPE_TO_COLLECTION)) {
    if (t.includes(key)) return PRODUCT_TYPE_TO_COLLECTION[key];
  }
  return null;
}

/** Resolve the most-likely scene_id for a given title + product type by querying product_image_scenes. */
async function resolveSceneRefByTitleAndCategory(
  sceneTitle: string,
  productType?: string | null,
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('product_image_scenes' as any)
      .select('scene_id, category_collection')
      .eq('title', sceneTitle)
      .eq('is_active', true);
    if (error || !data || (data as any[]).length === 0) return null;
    const rows = (data as unknown) as Array<{ scene_id: string; category_collection: string | null }>;
    if (rows.length === 1) return rows[0].scene_id;

    const targetCollection = normalizeProductTypeToken(productType);
    if (targetCollection) {
      const match = rows.find(r => r.category_collection === targetCollection);
      if (match) return match.scene_id;
    }

    // Fallback: stable default — pick the lowest-numbered variant
    // (e.g. "botanical-oasis" before "botanical-oasis-10").
    const sorted = [...rows].sort((a, b) => {
      const numA = parseInt(a.scene_id.match(/-(\d+)$/)?.[1] ?? '0', 10);
      const numB = parseInt(b.scene_id.match(/-(\d+)$/)?.[1] ?? '0', 10);
      return numA - numB;
    });
    return sorted[0].scene_id;
  } catch (err) {
    console.warn('resolveSceneRefByTitleAndCategory failed', err);
    return null;
  }
}

interface AddToDiscoverModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  prompt: string;
  aspectRatio?: string;
  quality?: string;
  workflowSlug?: string;
  workflowName?: string;
  sceneName?: string;
  modelName?: string;
  sceneImageUrl?: string;
  modelImageUrl?: string;
  productName?: string;
  productImageUrl?: string;
  modelId?: string | null;
  sceneId?: string | null;
  sourceGenerationId?: string;
}

export function AddToDiscoverModal({
  open,
  onClose,
  imageUrl,
  prompt,
  aspectRatio = '1:1',
  quality = 'standard',
  workflowSlug,
  workflowName,
  sceneName,
  modelName,
  sceneImageUrl,
  modelImageUrl,
  productName,
  productImageUrl,
  modelId,
  sceneId,
  sourceGenerationId,
}: AddToDiscoverModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(FAMILIES[0]?.id ?? 'fashion');
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [showProduct, setShowProduct] = useState(false);

  // Picker state — preselected from props on open
  const [pickedSceneName, setPickedSceneName] = useState<string | null>(null);
  const [pickedModelName, setPickedModelName] = useState<string | null>(null);
  const [pickedWorkflowSlug, setPickedWorkflowSlug] = useState<string | null>(null);
  const [aiSuggestedScene, setAiSuggestedScene] = useState<string | null>(null);
  const [resolvedSceneRef, setResolvedSceneRef] = useState<string | null>(null);
  const [scenePopoverOpen, setScenePopoverOpen] = useState(false);
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
  const [workflowPopoverOpen, setWorkflowPopoverOpen] = useState(false);
  const [sceneSearch, setSceneSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [sceneBrowserOpen, setSceneBrowserOpen] = useState(false);

  const queryClient = useQueryClient();

  const { scenes: allScenes, scenesForWorkflow, productImageScenes, models: allModels, workflows: allWorkflows } =
    useDiscoverPickerOptions(open);

  // Workflow-aware scene library: product-images → product_image_scenes (writes scene_ref);
  // anything else → custom_scenes (legacy scene_name only).
  const workflowScenes = useMemo(
    () => scenesForWorkflow(pickedWorkflowSlug),
    [scenesForWorkflow, pickedWorkflowSlug],
  );
  const workflowScenesByCategory = useMemo(() => {
    const groups: Record<string, PickerSceneOption[]> = {};
    workflowScenes.forEach(s => {
      const key = s.category || 'other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return groups;
  }, [workflowScenes]);

  // Match against the workflow-specific library first; fall back to combined list
  // so a previously-picked scene from a different workflow is still resolvable
  // for display before being cleared on workflow switch.
  const pickedScene = useMemo<PickerSceneOption | null>(
    () =>
      workflowScenes.find(s => s.name === pickedSceneName) ??
      allScenes.find(s => s.name === pickedSceneName) ??
      null,
    [workflowScenes, allScenes, pickedSceneName]
  );
  const pickedModel = useMemo<PickerModelOption | null>(
    () => allModels.find(m => m.name === pickedModelName) ?? null,
    [allModels, pickedModelName]
  );
  const pickedWorkflow = useMemo<PickerWorkflowOption | null>(
    () => allWorkflows.find(w => w.slug === pickedWorkflowSlug) ?? null,
    [allWorkflows, pickedWorkflowSlug]
  );

  const sceneIsMissing = !pickedSceneName;

  const subtypeOptions = getDiscoverSubtypes(category);
  const showSubRow = isMultiSubFamily(category);

  // When the family changes, reset / auto-pick the sub-type.
  useEffect(() => {
    if (!showSubRow) {
      setSubcategory(subtypeOptions[0]?.slug ?? null);
    } else if (subcategory && !subtypeOptions.some((s) => s.slug === subcategory)) {
      setSubcategory(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  // When workflow changes, drop a previously-picked scene that doesn't exist
  // in the new workflow's library (product-images vs custom_scenes are disjoint).
  useEffect(() => {
    if (!pickedSceneName) return;
    const stillValid = workflowScenes.some(s => s.name === pickedSceneName);
    if (!stillValid) {
      setPickedSceneName(null);
      setAiSuggestedScene(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedWorkflowSlug]);

  // Resolve initial scene name from props (sceneName direct OR via sceneId on mocks
  // OR via sceneId matching a product_image_scenes row's scene_ref).
  const initialSceneName = useMemo(() => {
    if (sceneName) return sceneName;
    if (sceneId && !sceneId.startsWith('custom-')) {
      const mock = mockTryOnPoses.find(p => p.poseId === sceneId);
      if (mock) return mock.name;
      const pis = productImageScenes.find(s => s.sceneRef === sceneId);
      if (pis) return pis.name;
    }
    return null;
  }, [sceneName, sceneId, productImageScenes]);

  const initialModelName = useMemo(() => {
    if (modelName) return modelName;
    if (modelId && !modelId.startsWith('custom-')) {
      const mock = mockModels.find(m => m.modelId === modelId);
      if (mock) return mock.name;
    }
    return null;
  }, [modelName, modelId]);

  // Reset & auto-fill when modal opens
  useEffect(() => {
    if (!open) return;
    setTitle('');
    setCategory(FAMILIES[0]?.id ?? 'fashion');
    setSubcategory(null);
    setTags([]);
    setTagInput('');
    setShowProduct(false);
    setPickedSceneName(initialSceneName);
    setPickedModelName(initialModelName);
    setPickedWorkflowSlug(workflowSlug ?? null);
    setAiSuggestedScene(null);
    setResolvedSceneRef(null);

    // Seed resolvedSceneRef from the prop sceneId if it's a real product_image_scenes ref.
    if (sceneId && !sceneId.startsWith('custom-') && !mockTryOnPoses.find(p => p.poseId === sceneId)) {
      setResolvedSceneRef(sceneId);
    }

    let cancelled = false;

    (async () => {
      // ── DB fallback: if scene/model is missing in props but we have a source
      // generation ID, look it up directly. Used for deterministic scene resolution only;
      // category/title/tags are left blank for the user to fill in manually.
      let resolvedSceneName = initialSceneName;
      let resolvedWorkflowSlug = workflowSlug ?? null;

      let resolvedProductType: string | null = null;
      let resolvedSceneIdFromJob: string | null = null;

      if (sourceGenerationId) {
        try {
          const { data } = await supabase
            .from('generation_jobs')
            .select('scene_name, scene_id, scene_image_url, model_name, model_image_url, workflow_slug, user_products(product_type)')
            .eq('id', sourceGenerationId)
            .maybeSingle();
          if (!cancelled && data) {
            if (!resolvedSceneName && data.scene_name) {
              resolvedSceneName = data.scene_name;
              setPickedSceneName(data.scene_name);
            }
            if (!initialModelName && data.model_name) {
              setPickedModelName(data.model_name);
            }
            if (!resolvedWorkflowSlug && data.workflow_slug) {
              resolvedWorkflowSlug = data.workflow_slug;
              setPickedWorkflowSlug(data.workflow_slug);
            }
            if ((data as any).scene_id) {
              resolvedSceneIdFromJob = (data as any).scene_id;
              setResolvedSceneRef((data as any).scene_id);
            }
            const up = (data as any).user_products;
            const pt = Array.isArray(up) ? up[0]?.product_type : up?.product_type;
            if (pt) resolvedProductType = pt;
          }
        } catch (err) {
          console.warn('AddToDiscover: generation_jobs lookup failed', err);
        }
        if (cancelled) return;
      }

      // Title + category resolver — for legacy product-images jobs where scene_id is null
      // but scene_name exists. Disambiguates collisions by product category.
      const isProductImagesFlow = (resolvedWorkflowSlug === 'product-images');
      if (isProductImagesFlow && resolvedSceneName && !resolvedSceneIdFromJob && !resolvedSceneRef) {
        const ref = await resolveSceneRefByTitleAndCategory(resolvedSceneName, resolvedProductType);
        if (!cancelled && ref) {
          setResolvedSceneRef(ref);
        }
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, imageUrl, prompt]);

  if (!open) return null;

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && tags.length < 5 && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) return;
    setPublishing(true);

    // Resolve scene image URL: prefer picker thumbnail, then fall back to prop / DB lookup
    let resolvedSceneImageUrl: string | null = pickedScene?.imageUrl || null;
    if (pickedSceneName && !resolvedSceneImageUrl) {
      // Fall back to original prop or DB lookup
      resolvedSceneImageUrl = sceneImageUrl || null;
      if (!resolvedSceneImageUrl) {
        try {
          const { data: customScenes } = await supabase.rpc('get_public_custom_scenes');
          const match = (customScenes as any[] ?? []).find((s: any) => s.name === pickedSceneName);
          if (match) resolvedSceneImageUrl = match.image_url;
        } catch {}
      }
    }

    // Resolve model image URL: prefer picker thumbnail, then fall back to prop / DB lookup
    let resolvedModelImageUrl: string | null = pickedModel?.imageUrl || null;
    if (pickedModelName && !resolvedModelImageUrl) {
      resolvedModelImageUrl = modelImageUrl || null;
      if (!resolvedModelImageUrl) {
        try {
          const { data } = await supabase
            .from('custom_models' as any)
            .select('image_url')
            .eq('name', pickedModelName)
            .limit(1)
            .single();
          if (data) resolvedModelImageUrl = (data as any).image_url;
        } catch {}
      }
    }

    // Generate secure product preview if product toggle is on
    let safeProductImageUrl: string | null = null;
    let safeProductName: string | null = null;
    if (showProduct && productName) {
      safeProductName = productName;
      if (productImageUrl) {
        try {
          const { data: previewData, error: previewErr } = await supabase.functions.invoke('generate-discover-preview', {
            body: { sourceUrl: productImageUrl, postId: crypto.randomUUID().slice(0, 12) },
          });
          if (!previewErr && previewData?.publicUrl) {
            safeProductImageUrl = previewData.publicUrl;
          }
        } catch {
          console.warn('Product preview generation failed, publishing without image');
        }
      }
    }

    // For product-images workflow, persist the picked scene's `scene_ref`
    // so the wizard can resolve it deterministically. Prefer the authoritative
    // scene_id passed in from the source generation (exact ref the wizard used);
    // fall back to the picker's scene_ref (matched by title — may collide).
    const propSceneRef =
      sceneId && !sceneId.startsWith('custom-') && !mockTryOnPoses.find(p => p.poseId === sceneId)
        ? sceneId
        : null;
    const authoritativeSceneRef = propSceneRef ?? resolvedSceneRef;
    const sceneRefToWrite =
      pickedWorkflow?.slug === 'product-images'
        ? (authoritativeSceneRef ?? pickedScene?.sceneRef ?? null)
        : null;

    const presetData = {
      title: title.trim(),
      prompt,
      image_url: imageUrl,
      category,
      subcategory: subcategory ?? null,
      tags,
      aspect_ratio: aspectRatio,
      quality,
      sort_order: 0,
      is_featured: false,
      workflow_slug: pickedWorkflow?.slug ?? null,
      workflow_name: pickedWorkflow?.name ?? workflowName ?? null,
      scene_name: pickedSceneName,
      scene_ref: sceneRefToWrite,
      model_name: pickedModelName,
      scene_image_url: pickedSceneName ? resolvedSceneImageUrl : null,
      model_image_url: pickedModelName ? resolvedModelImageUrl : null,
      product_name: safeProductName,
      product_image_url: safeProductImageUrl,
    } as any;

    // Check for existing preset with same image_url that's missing metadata — update instead of duplicate
    let error: any = null;
    const { data: existing } = await supabase
      .from('discover_presets' as any)
      .select('id, model_name, scene_name')
      .eq('image_url', imageUrl)
      .limit(1)
      .maybeSingle();

    if (existing && (!(existing as any).model_name || !(existing as any).scene_name)) {
      const { error: updateErr } = await supabase
        .from('discover_presets' as any)
        .update(presetData)
        .eq('id', (existing as any).id);
      error = updateErr;
    } else {
      const { error: insertErr } = await supabase.from('discover_presets').insert(presetData);
      error = insertErr;
    }

    if (error) {
      toast.error('Failed to publish to Discover');
    } else {
      toast.success('Published to Discover');
      queryClient.invalidateQueries({ queryKey: ['discover-presets'] });
      onClose();
    }
    setPublishing(false);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-background rounded-2xl border border-border/50 shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border/30 shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">Add to Discover</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body — two columns on md+, single column on mobile */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* LEFT — Preview + Title + Tags */}
            <div className="space-y-4">
              <img
                src={getOptimizedUrl(imageUrl, { quality: 70 })}
                alt="Preview"
                loading="lazy"
                className="w-full max-h-72 object-cover rounded-xl border border-border/30"
              />

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Title *</label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value.slice(0, 60))}
                  placeholder="Give it a title..."
                />
                <p className="text-[10px] text-muted-foreground/50 text-right">{title.length}/60</p>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tags (optional)</label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Add a tag..."
                    className="rounded-xl h-10 flex-1"
                    disabled={tags.length >= 5}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim() || tags.length >= 5}
                    className="rounded-xl h-10 px-3"
                  >
                    <Tag className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                      >
                        #{tag}
                        <button onClick={() => handleRemoveTag(tag)} className="hover:text-primary/70">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground/50">{tags.length}/5 tags</p>
              </div>
            </div>

            {/* RIGHT — Category + Generation Context */}
            <div className="space-y-4">
              {/* Category — family + sub-type */}
              <div className="space-y-2.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {FAMILIES.map((fam) => (
                    <button
                      key={fam.id}
                      onClick={() => setCategory(fam.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                        category === fam.id
                          ? 'bg-foreground text-background'
                          : 'bg-muted/40 text-muted-foreground hover:bg-muted/70',
                      )}
                    >
                      {fam.label}
                    </button>
                  ))}
                </div>

                {showSubRow && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {subtypeOptions.map((s) => (
                      <button
                        key={s.slug}
                        onClick={() => setSubcategory(subcategory === s.slug ? null : s.slug)}
                        className={cn(
                          'px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 border',
                          subcategory === s.slug
                            ? 'bg-primary/15 text-primary border-primary/30'
                            : 'bg-transparent text-muted-foreground/80 border-border/40 hover:bg-muted/40 hover:text-foreground',
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Generation Context — admin can edit any field */}
              <div className="space-y-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">Generation Context</p>
                  <p className="text-[10px] text-muted-foreground/50">Confirm or edit</p>
                </div>

                {/* Workflow picker */}
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground/80">Workflow</label>
                  <Popover open={workflowPopoverOpen} onOpenChange={setWorkflowPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border/50 bg-background hover:bg-muted/40 transition-colors text-xs">
                        <span className={cn('truncate', !pickedWorkflow && 'text-muted-foreground/60')}>
                          {pickedWorkflow?.name ?? '— No workflow —'}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/60 ml-2 shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="z-[320] w-[var(--radix-popover-trigger-width)] p-1 max-h-64 overflow-auto" align="start">
                      <button
                        onClick={() => { setPickedWorkflowSlug(null); setWorkflowPopoverOpen(false); }}
                        className="w-full text-left px-2.5 py-1.5 rounded-md text-xs hover:bg-muted text-muted-foreground"
                      >
                        — No workflow —
                      </button>
                      {allWorkflows.map(w => (
                        <button
                          key={w.slug}
                          onClick={() => { setPickedWorkflowSlug(w.slug); setWorkflowPopoverOpen(false); }}
                          className={cn(
                            'w-full text-left px-2.5 py-1.5 rounded-md text-xs hover:bg-muted',
                            pickedWorkflowSlug === w.slug && 'bg-muted font-medium'
                          )}
                        >
                          {w.name}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Scene picker — library swaps based on selected workflow */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-muted-foreground/80">
                      Scene
                      <span className="ml-1.5 text-[9px] text-muted-foreground/50 font-normal">
                        ({pickedWorkflowSlug === 'product-images' ? 'product-images library' : 'custom scenes library'})
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setSceneBrowserOpen(true)}
                      className="inline-flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      <LayoutGrid className="w-2.5 h-2.5" />
                      Browse all
                    </button>
                  </div>
                  {/* If no scene at all, the trigger opens the Browser modal directly. */}
                  {!pickedSceneName && !aiSuggestedScene ? (
                    <button
                      type="button"
                      onClick={() => setSceneBrowserOpen(true)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border/50 bg-background hover:bg-muted/40 transition-colors text-xs"
                    >
                      <span className="truncate text-muted-foreground/60">— Browse scenes by category —</span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/60 ml-2 shrink-0" />
                    </button>
                  ) : (
                    <Popover open={scenePopoverOpen} onOpenChange={(o) => { setScenePopoverOpen(o); if (!o) setSceneSearch(''); }}>
                      <PopoverTrigger asChild>
                        <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border/50 bg-background hover:bg-muted/40 transition-colors text-xs">
                          <span className={cn('truncate flex items-center gap-2', !pickedScene && 'text-muted-foreground/60')}>
                            {pickedScene?.imageUrl && (
                              <img src={getOptimizedUrl(pickedScene.imageUrl, { quality: 40 })} alt="" loading="lazy" className="w-5 h-5 rounded object-cover shrink-0" />
                            )}
                            <span className="truncate">{pickedSceneName ?? '— No scene —'}</span>
                            {aiSuggestedScene && pickedSceneName === aiSuggestedScene && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-medium shrink-0">AI</span>
                            )}
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/60 ml-2 shrink-0" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="z-[320] w-[var(--radix-popover-trigger-width)] p-2 max-h-80 overflow-auto" align="start">
                        <Input
                          autoFocus
                          placeholder="Search scenes..."
                          value={sceneSearch}
                          onChange={e => setSceneSearch(e.target.value)}
                          className="h-8 text-xs mb-2"
                        />
                        <button
                          onClick={() => { setScenePopoverOpen(false); setSceneBrowserOpen(true); }}
                          className="w-full flex items-center gap-1.5 text-left px-2 py-1.5 rounded-md text-xs hover:bg-muted text-primary font-medium"
                        >
                          <LayoutGrid className="w-3 h-3" />
                          Browse all scenes by category
                        </button>
                        <button
                          onClick={() => { setPickedSceneName(null); setScenePopoverOpen(false); }}
                          className="w-full text-left px-2 py-1.5 rounded-md text-xs hover:bg-muted text-muted-foreground"
                        >
                          — No scene —
                        </button>
                        {Object.entries(workflowScenesByCategory).map(([cat, list]) => {
                          const filtered = sceneSearch
                            ? list.filter(s => s.name.toLowerCase().includes(sceneSearch.toLowerCase()))
                            : list;
                          if (filtered.length === 0) return null;
                          return (
                            <div key={cat} className="mt-2">
                              <p className="text-[9px] uppercase tracking-wider text-muted-foreground/50 px-2 py-1">
                                {poseCategoryLabels[cat] ?? cat}
                              </p>
                              {filtered.map(s => (
                                <button
                                  key={`${s.name}::${s.category}::${s.subCategory ?? ''}`}
                                  onClick={() => { setPickedSceneName(s.name); setScenePopoverOpen(false); }}
                                  className={cn(
                                    'w-full flex items-center gap-2 text-left px-2 py-1.5 rounded-md text-xs hover:bg-muted',
                                    pickedSceneName === s.name && 'bg-muted font-medium'
                                  )}
                                >
                                  {s.imageUrl && (
                                    <img src={getOptimizedUrl(s.imageUrl, { quality: 40 })} alt="" loading="lazy" className="w-6 h-6 rounded object-cover shrink-0" />
                                  )}
                                  <span className="truncate">{s.name}</span>
                                  {s.subCategory && (
                                    <span className="ml-auto text-[9px] text-muted-foreground/50 shrink-0">{s.subCategory}</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          );
                        })}
                      </PopoverContent>
                    </Popover>
                  )}
                  {sceneIsMissing && (
                    <div className="mt-1 px-1 space-y-1.5">
                      <div className="flex items-start gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-destructive shrink-0 mt-0.5" />
                        <p className="text-[10px] text-destructive leading-tight">
                          No scene detected. Pick one so Recreate works.
                        </p>
                      </div>
                      {aiSuggestedScene && (
                        <button
                          type="button"
                          onClick={() => setPickedSceneName(aiSuggestedScene)}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-medium transition-colors"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          Apply AI suggestion: "{aiSuggestedScene}"
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Model picker */}
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground/80">Model</label>
                  <Popover open={modelPopoverOpen} onOpenChange={(o) => { setModelPopoverOpen(o); if (!o) setModelSearch(''); }}>
                    <PopoverTrigger asChild>
                      <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border/50 bg-background hover:bg-muted/40 transition-colors text-xs">
                        <span className={cn('truncate flex items-center gap-2', !pickedModel && 'text-muted-foreground/60')}>
                          {pickedModel?.imageUrl && (
                            <img src={getOptimizedUrl(pickedModel.imageUrl, { quality: 40 })} alt="" loading="lazy" className="w-5 h-5 rounded-full object-cover shrink-0" />
                          )}
                          <span className="truncate">{pickedModelName ?? '— No model —'}</span>
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/60 ml-2 shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="z-[320] w-[var(--radix-popover-trigger-width)] p-2 max-h-72 overflow-auto" align="start">
                      <Input
                        autoFocus
                        placeholder="Search models..."
                        value={modelSearch}
                        onChange={e => setModelSearch(e.target.value)}
                        className="h-8 text-xs mb-2"
                      />
                      <button
                        onClick={() => { setPickedModelName(null); setModelPopoverOpen(false); }}
                        className="w-full text-left px-2 py-1.5 rounded-md text-xs hover:bg-muted text-muted-foreground"
                      >
                        — No model —
                      </button>
                      {allModels
                        .filter(m => !modelSearch || m.name.toLowerCase().includes(modelSearch.toLowerCase()))
                        .map(m => (
                          <button
                            key={m.name}
                            onClick={() => { setPickedModelName(m.name); setModelPopoverOpen(false); }}
                            className={cn(
                              'w-full flex items-center gap-2 text-left px-2 py-1.5 rounded-md text-xs hover:bg-muted',
                              pickedModelName === m.name && 'bg-muted font-medium'
                            )}
                          >
                            {m.imageUrl && (
                              <img src={getOptimizedUrl(m.imageUrl, { quality: 40 })} alt="" loading="lazy" className="w-6 h-6 rounded-full object-cover shrink-0" />
                            )}
                            <span className="truncate">{m.name}</span>
                          </button>
                        ))}
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Product toggle (existing behaviour) */}
                {productName && (
                  <div className="flex items-center justify-between pt-1 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      {productImageUrl && (
                        <img src={getOptimizedUrl(productImageUrl, { quality: 40 })} alt="" loading="lazy" className="w-6 h-6 rounded object-cover" />
                      )}
                      <span className="text-xs text-foreground/80 truncate">Show product: {productName}</span>
                    </div>
                    <Switch checked={showProduct} onCheckedChange={setShowProduct} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky footer — Publish */}
        <div className="border-t border-border/30 px-6 py-4 shrink-0 bg-background">
          <Button
            onClick={handlePublish}
            disabled={!title.trim() || publishing}
            className="w-full font-medium"
          >
            <Globe className="w-4 h-4 mr-2" />
            {publishing ? 'Publishing...' : 'Publish to Discover'}
          </Button>
          <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
            This will appear immediately in the Discover feed
          </p>
        </div>
      </div>

      {/* Scene browser modal — opens above this modal */}
      <SceneBrowserModal
        open={sceneBrowserOpen}
        onClose={() => setSceneBrowserOpen(false)}
        scenes={workflowScenes}
        value={pickedSceneName}
        onSelect={(s) => { setPickedSceneName(s.name); setSceneBrowserOpen(false); }}
      />
    </div>
  );
}

