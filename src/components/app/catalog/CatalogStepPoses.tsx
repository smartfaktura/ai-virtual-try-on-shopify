import { useMemo } from 'react';
import { catalogPoses, CATALOG_POSE_CATEGORIES, CATALOG_CATEGORY_LABELS } from '@/data/catalogPoses';
import { CatalogPoseCard } from './CatalogPoseCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Move } from 'lucide-react';
import type { TryOnPose } from '@/types';

const MAX_POSES = 6;

interface CatalogStepPosesProps {
  selectedPoseIds: Set<string>;
  onTogglePose: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
}

export function CatalogStepPoses({
  selectedPoseIds, onTogglePose, onBack, onNext, canProceed,
}: CatalogStepPosesProps) {
  const groupedPoses = useMemo(() => {
    const map = new Map<string, TryOnPose[]>();
    for (const pose of catalogPoses) {
      const list = map.get(pose.category) || [];
      list.push(pose);
      map.set(pose.category, list);
    }
    return map;
  }, []);

  const handleSelect = (pose: TryOnPose) => {
    if (selectedPoseIds.has(pose.poseId) || selectedPoseIds.size < MAX_POSES) {
      onTogglePose(pose.poseId);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Move className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Select Poses</h3>
        <Badge variant="secondary" className="text-[10px]">{selectedPoseIds.size}/{MAX_POSES}</Badge>
        <span className="text-xs text-muted-foreground ml-1">Choose how your models will be posed</span>
      </div>

      <div className="space-y-4">
        {CATALOG_POSE_CATEGORIES.map(cat => {
          const catPoses = groupedPoses.get(cat);
          if (!catPoses?.length) return null;
          return (
            <div key={cat} className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {CATALOG_CATEGORY_LABELS[cat] || cat}
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {catPoses.map(pose => (
                  <CatalogPoseCard
                    key={pose.poseId}
                    id={pose.poseId}
                    name={pose.name}
                    description={pose.description}
                    category={pose.category}
                    previewUrl={pose.previewUrl}
                    isSelected={selectedPoseIds.has(pose.poseId)}
                    onSelect={() => handleSelect(pose)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed} className="gap-2">
          Next: Models <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
