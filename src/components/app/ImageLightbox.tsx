import { useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Download, RefreshCw, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  open: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onSelect?: (index: number) => void;
  onRegenerate?: (index: number) => void;
  onDownload?: (index: number) => void;
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
  selectedIndices = new Set(),
  productName,
}: ImageLightboxProps) {
  const currentImage = images[currentIndex];
  const isSelected = selectedIndices.has(currentIndex);

  const handlePrevious = useCallback(() => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onNavigate(newIndex);
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onNavigate(newIndex);
  }, [currentIndex, images.length, onNavigate]);

  // Global keyboard handler
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

  return (
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
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Main image */}
      <div className="relative z-10 flex flex-col items-center max-w-[90vw] max-h-[90vh] animate-in zoom-in-95 fade-in duration-200">
        <img
          src={currentImage}
          alt={`Generated image ${currentIndex + 1}`}
          className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl shadow-black/40"
        />

        {/* Bottom action bar */}
        <div className="flex items-center gap-2 mt-5">
          {onSelect && (
            <button
              onClick={() => onSelect(currentIndex)}
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
              onClick={() => onDownload(currentIndex)}
              className="flex items-center gap-2 h-10 px-5 rounded-full text-sm font-medium bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors backdrop-blur-md"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          )}
          {onRegenerate && (
            <button
              onClick={() => onRegenerate(currentIndex)}
              className="flex items-center gap-2 h-10 px-5 rounded-full text-sm font-medium bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors backdrop-blur-md"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
          )}
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 flex gap-2 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md overflow-x-auto max-w-[80vw]">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(idx)}
              className={cn(
                'w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 ring-2',
                idx === currentIndex
                  ? 'ring-white scale-105'
                  : 'ring-transparent opacity-50 hover:opacity-80'
              )}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
