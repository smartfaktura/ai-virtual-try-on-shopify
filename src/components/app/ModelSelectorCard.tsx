import { Text, Icon } from '@shopify/polaris';
import { CheckCircleIcon } from '@shopify/polaris-icons';
import type { ModelProfile } from '@/types';
import { bodyTypeLabels } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ModelSelectorCardProps {
  model: ModelProfile;
  isSelected: boolean;
  onSelect: () => void;
}

export function ModelSelectorCard({
  model,
  isSelected,
  onSelect,
}: ModelSelectorCardProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={onSelect}
            className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-200 group ${
              isSelected
                ? 'ring-2 ring-shopify-green ring-offset-2 shadow-lg'
                : 'ring-1 ring-border hover:ring-primary hover:shadow-md'
            }`}
          >
            {/* Model Image */}
            <div className="aspect-[4/5] overflow-hidden bg-muted">
              <img
                src={model.previewUrl}
                alt={model.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Selected Overlay */}
            {isSelected && (
              <div className="absolute inset-0 bg-shopify-green/10 flex items-start justify-end p-2">
                <div className="w-7 h-7 bg-shopify-green rounded-full flex items-center justify-center shadow-md">
                  <Icon source={CheckCircleIcon} tone="base" />
                </div>
              </div>
            )}

            {/* Info Footer */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3 pt-8">
              <Text as="p" variant="bodySm" fontWeight="semibold">
                <span className="text-white">{model.name}</span>
              </Text>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-white/20 text-white border-0">
                  {bodyTypeLabels[model.bodyType]}
                </Badge>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-white/20 text-white border-0">
                  {model.ethnicity}
                </Badge>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{model.name}</p>
            <p className="text-xs text-muted-foreground">
              {model.gender === 'female' ? 'Female' : model.gender === 'male' ? 'Male' : 'Non-Binary'} • {bodyTypeLabels[model.bodyType]} • {model.ethnicity}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {model.ageRange.replace('-', ' ')}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
