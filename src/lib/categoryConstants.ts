// 11 canonical product families — single source of truth for onboarding Step 2,
// the Settings editor, and dashboard headlines. Mirrors FAMILY_ORDER in sceneTaxonomy.ts.

import { getDiscoverFamilies } from '@/lib/discoverTaxonomy';

// Re-export canonical family ids so any legacy importer gets the same source of
// truth as the user-facing pill row in /app/discover.
export const DISCOVER_CATEGORIES = getDiscoverFamilies().map((f) => f.id);

export const PRODUCT_CATEGORIES = [
  { id: 'fashion', label: 'Fashion & Apparel' },
  { id: 'footwear', label: 'Footwear' },
  { id: 'bags-accessories', label: 'Bags & Accessories' },
  { id: 'watches', label: 'Watches' },
  { id: 'eyewear', label: 'Eyewear' },
  { id: 'jewelry', label: 'Jewelry' },
  { id: 'beauty-fragrance', label: 'Beauty & Fragrance' },
  { id: 'home', label: 'Home' },
  { id: 'tech', label: 'Tech' },
  { id: 'food-drink', label: 'Food & Drink' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'any', label: 'All products' },
];

// Family-level headlines (Step 2 chip selection)
export const CATEGORY_HEADLINES: Record<string, string> = {
  fashion: 'Create your first fashion campaign in seconds - no photoshoot needed.',
  footwear: 'Create your first footwear campaign in seconds - no photoshoot needed.',
  'bags-accessories': 'Create your first bags & accessories campaign in seconds - no photoshoot needed.',
  watches: 'Create your first watch campaign in seconds - no photoshoot needed.',
  eyewear: 'Create your first eyewear campaign in seconds - no photoshoot needed.',
  jewelry: 'Launch your first jewelry campaign in seconds - no photoshoot needed.',
  'beauty-fragrance': 'Launch your first beauty & fragrance campaign in seconds - no photoshoot needed.',
  beauty: 'Launch your first beauty campaign in seconds - no photoshoot needed.',
  fragrances: 'Create your first fragrance campaign in seconds - no photoshoot needed.',
  accessories: 'Create your first accessories campaign in seconds - no photoshoot needed.',
  home: 'Launch your first home campaign in seconds - no photoshoot needed.',
  tech: 'Launch your first tech campaign in seconds - no photoshoot needed.',
  electronics: 'Launch your first electronics campaign in seconds - no photoshoot needed.',
  'food-drink': 'Create your first food & drink campaign in seconds - no photoshoot needed.',
  food: 'Create your first food campaign in seconds - no photoshoot needed.',
  sports: 'Create your first sports campaign in seconds - no photoshoot needed.',
  wellness: 'Launch your first wellness campaign in seconds - no photoshoot needed.',
  supplements: 'Launch your first supplements campaign in seconds - no photoshoot needed.',
  any: 'Create your first campaign in seconds - no photoshoot needed.',
};

export const CATEGORY_HEADLINES_RETURNING: Record<string, string> = {
  fashion: 'Create campaign-ready fashion visuals - no photoshoot needed.',
  footwear: 'Create campaign-ready footwear visuals - no photoshoot needed.',
  'bags-accessories': 'Create campaign-ready bags & accessories visuals - no photoshoot needed.',
  watches: 'Create campaign-ready watch visuals - no photoshoot needed.',
  eyewear: 'Create campaign-ready eyewear visuals - no photoshoot needed.',
  jewelry: 'Create campaign-ready jewelry visuals - no photoshoot needed.',
  'beauty-fragrance': 'Create campaign-ready beauty & fragrance visuals - no photoshoot needed.',
  beauty: 'Create campaign-ready beauty visuals - no photoshoot needed.',
  fragrances: 'Create campaign-ready fragrance visuals - no photoshoot needed.',
  accessories: 'Create campaign-ready accessories visuals - no photoshoot needed.',
  home: 'Create campaign-ready home visuals - no photoshoot needed.',
  tech: 'Create campaign-ready tech visuals - no photoshoot needed.',
  electronics: 'Create campaign-ready electronics visuals - no photoshoot needed.',
  'food-drink': 'Create campaign-ready food & drink visuals - no photoshoot needed.',
  food: 'Create campaign-ready food visuals - no photoshoot needed.',
  sports: 'Create campaign-ready sports visuals - no photoshoot needed.',
  wellness: 'Create campaign-ready wellness visuals - no photoshoot needed.',
  supplements: 'Create campaign-ready supplements visuals - no photoshoot needed.',
  any: 'Create campaign-ready visuals in seconds - no photoshoot needed.',
};

