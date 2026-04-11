import { useState, useMemo, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronDown, ChevronRight, Camera, Copy, AlertCircle } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { useProductImageScenes } from '@/hooks/useProductImageScenes';
import type { ProductImageScene, UserProduct, CategoryCollection, SubGroup } from './types';
import { cn } from '@/lib/utils';

interface Step2Props {
  selectedSceneIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  selectedProducts: UserProduct[];
  productAnalyses?: Record<string, { category: string }>;
  perCategoryScenes?: Map<string, Set<string>>;
  onPerCategoryScenesChange?: (map: Map<string, Set<string>>) => void;
  categoryGroups?: Map<string, string[]>;
  hasMultipleCategories?: boolean;
  forcedActiveCategoryId?: string | null;
  onForcedActiveCategoryIdConsumed?: () => void;
}

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  // ── Specific categories FIRST (matched before generic parents) ──
  // Jewellery (before hats-small)
  'jewellery-necklaces': ['necklace', 'pendant', 'chain necklace', 'choker', 'lariat'],
  'jewellery-earrings': ['earring', 'stud', 'hoop', 'drop earring', 'huggie', 'ear cuff'],
  'jewellery-bracelets': ['bracelet', 'bangle', 'cuff bracelet', 'charm bracelet', 'tennis bracelet', 'wristband'],
  'jewellery-rings': ['ring', 'signet', 'band ring', 'cocktail ring', 'engagement ring', 'wedding band'],
  'watches': ['watch', 'timepiece', 'chronograph', 'wristwatch', 'smartwatch'],
  'eyewear': ['sunglasses', 'glasses', 'eyewear', 'optical', 'aviator', 'wayfarer', 'spectacles'],
  // Accessories (before bags-accessories)
  'backpacks': ['backpack', 'rucksack', 'daypack', 'school bag', 'laptop bag'],
  'wallets-cardholders': ['wallet', 'cardholder', 'card holder', 'card case', 'money clip', 'billfold'],
  'belts': ['belt', 'waist belt', 'leather belt', 'buckle belt', 'chain belt'],
  'scarves': ['scarf', 'shawl', 'wrap', 'bandana', 'neckerchief', 'stole'],
  // Footwear (before shoes)
  'sneakers': ['sneaker', 'trainer', 'air max', 'nike dunk', 'jordan', 'running shoe', 'tennis shoe', 'skate shoe', 'new balance'],
  'boots': ['boot', 'ankle boot', 'chelsea boot', 'combat boot', 'hiking boot', 'cowboy boot', 'rain boot', 'lace-up boot'],
  'high-heels': ['high heel', 'stiletto', 'pump', 'platform heel', 'kitten heel', 'wedge heel', 'strappy heel', 'mule heel'],
  // Fashion (before garments)
  'dresses': ['dress', 'gown', 'maxi dress', 'midi dress', 'mini dress', 'sundress', 'cocktail dress', 'evening dress', 'wrap dress'],
  'hoodies': ['hoodie', 'hooded sweatshirt', 'zip-up hoodie', 'pullover hoodie', 'oversized hoodie'],
  'streetwear': ['streetwear', 'graphic tee', 'oversized tee', 'graphic print', 'urban wear', 'skate', 'hypebeast'],
  'jeans': ['jeans', 'denim', 'skinny jeans', 'wide-leg jeans', 'straight-leg jeans', 'mom jeans', 'boyfriend jeans', 'distressed jeans'],
  'jackets': ['jacket', 'blazer', 'bomber', 'puffer', 'windbreaker', 'denim jacket', 'leather jacket', 'parka', 'trench coat', 'overcoat'],
  'activewear': ['activewear', 'sportswear', 'yoga', 'gym wear', 'athletic', 'workout', 'running', 'legging', 'sports bra', 'alo yoga', 'lululemon', 'fitness'],
  'swimwear': ['swimwear', 'bikini', 'swimsuit', 'one-piece', 'swim trunks', 'board shorts', 'bathing suit', 'rash guard'],
  'lingerie': ['lingerie', 'bra', 'underwear', 'bodysuit', 'corset', 'negligee', 'camisole', 'teddy', 'intimates'],
  'kidswear': ['kids', 'children', 'baby', 'toddler', 'infant', 'kidswear', 'boys', 'girls', 'newborn', 'junior'],
  // Beauty split
  'makeup-lipsticks': ['lipstick', 'mascara', 'foundation', 'concealer', 'blush', 'eyeshadow', 'makeup', 'cosmetic', 'lip gloss', 'lip liner', 'bronzer', 'highlighter', 'primer', 'eyeliner', 'contour', 'setting powder', 'setting spray', 'rouge', 'cheek'],
  'beauty-skincare': ['serum', 'moisturizer', 'cleanser', 'toner', 'skincare', 'cream', 'sunscreen', 'essence', 'treatment', 'mask', 'shampoo', 'conditioner', 'body wash', 'face wash', 'lotion', 'exfoliant', 'retinol', 'hyaluronic'],
  // ── Generic parent categories (fallback) ──
  'fragrance': ['perfume', 'cologne', 'fragrance', 'eau de', 'scent', 'parfum'],
  'bags-accessories': ['bag', 'handbag', 'purse', 'clutch', 'tote', 'briefcase', 'satchel', 'crossbody', 'messenger', 'duffel', 'case', 'pouch'],
  'hats-small': ['hat', 'cap', 'beanie', 'fedora', 'beret', 'headband', 'visor', 'bucket hat'],
  'shoes': ['shoe', 'sandal', 'loafer', 'slipper', 'footwear', 'mule', 'clog', 'oxford', 'derby', 'flat'],
  'garments': ['shirt', 'pants', 'sweater', 'coat', 'skirt', 'blouse', 'top', 'shorts', 'clothing', 'apparel', 'garment', 'jersey', 'tank', 'polo', 'uniform', 'tracksuit', 'jogger', 'vest', 'cardigan', 'suit', 'romper', 'jumpsuit'],
  'home-decor': ['candle', 'vase', 'pillow', 'blanket', 'lamp', 'decor', 'home', 'interior', 'furniture', 'rug', 'curtain', 'mirror', 'frame', 'planter', 'ceramic'],
  'tech-devices': ['phone', 'laptop', 'headphone', 'earbuds', 'speaker', 'charger', 'tablet', 'keyboard', 'mouse', 'camera', 'tech', 'gadget', 'electronic', 'monitor', 'console', 'controller', 'drone', 'wearable'],
  'food': ['food', 'chocolate', 'snack', 'cereal', 'granola', 'sauce', 'honey', 'jam', 'candy', 'chips', 'cookie', 'protein bar', 'organic', 'artisan', 'olive oil'],
  'beverages': ['coffee', 'tea', 'juice', 'beverage', 'soda', 'wine', 'beer', 'water', 'kombucha', 'smoothie', 'energy drink', 'drink', 'lemonade', 'milk'],
  'supplements-wellness': ['vitamin', 'supplement', 'capsule', 'protein', 'collagen', 'probiotic', 'omega', 'wellness', 'greens', 'superfood', 'gummy'],
};

