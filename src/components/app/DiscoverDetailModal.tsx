import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Heart, Search, X, Eye, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { DiscoverItem } from '@/components/app/DiscoverCard';
import { cn } from '@/lib/utils';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { supabase } from '@/integrations/supabase/client';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const DISCOVER_CATEGORIES = ['fashion', 'beauty', 'fragrances', 'jewelry', 'accessories', 'home', 'food', 'electronics', 'sports', 'supplements'] as const;

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
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/90" />

      {/* Split layout */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 z-10 flex flex-col md:flex-row"
      >
        {/* Left — Image showcase */}
        <div className="w-full md:w-[60%] h-[45vh] md:h-full flex items-center justify-center p-6 md:p-12">
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
            {/* Admin category selector (admin only) */}
            {isAdmin && isPreset && (
              <Select
                value={category}
                onValueChange={async (val) => {
                  const { error } = await supabase
                    .from('discover_presets')
                    .update({ category: val })
                    .eq('id', item.data.id);
                  if (error) { toast.error('Failed to update category'); return; }
                  (item.data as any).category = val;
                  toast.success(`Category → ${val}`);
                }}
              >
                <SelectTrigger className="h-6 w-auto px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70 border-dashed">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[300]">
                  {DISCOVER_CATEGORIES.map(c => (
                    <SelectItem key={c} value={c} className="capitalize text-xs">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

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
