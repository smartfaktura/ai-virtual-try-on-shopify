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
              'h-8 px-3 rounded-full text-[11.5px] border transition-all',
              value === opt.id
                ? 'border-primary bg-primary/[0.06] text-foreground shadow-sm'
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
    <div className="rounded-2xl border border-border bg-card shadow-sm p-5 sm:p-6 space-y-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight text-foreground">Refine Transition</h3>
        <p className="text-[11.5px] text-muted-foreground hidden sm:block">
          Fine-tune the cinematic feel
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
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
