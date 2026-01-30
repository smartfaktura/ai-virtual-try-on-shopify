import { Text } from '@shopify/polaris';
import type { TryOnPose } from '@/types';
import { poseCategoryLabels } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';

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
  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-200 group ${
        isSelected
          ? 'ring-2 ring-primary ring-offset-2 shadow-lg scale-[1.02]'
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
          className="text-[10px] px-2 py-0.5 bg-foreground/80 text-background border-0 shadow-sm backdrop-blur-sm"
        >
          {poseCategoryLabels[pose.category]}
        </Badge>
      </div>

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
