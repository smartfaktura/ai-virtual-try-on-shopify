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

  const primaryImage = images.find((img) => img.isPrimary) || images[0];
  const secondaryImages = images.filter((img) => img.id !== primaryImage?.id);

  // Desktop drag handlers for secondary strip
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
  const moveImage = (fromId: string, direction: -1 | 1) => {
    if (!onReorder || disabled) return;
    const idx = images.findIndex((img) => img.id === fromId);
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

  if (!primaryImage) {
    // No images — just show Add button
    return (
      <div className="flex items-center justify-center">
        {canAddMore && !disabled && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-[140px] h-[140px] rounded-2xl border border-dashed border-border bg-muted/30 hover:bg-muted/60 hover:border-muted-foreground/30 flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs font-medium">Add Image</span>
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

  return (
    <div className="flex gap-3">
      {/* Primary / Cover Image — larger */}
      <div className="relative shrink-0 group">
        <div
          className={cn(
            'relative rounded-2xl overflow-hidden border-2 border-primary/30 shadow-sm transition-all duration-200',
            'w-[120px] h-[120px] sm:w-[140px] sm:h-[140px]'
          )}
        >
          <ShimmerImage
            src={primaryImage.src}
            alt="Primary product"
            className="w-full h-full object-cover"
            aspectRatio="1/1"
          />

          {/* Star badge */}
          <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
            <Star className="w-3 h-3" fill="currentColor" />
          </div>

          {/* Remove button */}
          {!disabled && (
            <button
              type="button"
              onClick={() => onRemove(primaryImage.id)}
              className={cn(
                'absolute top-1.5 right-1.5 bg-black/30 text-white/80 backdrop-blur-sm rounded-full p-1 hover:bg-destructive hover:text-destructive-foreground transition-all duration-150',
                isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              )}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Secondary strip + Add button */}
      <div className="flex flex-col gap-1.5 min-w-0 overflow-x-auto">
        <div className="flex gap-1.5 flex-wrap">
          {secondaryImages.map((img) => {
            const fullIdx = images.findIndex((i) => i.id === img.id);
            return (
              <div
                key={img.id}
                draggable={!disabled && !isMobile && !!onReorder}
                onDragStart={(e) => handleDragStart(e, fullIdx)}
                onDragOver={(e) => handleDragOver(e, fullIdx)}
                onDrop={(e) => handleDrop(e, fullIdx)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'group/thumb relative shrink-0 rounded-xl overflow-hidden border cursor-pointer transition-all duration-200',
                  'w-[56px] h-[56px] sm:w-[60px] sm:h-[60px]',
                  'border-border hover:border-muted-foreground/40',
                  dragIdx === fullIdx && 'opacity-40 scale-90',
                  overIdx === fullIdx && dragIdx !== null && dragIdx !== fullIdx && 'ring-2 ring-primary/40'
                )}
                onClick={() => onSetPrimary(img.id)}
              >
                {/* Drag handle */}
                {!disabled && !isMobile && onReorder && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/thumb:opacity-70 transition-opacity pointer-events-none">
                    <GripVertical className="w-3.5 h-3.5 text-white drop-shadow-md" />
                  </div>
                )}

                <ShimmerImage
                  src={img.src}
                  alt="Product"
                  className="w-full h-full object-cover transition-transform duration-200 group-hover/thumb:scale-110"
                  aspectRatio="1/1"
                />

                {/* Remove */}
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(img.id);
                    }}
                    className={cn(
                      'absolute top-0.5 right-0.5 bg-black/30 text-white/80 backdrop-blur-sm rounded-full p-[2px] hover:bg-destructive hover:text-destructive-foreground transition-all duration-150',
                      isMobile ? 'opacity-100' : 'opacity-0 group-hover/thumb:opacity-100'
                    )}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}

                {/* Mobile reorder */}
                {isMobile && !disabled && onReorder && images.length > 1 && (
                  <div className="absolute bottom-0 inset-x-0 flex">
                    {fullIdx > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveImage(img.id, -1);
                        }}
                        className="flex-1 bg-black/40 backdrop-blur-sm text-white flex items-center justify-center py-0.5"
                      >
                        <ChevronLeft className="w-2.5 h-2.5" />
                      </button>
                    )}
                    {fullIdx < images.length - 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveImage(img.id, 1);
                        }}
                        className="flex-1 bg-black/40 backdrop-blur-sm text-white flex items-center justify-center py-0.5"
                      >
                        <ChevronRight className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add more */}
          {canAddMore && !disabled && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="shrink-0 w-[56px] h-[56px] sm:w-[60px] sm:h-[60px] rounded-xl border border-dashed border-border bg-muted/30 hover:bg-muted/60 hover:border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

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
