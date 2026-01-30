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
    <div className="space-y-3">
      {/* Category Header */}
      <div className="flex items-baseline gap-2">
        <Text as="h3" variant="headingSm" fontWeight="bold">
          {info.title}
        </Text>
        <Text as="span" variant="bodySm" tone="subdued">
          • {info.recommendation}
        </Text>
      </div>

      {/* Horizontal Scroll Row */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-4">
          {poses.map((pose) => (
            <div key={pose.poseId} className="w-[180px] flex-shrink-0">
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
