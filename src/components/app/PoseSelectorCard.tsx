import { Text, Icon } from '@shopify/polaris';
import { CheckCircleIcon } from '@shopify/polaris-icons';
import type { TryOnPose } from '@/types';
import { poseCategoryLabels } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PoseSelectorCardProps {
  pose: TryOnPose;
  isSelected: boolean;
  onSelect: () => void;
}

export function PoseSelectorCard({
  pose,
  isSelected,
  onSelect,
}: PoseSelectorCardProps) {
  const categoryColors: Record<string, string> = {
    studio: 'bg-blue-500/80',
    lifestyle: 'bg-emerald-500/80',
    editorial: 'bg-purple-500/80',
    streetwear: 'bg-orange-500/80',
  };

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
            {/* Pose Preview Image */}
            <div className="aspect-[4/5] overflow-hidden bg-muted">
              <img
                src={pose.previewUrl}
                alt={pose.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Category Badge */}
            <div className="absolute top-2 left-2">
              <Badge 
                className={`text-[10px] px-2 py-0.5 ${categoryColors[pose.category]} text-white border-0 shadow-sm`}
              >
                {poseCategoryLabels[pose.category]}
              </Badge>
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
                <span className="text-white">{pose.name}</span>
              </Text>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{pose.name}</p>
            <p className="text-xs text-muted-foreground">
              {pose.description}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
