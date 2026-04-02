// ── Seedream-First Catalog Engine ──
// All hidden intelligence: category detection, hero slots, support wardrobe,
// shot compatibility, prompt assembly, render path routing.

import type {
  ProductCategory, HeroSlot, FashionStyleId, CatalogShotId,
  RenderPath, ShotDefinition, FashionStyleDefinition,
  BackgroundDefinition, SupportWardrobe, ModelAudienceType,
  CatalogSessionLock, ProductLookLock, ShotGroup,
} from '@/types/catalog';

// ────────────────────────────────────────────────
// 1. Category Detection
// ────────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<ProductCategory, string[]> = {
  top: ['top', 'shirt', 'blouse', 'tee', 't-shirt', 'tank', 'crop', 'polo', 'henley', 'sweater', 'hoodie', 'sweatshirt', 'cardigan', 'pullover', 'jersey', 'camisole', 'vest', 'bodysuit'],
  trousers: ['trouser', 'pants', 'pant', 'jean', 'jeans', 'chino', 'cargo', 'jogger', 'slacks', 'legging'],
  skirt: ['skirt', 'mini skirt', 'maxi skirt', 'midi skirt'],
  shorts: ['short', 'shorts', 'bermuda'],
  dress: ['dress', 'gown', 'maxi', 'midi dress', 'mini dress', 'sundress'],
  jumpsuit: ['jumpsuit', 'romper', 'playsuit', 'overalls', 'dungaree'],
  jacket_coat: ['jacket', 'coat', 'blazer', 'parka', 'puffer', 'trench', 'windbreaker', 'bomber', 'anorak', 'outerwear'],
  shoes: ['shoe', 'shoes', 'sneaker', 'boot', 'sandal', 'heel', 'loafer', 'slipper', 'mule', 'clog', 'trainer', 'oxford', 'derby', 'pump', 'flat', 'espadrille', 'flip flop'],
  bag: ['bag', 'handbag', 'purse', 'tote', 'clutch', 'backpack', 'crossbody', 'satchel', 'duffle', 'messenger', 'wallet', 'pouch', 'fanny pack'],
  hat: ['hat', 'cap', 'beanie', 'beret', 'fedora', 'bucket hat', 'visor', 'headband'],
  sunglasses: ['sunglasses', 'sunglass', 'eyewear', 'shades', 'glasses'],
  scarf: ['scarf', 'shawl', 'wrap', 'stole', 'bandana', 'neckerchief'],
  belt: ['belt', 'waist belt', 'chain belt'],
  jewelry: ['jewelry', 'jewellery', 'necklace', 'bracelet', 'ring', 'earring', 'pendant', 'anklet', 'brooch', 'cufflink', 'bangle', 'chain'],
  accessory: ['accessory', 'gloves', 'tie', 'bow tie', 'suspenders', 'watch', 'keychain'],
  swimwear: ['bikini', 'swimsuit', 'swimwear', 'swim', 'bathing suit', 'one-piece', 'tankini', 'swim trunk', 'board short', 'swimming'],
  unknown: [],
};

export function detectProductCategory(title: string, productType: string, description: string): ProductCategory {
  const text = `${title} ${productType} ${description}`.toLowerCase();
  let bestMatch: ProductCategory = 'unknown';
  let bestScore = 0;

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [ProductCategory, string[]][]) {
    if (cat === 'unknown') continue;
    for (const kw of keywords) {
      if (text.includes(kw) && kw.length > bestScore) {
        bestMatch = cat;
        bestScore = kw.length;
      }
    }
  }
  return bestMatch;
}

// ────────────────────────────────────────────────
// 2. Hero Slot Mapping
// ────────────────────────────────────────────────

const CATEGORY_TO_SLOT: Record<ProductCategory, HeroSlot> = {
  top: 'upper_body_slot',
  trousers: 'lower_body_slot',
  skirt: 'lower_body_slot',
  shorts: 'lower_body_slot',
  dress: 'full_body_slot',
  jumpsuit: 'full_body_slot',
  jacket_coat: 'upper_body_slot',
  shoes: 'footwear_slot',
  bag: 'bag_slot',
  hat: 'headwear_slot',
  sunglasses: 'eyewear_slot',
  scarf: 'accessory_slot',
  belt: 'accessory_slot',
  jewelry: 'jewelry_slot',
  accessory: 'accessory_slot',
  swimwear: 'full_body_slot',
  unknown: 'upper_body_slot',
};

export function getHeroSlot(category: ProductCategory): HeroSlot {
  return CATEGORY_TO_SLOT[category];
}

// ────────────────────────────────────────────────
// 3. Fashion Style Definitions
// ────────────────────────────────────────────────

const BASE_WARDROBE_WOMAN: SupportWardrobe = {
  upper_body_slot: 'clean neutral fitted top',
  lower_body_slot: 'neutral straight trousers',
  full_body_slot: null,
  footwear_slot: 'minimal white sneakers',
  outerwear_slot: null,
  headwear_slot: null,
  bag_slot: null,
  accessory_slot: null,
};

