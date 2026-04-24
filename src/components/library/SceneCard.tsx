import { ImageIcon } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import type { PublicScene } from '@/hooks/usePublicSceneLibrary';
import { getCollectionLabel } from '@/hooks/usePublicSceneLibrary';

interface SceneCardProps {
  scene: PublicScene;
  onClick: (scene: PublicScene) => void;
  eager?: boolean;
}

export function SceneCard({ scene, onClick, eager = false }: SceneCardProps) {
  const subLabel = getCollectionLabel(scene.category_collection);
  const previewUrl = scene.preview_image_url
    ? getOptimizedUrl(scene.preview_image_url, { width: 600, quality: 60 })
    : null;

  return (
    <button
      type="button"
      onClick={() => onClick(scene)}
      className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#efece8] text-left transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
    >
      {/* Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center text-foreground/20">
        <ImageIcon className="h-8 w-8" />
      </div>

      {previewUrl && (
        <img
          src={previewUrl}
          alt={scene.title}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
          className="relative z-[1] h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      )}

      {/* Bottom gradient + meta */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex flex-col gap-1 bg-gradient-to-t from-black/55 via-black/20 to-transparent p-3 pt-10">
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/75">
          {subLabel}
        </span>
        <span className="line-clamp-1 text-sm font-semibold text-white">
          {scene.title}
        </span>
      </div>
    </button>
  );
}

export function SceneCardSkeleton() {
  return (
    <div className="aspect-[3/4] w-full animate-pulse rounded-2xl bg-[#efece8]" />
  );
}
