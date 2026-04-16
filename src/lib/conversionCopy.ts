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

// ── Layer 1: Category → Avatar mapping ────────────────────────────

export interface Layer1Avatar {
  name: string;
  role: string;
  avatarKey: string; // e.g. 'sophia' — resolved to URL in component
}

const AVATAR_MAP: Record<ConversionCategory, Layer1Avatar> = {
  fashion:     { name: 'Sophia', role: 'E-commerce Photographer', avatarKey: 'sophia' },
  beauty:      { name: 'Luna', role: 'Retouch Specialist', avatarKey: 'luna' },
  jewelry:     { name: 'Sophia', role: 'Studio Lighting Expert', avatarKey: 'sophia' },
  fragrances:  { name: 'Amara', role: 'Lifestyle Photographer', avatarKey: 'amara' },
  food:        { name: 'Amara', role: 'Scene Specialist', avatarKey: 'amara' },
  electronics: { name: 'Kenji', role: 'Tech Product Specialist', avatarKey: 'kenji' },
  home:        { name: 'Amara', role: 'Lifestyle Photographer', avatarKey: 'amara' },
  accessories: { name: 'Sophia', role: 'E-commerce Photographer', avatarKey: 'sophia' },
  fallback:    { name: 'Sophia', role: 'Studio Lead', avatarKey: 'sophia' },
};

export function getLayer1Avatar(category: ConversionCategory): Layer1Avatar {
  return AVATAR_MAP[category];
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
    headline: 'Nice — your first fashion visual is ready',
    subline: 'Keep creating with more credits and stronger tools',
    valueBlocks: makeValueBlocks('fashion'),
  },
  beauty: {
    headline: 'Nice — your first beauty visual is ready',
    subline: 'Keep creating with more credits and stronger tools',
    valueBlocks: makeValueBlocks('beauty'),
  },
  jewelry: {
    headline: 'Nice — your first jewelry shot is ready',
    subline: 'Keep creating with more credits and stronger tools',
    valueBlocks: makeValueBlocks('jewelry'),
  },
  fragrances: {
    headline: 'Nice — your first fragrance visual is ready',
    subline: 'Keep creating with more credits and stronger tools',
    valueBlocks: makeValueBlocks('fragrance'),
  },
  food: {
    headline: 'Nice — your first food shot is ready',
    subline: 'Keep creating with more credits and stronger tools',
    valueBlocks: makeValueBlocks('food'),
  },
  electronics: {
    headline: 'Nice — your first product visual is ready',
    subline: 'Keep creating with more credits and stronger tools',
    valueBlocks: makeValueBlocks('product'),
  },
  home: {
    headline: 'Nice — your first home visual is ready',
    subline: 'Keep creating with more credits and stronger tools',
    valueBlocks: makeValueBlocks('home'),
  },
  accessories: {
    headline: 'Nice — your first accessories shot is ready',
    subline: 'Keep creating with more credits and stronger tools',
    valueBlocks: makeValueBlocks('accessories'),
  },
  fallback: {
    headline: 'Nice — your first visual is ready',
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

export interface Layer2Copy {
  headline: string;
  subline: string;
  unlockItems: string[];
}

const LAYER2_COPY: Record<ConversionCategory, Layer2Copy> = {
  fashion: {
    headline: 'Scale your fashion visual library',
    subline: 'From 1 direction to a full campaign-ready collection',
    unlockItems: ['Studio', 'On-Model', 'Lifestyle', 'Campaign', 'Detail', 'Video'],
  },
  beauty: {
    headline: 'Build your complete beauty content set',
    subline: 'Studio to lifestyle — cover every channel',
    unlockItems: ['Studio', 'Close-up', 'Lifestyle', 'Flat Lay', 'Campaign', 'Video'],
  },
  jewelry: {
    headline: 'Complete your jewelry visual catalog',
    subline: 'Every angle, detail, and setting your listings need',
    unlockItems: ['Macro', 'Editorial', 'Lifestyle', 'Gifting', 'PDP', 'Video'],
  },
  fragrances: {
    headline: 'Build your fragrance campaign library',
    subline: 'Conceptual to editorial — every direction covered',
    unlockItems: ['Studio', 'Editorial', 'Lifestyle', 'Campaign', 'Detail', 'Video'],
  },
  food: {
    headline: 'Scale your food & beverage visuals',
    subline: 'Packshots to styled scenes — cover every listing',
    unlockItems: ['Packshot', 'Styled Scene', 'Close-up', 'Social', 'Menu/Ad', 'Video'],
  },
  electronics: {
    headline: 'Build your full product visual library',
    subline: 'Feature shots to lifestyle — cover every listing',
    unlockItems: ['Desk Setup', 'Close-up', 'Feature', 'PDP', 'Launch', 'Video'],
  },
  home: {
    headline: 'Complete your home & decor visual set',
    subline: 'Room scenes to catalogs — every surface styled',
    unlockItems: ['Room Scene', 'Styled Surface', 'Catalog', 'Campaign', 'Social', 'Video'],
  },
  accessories: {
    headline: 'Scale your accessories content library',
    subline: 'Studio to lifestyle — every angle and context',
    unlockItems: ['Studio', 'Worn', 'Lifestyle', 'Close-up', 'PDP', 'Video'],
  },
  fallback: {
    headline: 'Scale your visual production',
    subline: 'Create the complete set your brand needs',
    unlockItems: ['Studio', 'Lifestyle', 'Social', 'Campaign', 'Product Page', 'Video'],
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
