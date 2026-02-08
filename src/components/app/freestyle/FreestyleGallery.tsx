import { Download, Expand, Trash2, Wand2, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
  onCopyPrompt?: (prompt: string) => void;
}

function ImageCard({
  img,
  idx,
  onDownload,
  onExpand,
  onDelete,
  onCopyPrompt,
  className,
  natural,
}: {
  img: GalleryImage;
  idx: number;
  onDownload: (imageUrl: string, index: number) => void;
  onExpand: (index: number) => void;
  onDelete?: (imageId: string) => void;
  onCopyPrompt?: (prompt: string) => void;
  className?: string;
  natural?: boolean;
}) {
  const actionButtons = (
    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
      <div className="flex items-center gap-2">
        {onDelete && (
          <button
            onClick={() => onDelete(img.id)}
            className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        {onCopyPrompt && (
          <button
            onClick={() => {
              onCopyPrompt(img.prompt);
              toast.success('Prompt copied to editor');
            }}
            className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-colors"
            title="Copy prompt to editor"
          >
            <Copy className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
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
  );

  if (natural) {
    return (
      <div className={cn('group relative inline-block animate-fade-in', className)}>
        <img
          src={img.url}
          alt={`Generated ${idx + 1}`}
          className="w-auto h-auto max-h-[calc(100vh-400px)] rounded-xl shadow-md shadow-black/20"
          loading="lazy"
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        {actionButtons}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl animate-fade-in shadow-md shadow-black/20',
        className,
      )}
    >
      <img
        src={img.url}
        alt={`Generated ${idx + 1}`}
        className="w-full h-auto object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      {actionButtons}
    </div>
  );
}

export function FreestyleGallery({ images, onDownload, onExpand, onDelete, onCopyPrompt }: FreestyleGalleryProps) {
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

  const count = images.length;

  if (count <= 3) {
    return (
      <div className="flex items-start justify-center gap-3 px-6 pt-6">
        {images.map((img, idx) => (
          <ImageCard
            key={img.id}
            img={img}
            idx={idx}
            onDownload={onDownload}
            onExpand={onExpand}
            onDelete={onDelete}
            onCopyPrompt={onCopyPrompt}
            natural
          />
        ))}
      </div>
    );
  }

  return (
    <div className="columns-2 lg:columns-3 gap-1 p-1 pb-4">
      {images.map((img, idx) => (
        <ImageCard
          key={img.id}
          img={img}
          idx={idx}
          onDownload={onDownload}
          onExpand={onExpand}
          onDelete={onDelete}
          onCopyPrompt={onCopyPrompt}
          className="mb-1"
        />
      ))}
    </div>
  );
}
