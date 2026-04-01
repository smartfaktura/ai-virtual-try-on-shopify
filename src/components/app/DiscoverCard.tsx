import { Star, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import type { DiscoverPreset } from '@/hooks/useDiscoverPresets';
import type { TryOnPose } from '@/types';

export type DiscoverItem =
  | { type: 'preset'; data: DiscoverPreset }
  | { type: 'scene'; data: TryOnPose };

interface DiscoverCardProps {
  item: DiscoverItem;
  onClick: () => void;
  onRecreate?: (e: React.MouseEvent) => void;
  isSaved?: boolean;
  onToggleSave?: (e: React.MouseEvent) => void;
  isFeatured?: boolean;
  isAdmin?: boolean;
  onToggleFeatured?: (e: React.MouseEvent) => void;
  hideLabels?: boolean;
  hidePrompt?: boolean;
  aspectRatioOverride?: string;
}

function getGenerationLabel(item: DiscoverItem): string {
  if (item.type === 'scene') return 'Scene';
  const d = item.data;
  if (d.workflow_name) return d.workflow_name.replace(/\bSet$/i, 'Workflow');
  if (d.scene_name) return `Freestyle · ${d.scene_name}`;
  return 'Freestyle';
}

export function DiscoverCard({ item, onClick, onRecreate, isSaved, onToggleSave, isFeatured, isAdmin, onToggleFeatured, hideLabels, hidePrompt, aspectRatioOverride }: DiscoverCardProps) {
  const imageUrl = item.type === 'preset' ? item.data.image_url : item.data.previewUrl;
  const isScene = item.type === 'scene';
  const isPreset = item.type === 'preset';

  const sceneThumb = isPreset ? item.data.scene_image_url : null;
  const sceneName = isPreset ? item.data.scene_name : null;
  const modelThumb = isPreset ? item.data.model_image_url : null;
  const modelName = isPreset ? item.data.model_name : null;
  const productThumb = isPreset ? item.data.product_image_url : null;
  const productName = isPreset ? item.data.product_name : null;

  return (
    <div
      className="group relative rounded-lg overflow-hidden cursor-pointer break-inside-avoid mb-1 bg-muted"
      onClick={onClick}
    >
      {aspectRatioOverride ? (
        <div className="w-full overflow-hidden" style={{ aspectRatio: aspectRatioOverride }}>
          <ShimmerImage
            src={getOptimizedUrl(imageUrl, { quality: 60 })}
            alt={isScene ? item.data.name : item.data.title}
            className="w-full h-full object-cover block [@media(hover:hover)]:group-hover:scale-[1.03] [@media(hover:hover)]:transition-transform [@media(hover:hover)]:duration-500"
            loading="lazy"
          />
        </div>
      ) : (
        <ShimmerImage
          src={getOptimizedUrl(imageUrl, { quality: 60 })}
          alt={isScene ? item.data.name : item.data.title}
          className="w-full h-auto block [@media(hover:hover)]:group-hover:scale-[1.03] [@media(hover:hover)]:transition-transform [@media(hover:hover)]:duration-500"
          loading="lazy"
        />
      )}


      {/* Admin featured toggle */}
      {isAdmin && onToggleFeatured && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFeatured(e); }}
          className={cn(
            'absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10',
            isFeatured
              ? 'bg-amber-500 text-white'
              : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
          )}
        >
          <Star className={cn('w-4 h-4', isFeatured && 'fill-current')} />
        </button>
      )}

      {/* Hover overlay (desktop) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col justify-end p-3 gap-2 hidden [@media(hover:hover)]:flex">
        {/* Scene & Model thumbnails */}
        {(sceneThumb || modelThumb) && (
          <div className="flex flex-col gap-1.5 mb-1">
            {sceneThumb && sceneName && (
              <div className="flex items-center gap-2">
                <img src={getOptimizedUrl(sceneThumb, { quality: 60 })} alt={sceneName} className="w-7 h-7 rounded-md object-cover" />
                <span className="text-white/90 text-[11px] font-medium truncate">{sceneName}</span>
              </div>
            )}
            {modelThumb && modelName && (
              <div className="flex items-center gap-2">
                <img src={getOptimizedUrl(modelThumb, { quality: 60 })} alt={modelName} className="w-7 h-7 rounded-md object-cover" />
                <span className="text-white/90 text-[11px] font-medium truncate">{modelName}</span>
              </div>
            )}
            {productThumb && productName && (
              <div className="flex items-center gap-2">
                <img src={getOptimizedUrl(productThumb, { quality: 60 })} alt={productName} className="w-7 h-7 rounded-md object-cover" />
                <span className="text-white/90 text-[11px] font-medium truncate">{productName}</span>
              </div>
            )}
          </div>
        )}

        {/* Recreate CTA */}
        {onRecreate ? (
          <button
            onClick={(e) => { e.stopPropagation(); onRecreate(e); }}
            className="self-center px-4 py-1.5 rounded-full bg-white/95 text-black text-xs font-semibold hover:bg-white transition-colors flex items-center gap-1.5 shadow-lg"
          >
            Recreate this <ArrowRight className="w-3 h-3" />
          </button>
        ) : !hidePrompt ? (
          <div className="text-center">
            <p className="text-white/80 text-xs line-clamp-2 leading-relaxed">
              {isPreset ? item.data.prompt : item.data.name}
            </p>
          </div>
        ) : null}

        {/* Product chip or scene label for items without thumbnails */}
        {productName && !productThumb && (
          <div className="flex items-center justify-center">
            <span className="text-white/50 text-[10px] font-medium tracking-wide">
              {productName}
            </span>
          </div>
        )}
      </div>

      {/* Mobile-only recreate button (touch devices) */}
      {onRecreate && (
        <button
          onClick={(e) => { e.stopPropagation(); onRecreate(e); }}
          className="absolute bottom-2 right-2 z-10 [@media(hover:hover)]:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/80 backdrop-blur-sm text-white text-xs font-semibold shadow-lg border border-white/10"
        >
          Recreate <ArrowRight className="w-3 h-3" />
        </button>
      )}

    </div>
  );
}
