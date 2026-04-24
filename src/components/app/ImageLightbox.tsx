import { useEffect, useCallback, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Download, RefreshCw, X, Check, Trash2, ClipboardCopy, Trophy } from 'lucide-react';

import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  open: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onSelect?: (index: number) => void;
  onRegenerate?: (index: number) => void;
  onDownload?: (index: number) => void;
  onDelete?: (index: number) => void;
  onCopyPrompt?: (index: number) => void;
  onShare?: (index: number) => void;
  selectedIndices?: Set<number>;
  productName?: string;
}

export function ImageLightbox({
  images,
  currentIndex,
  open,
  onClose,
  onNavigate,
  onSelect,
  onRegenerate,
  onDownload,
  onDelete,
  onCopyPrompt,
  onShare,
  selectedIndices = new Set(),
  productName,
}: ImageLightboxProps) {
  const currentImage = images[currentIndex];
  const isSelected = selectedIndices.has(currentIndex);
  const isMobile = useIsMobile();

  const handlePrevious = useCallback(() => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onNavigate(newIndex);
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onNavigate(newIndex);
  }, [currentIndex, images.length, onNavigate]);

  // Per-action handlers — memoized so the action-bar buttons don't churn
  // closures on every parent render.
  const handleSelect = useCallback(() => onSelect?.(currentIndex), [onSelect, currentIndex]);
  const handleDownload = useCallback(() => onDownload?.(currentIndex), [onDownload, currentIndex]);
  const handleRegenerate = useCallback(() => onRegenerate?.(currentIndex), [onRegenerate, currentIndex]);
  const handleCopyPrompt = useCallback(() => onCopyPrompt?.(currentIndex), [onCopyPrompt, currentIndex]);
  const handleDelete = useCallback(() => onDelete?.(currentIndex), [onDelete, currentIndex]);
  const handleShare = useCallback(() => onShare?.(currentIndex), [onShare, currentIndex]);

  // Track image load so we can crossfade between slides instead of blanking.
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const prevSrcRef = useRef<string | null>(null);
  useEffect(() => {
    if (currentImage && currentImage === loadedSrc) prevSrcRef.current = currentImage;
  }, [currentImage, loadedSrc]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, handlePrevious, handleNext, onClose]);

  if (!open) return null;

  const counter = productName
    ? `${currentIndex + 1} / ${images.length} · ${productName}`
    : `${currentIndex + 1} / ${images.length}`;

  const iconBtnClass = 'w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white transition-colors';
  const deleteBtnClass = 'w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/70 text-sm font-medium tabular-nums">
          {counter}
        </div>
      )}

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 z-50 rounded-full bg-white/20 border border-white/20 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-white/30 transition-colors',
              isMobile ? 'w-10 h-10' : 'w-12 h-12 left-4'
            )}
          >
            <ChevronLeft className={isMobile ? 'w-5 h-5' : 'w-6 h-6'} />
          </button>
          <button
            onClick={handleNext}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 z-50 rounded-full bg-white/20 border border-white/20 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-white/30 transition-colors',
              isMobile ? 'w-10 h-10' : 'w-12 h-12 right-4'
            )}
          >
            <ChevronRight className={isMobile ? 'w-5 h-5' : 'w-6 h-6'} />
          </button>
        </>
      )}

      {/* Main image + actions */}
      <div className={cn(
        'relative z-10 flex flex-col items-center animate-in zoom-in-95 fade-in duration-200 overflow-hidden pt-14',
        isMobile ? 'max-w-[94vw] max-h-[90vh] px-1' : 'max-w-[90vw] max-h-[85vh]'
      )}>
        <div
          className={cn(
            'relative flex items-center justify-center rounded-xl overflow-hidden shadow-2xl shadow-black/40',
            isMobile ? 'max-h-[60vh]' : 'max-h-[75vh]',
          )}
          style={{ minHeight: isMobile ? '40vh' : '50vh' }}
        >
          {/* Previous slide stays mounted underneath until the next one decodes */}
          {prevSrcRef.current && prevSrcRef.current !== currentImage && (
            <img
              src={prevSrcRef.current}
              alt=""
              aria-hidden
              className={cn(
                'absolute inset-0 m-auto max-w-full w-auto h-auto object-contain rounded-xl',
                isMobile ? 'max-h-[60vh]' : 'max-h-[75vh]',
              )}
            />
          )}
          <img
            key={currentImage}
            src={currentImage}
            alt={`Generated image ${currentIndex + 1}`}
            decoding="async"
            // @ts-expect-error fetchpriority is a valid HTML attribute
            fetchpriority="high"
            onLoad={() => setLoadedSrc(currentImage)}
            className={cn(
              'relative max-w-full w-auto h-auto object-contain rounded-xl transition-opacity duration-200',
              isMobile ? 'max-h-[60vh]' : 'max-h-[75vh]',
              loadedSrc === currentImage ? 'opacity-100' : 'opacity-0',
            )}
          />
        </div>

        {/* Action bar */}
        {isMobile ? (
          /* ── Mobile: single icon-only row ── */
          <div className="flex items-center justify-center gap-3 mt-4">
            {onSelect && (
              <button
                onClick={handleSelect}
                className={cn(
                  iconBtnClass,
                  isSelected && 'bg-primary text-primary-foreground hover:bg-primary/80'
                )}
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            {onDownload && (
              <button onClick={handleDownload} className={iconBtnClass}>
                <Download className="w-4 h-4" />
              </button>
            )}
            {onCopyPrompt && (
              <button onClick={handleCopyPrompt} className={iconBtnClass}>
                <ClipboardCopy className="w-4 h-4" />
              </button>
            )}
            {onRegenerate && (
              <button onClick={handleRegenerate} className={iconBtnClass}>
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            {onShare && (
              <button onClick={handleShare} className={iconBtnClass}>
                <Trophy className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button onClick={handleDelete} className={deleteBtnClass}>
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          /* ── Desktop: original horizontal bar with labels ── */
          <TooltipProvider delayDuration={300}>
            <div className="flex items-center gap-2 mt-5">
              {onSelect && (
                <button
                  onClick={handleSelect}
                  className={cn(
                    'flex items-center gap-2 h-10 px-5 rounded-full text-sm font-medium transition-colors backdrop-blur-md',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                  )}
                >
                  {isSelected ? <Check className="w-4 h-4" /> : null}
                  {isSelected ? 'Selected' : 'Select'}
                </button>
              )}
              {onDownload && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 h-10 px-5 rounded-full text-sm font-medium bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors backdrop-blur-md"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              )}
              {onRegenerate && (
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-2 h-10 px-5 rounded-full text-sm font-medium bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors backdrop-blur-md"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </button>
              )}
              {onCopyPrompt && (
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-2 h-10 px-5 rounded-full text-sm font-medium bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors backdrop-blur-md"
                >
                  <ClipboardCopy className="w-4 h-4" />
                  Copy Prompt
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 h-10 px-5 rounded-full text-sm font-medium bg-white/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors backdrop-blur-md"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
              {onShare && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 h-10 px-5 rounded-full text-sm font-medium bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors backdrop-blur-md"
                    >
                      <Trophy className="w-4 h-4" />
                      Share
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-sm">
                    Win up to 10,000 credits each month
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        )}
      </div>
    </div>,
    document.body
  );
}