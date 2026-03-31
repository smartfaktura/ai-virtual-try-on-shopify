import { useMemo } from 'react';
import { catalogBackgrounds, CATALOG_BG_CATEGORIES, CATALOG_CATEGORY_LABELS } from '@/data/catalogPoses';
import { CatalogPoseCard } from './CatalogPoseCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Image } from 'lucide-react';
import type { TryOnPose } from '@/types';

const MAX_BACKGROUNDS = 6;

interface CatalogStepBackgroundsProps {
  selectedBackgroundIds: Set<string>;
  onToggleBackground: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
}

export function CatalogStepBackgrounds({
  selectedBackgroundIds, onToggleBackground, onBack, onNext, canProceed,
}: CatalogStepBackgroundsProps) {
  const groupedBgs = useMemo(() => {
    const map = new Map<string, TryOnPose[]>();
    for (const bg of catalogBackgrounds) {
      const list = map.get(bg.category) || [];
      list.push(bg);
      map.set(bg.category, list);
    }
    return map;
  }, []);

  const handleSelect = (bg: TryOnPose) => {
    if (selectedBackgroundIds.has(bg.poseId) || selectedBackgroundIds.size < MAX_BACKGROUNDS) {
      onToggleBackground(bg.poseId);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Image className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Select Backgrounds</h3>
        <Badge variant="secondary" className="text-[10px]">{selectedBackgroundIds.size}/{MAX_BACKGROUNDS}</Badge>
        <span className="text-xs text-muted-foreground ml-1">Choose the setting for your shots</span>
      </div>

      <div className="space-y-4">
        {CATALOG_BG_CATEGORIES.map(cat => {
          const catBgs = groupedBgs.get(cat);
          if (!catBgs?.length) return null;
          return (
            <div key={cat} className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {CATALOG_CATEGORY_LABELS[cat] || cat}
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {catBgs.map(bg => (
                  <CatalogPoseCard
                    key={bg.poseId}
                    id={bg.poseId}
                    name={bg.name}
                    description={bg.description}
                    category={bg.category}
                    previewUrl={bg.previewUrl}
                    isSelected={selectedBackgroundIds.has(bg.poseId)}
                    onSelect={() => handleSelect(bg)}
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
          Next: Style Shots <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
