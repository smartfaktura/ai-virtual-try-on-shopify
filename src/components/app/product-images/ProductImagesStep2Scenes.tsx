import { useState, useMemo, useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, ChevronRight, Camera, Copy, AlertCircle, Paintbrush } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { useProductImageScenes } from '@/hooks/useProductImageScenes';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import type { ProductImageScene, UserProduct, CategoryCollection, SubGroup } from './types';
import { cn } from '@/lib/utils';
import { SceneRequestBanner } from '@/components/app/SceneRequestBanner';

/** Category label lookup */
const CATEGORY_LABELS: Record<string, string> = {
  garments: 'Clothing & Apparel', 'beauty-skincare': 'Beauty & Skincare',
  'makeup-lipsticks': 'Makeup & Lipsticks', fragrance: 'Fragrance',
  food: 'Food & Snacks', beverages: 'Beverages', furniture: 'Furniture', 'home-decor': 'Home Decor',
  'supplements-wellness': 'Supplements & Wellness', shoes: 'Shoes',
  'bags-accessories': 'Bags & Accessories', 'tech-devices': 'Tech / Devices',
  other: 'Other / Custom', backpacks: 'Backpacks',
  'wallets-cardholders': 'Wallets & Cardholders', belts: 'Belts', scarves: 'Scarves',
  'hats-small': 'Hats & Headwear', 'jewellery-necklaces': 'Necklaces',
  'jewellery-earrings': 'Earrings', 'jewellery-bracelets': 'Bracelets',
  'jewellery-rings': 'Rings', watches: 'Watches', dresses: 'Dresses', skirts: 'Skirts',
  hoodies: 'Hoodies', streetwear: 'Streetwear', sneakers: 'Sneakers',
  boots: 'Boots', 'high-heels': 'High Heels', activewear: 'Activewear',
  eyewear: 'Eyewear', swimwear: 'Swimwear', lingerie: 'Lingerie',
  kidswear: 'Kidswear', jeans: 'Jeans', jackets: 'Jackets',
};

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
  discoverScene?: { sceneId: string; title: string } | null;
  /** Full scene object resolved at the page level — lets the From Explore card render instantly. */
  discoverSceneFull?: ProductImageScene | null;
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
  'furniture': ['sofa', 'couch', 'sectional', 'loveseat', 'armchair', 'recliner', 'dining chair', 'office chair', 'accent chair', 'lounge chair', 'rocking chair', 'folding chair', 'bar stool', 'counter stool', 'stool', 'bench', 'ottoman', 'pouf', 'bean bag', 'dining table', 'coffee table', 'side table', 'end table', 'console table', 'accent table', 'nightstand', 'bedside table', 'desk', 'standing desk', 'writing desk', 'vanity', 'bed frame', 'headboard', 'bunk bed', 'daybed', 'futon', 'mattress', 'crib', 'bookshelf', 'bookcase', 'floating shelf', 'wall shelf', 'shelving unit', 'cabinet', 'filing cabinet', 'display cabinet', 'hutch', 'sideboard', 'buffet', 'credenza', 'dresser', 'chest of drawers', 'wardrobe', 'armoire', 'closet organizer', 'tv stand', 'media console', 'entertainment center', 'shoe rack', 'coat rack', 'wine rack', 'pantry', 'kitchen island', 'bar cart', 'furniture'],
  'home-decor': ['candle', 'vase', 'pillow', 'blanket', 'lamp', 'decor', 'home', 'interior', 'rug', 'curtain', 'mirror', 'frame', 'planter', 'ceramic', 'tray', 'coaster', 'diffuser', 'figurine', 'ornament', 'sculpture', 'cushion', 'throw', 'tapestry', 'wall art', 'bookend'],
  'tech-devices': ['phone', 'laptop', 'headphone', 'earbuds', 'speaker', 'charger', 'tablet', 'keyboard', 'mouse', 'camera', 'tech', 'gadget', 'electronic', 'monitor', 'console', 'controller', 'drone', 'wearable'],
  'food': ['food', 'chocolate', 'snack', 'cereal', 'granola', 'sauce', 'honey', 'jam', 'candy', 'chips', 'cookie', 'protein bar', 'organic', 'artisan', 'olive oil'],
  'beverages': ['coffee', 'tea', 'juice', 'beverage', 'soda', 'wine', 'beer', 'water', 'kombucha', 'smoothie', 'energy drink', 'drink', 'lemonade', 'milk'],
  'supplements-wellness': ['vitamin', 'supplement', 'capsule', 'protein', 'collagen', 'probiotic', 'omega', 'wellness', 'greens', 'superfood', 'gummy'],
};

type GridSize = '6col' | '5col' | '4col' | '3col';

const GRID_CLASSES: Record<GridSize, string> = {
  '6col': 'grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
  '5col': 'grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
  '4col': 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  '3col': 'grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3',
};

