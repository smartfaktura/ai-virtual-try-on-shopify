import { cn } from '@/lib/utils';

export interface StylePreset {
  id: string;
  label: string;
  description: string;
}

const STYLE_PRESETS: StylePreset[] = [
  { id: 'product_motion', label: 'Product Motion', description: 'Clean product animation' },
  { id: 'lifestyle', label: 'Lifestyle', description: 'Natural lifestyle movement' },
  { id: 'editorial', label: 'Editorial', description: 'Fashion editorial style' },
  { id: 'beauty', label: 'Beauty', description: 'Beauty close-up motion' },
  { id: 'cinematic', label: 'Cinematic', description: 'Dramatic film quality' },
];

interface StylePresetSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function StylePresetSelector({ value, onChange }: StylePresetSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Output Style</label>
      <div className="flex flex-wrap gap-2">
        {STYLE_PRESETS.map((preset) => (
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

export { STYLE_PRESETS };
