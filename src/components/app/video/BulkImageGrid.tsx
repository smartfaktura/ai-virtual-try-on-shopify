import React, { useRef } from 'react';
import { X, Plus, Sparkles, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export interface BulkImage {
  id: string;
  file?: File;
  url: string | null;
  preview: string;
  isUploading?: boolean;
  uploadProgress?: number;
}

interface BulkImageGridProps {
  images: BulkImage[];
  maxImages?: number;
  onAddFiles: (files: File[]) => void;
  onRemoveImage: (id: string) => void;
  analyzedIndex?: number;
  disabled?: boolean;
}

export function BulkImageGrid({
  images,
  maxImages = 10,
  onAddFiles,
  onRemoveImage,
  analyzedIndex = 0,
  disabled = false,
}: BulkImageGridProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) onAddFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const canAdd = images.length < maxImages && !disabled;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Images ({images.length}/{maxImages})
        </label>
        {images.length > 1 && (
          <span className="text-xs text-muted-foreground">
            First image is analyzed — settings applied to all
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {images.map((img, idx) => (
          <div
            key={img.id}
            className={cn(
              'relative aspect-square rounded-lg overflow-hidden border bg-muted/20 group',
              idx === analyzedIndex
                ? 'border-primary ring-1 ring-primary/30'
                : 'border-border'
            )}
          >
            <img
              src={img.preview}
              alt={`Image ${idx + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Analyzed badge on first image */}
            {idx === analyzedIndex && images.length > 1 && (
              <div className="absolute top-1 left-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/90 text-primary-foreground text-[9px] font-medium">
                <Sparkles className="h-2.5 w-2.5" />
                Analyzed
              </div>
            )}

            {/* Upload progress */}
            {img.isUploading && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                <Progress value={img.uploadProgress || 0} className="h-1 w-3/4" />
              </div>
            )}

            {/* Remove button */}
            {!disabled && !img.isUploading && (
              <button
                onClick={() => onRemoveImage(img.id)}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}

        {/* Add more button */}
        {canAdd && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-5 w-5" />
            <span className="text-[10px]">Add</span>
          </button>
        )}
      </div>
    </div>
  );
}
