import { Text, Icon } from '@shopify/polaris';
import { CheckCircleIcon } from '@shopify/polaris-icons';
import type { ModelProfile } from '@/types';
import { bodyTypeLabels } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';

interface ModelSelectorCardProps {
  model: ModelProfile;
  isSelected: boolean;
  onSelect: () => void;
  showAiMatch?: boolean;
}

export function ModelSelectorCard({
  model,
  isSelected,
  onSelect,
  showAiMatch = false,
}: ModelSelectorCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-200 group ${
        isSelected
          ? 'ring-2 ring-primary ring-offset-2 shadow-lg scale-[1.02]'
          : 'ring-1 ring-border hover:ring-primary hover:shadow-md hover:scale-[1.01]'
      }`}
    >
      {/* Model Image */}
      <div className="aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={model.previewUrl}
          alt={model.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* AI Match Badge - Top Left */}
      {showAiMatch && (
        <div className="absolute top-2 left-2">
          <Badge className="text-[10px] px-2 py-0.5 bg-foreground/80 text-background border-0 shadow-sm">
            AI Match
          </Badge>
        </div>
      )}

      {/* Selected Overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/10 pointer-events-none">
          <div className="absolute top-2 right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}

      {/* Info Footer - Always Visible */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 pt-10">
        <div className="space-y-1.5">
          {/* Name */}
          <Text as="p" variant="bodyMd" fontWeight="bold">
            <span className="text-white">{model.name}</span>
          </Text>
          
          {/* Metadata Badges - Always visible */}
          <div className="flex flex-wrap gap-1">
            <Badge 
              variant="secondary" 
              className="text-[10px] px-1.5 py-0 bg-white/25 text-white border-0 backdrop-blur-sm"
            >
              {bodyTypeLabels[model.bodyType]}
            </Badge>
            <Badge 
              variant="secondary" 
              className="text-[10px] px-1.5 py-0 bg-white/25 text-white border-0 backdrop-blur-sm"
            >
              {model.ethnicity}
            </Badge>
          </div>

          {/* Age Range - Subtle */}
          <Text as="p" variant="bodySm">
            <span className="text-white/70 text-[10px] capitalize">
              {model.ageRange.replace('-', ' ')}
            </span>
          </Text>
        </div>
      </div>
    </div>
  );
}
