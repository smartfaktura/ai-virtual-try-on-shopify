import { Text, Icon } from '@shopify/polaris';
import { CheckCircleIcon } from '@shopify/polaris-icons';
import type { TryOnPose } from '@/types';
import { poseCategoryLabels } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';

interface PoseSelectorCardProps {
  pose: TryOnPose;
  isSelected: boolean;
  onSelect: () => void;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  studio: { bg: 'bg-blue-500', text: 'text-white' },
  lifestyle: { bg: 'bg-emerald-500', text: 'text-white' },
  editorial: { bg: 'bg-purple-500', text: 'text-white' },
  streetwear: { bg: 'bg-orange-500', text: 'text-white' },
};

export function PoseSelectorCard({
  pose,
  isSelected,
  onSelect,
}: PoseSelectorCardProps) {
  const colors = categoryColors[pose.category] || categoryColors.studio;

  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-200 group ${
        isSelected
          ? 'ring-2 ring-shopify-green ring-offset-2 shadow-lg scale-[1.02]'
          : 'ring-1 ring-border hover:ring-primary hover:shadow-md hover:scale-[1.01]'
      }`}
    >
      {/* Pose Preview Image */}
      <div className="aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={pose.previewUrl}
          alt={pose.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Category Badge - Top Left */}
      <div className="absolute top-2 left-2">
        <Badge 
          className={`text-[10px] px-2 py-0.5 ${colors.bg} ${colors.text} border-0 shadow-sm`}
        >
          {poseCategoryLabels[pose.category]}
        </Badge>
      </div>

      {/* Selected Overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-shopify-green/10 pointer-events-none">
          <div className="absolute top-2 right-2 w-7 h-7 bg-shopify-green rounded-full flex items-center justify-center shadow-md">
            <Icon source={CheckCircleIcon} tone="base" />
          </div>
        </div>
      )}

      {/* Info Footer - With visible description */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 pt-10">
        <div className="space-y-1">
          {/* Name */}
          <Text as="p" variant="bodyMd" fontWeight="bold">
            <span className="text-white">{pose.name}</span>
          </Text>
          
          {/* Description - Always visible now */}
          <Text as="p" variant="bodySm">
            <span className="text-white/80 text-[11px] line-clamp-2">
              {pose.description}
            </span>
          </Text>
        </div>
      </div>
    </div>
  );
}
