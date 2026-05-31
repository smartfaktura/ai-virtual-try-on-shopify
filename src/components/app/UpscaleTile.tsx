import { useState } from 'react';
import { CheckCircle, Download, Maximize2 } from 'lucide-react';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';

interface UpscaleTileProps {
  url: string;
  index: number;
  selected: boolean;
  onToggle: () => void;
  onView: () => void;
  onDownload: () => void;
}

/**
 * Upscale results tile: serves an optimized preview (quality-only re-encode)
 * inside a fixed 4:5 window with lazy loading. Falls back to the raw URL
 * if Supabase's render endpoint rejects the file (e.g. >25MB PNG).
 * Full-resolution Topaz output is preserved for lightbox + download.
 */
export function UpscaleTile({ url, index, selected, onToggle, onView, onDownload }: UpscaleTileProps) {
  const [src, setSrc] = useState(() => getOptimizedUrl(url, { quality: 70 }));

  return (
    <div
      className={`generation-preview relative group cursor-pointer rounded-lg overflow-hidden bg-muted/10 ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
    >
      <div className="aspect-[4/5] w-full">
        <ShimmerImage
          src={src}
          alt={`Upscaled ${index + 1}`}
          loading="lazy"
          className="w-full h-full object-cover"
          wrapperClassName="w-full h-full"
          onClick={onToggle}
          onError={() => {
            if (src !== url) setSrc(url);
          }}
        />
      </div>
      <div
        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
        onClick={onToggle}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onView(); }}
          className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white"
          title="View full size"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDownload(); }}
          className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white"
          title="Download"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
      <div
        className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selected ? 'bg-primary border-primary scale-110' : 'border-white bg-black/50'}`}
        onClick={onToggle}
      >
        {selected && <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />}
      </div>
    </div>
  );
}
