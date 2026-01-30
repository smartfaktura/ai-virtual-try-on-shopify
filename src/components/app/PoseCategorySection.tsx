import { Text } from '@shopify/polaris';
import type { TryOnPose, PoseCategory } from '@/types';
import { PoseSelectorCard } from './PoseSelectorCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface PoseCategorySectionProps {
  category: PoseCategory;
  poses: TryOnPose[];
  selectedPoseId: string | null;
  onSelectPose: (pose: TryOnPose) => void;
}

const categoryInfo: Record<PoseCategory, { title: string; recommendation: string }> = {
  studio: {
    title: 'Studio Shots',
    recommendation: 'Best for e-commerce & product pages',
  },
  lifestyle: {
    title: 'Lifestyle',
    recommendation: 'Best for social media & marketing',
  },
  editorial: {
    title: 'Editorial',
    recommendation: 'Best for campaigns & lookbooks',
  },
  streetwear: {
    title: 'Streetwear',
    recommendation: 'Best for urban & youth brands',
  },
};

export function PoseCategorySection({
  category,
  poses,
  selectedPoseId,
  onSelectPose,
}: PoseCategorySectionProps) {
  const info = categoryInfo[category];
  
  if (poses.length === 0) return null;

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Category Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
        <Text as="h3" variant="headingSm" fontWeight="bold">
          {info.title}
        </Text>
        <Text as="span" variant="bodySm" tone="subdued">
          <span className="text-[10px] sm:text-xs">• {info.recommendation}</span>
        </Text>
      </div>

      {/* Horizontal Scroll Row */}
      <ScrollArea className="w-full whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-3 sm:gap-4 pb-3 sm:pb-4">
          {poses.map((pose) => (
            <div key={pose.poseId} className="w-[140px] sm:w-[180px] flex-shrink-0">
              <PoseSelectorCard
                pose={pose}
                isSelected={selectedPoseId === pose.poseId}
                onSelect={() => onSelectPose(pose)}
              />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
