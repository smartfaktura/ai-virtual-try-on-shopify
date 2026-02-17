import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Loader2, ExternalLink, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { toSignedUrls } from '@/lib/signedUrl';
import { downloadDropAsZip, downloadSingleImage } from '@/lib/dropDownload';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WorkflowPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: {
    id: string;
    workflow_name: string | null;
    created_at: string;
    results: unknown;
    requested_count: number;
  } | null;
}

function extractUrls(results: unknown): string[] {
  if (!Array.isArray(results)) return [];
  return results
    .map((r) => {
      if (typeof r === 'string') return r;
      if (r && typeof r === 'object' && 'url' in r) return (r as { url: string }).url;
      return null;
    })
    .filter((u): u is string => u != null && !u.startsWith('data:'));
}

export function WorkflowPreviewModal({ open, onOpenChange, job }: WorkflowPreviewModalProps) {
  const navigate = useNavigate();
  const [signedUrls, setSignedUrls] = useState<string[]>([]);
  const [signing, setSigning] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadPct, setDownloadPct] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const rawUrls = job ? extractUrls(job.results) : [];
  const count = rawUrls.length;
  const title = job?.workflow_name ?? 'Workflow';

  const onClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape + arrow key nav
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (signedUrls.length > 1) {
        if (e.key === 'ArrowLeft') setSelectedIndex((i) => (i > 0 ? i - 1 : signedUrls.length - 1));
        else if (e.key === 'ArrowRight') setSelectedIndex((i) => (i < signedUrls.length - 1 ? i + 1 : 0));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, signedUrls.length]);

  // Sign URLs lazily when modal opens
  useEffect(() => {
    if (!open || count === 0) {
      setSignedUrls([]);
      return;
    }
    setSigning(true);
    toSignedUrls(rawUrls).then((signed) => {
      setSignedUrls(signed);
      setSigning(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, job?.id]);

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
    try {
      await downloadSingleImage(url, `${title.replace(/\s+/g, '_')}_${selectedIndex + 1}.jpg`);
      toast.success('Image downloaded');
    } catch {
      toast.error('Download failed');
    }
  }, [signedUrls, selectedIndex, title]);

  const handleDownloadAll = useCallback(async () => {
    if (signedUrls.length === 0) return;
    setDownloading(true);
    setDownloadPct(0);
    try {
      if (signedUrls.length === 1) {
        await downloadSingleImage(signedUrls[0], `${title.replace(/\s+/g, '_')}.jpg`);
        toast.success('Image downloaded');
      } else {
        const images = signedUrls.map((url, i) => ({
          url,
          workflow_name: title,
          scene_name: `image_${i + 1}`,
        }));
        await downloadDropAsZip(images, title, (pct) => setDownloadPct(pct));
        toast.success(`${signedUrls.length} images downloaded`);
      }
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  }, [signedUrls, title]);

  if (!open || !job) return null;

  const isLoading = signing || signedUrls.length === 0;
  const currentUrl = signedUrls[selectedIndex];

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
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left — Image */}
        <div className="relative w-full md:w-[60%] h-[45vh] md:h-full flex items-center justify-center p-6 md:p-12">
          {isLoading && count > 0 ? (
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
              {/* Nav arrows */}
              {signedUrls.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedIndex((i) => (i > 0 ? i - 1 : signedUrls.length - 1))}
                    className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-background/80 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedIndex((i) => (i < signedUrls.length - 1 ? i + 1 : 0))}
                    className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-background/80 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </>
          ) : null}
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
                Workflow
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground leading-tight">
                {title}
              </h2>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                  {count} {count === 1 ? 'image' : 'images'}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                  · {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Thumbnail grid */}
            {count > 1 && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
                  Images
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(isLoading ? Array.from({ length: count }) : signedUrls).map((item, i) => (
                    <button
                      key={i}
                      onClick={() => !isLoading && setSelectedIndex(i)}
                      className={cn(
                        'aspect-square rounded-lg overflow-hidden border-2 transition-all',
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
            <Button
              onClick={handleDownloadCurrent}
              disabled={isLoading}
              className="w-full h-12 rounded-xl text-sm font-medium shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-shadow duration-300"
            >
              <Download className="w-4 h-4 mr-2" /> Download Image
            </Button>

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
    </div>
  );
}
