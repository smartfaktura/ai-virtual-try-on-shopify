import { Copy, ArrowRight, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { DiscoverPreset } from '@/hooks/useDiscoverPresets';
import type { TryOnPose } from '@/types';

export type DiscoverItem =
  | { type: 'preset'; data: DiscoverPreset }
  | { type: 'scene'; data: TryOnPose };

interface DiscoverCardProps {
  item: DiscoverItem;
  onClick: () => void;
}

export function DiscoverCard({ item, onClick }: DiscoverCardProps) {
  const imageUrl = item.type === 'preset' ? item.data.image_url : item.data.previewUrl;
  const isScene = item.type === 'scene';

  return (
    <div
      className="group relative rounded-lg overflow-hidden cursor-pointer break-inside-avoid mb-1 bg-muted"
      onClick={onClick}
    >
      <img
        src={imageUrl}
        alt={isScene ? item.data.name : item.data.title}
        className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.03]"
        loading="lazy"
      />

      {/* Hover overlay (desktop) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col justify-end p-3 hidden [@media(hover:hover)]:flex">
        {isScene ? (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onClick(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-colors"
            >
              <Camera className="w-3 h-3" /> Use Scene
            </button>
          </div>
        ) : (
          <>
            <p className="text-white/80 text-xs line-clamp-2 mb-2 leading-relaxed">
              {item.data.prompt}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(item.data.prompt);
                  toast.success('Prompt copied to clipboard');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 backdrop-blur-sm text-white text-xs font-medium hover:bg-white/25 transition-colors"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-colors"
              >
                Use Prompt <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </>
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
