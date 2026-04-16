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

// ── Layer 1: Success + Scale card copy ────────────────────────────

export interface Layer1ValueBlock {
  /** Lucide icon name — resolved to component in the card */
  icon: 'layers' | 'trending-up' | 'zap';
  title: string;
  detail: string;
}

export interface Layer1Copy {
  headline: string;
  subline: string;
  valueBlocks: Layer1ValueBlock[];
}

export type BehaviorHint =
  | 'low-credits'
  | 'repeated-product'
  | 'model-heavy'
  | 'export-intent'
  | 'video-usage'
  | 'general';

const CATEGORY_LABELS: Record<ConversionCategory, string> = {
  fashion: 'fashion',
  beauty: 'beauty',
  jewelry: 'jewelry',
  fragrances: 'fragrance',
  food: 'food',
  electronics: 'product',
  home: 'home',
  accessories: 'accessories',
  fallback: 'visual',
};

function makeValueBlocks(categoryLabel: string): Layer1ValueBlock[] {
  return [
    {
      icon: 'layers',
      title: 'Create More',
      detail: `Monthly credits to keep creating ${categoryLabel} visuals`,
    },
    {
      icon: 'trending-up',
      title: 'Better Value',
      detail: 'Higher plans improve your cost per visual',
    },
    {
      icon: 'zap',
      title: 'Faster Workflow',
      detail: 'Priority processing and bulk generation',
    },
  ];
}

const LAYER1_COPY: Record<ConversionCategory, Layer1Copy> = {
  fashion: {
    headline: 'First fashion direction — complete',
    subline: 'Keep creating with more credits and stronger tools',
    valueBlocks: makeValueBlocks('fashion'),
  },
  beauty: {
    headline: 'First beauty visual — complete',
    subline: 'Keep creating with more credits and stronger tools',
    valueBlocks: makeValueBlocks('beauty'),
  },
  jewelry: {
    headline: 'First jewelry shot — complete',
    subline: 'Keep creating with more credits and stronger tools',
    valueBlocks: makeValueBlocks('jewelry'),
  },
  fragrances: {
    headline: 'First fragrance visual — complete',
    subline: 'Keep creating with more credits and stronger tools',
    valueBlocks: makeValueBlocks('fragrance'),
  },
  food: {
    headline: 'First food shot — complete',
    subline: 'Keep creating with more credits and stronger tools',
    valueBlocks: makeValueBlocks('food'),
  },
  electronics: {
    headline: 'First product visual — complete',
    subline: 'Keep creating with more credits and stronger tools',
    valueBlocks: makeValueBlocks('product'),
  },
  home: {
    headline: 'First home visual — complete',
    subline: 'Keep creating with more credits and stronger tools',
    valueBlocks: makeValueBlocks('home'),
  },
  accessories: {
    headline: 'First accessories shot — complete',
    subline: 'Keep creating with more credits and stronger tools',
    valueBlocks: makeValueBlocks('accessories'),
  },
  fallback: {
    headline: 'First visual direction — complete',
    subline: 'Keep creating with more credits and stronger tools',
    valueBlocks: makeValueBlocks('visual'),
  },
};

export function getLayer1Copy(category: ConversionCategory): Layer1Copy {
  return LAYER1_COPY[category];
}

/** Behavior-aware subline override */
export function getLayer1Subline(category: ConversionCategory, hint?: BehaviorHint): string {
  const label = CATEGORY_LABELS[category];
  switch (hint) {
    case 'low-credits':
      return 'You\'re running low — paid plans include monthly credits';
    case 'repeated-product':
      return `Scale your ${label} catalog with monthly credits`;
    case 'model-heavy':
      return 'Paid plans support faster, larger creation workflows';
    case 'export-intent':
      return 'Unlock batch export and bulk generation with a plan';
    case 'video-usage':
      return 'Create video content faster with a paid plan';
    default:
      return LAYER1_COPY[category].subline;
  }
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
  return `Your ${CATEGORY_LABELS[category]} visuals are just getting started`;
}

export function getLayer3Subline(generationCount: number): string {
  if (generationCount <= 1) {
    return 'You\'ve created your first image. Brands at your stage typically need 50\u2013100+ per month.';
  }
  return `You've created ${generationCount} images so far. Brands at your stage typically need 50\u2013100+ per month.`;
}
