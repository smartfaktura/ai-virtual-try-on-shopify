import { useState, useEffect } from 'react';
import { Download, Trash2, Camera, User, X, Sparkles, Loader2 } from 'lucide-react';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { AddSceneModal } from '@/components/app/AddSceneModal';
import { AddModelModal } from '@/components/app/AddModelModal';
import type { LibraryItem } from '@/components/app/LibraryImageCard';

interface LibraryDetailModalProps {
  item: LibraryItem | null;
  open: boolean;
  onClose: () => void;
}

export function LibraryDetailModal({ item, open, onClose }: LibraryDetailModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [upscaling, setUpscaling] = useState(false);
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
  const [sceneModalUrl, setSceneModalUrl] = useState<string | null>(null);
  const [modelModalUrl, setModelModalUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { isAdmin } = useIsAdmin();

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Reset upscaled URL when item changes
  useEffect(() => {
    setUpscaledUrl(null);
  }, [item?.id]);

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

  const handleDownload = async () => {
    try {
      const response = await fetch(item.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.label.replace(/\s+/g, '-').toLowerCase()}-${item.id.slice(0, 8)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Image downloaded');
    } catch {
      toast.error('Download failed');
    }
  };

  const handleDelete = async () => {
    if (item.source !== 'freestyle') return;
    setDeleting(true);
    const { error } = await supabase.from('freestyle_generations').delete().eq('id', item.id);
    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success('Deleted');
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['recent-creations'] });
      onClose();
    }
    setDeleting(false);
  };

  const isUpscaled = item.quality === 'upscaled' || !!upscaledUrl;
  const displayImageUrl = upscaledUrl || item.imageUrl;

  const handleUpscale = async () => {
    if (isUpscaled || upscaling) return;
    setUpscaling(true);
    try {
      const { data, error } = await supabase.functions.invoke('upscale-image', {
        body: {
          imageUrl: item.imageUrl,
          sourceType: item.source === 'freestyle' ? 'freestyle' : 'generation',
          sourceId: item.id,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setUpscaledUrl(data.imageUrl);
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['recent-creations'] });
      toast.success('Image upscaled to PRO HD');
    } catch (err: any) {
      toast.error(err?.message || 'Upscale failed — credits refunded');
    } finally {
      setUpscaling(false);
    }
  };

  return (
    <>
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
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left — Image */}
          <div className="w-full md:w-[60%] h-[45vh] md:h-full flex items-center justify-center p-6 md:p-12">
            <ShimmerImage
              src={item.imageUrl}
              alt={item.label}
              className="max-w-full max-h-[calc(45vh-2rem)] md:max-h-[calc(100vh-6rem)] object-contain rounded-lg shadow-2xl"
              wrapperClassName="flex items-center justify-center max-w-full max-h-[calc(45vh-2rem)] md:max-h-[calc(100vh-6rem)]"
            />
          </div>

          {/* Right — Info panel */}
          <div className="relative w-full md:w-[40%] h-[55vh] md:h-full overflow-y-auto bg-background/95 backdrop-blur-xl border-l border-border/20">
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 z-20 text-foreground/70 hover:text-foreground transition-colors"
            >
              <X className="w-7 h-7" strokeWidth={2} />
            </button>

            <div className="flex flex-col gap-6 p-6 md:p-8 lg:p-10 pt-8 md:pt-10">
              {/* Source + label */}
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                  {item.source === 'freestyle' ? 'Freestyle' : 'Generation'}
                </p>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground leading-tight">
                  {item.label}
                </h2>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                    {item.date}
                  </span>
                  {item.aspectRatio && (
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                      · {item.aspectRatio}
                    </span>
                  )}
                  {item.quality === 'high' && (
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">· HD</span>
                  )}
                </div>
              </div>

              {/* Prompt */}
              {item.prompt && (
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
                    Prompt
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.prompt}
                  </p>
                </div>
              )}

              {/* Primary: Download */}
              <Button
                onClick={handleDownload}
                className="w-full h-12 rounded-xl text-sm font-medium shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-shadow duration-300"
              >
                <Download className="w-4 h-4 mr-2" /> Download Image
              </Button>

              {/* Secondary actions */}
              <div className="flex gap-2">
                {item.source === 'freestyle' && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-medium text-destructive bg-muted/30 backdrop-blur-sm border border-destructive/20 hover:bg-destructive/10 transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deleting ? 'Deleting…' : 'Delete'}
                  </button>
                )}
              </div>

              {/* Admin actions */}
              {isAdmin && (
                <div className="pt-5 border-t border-border/30">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50 mb-3">
                    Admin Actions
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSceneModalUrl(item.imageUrl)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-medium text-muted-foreground bg-muted/30 backdrop-blur-sm border border-border/30 hover:bg-muted/50 hover:text-foreground transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" /> Add as Scene
                    </button>
                    <button
                      onClick={() => setModelModalUrl(item.imageUrl)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-medium text-muted-foreground bg-muted/30 backdrop-blur-sm border border-border/30 hover:bg-muted/50 hover:text-foreground transition-all"
                    >
                      <User className="w-3.5 h-3.5" /> Add as Model
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {sceneModalUrl && (
        <AddSceneModal open={!!sceneModalUrl} onClose={() => setSceneModalUrl(null)} imageUrl={sceneModalUrl} />
      )}
      {modelModalUrl && (
        <AddModelModal open={!!modelModalUrl} onClose={() => setModelModalUrl(null)} imageUrl={modelModalUrl} />
      )}
    </>
  );
}
