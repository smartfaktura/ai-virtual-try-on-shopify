import { ShotCard } from './ShotCard';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Sparkles, Cog, Loader2 } from 'lucide-react';
import type { ShotPlanItem } from '@/types/shortFilm';

interface ReferenceOption {
  id: string;
  url: string;
  role: string;
  name?: string;
}

interface ShotPlanEditorProps {
  shots: ShotPlanItem[];
  onRegenerate: () => void;
  onUpdateShot?: (index: number, shot: ShotPlanItem) => void;
  onDeleteShot?: (index: number) => void;
  onAddShot?: () => void;
  onReorderShots?: (fromIndex: number, toIndex: number) => void;
  planMode?: 'auto' | 'ai';
  onPlanModeChange?: (mode: 'auto' | 'ai') => void;
  isAiPlanning?: boolean;
  availableReferences?: ReferenceOption[];
}

export function ShotPlanEditor({
  shots, onRegenerate, onUpdateShot, onDeleteShot, onAddShot, onReorderShots,
  planMode = 'auto', onPlanModeChange, isAiPlanning, availableReferences = [],
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
          {onPlanModeChange && (
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1 transition-colors ${
                  planMode === 'auto'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => onPlanModeChange('auto')}
              >
                <Cog className="h-3 w-3" /> Auto
              </button>
              <button
                className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1 transition-colors ${
                  planMode === 'ai'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => onPlanModeChange('ai')}
              >
                <Sparkles className="h-3 w-3" /> AI Director
              </button>
            </div>
          )}
          {onAddShot && (
            <Button variant="outline" size="sm" onClick={onAddShot} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add Shot
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={isAiPlanning}
            className="gap-1.5"
          >
            {isAiPlanning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {isAiPlanning ? 'Planning...' : 'Regenerate'}
          </Button>
        </div>
      </div>

      {isAiPlanning && shots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
          <p className="text-sm font-medium text-foreground">AI Director is crafting your shot plan...</p>
          <p className="text-xs text-muted-foreground mt-1">This usually takes a few seconds.</p>
        </div>
      ) : (
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
              availableReferences={availableReferences}
            />
          ))}
        </div>
      )}
    </div>
  );
}
