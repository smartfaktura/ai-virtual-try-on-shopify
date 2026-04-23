import { useState, useEffect } from 'react';
import { X, Send, Tag, Sparkles, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { useSubmitToDiscover } from '@/hooks/useDiscoverSubmissions';
import { supabase } from '@/integrations/supabase/client';

const CATEGORIES = [
  'fashion', 'beauty', 'fragrances', 'jewelry', 'accessories',
  'home', 'food', 'electronics', 'sports', 'supplements',
] as const;

interface SubmitToDiscoverModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  prompt: string;
  aspectRatio?: string;
  quality?: string;
  sourceGenerationId?: string;
  productName?: string;
  productImageUrl?: string;
  workflowSlug?: string;
  workflowName?: string;
  sceneName?: string;
  modelName?: string;
  sceneImageUrl?: string;
  modelImageUrl?: string;
}

export function SubmitToDiscoverModal({
  open,
  onClose,
  imageUrl,
  prompt,
  aspectRatio = '1:1',
  quality = 'standard',
  sourceGenerationId,
  productName,
  productImageUrl,
  workflowSlug,
  workflowName,
  sceneName,
  modelName,
  sceneImageUrl,
  modelImageUrl,
}: SubmitToDiscoverModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('fashion');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [includeProduct, setIncludeProduct] = useState(false);
  const [includeScene, setIncludeScene] = useState(true);
  const [includeModel, setIncludeModel] = useState(true);
  const submitMutation = useSubmitToDiscover();

  const hasProduct = !!(productName && productImageUrl);
  const hasScene = !!(sceneName);
  const hasModel = !!(modelName);

  // Auto-fill with AI when modal opens
  useEffect(() => {
    if (!open) return;
    setTitle('');
    setCategory('lifestyle');
    setTags([]);
    setTagInput('');
    setIncludeProduct(hasProduct);
    setAiLoading(true);

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

  const handleSubmit = async () => {
    if (!title.trim()) return;

    let finalProductName: string | undefined;
    let finalProductImageUrl: string | undefined;

    if (includeProduct && hasProduct) {
      try {
        const { data: previewData } = await supabase.functions.invoke('generate-discover-preview', {
          body: { sourceUrl: productImageUrl, postId: `submission-${Date.now()}` },
        });
        if (previewData?.publicUrl) {
          finalProductName = productName;
          finalProductImageUrl = previewData.publicUrl;
        }
      } catch (err) {
        console.warn('Product preview generation failed:', err);
      }
    }

    submitMutation.mutate(
      {
        image_url: imageUrl,
        source_generation_id: sourceGenerationId,
        title: title.trim(),
        prompt,
        category,
        tags,
        aspect_ratio: aspectRatio,
        quality,
        product_name: finalProductName,
        product_image_url: finalProductImageUrl,
        workflow_slug: workflowSlug,
        workflow_name: workflowName,
        scene_name: includeScene && hasScene ? sceneName : undefined,
        model_name: includeModel && hasModel ? modelName : undefined,
        scene_image_url: includeScene && hasScene ? sceneImageUrl : undefined,
        model_image_url: includeModel && hasModel ? modelImageUrl : undefined,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-background rounded-2xl border border-border/50 shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground"><h3 className="text-lg font-semibold text-foreground">Share to Explore</h3></h3>
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
        <div className="px-6 pb-3">
          <img
            src={getOptimizedUrl(imageUrl, { quality: 60 })}
            alt="Preview"
            className="w-full max-h-36 object-cover rounded-xl border border-border/30"
          />
        </div>

        {/* Form */}
        <div className="px-6 pb-6 space-y-3">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Title *</label>
            {aiLoading ? (
              <Skeleton className="h-10 w-full rounded-xl" />
            ) : (
              <Input
                value={title}
                onChange={e => setTitle(e.target.value.slice(0, 60))}
                placeholder="Give it a catchy title..."
                className="rounded-xl h-10"
              />
            )}
            <p className="text-[10px] text-muted-foreground/50 text-right">{title.length}/60</p>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 capitalize',
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

          {/* Product — only if generation had a product */}
          {hasProduct && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">Include</span>
                  <Switch checked={includeProduct} onCheckedChange={setIncludeProduct} />
                </div>
              </div>
              <div className={cn(
                'flex items-center gap-3 p-2.5 rounded-xl border border-border/30 transition-opacity',
                includeProduct ? 'bg-muted/30' : 'bg-muted/10 opacity-50',
              )}>
                <img
                  src={getOptimizedUrl(productImageUrl, { quality: 60 })}
                  alt={productName}
                  className="w-9 h-9 rounded-lg object-cover border border-border/30"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{productName}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {includeProduct ? 'Will be shown as product reference' : 'Product won\'t be included'}
                  </p>
                </div>
                <Package className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            </div>
          )}

          {/* Scene — auto-detected from generation */}
          {hasScene && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Scene</label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">Include</span>
                  <Switch checked={includeScene} onCheckedChange={setIncludeScene} />
                </div>
              </div>
              <div className={cn(
                'flex items-center gap-3 p-2.5 rounded-xl border border-border/30 transition-opacity',
                includeScene ? 'bg-muted/30' : 'bg-muted/10 opacity-50',
              )}>
                {sceneImageUrl ? (
                  <img
                    src={getOptimizedUrl(sceneImageUrl, { quality: 60 })}
                    alt={sceneName}
                    className="w-9 h-9 rounded-lg object-cover border border-border/30"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-muted/40 border border-border/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{sceneName}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {includeScene ? 'Helps Recreate auto-select this scene' : 'Scene metadata won\'t be saved'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Model — auto-detected from generation */}
          {hasModel && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Model</label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">Include</span>
                  <Switch checked={includeModel} onCheckedChange={setIncludeModel} />
                </div>
              </div>
              <div className={cn(
                'flex items-center gap-3 p-2.5 rounded-xl border border-border/30 transition-opacity',
                includeModel ? 'bg-muted/30' : 'bg-muted/10 opacity-50',
              )}>
                {modelImageUrl ? (
                  <img
                    src={getOptimizedUrl(modelImageUrl, { quality: 60 })}
                    alt={modelName}
                    className="w-9 h-9 rounded-lg object-cover border border-border/30"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-muted/40 border border-border/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{modelName}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {includeModel ? 'Helps Recreate auto-select this model' : 'Model metadata won\'t be saved'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-1">
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
                    className="rounded-xl h-9 flex-1"
                    disabled={tags.length >= 5}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim() || tags.length >= 5}
                    className="rounded-xl h-9 px-3"
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

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || submitMutation.isPending || aiLoading}
            className="w-full font-medium"
          >
            <Send className="w-4 h-4 mr-2" />
            {submitMutation.isPending ? 'Submitting...' : 'Submit for Review'}
          </Button>
          <p className="text-muted-foreground/50 text-center text-xs">
            Submitted content is reviewed before appearing in Explore.
          </p>
        </div>
      </div>
    </div>
  );
}
