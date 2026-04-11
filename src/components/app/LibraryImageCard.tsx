import { useState } from 'react';
import { Sparkles, Download, Check, Heart, MoreHorizontal, Shield, Send, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { getExtensionFromContentType } from '@/lib/dropDownload';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { TEAM_MEMBERS } from '@/data/teamData';
import type { AssetStatus } from '@/hooks/useLibraryAssetStatus';

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
  onToggleFavorite?: (e: React.MouseEvent) => void;
  isFavorited?: boolean;
  assetStatus?: AssetStatus;
  selectMode?: boolean;
  selected?: boolean;
  isUpscaling?: boolean;
  isAdmin?: boolean;
  onSetStatus?: (status: AssetStatus) => void;
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

const STATUS_PILL: Record<AssetStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-muted/80 text-muted-foreground' },
  brand_ready: { label: 'Brand Ready', className: 'bg-amber-500/90 text-white' },
  ready_to_publish: { label: 'Ready to Publish', className: 'bg-emerald-500/90 text-white' },
};

export function LibraryImageCard({
  item,
  onClick,
  onToggleFavorite,
  isFavorited,
  assetStatus = 'draft',
  selectMode,
  selected,
  isUpscaling,
  isAdmin,
  onSetStatus,
}: LibraryImageCardProps) {
  const statusInfo = STATUS_PILL[assetStatus];
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div
      className={cn(
        "group relative rounded-xl overflow-hidden cursor-pointer bg-muted transition-all",
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
        className="w-full h-full object-cover block group-hover:scale-[1.02] transition-all duration-500"
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
        <div className={cn("absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 flex-col justify-between p-3 hidden [@media(hover:hover)]:flex", isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
          {/* Top: three-dot menu + favorite */}
          <div className="flex justify-between">
            <div>
              {onSetStatus && (
                <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[160px]" onClick={(e) => e.stopPropagation()}>
                    {assetStatus !== 'brand_ready' && (
                      <DropdownMenuItem onClick={() => onSetStatus('brand_ready')}>
                        <Shield className="w-3.5 h-3.5 mr-2" />
                        Brand Ready
                      </DropdownMenuItem>
                    )}
                    {assetStatus !== 'ready_to_publish' && (
                      <DropdownMenuItem onClick={() => onSetStatus('ready_to_publish')}>
                        <Send className="w-3.5 h-3.5 mr-2" />
                        Ready to Publish
                      </DropdownMenuItem>
                    )}
                    {assetStatus !== 'draft' && (
                      <DropdownMenuItem onClick={() => onSetStatus('draft')}>
                        <RotateCcw className="w-3.5 h-3.5 mr-2" />
                        Reset to Draft
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(e);
                }}
                className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              >
                <Heart className={cn("w-4 h-4", isFavorited && "fill-rose-500 text-rose-500")} />
              </button>
            )}
          </div>

          {/* Bottom: status pill + download */}
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              {assetStatus !== 'draft' && (
                <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", statusInfo.className)}>
                  {statusInfo.label}
                </span>
              )}
              <span className="text-[10px] text-white/50">{item.date}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadImage(item.imageUrl, `${item.label}-${item.id.slice(0, 8)}.png`);
              }}
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
