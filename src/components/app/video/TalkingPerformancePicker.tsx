import { HelpCircle, Sparkles, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type Motion = 'locked' | 'natural' | 'presenter' | 'expressive' | 'cinematic';
export type Gaze = 'camera' | 'soft';
export type CameraMove = 'none' | 'push_in' | 'pull_out' | 'arc' | 'orbit_lr' | 'orbit_rl';

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
  { value: 'expressive', label: 'Expressive', desc: 'Hand gestures, steps, scene life' },
  { value: 'cinematic',  label: 'Cinematic',  desc: 'Walking, full-body, camera moves' },
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
  { value: 'orbit_lr', label: 'Orbit L → R' },
  { value: 'orbit_rl', label: 'Orbit R → L' },
];

const ACTION_SUGGESTIONS = [
  'soft hand gesture',
  'lift product to camera',
  'slow step forward',
  'walk slowly toward camera',
  'gentle orbit around subject',
  'subtle pose change',
  'hair in light breeze',
  'turn shoulder gently',
  'ambient steam in scene',
];

const MAX_ACTION_LEN = 600;

// Words that hint the user wants real motion. If they're typing this on
// Still/Natural we surface a chip to bump the action level.
const HIGH_MOTION_REGEX = /\b(walk|walking|orbit|side angle|profile|full[- ]?body|turn around|step forward|runway|campaign|pose change)\b/i;

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
  const allowsCamera = value.motion === 'expressive' || value.motion === 'cinematic';
  const allowsAction = value.motion !== 'locked';

  const needsLevelBump =
    actionPrompt.length > 0 &&
    HIGH_MOTION_REGEX.test(actionPrompt) &&
    (value.motion === 'locked' || value.motion === 'natural' || value.motion === 'presenter');

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
            <TooltipContent side="right" className="max-w-[260px] text-xs">
              These shape how the model performs and how the scene moves — they don't change the voice. The mouth is always handled by lip-sync, so it stays closed in the base render.
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
                onClick={() => {
                  const nextAllowsCamera = m.value === 'expressive' || m.value === 'cinematic';
                  onChange({
                    ...value,
                    motion: m.value,
                    cameraMove: nextAllowsCamera ? (value.cameraMove ?? 'none') : 'none',
                  });
                }}
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

        {allowsCamera && (
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
            placeholder="e.g. walks slowly toward camera, gently adjusts the strap, orbit camera left to right capturing 3/4 angles"
            rows={3}
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

          {needsLevelBump && (
            <button
              type="button"
              onClick={() => onChange({
                ...value,
                motion: 'cinematic',
                cameraMove: value.cameraMove && value.cameraMove !== 'none' ? value.cameraMove : 'orbit_lr',
              })}
              className="w-full flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-left hover:border-amber-500/50 transition"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
              <div className="text-[11px] text-muted-foreground">
                <span className="text-foreground font-medium">Bump to Cinematic for this prompt.</span>{' '}
                Walking, orbit camera, full-body and side-angle motion only render at Expressive or Cinematic.
              </div>
            </button>
          )}

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {allowsAction
              ? "Talking Video keeps the face toward camera and the mouth closed so lip-sync can paint speech on top. Walking, hand gestures, orbit camera and pose changes all work — full back turns and hands near the mouth do not"
              : 'Action prompt is ignored at Still level — pick Natural or higher'}
          </p>

          <Link
            to="/app/video/start-end"
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition"
          >
            Pure fashion or runway video without speech? Try Start → End Video
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </TooltipProvider>
  );
}
