import { useState } from 'react';
import { Sparkles, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LibraryItem {
  id: string;
  imageUrl: string;
  source: 'generation' | 'freestyle';
  label: string;
  prompt?: string;
  date: string;
  createdAt: string;
  status?: string;
  aspectRatio?: string;
  quality?: string;
}

interface LibraryImageCardProps {
  item: LibraryItem;
  onClick?: () => void;
}

export function LibraryImageCard({ item, onClick }: LibraryImageCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="group relative rounded-lg overflow-hidden cursor-pointer bg-muted"
      onClick={onClick}
    >
      {/* Shimmer placeholder */}
      {!loaded && (
        <div className="w-full aspect-[3/4] animate-pulse bg-muted" />
      )}

      <img
        src={item.imageUrl}
        alt={item.label}
        className={cn(
          'w-full h-auto block transition-all duration-500 group-hover:scale-[1.03]',
          loaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
        )}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />

      {/* Hover overlay — minimal: badge + date */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col justify-between p-3 hidden [@media(hover:hover)]:flex">
        {/* Top: badge */}
        <div className="flex justify-between items-start">
          <span className="text-[10px] px-2 py-0.5 rounded-md font-medium backdrop-blur-sm flex items-center gap-1 bg-black/40 text-white">
            {item.source === 'freestyle' ? (
              <><Sparkles className="w-3 h-3" /> Freestyle</>
            ) : (
              <><Camera className="w-3 h-3" /> {item.label}</>
            )}
          </span>
        </div>

        {/* Bottom: date */}
        <div>
          <span className="text-[10px] text-white/60">{item.date}</span>
        </div>
      </div>
    </div>
  );
}
