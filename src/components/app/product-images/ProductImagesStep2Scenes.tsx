import { useState, useMemo, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronDown, ChevronRight, Camera } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { useProductImageScenes } from '@/hooks/useProductImageScenes';
import type { ProductImageScene, UserProduct, CategoryCollection, SubGroup } from './types';

interface Step2Props {
  selectedSceneIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  selectedProducts: UserProduct[];
  productAnalyses?: Record<string, { category: string }>;
}

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'beauty-skincare': ['serum', 'moisturizer', 'cleanser', 'toner', 'skincare', 'cream', 'sunscreen', 'essence', 'treatment', 'mask'],
  'makeup-lipsticks': ['lipstick', 'mascara', 'foundation', 'concealer', 'blush', 'eyeshadow', 'makeup', 'cosmetic', 'lip', 'bronzer', 'highlighter', 'primer', 'beauty'],
  'fragrance': ['perfume', 'cologne', 'fragrance', 'eau de', 'scent', 'parfum'],
  'bags-accessories': ['bag', 'handbag', 'purse', 'clutch', 'wallet', 'tote', 'backpack', 'briefcase', 'satchel', 'crossbody', 'messenger', 'duffel', 'case', 'pouch'],
  'hats-small': ['hat', 'cap', 'beanie', 'scarf', 'gloves', 'belt', 'watch', 'bracelet', 'necklace', 'earring', 'ring', 'sunglasses', 'jewelry', 'jewellery'],
  'shoes': ['shoe', 'sneaker', 'boot', 'sandal', 'heel', 'loafer', 'slipper', 'footwear', 'trainer', 'mule', 'clog', 'pump', 'oxford', 'derby'],
  'garments': ['shirt', 'dress', 'jacket', 'pants', 'jeans', 'sweater', 'hoodie', 'coat', 'skirt', 'blouse', 'top', 'shorts', 'legging', 'clothing', 'apparel', 'garment', 'jersey', 'tank', 'polo', 'uniform', 'tracksuit', 'jogger', 'vest', 'cardigan', 'blazer', 'suit', 'romper', 'jumpsuit', 'athletic', 'activewear', 'sportswear', 'basketball'],
  'home-decor': ['candle', 'vase', 'pillow', 'blanket', 'lamp', 'decor', 'home', 'interior', 'furniture', 'rug', 'curtain', 'mirror', 'frame', 'planter', 'ceramic'],
  'tech-devices': ['phone', 'laptop', 'headphone', 'earbuds', 'speaker', 'charger', 'tablet', 'keyboard', 'mouse', 'camera', 'tech', 'gadget', 'electronic', 'smartwatch', 'monitor', 'console', 'controller', 'drone', 'wearable'],
  'food-beverage': ['food', 'coffee', 'tea', 'chocolate', 'snack', 'cereal', 'granola', 'sauce', 'honey', 'jam', 'juice', 'beverage', 'organic', 'artisan'],
  'supplements-wellness': ['vitamin', 'supplement', 'capsule', 'protein', 'collagen', 'probiotic', 'omega', 'wellness', 'greens', 'superfood', 'gummy'],
};

type GridSize = 'small' | 'medium' | 'large';

const GRID_CLASSES: Record<GridSize, string> = {
  small: 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7',
  medium: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6',
  large: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
};

function detectRelevantCategories(products: UserProduct[], productAnalyses?: Record<string, { category: string }>): Set<string> {
  const matched = new Set<string>();
  const analyzedIds = new Set<string>();

  if (productAnalyses) {
    for (const p of products) {
      const cat = productAnalyses[p.id]?.category;
      if (cat) {
        matched.add(cat);
        analyzedIds.add(p.id);
      }
    }
  }
  for (const p of products) {
    if (analyzedIds.has(p.id)) continue;
    const aj = (p as any).analysis_json as { category?: string } | null;
    if (aj?.category) {
      matched.add(aj.category);
      analyzedIds.add(p.id);
    }
  }

  const unanalyzed = products.filter(p => !analyzedIds.has(p.id));
  if (unanalyzed.length > 0) {
    const combined = unanalyzed.map(p =>
      `${p.title} ${p.description} ${p.product_type} ${(p.tags || []).join(' ')}`.toLowerCase()
    ).join(' ');
    for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(combined))) matched.add(catId);
    }
  }
  return matched;
}

