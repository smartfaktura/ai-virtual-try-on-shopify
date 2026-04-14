import { ShotCard } from './ShotCard';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Sparkles, Cog, Loader2, Mic, Volume2, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Shot Plan</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {shots.length} shots -- Review and adjust your film's shot sequence
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {onPlanModeChange && (
            <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
              <button
                className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  planMode === 'auto'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => onPlanModeChange('auto')}
              >
                <Cog className="h-3 w-3" /> Auto
              </button>
              <button
                className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
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
          <div className="flex flex-wrap gap-2">
            {onAddShot && (
              <Button variant="outline" size="sm" onClick={onAddShot} className="gap-1.5 h-8">
                <Plus className="h-3.5 w-3.5" />
                Add Shot
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={isAiPlanning}
              className="gap-1.5 h-8"
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
      </div>

      {isAiPlanning && shots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
          <p className="text-sm font-medium text-foreground">AI Director is crafting your shot plan...</p>
          <p className="text-xs text-muted-foreground mt-1">This usually takes a few seconds</p>
        </div>
      ) : (
        <div className="space-y-2">
          {shots.map((shot, idx) => (
            <div key={`${shot.shot_index}-${idx}`} className="space-y-1">
              <ShotCard
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
              {editable && (
                <div className="space-y-1 pl-10 pr-2">
                  <div className="flex items-center gap-2">
                    <Mic className="h-3 w-3 text-muted-foreground shrink-0" />
                    <Input
                      value={shot.script_line || ''}
                      onChange={e => onUpdateShot?.(idx, { ...shot, script_line: e.target.value || undefined })}
                      placeholder="Voiceover narration for this shot..."
                      className="text-xs h-7 bg-muted/30 border-muted"
                    />
                    <span className="text-[9px] text-muted-foreground shrink-0 w-8 text-right">
                      {(shot.script_line || '').split(/\s+/).filter(Boolean).length}w
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-3 w-3 text-muted-foreground shrink-0" />
                    <Input
                      value={shot.sfx_prompt || ''}
                      onChange={e => onUpdateShot?.(idx, { ...shot, sfx_prompt: e.target.value || undefined })}
                      placeholder="Sound effect description for this shot..."
                      className="text-xs h-7 bg-muted/30 border-muted"
                    />
                    {shot.sfx_prompt && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <Select
                          value={String(shot.sfx_trigger_at ?? 0)}
                          onValueChange={v => onUpdateShot?.(idx, { ...shot, sfx_trigger_at: parseFloat(v) })}
                        >
                          <SelectTrigger className="h-7 w-[72px] text-[10px] bg-muted/30 border-muted">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Start</SelectItem>
                            <SelectItem value="0.5">0.5s</SelectItem>
                            <SelectItem value="1">1.0s</SelectItem>
                            <SelectItem value="1.5">1.5s</SelectItem>
                            <SelectItem value="2">2.0s</SelectItem>
                            <SelectItem value="3">3.0s</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
