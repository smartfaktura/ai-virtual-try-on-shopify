import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { SHOT_STYLE_LABEL, SUBJECT_LABEL, type SceneShotStyle, type SceneSubject } from '@/lib/sceneTaxonomy';
import type { CatalogScene } from '@/hooks/useSceneCatalog';

interface SceneCatalogCardProps {
  scene: CatalogScene;
  selected: boolean;
  onSelect: (scene: CatalogScene) => void;
}

export function SceneCatalogCard({ scene, selected, onSelect }: SceneCatalogCardProps) {
  const subjectLabel = scene.subject ? SUBJECT_LABEL[scene.subject as SceneSubject] : null;
  const styleLabel = scene.shot_style ? SHOT_STYLE_LABEL[scene.shot_style as SceneShotStyle] : null;
  const isNew = scene.created_at
    ? Date.now() - new Date(scene.created_at).getTime() < 14 * 24 * 60 * 60 * 1000
    : false;

  return (
    <button
      type="button"
      onClick={() => onSelect(scene)}
      className={cn(
        'group relative rounded-xl overflow-hidden border-2 bg-card text-left transition-all duration-200',
        selected
          ? 'border-primary ring-2 ring-primary/20 shadow-md'
          : 'border-transparent hover:border-border/60 hover:shadow-sm hover:-translate-y-0.5',
      )}
    >
      <div className="relative">
        {scene.preview_image_url ? (
          <ShimmerImage
            src={getOptimizedUrl(scene.preview_image_url, { quality: 60 })}
            alt={scene.title}
            className="w-full aspect-[4/5] object-cover"
            wrapperClassName="h-auto"
            aspectRatio="4/5"
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-[4/5] bg-muted" />
        )}
        {selected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
        {isNew && !selected && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-full bg-primary text-primary-foreground">
            New
          </span>
        )}
      </div>
      <div className="p-2.5 space-y-1.5">
        <p className="text-[12px] font-medium text-foreground leading-tight line-clamp-2 min-h-[2.4em]">
          {scene.title}
        </p>
        <div className="flex flex-wrap gap-1">
          {subjectLabel && (
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              {subjectLabel}
            </span>
          )}
          {styleLabel && (
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              {styleLabel}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
