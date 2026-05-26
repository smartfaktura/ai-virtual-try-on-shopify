import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Download, X, Sparkles, Layers, Video, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Button } from '@/components/ui/button';
import { saveOrShareImage, isMobileDevice } from '@/lib/mobileImageSave';
import { UpscaleModal } from '@/components/app/UpscaleModal';

export interface ResultDetailItem {
  url: string;
  productName: string;
  sceneName: string;
  aspectRatio?: string;
  jobId?: string;
}

interface ResultDetailModalProps {
  open: boolean;
  onClose: () => void;
  items: ResultDetailItem[];
  initialIndex: number;
}

const RATIO_MAP: Record<string, string> = {
  '1:1': '1 / 1', '3:4': '3 / 4', '4:3': '4 / 3',
  '4:5': '4 / 5', '5:4': '5 / 4', '9:16': '9 / 16', '16:9': '16 / 9',
  '2:3': '2 / 3', '3:2': '3 / 2',
};

export function ResultDetailModal({ open, onClose, items, initialIndex }: ResultDetailModalProps) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(initialIndex);
  const [upscaleOpen, setUpscaleOpen] = useState(false);

  useEffect(() => { if (open) setIndex(initialIndex); }, [open, initialIndex]);

  const hasMultiple = items.length > 1;
  const active = items[index];

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : items.length - 1));
  }, [items.length]);
  const goNext = useCallback(() => {
    setIndex((i) => (i < items.length - 1 ? i + 1 : 0));
  }, [items.length]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (hasMultiple && e.key === 'ArrowLeft') goPrev();
      if (hasMultiple && e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, hasMultiple, goPrev, goNext]);

  if (!open || !active) return null;

  const ar = (active.aspectRatio && RATIO_MAP[active.aspectRatio]) || '4 / 5';

  const handleDownload = async () => {
    const safeProd = active.productName.replace(/[^a-zA-Z0-9À-ÿ _-]/g, '').replace(/\s+/g, '_');
    const safeScene = active.sceneName.replace(/[^a-zA-Z0-9À-ÿ _-]/g, '').replace(/\s+/g, '_');
    await saveOrShareImage(active.url, `${safeProd}_${safeScene}`);
  };

  return createPortal(
    <>
      <div
        className="fixed top-0 left-0 right-0 bottom-0 z-[200] animate-in fade-in duration-200"
        style={{ margin: 0, padding: 0 }}
        onClick={onClose}
      >
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/90" />

        <div
          className="fixed top-0 left-0 right-0 bottom-0 z-10 flex flex-col md:flex-row"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image */}
          <div className="relative w-full md:w-[60%] h-[45vh] md:h-full flex items-center justify-center p-6 md:p-12 group/img">
            <ShimmerImage
              src={active.url}
              alt={`${active.productName} — ${active.sceneName}`}
              aspectRatio={ar}
              className="w-full h-full object-contain rounded-lg shadow-2xl"
              wrapperClassName="max-w-full max-h-[calc(45vh-2rem)] md:max-h-[calc(100vh-6rem)] flex items-center justify-center"
              wrapperStyle={{ aspectRatio: ar, width: 'auto', height: 'auto' }}
              fetchPriority="high"
            />

            {hasMultiple && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/20 dark:bg-white/15 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:bg-black/30 dark:hover:bg-white/25 hover:text-white transition-all md:opacity-0 md:group-hover/img:opacity-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/20 dark:bg-white/15 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:bg-black/30 dark:hover:bg-white/25 hover:text-white transition-all md:opacity-0 md:group-hover/img:opacity-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Info panel */}
          <div className="relative w-full md:w-[40%] h-[55vh] md:h-full overflow-y-auto bg-background/95 backdrop-blur-xl border-l border-border/20">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 text-foreground/70 hover:text-foreground transition-colors"
            >
              <X className="w-7 h-7" strokeWidth={2} />
            </button>

            <div className="flex flex-col gap-6 p-6 md:p-8 lg:p-10 pt-8 md:pt-10">
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                  Product Visuals
                </p>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground leading-tight">
                  {active.productName}
                </h2>
                {active.sceneName && (
                  <p className="text-sm text-muted-foreground">{active.sceneName}</p>
                )}
              </div>

              <div className="space-y-2.5 pt-2">
                <Button
                  onClick={handleDownload}
                  size="pill"
                  className="w-full font-medium shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-shadow duration-300"
                >
                  <Download className="w-4 h-4 mr-2" /> {isMobileDevice() ? 'Save to Photos' : 'Download Image'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    navigate(`/app/freestyle?editImage=${encodeURIComponent(active.url)}&imageRole=edit`);
                    onClose();
                  }}
                  className="w-full font-medium"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Image
                </Button>

                {active.jobId && (
                  <Button
                    variant="outline"
                    onClick={() => setUpscaleOpen(true)}
                    className="w-full font-medium"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Enhance to 2K / 4K
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => {
                    navigate(`/app/perspectives?source=${encodeURIComponent(active.url)}`);
                    onClose();
                  }}
                  className="w-full font-medium"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Generate More Angles
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    navigate(`/app/video/animate?imageUrl=${encodeURIComponent(active.url)}`);
                    onClose();
                  }}
                  className="w-full font-medium"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Generate Video
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {upscaleOpen && active.jobId && (
        <UpscaleModal
          open={upscaleOpen}
          onClose={() => setUpscaleOpen(false)}
          items={[{ imageUrl: active.url, sourceType: 'generation', sourceId: active.jobId }]}
          onComplete={() => setUpscaleOpen(false)}
        />
      )}
    </>,
    document.body
  );
}

export default ResultDetailModal;
