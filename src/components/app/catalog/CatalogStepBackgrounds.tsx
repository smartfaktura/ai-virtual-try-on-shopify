import { useMemo } from 'react';
import { mockTryOnPoses } from '@/data/mockData';
import { useCustomScenes } from '@/hooks/useCustomScenes';
import { PoseCategorySection } from '@/components/app/PoseCategorySection';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Sparkles } from 'lucide-react';
import type { TryOnPose, PoseCategory } from '@/types';

const CATALOG_MAX_BACKGROUNDS = 6;

interface CatalogStepBackgroundsProps {
  selectedBackgroundIds: Set<string>;
  onToggleBackground: (bgId: string) => void;
  onBack: () => void;
}

const BG_CATEGORY_ORDER: PoseCategory[] = [
  'clean-studio', 'surface', 'flat-lay', 'living-space',
  'bathroom', 'botanical', 'outdoor',
];

export function CatalogStepBackgrounds({ selectedBackgroundIds, onToggleBackground, onBack }: CatalogStepBackgroundsProps) {
  const { asPoses: customScenes } = useCustomScenes();

  const backgrounds = useMemo(() => {
    const builtIn = mockTryOnPoses.filter((p) => p.poseId.startsWith('scene_'));
    return [...builtIn, ...customScenes];
  }, [customScenes]);

  const grouped = useMemo(() => {
    const map = new Map<PoseCategory, TryOnPose[]>();
    for (const bg of backgrounds) {
      const list = map.get(bg.category) || [];
      list.push(bg);
      map.set(bg.category, list);
    }
    return map;
  }, [backgrounds]);

  const handleSelect = (pose: TryOnPose) => {
    if (selectedBackgroundIds.has(pose.poseId) || selectedBackgroundIds.size < CATALOG_MAX_BACKGROUNDS) {
      onToggleBackground(pose.poseId);
    }
  };

  // Collect all categories including any from custom scenes not in the default order
  const allCategories = useMemo(() => {
    const seen = new Set(BG_CATEGORY_ORDER);
    const extra: PoseCategory[] = [];
    for (const cat of grouped.keys()) {
      if (!seen.has(cat)) extra.push(cat);
    }
    return [...BG_CATEGORY_ORDER, ...extra];
  }, [grouped]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Select Backgrounds</h2>
        <p className="text-sm text-muted-foreground">
          Choose up to {CATALOG_MAX_BACKGROUNDS} backgrounds ({selectedBackgroundIds.size} selected)
        </p>
      </div>

      <div className="space-y-6">
        {allCategories.map((cat) => {
          const catBgs = grouped.get(cat);
          if (!catBgs?.length) return null;
          return (
            <PoseCategorySection
              key={cat}
              category={cat}
              poses={catBgs}
              selectedPoseIds={selectedBackgroundIds}
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
        <Button disabled className="gap-2">
          <Sparkles className="w-4 h-4" />
          Generate Catalog
        </Button>
      </div>
    </div>
  );
}
