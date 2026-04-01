import { cn } from '@/lib/utils';
import { CAMERA_MOTIONS, SUBJECT_MOTIONS, REALISM_LEVELS, LOOP_STYLES } from '@/lib/videoMotionRecipes';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Check } from 'lucide-react';
import { useState } from 'react';
import { InfoTooltip } from './InfoTooltip';
import { Badge } from '@/components/ui/badge';

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
  /** Paid-only: allow selecting multiple camera motions */
  multiSelect?: boolean;
  selectedCameraMotions?: string[];
  onMultiCameraMotionChange?: (ids: string[]) => void;
}

function ChipRow({ label, tooltip, items, value, onChange }: { label: string; tooltip?: string; items: { id: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        <label className="text-xs text-muted-foreground">{label}</label>
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
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

function MultiChipRow({ label, tooltip, items, selected, onChange }: { label: string; tooltip?: string; items: { id: string; label: string }[]; selected: string[]; onChange: (ids: string[]) => void }) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      // Don't allow deselecting the last one
      if (selected.length <= 1) return;
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-xs text-muted-foreground">{label}</label>
        {tooltip && <InfoTooltip text={tooltip} />}
        {selected.length > 1 && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
            {selected.length} selected → {selected.length} videos
          </Badge>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => {
          const isSelected = selected.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs border transition-colors flex items-center gap-1',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/40'
              )}
            >
              {isSelected && selected.length > 1 && <Check className="h-3 w-3" />}
              {item.label}
            </button>
          );
        })}
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
  const [open, setOpen] = useState(true);

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
            {props.multiSelect && props.selectedCameraMotions && props.onMultiCameraMotionChange ? (
              <MultiChipRow
                label="Camera Motion"
                tooltip="Select multiple camera motions to generate a separate video for each. Controls how the virtual camera moves during the video."
                items={CAMERA_MOTIONS}
                selected={props.selectedCameraMotions}
                onChange={props.onMultiCameraMotionChange}
              />
            ) : (
              <ChipRow label="Camera Motion" tooltip="Controls how the virtual camera moves during the video. Affects framing but not the subject." items={CAMERA_MOTIONS} value={props.cameraMotion} onChange={props.onCameraMotionChange} />
            )}
            <ChipRow label="Subject Motion" tooltip="Defines how the main subject moves. 'Auto' uses AI analysis to pick the best motion type." items={SUBJECT_MOTIONS} value={props.subjectMotion} onChange={props.onSubjectMotionChange} />
            <ChipRow label="Realism Level" tooltip="Higher realism enforces stricter motion limits and preservation. Stylized allows more creative freedom." items={REALISM_LEVELS} value={props.realismLevel} onChange={props.onRealismLevelChange} />
            <ChipRow label="Loop Style" tooltip="Controls whether the video loops seamlessly. Seamless Loop constrains motion to cyclic patterns." items={LOOP_STYLES} value={props.loopStyle} onChange={props.onLoopStyleChange} />
            <ChipRow label="Motion Intensity" tooltip="How much overall movement appears. Higher intensity means more dramatic motion but may reduce stability." items={INTENSITIES} value={props.motionIntensity} onChange={(v) => props.onMotionIntensityChange(v as 'low' | 'medium' | 'high')} />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}