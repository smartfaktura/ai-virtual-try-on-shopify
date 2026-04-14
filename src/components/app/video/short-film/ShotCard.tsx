import { useState } from 'react';
import { GripVertical, User, Package, Clock, Video, Pencil, Check, X, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { formatRoleLabel, formatCameraMotion } from '@/lib/shortFilmPlanner';
import type { ShotPlanItem } from '@/types/shortFilm';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SCENE_TYPE_OPTIONS = [
  { value: 'product_hero', label: 'Product Hero' },
  { value: 'product_closeup', label: 'Product Close-up' },
  { value: 'macro_closeup', label: 'Macro Close-up' },
  { value: 'studio_reveal', label: 'Studio Reveal' },
  { value: 'studio_detail', label: 'Studio Detail' },
  { value: 'lifestyle_context', label: 'Lifestyle Context' },
  { value: 'lifestyle_interaction', label: 'Lifestyle Interaction' },
  { value: 'establishing_wide', label: 'Establishing Wide' },
  { value: 'mood_abstract', label: 'Mood / Abstract' },
  { value: 'hero_spotlight', label: 'Hero Spotlight' },
  { value: 'dynamic_sequence', label: 'Dynamic Sequence' },
  { value: 'end_card', label: 'End Card' },
  { value: 'atmosphere_mood', label: 'Atmosphere' },
  { value: 'environment_pan', label: 'Environment Pan' },
  { value: 'human_interaction', label: 'Human Interaction' },
  { value: 'fashion_runway', label: 'Fashion Runway' },
  { value: 'beauty_macro', label: 'Beauty Macro' },
  { value: 'sports_action', label: 'Sports Action' },
  { value: 'food_detail', label: 'Food Detail' },
  { value: 'architecture_wide', label: 'Architecture Wide' },
  { value: 'nature_ambient', label: 'Nature Ambient' },
  { value: 'abstract_tease', label: 'Abstract Tease' },
  { value: 'hero_end_frame', label: 'Hero End Frame' },
  { value: 'resolve_wide', label: 'Resolve Wide' },
  { value: 'atmospheric_lifestyle', label: 'Atmospheric Lifestyle' },
  { value: 'general', label: 'General' },
];

const SUBJECT_MOTION_OPTIONS = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'none', label: 'None' },
  { value: 'natural_movement', label: 'Natural Movement' },
  { value: 'ambient', label: 'Ambient' },
  { value: 'dynamic', label: 'Dynamic' },
  { value: 'slow_reveal', label: 'Slow Reveal' },
];

const PRESERVATION_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

interface ReferenceOption {
  id: string;
  url: string;
  role: string;
  name?: string;
}

interface ShotCardProps {
  shot: ShotPlanItem;
  isGenerating?: boolean;
  isComplete?: boolean;
  resultUrl?: string;
  editable?: boolean;
  onUpdate?: (updated: ShotPlanItem) => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  availableReferences?: ReferenceOption[];
}

export function ShotCard({
  shot, isGenerating, isComplete, resultUrl,
  editable, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast,
  availableReferences = [],
}: ShotCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(shot);

  const startEdit = () => {
    setDraft({ ...shot });
    setEditing(true);
  };

  const confirmEdit = () => {
    onUpdate?.(draft);
    setEditing(false);
  };

  const cancelEdit = () => setEditing(false);

  if (editing && editable) {
    return (
      <div className="rounded-xl border border-primary/40 bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wide">
            Shot {shot.shot_index} -- {formatRoleLabel(shot.role)}
          </Badge>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={confirmEdit}>
              <Check className="h-3.5 w-3.5 text-green-600" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={cancelEdit}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-[10px] font-medium text-muted-foreground">Purpose</label>
            <Textarea
              value={draft.purpose}
              onChange={e => setDraft(d => ({ ...d, purpose: e.target.value }))}
              className="text-xs min-h-[60px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground">Camera Motion</label>
              <Input
                value={draft.camera_motion}
                onChange={e => setDraft(d => ({ ...d, camera_motion: e.target.value }))}
                className="text-xs h-8"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground">Duration (sec)</label>
              <Input
                type="number"
                min={1}
                max={15}
                value={draft.duration_sec}
                onChange={e => setDraft(d => ({ ...d, duration_sec: Number(e.target.value) }))}
                className="text-xs h-8"
              />
            </div>
          </div>
          {availableReferences.length > 0 && (
            <div>
              <label className="text-[10px] font-medium text-muted-foreground">Source Image</label>
              <Select
                value={draft.scene_reference_id || '__auto__'}
                onValueChange={v => setDraft(d => ({ ...d, scene_reference_id: v === '__auto__' ? undefined : v }))}
              >
                <SelectTrigger className="text-xs h-8">
                  <SelectValue placeholder="Auto (default)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__auto__">Auto (default)</SelectItem>
                  {availableReferences.map(ref => (
                    <SelectItem key={ref.id} value={ref.id}>
                      <span className="flex items-center gap-1.5">
                        <img src={ref.url} className="h-4 w-4 rounded object-cover" alt="" />
                        {ref.name || ref.role}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <label className="text-[10px] font-medium text-muted-foreground">Script Line (optional)</label>
            <Input
              value={draft.script_line || ''}
              onChange={e => setDraft(d => ({ ...d, script_line: e.target.value || undefined }))}
              placeholder="Voiceover or narration..."
              className="text-xs h-8"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4 transition-all group',
        isGenerating && 'border-primary/50 bg-primary/5 animate-pulse',
        isComplete && 'border-green-500/30 bg-green-500/5',
        !isGenerating && !isComplete && 'border-border bg-card'
      )}
    >
      <div className="flex flex-col items-center gap-1 pt-0.5">
        {editable ? (
          <div className="flex flex-col gap-0.5">
            <button
              onClick={onMoveUp}
              disabled={isFirst}
              className="h-6 w-6 flex items-center justify-center text-muted-foreground/60 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs font-bold text-muted-foreground text-center">{shot.shot_index}</span>
            <button
              onClick={onMoveDown}
              disabled={isLast}
              className="h-6 w-6 flex items-center justify-center text-muted-foreground/60 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <>
            <GripVertical className="h-4 w-4 text-muted-foreground/40" />
            <span className="text-xs font-bold text-muted-foreground">{shot.shot_index}</span>
          </>
        )}
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

        <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
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

      {editable && (
        <div className="flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={startEdit}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

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
