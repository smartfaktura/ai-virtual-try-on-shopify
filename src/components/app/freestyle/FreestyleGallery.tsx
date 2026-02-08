import { Download, Expand, Trash2, Wand2 } from 'lucide-react';

interface GalleryImage {
  id: string;
  url: string;
  prompt: string;
  aspectRatio?: string;
}

interface FreestyleGalleryProps {
  images: GalleryImage[];
  onDownload: (imageUrl: string, index: number) => void;
  onExpand: (index: number) => void;
  onDelete?: (imageId: string) => void;
}

export function FreestyleGallery({ images, onDownload, onExpand, onDelete }: FreestyleGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-24 h-24 rounded-3xl bg-muted/50 border border-border/50 flex items-center justify-center mb-6">
          <Wand2 className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <h2 className="text-2xl font-light tracking-tight text-foreground/80 mb-3">
          Freestyle Studio
        </h2>
        <p className="text-sm text-muted-foreground/60 max-w-sm leading-relaxed">
          Describe what you want to create, attach a reference, pick a model or scene — your creations appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="columns-2 lg:columns-3 gap-[2px]">
      {images.map((img, idx) => (
        <div
          key={img.id}
          className="group relative break-inside-avoid mb-[2px] overflow-hidden animate-fade-in bg-muted/30"
        >
          <img
            src={img.url}
            alt={`Generated ${idx + 1}`}
            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Hover actions */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            {/* Delete — left side */}
            {onDelete && (
              <button
                onClick={() => onDelete(img.id)}
                className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Download + Expand — right side */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => onDownload(img.url, idx)}
                className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => onExpand(idx)}
                className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-colors"
              >
                <Expand className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
