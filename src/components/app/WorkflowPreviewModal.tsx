import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Loader2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { toSignedUrls } from '@/lib/signedUrl';
import { downloadDropAsZip, downloadSingleImage } from '@/lib/dropDownload';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

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

  // Keyboard navigation
  useEffect(() => {
    if (!open || signedUrls.length <= 1) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setSelectedIndex((i) => (i > 0 ? i - 1 : signedUrls.length - 1));
      else if (e.key === 'ArrowRight') setSelectedIndex((i) => (i < signedUrls.length - 1 ? i + 1 : 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, signedUrls.length]);

  const handleDownloadAll = useCallback(async () => {
    if (signedUrls.length === 0) return;
    setDownloading(true);
    setDownloadPct(0);
    try {
      if (signedUrls.length === 1) {
        await downloadSingleImage(signedUrls[0], `${title.replace(/\s+/g, '_')}.jpg`);
      } else {
        const images = signedUrls.map((url, i) => ({
          url,
          workflow_name: title,
          scene_name: `image_${i + 1}`,
        }));
        await downloadDropAsZip(images, title, (pct) => setDownloadPct(pct));
      }
    } finally {
      setDownloading(false);
    }
  }, [signedUrls, title]);

  const handleDownloadCurrent = useCallback(() => {
    const url = signedUrls[selectedIndex];
    if (url) downloadSingleImage(url, `${title.replace(/\s+/g, '_')}_${selectedIndex + 1}.jpg`);
  }, [signedUrls, selectedIndex, title]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedIndex(0);
      setDownloading(false);
      setDownloadPct(0);
    }
  }, [open]);

  const isLoading = signing || signedUrls.length === 0;
  const currentUrl = signedUrls[selectedIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-base">{title}</DialogTitle>
          {job && (
            <DialogDescription className="text-xs">
              {count} {count === 1 ? 'image' : 'images'} ·{' '}
              {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Split-screen body */}
        <div className="flex-1 min-h-0 flex flex-col sm:flex-row px-5 gap-3">
          {/* Large preview */}
          <div className="flex-1 min-h-0 flex items-center justify-center relative rounded-xl overflow-hidden bg-muted/30 border border-border">
            {isLoading && count > 0 ? (
              <div className="w-full h-full min-h-[240px] bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%] animate-shimmer" />
            ) : currentUrl ? (
              <>
                <ShimmerImage
                  key={selectedIndex}
                  src={getOptimizedUrl(currentUrl, { quality: 85 })}
                  alt={`Result ${selectedIndex + 1}`}
                  className="max-w-full max-h-[55vh] sm:max-h-[60vh] object-contain"
                  wrapperClassName="flex items-center justify-center w-full h-full min-h-[240px]"
                />
                {/* Nav arrows on desktop */}
                {signedUrls.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedIndex((i) => (i > 0 ? i - 1 : signedUrls.length - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-background/90 transition-colors hidden sm:flex"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedIndex((i) => (i < signedUrls.length - 1 ? i + 1 : 0))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-background/90 transition-colors hidden sm:flex"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
                {/* Download current button overlay */}
                <button
                  onClick={handleDownloadCurrent}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-background/90 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </>
            ) : null}
          </div>

          {/* Thumbnails — vertical column on desktop, horizontal strip on mobile */}
          {count > 1 && (
            <div className="sm:w-[160px] shrink-0">
              {/* Mobile: horizontal scroll */}
              <div className="flex sm:hidden gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {(isLoading ? Array.from({ length: count }) : signedUrls).map((item, i) => (
                  <button
                    key={i}
                    onClick={() => !isLoading && setSelectedIndex(i)}
                    className={cn(
                      'shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all min-h-[44px]',
                      !isLoading && selectedIndex === i
                        ? 'border-primary ring-1 ring-primary/30'
                        : 'border-border hover:border-primary/40'
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

              {/* Desktop: vertical scroll */}
              <div className="hidden sm:grid grid-cols-2 gap-2 overflow-y-auto max-h-[60vh] pr-1">
                {(isLoading ? Array.from({ length: count }) : signedUrls).map((item, i) => (
                  <button
                    key={i}
                    onClick={() => !isLoading && setSelectedIndex(i)}
                    className={cn(
                      'aspect-square rounded-lg overflow-hidden border-2 transition-all',
                      !isLoading && selectedIndex === i
                        ? 'border-primary ring-1 ring-primary/30'
                        : 'border-border hover:border-primary/40'
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
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs min-h-[44px] rounded-xl"
            onClick={() => {
              onOpenChange(false);
              navigate('/app/library');
            }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View in Library
          </Button>

          <Button
            size="sm"
            className="gap-1.5 text-xs min-h-[44px] rounded-xl"
            disabled={isLoading || downloading}
            onClick={handleDownloadAll}
          >
            {downloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {count > 1 ? `${downloadPct}%` : 'Downloading…'}
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                {count > 1 ? `Download All (${count})` : 'Download'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
