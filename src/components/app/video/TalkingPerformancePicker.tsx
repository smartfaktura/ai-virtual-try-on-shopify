import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type Motion = 'still' | 'natural' | 'expressive';
export type Gaze = 'camera' | 'soft';

export interface Performance {
  motion: Motion;
  gaze: Gaze;
}

const MOTIONS: { value: Motion; label: string; desc: string }[] = [
  { value: 'still', label: 'Still', desc: 'Only mouth & eyes move' },
  { value: 'natural', label: 'Natural', desc: 'Default, subtle life' },
  { value: 'expressive', label: 'Expressive', desc: 'Light head & shoulder shifts' },
];

const GAZES: { value: Gaze; label: string }[] = [
  { value: 'camera', label: 'To camera' },
  { value: 'soft', label: 'Soft / off-camera' },
];

interface Props {
  value: Performance;
  onChange: (v: Performance) => void;
}

function Chip({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
        active
          ? 'border-primary bg-primary/5 text-foreground'
          : 'border-border bg-card text-muted-foreground hover:border-primary/40',
      )}
    >
      {children}
    </button>
  );
}

export function TalkingPerformancePicker({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Motion</Label>
        <div className="flex flex-wrap gap-1.5">
          {MOTIONS.map((m) => (
            <Chip
              key={m.value}
              active={value.motion === m.value}
              onClick={() => onChange({ ...value, motion: m.value })}
            >
              {m.label}
              <span className="ml-1.5 opacity-60 font-normal">{m.desc}</span>
            </Chip>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Gaze</Label>
        <div className="flex flex-wrap gap-1.5">
          {GAZES.map((g) => (
            <Chip
              key={g.value}
              active={value.gaze === g.value}
              onClick={() => onChange({ ...value, gaze: g.value })}
            >
              {g.label}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
