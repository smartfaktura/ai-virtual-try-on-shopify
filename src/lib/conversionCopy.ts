// ── Conversion copy maps — single source of truth for all upgrade messaging ──

export type ConversionCategory =
  | 'fashion'
  | 'beauty'
  | 'jewelry'
  | 'fragrances'
  | 'food'
  | 'electronics'
  | 'home'
  | 'accessories'
  | 'fallback';

/** Map raw product_categories values to our conversion categories */
export function resolveConversionCategory(raw?: string[] | string | null): ConversionCategory {
  if (!raw) return 'fallback';
  const cats = Array.isArray(raw) ? raw : [raw];
  const first = cats.find(c => c !== 'any')?.toLowerCase() ?? '';

  if (first.includes('fashion') || first.includes('apparel') || first.includes('garment') || first.includes('clothing')) return 'fashion';
  if (first.includes('beauty') || first.includes('skincare') || first.includes('cosmetic')) return 'beauty';
  if (first.includes('jewel') || first.includes('watch')) return 'jewelry';
  if (first.includes('fragrance') || first.includes('perfume')) return 'fragrances';
  if (first.includes('food') || first.includes('beverage') || first.includes('drink')) return 'food';
  if (first.includes('electronic') || first.includes('tech') || first.includes('gadget')) return 'electronics';
  if (first.includes('home') || first.includes('decor') || first.includes('furniture')) return 'home';
  if (first.includes('accessor') || first.includes('bag') || first.includes('hat') || first.includes('scarf')) return 'accessories';
  return 'fallback';
}

// ── Layer 1: Inline card copy ─────────────────────────────────────

interface Layer1Copy {
  headline: string;
  subline: string;
  chips: string[];
}

const LAYER1_COPY: Record<ConversionCategory, Layer1Copy> = {
  fashion: {
    headline: 'You just created your first fashion direction',
    subline: 'This is 1 of the 8–12 looks brands typically need per product',
    chips: ['More Scenes', 'More Models', 'Batch Export', 'Video'],
  },
  beauty: {
    headline: 'You just created your first beauty visual',
    subline: 'Skincare brands run 6+ scene variations per SKU for social, ads, and e-commerce',
    chips: ['More Scenes', 'Close-ups & Detail', 'Batch Export', 'Video'],
  },
  jewelry: {
    headline: 'You just created your first jewelry shot',
    subline: 'Jewelry brands need 8+ angles and lighting setups per piece',
    chips: ['More Angles', 'Detail Shots', 'Batch Export', 'Studio Lighting'],
  },
  fragrances: {
    headline: 'You just created your first fragrance visual',
    subline: 'Fragrance campaigns need 6+ conceptual directions per bottle',
    chips: ['More Scenes', 'Close-ups & Detail', 'Batch Export', 'Video'],
  },
  food: {
    headline: 'You just created your first food shot',
    subline: 'Food brands typically shoot 6–10 styled scenes per product',
    chips: ['More Scenes', 'Styled Settings', 'Batch Export', 'Seasonal Sets'],
  },
  electronics: {
    headline: 'You just created your first product visual',
    subline: 'Tech brands need 5+ lifestyle and detail shots per device',
    chips: ['More Angles', 'Lifestyle Context', 'Batch Export', 'Feature Shots'],
  },
  home: {
    headline: 'You just created your first home visual',
    subline: 'Home brands showcase products in 4–8 styled room settings',
    chips: ['More Scenes', 'Styled Settings', 'Batch Export', 'Seasonal Sets'],
  },
  accessories: {
    headline: 'You just created your first accessories shot',
    subline: 'Accessory brands need 6+ styled and lifestyle shots per piece',
    chips: ['More Scenes', 'More Models', 'Batch Export', 'Video'],
  },
  fallback: {
    headline: 'You just created your first visual direction',
    subline: 'Professional brands create full visual sets — not single shots',
    chips: ['More Scenes', 'More Looks', 'Batch Export', 'Video'],
  },
};

export function getLayer1Copy(category: ConversionCategory): Layer1Copy {
  return LAYER1_COPY[category];
}

// ── Layer 2: Value drawer copy ────────────────────────────────────

interface Layer2Copy {
  outcomes: string[];
}

const LAYER2_COPY: Record<ConversionCategory, Layer2Copy> = {
  fashion: {
    outcomes: [
      '8–12 campaign directions',
      'Multiple models for diversity',
      'Full scene coverage — studio to street',
      'Batch export for social & ads',
      'Video lookbook from same product',
    ],
  },
  beauty: {
    outcomes: [
      '6+ scene variations per SKU',
      'Close-up and texture details',
      'Lifestyle and studio coverage',
      'Batch-ready for all channels',
      'Video content for social',
    ],
  },
  jewelry: {
    outcomes: [
      '8+ angles and lighting setups',
      'Macro detail and texture shots',
      'Editorial and e-commerce coverage',
      'Batch export for marketplace listings',
      '360° product video',
    ],
  },
  fragrances: {
    outcomes: [
      '6+ conceptual directions per bottle',
      'Close-up fragrance details',
      'Lifestyle and editorial coverage',
      'Campaign-ready batch exports',
      'Video content for social',
    ],
  },
  food: {
    outcomes: [
      '6–10 styled food scenes per product',
      'Multiple angles and compositions',
      'Seasonal and thematic sets',
      'Batch export for menus & delivery apps',
      'Video content for social',
    ],
  },
  electronics: {
    outcomes: [
      '5+ lifestyle and feature shots',
      'Multiple angles and contexts',
      'Detail and specification shots',
      'Batch export for marketplace listings',
      'Video demos from product images',
    ],
  },
  home: {
    outcomes: [
      '4–8 styled room settings',
      'Multiple angles and compositions',
      'Seasonal and thematic coverage',
      'Batch export for e-commerce',
      'Video room tours from stills',
    ],
  },
  accessories: {
    outcomes: [
      '6+ styled and lifestyle shots',
      'Multiple models for diversity',
      'Studio and editorial coverage',
      'Batch export for all channels',
      'Video lookbook from same product',
    ],
  },
  fallback: {
    outcomes: [
      'Full visual set across scenes and models',
      'Multiple directions per product',
      'Campaign-ready batch exports',
      'Video content from existing shots',
      'Consistent brand visuals',
    ],
  },
};

export function getLayer2Copy(category: ConversionCategory): Layer2Copy {
  return LAYER2_COPY[category];
}

// ── Layer 3: Enhanced no-credits copy ─────────────────────────────

export function getLayer3Headline(category: ConversionCategory): string {
  if (category === 'fallback') return 'Your visuals are just getting started';
  const labels: Record<ConversionCategory, string> = {
    fashion: 'fashion',
    beauty: 'beauty',
    jewelry: 'jewelry',
    fragrances: 'fragrance',
    food: 'food',
    electronics: 'product',
    home: 'home',
    accessories: 'accessories',
    fallback: '',
  };
  return `Your ${labels[category]} visuals are just getting started`;
}

export function getLayer3Subline(generationCount: number): string {
  if (generationCount <= 1) {
    return 'You\'ve created your first image. Brands at your stage typically need 50\u2013100+ per month.';
  }
  return `You've created ${generationCount} images so far. Brands at your stage typically need 50\u2013100+ per month.`;
}
