import { User, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { mockModels } from '@/data/mockData';
import { cn } from '@/lib/utils';
import type { ModelProfile } from '@/types';

interface ModelSelectorChipProps {
  selectedModel: ModelProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (model: ModelProfile | null) => void;
}

export function ModelSelectorChip({ selectedModel, open, onOpenChange, onSelect }: ModelSelectorChipProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border border-white/[0.08] bg-white/[0.04] text-sidebar-foreground/80 hover:bg-white/[0.08] transition-colors">
          {selectedModel ? (
            <>
              <img src={selectedModel.previewUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
              <span className="max-w-[80px] truncate">{selectedModel.name}</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5" />
              Model
            </>
          )}
          <ChevronDown className="w-3 h-3 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 mb-2">
          Character Reference
        </p>
        <button
          onClick={() => { onSelect(null); onOpenChange(false); }}
          className={cn(
            'w-full text-left px-3 py-2 rounded-lg text-sm mb-2 transition-colors',
            !selectedModel ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
          )}
        >
          No Model
        </button>
        <div className="grid grid-cols-3 gap-1.5 max-h-60 overflow-y-auto pr-1">
          {mockModels.map(model => (
            <button
              key={model.modelId}
              onClick={() => { onSelect(model); onOpenChange(false); }}
              className={cn(
                'relative rounded-lg overflow-hidden border-2 transition-all',
                selectedModel?.modelId === model.modelId
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-transparent hover:border-border'
              )}
            >
              <img src={model.previewUrl} alt={model.name} className="w-full aspect-square object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                <p className="text-[9px] text-white truncate">{model.name}</p>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
