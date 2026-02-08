import { Download, Expand, Trash2, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

function ImageCard({
  img,
  idx,
  onDownload,
  onExpand,
  onDelete,
  className,
}: {
  img: GalleryImage;
  idx: number;
  onDownload: (imageUrl: string, index: number) => void;
  onExpand: (index: number) => void;
  onDelete?: (imageId: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg animate-fade-in shadow-md shadow-black/20',
        className,
      )}
    >
      <img
        src={img.url}
        alt={`Generated ${idx + 1}`}
        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Prompt caption */}
      <p className="absolute bottom-12 left-3 right-3 text-[11px] text-white/70 line-clamp-2 leading-snug opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {img.prompt}
      </p>

      {/* Hover actions */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
        {onDelete && (
          <button
            onClick={() => onDelete(img.id)}
            className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
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
  );
}

export function FreestyleGallery({ images, onDownload, onExpand, onDelete }: FreestyleGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <Wand2 className="w-10 h-10 text-white/20" />
        </div>
        <h2 className="text-2xl font-light tracking-tight text-white/80 mb-3">
          Freestyle Studio
        </h2>
        <p className="text-sm text-white/40 max-w-sm leading-relaxed">
          Describe what you want to create, attach a reference, pick a model or scene — your creations appear here.
        </p>
      </div>
    );
  }

  const count = images.length;

  // Adaptive layout: centered for 1-3 images, masonry for 4+
  if (count <= 3) {
    return (
      <div className="flex items-center justify-center h-full px-6">
        <div
          className={cn(
            'flex gap-3 items-start justify-center',
            count === 1 && 'max-w-lg w-full',
            count === 2 && 'max-w-3xl w-full',
            count === 3 && 'max-w-4xl w-full',
          )}
        >
          {images.map((img, idx) => (
            <ImageCard
              key={img.id}
              img={img}
              idx={idx}
              onDownload={onDownload}
              onExpand={onExpand}
              onDelete={onDelete}
              className={cn(
                count === 1 && 'w-full',
                count >= 2 && 'flex-1 min-w-0',
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="columns-2 lg:columns-3 gap-1 p-1">
      {images.map((img, idx) => (
        <ImageCard
          key={img.id}
          img={img}
          idx={idx}
          onDownload={onDownload}
          onExpand={onExpand}
          onDelete={onDelete}
          className="mb-1"
        />
      ))}
    </div>
  );
}