const CATEGORY_SUPER_GROUPS: { label: string; ids: string[] }[] = [
  { label: 'Fashion & Apparel', ids: ['garments', 'dresses', 'hoodies', 'jeans', 'jackets', 'activewear', 'swimwear', 'lingerie', 'kidswear'] },
  { label: 'Footwear', ids: ['shoes', 'sneakers', 'boots', 'high-heels'] },
  { label: 'Bags & Accessories', ids: ['bags-accessories', 'backpacks', 'wallets-cardholders', 'belts', 'scarves', 'hats-small', 'watches', 'eyewear'] },
  { label: 'Jewelry', ids: ['jewellery-rings', 'jewellery-necklaces', 'jewellery-earrings', 'jewellery-bracelets'] },
  { label: 'Beauty & Fragrance', ids: ['beauty-skincare', 'makeup-lipsticks', 'fragrance'] },
  { label: 'Food & Drink', ids: ['food', 'beverages'] },
  { label: 'Home & Lifestyle', ids: ['home-decor', 'furniture', 'tech-devices', 'supplements-wellness'] },
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
  "snacks-food": "food",
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
  "furniture": "furniture",
  "footwear": "shoes",
  "sports": "activewear",
  "fitness": "activewear",
  "drink": "beverages",
  "drinks": "beverages",
  "wallets": "wallets-cardholders",
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
  const hasAestheticColor = scene.triggerBlocks?.includes('aestheticColor');

  return (
    <button
      onClick={onToggle}
      className={`relative rounded-xl border-2 overflow-hidden text-left transition-all cursor-pointer w-full ${
        selected
          ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.03]'
          : 'border-border hover:border-primary/30 hover:bg-muted/30'
      }`}
    >
      <div className="aspect-[3/4] bg-muted/60 flex items-center justify-center relative">
        {scene.previewUrl ? (
          <ShimmerImage
            src={getOptimizedUrl(scene.previewUrl, { quality: 60 })}
            alt={scene.title}
            className="w-full h-full object-cover"
            loading="lazy"
            wrapperClassName="bg-gradient-to-r from-muted/30 via-muted/80 to-muted/30 bg-[length:200%_100%] animate-shimmer"
          />
        ) : (
          <Camera className="w-6 h-6 text-muted-foreground/30" />
        )}
        {selected && (
          <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
        )}
      </div>
      <div className="p-1.5 min-h-[44px] flex flex-col items-center justify-center gap-0.5">
        <p className="text-[11px] font-semibold truncate text-center w-full">{scene.title}</p>
        <div className="flex items-center justify-center gap-1 h-4">
          {hasBackground && (
            <>
              <Paintbrush className="w-2.5 h-2.5 text-muted-foreground/70" />
              <span className="text-[9px] text-muted-foreground/80 font-medium leading-none">Background</span>
              <div className="w-2 h-2 rounded-full bg-white border border-border" />
              <div className="w-2 h-2 rounded-full bg-[#E8EDE6]" />
              <div className="w-2 h-2 rounded-full bg-[#F8ECE8]" />
              <div className="w-2 h-2 rounded-full bg-gradient-to-tr from-blue-200 to-pink-200 border border-white/30" />
            </>
          )}
          {hasAestheticColor && !hasBackground && (
            <>
              <Paintbrush className="w-2.5 h-2.5 text-muted-foreground/70" />
              <span className="text-[9px] text-muted-foreground/80 font-medium leading-none">Accent</span>
              {scene.suggestedColors && scene.suggestedColors.length > 0
                ? scene.suggestedColors.slice(0, 3).map((c, i) => (
                    <div key={i} className="w-2 h-2 rounded-full border border-border/60" style={{ backgroundColor: c.hex }} />
                  ))
                : <>
                    <div className="w-2 h-2 rounded-full bg-[#5F8A8B]" />
                    <div className="w-2 h-2 rounded-full bg-[#C4835B]" />
                    <div className="w-2 h-2 rounded-full bg-[#8B9E7E]" />
                  </>
              }
            </>
          )}
          {!hasBackground && !hasAestheticColor && (
            <Camera className="w-3 h-3 text-muted-foreground/30" />
          )}
        </div>
      </div>
    </button>
  );
}

/** Small SVG grid-dot icon to represent column density */
function GridDots({ cols, rows }: { cols: number; rows: number }) {
  const gap = 5;
  const r = 1.5;
  const w = (cols - 1) * gap + r * 2;
  const h = (rows - 1) * gap + r * 2;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      {Array.from({ length: rows }, (_, ry) =>
        Array.from({ length: cols }, (_, cx) => (
          <circle key={`${cx}-${ry}`} cx={r + cx * gap} cy={r + ry * gap} r={r} fill="currentColor" />
        ))
      )}
    </svg>
  );
}

