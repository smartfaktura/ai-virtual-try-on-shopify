import { useState, useMemo, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronDown, ChevronRight, Sparkles, Camera, LayoutGrid } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { GLOBAL_SCENES, CATEGORY_COLLECTIONS } from './sceneData';
import { useProductImageScenes } from '@/hooks/useProductImageScenes';
import type { ProductImageScene, UserProduct, CategoryCollection } from './types';

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

  // Layer 1: AI-detected categories from productAnalyses prop
  if (productAnalyses) {
    for (const p of products) {
      const cat = productAnalyses[p.id]?.category;
      if (cat) {
        matched.add(cat);
        analyzedIds.add(p.id);
      }
    }
  }
  // Layer 2: Cached analysis_json on product row
  for (const p of products) {
    if (analyzedIds.has(p.id)) continue;
    const aj = (p as any).analysis_json as { category?: string } | null;
    if (aj?.category) {
      matched.add(aj.category);
      analyzedIds.add(p.id);
    }
  }

  // Layer 3: Keyword fallback — only for products WITHOUT any AI analysis
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
  const sizes: { id: GridSize; label: string; iconScale: string }[] = [
    { id: 'small', label: 'S', iconScale: 'scale-75' },
    { id: 'medium', label: 'M', iconScale: 'scale-100' },
    { id: 'large', label: 'L', iconScale: 'scale-125' },
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

function CategorySection({ cat, selectedSceneIds, expandedCategories, toggleScene, toggleCategory, onSelectAllCategory, isRecommended, gridClass }: {
  cat: { id: string; title: string; scenes: ProductImageScene[] };
  selectedSceneIds: Set<string>;
  expandedCategories: Set<string>;
  toggleScene: (id: string) => void;
  toggleCategory: (id: string) => void;
  onSelectAllCategory: (catId: string) => void;
  isRecommended?: boolean;
  gridClass: string;
}) {
  const selectedInCat = cat.scenes.filter(s => selectedSceneIds.has(s.id)).length;
  const allSelected = selectedInCat === cat.scenes.length;
  const isOpen = expandedCategories.has(cat.id);

  return (
    <Collapsible open={isOpen} onOpenChange={() => toggleCategory(cat.id)}>
      <CollapsibleTrigger className="w-full">
        <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
          isRecommended
            ? 'border-primary/20 bg-primary/[0.02] hover:bg-primary/[0.05]'
            : 'border-border hover:bg-muted/30'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{cat.title}</span>
            <span className="text-[10px] text-muted-foreground">{cat.scenes.length}</span>
            {isRecommended && (
              <Badge variant="default" className="text-[10px] h-5 px-1.5 bg-primary/10 text-primary border-0">Recommended</Badge>
            )}
            {selectedInCat > 0 && (
              <Badge variant="default" className="text-[10px] h-5 px-1.5">{selectedInCat}</Badge>
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
            onClick={(e) => { e.stopPropagation(); onSelectAllCategory(cat.id); }}
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
        <div className={`grid ${gridClass} gap-2 pt-2 pl-2`}>
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
}

export function ProductImagesStep2Scenes({ selectedSceneIds, onSelectionChange, selectedProducts, productAnalyses }: Step2Props) {
  const { globalScenes: hookGlobalScenes, categoryCollections: hookCategoryCollections } = useProductImageScenes();
  // Use hook data (from DB) with hardcoded fallback already handled inside the hook
  const ACTIVE_GLOBAL_SCENES = hookGlobalScenes;
  const ACTIVE_CATEGORY_COLLECTIONS = hookCategoryCollections;

  const relevantCatIds = useMemo(() => detectRelevantCategories(selectedProducts, productAnalyses), [selectedProducts, productAnalyses]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set(relevantCatIds));
  const [gridSize, setGridSize] = useState<GridSize>('medium');

  // Collect all detected categories for filtering universal scenes
  const allDetectedCategories = useMemo(() => {
    const cats = new Set<string>();
    if (productAnalyses) {
      for (const p of selectedProducts) {
        const cat = productAnalyses[p.id]?.category;
        if (cat) cats.add(cat);
      }
    }
    for (const p of selectedProducts) {
      const aj = (p as any).analysis_json as { category?: string } | null;
      if (aj?.category) cats.add(aj.category);
    }
    // If no AI categories, fall back to keyword-detected ones
    if (cats.size === 0) {
      relevantCatIds.forEach(c => cats.add(c));
    }
    return cats;
  }, [selectedProducts, productAnalyses, relevantCatIds]);

  // Filter universal scenes: hide scenes where ALL selected products fall into excluded categories
  const filteredGlobalScenes = useMemo(() => {
    if (allDetectedCategories.size === 0) return GLOBAL_SCENES;
    return GLOBAL_SCENES.filter(scene => {
      if (!scene.excludeCategories || scene.excludeCategories.length === 0) return true;
      // Show scene if at least one detected category is NOT excluded
      const catsArray = Array.from(allDetectedCategories);
      return catsArray.some(cat => !scene.excludeCategories!.includes(cat));
    });
  }, [allDetectedCategories]);

  // Prune stale selected scenes that are no longer visible after category filtering
  useEffect(() => {
    const visibleGlobalIds = new Set(filteredGlobalScenes.map(s => s.id));
    const allCategoryIds = new Set(CATEGORY_COLLECTIONS.flatMap(c => c.scenes.map(s => s.id)));
    const stale = Array.from(selectedSceneIds).filter(id => {
      // If it's a category scene, it's always visible (just collapsed)
      if (allCategoryIds.has(id)) return false;
      // If it's a global scene that got filtered out, it's stale
      return !visibleGlobalIds.has(id);
    });
    if (stale.length > 0) {
      const next = new Set(selectedSceneIds);
      stale.forEach(id => next.delete(id));
      onSelectionChange(next);
    }
  }, [filteredGlobalScenes, selectedSceneIds, onSelectionChange]);

  // Sync expanded categories when selected products change
  useEffect(() => {
    setExpandedCategories(new Set(relevantCatIds));
  }, [relevantCatIds]);

  const gridClass = GRID_CLASSES[gridSize];

  const recommendedCollections = useMemo(
    () => CATEGORY_COLLECTIONS.filter(c => relevantCatIds.has(c.id)),
    [relevantCatIds],
  );
  const otherCollections = useMemo(
    () => CATEGORY_COLLECTIONS.filter(c => !relevantCatIds.has(c.id)),
    [relevantCatIds],
  );

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

  const selectAllCategory = (catId: string) => {
    const cat = CATEGORY_COLLECTIONS.find(c => c.id === catId);
    if (!cat) return;
    const next = new Set(selectedSceneIds);
    const allSelected = cat.scenes.every(s => next.has(s.id));
    if (allSelected) cat.scenes.forEach(s => next.delete(s.id));
    else cat.scenes.forEach(s => next.add(s.id));
    onSelectionChange(next);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Select scenes</h2>
          <p className="text-sm text-muted-foreground mt-1">Choose the visuals you want for your products.</p>
        </div>
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

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Universal Scenes</h3>
        </div>
        <div className={`grid ${gridClass} gap-2`}>
          {filteredGlobalScenes.map(scene => (
            <SceneCard
              key={scene.id}
              scene={scene}
              selected={selectedSceneIds.has(scene.id)}
              onToggle={() => toggleScene(scene.id)}
            />
          ))}
        </div>
      </div>

      {recommendedCollections.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-primary">Recommended for your products</h3>
          <div className="space-y-2">
            {recommendedCollections.map(cat => (
              <CategorySection
                key={cat.id}
                cat={cat}
                selectedSceneIds={selectedSceneIds}
                expandedCategories={expandedCategories}
                toggleScene={toggleScene}
                toggleCategory={toggleCategory}
                onSelectAllCategory={selectAllCategory}
                isRecommended
                gridClass={gridClass}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Explore more scenes by product type</h3>
        <div className="space-y-2">
          {otherCollections.map(cat => (
            <CategorySection
              key={cat.id}
              cat={cat}
              selectedSceneIds={selectedSceneIds}
              expandedCategories={expandedCategories}
              toggleScene={toggleScene}
              toggleCategory={toggleCategory}
              onSelectAllCategory={selectAllCategory}
              gridClass={gridClass}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductImagesStep2Scenes;
