import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Heart, Search, X, Eye, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { DiscoverItem } from '@/components/app/DiscoverCard';
import { cn } from '@/lib/utils';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { supabase } from '@/integrations/supabase/client';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { mockModels, mockTryOnPoses } from '@/data/mockData';
import { useCustomModels } from '@/hooks/useCustomModels';
import { useCustomScenes } from '@/hooks/useCustomScenes';

const DISCOVER_CATEGORIES = ['fashion', 'beauty', 'fragrances', 'jewelry', 'accessories', 'home', 'food', 'electronics', 'sports', 'supplements', 'editorial', 'commercial', 'lifestyle', 'campaign', 'cinematic', 'photography', 'styling', 'ads'] as const;

interface DiscoverDetailModalProps {
  item: DiscoverItem | null;
  open: boolean;
  onClose: () => void;
  onUseItem: (item: DiscoverItem) => void;
  onSearchSimilar: (item: DiscoverItem) => void;
  relatedItems: DiscoverItem[];
  onSelectRelated: (item: DiscoverItem) => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
  viewCount?: number;
  isAdmin?: boolean;
  isFeatured?: boolean;
  onToggleFeatured?: () => void;
  onDelete?: () => void;
}

export function DiscoverDetailModal({
  item,
  open,
  onClose,
  onUseItem,
  onSearchSimilar,
  relatedItems,
  onSelectRelated,
  isSaved,
  onToggleSave,
  viewCount,
  isAdmin,
  isFeatured,
  onToggleFeatured,
  onDelete,
}: DiscoverDetailModalProps) {
  const navigate = useNavigate();

  const { asProfiles: customModelProfiles } = useCustomModels();
  const { asPoses: customSceneProfiles } = useCustomScenes();

  const allModelOptions = useMemo(() => {
    const items: { name: string; imageUrl: string }[] = mockModels.map(m => ({ name: m.name, imageUrl: m.previewUrl }));
    customModelProfiles?.forEach(cm => {
      if (!items.find(i => i.name === cm.name)) items.push({ name: cm.name, imageUrl: cm.previewUrl });
    });
    return items;
  }, [customModelProfiles]);

  const allSceneOptions = useMemo(() => {
    const items: { name: string; imageUrl: string }[] = mockTryOnPoses.map(s => ({ name: s.name, imageUrl: s.previewUrl }));
    customSceneProfiles?.forEach(cs => {
      if (!items.find(i => i.name === cs.name)) items.push({ name: cs.name, imageUrl: cs.previewUrl });
    });
    return items;
  }, [customSceneProfiles]);

  const [editModelName, setEditModelName] = useState('__none__');
  const [editSceneName, setEditSceneName] = useState('__none__');
  const [editCategory, setEditCategory] = useState('fashion');
  const [editWorkflowSlug, setEditWorkflowSlug] = useState('__freestyle__');
  const [savingMeta, setSavingMeta] = useState(false);

  const { data: workflows } = useQuery({
    queryKey: ['workflows-list'],
    queryFn: async () => {
      const { data } = await supabase.from('workflows').select('id, name, slug').order('sort_order');
      return data ?? [];
    },
  });

  const itemId = item?.type === 'preset' ? item.data.id : item?.type === 'scene' ? item.data.poseId : null;
  useEffect(() => {
    if (!itemId || !open) return;
    if (item?.type === 'preset') {
      setEditModelName(item.data.model_name || '__none__');
      setEditSceneName(item.data.scene_name || '__none__');
      setEditCategory(item.data.category || 'fashion');
      setEditWorkflowSlug(item.data.workflow_slug || '__freestyle__');
    } else {
      setEditModelName('__none__');
      setEditSceneName('__none__');
      setEditCategory('fashion');
      setEditWorkflowSlug('__freestyle__');
    }
  }, [itemId, open]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open || !item) return null;

  const isPreset = item.type === 'preset';
  const imageUrl = isPreset ? item.data.image_url : item.data.previewUrl;
  const title = isPreset ? item.data.title : item.data.name;
  const category = isPreset ? item.data.category : item.data.category;

  const workflowLabel = isPreset && item.data.workflow_name
    ? item.data.workflow_name.replace(/\bSet$/i, 'Workflow')
    : isPreset ? 'Freestyle' : 'Scene';

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 z-[200] animate-in fade-in duration-200"
      style={{ margin: 0, padding: 0 }}
    >
      {/* Backdrop */}
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/90" onClick={onClose} />

      {/* Split layout */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 z-10 flex flex-col md:flex-row"
      >
        {/* Left — Image showcase */}
        <div className="w-full md:w-[60%] h-[45vh] md:h-full flex items-center justify-center p-6 md:p-12" onClick={onClose}>
          <ShimmerImage
            src={imageUrl}
            alt={title}
            wrapperClassName="flex items-center justify-center"
            className="max-w-full max-h-[calc(45vh-2rem)] md:max-h-[calc(100vh-6rem)] object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Right — Controls panel */}
        <div className="relative w-full md:w-[40%] h-[55vh] md:h-full overflow-y-auto bg-background/95 backdrop-blur-xl border-l border-border/20" onClick={(e) => e.stopPropagation()}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-20 text-foreground/70 hover:text-foreground transition-colors"
          >
            <X className="w-7 h-7" strokeWidth={2} />
          </button>

          <div className="flex flex-col gap-6 p-6 md:p-8 lg:p-10 pt-8 md:pt-10">

            {/* Title + views */}
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground leading-tight">{title}</h2>
              {typeof viewCount === 'number' && (
                <div className="flex items-center gap-1.5 text-muted-foreground/60 mt-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs font-medium">{viewCount} views</span>
                </div>
              )}
            </div>

            {/* Created with section */}
            {isPreset && (
              <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
                  {workflowLabel}
                </p>
                <div className="flex flex-col gap-2.5">
                  {item.data.scene_name && (
                    <div className="flex items-center gap-2.5">
                      {item.data.scene_image_url && (
                        <img
                          src={getOptimizedUrl(item.data.scene_image_url, { quality: 60 })}
                          alt={item.data.scene_name}
           className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="text-xs font-medium text-foreground">{item.data.scene_name}</p>
                        <p className="text-[10px] text-muted-foreground/60">Scene</p>
                      </div>
                    </div>
                  )}
                  {item.data.model_name && (
                    <div className="flex items-center gap-2.5">
                      {item.data.model_image_url && (
                        <img
                          src={getOptimizedUrl(item.data.model_image_url, { quality: 60 })}
                          alt={item.data.model_name}
           className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="text-xs font-medium text-foreground">{item.data.model_name}</p>
                        <p className="text-[10px] text-muted-foreground/60">Model</p>
                      </div>
                    </div>
                  )}
                  {(item.data as any).product_name && (
                    <div className="flex items-center gap-2.5">
                      {(item.data as any).product_image_url && (
                        <img
                          src={getOptimizedUrl((item.data as any).product_image_url, { quality: 60 })}
                          alt={(item.data as any).product_name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="text-xs font-medium text-foreground">{(item.data as any).product_name}</p>
                        <p className="text-[10px] text-muted-foreground/60">Product</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admin metadata editor */}
            {isAdmin && isPreset && (
              <div className="space-y-3 p-3 border border-dashed border-border/50 rounded-xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
                  Admin: Edit Metadata
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={editCategory} onValueChange={setEditCategory}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="z-[300] max-h-60" onPointerDownOutside={(e) => e.preventDefault()}>
                      {DISCOVER_CATEGORIES.map(c => (
                        <SelectItem key={c} value={c} className="text-xs capitalize">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={editWorkflowSlug} onValueChange={setEditWorkflowSlug}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Workflow" />
                    </SelectTrigger>
                    <SelectContent className="z-[300] max-h-60" onPointerDownOutside={(e) => e.preventDefault()}>
                      <SelectItem value="__freestyle__" className="text-xs">Freestyle</SelectItem>
                      {(workflows ?? []).map(w => (
                        <SelectItem key={w.slug} value={w.slug} className="text-xs">{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={editModelName} onValueChange={setEditModelName}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Model" />
                    </SelectTrigger>
                    <SelectContent className="z-[300] max-h-60" onPointerDownOutside={(e) => e.preventDefault()}>
                      <SelectItem value="__none__" className="text-xs">None</SelectItem>
                      {allModelOptions.map(m => (
                        <SelectItem key={m.name} value={m.name} className="text-xs" textValue={m.name}>
                          <div className="flex items-center gap-2">
                            <img src={getOptimizedUrl(m.imageUrl, { quality: 40 })} alt="" className="w-5 h-5 rounded object-cover shrink-0" />
                            <span>{m.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={editSceneName} onValueChange={setEditSceneName}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Scene" />
                    </SelectTrigger>
                    <SelectContent className="z-[300] max-h-60" onPointerDownOutside={(e) => e.preventDefault()}>
                      <SelectItem value="__none__" className="text-xs">None</SelectItem>
                      {allSceneOptions.map(s => (
                        <SelectItem key={s.name} value={s.name} className="text-xs" textValue={s.name}>
                          <div className="flex items-center gap-2">
                            <img src={getOptimizedUrl(s.imageUrl, { quality: 40 })} alt="" className="w-5 h-5 rounded object-cover shrink-0" />
                            <span>{s.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={savingMeta}
                  className="w-full h-8 text-xs"
                  onClick={async () => {
                    setSavingMeta(true);
                    const selectedModel = editModelName !== '__none__' ? allModelOptions.find(m => m.name === editModelName) : null;
                    const selectedScene = editSceneName !== '__none__' ? allSceneOptions.find(s => s.name === editSceneName) : null;
                    const selectedWorkflow = editWorkflowSlug !== '__freestyle__' ? (workflows ?? []).find(w => w.slug === editWorkflowSlug) : null;
                    const update: Record<string, string | null> = {
                      category: editCategory,
                      model_name: selectedModel?.name ?? null,
                      model_image_url: selectedModel?.imageUrl ?? null,
                      scene_name: selectedScene?.name ?? null,
                      scene_image_url: selectedScene?.imageUrl ?? null,
                      workflow_slug: selectedWorkflow?.slug ?? null,
                      workflow_name: selectedWorkflow?.name ?? null,
                    };
                    const { error } = await supabase
                      .from('discover_presets')
                      .update(update)
                      .eq('id', item.data.id);
                    setSavingMeta(false);
                    if (error) { toast.error('Failed to save'); return; }
                    (item.data as any).category = editCategory;
                    (item.data as any).model_name = update.model_name;
                    (item.data as any).model_image_url = update.model_image_url;
                    (item.data as any).scene_name = update.scene_name;
                    (item.data as any).scene_image_url = update.scene_image_url;
                    (item.data as any).workflow_slug = update.workflow_slug;
                    (item.data as any).workflow_name = update.workflow_name;
                    toast.success('Metadata saved');
                  }}
                >
                  {savingMeta ? 'Saving…' : 'Save metadata'}
                </Button>
              </div>
            )}

            {/* Primary CTA */}
            <Button
              onClick={() => {
                if (isPreset && item.data.workflow_slug) {
                  onClose();
                  const params = new URLSearchParams();
                  if (item.data.model_name) params.set('model', item.data.model_name);
                  if (item.data.scene_name) params.set('scene', item.data.scene_name);
                  if (item.data.model_image_url) params.set('modelImage', item.data.model_image_url);
                  if (item.data.scene_image_url) params.set('sceneImage', item.data.scene_image_url);
                  navigate(`/app/generate/${item.data.workflow_slug}?${params.toString()}`);
                } else if (isPreset) {
                  onClose();
                  const params = new URLSearchParams();
                  if (item.data.prompt) params.set('prompt', item.data.prompt);
                  if (item.data.aspect_ratio) params.set('ratio', item.data.aspect_ratio);
                  if (item.data.quality) params.set('quality', item.data.quality);
                  if (item.data.model_name) params.set('model', item.data.model_name);
                  if (item.data.scene_name) params.set('scene', item.data.scene_name);
                  if (item.data.model_image_url) params.set('modelImage', item.data.model_image_url);
                  if (item.data.scene_image_url) params.set('sceneImage', item.data.scene_image_url);
                  params.set('fromDiscover', '1');
                  navigate(`/app/freestyle?${params.toString()}`);
                } else {
                  onUseItem(item);
                  onClose();
                }
              }}
              className="w-full h-12 rounded-xl text-sm font-medium shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-shadow duration-300"
            >
              {isPreset ? 'Recreate this' : 'Use Scene'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {/* Secondary actions */}
            <div className="flex gap-2">
              {onToggleSave && (
                <button
                  onClick={onToggleSave}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-medium bg-muted/30 backdrop-blur-sm border border-border/30 hover:bg-muted/50 transition-all',
                    isSaved ? 'text-destructive border-destructive/20' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Heart className={cn('w-3.5 h-3.5', isSaved && 'fill-current')} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
              )}
              <button
                onClick={() => { onSearchSimilar(item); onClose(); }}
                className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-medium text-muted-foreground bg-muted/30 backdrop-blur-sm border border-border/30 hover:bg-muted/50 hover:text-foreground transition-all"
              >
                <Search className="w-3.5 h-3.5" /> Similar
              </button>
              {isAdmin && onToggleFeatured && (
                <button
                  onClick={onToggleFeatured}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-medium bg-muted/30 backdrop-blur-sm border border-border/30 hover:bg-muted/50 transition-all',
                    isFeatured ? 'text-amber-500 border-amber-500/20' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Star className={cn('w-3.5 h-3.5', isFeatured && 'fill-current')} />
                  {isFeatured ? 'Unfeature' : 'Feature'}
                </button>
              )}
              {isAdmin && onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="flex items-center justify-center gap-1.5 h-10 w-10 rounded-xl text-xs font-medium text-destructive bg-destructive/10 backdrop-blur-sm border border-destructive/20 hover:bg-destructive/20 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="z-[300]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete from Discover?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove "{title}". This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {/* More like this */}
            {relatedItems.length > 0 && (
              <div className="pt-5 border-t border-border/30">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50 mb-3">
                  More like this
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {relatedItems.map((ri) => {
                    const riImage = ri.type === 'preset' ? ri.data.image_url : ri.data.previewUrl;
                    const riTitle = ri.type === 'preset' ? ri.data.title : ri.data.name;
                    const riKey = ri.type === 'preset' ? `p-${ri.data.id}` : `s-${ri.data.poseId}`;
                    return (
                      <button
                        key={riKey}
                        onClick={() => onSelectRelated(ri)}
                        className="aspect-[3/4] rounded-xl overflow-hidden bg-muted hover:ring-2 ring-primary/50 transition-all duration-200 hover:scale-[1.03] shadow-sm hover:shadow-md"
                      >
                        <ShimmerImage src={riImage} alt={riTitle} className="w-full h-full object-cover" aspectRatio="3/4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
