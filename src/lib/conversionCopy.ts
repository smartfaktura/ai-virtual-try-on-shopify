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

/** Map raw product_categories / product_subcategories values to our conversion categories */
export function resolveConversionCategory(raw?: string[] | string | null): ConversionCategory {
  if (!raw) return 'fallback';
  const cats = (Array.isArray(raw) ? raw : [raw])
    .map(c => (c ?? '').toLowerCase())
    .filter(c => c && c !== 'any');
  // Scan ALL provided slugs (family + sub-type) so we can route on the most specific signal
  for (const c of cats) {
    if (c.includes('fragrance') || c.includes('perfume')) return 'fragrances';
    if (c.includes('beauty') || c.includes('skincare') || c.includes('cosmetic') || c.includes('makeup') || c === 'beauty-skincare' || c === 'makeup-lipsticks') return 'beauty';
    if (c.includes('jewel') || c.includes('watch')) return 'jewelry';
    if (c.includes('electronic') || c === 'tech' || c === 'tech-devices' || c.includes('gadget') || c.includes('device')) return 'electronics';
    if (c.includes('food') || c.includes('beverage') || c.includes('drink') || c === 'snacks-food') return 'food';
    if (c.includes('home') || c.includes('decor') || c.includes('furniture')) return 'home';
    if (c.includes('fashion') || c.includes('apparel') || c.includes('garment') || c.includes('clothing') || c === 'hoodies' || c === 'dresses' || c === 'jeans' || c === 'jackets' || c === 'activewear' || c === 'swimwear' || c === 'lingerie' || c === 'kidswear' || c === 'streetwear') return 'fashion';
    if (c === 'footwear' || c === 'shoes' || c === 'sneakers' || c === 'boots' || c === 'high-heels') return 'fashion';
    if (c.includes('accessor') || c.includes('bag') || c.includes('hat') || c.includes('scarf') || c === 'bags-accessories' || c === 'backpacks' || c === 'wallets-cardholders' || c === 'belts' || c === 'eyewear') return 'accessories';
  }
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
  avatarKey: string;
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
  accessories: 'accessory',
  fallback: 'visual',
};

