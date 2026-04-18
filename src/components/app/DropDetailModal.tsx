import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Download, Loader2, ExternalLink, ChevronLeft, ChevronRight, X, Maximize, Layers, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { toSignedUrls } from '@/lib/signedUrl';
import { downloadDropAsZip } from '@/lib/dropDownload';
import { saveOrShareImage, isMobileDevice } from '@/lib/mobileImageSave';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/brandedToast';
import { UpscaleModal } from '@/components/app/UpscaleModal';
import { supabase } from '@/integrations/supabase/client';
import type { DropImage } from '@/lib/dropDownload';

interface DropDetailModalProps {
  open: boolean;
  onClose: () => void;
  drop: {
    id: string;
    run_date: string;
    status: string;
    total_images: number;
    credits_charged: number;
    images: DropImage[];
    generation_job_ids?: string[];
    schedule_name?: string;
  };
}

export function DropDetailModal({ open, onClose, drop }: DropDetailModalProps) {
  const navigate = useNavigate();
  const [signedUrls, setSignedUrls] = useState<string[]>([]);
  const [signing, setSigning] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadPct, setDownloadPct] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [upscaleOpen, setUpscaleOpen] = useState(false);

  const isGenerating = drop.status === 'generating';

  // Fetch images from generation_jobs when drop.images is empty
  const dropImagesEmpty = !drop.images || drop.images.length === 0;
  const jobIds = drop.generation_job_ids || [];

  const { data: fetchedImages = [] } = useQuery({
    queryKey: ['drop-job-images', drop.id, jobIds.join(',')],
    queryFn: async () => {
      if (jobIds.length === 0) return [];
      const { data, error } = await supabase
        .from('generation_jobs')
        .select('results, workflow_id, product_id')
        .in('id', jobIds)
        .eq('status', 'completed');
      if (error) throw error;

      const workflowIds = [...new Set((data || []).map(j => j.workflow_id).filter(Boolean))];
      let workflowMap = new Map<string, string>();
      if (workflowIds.length > 0) {
        const { data: wfs } = await supabase.from('workflows').select('id, name').in('id', workflowIds);
        if (wfs) workflowMap = new Map(wfs.map(w => [w.id, w.name]));
      }

      const imgs: DropImage[] = [];
      for (const job of (data || [])) {
        const results = job.results as any[];
        if (!results || !Array.isArray(results)) continue;
        for (const r of results) {
          const url = typeof r === 'string' ? r : r?.url || r?.image_url;
          if (url) {
            imgs.push({
              url,
              workflow_name: job.workflow_id ? workflowMap.get(job.workflow_id) : undefined,
            });
          }
        }
      }
      return imgs;
    },
    enabled: open && dropImagesEmpty && jobIds.length > 0,
    staleTime: 30_000,
    refetchInterval: open && isGenerating ? 5_000 : false,
  });

  const images = useMemo(() => {
    if (drop.images && drop.images.length > 0) return drop.images;
    return fetchedImages;
  }, [drop.images, fetchedImages]);

  const rawUrls = images.map(img => (typeof img === 'string' ? img : img.url)).filter(Boolean);
  const count = rawUrls.length;
  const title = drop.schedule_name || `Drop — ${new Date(drop.run_date).toLocaleDateString()}`;

  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape + arrow key nav
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (signedUrls.length > 1) {
        if (e.key === 'ArrowLeft') setSelectedIndex(i => (i > 0 ? i - 1 : signedUrls.length - 1));
        else if (e.key === 'ArrowRight') setSelectedIndex(i => (i < signedUrls.length - 1 ? i + 1 : 0));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, signedUrls.length]);

  // Sign URLs when images change
  useEffect(() => {
    if (!open || count === 0) {
      setSignedUrls([]);
      return;
    }
    setSigning(true);
    toSignedUrls(rawUrls).then(signed => {
      setSignedUrls(signed);
      setSigning(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, count, rawUrls.join(',')]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedIndex(0);
      setDownloading(false);
      setDownloadPct(0);
    }
  }, [open]);

  const handleDownloadCurrent = useCallback(async () => {
    const url = signedUrls[selectedIndex];
    if (!url) return;
    await saveOrShareImage(url, `${title.replace(/\s+/g, '_')}_${selectedIndex + 1}.png`);
  }, [signedUrls, selectedIndex, title]);

  const handleDownloadAll = useCallback(async () => {
    if (signedUrls.length === 0) return;
    setDownloading(true);
    setDownloadPct(0);
    try {
      if (signedUrls.length === 1) {
        await saveOrShareImage(signedUrls[0], `${title.replace(/\s+/g, '_')}.png`);
      } else {
        const dlImages = signedUrls.map((url, i) => ({
          url,
          workflow_name: title,
          scene_name: `image_${i + 1}`,
        }));
        await downloadDropAsZip(dlImages, title, pct => setDownloadPct(pct));
      }
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  }, [signedUrls, title]);

  if (!open) return null;

  const isLoading = signing || signedUrls.length === 0;
  const currentUrl = signedUrls[selectedIndex];
  const showImages = count > 0;

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
        onClick={e => e.stopPropagation()}
      >
        {/* Left — Image */}
        <div className="relative w-full md:w-[60%] h-[45vh] md:h-full flex items-center justify-center p-6 md:p-12">
          {isGenerating && !showImages ? (
            <div className="flex flex-col items-center gap-4 text-white/70">
              <Loader2 className="w-12 h-12 animate-spin opacity-40" />
              <p className="text-sm">Generating your drop...</p>
              <p className="text-xs text-white/40">Images will appear here as they complete</p>
            </div>
          ) : isLoading && count > 0 ? (
            <div className="w-64 h-64 rounded-lg bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%] animate-shimmer" />
          ) : currentUrl ? (
            <>
              <ShimmerImage
                key={selectedIndex}
                src={getOptimizedUrl(currentUrl, { quality: 85 })}
                alt={`Result ${selectedIndex + 1}`}
                className="max-w-full max-h-[calc(45vh-2rem)] md:max-h-[calc(100vh-6rem)] object-contain rounded-lg shadow-2xl"
                wrapperClassName="flex items-center justify-center max-w-full max-h-[calc(45vh-2rem)] md:max-h-[calc(100vh-6rem)]"
              />
              {signedUrls.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedIndex(i => (i > 0 ? i - 1 : signedUrls.length - 1))}
                    className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-background/80 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedIndex(i => (i < signedUrls.length - 1 ? i + 1 : 0))}
                    className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-background/80 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 text-white/50">
              <Image className="w-12 h-12 opacity-30" />
              <p className="text-sm">No images yet</p>
            </div>
          )}
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
            {/* Source + title */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                Content Calendar
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground leading-tight">
                {title}
              </h2>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                  {count} {count === 1 ? 'image' : 'images'}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                  · {formatDistanceToNow(new Date(drop.run_date), { addSuffix: true })}
                </span>
                {drop.credits_charged > 0 && (
                  <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                    · {drop.credits_charged} credits
                  </span>
                )}
              </div>
              {isGenerating && (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span className="text-xs text-primary font-medium">Generating — images will appear as they complete</span>
                </div>
              )}
            </div>

            {/* Thumbnail grid */}
            {count > 1 && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
                  Images
                </p>
                <div className="grid grid-cols-4 md:grid-cols-3 gap-1.5 md:gap-2">
                  {(isLoading ? Array.from({ length: count }) : signedUrls).map((item, i) => (
                    <button
                      key={i}
                      onClick={() => !isLoading && setSelectedIndex(i)}
                      className={cn(
                        'aspect-square rounded-md md:rounded-lg overflow-hidden border-2 transition-all',
                        !isLoading && selectedIndex === i
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-border/30 hover:border-primary/40'
                      )}
                    >
                      {isLoading ? (
                        <div className="w-full h-full bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%] animate-shimmer" />
                      ) : (
                        <ShimmerImage
                          src={getOptimizedUrl(item as string, { quality: 50 })}
                          alt={`Thumb ${i + 1}`}
                          aspectRatio="1/1"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Download current */}
            {showImages && (
              <Button
                onClick={handleDownloadCurrent}
                disabled={isLoading}
                className="w-full font-medium shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-shadow duration-300"
              >
                <Download className="w-4 h-4 mr-2" /> {isMobileDevice() ? 'Save to Photos' : 'Download Image'}
              </Button>
            )}

            {/* Download all */}
            {count > 1 && (
              <button
                onClick={handleDownloadAll}
                disabled={isLoading || downloading}
                className="flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-medium text-muted-foreground bg-muted/30 backdrop-blur-sm border border-border/30 hover:bg-muted/50 hover:text-foreground transition-all disabled:opacity-50"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {downloadPct}%
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    Download All ({count})
                  </>
                )}
              </button>
            )}

            {/* Upscale & Perspectives */}
            {showImages && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => !isLoading && setUpscaleOpen(true)}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-medium text-muted-foreground bg-muted/30 backdrop-blur-sm border border-border/30 hover:bg-muted/50 hover:text-foreground transition-all disabled:opacity-50"
                >
                  <Maximize className="w-3.5 h-3.5" />
                  Upscale
                </button>
                <button
                  onClick={() => {
                    if (!currentUrl) return;
                    onClose();
                    navigate(`/app/perspectives?source=${encodeURIComponent(currentUrl)}`);
                  }}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-medium text-muted-foreground bg-muted/30 backdrop-blur-sm border border-border/30 hover:bg-muted/50 hover:text-foreground transition-all disabled:opacity-50"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Perspectives
                </button>
              </div>
            )}

            {/* View in Library */}
            <button
              onClick={() => {
                onClose();
                navigate('/app/library');
              }}
              className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground/70 hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View in Library
            </button>
          </div>
        </div>
      </div>

      {/* Upscale modal */}
      {currentUrl && (
        <UpscaleModal
          open={upscaleOpen}
          onClose={() => setUpscaleOpen(false)}
          items={[{
            imageUrl: currentUrl,
            sourceType: 'generation',
            sourceId: drop.id,
          }]}
          onComplete={() => setUpscaleOpen(false)}
        />
      )}
    </div>
  );
}
