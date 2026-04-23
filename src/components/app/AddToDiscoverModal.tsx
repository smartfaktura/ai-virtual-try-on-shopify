import { useState, useEffect, useMemo } from 'react';
import { X, Globe, Tag, Sparkles, AlertTriangle, ChevronDown } from 'lucide-react';
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
import {
  getDiscoverFamilies,
  getDiscoverSubtypes,
  isMultiSubFamily,
  DISCOVER_FAMILY_IDS,
  familyIdForSubtype,
} from '@/lib/discoverTaxonomy';

const FAMILIES = getDiscoverFamilies();

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
  const [aiLoading, setAiLoading] = useState(false);
  const [showProduct, setShowProduct] = useState(false);

  // Picker state — preselected from props on open
  const [pickedSceneName, setPickedSceneName] = useState<string | null>(null);
  const [pickedModelName, setPickedModelName] = useState<string | null>(null);
  const [pickedWorkflowSlug, setPickedWorkflowSlug] = useState<string | null>(null);
  const [aiSuggestedScene, setAiSuggestedScene] = useState<string | null>(null);
  const [scenePopoverOpen, setScenePopoverOpen] = useState(false);
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
  const [workflowPopoverOpen, setWorkflowPopoverOpen] = useState(false);
  const [sceneSearch, setSceneSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');

  const queryClient = useQueryClient();

  const { scenes: allScenes, scenesByCategory, models: allModels, workflows: allWorkflows } =
    useDiscoverPickerOptions(open);

  const pickedScene = useMemo<PickerSceneOption | null>(
    () => allScenes.find(s => s.name === pickedSceneName) ?? null,
    [allScenes, pickedSceneName]
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

  // Resolve initial scene name from props (sceneName direct OR via sceneId on mocks)
  const initialSceneName = useMemo(() => {
    if (sceneName) return sceneName;
    if (sceneId && !sceneId.startsWith('custom-')) {
      const mock = mockTryOnPoses.find(p => p.poseId === sceneId);
      if (mock) return mock.name;
    }
    return null;
  }, [sceneName, sceneId]);

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
    setAiLoading(true);
    setShowProduct(false);
    setPickedSceneName(initialSceneName);
    setPickedModelName(initialModelName);
    setPickedWorkflowSlug(workflowSlug ?? null);
    setAiSuggestedScene(null);

    // If scene is missing, ask AI to suggest one from the full scene list
    const sceneOptions = !initialSceneName ? allScenes.map(s => s.name) : undefined;

    supabase.functions
      .invoke('describe-discover-metadata', {
        body: { imageUrl, prompt, sceneOptions },
      })
      .then(({ data, error }) => {
        if (error || !data) {
          console.warn('AI auto-fill failed:', error);
          return;
        }
        if (data.title) setTitle(data.title);
        const fam: string | undefined = data.family ?? data.category;
        if (fam && DISCOVER_FAMILY_IDS.includes(fam)) {
          setCategory(fam);
          const subs = getDiscoverSubtypes(fam);
          const picked: string | undefined = data.subtype;
          if (picked && subs.some((s) => s.slug === picked)) {
            setSubcategory(picked);
          } else if (subs.length === 1) {
            setSubcategory(subs[0].slug);
          } else {
            setSubcategory(null);
          }
        } else if (data.subtype) {
          const derived = familyIdForSubtype(data.subtype);
          if (derived) {
            setCategory(derived);
            setSubcategory(data.subtype);
          }
        }
        if (data.tags && Array.isArray(data.tags)) setTags(data.tags.slice(0, 5));
        // AI scene suggestion — store as suggestion only, do NOT auto-select
        if (!initialSceneName && data.suggested_scene_name) {
          const match = allScenes.find(s => s.name === data.suggested_scene_name);
          if (match) {
            setAiSuggestedScene(match.name);
          }
        }
      })
      .catch(() => {})
      .finally(() => setAiLoading(false));
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
        className="relative z-10 bg-background rounded-2xl border border-border/50 shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">Add to Discover</h3>
            {aiLoading && (
              <span className="flex items-center gap-1 text-[10px] text-primary font-medium animate-pulse">
                <Sparkles className="w-3 h-3" />
                AI filling...
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview */}
        <div className="px-6 pb-4">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full max-h-48 object-cover rounded-xl border border-border/30"
          />
        </div>

        {/* Form */}
        <div className="px-6 pb-6 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Title *</label>
            {aiLoading ? (
              <Skeleton className="h-10 w-full rounded-lg" />
            ) : (
              <Input
                value={title}
                onChange={e => setTitle(e.target.value.slice(0, 60))}
                placeholder="Give it a title..."
                
              />
            )}
            <p className="text-[10px] text-muted-foreground/50 text-right">{title.length}/60</p>
          </div>

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

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tags (optional)</label>
            {aiLoading ? (
              <div className="flex gap-1.5">
                <Skeleton className="h-7 w-16 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-14 rounded-full" />
              </div>
            ) : (
              <>
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
              </>
            )}
            <p className="text-[10px] text-muted-foreground/50">{tags.length}/5 tags</p>
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

            {/* Scene picker */}
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground/80">Scene</label>
              <Popover open={scenePopoverOpen} onOpenChange={(o) => { setScenePopoverOpen(o); if (!o) setSceneSearch(''); }}>
                <PopoverTrigger asChild>
                  <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border/50 bg-background hover:bg-muted/40 transition-colors text-xs">
                    <span className={cn('truncate flex items-center gap-2', !pickedScene && 'text-muted-foreground/60')}>
                      {pickedScene?.imageUrl && (
                        <img src={pickedScene.imageUrl} alt="" className="w-5 h-5 rounded object-cover shrink-0" />
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
                    onClick={() => { setPickedSceneName(null); setScenePopoverOpen(false); }}
                    className="w-full text-left px-2 py-1.5 rounded-md text-xs hover:bg-muted text-muted-foreground"
                  >
                    — No scene —
                  </button>
                  {Object.entries(scenesByCategory).map(([cat, list]) => {
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
                            key={s.name}
                            onClick={() => { setPickedSceneName(s.name); setScenePopoverOpen(false); }}
                            className={cn(
                              'w-full flex items-center gap-2 text-left px-2 py-1.5 rounded-md text-xs hover:bg-muted',
                              pickedSceneName === s.name && 'bg-muted font-medium'
                            )}
                          >
                            {s.imageUrl && (
                              <img src={s.imageUrl} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                            )}
                            <span className="truncate">{s.name}</span>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </PopoverContent>
              </Popover>
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
                        <img src={pickedModel.imageUrl} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                      )}
                      <span className="truncate">{pickedModelName ?? '— No model —'}</span>
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/60 ml-2 shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2 max-h-72 overflow-auto" align="start">
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
                          <img src={m.imageUrl} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
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
                    <img src={productImageUrl} alt="" className="w-6 h-6 rounded object-cover" />
                  )}
                  <span className="text-xs text-foreground/80 truncate">Show product: {productName}</span>
                </div>
                <Switch checked={showProduct} onCheckedChange={setShowProduct} />
              </div>
            )}
          </div>

          {/* Publish */}
          <Button
            onClick={handlePublish}
            disabled={!title.trim() || publishing || aiLoading}
            className="w-full font-medium"
          >
            <Globe className="w-4 h-4 mr-2" />
            {publishing ? 'Publishing...' : 'Publish to Discover'}
          </Button>
          <p className="text-[10px] text-muted-foreground/50 text-center">
            This will appear immediately in the Discover feed
          </p>
        </div>
      </div>
    </div>
  );
}
