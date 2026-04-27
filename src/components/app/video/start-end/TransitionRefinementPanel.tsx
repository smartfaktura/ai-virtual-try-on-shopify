import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/app/video/InfoTooltip';
import {
  TRANSITION_STYLES,
  CAMERA_FEELS,
  MOTION_STRENGTHS,
  SMOOTHNESS_LEVELS,
  REALISM_LEVELS,
  type TransitionStyle,
  type CameraFeel,
  type MotionStrength,
  type Smoothness,
  type Realism,
  type SegmentedOption,
} from '@/lib/transitionMotionRecipes';

interface TransitionRefinementPanelProps {
  style: TransitionStyle;
  cameraFeel: CameraFeel;
  motionStrength: MotionStrength;
  smoothness: Smoothness;
  realism: Realism;
  onStyleChange: (v: TransitionStyle) => void;
  onCameraFeelChange: (v: CameraFeel) => void;
  onMotionStrengthChange: (v: MotionStrength) => void;
  onSmoothnessChange: (v: Smoothness) => void;
  onRealismChange: (v: Realism) => void;
}

interface SegmentedRowProps<T extends string> {
  label: string;
  tooltip: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
}

function SegmentedRow<T extends string>({ label, tooltip, options, value, onChange }: SegmentedRowProps<T>) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        <label className="text-xs text-muted-foreground">{label}</label>
        <InfoTooltip text={tooltip} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs border transition-colors',
              value === opt.id
                ? 'border-primary bg-primary/5 text-foreground'
                : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TransitionRefinementPanel(props: TransitionRefinementPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <h3 className="text-sm font-medium text-foreground">Refine Transition</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SegmentedRow
          label="Style"
          tooltip="Overall finishing aesthetic of the transition."
          options={TRANSITION_STYLES}
          value={props.style}
          onChange={props.onStyleChange}
        />
        <SegmentedRow
          label="Camera feel"
          tooltip="How the camera moves between the two frames."
          options={CAMERA_FEELS}
          value={props.cameraFeel}
          onChange={props.onCameraFeelChange}
        />
        <SegmentedRow
          label="Motion strength"
          tooltip="Lower keeps the AI closer to your frames; higher allows more motion freedom."
          options={MOTION_STRENGTHS}
          value={props.motionStrength}
          onChange={props.onMotionStrengthChange}
        />
        <SegmentedRow
          label="Smoothness"
          tooltip="Pacing of the transition over its 5-second duration."
          options={SMOOTHNESS_LEVELS}
          value={props.smoothness}
          onChange={props.onSmoothnessChange}
        />
        <SegmentedRow
          label="Realism"
          tooltip="Visual fidelity of the rendered transition."
          options={REALISM_LEVELS}
          value={props.realism}
          onChange={props.onRealismChange}
        />
      </div>
    </div>
  );
}
