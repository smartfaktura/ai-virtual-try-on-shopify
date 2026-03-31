import { useMemo } from 'react';
import { catalogPoses, CATALOG_POSE_CATEGORIES, CATALOG_CATEGORY_LABELS } from '@/data/catalogPoses';
import { CatalogPoseCard } from './CatalogPoseCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base">Select poses</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Choose how your models will be posed</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">{selectedPoseIds.size}/{MAX_POSES}</Badge>
            <span className="text-xs text-muted-foreground">selected</span>
          </div>
          <Button variant="outline" onClick={onBack} size="sm" className="gap-1.5">
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </Button>
          <Button onClick={onNext} disabled={!canProceed} size="sm" className="gap-1.5">
            Next: Expression <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Full-width poses grid */}
      <div className="space-y-5">
        {CATALOG_POSE_CATEGORIES.map(cat => {
          const catPoses = groupedPoses.get(cat);
          if (!catPoses?.length) return null;
          return (
            <div key={cat} className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {CATALOG_CATEGORY_LABELS[cat] || cat}
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
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
    </div>
  );
}
