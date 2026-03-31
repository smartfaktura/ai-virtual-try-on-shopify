import { Sparkles, Camera, Download, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { getExtensionFromContentType } from '@/lib/dropDownload';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TEAM_MEMBERS } from '@/data/teamData';

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
  sceneName?: string;
  modelName?: string;
  sceneImageUrl?: string;
  modelImageUrl?: string;
  workflowSlug?: string;
  productName?: string;
  productImageUrl?: string;
  modelId?: string | null;
  sceneId?: string | null;
  productId?: string | null;
  providerUsed?: string | null;
}

interface LibraryImageCardProps {
  item: LibraryItem;
  onClick?: () => void;
  onDelete?: () => void;
  selectMode?: boolean;
  selected?: boolean;
  isUpscaling?: boolean;
  isAdmin?: boolean;
}

async function downloadImage(url: string, filename: string) {
  const res = await fetch(url);
  const contentType = res.headers.get('content-type');
  const ext = getExtensionFromContentType(contentType);
  const baseName = filename.replace(/\.[^.]+$/, '');
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = `${baseName}${ext}`;
  a.click();
  URL.revokeObjectURL(blobUrl);
}

function getProviderLabel(provider: string): string {
  if (provider.includes('seedream')) return 'SDR';
  if (provider.includes('pro')) return 'PRO';
  if (provider.includes('flash')) return 'FLASH';
  return provider.slice(0, 5).toUpperCase();
}

export function LibraryImageCard({ item, onClick, onDelete, selectMode, selected, isUpscaling, isAdmin }: LibraryImageCardProps) {
  return (
    <div
      className={cn(
        "group relative rounded-lg overflow-hidden cursor-pointer bg-muted transition-all",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      onClick={onClick}
    >
      {/* Admin provider badge */}
      {isAdmin && item.providerUsed && !selectMode && (
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="secondary" className="bg-black/60 text-white text-[9px] px-1.5 py-0 font-bold shadow-md border-0">
            {getProviderLabel(item.providerUsed)}
          </Badge>
        </div>
      )}

      {/* Resolution badge */}
      {item.quality?.startsWith('upscaled_') && !selectMode && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="bg-primary/90 text-primary-foreground text-[10px] px-1.5 py-0 font-bold shadow-md">
            {item.quality === 'upscaled_4k' ? '4K' : '2K'}
          </Badge>
        </div>
      )}

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
        className="w-full h-full object-cover block group-hover:scale-[1.03] transition-all duration-500"
        loading="lazy"
        aspectRatio={item.aspectRatio === '1:1' ? '1/1' : item.aspectRatio === '9:16' ? '9/16' : item.aspectRatio === '16:9' ? '16/9' : item.aspectRatio === '4:5' ? '4/5' : item.aspectRatio === '5:4' ? '5/4' : '3/4'}
      />

      {/* Upscaling overlay */}
      {isUpscaling && (() => {
        const luna = TEAM_MEMBERS.find(m => m.name === 'Luna');
        return (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/70 backdrop-blur-[3px]">
            <Avatar className="w-10 h-10 ring-2 ring-primary/30 mb-2">
              <AvatarImage src={getOptimizedUrl(luna?.avatar, { quality: 60 })} alt="Luna" />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">LP</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-3 h-3 text-primary animate-pulse" />
              <span className="text-[11px] font-medium text-primary">Luna is enhancing…</span>
            </div>
          </div>
        );
      })()}

      {/* Hover overlay — hidden in select mode */}
      {!selectMode && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col justify-between p-3 hidden [@media(hover:hover)]:flex">
          <div />

          {/* Bottom: date + delete on left, download on right */}
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/60">{item.date}</span>
              {onDelete && (
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadImage(item.imageUrl, `${item.label}-${item.id.slice(0, 8)}.png`);
              }}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