function GridSizeToggle({ value, onChange }: { value: GridSize; onChange: (v: GridSize) => void }) {
  const isMobile = useIsMobile();
  
  const sizes: { id: GridSize; dots: [number, number]; title: string }[] = isMobile
    ? [
        { id: '5col', dots: [3, 3], title: '3 columns' },
        { id: '3col', dots: [2, 2], title: '2 columns' },
      ]
    : [
        { id: '6col', dots: [4, 3], title: '6 columns' },
        { id: '5col', dots: [3, 3], title: '5 columns' },
        { id: '4col', dots: [3, 2], title: '4 columns' },
        { id: '3col', dots: [2, 2], title: '3 columns' },
      ];
  return (
    <div className="flex items-center border border-border rounded-md overflow-hidden">
      {sizes.map(s => (
        <button
          key={s.id}
          title={s.title}
          onClick={() => onChange(s.id)}
          className={`px-2 py-1.5 transition-colors ${
            value === s.id
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <GridDots cols={s.dots[0]} rows={s.dots[1]} />
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

function SharedScenePicker({ selectedSceneIds, onSelectionChange, selectedProducts, productAnalyses, discoverScene, discoverSceneFull }: Pick<Step2Props, 'selectedSceneIds' | 'onSelectionChange' | 'selectedProducts' | 'productAnalyses' | 'discoverScene' | 'discoverSceneFull'>) {
  const relevantCatIds = useMemo(() => detectRelevantCategories(selectedProducts, productAnalyses), [selectedProducts, productAnalyses]);
  const priorityCats = useMemo(() => {
    const ids = new Set<string>(relevantCatIds);
    // Ensure the discover scene's collection loads in the first round so its
    // category section is expanded immediately under the From Explore card.
    if (discoverSceneFull?.categoryCollection) ids.add(discoverSceneFull.categoryCollection);
    return Array.from(ids);
  }, [relevantCatIds, discoverSceneFull?.categoryCollection]);
  const { categoryCollections: hookCategoryCollections, isLoading: isLoadingScenes, isLoadingRest } = useProductImageScenes({
    priorityCategories: priorityCats.length > 0 ? priorityCats : undefined,
  });
  const ACTIVE_CATEGORY_COLLECTIONS = hookCategoryCollections;
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set(relevantCatIds));
  const [gridSize, setGridSize] = useState<GridSize>('4col');

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

  // Resolve discoverScene to a full scene object — prefer the parent-provided
  // full object (instant, independent of fetch timing), then search loaded collections.
  const resolvedDiscoverScene = useMemo(() => {
    if (!discoverScene?.sceneId) return null;
    if (discoverSceneFull && discoverSceneFull.id === discoverScene.sceneId) return discoverSceneFull;
    for (const c of ACTIVE_CATEGORY_COLLECTIONS) {
      const found = c.scenes.find(s => s.id === discoverScene.sceneId);
      if (found) return found;
    }
    return null;
  }, [discoverScene?.sceneId, discoverSceneFull, ACTIVE_CATEGORY_COLLECTIONS]);

  // Auto-add discoverScene once (idempotent via ref)
  const autoAddedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!discoverScene?.sceneId) return;
    if (autoAddedRef.current === discoverScene.sceneId) return;
    if (selectedSceneIds.has(discoverScene.sceneId)) {
      autoAddedRef.current = discoverScene.sceneId;
      return;
    }
    const next = new Set(selectedSceneIds);
    next.add(discoverScene.sceneId);
    onSelectionChange(next);
    autoAddedRef.current = discoverScene.sceneId;
  }, [discoverScene?.sceneId, selectedSceneIds, onSelectionChange]);

  // Prune stale selections (but never prune the discoverScene id)
  useEffect(() => {
    const protectedId = discoverScene?.sceneId;
    const stale = Array.from(selectedSceneIds).filter(id => !allVisibleIds.has(id) && id !== protectedId);
    if (stale.length > 0) {
      const next = new Set(selectedSceneIds);
      stale.forEach(id => next.delete(id));
      onSelectionChange(next);
    }
  }, [allVisibleIds, selectedSceneIds, onSelectionChange, discoverScene?.sceneId]);

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
    if (expandedCategories.has(catId)) {
      const next = new Set(expandedCategories);
      next.delete(catId);
      setExpandedCategories(next);
    } else {
      setExpandedCategories(new Set([catId]));
      requestAnimationFrame(() => {
        document.getElementById(`explore-cat-${catId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
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
              catTitle={CATEGORY_LABELS[cat.id] || cat.title}
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

      {/* From Explore — only when user arrived via Discover Recreate */}
      {resolvedDiscoverScene && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-1.5">
            <span>✨</span> From Explore
          </h3>
          <div className={`grid ${gridClass} gap-2`}>
            <SceneCard
              scene={resolvedDiscoverScene}
              selected={selectedSceneIds.has(resolvedDiscoverScene.id)}
              onToggle={() => toggleScene(resolvedDiscoverScene.id)}
            />
          </div>
        </div>
      )}

      {/* Recommended (detected) categories */}
      {isLoadingScenes && unifiedRecommended.length === 0 && (
        <div className="space-y-3">
          {Array.from({ length: Math.min(priorityCats.length || 2, 3) }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-8 w-48 rounded bg-muted mb-2" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-20 rounded-md bg-muted" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {unifiedRecommended.length > 0 && (
        <div className="space-y-2">
          {unifiedRecommended.map(cat => (
            <UnifiedCategorySectionWithSelectAll
              key={cat.id}
              catId={cat.id}
              catTitle={CATEGORY_LABELS[cat.id] || cat.title}
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
          <SceneRequestBanner />
        </div>
      )}

      {(unifiedOther.length > 0 || isLoadingRest) && (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Explore more</h3>
          {isLoadingRest && unifiedOther.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          )}
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
                                    catTitle={CATEGORY_LABELS[cat.id] || cat.title}
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
                    catTitle={CATEGORY_LABELS[cat.id] || cat.title}
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
      id={`explore-cat-${catId}`}
      onClick={onToggleOpen}
      className={`flex items-center justify-between w-full p-3 rounded-xl border transition-colors cursor-pointer ${
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
        <div className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer ${
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

/** Animated color cycling dot */
function CuratorColorHint({ baseHex }: { baseHex: string }) {
  const palette = useMemo(() => [baseHex, '#1a1a1a', '#D4C5B2', '#8B9E7E'], [baseHex]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIdx(i => (i + 1) % palette.length), 2000);
    return () => clearInterval(timer);
  }, [palette]);

  return (
    <span className="flex items-center gap-1.5 shrink-0">
      <div
        className="w-2.5 h-2.5 rounded-full transition-colors duration-500"
        style={{ backgroundColor: palette[idx] }}
      />
      <span className="text-[10px] text-muted-foreground/60 italic">Fit your brand aesthetic</span>
    </span>
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
  const curatorColor = scenes.find(s => s.suggestedColors?.length)?.suggestedColors?.[0];
  const hasEditableBackground = scenes.some(
    s => s.promptTemplate?.includes('{{background}}') || s.triggerBlocks?.includes('aestheticColor')
  );
  const showLegend = hasEditableBackground || /essential/i.test(label);

  return (
    <div className="pt-3 pl-2">
      <div className="flex items-center gap-2 mb-1">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide shrink-0">{label}</p>
        {curatorColor && <CuratorColorHint baseHex={curatorColor.hex} />}
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
      {showLegend && (
        <p className="text-[11px] text-muted-foreground/80 mb-2 flex items-center gap-1">
          <Paintbrush className="w-2.5 h-2.5" />
          Backgrounds shown are editable in the next step
        </p>
      )}
      <div className={`grid ${gridClass} gap-2`}>
        {scenes.map(scene => (
          <SceneCard key={scene.id} scene={scene} selected={selectedSceneIds.has(scene.id)} onToggle={() => toggleScene(scene.id)} />
        ))}
      </div>
    </div>
  );
}


export function ProductImagesStep2Scenes(props: Step2Props) {
  const { hasMultipleCategories, perCategoryScenes, onPerCategoryScenesChange, categoryGroups, selectedProducts, selectedSceneIds, onSelectionChange, productAnalyses, forcedActiveCategoryId, onForcedActiveCategoryIdConsumed, discoverScene, discoverSceneFull } = props;
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
    return <SharedScenePicker selectedSceneIds={selectedSceneIds} onSelectionChange={onSelectionChange} selectedProducts={selectedProducts} productAnalyses={productAnalyses} discoverScene={discoverScene} discoverSceneFull={discoverSceneFull} />;
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
                  <img key={p.id} src={getOptimizedUrl(p.image_url, { width: 40, quality: 40 })} alt={p.title} className="w-6 h-6 sm:w-7 sm:h-7 rounded-md object-cover flex-shrink-0 border-2 border-background" />
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
        {activeIds.size > 0 && (
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 w-full sm:w-auto" onClick={handleApplyToAll}>
            <Copy className="w-3.5 h-3.5" />Apply to all categories
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Select shots for each category below. Use "Apply to all" to copy your selection across categories.
      </p>

      {/* Scene picker for active category */}
      <SharedScenePicker
        selectedSceneIds={activeIds}
        onSelectionChange={handleChange}
        selectedProducts={activeCategoryProducts}
        productAnalyses={productAnalyses}
        discoverScene={discoverScene}
        discoverSceneFull={discoverSceneFull}
      />
    </div>
  );
}

export default ProductImagesStep2Scenes;
