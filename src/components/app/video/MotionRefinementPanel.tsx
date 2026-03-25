import { cn } from '@/lib/utils';
import { CAMERA_MOTIONS, SUBJECT_MOTIONS, REALISM_LEVELS, LOOP_STYLES } from '@/lib/videoMotionRecipes';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface MotionRefinementPanelProps {
  cameraMotion: string;
  subjectMotion: string;
  realismLevel: string;
  loopStyle: string;
  motionIntensity: 'low' | 'medium' | 'high';
  onCameraMotionChange: (v: string) => void;
  onSubjectMotionChange: (v: string) => void;
  onRealismLevelChange: (v: string) => void;
  onLoopStyleChange: (v: string) => void;
  onMotionIntensityChange: (v: 'low' | 'medium' | 'high') => void;
}

function ChipRow({ label, items, value, onChange }: { label: string; items: { id: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              'px-2.5 py-1 rounded-full text-xs border transition-colors',
              value === item.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:border-primary/40'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const INTENSITIES = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
];

export function MotionRefinementPanel(props: MotionRefinementPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-xl border border-border bg-card">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-4 text-sm font-medium text-foreground hover:bg-muted/30 transition-colors rounded-xl">
            Motion Refinement
            <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
            <ChipRow label="Camera Motion" items={CAMERA_MOTIONS} value={props.cameraMotion} onChange={props.onCameraMotionChange} />
            <ChipRow label="Subject Motion" items={SUBJECT_MOTIONS} value={props.subjectMotion} onChange={props.onSubjectMotionChange} />
            <ChipRow label="Realism Level" items={REALISM_LEVELS} value={props.realismLevel} onChange={props.onRealismLevelChange} />
            <ChipRow label="Loop Style" items={LOOP_STYLES} value={props.loopStyle} onChange={props.onLoopStyleChange} />
            <ChipRow label="Motion Intensity" items={INTENSITIES} value={props.motionIntensity} onChange={(v) => props.onMotionIntensityChange(v as 'low' | 'medium' | 'high')} />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
