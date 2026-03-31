import { useMemo, useState } from 'react';
import { catalogPoses, catalogBackgrounds, CATALOG_POSE_CATEGORIES, CATALOG_BG_CATEGORIES, CATALOG_CATEGORY_LABELS } from '@/data/catalogPoses';
import { CatalogPoseCard } from './CatalogPoseCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Move, Image } from 'lucide-react';
import type { TryOnPose } from '@/types';

const MAX_POSES = 6;
const MAX_BACKGROUNDS = 6;

interface CatalogStepStyleProps {
  selectedPoseIds: Set<string>;
  onTogglePose: (id: string) => void;
  selectedBackgroundIds: Set<string>;
  onToggleBackground: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
}

export function CatalogStepStyle({
  selectedPoseIds, onTogglePose,
  selectedBackgroundIds, onToggleBackground,
  onBack, onNext, canProceed,
}: CatalogStepStyleProps) {

  const groupedPoses = useMemo(() => {
    const map = new Map<string, TryOnPose[]>();
    for (const pose of catalogPoses) {
      const list = map.get(pose.category) || [];
      list.push(pose);
      map.set(pose.category, list);
    }
    return map;
  }, []);

  const groupedBgs = useMemo(() => {
    const map = new Map<string, TryOnPose[]>();
    for (const bg of catalogBackgrounds) {
      const list = map.get(bg.category) || [];
      list.push(bg);
      map.set(bg.category, list);
    }
    return map;
  }, []);

  const handlePoseSelect = (pose: TryOnPose) => {
    if (selectedPoseIds.has(pose.poseId) || selectedPoseIds.size < MAX_POSES) {
      onTogglePose(pose.poseId);
    }
  };

  const handleBgSelect = (bg: TryOnPose) => {
    if (selectedBackgroundIds.has(bg.poseId) || selectedBackgroundIds.size < MAX_BACKGROUNDS) {
      onToggleBackground(bg.poseId);
    }
  };

  const selectedProducts = useMemo(() => products.filter(p => selectedProductIds.has(p.id)), [products, selectedProductIds]);
  const selectedModels = useMemo(() => models.filter(m => selectedModelIds.has(m.modelId)), [models, selectedModelIds]);

  const openStyler = (productId: string, modelId: string) => {
    setStylerKey(`${productId}_${modelId}`);
    setStylerOpen(true);
  };

  const allPoses = useMemo(() => [...catalogPoses, ...catalogBackgrounds], []);

  return (
    <div className="space-y-6">
      {/* Poses Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Poses</h3>
          <Badge variant="secondary" className="text-[10px]">{selectedPoseIds.size}/{MAX_POSES}</Badge>
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
                      onSelect={() => handlePoseSelect(pose)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Backgrounds Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Backgrounds</h3>
          <Badge variant="secondary" className="text-[10px]">{selectedBackgroundIds.size}/{MAX_BACKGROUNDS}</Badge>
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
                      onSelect={() => handleBgSelect(bg)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-Shot Customization Mini Matrix */}
      {selectedProducts.length > 0 && selectedModels.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Customize Individual Shots</h3>
            <span className="text-xs text-muted-foreground">(optional)</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Click any cell to override the default pose, background, or add custom instructions for that specific combination.
          </p>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-2 text-left font-medium text-muted-foreground">Product \ Model</th>
                  {selectedModels.map(m => (
                    <th key={m.modelId} className="p-2 text-center font-medium text-muted-foreground">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted mx-auto mb-1">
                        <img src={m.previewUrl} alt={m.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="truncate block max-w-[60px]">{m.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedProducts.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="p-2 flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-muted overflow-hidden flex-shrink-0">
                        <img src={p.images[0]?.url} alt={p.title} className="w-full h-full object-contain" />
                      </div>
                      <span className="truncate max-w-[100px]">{p.title}</span>
                    </td>
                    {selectedModels.map(m => {
                      const key = `${p.id}_${m.modelId}`;
                      const hasOverride = shotOverrides.has(key);
                      return (
                        <td key={m.modelId} className="p-2 text-center">
                          <button
                            onClick={() => openStyler(p.id, m.modelId)}
                            className={`w-8 h-8 rounded-md border transition-all text-[10px] font-medium ${
                              hasOverride
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                            }`}
                          >
                            {hasOverride ? '✓' : '+'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Shot Styler Dialog */}
      {stylerKey && (
        <CatalogShotStyler
          open={stylerOpen}
          onOpenChange={setStylerOpen}
          comboKey={stylerKey}
          currentOverride={shotOverrides.get(stylerKey)}
          allPoses={allPoses}
          onSave={(override) => {
            const next = new Map(shotOverrides);
            if (override) next.set(stylerKey, override);
            else next.delete(stylerKey);
            onShotOverridesChange(next);
            setStylerOpen(false);
          }}
        />
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed} className="gap-2">
          Next: Review
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
