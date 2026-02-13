import { Frame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FRAMING_OPTIONS } from '@/lib/framingUtils';
import type { FramingOption } from '@/types';

interface FramingSelectorProps {
  framing: FramingOption | null;
  onFramingChange: (framing: FramingOption | null) => void;
}

const allOptions = [
  { value: null as FramingOption | null, label: 'Auto', description: 'AI decides', previewUrl: null },
  ...FRAMING_OPTIONS.map(o => ({ value: o.value as FramingOption | null, label: o.label, description: o.description, previewUrl: o.previewUrl })),
];

export function FramingSelector({ framing, onFramingChange }: FramingSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Framing</label>
      <div className="flex gap-2 flex-wrap">
        {allOptions.map(opt => (
          <button
            key={opt.value ?? 'auto'}
            onClick={() => onFramingChange(opt.value)}
            className={cn(
              'flex flex-col items-center gap-1.5 min-w-[80px] px-3 py-2.5 rounded-xl border-2 text-center transition-all',
              framing === opt.value
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
            )}
          >
            {opt.previewUrl ? (
              <img src={opt.previewUrl} alt={opt.label} className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <Frame className="w-10 h-10" />
            )}
            <span className="text-[11px] font-medium leading-tight">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
