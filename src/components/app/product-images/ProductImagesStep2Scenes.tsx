import { useState, useMemo, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronDown, ChevronRight, Sparkles, Camera } from 'lucide-react';
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

/** Returns global scenes that are compatible with a given category */
function getGlobalScenesForCategory(globalScenes: ProductImageScene[], categoryId: string): ProductImageScene[] {
  return globalScenes.filter(scene => {
    if (!scene.excludeCategories || scene.excludeCategories.length === 0) return true;
    return !scene.excludeCategories.includes(categoryId);
  });
}

function SceneCard({ scene, selected, onToggle }: { scene: ProductImageScene; selected: boolean; onToggle: () => void }) {
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
  isOpen: boolean;
  onToggleOpen: () => void;
  toggleScene: (id: string) => void;
  isRecommended?: boolean;
  gridClass: string;
}

// UnifiedCategorySection rendering moved to UnifiedCategorySectionWithSelectAll below

export function ProductImagesStep2Scenes({ selectedSceneIds, onSelectionChange, selectedProducts, productAnalyses }: Step2Props) {
  const { globalScenes: hookGlobalScenes, categoryCollections: hookCategoryCollections } = useProductImageScenes();
  const ACTIVE_GLOBAL_SCENES = hookGlobalScenes;
  const ACTIVE_CATEGORY_COLLECTIONS = hookCategoryCollections;

  const relevantCatIds = useMemo(() => detectRelevantCategories(selectedProducts, productAnalyses), [selectedProducts, productAnalyses]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set(relevantCatIds));
  const [gridSize, setGridSize] = useState<GridSize>('medium');

  // Build unified views: for each category collection, pair with filtered global scenes
  const unifiedRecommended = useMemo(() => {
    return ACTIVE_CATEGORY_COLLECTIONS
      .filter(c => relevantCatIds.has(c.id))
      .map(c => ({
        ...c,
        essentialScenes: getGlobalScenesForCategory(ACTIVE_GLOBAL_SCENES, c.id),
      }));
  }, [relevantCatIds, ACTIVE_CATEGORY_COLLECTIONS, ACTIVE_GLOBAL_SCENES]);

  const unifiedOther = useMemo(() => {
    return ACTIVE_CATEGORY_COLLECTIONS
      .filter(c => !relevantCatIds.has(c.id))
      .map(c => ({
        ...c,
        essentialScenes: getGlobalScenesForCategory(ACTIVE_GLOBAL_SCENES, c.id),
      }));
  }, [relevantCatIds, ACTIVE_CATEGORY_COLLECTIONS, ACTIVE_GLOBAL_SCENES]);

  // If no category detected, show all global scenes in a flat "All Scenes" section
  const hasDetectedCategories = relevantCatIds.size > 0;

  // All visible scene IDs for pruning stale selections
  const allVisibleIds = useMemo(() => {
    const ids = new Set<string>();
    const addFrom = (list: typeof unifiedRecommended) => {
      for (const c of list) {
        c.essentialScenes.forEach(s => ids.add(s.id));
        c.scenes.forEach(s => ids.add(s.id));
      }
    };
    addFrom(unifiedRecommended);
    addFrom(unifiedOther);
    // Also add global scenes for the "no category" fallback
    if (!hasDetectedCategories) {
      ACTIVE_GLOBAL_SCENES.forEach(s => ids.add(s.id));
    }
    return ids;
  }, [unifiedRecommended, unifiedOther, hasDetectedCategories, ACTIVE_GLOBAL_SCENES]);

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

  const selectAllUnified = (catId: string) => {
    const rec = unifiedRecommended.find(c => c.id === catId);
    const oth = unifiedOther.find(c => c.id === catId);
    const cat = rec || oth;
    if (!cat) return;
    const allScenes = [...cat.essentialScenes, ...cat.scenes];
    const next = new Set(selectedSceneIds);
    const allSelected = allScenes.every(s => next.has(s.id));
    if (allSelected) allScenes.forEach(s => next.delete(s.id));
    else allScenes.forEach(s => next.add(s.id));
    onSelectionChange(next);
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

      {/* No category detected: show all global scenes as flat grid + explore categories below */}
      {!hasDetectedCategories && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">All Scenes</h3>
          </div>
          <div className={`grid ${gridClass} gap-2`}>
            {ACTIVE_GLOBAL_SCENES.map(scene => (
              <SceneCard key={scene.id} scene={scene} selected={selectedSceneIds.has(scene.id)} onToggle={() => toggleScene(scene.id)} />
            ))}
          </div>
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
              isOpen={expandedCategories.has(cat.id)}
              onToggleOpen={() => toggleCategory(cat.id)}
              toggleScene={toggleScene}
              onSelectAll={() => selectAllUnified(cat.id)}
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
              isOpen={expandedCategories.has(cat.id)}
              onToggleOpen={() => toggleCategory(cat.id)}
              toggleScene={toggleScene}
              onSelectAll={() => selectAllUnified(cat.id)}
              gridClass={gridClass}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Wrapper that adds Select All / Deselect All button inside the collapsible */
function UnifiedCategorySectionWithSelectAll({
  catId, catTitle, essentialScenes, categoryScenes, categorySubGroups,
  selectedSceneIds, isOpen, onToggleOpen, toggleScene, onSelectAll,
  isRecommended, gridClass,
}: UnifiedCategorySectionProps & { onSelectAll: () => void }) {
  const allScenes = [...essentialScenes, ...categoryScenes];
  const selectedCount = allScenes.filter(s => selectedSceneIds.has(s.id)).length;
  const allSelected = allScenes.length > 0 && selectedCount === allScenes.length;

  // Build sub-groups for essential scenes (by subCategory from DB)
  const essentialSubGroups = useMemo(() => {
    const map = new Map<string, ProductImageScene[]>();
    for (const s of essentialScenes) {
      const key = s.subCategory || '';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries()).map(([label, scenes]) => ({ label: label || 'Essential Shots', scenes }));
  }, [essentialScenes]);

  // Use DB sub-groups for category scenes, or fall back to a single group
  const catSubGroups = useMemo(() => {
    if (categorySubGroups && categorySubGroups.length > 0) return categorySubGroups;
    if (categoryScenes.length === 0) return [];
    return [{ label: `${catTitle} Shots`, scenes: categoryScenes }];
  }, [categorySubGroups, categoryScenes, catTitle]);

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
        <div className="flex items-center gap-2 pt-2 pl-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={(e) => { e.stopPropagation(); onSelectAll(); }}
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </Button>
        </div>

        {/* Essential shots sub-groups */}
        {essentialSubGroups.map((sg, i) => (
          <div key={`ess-${i}`} className="pt-3 pl-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">{sg.label}</p>
            <div className={`grid ${gridClass} gap-2`}>
              {sg.scenes.map(scene => (
                <SceneCard key={scene.id} scene={scene} selected={selectedSceneIds.has(scene.id)} onToggle={() => toggleScene(scene.id)} />
              ))}
            </div>
          </div>
        ))}

        {/* Category shots sub-groups */}
        {catSubGroups.map((sg, i) => (
          <div key={`cat-${i}`} className="pt-3 pl-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">{sg.label}</p>
            <div className={`grid ${gridClass} gap-2`}>
              {sg.scenes.map(scene => (
                <SceneCard key={scene.id} scene={scene} selected={selectedSceneIds.has(scene.id)} onToggle={() => toggleScene(scene.id)} />
              ))}
            </div>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export default ProductImagesStep2Scenes;
