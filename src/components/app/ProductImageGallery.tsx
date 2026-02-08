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
    <div className="flex gap-2 overflow-x-auto pb-1">
      {images.map((img) => (
        <div
          key={img.id}
          className={cn(
            'relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors',
            img.isPrimary ? 'border-primary' : 'border-border'
          )}
        >
          <img
            src={img.src}
            alt="Product"
            className="w-full h-full object-cover"
          />
          {/* Primary star */}
          <button
            type="button"
            onClick={() => onSetPrimary(img.id)}
            disabled={disabled}
            className={cn(
              'absolute top-1 left-1 rounded-full p-0.5 transition-colors',
              img.isPrimary
                ? 'bg-primary text-primary-foreground'
                : 'bg-background/70 text-muted-foreground hover:bg-background hover:text-foreground'
            )}
          >
            <Star className="w-3 h-3" fill={img.isPrimary ? 'currentColor' : 'none'} />
          </button>
          {/* Remove */}
          {!disabled && (
            <button
              type="button"
              onClick={() => onRemove(img.id)}
              className="absolute top-1 right-1 bg-background/70 rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}

      {/* Add more button */}
      {canAddMore && !disabled && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="shrink-0 w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-muted-foreground/40 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-[10px]">Add</span>
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
