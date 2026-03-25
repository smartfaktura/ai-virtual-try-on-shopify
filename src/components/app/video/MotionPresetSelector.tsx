import { cn } from '@/lib/utils';

export interface MotionPreset {
  id: string;
  label: string;
  description: string;
}

const MOTION_PRESETS: MotionPreset[] = [
  { id: 'slow_push_in', label: 'Slow Push-in', description: 'Gradual forward movement' },
  { id: 'camera_drift', label: 'Camera Drift', description: 'Subtle natural sway' },
  { id: 'product_orbit', label: 'Product Orbit', description: 'Smooth rotation around subject' },
  { id: 'gentle_pan', label: 'Gentle Pan', description: 'Horizontal sweep' },
  { id: 'premium_handheld', label: 'Premium Handheld', description: 'Cinematic slight shake' },
  { id: 'minimal', label: 'Minimal', description: 'Near-still with micro motion' },
];

interface MotionPresetSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MotionPresetSelector({ value, onChange }: MotionPresetSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Motion Recipe</label>
      <div className="flex flex-wrap gap-2">
        {MOTION_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onChange(preset.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm border transition-colors',
              value === preset.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
            )}
            title={preset.description}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export { MOTION_PRESETS };
