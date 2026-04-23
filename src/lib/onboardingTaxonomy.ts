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
    'hats-small',
  ],
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