// Sub-type headlines (Step 3 — when a single sub-type is picked, override the family copy)
export const SUBTYPE_HEADLINES: Record<string, string> = {
  hoodies: 'Create your first hoodie campaign in seconds - no photoshoot needed.',
  dresses: 'Create your first dress campaign in seconds - no photoshoot needed.',
  jeans: 'Create your first denim campaign in seconds - no photoshoot needed.',
  jackets: 'Create your first jacket campaign in seconds - no photoshoot needed.',
  activewear: 'Create your first activewear campaign in seconds - no photoshoot needed.',
  swimwear: 'Create your first swimwear campaign in seconds - no photoshoot needed.',
  lingerie: 'Create your first lingerie campaign in seconds - no photoshoot needed.',
  sneakers: 'Create your first sneaker campaign in seconds - no photoshoot needed.',
  boots: 'Create your first boots campaign in seconds - no photoshoot needed.',
  'high-heels': 'Create your first heels campaign in seconds - no photoshoot needed.',
  backpacks: 'Create your first backpack campaign in seconds - no photoshoot needed.',
  fragrance: 'Create your first fragrance campaign in seconds - no photoshoot needed.',
  furniture: 'Create your first furniture campaign in seconds - no photoshoot needed.',
};

export const SUBTYPE_HEADLINES_RETURNING: Record<string, string> = {
  hoodies: 'Create campaign-ready hoodie visuals - no photoshoot needed.',
  dresses: 'Create campaign-ready dress visuals - no photoshoot needed.',
  jeans: 'Create campaign-ready denim visuals - no photoshoot needed.',
  jackets: 'Create campaign-ready jacket visuals - no photoshoot needed.',
  activewear: 'Create campaign-ready activewear visuals - no photoshoot needed.',
  swimwear: 'Create campaign-ready swimwear visuals - no photoshoot needed.',
  lingerie: 'Create campaign-ready lingerie visuals - no photoshoot needed.',
  sneakers: 'Create campaign-ready sneaker visuals - no photoshoot needed.',
  boots: 'Create campaign-ready boots visuals - no photoshoot needed.',
  'high-heels': 'Create campaign-ready heels visuals - no photoshoot needed.',
  backpacks: 'Create campaign-ready backpack visuals - no photoshoot needed.',
  fragrance: 'Create campaign-ready fragrance visuals - no photoshoot needed.',
  furniture: 'Create campaign-ready furniture visuals - no photoshoot needed.',
};

/** Display label for the pill selector */
export function getCategoryLabel(ids: string[]): string {
  const filtered = ids.filter((id) => id !== 'any');
  if (filtered.length === 0 || ids.includes('any') && filtered.length === 0) {
    return 'All products';
  }
  if (filtered.length === 1) {
    const cat = PRODUCT_CATEGORIES.find((c) => c.id === filtered[0]);
    return cat?.label ?? 'All products';
  }
  if (filtered.length === 2) {
    const a = PRODUCT_CATEGORIES.find((c) => c.id === filtered[0])?.label ?? '';
    const b = PRODUCT_CATEGORIES.find((c) => c.id === filtered[1])?.label ?? '';
    return `${a} & ${b}`;
  }
  return 'Your product mix';
}

/**
 * Map an onboarding family chip id (e.g. 'fashion', 'beauty-fragrance') to a short
 * adjective used inside multi-family copy (e.g. "fashion & footwear edits").
 */
