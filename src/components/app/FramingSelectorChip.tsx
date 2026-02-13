import React from 'react';
import { Frame, Check, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { FRAMING_OPTIONS } from '@/lib/framingUtils';
import type { FramingOption } from '@/types';

// Inline SVG silhouettes for each framing option
const FramingIcon = ({ framing, className }: { framing: FramingOption | null; className?: string }) => {
  const cls = cn('w-4 h-4', className);
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

interface FramingSelectorChipProps {
  framing: FramingOption | null;
  onFramingChange: (framing: FramingOption | null) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FramingSelectorChip({ framing, onFramingChange, open, onOpenChange }: FramingSelectorChipProps) {
  const selectedOption = FRAMING_OPTIONS.find(o => o.value === framing);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button className={cn(
          'inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border transition-colors',
          framing
            ? 'border-primary/30 bg-primary/10 text-primary'
            : 'border-border bg-muted/50 text-foreground/70 hover:bg-muted'
        )}>
          <FramingIcon framing={framing} className="w-3.5 h-3.5" />
          {selectedOption ? selectedOption.label : 'Framing'}
          {framing && (
            <span
              onClick={(e) => { e.stopPropagation(); onFramingChange(null); }}
              className="ml-0.5 hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-1.5" align="start">
        {/* None / Auto option */}
        <button
          onClick={() => { onFramingChange(null); onOpenChange(false); }}
          className={cn(
            'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-start gap-3',
            !framing ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
          )}
        >
          <Frame className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-[13px]">None (Auto)</div>
            <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">AI decides framing naturally</div>
          </div>
          {!framing && <span className="text-primary mt-0.5">✓</span>}
        </button>

        {FRAMING_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => { onFramingChange(opt.value); onOpenChange(false); }}
            className={cn(
              'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-start gap-3',
              framing === opt.value ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
            )}
          >
            <FramingIcon framing={opt.value} className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[13px]">{opt.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{opt.description}</div>
            </div>
            {framing === opt.value && <span className="text-primary mt-0.5">✓</span>}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
