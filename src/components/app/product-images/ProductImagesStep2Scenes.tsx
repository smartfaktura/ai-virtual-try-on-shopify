import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronDown, ChevronRight, Sparkles, Camera } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { GLOBAL_SCENES, CATEGORY_COLLECTIONS } from './sceneData';
import type { ProductImageScene } from './types';

interface Step2Props {
  selectedSceneIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

const SCENE_GRADIENTS: Record<string, string> = {
  'clean-packshot': 'from-slate-100 to-gray-200',
  'soft-neutral-studio': 'from-stone-100 to-neutral-200',
  'marketplace-ready': 'from-blue-50 to-slate-100',
  'editorial-product': 'from-amber-50 to-orange-100',
  'lifestyle': 'from-emerald-50 to-teal-100',
  'in-hand': 'from-rose-50 to-pink-100',
  'detail-coverage': 'from-violet-50 to-purple-100',
  'packaging': 'from-sky-50 to-blue-100',
  'flat-lay': 'from-lime-50 to-green-100',
  'group-collection': 'from-indigo-50 to-blue-100',
  'social-media': 'from-fuchsia-50 to-pink-100',
  'seasonal-holiday': 'from-red-50 to-amber-100',
  'shadow-light': 'from-zinc-200 to-slate-300',
};

function SceneCard({ scene, selected, onToggle }: { scene: ProductImageScene; selected: boolean; onToggle: () => void }) {
  const gradient = SCENE_GRADIENTS[scene.id] || 'from-muted to-muted/80';

  return (
    <button
      onClick={onToggle}
      className={`relative rounded-xl border-2 overflow-hidden text-left transition-all cursor-pointer w-full ${
        selected
          ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.03]'
          : 'border-border hover:border-primary/30 hover:bg-muted/30'
      }`}
    >
      {/* Preview placeholder */}
      <div className={`aspect-[4/3] bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
        {scene.previewUrl ? (
          <img src={scene.previewUrl} alt={scene.title} className="w-full h-full object-cover" />
        ) : (
          <Camera className="w-6 h-6 text-muted-foreground/30" />
        )}
        {selected && (
          <div className="absolute top-2 right-2">
            <CheckCircle className="w-5 h-5 text-primary fill-primary/20 drop-shadow-sm" />
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-sm font-semibold">{scene.title}</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{scene.description}</p>
        {scene.chips && scene.chips.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {scene.chips.map(c => (
              <Badge key={c} variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal">{c}</Badge>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

export function ProductImagesStep2Scenes({ selectedSceneIds, onSelectionChange }: Step2Props) {
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
    <div className="space-y-8 pb-20">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-2 pl-2">
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
    </div>
  );
}
