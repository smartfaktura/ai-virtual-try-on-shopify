import type { ModelProfile } from '@/types';
import { bodyTypeLabels } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';

interface ModelSelectorCardProps {
  model: ModelProfile;
  isSelected: boolean;
  onSelect: () => void;
  showAiMatch?: boolean;
}

export function ModelSelectorCard({ model, isSelected, onSelect, showAiMatch = false }: ModelSelectorCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-lg sm:rounded-xl overflow-hidden transition-all duration-200 group ${
        isSelected ? 'ring-2 ring-primary ring-offset-1 sm:ring-offset-2 shadow-lg scale-[1.02]' : 'ring-1 ring-border hover:ring-primary hover:shadow-md hover:scale-[1.01]'
      }`}
    >
      <div className="aspect-[3/4] overflow-hidden bg-muted">
        <img src={model.previewUrl} alt={model.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      {showAiMatch && (
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
          <Badge className="text-[8px] sm:text-[10px] px-1.5 py-0.5 bg-foreground/80 text-background border-0 shadow-sm">AI Match</Badge>
        </div>
      )}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/10 pointer-events-none">
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-5 h-5 sm:w-7 sm:h-7 bg-primary rounded-full flex items-center justify-center shadow-md">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-2 sm:p-3 pt-6 sm:pt-10">
        <div className="space-y-1 sm:space-y-1.5">
          <p className="text-white text-xs sm:text-sm font-bold">{model.name}</p>
          <div className="flex flex-wrap gap-0.5 sm:gap-1">
            <Badge variant="secondary" className="text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0 bg-white/25 text-white border-0 backdrop-blur-sm">{bodyTypeLabels[model.bodyType]}</Badge>
            <Badge variant="secondary" className="text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0 bg-white/25 text-white border-0 backdrop-blur-sm hidden sm:inline-flex">{model.ethnicity}</Badge>
          </div>
          <p className="text-white/70 text-[8px] sm:text-[10px] capitalize hidden sm:inline">{model.ageRange.replace('-', ' ')}</p>
        </div>
      </div>
    </div>
  );
}
