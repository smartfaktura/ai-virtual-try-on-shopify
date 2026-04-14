import { ShotCard } from './ShotCard';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import type { ShotPlanItem } from '@/types/shortFilm';

interface ShotPlanEditorProps {
  shots: ShotPlanItem[];
  onRegenerate: () => void;
  onUpdateShot?: (index: number, shot: ShotPlanItem) => void;
  onDeleteShot?: (index: number) => void;
  onAddShot?: () => void;
  onReorderShots?: (fromIndex: number, toIndex: number) => void;
}

export function ShotPlanEditor({
  shots, onRegenerate, onUpdateShot, onDeleteShot, onAddShot, onReorderShots,
}: ShotPlanEditorProps) {
  const editable = !!(onUpdateShot && onDeleteShot);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Shot Plan</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {shots.length} shots • Review and adjust your film's shot sequence.
          </p>
        </div>
        <div className="flex gap-2">
          {onAddShot && (
            <Button variant="outline" size="sm" onClick={onAddShot} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add Shot
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onRegenerate} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Regenerate
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {shots.map((shot, idx) => (
          <ShotCard
            key={`${shot.shot_index}-${idx}`}
            shot={shot}
            editable={editable}
            onUpdate={(updated) => onUpdateShot?.(idx, updated)}
            onDelete={() => onDeleteShot?.(idx)}
            onMoveUp={() => onReorderShots?.(idx, idx - 1)}
            onMoveDown={() => onReorderShots?.(idx, idx + 1)}
            isFirst={idx === 0}
            isLast={idx === shots.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
