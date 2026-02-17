import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Loader2, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { ImageLightbox } from '@/components/app/ImageLightbox';
import { toSignedUrls } from '@/lib/signedUrl';
import { downloadDropAsZip, downloadSingleImage } from '@/lib/dropDownload';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { formatDistanceToNow } from 'date-fns';

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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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

  const handleDownload = useCallback(async () => {
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

  const handleLightboxDownload = useCallback(
    (index: number) => {
      const url = signedUrls[index];
      if (url) downloadSingleImage(url, `${title.replace(/\s+/g, '_')}_${index + 1}.jpg`);
    },
    [signedUrls, title],
  );

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setLightboxIndex(null);
      setDownloading(false);
      setDownloadPct(0);
    }
  }, [open]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base">{title}</DialogTitle>
            {job && (
              <DialogDescription className="text-xs">
                {count} {count === 1 ? 'image' : 'images'} ·{' '}
                {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
              </DialogDescription>
            )}
          </DialogHeader>

          {/* Image grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto flex-1 min-h-0 py-2">
            {(signing || signedUrls.length === 0) && count > 0
              ? Array.from({ length: count }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                    <div className="w-full h-full bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%] animate-shimmer" />
                  </div>
                ))
              : signedUrls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxIndex(i)}
                    className="aspect-square rounded-lg overflow-hidden bg-muted border border-border hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer"
                  >
                    <ShimmerImage
                      src={getOptimizedUrl(url, { quality: 70 })}
                      alt={`Result ${i + 1}`}
                      aspectRatio="1/1"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => {
                onOpenChange(false);
                navigate('/app/library');
              }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View All in Library
            </Button>

            <Button
              size="sm"
              className="gap-1.5 text-xs"
              disabled={signing || signedUrls.length === 0 || downloading}
              onClick={handleDownload}
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

      {/* Lightbox */}
      <ImageLightbox
        images={signedUrls}
        currentIndex={lightboxIndex ?? 0}
        open={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
        onDownload={handleLightboxDownload}
      />
    </>
  );
}