type GridSize = 'small' | 'medium' | 'large';

const GRID_CLASSES: Record<GridSize, string> = {
  small: 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7',
  medium: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6',
  large: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
};

const CATEGORY_SUPER_GROUPS: { label: string; ids: string[] }[] = [
  { label: 'Fashion & Apparel', ids: ['garments', 'dresses', 'hoodies', 'jeans', 'jackets', 'activewear', 'swimwear', 'lingerie', 'kidswear', 'streetwear'] },
  { label: 'Footwear', ids: ['shoes', 'sneakers', 'boots', 'high-heels'] },
  { label: 'Bags & Accessories', ids: ['bags-accessories', 'backpacks', 'wallets-cardholders', 'belts', 'scarves', 'hats-small', 'watches', 'eyewear'] },
  { label: 'Jewelry', ids: ['jewellery-rings', 'jewellery-necklaces', 'jewellery-earrings', 'jewellery-bracelets'] },
  { label: 'Beauty & Fragrance', ids: ['beauty-skincare', 'makeup-lipsticks', 'fragrance'] },
  { label: 'Food & Drink', ids: ['food', 'beverages'] },
  { label: 'Home & Lifestyle', ids: ['home-decor', 'tech-devices', 'supplements-wellness'] },
];

/** Refine generic parent categories to specific child when title strongly matches */
const SPECIFICITY_OVERRIDES: [string, RegExp, string][] = [
  ["bags-accessories", /scarf|shawl|wrap|stole/i, "scarves"],
  ["bags-accessories", /wallet|cardholder|card holder|card case/i, "wallets-cardholders"],
  ["bags-accessories", /\bbelt\b|waist belt/i, "belts"],
  ["bags-accessories", /backpack|rucksack|daypack/i, "backpacks"],
  ["garments", /\bdress\b|\bdresses\b|gown/i, "dresses"],
  ["garments", /hoodie|hooded sweatshirt/i, "hoodies"],
  ["garments", /\bjeans\b|denim/i, "jeans"],
  ["garments", /jacket|blazer|bomber|puffer/i, "jackets"],
  ["shoes", /sneaker|trainer/i, "sneakers"],
  ["shoes", /\bboot\b|\bboots\b/i, "boots"],
  ["shoes", /high heel|stiletto|pump/i, "high-heels"],
];

