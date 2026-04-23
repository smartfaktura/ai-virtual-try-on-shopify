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
  'snacks-food': 'Food & Drink',

  'supplements-wellness': 'Wellness',
};

/** Human labels for category_collection slugs when shown as sub-family rows. */
export const SUB_FAMILY_LABEL_OVERRIDES: Record<string, string> = {
  'garments': 'Clothing & Apparel',
  'activewear': 'Activewear & Sportswear',
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
  'Beauty & Fragrance', 'Home', 'Tech', 'Food & Drink', 'Wellness',
] as const;

/** Map onboarding product_categories slugs → category_collection slugs for personalisation. */
export const ONBOARDING_TO_COLLECTIONS_MAP: Record<string, string[]> = {
  fashion: ['garments', 'dresses', 'hoodies', 'jeans', 'jackets', 'activewear', 'swimwear', 'lingerie', 'kidswear', 'streetwear'],
  footwear: ['shoes', 'sneakers', 'boots', 'high-heels'],
  shoes: ['shoes', 'sneakers', 'boots', 'high-heels'],
  bags: ['bags-accessories', 'backpacks', 'wallets-cardholders'],
  accessories: ['bags-accessories', 'belts', 'scarves', 'hats-small'],
  'bags-accessories': ['bags-accessories', 'backpacks', 'wallets-cardholders', 'belts', 'scarves', 'hats-small'],
  jewelry: ['jewellery-rings', 'jewellery-necklaces', 'jewellery-earrings', 'jewellery-bracelets'],
  jewellery: ['jewellery-rings', 'jewellery-necklaces', 'jewellery-earrings', 'jewellery-bracelets'],
  watches: ['watches'],
  eyewear: ['eyewear'],
  beauty: ['beauty-skincare', 'makeup-lipsticks'],
  'beauty-fragrance': ['beauty-skincare', 'makeup-lipsticks', 'fragrance'],
  skincare: ['beauty-skincare'],
  makeup: ['makeup-lipsticks'],
  fragrance: ['fragrance'],
  home: ['home-decor', 'furniture'],
  furniture: ['furniture'],
  decor: ['home-decor'],
  tech: ['tech-devices'],
  electronics: ['tech-devices'],
  food: ['food'],
  'food-drink': ['food', 'beverages', 'snacks-food'],
  beverages: ['beverages'],
  drinks: ['beverages'],
  wellness: ['supplements-wellness'],
  supplements: ['supplements-wellness'],
};

