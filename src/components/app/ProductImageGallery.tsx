import { useCallback, useRef, useState } from 'react';
import { Star, X, Plus, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { useIsMobile } from '@/hooks/use-mobile';

interface ImageItem {
  id: string;
  src: string;
  file?: File;
  isPrimary: boolean;
}

interface ProductImageGalleryProps {
  images: ImageItem[];
  onSetPrimary: (id: string) => void;
  onRemove: (id: string) => void;
  onAddFiles: (files: File[]) => void;
  onReorder?: (images: ImageItem[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ProductImageGallery({
  images,
  onSetPrimary,
  onRemove,
  onAddFiles,
  onReorder,
  maxImages = 6,
  disabled = false,
}: ProductImageGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length) onAddFiles(files);
      if (inputRef.current) inputRef.current.value = '';
    },
    [onAddFiles]
  );

  // Desktop drag handlers
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    if (disabled || isMobile) return;
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    const ghost = document.createElement('div');
    ghost.style.opacity = '0';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setOverIdx(idx);
  };

  const handleDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx || !onReorder) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }
    const reordered = [...images];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, moved);
    const withPrimary = reordered.map((img, i) => ({
      ...img,
      isPrimary: i === 0,
    }));
    onReorder(withPrimary);
    setDragIdx(null);
    setOverIdx(null);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setOverIdx(null);
  };

  // Mobile tap-to-reorder
  const moveImage = (idx: number, direction: -1 | 1) => {
    if (!onReorder || disabled) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    const reordered = [...images];
    [reordered[idx], reordered[targetIdx]] = [reordered[targetIdx], reordered[idx]];
    const withPrimary = reordered.map((img, i) => ({
      ...img,
      isPrimary: i === 0,
    }));
    onReorder(withPrimary);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1">
      {images.map((img, idx) => (
        <div
          key={img.id}
          draggable={!disabled && !isMobile && !!onReorder}
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDrop={(e) => handleDrop(e, idx)}
          onDragEnd={handleDragEnd}
          className={cn(
            'group relative shrink-0 rounded-xl overflow-hidden border transition-all duration-200',
            'w-[72px] h-[72px] sm:w-24 sm:h-24',
            img.isPrimary
              ? 'border-primary shadow-md ring-1 ring-primary/20'
              : 'border-border hover:border-muted-foreground/30',
            dragIdx === idx && 'opacity-40 scale-95',
            overIdx === idx && dragIdx !== null && dragIdx !== idx && 'ring-2 ring-primary/40'
          )}
        >
          {/* Drag handle - desktop only */}
          {!disabled && !isMobile && onReorder && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-70 transition-opacity pointer-events-none">
              <GripVertical className="w-4 h-4 text-white drop-shadow-md" />
            </div>
          )}

          <ShimmerImage
            src={img.src}
            alt="Product"
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            aspectRatio="1/1"
          />

          {/* Primary star */}
          <button
            type="button"
            onClick={() => onSetPrimary(img.id)}
            disabled={disabled}
            className={cn(
              'absolute top-1 left-1 rounded-full p-[3px] transition-all duration-150',
              img.isPrimary
                ? 'bg-primary text-primary-foreground shadow-sm'
                : cn(
                    'bg-black/25 text-white/70 backdrop-blur-sm',
                    isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  )
            )}
          >
            <Star className="w-3 h-3" fill={img.isPrimary ? 'currentColor' : 'none'} />
          </button>

          {/* Remove button */}
          {!disabled && (
            <button
              type="button"
              onClick={() => onRemove(img.id)}
              className={cn(
                'absolute top-1 right-1 bg-black/25 text-white/70 backdrop-blur-sm rounded-full p-[3px] hover:bg-destructive hover:text-destructive-foreground transition-all duration-150',
                isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              )}
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Mobile reorder arrows */}
          {isMobile && !disabled && onReorder && images.length > 1 && (
            <div className="absolute bottom-0 inset-x-0 flex">
              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => moveImage(idx, -1)}
                  className="flex-1 bg-black/40 backdrop-blur-sm text-white flex items-center justify-center py-1"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
              )}
              {idx < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => moveImage(idx, 1)}
                  className="flex-1 bg-black/40 backdrop-blur-sm text-white flex items-center justify-center py-1"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Primary label - desktop only (on mobile the arrows take bottom space) */}
          {img.isPrimary && !isMobile && (
            <div className="absolute bottom-0 inset-x-0 bg-primary/80 backdrop-blur-sm text-primary-foreground text-[9px] font-semibold text-center py-[2px] uppercase tracking-wider">
              Cover
            </div>
          )}
        </div>
      ))}

      {/* Add more button */}
      {canAddMore && !disabled && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="shrink-0 w-[72px] h-[72px] sm:w-24 sm:h-24 rounded-xl border border-dashed border-border bg-muted/30 hover:bg-muted/60 hover:border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-all duration-200"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[10px] sm:text-[11px] font-medium">Add</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
