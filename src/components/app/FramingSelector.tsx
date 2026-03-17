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
      <div className="flex flex-nowrap overflow-x-auto gap-2 pb-1 scrollbar-hide sm:grid sm:grid-cols-5 sm:overflow-visible sm:pb-0">
        {allOptions.map(opt => (
          <button
            key={opt.value ?? 'auto'}
            onClick={() => onFramingChange(opt.value)}
            className={cn(
              'flex flex-col items-center gap-1 min-w-[4.5rem] sm:min-w-0 px-1.5 py-2 sm:px-2 sm:py-3 rounded-xl border-2 text-center transition-all',
              framing === opt.value
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
            )}
          >
            {opt.previewUrl ? (
              <img src={opt.previewUrl} alt={opt.label} className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg object-cover" />
            ) : (
              <Frame className="w-10 h-10 sm:w-14 sm:h-14" />
            )}
            <span className="text-[10px] sm:text-[11px] font-medium leading-tight">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
