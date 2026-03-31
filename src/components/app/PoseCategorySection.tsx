import type { TryOnPose, PoseCategory, ModelGender } from '@/types';
import { PoseSelectorCard } from './PoseSelectorCard';

interface PoseCategorySectionProps {
  category: PoseCategory;
  poses: TryOnPose[];
  selectedPoseId?: string | null;
  selectedPoseIds?: Set<string>;
  onSelectPose: (pose: TryOnPose) => void;
  selectedGender?: ModelGender;
}

const categoryInfo: Record<string, { title: string; recommendation: string }> = {
  studio: { title: 'Studio Shots', recommendation: 'Best for e-commerce & product pages' },
  lifestyle: { title: 'Lifestyle', recommendation: 'Best for social media & marketing' },
  editorial: { title: 'Editorial', recommendation: 'Best for campaigns & lookbooks' },
  streetwear: { title: 'Streetwear', recommendation: 'Best for urban & youth brands' },
  'clean-studio': { title: 'Product Studio', recommendation: 'Best for product-only photography' },
  surface: { title: 'Surface & Texture', recommendation: 'Best for product detail shots' },
  'flat-lay': { title: 'Flat Lay', recommendation: 'Best for overhead compositions' },
  'product-editorial': { title: 'Product Editorial', recommendation: 'Best for styled product storytelling' },
  kitchen: { title: 'Kitchen & Dining', recommendation: 'Best for food & beverage products' },
  'living-space': { title: 'Living Space', recommendation: 'Best for home & decor products' },
  bathroom: { title: 'Bathroom & Vanity', recommendation: 'Best for skincare & beauty' },
  botanical: { title: 'Botanical', recommendation: 'Best for wellness & natural products' },
  outdoor: { title: 'Outdoor', recommendation: 'Best for lifestyle & seasonal campaigns' },
  workspace: { title: 'Workspace & Office', recommendation: 'Best for tech & business products' },
  restaurant: { title: 'Restaurant & Café', recommendation: 'Best for food & hospitality' },
  retail: { title: 'Retail & Display', recommendation: 'Best for retail merchandising' },
  seasonal: { title: 'Seasonal & Holiday', recommendation: 'Best for seasonal campaigns' },
  beauty: { title: 'Beauty & Spa', recommendation: 'Best for beauty & wellness brands' },
  fitness: { title: 'Fitness & Sport', recommendation: 'Best for activewear & sports' },
};

export function PoseCategorySection({ category, poses, selectedPoseId, selectedPoseIds, onSelectPose, selectedGender }: PoseCategorySectionProps) {
  const info = categoryInfo[category] ?? { title: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '), recommendation: '' };
  if (poses.length === 0) return null;

  const isMultiSelect = !!selectedPoseIds;
  const selectedSet = selectedPoseIds || new Set(selectedPoseId ? [selectedPoseId] : []);

  // For multi-select, compute the selection order number
  const getSelectionIndex = (poseId: string): number | undefined => {
    if (!isMultiSelect || !selectedPoseIds?.has(poseId)) return undefined;
    const allSelected = Array.from(selectedPoseIds);
    return allSelected.indexOf(poseId) + 1;
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
        <h3 className="font-bold text-sm">{info.title}</h3>
        <span className="text-[10px] sm:text-xs text-muted-foreground">• {info.recommendation}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {poses.map((pose) => (
          <PoseSelectorCard
            key={pose.poseId}
            pose={pose}
            isSelected={selectedSet.has(pose.poseId)}
            onSelect={() => onSelectPose(pose)}
            selectedGender={selectedGender}
            selectionIndex={getSelectionIndex(pose.poseId)}
            
          />
        ))}
      </div>
    </div>
  );
}