/** Normalize common AI mismatches to valid category_collection IDs */
const CATEGORY_ALIASES: Record<string, string> = {
  "accessories": "bags-accessories",
  "food-beverage": "food",
  "food-beverages": "food",
  "jewelry": "jewellery-necklaces",
  "jewellery": "jewellery-necklaces",
  "fashion": "garments",
  "beauty": "beauty-skincare",
  "skincare": "beauty-skincare",
  "makeup": "makeup-lipsticks",
  "cosmetics": "makeup-lipsticks",
  "electronics": "tech-devices",
  "technology": "tech-devices",
  "supplements": "supplements-wellness",
  "health": "supplements-wellness",
  "wellness": "supplements-wellness",
  "home": "home-decor",
  "decor": "home-decor",
  "footwear": "shoes",
  "sports": "activewear",
  "fitness": "activewear",
  "drink": "beverages",
  "drinks": "beverages",
};

function refineCategory(cat: string, title: string): string {
  for (const [parent, pattern, child] of SPECIFICITY_OVERRIDES) {
    if (cat === parent && pattern.test(title)) return child;
  }
  return cat;
}

/** Valid category_collection IDs (built from CATEGORY_KEYWORDS keys) */
const VALID_CATEGORY_IDS = new Set(Object.keys(CATEGORY_KEYWORDS));

function normalizeAndValidateCategory(raw: string, title: string): string | null {
  let cat = refineCategory(raw, title);
  if (VALID_CATEGORY_IDS.has(cat)) return cat;
  // Try alias
  const aliased = CATEGORY_ALIASES[cat.toLowerCase()];
  if (aliased) {
    cat = refineCategory(aliased, title);
    if (VALID_CATEGORY_IDS.has(cat)) return cat;
  }
  return null; // invalid — fall through to keyword detection
}

function detectRelevantCategories(products: UserProduct[], productAnalyses?: Record<string, { category: string }>): Set<string> {
  const matched = new Set<string>();

  for (const p of products) {
    // Try AI analysis first, then cached analysis_json
    const rawCat = productAnalyses?.[p.id]?.category
      || ((p as any).analysis_json as { category?: string } | null)?.category;

    if (rawCat) {
      const valid = normalizeAndValidateCategory(rawCat, p.title || '');
      if (valid) {
        matched.add(valid);
        continue; // resolved — skip keyword fallback
      }
    }

    // Keyword fallback
    const text = `${p.title} ${p.description} ${p.product_type} ${(p.tags || []).join(' ')}`.toLowerCase();
    for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(text))) {
        matched.add(catId);
        break;
      }
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

