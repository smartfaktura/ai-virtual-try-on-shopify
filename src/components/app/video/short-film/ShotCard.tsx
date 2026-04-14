import { GripVertical, Eye, EyeOff, User, Package, Clock, Video } from 'lucide-react';
import { formatRoleLabel, formatCameraMotion } from '@/lib/shortFilmPlanner';
import type { ShotPlanItem } from '@/types/shortFilm';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ShotCardProps {
  shot: ShotPlanItem;
  isGenerating?: boolean;
  isComplete?: boolean;
  resultUrl?: string;
}

export function ShotCard({ shot, isGenerating, isComplete, resultUrl }: ShotCardProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4 transition-all',
        isGenerating && 'border-primary/50 bg-primary/5 animate-pulse',
        isComplete && 'border-green-500/30 bg-green-500/5',
        !isGenerating && !isComplete && 'border-border bg-card'
      )}
    >
      <div className="flex flex-col items-center gap-1 pt-0.5">
        <GripVertical className="h-4 w-4 text-muted-foreground/40" />
        <span className="text-xs font-bold text-muted-foreground">
          {shot.shot_index}
        </span>
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wide">
            {formatRoleLabel(shot.role)}
          </Badge>
          {shot.product_visible && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Package className="h-3 w-3" /> Product
            </span>
          )}
          {shot.character_visible && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <User className="h-3 w-3" /> Character
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground">{shot.purpose}</p>

        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Video className="h-3 w-3" />
            {formatCameraMotion(shot.camera_motion)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {shot.duration_sec}s
          </span>
          <span className={cn(
            'px-1.5 py-0.5 rounded text-[9px] font-medium',
            shot.preservation_strength === 'high' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
            shot.preservation_strength === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
            'bg-muted text-muted-foreground'
          )}>
            {shot.preservation_strength} preservation
          </span>
        </div>

        {shot.script_line && (
          <p className="text-xs italic text-muted-foreground/80 border-l-2 border-primary/30 pl-2">
            "{shot.script_line}"
          </p>
        )}
      </div>

      {resultUrl && (
        <div className="shrink-0">
          <video
            src={resultUrl}
            className="h-16 w-16 rounded-lg object-cover"
            muted
            autoPlay
            loop
            playsInline
          />
        </div>
      )}
    </div>
  );
}
