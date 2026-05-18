import { HelpCircle, Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type Motion = 'locked' | 'natural' | 'presenter' | 'expressive' | 'cinematic';
export type Gaze = 'camera' | 'soft';
export type CameraMove = 'none' | 'push_in' | 'pull_out' | 'arc';

export interface Performance {
  motion: Motion;
  gaze: Gaze;
  cameraMove?: CameraMove;
  actionPrompt?: string;
}

const ENERGY: { value: Motion; label: string; desc: string }[] = [
  { value: 'locked',     label: 'Still',      desc: 'Only mouth, eyes, breathing' },
  { value: 'natural',    label: 'Natural',    desc: 'Subtle facial life, micro nods' },
  { value: 'presenter',  label: 'Presenter',  desc: 'Confident delivery, small nods' },
  { value: 'expressive', label: 'Expressive', desc: 'Hand gestures, shoulder sway, scene life' },
  { value: 'cinematic',  label: 'Cinematic',  desc: 'Editorial motion + slow camera move' },
];

const EYE_CONTACT: { value: Gaze; label: string; desc: string }[] = [
  { value: 'camera', label: 'Direct',  desc: 'Eyes locked on the camera' },
  { value: 'soft',   label: 'Relaxed', desc: 'Occasional natural glance away' },
];

const CAMERA_MOVES: { value: CameraMove; label: string }[] = [
  { value: 'none',     label: 'None' },
  { value: 'push_in',  label: 'Slow push-in' },
  { value: 'pull_out', label: 'Slow pull-out' },
  { value: 'arc',      label: 'Slow arc' },
];

const ACTION_SUGGESTIONS = [
  'soft hand gesture',
  'lift product to camera',
  'slow step forward',
  'hair in light breeze',
  'turn shoulder gently',
  'ambient steam in scene',
];

const MAX_ACTION_LEN = 240;

interface Props {
  value: Performance;
  onChange: (v: Performance) => void;
}

function Option({
  active, onClick, label, desc,
}: { active: boolean; onClick: () => void; label: string; desc?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 rounded-lg border px-3 py-2.5 text-left transition-all min-w-[120px]',
        active
          ? 'border-primary bg-primary/5 text-foreground'
          : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
      )}
    >
      <div className="text-xs font-medium">{label}</div>
      {desc && <div className="text-[10px] opacity-70 mt-0.5">{desc}</div>}
    </button>
  );
}

export function TalkingPerformancePicker({ value, onChange }: Props) {
  const cameraMove = value.cameraMove ?? 'none';
  const actionPrompt = value.actionPrompt ?? '';
  const isCinematic = value.motion === 'cinematic';
  const allowsAction = value.motion !== 'locked';

  const appendChip = (chip: string) => {
    const next = actionPrompt.trim().length === 0
      ? chip
      : `${actionPrompt.trim()}, ${chip}`;
    if (next.length > MAX_ACTION_LEN) return;
    onChange({ ...value, actionPrompt: next });
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-5">
        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[240px] text-xs">
              These shape how the model performs and how the scene moves — they don't change the voice. The mouth is always handled by lip-sync.
            </TooltipContent>
          </Tooltip>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Delivery & action</span>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Action level</Label>
          <div className="flex flex-wrap gap-1.5">
            {ENERGY.map((m) => (
              <Option
                key={m.value}
                active={value.motion === m.value}
                onClick={() => onChange({
                  ...value,
                  motion: m.value,
                  cameraMove: m.value === 'cinematic' ? (value.cameraMove ?? 'push_in') : 'none',
                })}
                label={m.label}
                desc={m.desc}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Eye contact</Label>
          <div className="flex flex-wrap gap-1.5">
            {EYE_CONTACT.map((g) => (
              <Option
                key={g.value}
                active={value.gaze === g.value}
                onClick={() => onChange({ ...value, gaze: g.value })}
                label={g.label}
                desc={g.desc}
              />
            ))}
          </div>
        </div>

        {isCinematic && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Camera move</Label>
            <div className="flex flex-wrap gap-1.5">
              {CAMERA_MOVES.map((c) => (
                <Option
                  key={c.value}
                  active={cameraMove === c.value}
                  onClick={() => onChange({ ...value, cameraMove: c.value })}
                  label={c.label}
                />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Custom action prompt
              <span className="text-[10px] opacity-70">optional</span>
            </Label>
            <span className={cn(
              'text-[10px] tabular-nums',
              actionPrompt.length > MAX_ACTION_LEN ? 'text-destructive' : 'text-muted-foreground',
            )}>
              {actionPrompt.length}/{MAX_ACTION_LEN}
            </span>
          </div>
          <Textarea
            value={actionPrompt}
            onChange={(e) => {
              const v = e.target.value.slice(0, MAX_ACTION_LEN);
              onChange({ ...value, actionPrompt: v });
            }}
            placeholder="e.g. holds the bottle up to the light, soft scarf flutter, slow step forward"
            rows={2}
            disabled={!allowsAction}
            className="text-sm resize-none"
          />
          <div className="flex flex-wrap gap-1.5">
            {ACTION_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => appendChip(s)}
                disabled={!allowsAction}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                + {s}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {allowsAction
              ? "Describe body, hands, scene or camera motion. Mouth and lip-sync are handled automatically — don't describe speaking"
              : 'Action prompt is ignored at Still level — pick Natural or higher'}
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
