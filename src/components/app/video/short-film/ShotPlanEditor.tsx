import { ShotCard } from './ShotCard';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Sparkles, Cog, Loader2, Mic, Volume2, Clock, Music, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ShotPlanItem, AudioLayers } from '@/types/shortFilm';

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
  audioLayers?: AudioLayers;
  onAudioLayersChange?: (layers: AudioLayers) => void;
}

const MIN_VO_DURATION = 3;
const WORDS_PER_SEC = 2.0;

export function ShotPlanEditor({
  shots, onRegenerate, onUpdateShot, onDeleteShot, onAddShot, onReorderShots,
  planMode = 'auto', onPlanModeChange, isAiPlanning, availableReferences = [],
  audioLayers, onAudioLayersChange,
}: ShotPlanEditorProps) {
  const editable = !!(onUpdateShot && onDeleteShot);
  const layers = audioLayers || { music: true, sfx: true, voiceover: true };

  const toggleLayer = (key: keyof AudioLayers) => {
    if (!onAudioLayersChange) return;
    onAudioLayersChange({ ...layers, [key]: !layers[key] });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Shot Plan</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {shots.length} shots — Review and adjust your film's shot sequence
          </p>
        </div>

        {/* Audio Layers Toolbar */}
        {onAudioLayersChange && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Audio Layers</p>
            <div className="flex gap-2">
              {([
                { key: 'music' as const, label: 'Music', icon: Music },
                { key: 'sfx' as const, label: 'SFX', icon: Volume2 },
                { key: 'voiceover' as const, label: 'Voiceover', icon: Mic },
              ]).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => toggleLayer(key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                    layers[key]
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                  )}
                >
                  {layers[key] ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

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
          {shots.map((shot, idx) => {
            const wordCount = (shot.script_line || '').split(/\s+/).filter(Boolean).length;
            const maxWords = Math.floor(shot.duration_sec * WORDS_PER_SEC);
            const isOverBudget = wordCount > maxWords;
            const canHaveVo = shot.duration_sec >= MIN_VO_DURATION;
            const showVo = layers.voiceover && canHaveVo;
            const showSfx = layers.sfx;
            const shotVoEnabled = shot.vo_enabled !== false;

            return (
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
                {editable && (showVo || showSfx) && (
                  <div className="space-y-1 pl-10 pr-2">
                    {/* Voiceover row */}
                    {showVo && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateShot?.(idx, { ...shot, vo_enabled: !shotVoEnabled })}
                          className={cn(
                            'h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors',
                            shotVoEnabled
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground/40 bg-background'
                          )}
                          title={shotVoEnabled ? 'Disable voiceover for this shot' : 'Enable voiceover for this shot'}
                        >
                          {shotVoEnabled && <Check className="h-2.5 w-2.5" />}
                        </button>
                        <Mic className="h-3 w-3 text-muted-foreground shrink-0" />
                        <Input
                          value={shot.script_line || ''}
                          onChange={e => onUpdateShot?.(idx, { ...shot, script_line: e.target.value || undefined })}
                          placeholder={shotVoEnabled ? 'Voiceover narration for this shot...' : 'Voiceover disabled'}
                          disabled={!shotVoEnabled}
                          className={cn('text-xs h-7 bg-muted/30 border-muted', !shotVoEnabled && 'opacity-50')}
                        />
                        <span className={cn(
                          'text-[9px] shrink-0 w-12 text-right font-mono',
                          isOverBudget && shotVoEnabled ? 'text-destructive font-semibold' : 'text-muted-foreground'
                        )}>
                          {wordCount}/{maxWords}w
                        </span>
                      </div>
                    )}
                    {/* SFX row */}
                    {showSfx && (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 shrink-0" /> {/* spacer for alignment */}
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
                    )}
                    {/* Duration warning for VO */}
                    {layers.voiceover && !canHaveVo && (
                      <p className="text-[9px] text-muted-foreground pl-6 italic">
                        Shot too short for voiceover ({shot.duration_sec}s &lt; {MIN_VO_DURATION}s min)
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