export function resolveUserCollections(
  productCategories: string[] | null | undefined,
  productSubcategories?: string[] | null,
): string[] {
  // If the user picked granular sub-types in Step 3, those ARE collection slugs.
  // Use them directly so recommendations narrow to the precise types.
  if (productSubcategories?.length) {
    return Array.from(new Set(productSubcategories.map(s => s.toLowerCase().trim()).filter(Boolean)));
  }
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

/**
 * Round-robin interleave of scenes across product families.
 *
 * Groups by `category_collection` → family (via CATEGORY_FAMILY_MAP), then pulls
 * `chunkSize` items from each family queue in FAMILY_ORDER, repeating until all
 * queues are drained. Items without a recognised family are appended at the end
 * in their original order (stable for unknown collections).
 *
 * Pure & deterministic — safe for both UI render and recommendation fallback.
 */
export function interleaveByFamily<
  T extends { category_collection?: string | null },
>(items: T[], chunkSize = 2): T[] {
  if (!items.length || chunkSize < 1) return items.slice();

  const queues = new Map<string, T[]>();
  const tail: T[] = [];

  for (const item of items) {
    const slug = item.category_collection ?? null;
    const fam = slug ? CATEGORY_FAMILY_MAP[slug] : undefined;
    if (!fam) {
      tail.push(item);
      continue;
    }
    if (!queues.has(fam)) queues.set(fam, []);
    queues.get(fam)!.push(item);
  }

  // Order queues: known FAMILY_ORDER first, then any extras alphabetically.
  const orderedFamilies = [
    ...FAMILY_ORDER.filter(f => queues.has(f)),
    ...Array.from(queues.keys())
      .filter(f => !FAMILY_ORDER.includes(f as any))
      .sort(),
  ];

  const result: T[] = [];
  let drained = false;
  while (!drained) {
    drained = true;
    for (const fam of orderedFamilies) {
      const q = queues.get(fam);
      if (!q || q.length === 0) continue;
      const taken = q.splice(0, chunkSize);
      result.push(...taken);
      if (q.length > 0) drained = false;
    }
  }

  result.push(...tail);
  return result;
}

/**
 * Round-robin items by sub-family (`category_collection`) only.
 *
 * Used when a single family is filtered, so consecutive cards rotate across
 * sub-families (e.g. garments → dresses → jeans → jackets) instead of
 * clustering all of one sub-family together.
 *
 * Pure & deterministic. Items without a `category_collection` are appended last.
 */
export function interleaveBySubFamily<
  T extends { category_collection?: string | null },
>(items: T[]): T[] {
  if (!items.length) return items.slice();

  const queues = new Map<string, T[]>();
  const order: string[] = [];
  const tail: T[] = [];

  for (const item of items) {
    const slug = item.category_collection ?? null;
    if (!slug) {
      tail.push(item);
      continue;
    }
    if (!queues.has(slug)) {
      queues.set(slug, []);
      order.push(slug);
    }
    queues.get(slug)!.push(item);
  }

  const result: T[] = [];
  let drained = false;
  while (!drained) {
    drained = true;
    for (const slug of order) {
      const q = queues.get(slug);
      if (!q || q.length === 0) continue;
      result.push(q.shift()!);
      if (q.length > 0) drained = false;
    }
  }

  result.push(...tail);
  return result;
}

/**
 * Two-level interleave: for each family, round-robin across its sub-families
 * (one item per sub-family per pass), then round-robin across families
 * `familyChunk` items at a time in `FAMILY_ORDER`.
 *
 * Result for a typical catalog with `familyChunk=2, subFamilyChunk=1`:
 *   [Fashion-garments, Fashion-dresses, Bags-backpacks, Bags-belts,
 *    Beauty-skincare, Beauty-makeup, ...] then continues round-robin.
 *
 * Pure & deterministic. Items with unknown collections are appended at the end.
 */
export function interleaveByFamilyAndSubFamily<
  T extends { category_collection?: string | null },
>(
  items: T[],
  options: { familyChunk?: number; subFamilyChunk?: number } = {},
): T[] {
  const familyChunk = options.familyChunk ?? 2;
  const subFamilyChunk = options.subFamilyChunk ?? 1;
  if (!items.length) return items.slice();

  // Group by family → sub-family → items (preserve incoming order within sub-family)
  const familyToSubMap = new Map<string, Map<string, T[]>>();
  const tail: T[] = [];

  for (const item of items) {
    const slug = item.category_collection ?? null;
    const fam = slug ? CATEGORY_FAMILY_MAP[slug] : undefined;
    if (!fam || !slug) {
      tail.push(item);
      continue;
    }
    if (!familyToSubMap.has(fam)) familyToSubMap.set(fam, new Map());
    const subMap = familyToSubMap.get(fam)!;
    if (!subMap.has(slug)) subMap.set(slug, []);
    subMap.get(slug)!.push(item);
  }

  // For each family, build its sub-family-interleaved queue
  const familyQueues = new Map<string, T[]>();
  for (const [fam, subMap] of familyToSubMap.entries()) {
    const subSlugs = Array.from(subMap.keys());
    const interleaved: T[] = [];
    let drained = false;
    while (!drained) {
      drained = true;
      for (const slug of subSlugs) {
        const q = subMap.get(slug)!;
        if (q.length === 0) continue;
        const taken = q.splice(0, subFamilyChunk);
        interleaved.push(...taken);
        if (q.length > 0) drained = false;
      }
    }
    familyQueues.set(fam, interleaved);
  }

  // Family ordering: known FAMILY_ORDER first, then any extras alphabetically.
  const orderedFamilies = [
    ...FAMILY_ORDER.filter(f => familyQueues.has(f)),
    ...Array.from(familyQueues.keys())
      .filter(f => !FAMILY_ORDER.includes(f as any))
      .sort(),
  ];

  const result: T[] = [];
  let drained = false;
  while (!drained) {
    drained = true;
    for (const fam of orderedFamilies) {
      const q = familyQueues.get(fam);
      if (!q || q.length === 0) continue;
      const taken = q.splice(0, familyChunk);
      result.push(...taken);
      if (q.length > 0) drained = false;
    }
  }

  result.push(...tail);
  return result;
}
