// Scene catalog taxonomy — shared maps and helpers for the Freestyle SceneCatalogModal.
// Pure constants + pure functions only. Safe to import anywhere.

export type SceneSubject = 'product-only' | 'with-model' | 'hands-only';
export type SceneShotStyle =
  | 'packshot' | 'editorial' | 'lifestyle' | 'flatlay'
  | 'macro' | 'portrait' | 'still-life' | 'campaign';
export type SceneSetting = 'studio' | 'indoor' | 'outdoor' | 'surface' | 'editorial-set';

/** Group raw category_collection slugs into ~12 readable families for the sidebar. */
export const CATEGORY_FAMILY_MAP: Record<string, string> = {
  garments: 'Fashion',
  dresses: 'Fashion',
  hoodies: 'Fashion',
  jeans: 'Fashion',
  jackets: 'Fashion',
  activewear: 'Fashion',
  swimwear: 'Fashion',
  lingerie: 'Fashion',
  kidswear: 'Fashion',
  streetwear: 'Fashion',

  shoes: 'Footwear',
  sneakers: 'Footwear',
  boots: 'Footwear',
  'high-heels': 'Footwear',

  'bags-accessories': 'Bags & Accessories',
  backpacks: 'Bags & Accessories',
  'wallets-cardholders': 'Bags & Accessories',
  belts: 'Bags & Accessories',
  scarves: 'Bags & Accessories',
  'hats-small': 'Bags & Accessories',

  watches: 'Watches',

  eyewear: 'Eyewear',

  'jewellery-rings': 'Jewelry',
  'jewellery-necklaces': 'Jewelry',
  'jewellery-earrings': 'Jewelry',
  'jewellery-bracelets': 'Jewelry',

  'beauty-skincare': 'Beauty & Fragrance',
  'makeup-lipsticks': 'Beauty & Fragrance',
  fragrance: 'Beauty & Fragrance',

  'home-decor': 'Home',
  furniture: 'Home',

  'tech-devices': 'Tech',

  food: 'Food & Drink',
  beverages: 'Food & Drink',

  'supplements-wellness': 'Wellness',

  other: 'Other',
};

/** Human labels for category_collection slugs when shown as sub-family rows. */
export const SUB_FAMILY_LABEL_OVERRIDES: Record<string, string> = {
  'garments': 'Tops & Shirts',
  'hats-small': 'Hats',
  'wallets-cardholders': 'Cardholders',
  'bags-accessories': 'Bags',
  'beauty-skincare': 'Skincare',
  'makeup-lipsticks': 'Makeup',
  'jewellery-rings': 'Rings',
  'jewellery-bracelets': 'Bracelets',
  'jewellery-necklaces': 'Necklaces',
  'jewellery-earrings': 'Earrings',
  'high-heels': 'Heels',
  'home-decor': 'Decor',
  'tech-devices': 'Devices',
  'snacks-food': 'Snacks',
  'supplements-wellness': 'Wellness',
};

export function getSubFamilyLabel(slug: string): string {
  if (SUB_FAMILY_LABEL_OVERRIDES[slug]) return SUB_FAMILY_LABEL_OVERRIDES[slug];
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export const FAMILY_ORDER = [
  'Fashion', 'Footwear', 'Bags & Accessories', 'Watches', 'Eyewear', 'Jewelry',
  'Beauty & Fragrance', 'Home', 'Tech', 'Food & Drink', 'Wellness', 'Other',
] as const;

/** Map onboarding product_categories slugs → category_collection slugs for personalisation. */
export const ONBOARDING_TO_COLLECTIONS_MAP: Record<string, string[]> = {
  fashion: ['garments', 'dresses', 'hoodies', 'jeans', 'jackets', 'activewear', 'swimwear', 'lingerie', 'kidswear'],
  footwear: ['shoes', 'sneakers', 'boots', 'high-heels'],
  shoes: ['shoes', 'sneakers', 'boots', 'high-heels'],
  bags: ['bags-accessories', 'backpacks', 'wallets-cardholders'],
  accessories: ['bags-accessories', 'belts', 'scarves', 'hats-small'],
  jewelry: ['jewellery-rings', 'jewellery-necklaces', 'jewellery-earrings', 'jewellery-bracelets'],
  jewellery: ['jewellery-rings', 'jewellery-necklaces', 'jewellery-earrings', 'jewellery-bracelets'],
  watches: ['watches'],
  eyewear: ['eyewear'],
  beauty: ['beauty-skincare', 'makeup-lipsticks'],
  skincare: ['beauty-skincare'],
  makeup: ['makeup-lipsticks'],
  fragrance: ['fragrance'],
  home: ['home-decor', 'furniture'],
  furniture: ['furniture'],
  decor: ['home-decor'],
  tech: ['tech-devices'],
  electronics: ['tech-devices'],
  food: ['food'],
  beverages: ['beverages'],
  drinks: ['beverages'],
  wellness: ['supplements-wellness'],
  supplements: ['supplements-wellness'],
};

export function resolveUserCollections(productCategories: string[] | null | undefined): string[] {
  if (!productCategories?.length) return [];
  const set = new Set<string>();
  for (const cat of productCategories) {
    const key = cat.toLowerCase().trim();
    const slugs = ONBOARDING_TO_COLLECTIONS_MAP[key];
    if (slugs) slugs.forEach(s => set.add(s));
    else set.add(key); // pass-through if already a collection slug
  }
  return Array.from(set);
}

export const SUBJECT_LABEL: Record<SceneSubject, string> = {
  'product-only': 'Product Only',
  'with-model': 'With Model',
  'hands-only': 'Hands Only',
};

export const SHOT_STYLE_LABEL: Record<SceneShotStyle, string> = {
  packshot: 'Packshot',
  editorial: 'Editorial',
  lifestyle: 'Lifestyle',
  flatlay: 'Flat Lay',
  macro: 'Close-up',
  portrait: 'Portrait',
  'still-life': 'Still Life',
  campaign: 'Campaign',
};

export const SETTING_LABEL: Record<SceneSetting, string> = {
  studio: 'Studio',
  indoor: 'Indoor',
  outdoor: 'Outdoor',
  surface: 'Surface / Flat Lay',
  'editorial-set': 'Editorial Set',
};

/**
 * Strip Product Visuals template tokens like {{personDirective}} from a prompt template,
 * leaving clean prose suitable for the Freestyle prompt box.
 * Pure string operation — safe on any input.
 */
export function sanitizePromptTemplate(template: string | null | undefined): string {
  if (!template) return '';
  return template
    .replace(/\{\{[^}]+\}\}/g, '')
    .replace(/\[[A-Z_]+\]/g, '') // strip [PRODUCT_NAME]-style tags
    .replace(/\s+/g, ' ')
    .trim();
}

/** Namespace prefix for Product Visuals scene IDs in Freestyle. */
export const PIS_PREFIX = 'pis-';

export function isPisSceneId(id: string | null | undefined): boolean {
  return !!id && id.startsWith(PIS_PREFIX);
}

export function toPisSceneId(rawId: string): string {
  return PIS_PREFIX + rawId;
}

export function fromPisSceneId(prefixed: string): string {
  return prefixed.startsWith(PIS_PREFIX) ? prefixed.slice(PIS_PREFIX.length) : prefixed;
}
