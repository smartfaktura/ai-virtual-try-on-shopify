import { useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { CAMERA_MOTIONS } from '@/lib/videoMotionRecipes';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { InfoTooltip } from './InfoTooltip';
import { Badge } from '@/components/ui/badge';

interface CameraMotionGridProps {
  value: string;
  onChange: (v: string) => void;
  multiSelect?: boolean;
  selected?: string[];
  onMultiChange?: (ids: string[]) => void;
  tooltip?: string;
}

export function CameraMotionGrid({
  value,
  onChange,
  multiSelect,
  selected = [],
  onMultiChange,
  tooltip,
}: CameraMotionGridProps) {
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const setVideoRef = useCallback((id: string, el: HTMLVideoElement | null) => {
    if (el) videoRefs.current.set(id, el);
    else videoRefs.current.delete(id);
  }, []);

  const handleHover = useCallback((id: string, play: boolean) => {
    const el = videoRefs.current.get(id);
    if (!el) return;
    if (play) {
      el.play().catch(() => {});
    } else {
      el.pause();
      el.currentTime = 0;
    }
  }, []);

  const handleClick = useCallback(
    (id: string) => {
      if (multiSelect && onMultiChange) {
        if (selected.includes(id)) {
          if (selected.length <= 1) return;
          onMultiChange(selected.filter((s) => s !== id));
        } else {
          onMultiChange([...selected, id]);
        }
      } else {
        onChange(id);
      }
    },
    [multiSelect, onMultiChange, selected, onChange],
  );

  const isSelected = (id: string) =>
    multiSelect ? selected.includes(id) : value === id;

  const multiCount = multiSelect ? selected.length : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-xs text-muted-foreground">Camera Motion</label>
        {tooltip && <InfoTooltip text={tooltip} />}
        {multiSelect && multiCount > 1 && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
            {multiCount} selected → {multiCount} videos
          </Badge>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
        {CAMERA_MOTIONS.map((motion) => {
          const active = isSelected(motion.id);
          const previewUrl = motion.preview
            ? getLandingAssetUrl(motion.preview)
            : undefined;

          return (
            <button
              key={motion.id}
              type="button"
              onClick={() => handleClick(motion.id)}
              onMouseEnter={() => handleHover(motion.id, true)}
              onMouseLeave={() => handleHover(motion.id, false)}
              className={cn(
                'relative flex-shrink-0 w-[88px] rounded-lg border overflow-hidden transition-all duration-150 group focus:outline-none',
                active
                  ? 'border-primary ring-1 ring-primary/30'
                  : 'border-border hover:border-primary/40',
              )}
            >
              {/* Video thumbnail */}
              <div className="relative w-full aspect-square bg-muted/40 overflow-hidden">
                {previewUrl ? (
                  <video
                    ref={(el) => setVideoRef(motion.id, el)}
                    src={previewUrl}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-[10px]">
                    No preview
                  </div>
                )}

                {/* Selected overlay */}
                {active && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-primary-foreground" />
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="px-1 py-1.5">
                <span
                  className={cn(
                    'text-[10px] leading-tight line-clamp-2 text-center block',
                    active ? 'text-foreground font-medium' : 'text-muted-foreground',
                  )}
                >
                  {motion.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
