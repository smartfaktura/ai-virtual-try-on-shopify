import { Download, Expand, Wand2 } from 'lucide-react';

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

interface FreestyleGalleryProps {
  images: GeneratedImage[];
  onDownload: (imageUrl: string, index: number) => void;
  onExpand: (index: number) => void;
}

export function FreestyleGallery({ images, onDownload, onExpand }: FreestyleGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-24 h-24 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
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
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-[2px] rounded-xl overflow-hidden">
      {images.map((img, idx) => (
        <div key={img.timestamp + idx} className="group relative overflow-hidden animate-fade-in bg-muted/30">
          <img
            src={img.url}
            alt={`Generated ${idx + 1}`}
            className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
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
      ))}
    </div>
  );
}
