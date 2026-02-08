import { cn } from '@/lib/utils';

export interface StylePreset {
  id: string;
  label: string;
  keywords: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  { id: 'cinematic', label: 'Cinematic', keywords: 'cinematic lighting, shallow depth of field, warm tones, dramatic shadows, film grain' },
  { id: 'editorial', label: 'Editorial', keywords: 'editorial photography, clean composition, high-fashion lighting, magazine-quality' },
  { id: 'minimal', label: 'Minimal', keywords: 'minimalist composition, clean background, negative space, soft diffused light' },
  { id: 'moody', label: 'Moody', keywords: 'moody atmosphere, low-key lighting, rich shadows, desaturated tones, dramatic contrast' },
  { id: 'bright', label: 'Bright', keywords: 'bright and airy, natural daylight, soft shadows, pastel undertones, high-key lighting' },
  { id: 'vintage', label: 'Vintage', keywords: 'vintage film aesthetic, muted warm tones, subtle grain, analog photography feel' },
];

interface StylePresetChipsProps {
  selected: string[];
  onChange: (ids: string[]) => void;
}

export function StylePresetChips({ selected, onChange }: StylePresetChipsProps) {
  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter(s => s !== id)
        : [...selected, id]
    );
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {STYLE_PRESETS.map(preset => (
        <button
          key={preset.id}
          onClick={() => toggle(preset.id)}
          className={cn(
            'h-7 px-2.5 rounded-full text-[11px] font-medium border transition-colors',
            selected.includes(preset.id)
              ? 'border-primary/40 bg-primary/10 text-primary'
              : 'border-border/60 bg-muted/30 text-muted-foreground/60 hover:bg-muted/60 hover:text-foreground/70'
          )}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
