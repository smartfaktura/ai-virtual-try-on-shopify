import { useCallback, useRef } from 'react';
import { Star, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  maxImages?: number;
  disabled?: boolean;
}

export function ProductImageGallery({
  images,
  onSetPrimary,
  onRemove,
  onAddFiles,
  maxImages = 6,
  disabled = false,
}: ProductImageGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length) onAddFiles(files);
      if (inputRef.current) inputRef.current.value = '';
    },
    [onAddFiles]
  );

  const canAddMore = images.length < maxImages;

  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {images.map((img) => (
        <div
          key={img.id}
          className={cn(
            'group relative shrink-0 w-24 h-24 rounded-xl overflow-hidden border transition-all duration-200',
            img.isPrimary
              ? 'border-primary shadow-md ring-1 ring-primary/20'
              : 'border-border hover:border-muted-foreground/30'
          )}
        >
          {/* Image with inner zoom — no overflow */}
          <img
            src={img.src}
            alt="Product"
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
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