function SharedScenePicker({ selectedSceneIds, onSelectionChange, selectedProducts, productAnalyses }: Pick<Step2Props, 'selectedSceneIds' | 'onSelectionChange' | 'selectedProducts' | 'productAnalyses'>) {
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
        <h2 className="text-lg font-semibold tracking-tight">Select shots</h2>
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
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Explore more</h3>
          {(() => {
            const otherIds = new Set(unifiedOther.map(c => c.id));
            const rendered = new Set<string>();
            return (
              <>
                {CATEGORY_SUPER_GROUPS.map(({ label, ids }) => {
                  const items = ids.filter(id => otherIds.has(id));
                  if (items.length === 0) return null;
                  items.forEach(id => rendered.add(id));

                  // Chunk items into pairs for 2-column layout
                  const pairs: string[][] = [];
                  for (let i = 0; i < items.length; i += 2) {
                    pairs.push(items.slice(i, i + 2));
                  }

                  return (
                    <div key={label} className="space-y-1.5">
                      <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest mt-2">{label}</p>
                      {pairs.map((pair, pairIdx) => {
                        // Find expanded category within this pair (if any)
                        const expandedInPair = pair.find(id => expandedCategories.has(id));
                        const expandedCat = expandedInPair ? unifiedOther.find(c => c.id === expandedInPair) : null;

                        return (
                          <div key={pairIdx}>
                            {/* 2-column grid of triggers */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {pair.map(id => {
                                const cat = unifiedOther.find(c => c.id === id)!;
                                return (
                                  <CategoryRowTrigger
                                    key={cat.id}
                                    catId={cat.id}
                                    catTitle={cat.title}
                                    allScenes={[...cat.essentialScenes, ...cat.scenes]}
                                    selectedSceneIds={selectedSceneIds}
                                    isOpen={expandedCategories.has(cat.id)}
                                    onToggleOpen={() => toggleCategory(cat.id)}
                                  />
                                );
                              })}
                            </div>
                            {/* Full-width expanded content below the pair */}
                            {expandedCat && (
                              <CategoryExpandedContent
                                catId={expandedCat.id}
                                catTitle={expandedCat.title}
                                essentialScenes={expandedCat.essentialScenes}
                                categoryScenes={expandedCat.scenes}
                                categorySubGroups={expandedCat.subGroups}
                                selectedSceneIds={selectedSceneIds}
                                onSelectionChange={onSelectionChange}
                                toggleScene={toggleScene}
                                gridClass={gridClass}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                {/* Uncategorized leftovers */}
                {unifiedOther.filter(c => !rendered.has(c.id)).map(cat => (
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
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

/** Compact trigger row for 2-column grid layout */
function CategoryRowTrigger({ catId, catTitle, allScenes, selectedSceneIds, isOpen, onToggleOpen }: {
  catId: string;
  catTitle: string;
  allScenes: ProductImageScene[];
  selectedSceneIds: Set<string>;
  isOpen: boolean;
  onToggleOpen: () => void;
}) {
  const selectedCount = allScenes.filter(s => selectedSceneIds.has(s.id)).length;
  return (
    <button
      onClick={onToggleOpen}
      className={`flex items-center justify-between w-full p-3 rounded-lg border transition-colors cursor-pointer ${
        isOpen ? 'border-primary/30 bg-primary/[0.03]' : 'border-border hover:bg-muted/30'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{catTitle}</span>
        {selectedCount > 0 && (
          <Badge variant="default" className="text-[10px] h-5 px-1.5">{selectedCount} / {allScenes.length}</Badge>
        )}
        {selectedCount === 0 && (
          <span className="text-[10px] text-muted-foreground">{allScenes.length}</span>
        )}
      </div>
      {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
    </button>
  );
}

/** Full-width expanded content for a category */
function CategoryExpandedContent({ catId, catTitle, essentialScenes, categoryScenes, categorySubGroups, selectedSceneIds, onSelectionChange, toggleScene, gridClass }: {
  catId: string;
  catTitle: string;
  essentialScenes: ProductImageScene[];
  categoryScenes: ProductImageScene[];
  categorySubGroups?: SubGroup[];
  selectedSceneIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  toggleScene: (id: string) => void;
  gridClass: string;
}) {
  const resolveLabel = (scene: ProductImageScene, fallback: string) => scene.subCategory || fallback;

  const essentialSubGroups = useMemo(() => {
    const map = new Map<string, ProductImageScene[]>();
    for (const s of essentialScenes) {
      const key = resolveLabel(s, 'Essential Shots');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries()).map(([label, scenes]) => ({ label, scenes }));
  }, [essentialScenes]);

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
    <div className="mt-1.5 rounded-lg border border-border bg-muted/10 p-2">
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
    </div>
  );
}


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

/** Category label lookup */
const CATEGORY_LABELS: Record<string, string> = {
  garments: 'Clothing & Apparel', 'beauty-skincare': 'Beauty & Skincare',
  'makeup-lipsticks': 'Makeup & Lipsticks', fragrance: 'Fragrance',
  food: 'Food & Snacks', beverages: 'Beverages', 'home-decor': 'Home & Interior',
  'supplements-wellness': 'Supplements & Wellness', shoes: 'Shoes',
  'bags-accessories': 'Bags & Accessories', 'tech-devices': 'Tech / Devices',
  other: 'Other / Custom', backpacks: 'Backpacks',
  'wallets-cardholders': 'Wallets & Cardholders', belts: 'Belts', scarves: 'Scarves',
  'hats-small': 'Hats & Headwear', 'jewellery-necklaces': 'Necklaces',
  'jewellery-earrings': 'Earrings', 'jewellery-bracelets': 'Bracelets',
  'jewellery-rings': 'Rings', watches: 'Watches', dresses: 'Dresses',
  hoodies: 'Hoodies', streetwear: 'Streetwear', sneakers: 'Sneakers',
  boots: 'Boots', 'high-heels': 'High Heels', activewear: 'Activewear',
  eyewear: 'Eyewear', swimwear: 'Swimwear', lingerie: 'Lingerie',
  kidswear: 'Kidswear', jeans: 'Jeans', jackets: 'Jackets',
};

export function ProductImagesStep2Scenes(props: Step2Props) {
  const { hasMultipleCategories, perCategoryScenes, onPerCategoryScenesChange, categoryGroups, selectedProducts, selectedSceneIds, onSelectionChange, productAnalyses, forcedActiveCategoryId, onForcedActiveCategoryIdConsumed } = props;
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const isMultiCategory = !!hasMultipleCategories && !!perCategoryScenes && !!onPerCategoryScenesChange && !!categoryGroups && categoryGroups.size > 1;

  // Handle forced tab switch from parent (validation)
  useEffect(() => {
    if (forcedActiveCategoryId && isMultiCategory) {
      setActiveCategoryId(forcedActiveCategoryId);
      onForcedActiveCategoryIdConsumed?.();
      setTimeout(() => {
        tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [forcedActiveCategoryId, isMultiCategory, onForcedActiveCategoryIdConsumed]);

  if (!isMultiCategory) {
    return <SharedScenePicker selectedSceneIds={selectedSceneIds} onSelectionChange={onSelectionChange} selectedProducts={selectedProducts} productAnalyses={productAnalyses} />;
  }

  const categoryIds = Array.from(categoryGroups.keys());
  const activeCategory = activeCategoryId && categoryGroups.has(activeCategoryId) ? activeCategoryId : categoryIds[0];
  const activeIds = perCategoryScenes.get(activeCategory) || new Set<string>();
  const activeCategoryProducts = (categoryGroups.get(activeCategory) || []).map(pid => selectedProducts.find(p => p.id === pid)).filter(Boolean) as UserProduct[];

  const handleChange = (ids: Set<string>) => {
    const next = new Map(perCategoryScenes);
    next.set(activeCategory, ids);
    onPerCategoryScenesChange(next);
    const union = new Set<string>();
    for (const s of next.values()) s.forEach(id => union.add(id));
    onSelectionChange(union);
  };

  const handleApplyToAll = () => {
    const next = new Map(perCategoryScenes);
    for (const catId of categoryIds) {
      next.set(catId, new Set(activeIds));
    }
    onPerCategoryScenesChange(next);
    const union = new Set<string>();
    for (const s of next.values()) s.forEach(id => union.add(id));
    onSelectionChange(union);
  };

  return (
    <div className="space-y-4">
      {/* Category group tabs */}
      {/* Category group tabs — vertical on mobile, flex-wrap on desktop */}
      <div ref={tabsRef} className="flex flex-col sm:flex-row sm:flex-wrap gap-1.5 sm:gap-2">
        {categoryIds.map(catId => {
          const isActive = catId === activeCategory;
          const count = perCategoryScenes.get(catId)?.size || 0;
          const needsShots = count === 0;
          const productIds = categoryGroups.get(catId) || [];
          const catProducts = productIds.map(pid => selectedProducts.find(p => p.id === pid)).filter(Boolean) as UserProduct[];
          const label = CATEGORY_LABELS[catId] || catId;
          return (
            <button
              key={catId}
              onClick={() => setActiveCategoryId(catId)}
              className={cn(
                'flex items-center gap-2 sm:gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border-2 transition-all whitespace-nowrap cursor-pointer',
                'w-full sm:w-auto',
                isActive
                  ? needsShots
                    ? 'border-destructive/60 bg-destructive/[0.05] shadow-sm'
                    : 'border-primary bg-primary/[0.05] shadow-sm'
                  : needsShots
                    ? 'border-destructive/30 hover:border-destructive/50 hover:bg-destructive/[0.03]'
                    : 'border-border hover:border-primary/30 hover:bg-muted/30'
              )}
            >
              {/* Mini product thumbnails */}
              <div className="flex -space-x-1.5">
                {catProducts.slice(0, 3).map(p => (
                  <img key={p.id} src={p.image_url} alt={p.title} className="w-6 h-6 sm:w-7 sm:h-7 rounded-md object-cover flex-shrink-0 border-2 border-background" />
                ))}
                {catProducts.length > 3 && (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground border-2 border-background">
                    +{catProducts.length - 3}
                  </div>
                )}
              </div>
              <span className="text-xs font-semibold">{label}</span>
              {count > 0 && <Badge variant="default" className="text-[10px] h-5 px-1.5 ml-auto sm:ml-0">{count}</Badge>}
              {needsShots && (
                <span className="text-[10px] font-medium text-destructive animate-pulse ml-auto sm:ml-0">Select →</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Compact status chips + apply-all */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {categoryIds.map(catId => {
            const count = perCategoryScenes.get(catId)?.size || 0;
            const needsShots = count === 0;
            const label = CATEGORY_LABELS[catId] || catId;
            return (
              <button
                key={catId}
                onClick={() => setActiveCategoryId(catId)}
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors cursor-pointer border',
                  needsShots
                    ? 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
                    : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', needsShots ? 'bg-destructive' : 'bg-primary')} />
                {label} {count > 0 ? `✓ ${count}` : '0'}
              </button>
            );
          })}
        </div>
        {activeIds.size > 0 && (
          <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 sm:ml-auto w-full sm:w-auto" onClick={handleApplyToAll}>
            <Copy className="w-3 h-3" />Apply to all
          </Button>
        )}
      </div>

      {/* Scene picker for active category */}
      <SharedScenePicker
        selectedSceneIds={activeIds}
        onSelectionChange={handleChange}
        selectedProducts={activeCategoryProducts}
        productAnalyses={productAnalyses}
      />
    </div>
  );
}

export default ProductImagesStep2Scenes;
