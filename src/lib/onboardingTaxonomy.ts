// Onboarding sub-type taxonomy — derived from sceneTaxonomy.ts
// Pure constants + helpers. Single source of truth for the Step 3 onboarding picker
// and the Settings sub-type editor. Mirrors the Catalog sub-family ordering.

import {
  CATEGORY_FAMILY_MAP,
  FAMILY_ORDER,
  SUB_FAMILY_LABEL_OVERRIDES,
  getSubFamilyLabel,
} from '@/lib/sceneTaxonomy';

export interface SubType {
  /** category_collection slug — stored in profiles.product_subcategories */
  slug: string;
  /** Human-readable chip label */
  label: string;
}

/**
 * Display order of sub-families inside each family.
 * Mirrors the Catalog sidebar grouping so the onboarding picker matches what
 * users see in /app/freestyle exactly.
 */
const FAMILY_SUB_ORDER: Record<string, string[]> = {
  Fashion: [
    'garments',
    'hoodies',
    'dresses',
    'jeans',
    'jackets',
    'activewear',
    'swimwear',
    'lingerie',
    'streetwear',
  ],
  Footwear: ['shoes', 'sneakers', 'boots', 'high-heels'],
  'Bags & Accessories': [
    'bags-accessories',
    'backpacks',
    'wallets-cardholders',
    'belts',
    'scarves',
  ],
  'Hats, Caps & Beanies': ['caps', 'hats', 'beanies'],
  Watches: ['watches'],
  Eyewear: ['eyewear'],
  Jewelry: [
    'jewellery-rings',
    'jewellery-necklaces',
    'jewellery-earrings',
    'jewellery-bracelets',
  ],
  'Beauty & Fragrance': ['beauty-skincare', 'makeup-lipsticks', 'fragrance'],
  Home: ['home-decor', 'furniture'],
  Tech: ['tech-devices'],
  'Food & Drink': ['food', 'beverages', 'snacks-food'],
  Wellness: ['supplements-wellness'],
};

/**
 * Build family → ordered SubType[] from CATEGORY_FAMILY_MAP.
 * Uses FAMILY_SUB_ORDER for display order and SUB_FAMILY_LABEL_OVERRIDES for labels.
 */
export const SUB_TYPES_BY_FAMILY: Record<string, SubType[]> = (() => {
  const out: Record<string, SubType[]> = {};

  // Group all collection slugs by family from CATEGORY_FAMILY_MAP
  const byFamily: Record<string, Set<string>> = {};
  for (const [slug, fam] of Object.entries(CATEGORY_FAMILY_MAP)) {
    if (!byFamily[fam]) byFamily[fam] = new Set();
    byFamily[fam].add(slug);
  }

  for (const fam of FAMILY_ORDER) {
    const slugs = byFamily[fam];
    if (!slugs) continue;
    const ordered = FAMILY_SUB_ORDER[fam] ?? Array.from(slugs);
    out[fam] = ordered
      .filter(s => slugs.has(s))
      .map(slug => ({ slug, label: getSubFamilyLabel(slug) }));
  }
  return out;
})();

/** Families with 2+ sub-types — these render sections in Step 3. */
export function getMultiSubFamilies(families: string[]): string[] {
  return families.filter(f => (SUB_TYPES_BY_FAMILY[f]?.length ?? 0) >= 2);
}

/** Families with exactly 1 sub-type — silently auto-included on save. */
export function getSingleSubFamilies(families: string[]): string[] {
  return families.filter(f => (SUB_TYPES_BY_FAMILY[f]?.length ?? 0) === 1);
}

/** All sub-type slugs for the given families (auto-include helper). */
export function getAutoIncludedSlugs(singleSubFamilies: string[]): string[] {
  return singleSubFamilies.flatMap(f =>
    (SUB_TYPES_BY_FAMILY[f] ?? []).map(s => s.slug),
  );
}

/**
 * Map onboarding family chip ids (from PRODUCT_CATEGORIES) → canonical FAMILY_ORDER name.
 * Family chip ids are kebab-case: 'fashion', 'footwear', 'bags-accessories', etc.
 */