// Global scenes removed — all scenes now belong to individual categories

function SceneCard({ scene, selected, onToggle }: { scene: ProductImageScene; selected: boolean; onToggle: () => void }) {
  const hasBackground = scene.promptTemplate?.includes('{{background}}');

  return (
    <button
      onClick={onToggle}
      className={`relative rounded-xl border-2 overflow-hidden text-left transition-all cursor-pointer w-full ${
        selected
          ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.03]'
          : 'border-border hover:border-primary/30 hover:bg-muted/30'
      }`}
    >
      <div className="aspect-[3/4] bg-muted flex items-center justify-center relative">
        {scene.previewUrl ? (
          <img src={scene.previewUrl} alt={scene.title} className="w-full h-full object-cover" />
        ) : (
          <Camera className="w-6 h-6 text-muted-foreground/30" />
        )}
        {selected && (
          <div className="absolute top-1.5 right-1.5">
            <CheckCircle className="w-5 h-5 text-primary fill-primary/20 drop-shadow-sm" />
          </div>
        )}
        {hasBackground && (
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-white/20 shadow-sm rounded-full px-1.5 py-1">
            <div className="w-2.5 h-2.5 rounded-full bg-white border border-gray-200" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#E8EDE6]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#F8ECE8]" />
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-blue-200 to-pink-200 border border-white/30" />
          </div>
        )}
      </div>
      <div className="p-1.5">
        <p className="text-[11px] font-semibold truncate">{scene.title}</p>
        <p className="text-[10px] text-muted-foreground line-clamp-1">{scene.description}</p>
      </div>
    </button>
  );
}

