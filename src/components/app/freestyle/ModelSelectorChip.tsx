import { useState } from 'react';
import { User, ChevronDown, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { mockModels } from '@/data/mockData';
import { cn } from '@/lib/utils';
import type { ModelProfile } from '@/types';
import { useCustomModels } from '@/hooks/useCustomModels';

interface ModelSelectorChipProps {
  selectedModel: ModelProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (model: ModelProfile | null) => void;
}

type GenderFilter = 'all' | 'female' | 'male';
type BodyFilter = 'all' | 'slim' | 'athletic' | 'average' | 'plus-size';

const GENDER_FILTERS: { value: GenderFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
];

const BODY_FILTERS: { value: BodyFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'slim', label: 'Slim' },
  { value: 'athletic', label: 'Athletic' },
  { value: 'average', label: 'Average' },
  { value: 'plus-size', label: 'Plus' },
];

export function ModelSelectorChip({ selectedModel, open, onOpenChange, onSelect }: ModelSelectorChipProps) {
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all');
  const [bodyFilter, setBodyFilter] = useState<BodyFilter>('all');
  const { asProfiles: customModels } = useCustomModels();

  const allModels = [...mockModels, ...customModels];

  const filtered = allModels.filter(m => {
    if (genderFilter !== 'all' && m.gender !== genderFilter) return false;
    if (bodyFilter !== 'all' && m.bodyType !== bodyFilter) return false;
    return true;
  });

  return (
    <Popover open={open} onOpenChange={onOpenChange} modal>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border border-border bg-muted/50 text-foreground/70 hover:bg-muted transition-colors">
          {selectedModel ? (
            <>
              <img src={selectedModel.previewUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
              <span className="max-w-[80px] truncate">{selectedModel.name}</span>
              <button
                onClick={e => { e.stopPropagation(); onSelect(null); }}
                className="ml-0.5 w-3.5 h-3.5 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30 transition-colors"
              >
                <X className="w-2.5 h-2.5" />
              </button>
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

        {/* Gender filter */}
        <div className="flex gap-1 mb-2">
          {GENDER_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setGenderFilter(f.value)}
              className={cn(
                'px-3 py-1 rounded-full text-[11px] font-medium transition-colors',
                genderFilter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Body type filter */}
        <div className="flex gap-1 mb-3">
          {BODY_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setBodyFilter(f.value)}
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors',
                bodyFilter === f.value
                  ? 'bg-secondary text-secondary-foreground border border-border'
                  : 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/40'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Clear selection */}
        {selectedModel && (
          <button
            onClick={() => { onSelect(null); onOpenChange(false); }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted/80 transition-colors mb-2"
          >
            <X className="w-3 h-3" />
            Clear selection
          </button>
        )}

        {/* Model grid */}
        <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
          {filtered.map(model => (
            <button
              key={model.modelId}
              onClick={() => { onSelect(model); onOpenChange(false); }}
              className={cn(
                'flex flex-col rounded-lg overflow-hidden border-2 transition-all text-left',
                selectedModel?.modelId === model.modelId
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-transparent hover:border-border'
              )}
            >
              <img src={model.previewUrl} alt={model.name} className="w-full aspect-square object-cover rounded-t-md" />
              <div className="px-1.5 py-1 bg-background text-center">
                <p className="text-[10px] font-medium text-foreground truncate">{model.name}</p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-3 text-center text-xs text-muted-foreground py-6">
              No models match these filters
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