export const FAMILY_ID_TO_NAME: Record<string, string> = {
  fashion: 'Fashion',
  footwear: 'Footwear',
  'bags-accessories': 'Bags & Accessories',
  'hats-caps-beanies': 'Hats, Caps & Beanies',
  watches: 'Watches',
  eyewear: 'Eyewear',
  jewelry: 'Jewelry',
  'beauty-fragrance': 'Beauty & Fragrance',
  home: 'Home',
  tech: 'Tech',
  'food-drink': 'Food & Drink',
  wellness: 'Wellness',
};

/** Reverse: canonical family name → onboarding chip id. */
export const FAMILY_NAME_TO_ID: Record<string, string> = Object.fromEntries(
  Object.entries(FAMILY_ID_TO_NAME).map(([id, name]) => [name, id]),
);

/** Resolve picked family chip ids → canonical FAMILY_ORDER names (preserves FAMILY_ORDER). */
export function resolveFamilyNames(familyIds: string[]): string[] {
  const set = new Set(familyIds.map(id => FAMILY_ID_TO_NAME[id]).filter(Boolean));
  return FAMILY_ORDER.filter(f => set.has(f));
}

/** Re-export so callers don't need to know about sceneTaxonomy. */
export { SUB_FAMILY_LABEL_OVERRIDES };

/**
 * Set of all valid sub-type slugs across all families.
 * Used by `cleanSubs` to drop typos / removed slugs on write.
 */
export const SUB_TYPE_SLUG_SET: Record<string, true> = (() => {
  const set: Record<string, true> = {};
  for (const fam of Object.keys(SUB_TYPES_BY_FAMILY)) {
    for (const t of SUB_TYPES_BY_FAMILY[fam]) set[t.slug] = true;
  }
  return set;
})();

/**
 * Normalise a sub-type slug list before writing to `profiles.product_subcategories`.
 * - lowercases + trims
 * - dedupes
 * - drops anything not in SUB_TYPE_SLUG_SET (typos, taxonomy drift)
 */
export function cleanSubs(xs: string[] | null | undefined): string[] {
  if (!xs || !xs.length) return [];
  return Array.from(
    new Set(
      xs
        .filter((s): s is string => typeof s === 'string')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean)
        .filter(s => SUB_TYPE_SLUG_SET[s] === true),
    ),
  );
}

/**
 * Singular noun lookup for sub-type slugs.
 * Used by buildMultiSubtypeHeadline() to render copy like
 *   "Your hoodie & denim drops, ready in seconds."
 */
export const SUBTYPE_NOUN: Record<string, string> = {
  // Fashion
  garments: 'clothing',
  hoodies: 'hoodie',
  dresses: 'dress',
  jeans: 'denim',
  jackets: 'jacket',
  activewear: 'activewear',
  swimwear: 'swimwear',
  lingerie: 'lingerie',
  streetwear: 'streetwear',
  // Footwear
  shoes: 'shoe',
  sneakers: 'sneaker',
  boots: 'boot',
  'high-heels': 'heels',
  // Bags & Accessories
  'bags-accessories': 'bag',
  backpacks: 'backpack',
  'wallets-cardholders': 'cardholder',
  belts: 'belt',
  scarves: 'scarf',
  caps: 'cap',
  hats: 'hat',
  beanies: 'beanie',
  // Watches / Eyewear
  watches: 'watch',
  eyewear: 'eyewear',
  // Jewelry
  'jewellery-rings': 'ring',
  'jewellery-necklaces': 'necklace',
  'jewellery-earrings': 'earring',
  'jewellery-bracelets': 'bracelet',
  // Beauty
  'beauty-skincare': 'skincare',
  'makeup-lipsticks': 'makeup',
  fragrance: 'fragrance',
  // Home / Tech
  'home-decor': 'decor',
  furniture: 'furniture',
  'tech-devices': 'device',
  // Food / Wellness
  food: 'food',
  beverages: 'drink',
  'snacks-food': 'snack',
  'supplements-wellness': 'wellness',
};

/** Sub-type slug → its family name (e.g. 'hoodies' -> 'Fashion'). */
export function getFamilyForSubtype(slug: string): string | null {
  for (const fam of Object.keys(SUB_TYPES_BY_FAMILY)) {
    if (SUB_TYPES_BY_FAMILY[fam].some(t => t.slug === slug)) return fam;
  }
  return null;
}
