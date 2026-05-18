import { HelpCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type Motion = 'locked' | 'natural' | 'presenter';
export type Gaze = 'camera' | 'soft';

export interface Performance {
  motion: Motion;
  gaze: Gaze;
}

const ENERGY: { value: Motion; label: string; desc: string }[] = [
  { value: 'locked',    label: 'Still',     desc: 'Only mouth, eyes, breathing' },
  { value: 'natural',   label: 'Natural',   desc: 'Subtle facial life, micro nods' },
  { value: 'presenter', label: 'Presenter', desc: 'Confident delivery, small nods' },
];

const EYE_CONTACT: { value: Gaze; label: string; desc: string }[] = [
  { value: 'camera', label: 'Direct',  desc: 'Eyes locked on the camera' },
  { value: 'soft',   label: 'Relaxed', desc: 'Occasional natural glance away' },
];

interface Props {
  value: Performance;
  onChange: (v: Performance) => void;
}

function Option<T extends string>({
  active, onClick, label, desc,
}: { active: boolean; onClick: () => void; label: string; desc: string; _t?: T }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 rounded-lg border px-3 py-2.5 text-left transition-all',
        active
          ? 'border-primary bg-primary/5 text-foreground'
          : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
      )}
    >
      <div className="text-xs font-medium">{label}</div>
      <div className="text-[10px] opacity-70 mt-0.5">{desc}</div>
    </button>
  );
}

export function TalkingPerformancePicker({ value, onChange }: Props) {
  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-4">
        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[220px] text-xs">
              These shape how the model performs while speaking — they don't change the voice.
            </TooltipContent>
          </Tooltip>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Delivery</span>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Energy</Label>
          <div className="flex flex-wrap gap-1.5">
            {ENERGY.map((m) => (
              <Option
                key={m.value}
                active={value.motion === m.value}
                onClick={() => onChange({ ...value, motion: m.value })}
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
      </div>
    </TooltipProvider>
  );
}