const BASE_WARDROBE_MAN: SupportWardrobe = {
  upper_body_slot: 'clean neutral fitted top',
  lower_body_slot: 'clean neutral trousers',
  full_body_slot: null,
  footwear_slot: 'minimal sneakers',
  outerwear_slot: null,
  headwear_slot: null,
  bag_slot: null,
  accessory_slot: null,
};

const BASE_WARDROBE_CHILD: SupportWardrobe = {
  upper_body_slot: 'simple neutral top',
  lower_body_slot: 'age-appropriate neutral bottoms',
  full_body_slot: null,
  footwear_slot: 'simple sneakers',
  outerwear_slot: null,
  headwear_slot: null,
  bag_slot: null,
  accessory_slot: null,
};

export const FASHION_STYLES: FashionStyleDefinition[] = [
  {
    id: 'minimal_studio',
    label: 'Minimal Studio',
    description: 'Clean, understated, no competing elements. Focus is entirely on the product.',
    stylingTone: 'clean_minimal',
    lightingId: 'soft_studio_clean',
    poseEnergy: 'restrained',
    accessoryIntensity: 'none',
    supportWardrobeKits: {
      adult_woman: { ...BASE_WARDROBE_WOMAN },
      adult_man: { ...BASE_WARDROBE_MAN },
      child: { ...BASE_WARDROBE_CHILD },
    },
  },
  {
    id: 'premium_neutral',
    label: 'Premium Neutral',
    description: 'Elevated basics with warm neutral tones. Refined and polished.',
    stylingTone: 'premium_neutral',
    lightingId: 'warm_studio_refined',
    poseEnergy: 'composed',
    accessoryIntensity: 'minimal',
    supportWardrobeKits: {
      adult_woman: { ...BASE_WARDROBE_WOMAN, lower_body_slot: 'tailored neutral trousers', footwear_slot: 'clean leather flats' },
      adult_man: { ...BASE_WARDROBE_MAN, lower_body_slot: 'tailored neutral chinos', footwear_slot: 'leather loafers' },
      child: { ...BASE_WARDROBE_CHILD },
    },
  },
  {
    id: 'editorial_clean',
    label: 'Editorial Clean',
    description: 'Polished magazine-ready styling with directional lighting and elevated poses.',
    stylingTone: 'polished_editorial',
    lightingId: 'soft_directional_editorial',
    poseEnergy: 'elevated',
    accessoryIntensity: 'very_low',
    supportWardrobeKits: {
      adult_woman: { ...BASE_WARDROBE_WOMAN, lower_body_slot: 'slim tailored trousers', footwear_slot: 'refined minimal heels' },
      adult_man: { ...BASE_WARDROBE_MAN, lower_body_slot: 'tailored slim trousers', footwear_slot: 'polished dress shoes' },
      child: { ...BASE_WARDROBE_CHILD },
    },
  },
  {
    id: 'streetwear_clean',
    label: 'Streetwear Clean',
    description: 'Modern relaxed energy with fashion-forward street styling.',
    stylingTone: 'modern_relaxed',
    lightingId: 'neutral_fashion_studio',
    poseEnergy: 'higher',
    accessoryIntensity: 'limited',
    supportWardrobeKits: {
      adult_woman: { ...BASE_WARDROBE_WOMAN, lower_body_slot: 'relaxed cargo trousers', footwear_slot: 'chunky fashion sneakers' },
      adult_man: { ...BASE_WARDROBE_MAN, lower_body_slot: 'relaxed fit joggers', footwear_slot: 'chunky fashion sneakers' },
      child: { ...BASE_WARDROBE_CHILD, footwear_slot: 'trendy kids sneakers' },
    },
  },
  {
    id: 'luxury_soft',
    label: 'Luxury Soft',
    description: 'High-end soft lighting with luxurious textures and elegant feel.',
    stylingTone: 'luxury_soft',
    lightingId: 'soft_warm_luxury',
    poseEnergy: 'graceful',
    accessoryIntensity: 'curated',
    supportWardrobeKits: {
      adult_woman: { ...BASE_WARDROBE_WOMAN, lower_body_slot: 'flowing wide-leg trousers', footwear_slot: 'elegant pointed-toe heels' },
      adult_man: { ...BASE_WARDROBE_MAN, lower_body_slot: 'luxe tailored trousers', footwear_slot: 'refined leather shoes' },
      child: { ...BASE_WARDROBE_CHILD },
    },
  },
];

export function getFashionStyle(id: FashionStyleId): FashionStyleDefinition {
  return FASHION_STYLES.find(s => s.id === id) || FASHION_STYLES[0];
}

// ────────────────────────────────────────────────
// 4. Support Wardrobe Resolver
// ────────────────────────────────────────────────

