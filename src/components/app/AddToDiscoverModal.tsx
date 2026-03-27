import { useState, useEffect } from 'react';
import { X, Globe, Tag, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/brandedToast';
import { mockModels, mockTryOnPoses } from '@/data/mockData';

const CATEGORIES = [
  'fashion', 'beauty', 'fragrances', 'jewelry', 'accessories',
  'home', 'food', 'electronics', 'sports', 'supplements',
] as const;

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
  const [category, setCategory] = useState<string>('fashion');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showModel, setShowModel] = useState(true);
  const [showScene, setShowScene] = useState(true);
  const [showProduct, setShowProduct] = useState(false);
  const queryClient = useQueryClient();

  // Auto-fill with AI when modal opens
  useEffect(() => {
    if (!open) return;
    // Reset state
    setTitle('');
    setCategory('fashion');
    setTags([]);
    setTagInput('');
    setAiLoading(true);
    setShowModel(true);
    setShowScene(true);
    setShowProduct(false);

    supabase.functions
      .invoke('describe-discover-metadata', {
        body: { imageUrl, prompt },
      })
      .then(({ data, error }) => {
        if (error || !data) {
          console.warn('AI auto-fill failed:', error);
          return;
        }
        if (data.title) setTitle(data.title);
        if (data.category && CATEGORIES.includes(data.category)) setCategory(data.category);
        if (data.tags && Array.isArray(data.tags)) setTags(data.tags.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setAiLoading(false));
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
    const effectiveSlug = workflowSlug || (workflowName ? workflowName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : null);

    // Resolve names and image URLs from IDs if not already provided
    let resolvedModelName = modelName || null;
    let resolvedModelImageUrl = modelImageUrl || null;
    let resolvedSceneName = sceneName || null;
    let resolvedSceneImageUrl = sceneImageUrl || null;

    // Resolve model by ID
    if (modelId && (!resolvedModelName || !resolvedModelImageUrl)) {
      if (modelId.startsWith('custom-')) {
        try {
          const { data } = await supabase
            .from('custom_models' as any)
            .select('name, image_url')
            .eq('id', modelId.replace('custom-', ''))
            .limit(1)
            .single();
          if (data) {
            resolvedModelName = resolvedModelName || (data as any).name;
            resolvedModelImageUrl = resolvedModelImageUrl || (data as any).image_url;
          }
        } catch {}
      } else {
        const mock = mockModels.find(m => m.modelId === modelId);
        if (mock) {
          resolvedModelName = resolvedModelName || mock.name;
          resolvedModelImageUrl = resolvedModelImageUrl || mock.previewUrl;
        }
      }
    }

    // Resolve scene by ID
    if (sceneId && (!resolvedSceneName || !resolvedSceneImageUrl)) {
      if (sceneId.startsWith('custom-')) {
        try {
          const { data } = await supabase
            .from('custom_scenes' as any)
            .select('name, image_url')
            .eq('id', sceneId.replace('custom-', ''))
            .limit(1)
            .single();
          if (data) {
            resolvedSceneName = resolvedSceneName || (data as any).name;
            resolvedSceneImageUrl = resolvedSceneImageUrl || (data as any).image_url;
          }
        } catch {}
      } else {
        const mock = mockTryOnPoses.find(p => p.poseId === sceneId);
        if (mock) {
          resolvedSceneName = resolvedSceneName || mock.name;
          resolvedSceneImageUrl = resolvedSceneImageUrl || mock.previewUrl;
        }
      }
    }

    // Fallback: resolve by name if we have names but no images
    if (!resolvedSceneImageUrl && resolvedSceneName) {
      try {
        const { data } = await supabase
          .from('custom_scenes' as any)
          .select('image_url')
          .eq('name', resolvedSceneName)
          .limit(1)
          .single();
        if (data) resolvedSceneImageUrl = (data as any).image_url;
      } catch {}
    }
    if (!resolvedModelImageUrl && resolvedModelName) {
      try {
        const { data } = await supabase
          .from('custom_models' as any)
          .select('image_url')
          .eq('name', resolvedModelName)
          .limit(1)
          .single();
        if (data) resolvedModelImageUrl = (data as any).image_url;
      } catch {}
      if (!resolvedModelImageUrl) {
        const mock = mockModels.find(m => m.name === resolvedModelName);
        if (mock) resolvedModelImageUrl = mock.previewUrl;
      }
    }

    const presetData = {
      title: title.trim(),
      prompt,
      image_url: imageUrl,
      category,
      tags,
      aspect_ratio: aspectRatio,
      quality,
      sort_order: 0,
      is_featured: false,
      workflow_slug: effectiveSlug,
      workflow_name: workflowName || null,
      scene_name: resolvedSceneName,
      model_name: resolvedModelName,
      scene_image_url: resolvedSceneImageUrl,
      model_image_url: resolvedModelImageUrl,
      product_name: productName || null,
      product_image_url: productImageUrl || null,
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
              <Skeleton className="h-11 w-full rounded-xl" />
            ) : (
              <Input
                value={title}
                onChange={e => setTitle(e.target.value.slice(0, 60))}
                placeholder="Give it a title..."
                className="rounded-xl h-11"
              />
            )}
            <p className="text-[10px] text-muted-foreground/50 text-right">{title.length}/60</p>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 capitalize',
                    category === cat
                      ? 'bg-foreground text-background'
                      : 'bg-muted/40 text-muted-foreground hover:bg-muted/70',
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
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

          {/* Publish */}
          <Button
            onClick={handlePublish}
            disabled={!title.trim() || publishing || aiLoading}
            className="w-full h-12 rounded-xl text-sm font-medium"
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