function GridSizeToggle({ value, onChange }: { value: GridSize; onChange: (v: GridSize) => void }) {
  const sizes: { id: GridSize; label: string }[] = [
    { id: 'small', label: 'S' },
    { id: 'medium', label: 'M' },
    { id: 'large', label: 'L' },
  ];
  return (
    <div className="flex items-center border border-border rounded-md overflow-hidden">
      {sizes.map(s => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`px-2 py-1 text-[10px] font-semibold transition-colors ${
            value === s.id
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

interface UnifiedCategorySectionProps {
  catId: string;
  catTitle: string;
  essentialScenes: ProductImageScene[];
  categoryScenes: ProductImageScene[];
  categorySubGroups?: SubGroup[];
  selectedSceneIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  toggleScene: (id: string) => void;
  isRecommended?: boolean;
  gridClass: string;
}

// UnifiedCategorySection rendering moved to UnifiedCategorySectionWithSelectAll below

export function ProductImagesStep2Scenes({ selectedSceneIds, onSelectionChange, selectedProducts, productAnalyses }: Step2Props) {
  const { categoryCollections: hookCategoryCollections } = useProductImageScenes();
  const ACTIVE_CATEGORY_COLLECTIONS = hookCategoryCollections;

  const relevantCatIds = useMemo(() => detectRelevantCategories(selectedProducts, productAnalyses), [selectedProducts, productAnalyses]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set(relevantCatIds));
  const [gridSize, setGridSize] = useState<GridSize>('medium');

  // Build unified views: each category collection stands alone (no more global scenes)
  const unifiedRecommended = useMemo(() => {
    return ACTIVE_CATEGORY_COLLECTIONS
      .filter(c => relevantCatIds.has(c.id))
      .map(c => ({
        ...c,
        essentialScenes: [] as ProductImageScene[],
      }));
  }, [relevantCatIds, ACTIVE_CATEGORY_COLLECTIONS]);

  const unifiedOther = useMemo(() => {
    return ACTIVE_CATEGORY_COLLECTIONS
      .filter(c => !relevantCatIds.has(c.id))
      .map(c => ({
        ...c,
        essentialScenes: [] as ProductImageScene[],
      }));
  }, [relevantCatIds, ACTIVE_CATEGORY_COLLECTIONS]);

  // If no category detected, show all global scenes in a flat "All Scenes" section
  const hasDetectedCategories = relevantCatIds.size > 0;

  // All visible scene IDs for pruning stale selections
  const allVisibleIds = useMemo(() => {
    const ids = new Set<string>();
    const addFrom = (list: typeof unifiedRecommended) => {
      for (const c of list) {
        c.scenes.forEach(s => ids.add(s.id));
      }
    };
    addFrom(unifiedRecommended);
    addFrom(unifiedOther);
    return ids;
  }, [unifiedRecommended, unifiedOther]);

  // Prune stale selections
  useEffect(() => {
    const stale = Array.from(selectedSceneIds).filter(id => !allVisibleIds.has(id));
    if (stale.length > 0) {
      const next = new Set(selectedSceneIds);
      stale.forEach(id => next.delete(id));
      onSelectionChange(next);
    }
  }, [allVisibleIds, selectedSceneIds, onSelectionChange]);

  useEffect(() => {
    setExpandedCategories(new Set(relevantCatIds));
  }, [relevantCatIds]);

  const gridClass = GRID_CLASSES[gridSize];

  const toggleScene = (id: string) => {
    const next = new Set(selectedSceneIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    onSelectionChange(next);
  };

  const toggleCategory = (catId: string) => {
    const next = new Set(expandedCategories);
    if (next.has(catId)) next.delete(catId); else next.add(catId);
    setExpandedCategories(next);
  };


  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Select scenes</h2>
        <div className="flex items-center gap-2">
          {selectedSceneIds.size > 0 && (
            <>
              <Badge variant="secondary" className="text-xs">{selectedSceneIds.size} selected</Badge>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => onSelectionChange(new Set())}>Clear</Button>
            </>
          )}
          <GridSizeToggle value={gridSize} onChange={setGridSize} />
        </div>
      </div>

      {/* No category detected: show all category collections expanded */}
      {!hasDetectedCategories && ACTIVE_CATEGORY_COLLECTIONS.length > 0 && (
        <div className="space-y-2">
          {ACTIVE_CATEGORY_COLLECTIONS.map(cat => (
            <UnifiedCategorySectionWithSelectAll
              key={cat.id}
              catId={cat.id}
              catTitle={cat.title}
              essentialScenes={[]}
              categoryScenes={cat.scenes}
              categorySubGroups={cat.subGroups}
              selectedSceneIds={selectedSceneIds}
              onSelectionChange={onSelectionChange}
              isOpen={expandedCategories.has(cat.id)}
              onToggleOpen={() => toggleCategory(cat.id)}
              toggleScene={toggleScene}
              gridClass={gridClass}
            />
          ))}
        </div>
      )}

      {/* Recommended (detected) categories */}
      {unifiedRecommended.length > 0 && (
        <div className="space-y-2">
          {unifiedRecommended.map(cat => (
            <UnifiedCategorySectionWithSelectAll
              key={cat.id}
              catId={cat.id}
              catTitle={cat.title}
              essentialScenes={cat.essentialScenes}
              categoryScenes={cat.scenes}
              categorySubGroups={cat.subGroups}
              selectedSceneIds={selectedSceneIds}
              onSelectionChange={onSelectionChange}
              isOpen={expandedCategories.has(cat.id)}
              onToggleOpen={() => toggleCategory(cat.id)}
              toggleScene={toggleScene}
              isRecommended
              gridClass={gridClass}
            />
          ))}
        </div>
      )}

      {unifiedOther.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Explore more</h3>
          {unifiedOther.map(cat => (
            <UnifiedCategorySectionWithSelectAll
              key={cat.id}
              catId={cat.id}
              catTitle={cat.title}
              essentialScenes={cat.essentialScenes}
              categoryScenes={cat.scenes}
              categorySubGroups={cat.subGroups}
              selectedSceneIds={selectedSceneIds}
              onSelectionChange={onSelectionChange}
              isOpen={expandedCategories.has(cat.id)}
              onToggleOpen={() => toggleCategory(cat.id)}
              toggleScene={toggleScene}
              gridClass={gridClass}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Wrapper that adds per-sub-group Select All buttons */
function UnifiedCategorySectionWithSelectAll({
  catId, catTitle, essentialScenes, categoryScenes, categorySubGroups,
  selectedSceneIds, onSelectionChange, isOpen, onToggleOpen, toggleScene,
  isRecommended, gridClass,
}: UnifiedCategorySectionProps) {
  const allScenes = [...essentialScenes, ...categoryScenes];
  const selectedCount = allScenes.filter(s => selectedSceneIds.has(s.id)).length;

  // Resolve sub-category label
  const resolveLabel = (scene: ProductImageScene, fallback: string) => {
    return scene.subCategory || fallback;
  };

  // Build sub-groups for essential scenes (by resolved subCategory)
  const essentialSubGroups = useMemo(() => {
    const map = new Map<string, ProductImageScene[]>();
    for (const s of essentialScenes) {
      const key = resolveLabel(s, 'Essential Shots');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries()).map(([label, scenes]) => ({ label, scenes }));
  }, [essentialScenes, catId]);

  // Use DB sub-groups for category scenes, or fall back to a single group
  const catSubGroups = useMemo(() => {
    if (categorySubGroups && categorySubGroups.length > 0) return categorySubGroups;
    if (categoryScenes.length === 0) return [];
    return [{ label: `${catTitle} Shots`, scenes: categoryScenes }];
  }, [categorySubGroups, categoryScenes, catTitle]);

  const bulkToggle = (scenes: ProductImageScene[]) => {
    const next = new Set(selectedSceneIds);
    const allSelected = scenes.every(s => next.has(s.id));
    if (allSelected) scenes.forEach(s => next.delete(s.id));
    else scenes.forEach(s => next.add(s.id));
    onSelectionChange(next);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onToggleOpen}>
      <CollapsibleTrigger className="w-full">
        <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
          isRecommended
            ? 'border-primary/20 bg-primary/[0.02] hover:bg-primary/[0.05]'
            : 'border-border hover:bg-muted/30'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{catTitle}</span>
            {isRecommended && (
              <Badge variant="default" className="text-[10px] h-5 px-1.5 bg-primary/10 text-primary border-0">Recommended</Badge>
            )}
            {selectedCount > 0 && (
              <Badge variant="default" className="text-[10px] h-5 px-1.5">{selectedCount} / {allScenes.length}</Badge>
            )}
            {selectedCount === 0 && (
              <span className="text-[10px] text-muted-foreground">{allScenes.length}</span>
            )}
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {/* Essential shots sub-groups */}
        {essentialSubGroups.map((sg, i) => {
          const sgAllSelected = sg.scenes.length > 0 && sg.scenes.every(s => selectedSceneIds.has(s.id));
          return (
            <SubGroupSection
              key={`ess-${i}`}
              label={sg.label}
              scenes={sg.scenes}
              selectedSceneIds={selectedSceneIds}
              toggleScene={toggleScene}
              allSelected={sgAllSelected}
              onToggleAll={() => bulkToggle(sg.scenes)}
              gridClass={gridClass}
            />
          );
        })}

        {/* Category shots sub-groups */}
        {catSubGroups.map((sg, i) => {
          const sgAllSelected = sg.scenes.length > 0 && sg.scenes.every(s => selectedSceneIds.has(s.id));
          return (
            <SubGroupSection
              key={`cat-${i}`}
              label={sg.label}
              scenes={sg.scenes}
              selectedSceneIds={selectedSceneIds}
              toggleScene={toggleScene}
              allSelected={sgAllSelected}
              onToggleAll={() => bulkToggle(sg.scenes)}
              gridClass={gridClass}
            />
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

/** Per-sub-group section with Select All on left and label on right */
function SubGroupSection({ label, scenes, selectedSceneIds, toggleScene, allSelected, onToggleAll, gridClass }: {
  label: string;
  scenes: ProductImageScene[];
  selectedSceneIds: Set<string>;
  toggleScene: (id: string) => void;
  allSelected: boolean;
  onToggleAll: () => void;
  gridClass: string;
}) {
  const selectedCount = scenes.filter(s => selectedSceneIds.has(s.id)).length;

  return (
    <div className="pt-3 pl-2">
      <div className="flex items-center gap-2 mb-2">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide shrink-0">{label}</p>
        <div className="h-px flex-1 bg-border" />
        <Button
          variant="ghost"
          size="sm"
          className="text-[10px] h-6 px-2 shrink-0"
          onClick={(e) => { e.stopPropagation(); onToggleAll(); }}
        >
          {allSelected ? 'Deselect' : 'Select All'}
          {selectedCount > 0 && !allSelected && ` (${selectedCount}/${scenes.length})`}
        </Button>
      </div>
      <div className={`grid ${gridClass} gap-2`}>
        {scenes.map(scene => (
          <SceneCard key={scene.id} scene={scene} selected={selectedSceneIds.has(scene.id)} onToggle={() => toggleScene(scene.id)} />
        ))}
      </div>
    </div>
  );
}

export default ProductImagesStep2Scenes;