const LAYER1_COPY: Record<ConversionCategory, Layer1Copy> = {
  fashion: {
    headline: 'Your first fashion direction is ready',
    subline: 'Keep creating with more credits, better value, and faster runs.',
    valueBlocks: [
      { icon: 'layers', title: 'More Looks', detail: 'Monthly credits to keep creating fashion looks' },
      { icon: 'trending-up', title: 'Better Value', detail: 'Higher plans improve your cost per visual' },
      { icon: 'zap', title: 'Faster Launches', detail: 'Priority processing and bulk generation' },
    ],
  },
  beauty: {
    headline: 'Your first beauty visual is ready',
    subline: 'Create more skincare content with stronger value and faster production.',
    valueBlocks: [
      { icon: 'layers', title: 'More Placements', detail: 'Monthly credits for more beauty content' },
      { icon: 'trending-up', title: 'Better Value', detail: 'Higher plans improve your cost per visual' },
      { icon: 'zap', title: 'Faster Campaigns', detail: 'Priority processing and bulk generation' },
    ],
  },
  jewelry: {
    headline: 'Your first jewelry visual is ready',
    subline: 'Scale into more angles, more assets, and better production value.',
    valueBlocks: [
      { icon: 'layers', title: 'More Angles', detail: 'Monthly credits for more jewelry shots' },
      { icon: 'trending-up', title: 'Better Value', detail: 'Higher plans improve your cost per visual' },
      { icon: 'zap', title: 'Faster Output', detail: 'Priority processing and bulk generation' },
    ],
  },
  fragrances: {
    headline: 'Your first fragrance visual is ready',
    subline: 'Create more concepts with better value and faster campaign production.',
    valueBlocks: [
      { icon: 'layers', title: 'More Concepts', detail: 'Monthly credits for fragrance visuals' },
      { icon: 'trending-up', title: 'Better Value', detail: 'Higher plans improve your cost per visual' },
      { icon: 'zap', title: 'Faster Campaigns', detail: 'Priority processing and bulk generation' },
    ],
  },
  food: {
    headline: 'Your first food visual is ready',
    subline: 'Create more content for menus, ads, and social with better efficiency.',
    valueBlocks: [
      { icon: 'layers', title: 'More Content', detail: 'Monthly credits for food & beverage visuals' },
      { icon: 'trending-up', title: 'Better Value', detail: 'Higher plans improve your cost per visual' },
      { icon: 'zap', title: 'Faster Refreshes', detail: 'Priority processing and bulk generation' },
    ],
  },
  electronics: {
    headline: 'Your first product visual is ready',
    subline: 'Create more launch-ready assets with better value and faster runs.',
    valueBlocks: [
      { icon: 'layers', title: 'More Assets', detail: 'Monthly credits for product visuals' },
      { icon: 'trending-up', title: 'Better Value', detail: 'Higher plans improve your cost per visual' },
      { icon: 'zap', title: 'Faster Launches', detail: 'Priority processing and bulk generation' },
    ],
  },
  home: {
    headline: 'Your first home visual is ready',
    subline: 'Create more room and catalog content with better value and speed.',
    valueBlocks: [
      { icon: 'layers', title: 'More Scenes', detail: 'Monthly credits for home & decor visuals' },
      { icon: 'trending-up', title: 'Better Value', detail: 'Higher plans improve your cost per visual' },
      { icon: 'zap', title: 'Faster Refreshes', detail: 'Priority processing and bulk generation' },
    ],
  },
  accessories: {
    headline: 'Your first accessory visual is ready',
    subline: 'Create more variations with better value and faster brand production.',
    valueBlocks: [
      { icon: 'layers', title: 'More Variations', detail: 'Monthly credits for accessory visuals' },
      { icon: 'trending-up', title: 'Better Value', detail: 'Higher plans improve your cost per visual' },
      { icon: 'zap', title: 'Faster Output', detail: 'Priority processing and bulk generation' },
    ],
  },
  fallback: {
    headline: 'Your first visual is ready',
    subline: 'Keep creating with more credits, better value, and faster runs.',
    valueBlocks: [
      { icon: 'layers', title: 'More Content', detail: 'Monthly credits to keep creating visuals' },
      { icon: 'trending-up', title: 'Better Value', detail: 'Higher plans improve your cost per visual' },
      { icon: 'zap', title: 'Faster Runs', detail: 'Priority processing and bulk generation' },
    ],
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
      return 'Paid plans support faster, larger creation runs';
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
  unlockHeadline: string;
  unlockSubline: string;
  unlockItems: string[];
}

const LAYER2_COPY: Record<ConversionCategory, Layer2Copy> = {
  fashion: {
    headline: 'Your fashion visuals, unlimited',
    subline: 'Go from one direction to a full campaign-ready collection',
    unlockHeadline: 'Select from 1,000+ personalized editorial shots',
    unlockSubline: 'Plus monthly campaign drops for your social and marketing',
    unlockItems: ['Studio', 'On-Model', 'Lifestyle', 'Campaign', 'Detail', 'Video'],
  },
  beauty: {
    headline: 'Your beauty content, unlimited',
    subline: 'Cover every channel — studio to lifestyle and beyond',
    unlockHeadline: 'Select from 1,000+ personalized editorial shots',
    unlockSubline: 'Plus monthly campaign drops for your social and marketing',
    unlockItems: ['Studio', 'Close-up', 'Lifestyle', 'Flat Lay', 'Campaign', 'Video'],
  },
  jewelry: {
    headline: 'Your jewelry catalog, unlimited',
    subline: 'Every angle, detail, and setting — no limits',
    unlockHeadline: 'Select from 1,000+ personalized editorial shots',
    unlockSubline: 'Plus monthly campaign drops for your social and marketing',
    unlockItems: ['Macro', 'Editorial', 'Lifestyle', 'Gifting', 'PDP', 'Video'],
  },
  fragrances: {
    headline: 'Your fragrance visuals, unlimited',
    subline: 'Conceptual to editorial — every direction covered',
    unlockHeadline: 'Select from 1,000+ personalized editorial shots',
    unlockSubline: 'Plus monthly campaign drops for your social and marketing',
    unlockItems: ['Studio', 'Editorial', 'Lifestyle', 'Campaign', 'Detail', 'Video'],
  },
  food: {
    headline: 'Your food visuals, unlimited',
    subline: 'Packshots to styled scenes — cover every listing',
    unlockHeadline: 'Select from 1,000+ personalized editorial shots',
    unlockSubline: 'Plus monthly campaign drops for your social and marketing',
    unlockItems: ['Packshot', 'Styled Scene', 'Close-up', 'Social', 'Menu/Ad', 'Video'],
  },
  electronics: {
    headline: 'Your product visuals, unlimited',
    subline: 'Feature shots to lifestyle — all in one place',
    unlockHeadline: 'Select from 1,000+ personalized editorial shots',
    unlockSubline: 'Plus monthly campaign drops for your social and marketing',
    unlockItems: ['Desk Setup', 'Close-up', 'Feature', 'PDP', 'Launch', 'Video'],
  },
  home: {
    headline: 'Your home visuals, unlimited',
    subline: 'Room scenes to catalogs — every surface styled',
    unlockHeadline: 'Select from 1,000+ personalized editorial shots',
    unlockSubline: 'Plus monthly campaign drops for your social and marketing',
    unlockItems: ['Room Scene', 'Styled Surface', 'Catalog', 'Campaign', 'Social', 'Video'],
  },
  accessories: {
    headline: 'Your accessories content, unlimited',
    subline: 'Studio to lifestyle — every angle and context',
    unlockHeadline: 'Select from 1,000+ personalized editorial shots',
    unlockSubline: 'Plus monthly campaign drops for your social and marketing',
    unlockItems: ['Studio', 'Worn', 'Lifestyle', 'Close-up', 'PDP', 'Video'],
  },
  fallback: {
    headline: 'Your visual production, unlimited',
    subline: 'Create the complete set your brand needs',
    unlockHeadline: 'Select from 1,000+ personalized editorial shots',
    unlockSubline: 'Plus monthly campaign drops for your social and marketing',
    unlockItems: ['Studio', 'Lifestyle', 'Social', 'Campaign', 'Product Page', 'Video'],
  },
};

export function getLayer2Copy(category: ConversionCategory): Layer2Copy {
  return LAYER2_COPY[category];
}

// ── Layer 3: Enhanced no-credits copy ─────────────────────────────

const LAYER3_HEADLINES: Record<ConversionCategory, string> = {
  fashion: 'Build your full fashion visual set',
  beauty: 'Build your full beauty content set',
  jewelry: 'Build your full jewelry visual set',
  fragrances: 'Build your full fragrance visual set',
  food: 'Build your full food content set',
  electronics: 'Build your full electronics visual set',
  home: 'Build your full home visual set',
  accessories: 'Build your full accessory visual set',
  fallback: 'Build your full visual set',
};

export function getLayer3Headline(category: ConversionCategory): string {
  return LAYER3_HEADLINES[category];
}

export function getLayer3Subline(_generationCount?: number): string {
  return 'Brands like yours typically need 100+ visuals per month';
}
