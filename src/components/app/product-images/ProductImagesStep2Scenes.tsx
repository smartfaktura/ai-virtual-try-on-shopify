import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { GLOBAL_SCENES, CATEGORY_COLLECTIONS } from './sceneData';
import type { ProductImageScene } from './types';

interface Step2Props {
  selectedSceneIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onContinue: () => void;
  onBack: () => void;
}

function SceneCard({ scene, selected, onToggle }: { scene: ProductImageScene; selected: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative rounded-xl border-2 p-4 text-left transition-all cursor-pointer w-full ${
        selected
          ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.03]'
          : 'border-border hover:border-primary/30 hover:bg-muted/30'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{scene.title}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{scene.description}</p>
          {scene.chips && scene.chips.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {scene.chips.map(c => (
                <Badge key={c} variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal">{c}</Badge>
              ))}
            </div>
          )}
        </div>
        {selected && <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />}
      </div>
    </button>
  );
}

export function ProductImagesStep2Scenes({ selectedSceneIds, onSelectionChange, onContinue, onBack }: Step2Props) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleScene = (id: string) => {
    const next = new Set(selectedSceneIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  const toggleCategory = (catId: string) => {
    const next = new Set(expandedCategories);
    if (next.has(catId)) next.delete(catId);
    else next.add(catId);
    setExpandedCategories(next);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Select scenes</h2>
        <p className="text-sm text-muted-foreground mt-1">Choose the types of visuals you want to generate for the selected products.</p>
        {selectedSceneIds.size > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary" className="text-xs">{selectedSceneIds.size} scene{selectedSceneIds.size !== 1 ? 's' : ''} selected</Badge>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => onSelectionChange(new Set())}>Clear</Button>
          </div>
        )}
      </div>

      {/* Global scenes */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Universal Scenes</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {GLOBAL_SCENES.map(scene => (
            <SceneCard
              key={scene.id}
              scene={scene}
              selected={selectedSceneIds.has(scene.id)}
              onToggle={() => toggleScene(scene.id)}
            />
          ))}
        </div>
      </div>

      {/* Category collections */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Explore scenes by product type</h3>
        <div className="space-y-2">
          {CATEGORY_COLLECTIONS.map(cat => {
            const selectedInCat = cat.scenes.filter(s => selectedSceneIds.has(s.id)).length;
            const isOpen = expandedCategories.has(cat.id);
            return (
              <Collapsible key={cat.id} open={isOpen} onOpenChange={() => toggleCategory(cat.id)}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{cat.title}</span>
                      {selectedInCat > 0 && (
                        <Badge variant="default" className="text-[10px] h-5 px-1.5">{selectedInCat}</Badge>
                      )}
                    </div>
                    {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 pl-2">
                    {cat.scenes.map(scene => (
                      <SceneCard
                        key={scene.id}
                        scene={scene}
                        selected={selectedSceneIds.has(scene.id)}
                        onToggle={() => toggleScene(scene.id)}
                      />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button size="lg" disabled={selectedSceneIds.size === 0} onClick={onContinue}>
          Continue to details
        </Button>
      </div>
    </div>
  );
}
