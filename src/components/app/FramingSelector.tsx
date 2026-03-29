import { Frame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FRAMING_OPTIONS } from '@/lib/framingUtils';
import type { FramingOption } from '@/types';
import { getOptimizedUrl } from '@/lib/imageOptimization';

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
              <img src={getOptimizedUrl(opt.previewUrl, { quality: 60 })} alt={opt.label} className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg object-cover" />
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

// Multi-select framing
interface FramingMultiSelectorProps {
  selectedFramings: Set<string>; // 'auto' | FramingOption values
  onSelectedFramingsChange: (framings: Set<string>) => void;
}

export function FramingMultiSelector({ selectedFramings, onSelectedFramingsChange }: FramingMultiSelectorProps) {
  const toggle = (value: string) => {
    const next = new Set(selectedFramings);
    if (value === 'auto') {
      // If selecting auto, clear all others
      if (next.has('auto')) {
        next.delete('auto');
      } else {
        next.clear();
        next.add('auto');
      }
    } else {
      // If selecting a specific framing, remove auto
      next.delete('auto');
      if (next.has(value)) {
        next.delete(value);
        // If nothing left, default back to auto
        if (next.size === 0) next.add('auto');
      } else {
        next.add(value);
      }
    }
    onSelectedFramingsChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Framing</label>
        {selectedFramings.size > 1 && !selectedFramings.has('auto') && (
          <p className="text-xs text-muted-foreground">{selectedFramings.size} framings × each scene</p>
        )}
      </div>
      <div className="flex flex-nowrap overflow-x-auto gap-2 pb-1 scrollbar-hide sm:grid sm:grid-cols-5 sm:overflow-visible sm:pb-0">
        {/* Auto option */}
        <button
          onClick={() => toggle('auto')}
          className={cn(
            'flex flex-col items-center gap-1 min-w-[4.5rem] sm:min-w-0 px-1.5 py-2 sm:px-2 sm:py-3 rounded-xl border-2 text-center transition-all',
            selectedFramings.has('auto')
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
          )}
        >
          <Frame className="w-10 h-10 sm:w-14 sm:h-14" />
          <span className="text-[10px] sm:text-[11px] font-medium leading-tight">Auto</span>
        </button>

        {FRAMING_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={cn(
              'flex flex-col items-center gap-1 min-w-[4.5rem] sm:min-w-0 px-1.5 py-2 sm:px-2 sm:py-3 rounded-xl border-2 text-center transition-all',
              selectedFramings.has(opt.value)
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
            )}
          >
            {opt.previewUrl ? (
              <img src={getOptimizedUrl(opt.previewUrl, { quality: 60 })} alt={opt.label} className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg object-cover" />
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
