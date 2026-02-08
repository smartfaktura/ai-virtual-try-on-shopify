import React from 'react';
import { Ban, ChevronDown, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { NegativesChipSelector } from '@/components/app/NegativesChipSelector';
import { cn } from '@/lib/utils';

interface NegativesChipProps {
  negatives: string[];
  onNegativesChange: (negatives: string[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NegativesChip({ negatives, onNegativesChange, open, onOpenChange }: NegativesChipProps) {
  const hasItems = negatives.length > 0;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              className={cn(
                'inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border transition-colors',
                hasItems
                  ? 'border-destructive/30 bg-destructive/10 text-destructive'
                  : 'border-border bg-muted/50 text-foreground/70 hover:bg-muted'
              )}
            >
              <Ban className="w-3.5 h-3.5" />
              {hasItems ? (
                <>
                  <span>Exclude ({negatives.length})</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onNegativesChange([]); }}
                    className="ml-0.5 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <>
                  Exclude
                  <ChevronDown className="w-3 h-3 opacity-40" />
                </>
              )}
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px] text-center">
          Specify things you don't want to appear in the generated images.
        </TooltipContent>
      </Tooltip>

      <PopoverContent className="w-80 p-4" align="start">
        <NegativesChipSelector value={negatives} onChange={onNegativesChange} />
      </PopoverContent>
    </Popover>
  );
}
