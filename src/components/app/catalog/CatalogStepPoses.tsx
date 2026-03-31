import { useMemo } from 'react';
import { mockTryOnPoses } from '@/data/mockData';
import { PoseCategorySection } from '@/components/app/PoseCategorySection';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { TryOnPose, PoseCategory } from '@/types';

const CATALOG_MAX_POSES = 6;

interface CatalogStepPosesProps {
  selectedPoseIds: Set<string>;
  onTogglePose: (poseId: string) => void;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
}

const POSE_CATEGORY_ORDER: PoseCategory[] = ['studio', 'lifestyle', 'editorial', 'streetwear'];

export function CatalogStepPoses({ selectedPoseIds, onTogglePose, onBack, onNext, canProceed }: CatalogStepPosesProps) {
  const poses = useMemo(() => mockTryOnPoses.filter((p) => p.poseId.startsWith('pose_')), []);

  const grouped = useMemo(() => {
    const map = new Map<PoseCategory, TryOnPose[]>();
    for (const pose of poses) {
      const list = map.get(pose.category) || [];
      list.push(pose);
      map.set(pose.category, list);
    }
    return map;
  }, [poses]);

  const handleSelect = (pose: TryOnPose) => {
    if (selectedPoseIds.has(pose.poseId) || selectedPoseIds.size < CATALOG_MAX_POSES) {
      onTogglePose(pose.poseId);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Select Poses</h2>
        <p className="text-sm text-muted-foreground">
          Choose up to {CATALOG_MAX_POSES} poses ({selectedPoseIds.size} selected)
        </p>
      </div>

      <div className="space-y-6">
        {POSE_CATEGORY_ORDER.map((cat) => {
          const catPoses = grouped.get(cat);
          if (!catPoses?.length) return null;
          return (
            <PoseCategorySection
              key={cat}
              category={cat}
              poses={catPoses}
              selectedPoseIds={selectedPoseIds}
              onSelectPose={handleSelect}
            />
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed} className="gap-2">
          Next: Backgrounds
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
