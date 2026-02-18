import { useCallback, useRef, useState } from 'react';
import { Star, X, Plus, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShimmerImage } from '@/components/ui/shimmer-image';

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

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length) onAddFiles(files);
      if (inputRef.current) inputRef.current.value = '';
    },
    [onAddFiles]
  );

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    if (disabled) return;
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    // Use a transparent image so the default ghost is minimal
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
    // First position is always primary
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

  const canAddMore = images.length < maxImages;

  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {images.map((img, idx) => (
        <div
          key={img.id}
          draggable={!disabled && !!onReorder}
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDrop={(e) => handleDrop(e, idx)}
          onDragEnd={handleDragEnd}
          className={cn(
            'group relative shrink-0 w-24 h-24 rounded-xl overflow-hidden border transition-all duration-200',
            img.isPrimary
              ? 'border-primary shadow-md ring-1 ring-primary/20'
              : 'border-border hover:border-muted-foreground/30',
            dragIdx === idx && 'opacity-40 scale-95',
            overIdx === idx && dragIdx !== null && dragIdx !== idx && 'ring-2 ring-primary/40'
          )}
        >
          {/* Drag handle */}
          {!disabled && onReorder && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-70 transition-opacity pointer-events-none">
              <GripVertical className="w-4 h-4 text-white drop-shadow-md" />
            </div>
          )}

          {/* Image with inner zoom — no overflow */}
           <ShimmerImage
             src={img.src}
             alt="Product"
             className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
             aspectRatio="1/1"
           />

          {/* Primary star — small, tucked in corner */}
          <button
            type="button"
            onClick={() => onSetPrimary(img.id)}
            disabled={disabled}
            className={cn(
              'absolute top-1 left-1 rounded-full p-[3px] transition-all duration-150',
              img.isPrimary
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-black/25 text-white/70 backdrop-blur-sm opacity-0 group-hover:opacity-100'
            )}
          >
            <Star className="w-3 h-3" fill={img.isPrimary ? 'currentColor' : 'none'} />
          </button>

          {/* Remove — small, tucked in corner */}
          {!disabled && (
            <button
              type="button"
              onClick={() => onRemove(img.id)}
              className="absolute top-1 right-1 bg-black/25 text-white/70 backdrop-blur-sm rounded-full p-[3px] opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all duration-150"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Primary label at bottom */}
          {img.isPrimary && (
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
          className="shrink-0 w-24 h-24 rounded-xl border border-dashed border-border bg-muted/30 hover:bg-muted/60 hover:border-muted-foreground/30 flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span className="text-[11px] font-medium">Add</span>
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
