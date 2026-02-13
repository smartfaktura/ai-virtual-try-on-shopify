import { Frame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FRAMING_OPTIONS } from '@/lib/framingUtils';
import type { FramingOption } from '@/types';

// Same inline SVG icons as FramingSelectorChip
const FramingIcon = ({ framing, className }: { framing: FramingOption | null; className?: string }) => {
  const cls = cn('w-5 h-5', className);
  switch (framing) {
    case 'full_body':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="4" r="2.5" />
          <path d="M12 7v6M8 20l2-7M16 20l-2-7M8 10h8" />
        </svg>
      );
    case 'upper_body':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="5" r="2.5" />
          <path d="M12 8v6M7 11c2-1 3-2 5-2s3 1 5 2" />
          <line x1="4" y1="18" x2="20" y2="18" strokeDasharray="2 2" opacity="0.4" />
        </svg>
      );
    case 'close_up':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="8" r="4" />
          <path d="M8 14c1 1 3 2 4 2s3-1 4-2" />
          <line x1="4" y1="18" x2="20" y2="18" strokeDasharray="2 2" opacity="0.4" />
        </svg>
      );
    case 'hand_wrist':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 20v-6M10 14h4M9 8l3-1 3 1M9 8v3a3 3 0 003 3 3 3 0 003-3V8" />
          <rect x="9" y="17" width="6" height="2" rx="1" opacity="0.5" />
        </svg>
      );
    case 'neck_shoulders':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="6" r="3" />
          <path d="M6 16c2-3 4-5 6-5s4 2 6 5" />
          <path d="M10 12v2M14 12v2" opacity="0.5" />
        </svg>
      );
    case 'lower_body':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="4" y1="4" x2="20" y2="4" strokeDasharray="2 2" opacity="0.4" />
          <path d="M10 4v8l-2 8M14 4v8l2 8" />
          <rect x="7" y="19" width="3" height="2" rx="0.5" />
          <rect x="14" y="19" width="3" height="2" rx="0.5" />
        </svg>
      );
    case 'back_view':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="5" r="2.5" />
          <path d="M12 8v7M8 20l2-5M16 20l-2-5M8 11h8" />
          <path d="M10 11v4h4v-4" opacity="0.3" />
        </svg>
      );
    default:
      return <Frame className={cls} />;
  }
};

interface FramingSelectorProps {
  framing: FramingOption | null;
  onFramingChange: (framing: FramingOption | null) => void;
}

const allOptions = [
  { value: null as FramingOption | null, label: 'Auto', description: 'AI decides' },
  ...FRAMING_OPTIONS.map(o => ({ value: o.value as FramingOption | null, label: o.label, description: o.description })),
];

export function FramingSelector({ framing, onFramingChange }: FramingSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Framing</label>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {allOptions.map(opt => (
          <button
            key={opt.value ?? 'auto'}
            onClick={() => onFramingChange(opt.value)}
            className={cn(
              'flex flex-col items-center gap-1.5 min-w-[72px] px-3 py-2.5 rounded-xl border-2 text-center transition-all flex-shrink-0',
              framing === opt.value
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
            )}
          >
            <FramingIcon framing={opt.value} className="w-5 h-5" />
            <span className="text-[11px] font-medium leading-tight">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
