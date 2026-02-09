import type { TryOnPose, PoseCategory } from '@/types';
import { PoseSelectorCard } from './PoseSelectorCard';

interface PoseCategorySectionProps {
  category: PoseCategory;
  poses: TryOnPose[];
  selectedPoseId: string | null;
  onSelectPose: (pose: TryOnPose) => void;
}

const categoryInfo: Record<PoseCategory, { title: string; recommendation: string }> = {
  studio: { title: 'Studio Shots', recommendation: 'Best for e-commerce & product pages' },
  lifestyle: { title: 'Lifestyle', recommendation: 'Best for social media & marketing' },
  editorial: { title: 'Editorial', recommendation: 'Best for campaigns & lookbooks' },
  streetwear: { title: 'Streetwear', recommendation: 'Best for urban & youth brands' },
  'clean-studio': { title: 'Clean Studio', recommendation: 'Best for product-only photography' },
  surface: { title: 'Surface & Texture', recommendation: 'Best for product detail shots' },
  'flat-lay': { title: 'Flat Lay', recommendation: 'Best for overhead compositions' },
  kitchen: { title: 'Kitchen & Dining', recommendation: 'Best for food & beverage products' },
  'living-space': { title: 'Living Space', recommendation: 'Best for home & decor products' },
  bathroom: { title: 'Bathroom & Vanity', recommendation: 'Best for skincare & beauty' },
  botanical: { title: 'Botanical', recommendation: 'Best for wellness & natural products' },
};

export function PoseCategorySection({ category, poses, selectedPoseId, onSelectPose }: PoseCategorySectionProps) {
  const info = categoryInfo[category];
  if (poses.length === 0) return null;

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
        <h3 className="font-bold text-sm">{info.title}</h3>
        <span className="text-[10px] sm:text-xs text-muted-foreground">• {info.recommendation}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {poses.map((pose) => (
          <PoseSelectorCard key={pose.poseId} pose={pose} isSelected={selectedPoseId === pose.poseId} onSelect={() => onSelectPose(pose)} />
        ))}
      </div>
    </div>
  );
}
