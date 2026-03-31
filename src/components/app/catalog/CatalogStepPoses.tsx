import { useMemo } from 'react';
import { catalogPoses, CATALOG_POSE_CATEGORIES, CATALOG_CATEGORY_LABELS, CATALOG_MOODS } from '@/data/catalogPoses';
import { CatalogPoseCard } from './CatalogPoseCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { ChevronLeft, ChevronRight, Ban, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TryOnPose } from '@/types';

const MAX_POSES = 6;

interface CatalogStepPosesProps {
  selectedPoseIds: Set<string>;
  onTogglePose: (id: string) => void;
  selectedMood: string;
  onMoodChange: (mood: string) => void;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
}

export function CatalogStepPoses({
  selectedPoseIds, onTogglePose, selectedMood, onMoodChange, onBack, onNext, canProceed,
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
          <h3 className="font-semibold text-base">Select expression and poses</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Choose how your models will be posed and their expression</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} size="sm" className="gap-1.5">
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </Button>
          <Button onClick={onNext} disabled={!canProceed} size="sm" className="gap-1.5">
            Next: Models <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left — Poses grid */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Poses</span>
            <Badge variant="secondary" className="text-[10px]">{selectedPoseIds.size}/{MAX_POSES}</Badge>
            <span className="text-xs text-muted-foreground">you can select multiple poses</span>
          </div>

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

        {/* Right — Mood selector */}
        <div className="w-52 shrink-0 space-y-3">
          <div>
            <span className="text-sm font-medium">Mood</span>
            <p className="text-xs text-muted-foreground mt-0.5">Select an expression</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {CATALOG_MOODS.map(mood => {
              const isSelected = selectedMood === mood.id;
              const isAny = mood.id === 'any';

              return (
                <button
                  key={mood.id}
                  onClick={() => onMoodChange(mood.id)}
                  className={cn(
                    'relative rounded-lg overflow-hidden border-2 transition-all text-left',
                    isSelected
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-border hover:border-primary/50',
                  )}
                >
                  {isAny ? (
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      <Ban className="w-6 h-6 text-muted-foreground" />
                    </div>
                  ) : mood.previewUrl ? (
                    <ShimmerImage
                      src={mood.previewUrl}
                      alt={mood.name}
                      className="w-full aspect-square object-cover"
                      aspectRatio="1/1"
                    />
                  ) : (
                    <div className="aspect-square bg-muted" />
                  )}
                  <div className="px-1.5 py-1 text-center">
                    <span className="text-[10px] font-medium leading-tight">{mood.name}</span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