export function resolveSupportWardrobe(
  heroSlot: HeroSlot,
  fashionStyle: FashionStyleId,
  audience: ModelAudienceType,
  category?: ProductCategory,
): SupportWardrobe {
  // Swimwear: the product IS the outfit — no support clothing at all
  if (category === 'swimwear') {
    return {
      upper_body_slot: null,
      lower_body_slot: null,
      full_body_slot: null,
      footwear_slot: null,
      outerwear_slot: null,
      headwear_slot: null,
      bag_slot: null,
      accessory_slot: null,
    };
  }

  const style = getFashionStyle(fashionStyle);
  const kit = { ...style.supportWardrobeKits[audience] };

  // Null out the hero slot — the uploaded product replaces it
  const slotKey = heroSlot.replace('_slot', '_slot') as keyof SupportWardrobe;
  if (slotKey in kit) {
    (kit as any)[slotKey] = null;
  }

  // Full-body items also null out upper + lower
  if (heroSlot === 'full_body_slot') {
    kit.upper_body_slot = null;
    kit.lower_body_slot = null;
  }

  return kit;
}

export function buildSupportWardrobePrompt(wardrobe: SupportWardrobe, category: ProductCategory): string {
  const pieces: string[] = [];

  if (wardrobe.upper_body_slot) pieces.push(wardrobe.upper_body_slot);
  if (wardrobe.lower_body_slot) pieces.push(wardrobe.lower_body_slot);
  if (wardrobe.footwear_slot) pieces.push(wardrobe.footwear_slot);
  if (wardrobe.outerwear_slot) pieces.push(wardrobe.outerwear_slot);

  if (pieces.length === 0) return '';

  // Category-aware phrasing
  const focus = {
    bag: 'designed to keep focus on the bag',
    hat: 'designed to keep focus on the headwear',
    sunglasses: 'designed to keep focus on the eyewear',
    jewelry: 'designed to keep focus on the jewelry',
    shoes: 'designed to keep focus on the footwear',
    swimwear: 'designed to keep focus on the swimwear, no additional clothing',
  }[category] || '';

  return `paired with ${pieces.join(' and ')}, understated styling${focus ? `, ${focus}` : ''}, no competing accessories`;
}

// ────────────────────────────────────────────────
// 5. Background Definitions
// ────────────────────────────────────────────────

export const BACKGROUNDS: BackgroundDefinition[] = [
  {
    id: 'light_grey_studio',
    label: 'Light Grey Studio',
    promptBlock: 'solid light grey studio background (#EDEDED), seamless backdrop, perfectly uniform color, no gradients, no texture, clean minimal environment, subtle natural shadow beneath subject',
    lightingCompat: 'soft diffused studio lighting',
    shadowStyle: 'subtle',
    hex: '#EDEDED',
  },
  {
    id: 'white_seamless',
    label: 'White Seamless',
    promptBlock: 'pure white seamless studio background (#FFFFFF), infinite white backdrop, perfectly clean, no shadows on background, bright even illumination, professional product photography backdrop',
    lightingCompat: 'bright even studio lighting',
    shadowStyle: 'minimal',
    hex: '#FFFFFF',
  },
  {
    id: 'warm_beige_studio',
    label: 'Warm Beige Studio',
    promptBlock: 'warm beige studio background (#E8DDD0), soft neutral warm tone, seamless backdrop, no texture, elegant minimal environment, gentle warm shadow beneath subject',
    lightingCompat: 'warm soft studio lighting',
    shadowStyle: 'warm',
    hex: '#E8DDD0',
  },
  {
    id: 'taupe_studio',
    label: 'Taupe Studio',
    promptBlock: 'taupe studio background (#C4B5A5), mid-tone neutral backdrop, seamless, sophisticated muted tone, no gradients, refined minimal environment, natural shadow beneath subject',
    lightingCompat: 'balanced studio lighting',
    shadowStyle: 'natural',
    hex: '#C4B5A5',
  },
  {
    id: 'soft_editorial_grey',
    label: 'Soft Editorial Grey',
    promptBlock: 'soft editorial grey studio background (#D5D5D5), slightly darker grey tone, premium feel, seamless backdrop, clean editorial environment, controlled shadow beneath subject',
    lightingCompat: 'soft directional studio lighting',
    shadowStyle: 'controlled',
    hex: '#D5D5D5',
  },
];

export function getBackground(id: string): BackgroundDefinition {
  return BACKGROUNDS.find(b => b.id === id) || BACKGROUNDS[0];
}

// ────────────────────────────────────────────────
// 6. Lighting Definitions
// ────────────────────────────────────────────────

const LIGHTING_PROMPTS: Record<string, string> = {
  soft_studio_clean: 'soft diffused studio lighting, clean ecommerce lighting, gentle controlled shadows',
  warm_studio_refined: 'warm refined studio lighting, soft golden tones, premium commercial lighting',
  soft_directional_editorial: 'soft directional editorial lighting, subtle contrast, polished fashion photography lighting',
  neutral_fashion_studio: 'neutral balanced studio lighting, even illumination, modern fashion photography lighting',
  soft_warm_luxury: 'soft warm luxury lighting, gentle glow, high-end editorial warmth, elegant shadows',
};

export function getLightingPrompt(lightingId: string): string {
  return LIGHTING_PROMPTS[lightingId] || LIGHTING_PROMPTS.soft_studio_clean;
}

// ────────────────────────────────────────────────
// 7. Shot Definitions Library
// ────────────────────────────────────────────────

