import React from 'react';
import { Frame, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { FRAMING_OPTIONS } from '@/lib/framingUtils';
import type { FramingOption } from '@/types';

const FramingThumbnail = ({ framing, size = 16 }: { framing: FramingOption | null; size?: number }) => {
  if (!framing) return <Frame className="flex-shrink-0" style={{ width: size, height: size }} />;
  const option = FRAMING_OPTIONS.find(o => o.value === framing);
  if (!option) return <Frame className="flex-shrink-0" style={{ width: size, height: size }} />;
  return (
    <img
      src={option.previewUrl}
      alt={option.label}
      className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size }}
    />
  );
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
          <FramingThumbnail framing={framing} size={16} />
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
            <img
              src={opt.previewUrl}
              alt={opt.label}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
            />
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