const FAMILY_ID_TO_ADJ: Record<string, string> = {
  fashion: 'fashion',
  footwear: 'footwear',
  'bags-accessories': 'accessories',
  watches: 'watch',
  eyewear: 'eyewear',
  jewelry: 'jewelry',
  'beauty-fragrance': 'beauty',
  home: 'home',
  tech: 'tech',
  'food-drink': 'food & drink',
  wellness: 'wellness',
};

/**
 * Build a multi-pick headline when the user selected 2+ sub-types.
 * Pure function. Returns null if no multi-pick branch applies.
 */
export function buildMultiSubtypeHeadline(
  subcategories: string[],
  familyIds: string[],
  isReturning: boolean,
): string | null {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { SUBTYPE_NOUN, getFamilyForSubtype } =
    require('@/lib/onboardingTaxonomy') as typeof import('@/lib/onboardingTaxonomy');

  const subs = (subcategories ?? []).filter(s => !!s && SUBTYPE_NOUN[s]);
  if (subs.length < 2) return null;

  const subFamilies = new Set<string>();
  for (const s of subs) {
    const fam = getFamilyForSubtype(s);
    if (fam) subFamilies.add(fam);
  }

  const pickedFamilyAdjs = (familyIds ?? [])
    .filter(id => id !== 'any')
    .map(id => FAMILY_ID_TO_ADJ[id])
    .filter(Boolean);

  // ── Same-family branch ─────────────────────────────────────────────
  if (subFamilies.size === 1) {
    const fam = Array.from(subFamilies)[0];
    if (subs.length === 2) {
      const a = SUBTYPE_NOUN[subs[0]];
      const b = SUBTYPE_NOUN[subs[1]];
      return isReturning
        ? `Your ${a} & ${b} drops, ready when you are.`
        : `Your ${a} & ${b} drops, ready in seconds.`;
    }
    const nouns = subs.map(s => SUBTYPE_NOUN[s]);
    const head = nouns.slice(0, -1).join(', ');
    const tail = nouns[nouns.length - 1];
    return isReturning
      ? `Your ${fam} mix — ${head} and ${tail}, ready when you are.`
      : `Your ${fam} mix, ready in seconds — ${head} and ${tail}.`;
  }

  // ── Cross-family branch ────────────────────────────────────────────
  if (subFamilies.size === 2 && pickedFamilyAdjs.length >= 2) {
    const [a, b] = pickedFamilyAdjs;
    return isReturning
      ? `Your ${a} & ${b} edits — campaign-ready, no photoshoot.`
      : `Your ${a} & ${b} edits — no photoshoot needed.`;
  }

  // 3+ families → fall through to generic copy
  return null;
}

/**
 * Dynamic headline based on selected categories.
 * Resolution: 1) single sub-type override → 2) multi sub-type copy → 3) family fallbacks.
 */
export function getCategoryHeadline(
  ids: string[],
  isReturning: boolean = false,
  subcategories?: string[] | null,
): string {
  const headlineMap = isReturning ? CATEGORY_HEADLINES_RETURNING : CATEGORY_HEADLINES;
  const subMap = isReturning ? SUBTYPE_HEADLINES_RETURNING : SUBTYPE_HEADLINES;

  if (subcategories && subcategories.length === 1) {
    const hit = subMap[subcategories[0]];
    if (hit) return hit;
  }

  if (subcategories && subcategories.length >= 2) {
    const multi = buildMultiSubtypeHeadline(subcategories, ids, isReturning);
    if (multi) return multi;
  }

  const filtered = ids.filter((id) => id !== 'any');
  if (filtered.length === 0 || ids.includes('any')) {
    return headlineMap.any;
  }
  if (filtered.length === 1) {
    return headlineMap[filtered[0]] ?? headlineMap.any;
  }
  if (filtered.length === 2) {
    return isReturning
      ? 'Create high-quality visuals tailored to your products - no photoshoot needed.'
      : 'Create high-quality visuals tailored to your products - from styled campaigns to real-life scenes.';
  }
  return isReturning
    ? 'Turn your product mix into consistent, high-quality visuals - no photoshoot needed.'
    : 'Turn your product mix into consistent, high-quality visuals in seconds.';
}
