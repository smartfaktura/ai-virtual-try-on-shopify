import { Sparkles, Camera, Download, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { ShimmerImage } from '@/components/ui/shimmer-image';

function getAspectClass(ratio?: string) {
  switch (ratio) {
    case '1:1': return 'aspect-square';
    case '3:4': return 'aspect-[3/4]';
    case '4:5': return 'aspect-[4/5]';
    case '9:16': return 'aspect-[9/16]';
    case '16:9': return 'aspect-video';
    default: return 'aspect-[3/4]';
  }
}

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
  onDelete?: () => void;
  selectMode?: boolean;
  selected?: boolean;
}

async function downloadImage(url: string, filename: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(blobUrl);
}

export function LibraryImageCard({ item, onClick, onDelete, selectMode, selected }: LibraryImageCardProps) {
  return (
    <div
      className={cn(
        "group relative rounded-lg overflow-hidden cursor-pointer bg-muted transition-all",
        getAspectClass(item.aspectRatio),
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      onClick={onClick}
    >
      {/* Select mode checkbox */}
      {selectMode && (
        <div className="absolute top-3 left-3 z-10">
          <div className={cn(
            "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shadow-md",
            selected ? "bg-primary border-primary text-primary-foreground" : "border-white bg-black/40"
          )}>
            {selected && <Check className="w-4 h-4" />}
          </div>
        </div>
      )}

      <ShimmerImage
        src={getOptimizedUrl(item.imageUrl, { quality: 60 })}
        alt={item.label}
        className="w-full h-auto block group-hover:scale-[1.03] transition-all duration-500"
        loading="lazy"
        aspectRatio={item.aspectRatio === '1:1' ? '1/1' : item.aspectRatio === '9:16' ? '9/16' : item.aspectRatio === '16:9' ? '16/9' : '3/4'}
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

        {/* Bottom: delete + date on left, download on right */}
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/60">{item.date}</span>
            {!selectMode && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500/70 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          {!selectMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadImage(item.imageUrl, `${item.label}-${item.id.slice(0, 8)}.png`);
              }}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
