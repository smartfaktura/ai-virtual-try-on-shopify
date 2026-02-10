import { useState } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DiscoverPreset } from '@/hooks/useDiscoverPresets';
import type { TryOnPose } from '@/types';

export type DiscoverItem =
  | { type: 'preset'; data: DiscoverPreset }
  | { type: 'scene'; data: TryOnPose };

interface DiscoverCardProps {
  item: DiscoverItem;
  onClick: () => void;
  isSaved?: boolean;
  onToggleSave?: (e: React.MouseEvent) => void;
}

export function DiscoverCard({ item, onClick, isSaved, onToggleSave }: DiscoverCardProps) {
  const imageUrl = item.type === 'preset' ? item.data.image_url : item.data.previewUrl;
  const isScene = item.type === 'scene';
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="group relative rounded-lg overflow-hidden cursor-pointer break-inside-avoid mb-1 bg-muted"
      onClick={onClick}
    >
      {/* Shimmer placeholder */}
      {!loaded && (
        <div className="w-full aspect-[3/4] animate-pulse bg-muted" />
      )}

      <img
        src={imageUrl}
        alt={isScene ? item.data.name : item.data.title}
        className={cn(
          'w-full h-auto block transition-opacity duration-500 group-hover:scale-[1.03] transition-transform',
          loaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
        )}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />

      {/* Save button overlay */}
      {onToggleSave && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSave(e); }}
          className={cn(
            'absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10',
            isSaved
              ? 'bg-destructive text-destructive-foreground'
              : 'bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100'
          )}
        >
          <Heart className={cn('w-4 h-4', isSaved && 'fill-current')} />
        </button>
      )}

      {/* Hover overlay (desktop) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col justify-end p-3 hidden [@media(hover:hover)]:flex">
        {isScene ? (
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-xs flex-1">{item.data.name}</span>
          </div>
        ) : (
          <p className="text-white/80 text-xs line-clamp-2 leading-relaxed">
            {item.data.prompt}
          </p>
        )}
      </div>

      {/* Scene badge */}
      {isScene && (
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium">
          Scene
        </div>
      )}
    </div>
  );
}