const ALL_CATEGORIES = new Set<ProductCategory>([
  'top', 'trousers', 'skirt', 'shorts', 'dress', 'jumpsuit', 'jacket_coat',
  'shoes', 'bag', 'hat', 'sunglasses', 'scarf', 'belt', 'jewelry', 'accessory', 'swimwear', 'unknown',
]);

const APPAREL = new Set<ProductCategory>(['top', 'trousers', 'skirt', 'shorts', 'dress', 'jumpsuit', 'jacket_coat', 'scarf', 'swimwear', 'unknown']);
const APPAREL_PLUS_SHOES = new Set<ProductCategory>([...APPAREL, 'shoes']);
const WEARABLE = new Set<ProductCategory>([...APPAREL, 'shoes', 'hat', 'sunglasses', 'belt']);
const SMALL_ITEMS = new Set<ProductCategory>(['jewelry', 'sunglasses', 'scarf', 'belt', 'accessory']);

export const SHOT_DEFINITIONS: ShotDefinition[] = [
  // ── On-Model Shots ──
  {
    id: 'front_model',
    label: 'Front Model',
    group: 'on-model',
    compatibleCategories: WEARABLE,
    defaultRenderPath: 'anchor_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL], full body front-facing pose, weight on left leg, right hand relaxed at side, left arm slightly away from body, confident neutral expression, looking directly into camera, [SUPPORT_WARDROBE], focus on fit and silhouette, centered composition, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
    categoryOverrides: {
      shoes: '[HERO_PRODUCT] worn by [MODEL], lower-body focused standing pose, feet shoulder-width apart, the footwear clearly visible as the hero product, [SUPPORT_WARDROBE], sharp focus on shoes, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
      hat: '[HERO_PRODUCT] worn by [MODEL], portrait or upper-body front-facing pose, confident neutral expression, the headwear clearly visible as the hero product, [SUPPORT_WARDROBE], sharp focus, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
      sunglasses: '[HERO_PRODUCT] worn by [MODEL], front-facing portrait pose, confident expression, the eyewear clearly visible as the hero product, [SUPPORT_WARDROBE], sharp focus, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
      bag: '[HERO_PRODUCT] carried by [MODEL], front-facing relaxed pose, one hand holding the bag naturally, the bag clearly visible as the hero item, [SUPPORT_WARDROBE], sharp focus on bag, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
      jewelry: '[HERO_PRODUCT] worn by [MODEL], close portrait or upper-body front-facing pose, the jewelry clearly visible as the hero piece, minimal competing styling, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
    },
  },
  {
    id: 'back_view',
    label: 'Back View',
    group: 'on-model',
    compatibleCategories: APPAREL_PLUS_SHOES,
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL], full body back view, head turned slightly to the right, natural upright posture, arms relaxed at sides, showing full back fit and structure of the hero product, [SUPPORT_WARDROBE], sharp focus, realistic construction details, [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'side_3q',
    label: 'Side / 3-Quarter',
    group: 'on-model',
    compatibleCategories: WEARABLE,
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL], 3/4 angle pose, body turned 45 degrees to the left, weight on back foot, natural relaxed arms, highlighting shape and drape of the hero product, [SUPPORT_WARDROBE], [QUALITY], sharp focus, [LIGHTING], [BACKGROUND], [CONSISTENCY]',
    categoryOverrides: {
      bag: '[HERO_PRODUCT] carried by [MODEL], 3/4 angle side view, bag clearly visible on shoulder or in hand, [SUPPORT_WARDROBE], [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
      sunglasses: '[HERO_PRODUCT] worn by [MODEL], 3/4 portrait angle, eyewear clearly visible, confident expression, [SUPPORT_WARDROBE], sharp focus, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
      hat: '[HERO_PRODUCT] worn by [MODEL], 3/4 upper-body angle, headwear clearly visible, [SUPPORT_WARDROBE], sharp focus, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
    },
  },
  {
    id: 'detail_closeup',
    label: 'Detail Close-Up',
    group: 'on-model',
    compatibleCategories: ALL_CATEGORIES,
    defaultRenderPath: 'anchor_edit',
    needsModel: false,
    promptTemplate: 'macro close-up of [HERO_PRODUCT], focusing on texture, stitching, material quality, and finishing details, ultra sharp details, shallow depth of field, soft diffused lighting, premium ecommerce macro photography, ONLY the hero product visible, no other items, [BACKGROUND], [CONSISTENCY]',
    categoryOverrides: {
      jewelry: 'macro close-up of [HERO_PRODUCT] worn by [MODEL], focus on jewelry placement, texture, shine, and construction, minimal competing styling, soft controlled lighting, [BACKGROUND], [CONSISTENCY]',
    },
  },
  {
    id: 'movement',
    label: 'Movement',
    group: 'on-model',
    compatibleCategories: APPAREL_PLUS_SHOES,
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL], mid-stride walking motion, one foot forward, slight fabric movement on the hero product, arms swinging naturally, confident forward gaze, [SUPPORT_WARDROBE], [QUALITY], sharp motion capture, [LIGHTING], [BACKGROUND], [CONSISTENCY]',
    categoryOverrides: {
      shoes: '[HERO_PRODUCT] worn by [MODEL], subtle walking step, one foot lifting off ground, motion focused on footwear visibility, lower-body framing, [SUPPORT_WARDROBE], sharp focus, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
    },
  },
  {
    id: 'hands_detail',
    label: 'Hands / Function',
    group: 'on-model',
    compatibleCategories: new Set([...APPAREL, 'bag', 'jewelry', 'accessory', 'belt', 'scarf']),
    defaultRenderPath: 'anchor_edit',
    needsModel: true,
    promptTemplate: 'close-up of [MODEL] hands interacting naturally with [HERO_PRODUCT], adjusting collar or hem or holding the product, focus on usability and material detail, sharp product focus, ONLY the hero product visible, [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'sitting',
    label: 'Sitting',
    group: 'on-model',
    compatibleCategories: APPAREL_PLUS_SHOES,
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL] seated on a simple minimal stool, back straight, legs crossed at ankles, hands resting on thighs, focus on silhouette and structure of the hero product, [SUPPORT_WARDROBE], [QUALITY], sharp focus, [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'full_look',
    label: 'Full Look Editorial',
    group: 'on-model',
    compatibleCategories: new Set([...APPAREL, 'shoes', 'bag']),
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL], full body editorial pose, slight weight shift to one hip, one hand on hip, confident neutral expression, the hero product clearly visible, [SUPPORT_WARDROBE], [QUALITY], sharp focus, [LIGHTING], [BACKGROUND], [CONSISTENCY]',
    categoryOverrides: {
      bag: '[HERO_PRODUCT] carried by [MODEL], relaxed full-body pose, one hand holding bag naturally, the bag clearly the hero item, [SUPPORT_WARDROBE], clean studio styling, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
    },
  },
  // ── Product-Only Shots ──
  {
    id: 'ghost_mannequin',
    label: 'Ghost Mannequin',
    group: 'product-only',
    compatibleCategories: APPAREL,
    defaultRenderPath: 'product_only_generate',
    needsModel: false,
    promptTemplate: '[HERO_PRODUCT] invisible mannequin effect, product floating in pure white void, natural garment shape preserved as if worn, perfectly centered, absolutely NO shadow, NO drop shadow, NO cast shadow, NO surface reflection, NO floor, pure white (#FFFFFF) infinite void background, ultra clean ecommerce packshot, sharp material details, ONLY this single product, [CONSISTENCY]',
  },
  {
    id: 'front_flat',
    label: 'Front Flat Product',
    group: 'product-only',
    compatibleCategories: ALL_CATEGORIES,
    defaultRenderPath: 'product_only_generate',
    needsModel: false,
    promptTemplate: '[HERO_PRODUCT] floating centered, perfectly symmetrical front view, no model, no mannequin, ONLY this single product, no other items, no accessories, no props, ultra clean ecommerce packshot, sharp details, realistic structure and material texture, minimal subtle shadow beneath product, [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'back_flat',
    label: 'Back Flat Product',
    group: 'product-only',
    compatibleCategories: new Set([...APPAREL, 'bag', 'shoes']),
    defaultRenderPath: 'product_only_generate',
    needsModel: false,
    promptTemplate: '[HERO_PRODUCT] floating centered, back view, perfectly aligned, showing full construction and shape, ONLY this single product, no other items, no accessories, ultra clean ecommerce packshot, sharp details, minimal subtle shadow beneath product, [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'zoom_detail',
    label: 'Zoom Detail',
    group: 'product-only',
    compatibleCategories: ALL_CATEGORIES,
    defaultRenderPath: 'product_only_generate',
    needsModel: false,
    promptTemplate: 'extreme close-up of [HERO_PRODUCT], highlighting material, stitching, texture, construction, or finishing details, ultra sharp textures, shallow depth of field, premium editorial macro style, ONLY the hero product visible, [BACKGROUND], [CONSISTENCY]',
  },
  // ── Category-specific shots ──
  {
    id: 'hand_carry',
    label: 'Hand Carry',
    group: 'on-model',
    compatibleCategories: new Set(['bag']),
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] carried in right hand by [MODEL], natural relaxed grip at side, bag clearly visible as hero item, [SUPPORT_WARDROBE], sharp focus on bag, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'shoulder_carry',
    label: 'Shoulder Carry',
    group: 'on-model',
    compatibleCategories: new Set(['bag']),
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] carried on left shoulder by [MODEL], natural shoulder carry pose, strap clearly visible, bag resting against hip, [SUPPORT_WARDROBE], sharp focus on bag, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'standing_shoe_focus',
    label: 'Standing Shoe Focus',
    group: 'on-model',
    compatibleCategories: new Set(['shoes']),
    defaultRenderPath: 'anchor_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL], standing pose with feet shoulder-width apart, lower-body cropped composition from knees down, shoes clearly hero item, [SUPPORT_WARDROBE], sharp focus on footwear, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'side_step',
    label: 'Side Step',
    group: 'on-model',
    compatibleCategories: new Set(['shoes']),
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL], mid-step side view, left foot forward, footwear clearly visible from side profile, [SUPPORT_WARDROBE], sharp focus on shoes, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'close_portrait',
    label: 'Close Portrait',
    group: 'on-model',
    compatibleCategories: new Set(['jewelry', 'sunglasses', 'hat', 'scarf']),
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: 'close portrait of [MODEL] wearing [HERO_PRODUCT], tight upper-body or face crop, confident neutral expression, the item clearly visible as the hero piece, minimal competing styling, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'macro_detail',
    label: 'Macro Detail',
    group: 'product-only',
    compatibleCategories: new Set(['jewelry', 'sunglasses', 'accessory', 'belt']),
    defaultRenderPath: 'product_only_generate',
    needsModel: false,
    promptTemplate: 'extreme macro close-up of [HERO_PRODUCT], sharp focus on craftsmanship, texture, shine, material quality, shallow depth of field, premium product photography, ONLY this single product, [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'product_front',
    label: 'Product Front',
    group: 'product-only',
    compatibleCategories: new Set(['shoes', 'bag', 'hat', 'sunglasses', 'jewelry', 'accessory']),
    defaultRenderPath: 'product_only_generate',
    needsModel: false,
    promptTemplate: '[HERO_PRODUCT] isolated, front view, perfectly centered, clean product photography, sharp details, no model, ONLY this single product, no other items, minimal subtle shadow, [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'product_angle',
    label: 'Product Angle',
    group: 'product-only',
    compatibleCategories: new Set(['shoes', 'bag', 'hat', 'sunglasses', 'jewelry', 'accessory']),
    defaultRenderPath: 'product_only_generate',
    needsModel: false,
    promptTemplate: '[HERO_PRODUCT] isolated, 3/4 angled view, showing depth and dimension, clean product photography, sharp details, no model, ONLY this single product, no other items, minimal subtle shadow, [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'hardware_detail',
    label: 'Hardware Detail',
    group: 'product-only',
    compatibleCategories: new Set(['bag', 'belt', 'jewelry']),
    defaultRenderPath: 'product_only_generate',
    needsModel: false,
    promptTemplate: 'extreme close-up of hardware and metal details on [HERO_PRODUCT], zippers, clasps, buckles, or chains, ultra sharp macro, premium product photography, ONLY this product, [BACKGROUND], [CONSISTENCY]',
  },
  // ── New On-Model Shots ──
  {
    id: 'lifestyle_context',
    label: 'Lifestyle Context',
    group: 'on-model',
    compatibleCategories: WEARABLE,
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL], relaxed natural lifestyle pose, weight shifted casually, one hand in pocket or touching hair, candid energy, [SUPPORT_WARDROBE], focus on the hero product in a real-life context, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'over_shoulder',
    label: 'Over Shoulder',
    group: 'on-model',
    compatibleCategories: APPAREL_PLUS_SHOES,
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL], viewed from behind over the right shoulder, head turned 30 degrees showing profile, showing back and side of the hero product, [SUPPORT_WARDROBE], [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'waist_up_crop',
    label: 'Waist-Up Crop',
    group: 'on-model',
    compatibleCategories: new Set([...APPAREL, 'hat', 'sunglasses', 'scarf', 'jewelry']),
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL], cropped at waist, upper-body focus, natural relaxed pose, arms at sides, confident neutral expression, the hero product clearly visible, [SUPPORT_WARDROBE], [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'walking_motion',
    label: 'Walking Motion',
    group: 'on-model',
    compatibleCategories: APPAREL_PLUS_SHOES,
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL], natural walking stride, full body, right foot forward mid-step, arms swinging naturally, slight fabric motion on the hero product, [SUPPORT_WARDROBE], [QUALITY], sharp motion capture, [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'cross_body',
    label: 'Cross-Body',
    group: 'on-model',
    compatibleCategories: new Set(['bag']),
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn cross-body by [MODEL], natural standing pose, the bag strap across torso from left shoulder, bag resting at right hip, clearly visible as hero item, [SUPPORT_WARDROBE], [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'wrist_shot',
    label: 'Wrist Shot',
    group: 'on-model',
    compatibleCategories: new Set(['jewelry', 'accessory']),
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: 'close-up of [MODEL] left wrist and hand wearing [HERO_PRODUCT], elegant natural hand pose with fingers slightly spread, the jewelry or accessory clearly visible as hero piece, minimal competing styling, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  // ── New Product-Only Shots ──
  {
    id: 'on_surface',
    label: 'On Surface',
    group: 'product-only',
    compatibleCategories: ALL_CATEGORIES,
    defaultRenderPath: 'product_only_generate',
    needsModel: false,
    promptTemplate: '[HERO_PRODUCT] placed on a clean minimal surface, single product only, NO other items, NO accessories, NO props in frame, subtle natural shadow beneath product, premium product photography, [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'styled_flat_lay',
    label: 'Styled Flat Lay',
    group: 'product-only',
    compatibleCategories: ALL_CATEGORIES,
    defaultRenderPath: 'product_only_generate',
    needsModel: false,
    promptTemplate: 'ONLY [HERO_PRODUCT] alone in a flat lay, top-down birds-eye perspective, centered in frame, clean negative space around product, NO other products, NO extra accessories, NO additional items, NO props, single product flat lay, premium editorial flat lay photography, [BACKGROUND], [CONSISTENCY]',
  },
];

export function getCompatibleShots(category: ProductCategory, hasModel: boolean): ShotDefinition[] {
  return SHOT_DEFINITIONS.filter(shot => {
    if (!shot.compatibleCategories.has(category)) return false;
    if (shot.needsModel && !hasModel) return false;
    return true;
  });
}

export function getRecommendedShotIds(category: ProductCategory, hasModel: boolean): CatalogShotId[] {
  const compatible = getCompatibleShots(category, hasModel);
  // Recommend first 4-6 shots as default selection
  const onModel = compatible.filter(s => s.group === 'on-model').slice(0, 4);
  const productOnly = compatible.filter(s => s.group === 'product-only').slice(0, 2);
  return [...onModel, ...productOnly].map(s => s.id);
}

export function getShotDefinition(id: CatalogShotId): ShotDefinition | undefined {
  return SHOT_DEFINITIONS.find(s => s.id === id);
}

// ────────────────────────────────────────────────
// 8. Anchor Shot Resolver
// ────────────────────────────────────────────────

export function getAnchorShotId(category: ProductCategory, hasModel: boolean): CatalogShotId {
  if (!hasModel) return 'front_flat';

  const ANCHOR_MAP: Partial<Record<ProductCategory, CatalogShotId>> = {
    shoes: 'standing_shoe_focus',
    bag: 'hand_carry',
    hat: 'front_model',
    sunglasses: 'front_model',
    jewelry: 'close_portrait',
  };
  return ANCHOR_MAP[category] || 'front_model';
}

// ────────────────────────────────────────────────
// 9. Render Path Classifier
// ────────────────────────────────────────────────

const EDIT_COMPATIBLE_FROM_ANCHOR: Record<string, Set<CatalogShotId>> = {
  front_model: new Set(['detail_closeup', 'hands_detail', 'zoom_detail']),
  standing_shoe_focus: new Set(['detail_closeup', 'zoom_detail']),
  hand_carry: new Set(['detail_closeup', 'hands_detail', 'hardware_detail', 'zoom_detail']),
  close_portrait: new Set(['detail_closeup', 'macro_detail', 'zoom_detail']),
  front_flat: new Set(['zoom_detail', 'back_flat']),
};

export function classifyRenderPath(
  anchorShotId: CatalogShotId,
  targetShotId: CatalogShotId,
  _category: ProductCategory,
): RenderPath {
  const shot = getShotDefinition(targetShotId);
  if (!shot) return 'reference_generate';

  // Product-only shots always use product_only_generate
  if (shot.group === 'product-only') return 'product_only_generate';

  // Check if editable from anchor
  const editSet = EDIT_COMPATIBLE_FROM_ANCHOR[anchorShotId];
  if (editSet?.has(targetShotId)) return 'anchor_edit';

  return 'reference_generate';
}

// ────────────────────────────────────────────────
// 10. Prompt Assembly
// ────────────────────────────────────────────────

const QUALITY_BLOCK = 'ultra realistic ecommerce fashion photography, sharp focus, realistic fabric details, premium commercial finish, natural proportions, polished product visibility';
const CONSISTENCY_BLOCK_MODEL = 'same model identity matching the model reference image exactly — same face same hair color same hair style same skin tone same body proportions, same styling, same support wardrobe, same shoes, same proportions, same background, same studio setup, same controlled studio lighting, consistent across the entire set, no variation between images beyond shot angle and pose';
const CONSISTENCY_BLOCK_PRODUCT = 'same product appearance, same colors, same textures, same materials, same background, same controlled studio lighting setup, consistent color accuracy across the entire set, NO people, NO model, NO human figure';

export interface PromptAssemblyInput {
  productTitle: string;
  productCategory: ProductCategory;
  modelProfile: string;
  supportWardrobePrompt: string;
  backgroundPrompt: string;
  lightingPrompt: string;
  shotDef: ShotDefinition;
  renderPath: RenderPath;
}

export function assemblePrompt(input: PromptAssemblyInput): string {
  const { productTitle, productCategory, modelProfile, supportWardrobePrompt, backgroundPrompt, lightingPrompt, shotDef, renderPath } = input;

  // Pick the right template — category override or default
  let template = shotDef.categoryOverrides?.[productCategory] || shotDef.promptTemplate;

  // Choose the right consistency block based on whether this shot needs a model
  const consistencyBlock = shotDef.needsModel ? CONSISTENCY_BLOCK_MODEL : CONSISTENCY_BLOCK_PRODUCT;

  // For edit paths, wrap differently
  if (renderPath === 'anchor_edit') {
    // Seedream edit format: Action + Object + Characteristic + keep unchanged
    return `Adjust the framing to show: ${template
      .replace('[HERO_PRODUCT]', productTitle)
      .replace('[MODEL]', modelProfile)
      .replace('[SUPPORT_WARDROBE]', supportWardrobePrompt)
      .replace('[BACKGROUND]', backgroundPrompt)
      .replace('[LIGHTING]', lightingPrompt)
      .replace('[QUALITY]', QUALITY_BLOCK)
      .replace('[CONSISTENCY]', consistencyBlock)
    }. Keep the model identity, outfit, background, and lighting exactly the same.`;
  }

  // Standard generation prompt (structured: Subject + Action + Environment + Aesthetics)
  let prompt = template
    .replace('[HERO_PRODUCT]', productTitle)
    .replace('[MODEL]', modelProfile)
    .replace('[SUPPORT_WARDROBE]', supportWardrobePrompt)
    .replace('[BACKGROUND]', backgroundPrompt)
    .replace('[LIGHTING]', lightingPrompt)
    .replace('[QUALITY]', QUALITY_BLOCK)
    .replace('[CONSISTENCY]', consistencyBlock);

  // Append model identity & background isolation directives when a model is involved
  if (modelProfile && modelProfile !== 'no model') {
    prompt += '\nCRITICAL: The model MUST be the EXACT person shown in the model reference image — replicate their face, skin tone, hair color, hair style, and body proportions precisely. Do NOT substitute a different person.';
    prompt += '\nBACKGROUND RULE: Use ONLY the specified studio background. IGNORE any background, environment, or lighting from the model reference photo. NO sun flares, NO lens flares, NO window light, NO natural outdoor lighting, ONLY controlled studio lighting.';
  }

  // Product-only shots: enforce single-product + no-people rule
  if (shotDef.group === 'product-only') {
    prompt += '\nIMPORTANT: Show ONLY the specified hero product. Do NOT add any other clothing, accessories, shoes, bags, or items that are not explicitly described. NO people, NO model, NO human figure, NO hands, NO body parts.';
  }

  return prompt;
}

// ────────────────────────────────────────────────
// 11. Reference Priority Builder
// ────────────────────────────────────────────────

export interface ImageRef {
  url: string;
  role: 'product' | 'anchor' | 'model' | 'pose';
}

export function buildReferences(
  productImageUrl: string,
  anchorImageUrl: string | null,
  modelRefUrl?: string | null,
): ImageRef[] {
  const refs: ImageRef[] = [
    { url: productImageUrl, role: 'product' },
  ];
  if (anchorImageUrl) refs.push({ url: anchorImageUrl, role: 'anchor' });
  if (modelRefUrl) refs.push({ url: modelRefUrl, role: 'model' });
  // Keep under 4 references
  return refs.slice(0, 4);
}

// ────────────────────────────────────────────────
// 12. Hero Product Block Builder
// ────────────────────────────────────────────────

const HERO_PHRASING: Partial<Record<ProductCategory, string>> = {
  top: 'worn as the hero upper-body piece',
  trousers: 'worn as the hero lower-body piece',
  skirt: 'worn as the hero lower-body piece',
  shorts: 'worn as the hero lower-body piece',
  dress: 'worn as the hero full-body garment',
  jumpsuit: 'worn as the hero full-body garment',
  jacket_coat: 'worn as the hero outerwear piece',
  shoes: 'worn as the hero footwear item',
  bag: 'worn or carried as the hero bag',
  hat: 'worn as the hero headwear item',
  sunglasses: 'worn as the hero eyewear item',
  jewelry: 'worn as the hero jewelry piece',
  scarf: 'worn as the hero scarf/wrap',
  belt: 'worn as the hero belt',
  swimwear: 'worn as the hero swimwear piece',
};

export function getHeroProductBlock(title: string, category: ProductCategory): string {
  const phrasing = HERO_PHRASING[category] || 'as the hero product';
  return `${title} ${phrasing}`;
}

// ────────────────────────────────────────────────
// 13. Session + Look Lock Builders
// ────────────────────────────────────────────────

export function buildSessionLock(
  fashionStyle: FashionStyleId,
  modelId: string | null,
  modelProfile: string,
  modelAudience: ModelAudienceType,
  backgroundId: string,
): CatalogSessionLock {
  const style = getFashionStyle(fashionStyle);
  const bg = getBackground(backgroundId);

  return {
    fashionStyle,
    modelId,
    modelProfile,
    modelAudience,
    backgroundId,
    backgroundPrompt: bg.promptBlock,
    lightingPrompt: getLightingPrompt(style.lightingId),
    consistencyBlock: CONSISTENCY_BLOCK,
  };
}

export function buildProductLookLock(
  product: { id: string; title: string; productType: string; description: string },
  session: CatalogSessionLock,
  detectedCategory: ProductCategory,
): ProductLookLock {
  const heroSlot = getHeroSlot(detectedCategory);
  const wardrobe = resolveSupportWardrobe(heroSlot, session.fashionStyle, session.modelAudience, detectedCategory);
  const wardrobePrompt = buildSupportWardrobePrompt(wardrobe, detectedCategory);
  const anchorShotId = getAnchorShotId(detectedCategory, !!session.modelId);

  return {
    productId: product.id,
    productTitle: product.title,
    productCategory: detectedCategory,
    heroSlot,
    supportWardrobePrompt: wardrobePrompt,
    anchorShotId,
    anchorImageUrl: null,
  };
}
