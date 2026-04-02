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

  return `paired with ${pieces.join(' and ')}, supporting wardrobe must stay minimal, commercially styled, color-coordinated, and secondary to the hero product${focus ? `, ${focus}` : ''}, no distracting patterns, no competing hero items`;
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
  warm_studio_refined: 'warm refined studio lighting, soft warm tones, premium commercial lighting, NO sun flares, NO lens flares',
  soft_directional_editorial: 'soft directional editorial lighting, subtle contrast, polished fashion photography lighting',
  neutral_fashion_studio: 'neutral balanced studio lighting, even illumination, modern fashion photography lighting',
  soft_warm_luxury: 'soft warm luxury lighting, gentle glow, high-end editorial warmth, elegant shadows, NO sun flares, NO lens flares, ONLY controlled studio lighting',
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
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL], full body fashion ecommerce catalog photograph, head to toe fully visible with feet entirely inside frame, model standing straight facing camera, weight evenly distributed, feet hip-width apart, arms relaxed naturally at sides, shoulders level, straight-on eye-level camera, centered composition, neutral professional catalog expression, looking directly into camera, clear visibility of fit, length, silhouette, and construction of the hero product, [SUPPORT_WARDROBE], [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
    categoryOverrides: {
      shoes: '[HERO_PRODUCT] worn by [MODEL], lower-body focused fashion ecommerce catalog photograph, straight-on front-facing stance, feet hip-width apart and fully visible, camera framed to prioritize footwear while preserving natural leg proportions, shoes clearly visible as the hero product, [SUPPORT_WARDROBE], [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
      hat: '[HERO_PRODUCT] worn by [MODEL], straight-on upper-body catalog photograph, front-facing pose, shoulders square to camera, neutral expression, headwear clearly visible and centered as hero item, minimal competing styling, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
      sunglasses: '[HERO_PRODUCT] worn by [MODEL], straight-on portrait ecommerce photograph, front-facing pose, direct gaze, neutral composed expression, eyewear clearly visible and symmetrical on face, minimal competing styling, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
      bag: '[HERO_PRODUCT] worn by [MODEL], full body straight-on catalog pose, standing facing camera, one hand naturally holding the bag at side, bag fully visible as the hero item, [SUPPORT_WARDROBE], [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
      jewelry: '[HERO_PRODUCT] worn by [MODEL], straight-on upper-body catalog photograph, clean pose, jewelry clearly visible as hero piece, minimal competing styling, accurate placement and scale, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
    },
  },
  {
    id: 'back_view',
    label: 'Back View',
    group: 'on-model',
    compatibleCategories: APPAREL_PLUS_SHOES,
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL], full body ecommerce catalog photograph, head to toe fully visible with feet entirely inside frame, full back view, model standing straight facing away from camera, weight evenly distributed, feet hip-width apart, arms relaxed naturally at sides, shoulders level, straight-on eye-level camera, clearly showing back fit, length, seams, and construction of the hero product, [SUPPORT_WARDROBE], [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'side_3q',
    label: 'Side / 3-Quarter',
    group: 'on-model',
    compatibleCategories: WEARABLE,
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL], full body ecommerce catalog photograph, head to toe fully visible with feet entirely inside frame, body angled 30 to 45 degrees toward camera, natural upright posture, subtle controlled weight shift, arms relaxed, straight-on studio camera, clearly showing shape, drape, and side structure of the hero product, [SUPPORT_WARDROBE], [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
    categoryOverrides: {
      bag: '[HERO_PRODUCT] worn by [MODEL], 3/4 angle full-body catalog photograph, bag clearly visible on shoulder or in hand as hero item, balanced styling, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
      sunglasses: '[HERO_PRODUCT] worn by [MODEL], 3/4 portrait catalog photograph, eyewear clearly visible, calm confident expression, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
      hat: '[HERO_PRODUCT] worn by [MODEL], 3/4 upper-body catalog photograph, headwear clearly visible, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
    },
  },
  {
    id: 'detail_closeup',
    label: 'Detail Close-Up',
    group: 'on-model',
    compatibleCategories: ALL_CATEGORIES,
    defaultRenderPath: 'anchor_edit',
    needsModel: false,
    promptTemplate: 'macro ecommerce product close-up of [HERO_PRODUCT], focusing on exact fabric texture, stitching, surface finish, and construction details. Reproduce the exact product from the reference image: identical color, wash, texture, pattern, stitching, trim, and material. Do not invent, simplify, replace, or alter any product detail. Do not change color or fabric appearance. Ultra sharp detail, shallow depth of field, soft diffused studio lighting, premium ecommerce macro photography, only the hero product visible, no other items, [BACKGROUND], [CONSISTENCY]',
    categoryOverrides: {
      jewelry: 'macro ecommerce close-up of [HERO_PRODUCT] worn by [MODEL], focus on exact jewelry placement, material finish, reflection behavior, texture, and craftsmanship, accurate scale and construction, [LIGHTING], [BACKGROUND], [CONSISTENCY]',
    },
  },
  {
    id: 'movement',
    label: 'Movement',
    group: 'on-model',
    compatibleCategories: APPAREL_PLUS_SHOES,
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL], full body ecommerce catalog photograph, head to toe fully visible with feet entirely inside frame, subtle controlled walking pose, one foot slightly forward, gentle natural arm movement, upright posture, slight realistic fabric movement on the hero product, front-facing or slight 3/4 studio angle, neutral composed expression, commercially clean motion capture, not dynamic fashion editorial, [SUPPORT_WARDROBE], [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
    categoryOverrides: {
      shoes: '[HERO_PRODUCT] worn by [MODEL], lower-body focused ecommerce photograph, subtle walking step with one foot lifting naturally, motion designed to clearly show footwear shape and sole profile, [SUPPORT_WARDROBE], [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
    },
  },
  {
    id: 'hands_detail',
    label: 'Hands / Function',
    group: 'on-model',
    compatibleCategories: new Set([...APPAREL, 'bag', 'jewelry', 'accessory', 'belt', 'scarf']),
    defaultRenderPath: 'anchor_edit',
    needsModel: true,
    promptTemplate: 'close-up ecommerce detail of [MODEL] hands interacting naturally with [HERO_PRODUCT], adjusting collar, cuff, hem, zipper, strap, or closure, tight crop focused on hands and hero product detail, sharp product focus, only the hero product visible, clean studio styling, [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'sitting',
    label: 'Sitting',
    group: 'on-model',
    compatibleCategories: APPAREL_PLUS_SHOES,
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL], seated on a minimal studio stool, full or 3/4 body ecommerce catalog photograph depending on product category, back straight, feet flat on floor, hands resting naturally on knees or lap, relaxed upright posture, straight-on camera, clean commercial catalog styling, clear visibility of silhouette and fit of the hero product, [SUPPORT_WARDROBE], [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'full_look_catalog',
    label: 'Full Look Catalog',
    group: 'on-model',
    compatibleCategories: new Set([...APPAREL, 'shoes', 'bag']),
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL], full body head-to-toe ecommerce catalog photograph, feet fully visible in frame, standing in a clean commercially styled pose, arms relaxed at sides or one hand lightly positioned, complete outfit visible with the hero product remaining clearly dominant, [SUPPORT_WARDROBE], sharp focus, premium catalog image quality, [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  // ── Product-Only Shots ──
  {
    id: 'ghost_mannequin',
    label: 'Ghost Mannequin',
    group: 'product-only',
    compatibleCategories: APPAREL,
    defaultRenderPath: 'product_only_generate',
    needsModel: false,
    strictIsolation: true,
    promptTemplate: '[HERO_PRODUCT] professional ghost mannequin ecommerce photograph, front view, centered composition, natural worn 3D garment shape with invisible body effect. Hollow neck opening, sleeve openings, and hem opening visible with pure white interior matching the background. Pure white #FFFFFF infinite background. No person, no mannequin head, no mannequin face, no body parts, no skin, no shadow, no floor, no reflection. Ultra sharp textile detail, realistic fabric drape, clean ecommerce packshot, [CONSISTENCY]',
    categoryOverrides: {
      top: '[HERO_PRODUCT] professional ghost mannequin photograph of this top/shirt. The garment maintains its natural 3D shape — hollow neck opening showing empty white interior, hollow short/long sleeve openings, natural shoulder width. Front-facing, perfectly centered. Pure white (#FFFFFF) infinite void background. Absolutely NO shadow, NO surface, NO floor. NO people, NO model, NO skin, NO head, NO face, NO neck, NO shoulders, NO hands, NO torso shape visible — ONLY the fabric shell. The interior of the garment visible through all openings MUST be PURE WHITE (#FFFFFF) — NOT black, NOT dark, NOT shadowed. There is NO mannequin head or mannequin face. Ultra sharp textile detail, realistic seams and stitching, clean ecommerce product shot, [CONSISTENCY]',
    },
  },
  {
    id: 'front_flat',
    label: 'Front Flat Product',
    group: 'product-only',
    compatibleCategories: ALL_CATEGORIES,
    defaultRenderPath: 'product_only_generate',
    needsModel: false,
    strictIsolation: true,
    promptTemplate: '[HERO_PRODUCT] flat lay ecommerce photograph, top-down front view, product laid perfectly flat and symmetrically arranged, clean edges, no wrinkles, no folds, no body shape, no mannequin effect, no model, no hands, only the single product visible, sharp material detail, clean premium packshot, [BACKGROUND], [CONSISTENCY]',
    categoryOverrides: {
      shoes: '[HERO_PRODUCT] isolated ecommerce product photograph, front view, perfectly centered, clean studio packshot, sharp details, only the single product visible, no model, no props, subtle natural grounding shadow, [BACKGROUND], [CONSISTENCY]',
      bag: '[HERO_PRODUCT] isolated ecommerce product photograph, front view, laid flat or standing upright, perfectly centered, clean product photography, sharp details, only the single product visible, no model, no props, subtle natural grounding shadow, [BACKGROUND], [CONSISTENCY]',
    },
  },
  {
    id: 'back_flat',
    label: 'Back Flat Product',
    group: 'product-only',
    compatibleCategories: new Set([...APPAREL, 'bag', 'shoes']),
    defaultRenderPath: 'product_only_generate',
    needsModel: false,
    strictIsolation: true,
    promptTemplate: '[HERO_PRODUCT] flat lay ecommerce photograph, top-down back view only, product flipped to show only the back side, perfectly flat and symmetrically arranged, no front view visible, no body shape, no mannequin effect, no model, no hands, only the single product visible, sharp construction detail, seams and back features clearly visible, [BACKGROUND], [CONSISTENCY]',
    categoryOverrides: {
      shoes: '[HERO_PRODUCT] isolated ecommerce product photograph, back/heel view only, single product, perfectly centered, clean product photography, sharp details, no model, only this single product showing only the back/heel, [BACKGROUND], [CONSISTENCY]',
      bag: '[HERO_PRODUCT] isolated ecommerce product photograph, back view only, single product showing only construction and back details, perfectly centered, clean product photography, no model, only this single product, [BACKGROUND], [CONSISTENCY]',
    },
  },
  {
    id: 'zoom_detail',
    label: 'Zoom Detail',
    group: 'product-only',
    compatibleCategories: ALL_CATEGORIES,
    defaultRenderPath: 'product_only_generate',
    needsModel: false,
    strictIsolation: true,
    promptTemplate: 'extreme macro ecommerce close-up of [HERO_PRODUCT] material surface only, showing textile weave, stitching, thread, grain, finish, or material texture. Fill frame with product material detail only. No model, no body, no hands, no mannequin, no recognizable garment silhouette, [BACKGROUND], [CONSISTENCY]',
    categoryOverrides: {
      jewelry: 'extreme macro close-up of [HERO_PRODUCT] surface — metal finish, gemstone facets, clasp mechanism, engraving detail. Fill frame with jewelry surface. Ultra sharp macro, premium product photography, NO human body, NO skin, NO face, NO fingers, ONLY the product, [BACKGROUND], [CONSISTENCY]',
      shoes: 'extreme macro close-up of [HERO_PRODUCT] — sole tread pattern, leather grain, stitching, eyelets, material texture. Fill frame with shoe surface detail. Ultra sharp macro, NO human body, NO face, NO feet, ONLY the product, [BACKGROUND], [CONSISTENCY]',
      bag: 'extreme macro close-up of [HERO_PRODUCT] — leather/fabric grain, stitching, hardware, zipper pull, material texture. Fill frame with bag surface detail. Ultra sharp macro, NO human body, NO face, NO hands, ONLY the product, [BACKGROUND], [CONSISTENCY]',
    },
  },
  // ── Category-specific shots ──
  {
    id: 'hand_carry',
    label: 'Hand Carry',
    group: 'on-model',
    compatibleCategories: new Set(['bag']),
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] carried in right hand by [MODEL], full or 3/4 body ecommerce catalog photograph, natural relaxed arm position, bag fully visible and unobstructed as hero item, minimal competing styling, [SUPPORT_WARDROBE], [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'shoulder_carry',
    label: 'Shoulder Carry',
    group: 'on-model',
    compatibleCategories: new Set(['bag']),
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] carried on left shoulder by [MODEL], natural catalog pose, strap clearly visible, bag resting naturally against hip, hero item unobstructed, [SUPPORT_WARDROBE], [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'standing_shoe_focus',
    label: 'Standing Shoe Focus',
    group: 'on-model',
    compatibleCategories: new Set(['shoes']),
    defaultRenderPath: 'anchor_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL], lower-body ecommerce catalog photograph cropped from knees down or mid-calf depending on shoe style, feet naturally positioned shoulder-width apart, straight-on stance, shoes fully visible and dominant in frame, sharp focus on footwear shape, materials, and proportions, [SUPPORT_WARDROBE], [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'side_step',
    label: 'Side Step',
    group: 'on-model',
    compatibleCategories: new Set(['shoes']),
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL], lower-body ecommerce photograph, side-profile stepping pose, one foot slightly forward, footwear clearly visible from side angle, sharp focus on shape and construction, [SUPPORT_WARDROBE], [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'close_portrait',
    label: 'Close Portrait',
    group: 'on-model',
    compatibleCategories: new Set(['jewelry', 'sunglasses', 'hat', 'scarf']),
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: 'close portrait ecommerce photograph of [MODEL] wearing [HERO_PRODUCT], tight upper-body or face crop depending on category, calm confident expression, the hero item clearly visible and unobstructed, minimal competing styling, premium commercial portrait lighting, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'macro_detail',
    label: 'Macro Detail',
    group: 'product-only',
    compatibleCategories: new Set(['jewelry', 'sunglasses', 'accessory', 'belt']),
    defaultRenderPath: 'product_only_generate',
    needsModel: false,
    strictIsolation: true,
    promptTemplate: 'extreme macro close-up of [HERO_PRODUCT], premium product photography focused on craftsmanship, texture, material quality, surface finish, or shine, shallow depth of field, only the product visible, no people, no body parts, [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'product_front',
    label: 'Product Front',
    group: 'product-only',
    compatibleCategories: new Set(['shoes', 'bag', 'hat', 'sunglasses', 'jewelry', 'accessory']),
    defaultRenderPath: 'product_only_generate',
    needsModel: false,
    promptTemplate: '[HERO_PRODUCT] isolated ecommerce product photograph, front view, perfectly centered, clean studio packshot, sharp details, only the single product visible, no model, no props, subtle natural grounding shadow, [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'product_angle',
    label: 'Product Angle',
    group: 'product-only',
    compatibleCategories: new Set(['shoes', 'bag', 'hat', 'sunglasses', 'jewelry', 'accessory']),
    defaultRenderPath: 'product_only_generate',
    needsModel: false,
    promptTemplate: '[HERO_PRODUCT] isolated ecommerce product photograph, 3/4 angle view, showing depth and dimension, centered composition, sharp details, only the single product visible, no model, no props, subtle natural grounding shadow, [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'hardware_detail',
    label: 'Hardware Detail',
    group: 'product-only',
    compatibleCategories: new Set(['bag', 'belt', 'jewelry']),
    defaultRenderPath: 'product_only_generate',
    needsModel: false,
    strictIsolation: true,
    promptTemplate: 'extreme close-up of hardware details on [HERO_PRODUCT], showing zipper teeth, buckle, clasp, chain, rivet, or metal trim with ultra sharp detail, premium macro product photography, only the product visible, no hands, no model, [BACKGROUND], [CONSISTENCY]',
  },
  // ── New On-Model Shots ──
  {
    id: 'lifestyle_context',
    label: 'Lifestyle Context',
    group: 'on-model',
    compatibleCategories: WEARABLE,
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL], relaxed studio catalog pose with slight weight shift, one hand lightly placed in pocket or at side, composed commercial feel, clean and minimal, not candid, not cinematic, not outdoor, clear focus on hero product, [SUPPORT_WARDROBE], [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'over_shoulder',
    label: 'Over Shoulder',
    group: 'on-model',
    compatibleCategories: APPAREL_PLUS_SHOES,
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL], studio ecommerce photograph, model turned away from camera with head looking back over shoulder, controlled posture, clean framing, clearly showing the back and side profile of the hero product, [SUPPORT_WARDROBE], [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'waist_up_crop',
    label: 'Waist-Up Crop',
    group: 'on-model',
    compatibleCategories: new Set([...APPAREL, 'hat', 'sunglasses', 'scarf', 'jewelry']),
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL], waist-up ecommerce catalog photograph, straight-on camera at chest height, centered composition, arms relaxed naturally, neutral composed expression, clear visibility of neckline, shoulders, fit, and upper garment construction, [SUPPORT_WARDROBE], [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'walking_motion',
    label: 'Walking Motion',
    group: 'on-model',
    compatibleCategories: APPAREL_PLUS_SHOES,
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn by [MODEL], full body studio ecommerce photograph, natural controlled walking step toward camera, feet fully visible in frame, one foot slightly ahead, subtle realistic fabric movement, clean commercial motion, front-facing camera, not dramatic, not editorial, [SUPPORT_WARDROBE], [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'cross_body',
    label: 'Cross-Body',
    group: 'on-model',
    compatibleCategories: new Set(['bag']),
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: '[HERO_PRODUCT] worn cross-body by [MODEL], natural upright studio pose, strap clearly crossing torso from shoulder to opposite hip, bag resting visibly at hip, bag clearly the hero item, [SUPPORT_WARDROBE], [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'wrist_shot',
    label: 'Wrist Shot',
    group: 'on-model',
    compatibleCategories: new Set(['jewelry', 'accessory']),
    defaultRenderPath: 'reference_generate',
    needsModel: true,
    promptTemplate: 'close-up ecommerce photograph of [MODEL] wrist and hand wearing [HERO_PRODUCT], elegant natural hand pose, fingers relaxed, accessory clearly visible as hero piece, accurate scale, minimal competing styling, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
  },
  // ── New Product-Only Shots ──
  {
    id: 'on_surface',
    label: 'On Surface',
    group: 'product-only',
    compatibleCategories: ALL_CATEGORIES,
    defaultRenderPath: 'product_only_generate',
    needsModel: false,
    promptTemplate: '[HERO_PRODUCT] placed alone on a clean minimal studio surface, single product only, no props, no extra items, no model, subtle natural contact shadow beneath product, premium ecommerce product photography, [BACKGROUND], [CONSISTENCY]',
  },
  {
    id: 'clean_flat_lay',
    label: 'Clean Flat Lay',
    group: 'product-only',
    compatibleCategories: ALL_CATEGORIES,
    defaultRenderPath: 'product_only_generate',
    needsModel: false,
    promptTemplate: '[HERO_PRODUCT] alone in a top-down flat lay ecommerce photograph, centered in frame with clean negative space, no props, no accessories, no additional items, no model, premium clean commercial styling, [BACKGROUND], [CONSISTENCY]',
  },
  // ── Internal Identity Anchor (not user-selectable) ──
  {
    id: 'identity_anchor',
    label: 'Identity Anchor',
    group: 'on-model',
    compatibleCategories: WEARABLE,
    defaultRenderPath: 'anchor_generate',
    needsModel: true,
    promptTemplate: 'professional ecommerce fashion photograph showing a complete styled look from collarbone to feet, no head or face visible, [HERO_PRODUCT] worn as the hero item, [SUPPORT_WARDROBE], upright front-facing stance, arms relaxed naturally, centered composition, accurate fit and proportions, premium clean studio catalog quality, [LIGHTING], [BACKGROUND], [CONSISTENCY]',
    categoryOverrides: {
      shoes: 'Professional catalog photograph from waist down — NO head, NO face visible. The body wears [HERO_PRODUCT] as the hero footwear, [SUPPORT_WARDROBE]. Standing straight, feet hip-width apart, footwear clearly visible, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
      bag: 'Professional catalog photograph from neck down — NO head, NO face visible, cropped at collarbone. One hand holding [HERO_PRODUCT] naturally at side, the bag clearly visible as hero item, [SUPPORT_WARDROBE], [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
      hat: 'Professional catalog photograph showing [HERO_PRODUCT] placed on a minimal display stand or form, NO human head, NO face, the headwear shown as a standalone product with styling context, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
      sunglasses: 'Professional catalog photograph showing [HERO_PRODUCT] placed on a minimal display or flat surface, NO human face, NO head, the eyewear shown as a standalone product, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
      jewelry: 'Professional catalog close-up of [HERO_PRODUCT] on a minimal display form or surface, NO face, NO head, NO skin beyond what is needed for context, the jewelry clearly visible, [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]',
    },
  },
];

export function getCompatibleShots(category: ProductCategory, hasModel: boolean): ShotDefinition[] {
  return SHOT_DEFINITIONS.filter(shot => {
    // Never show identity_anchor in the shot picker — it's internal-only
    if (shot.id === 'identity_anchor') return false;
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

/** Check if a shot has strict isolation (no props allowed) */
export function isStrictIsolationShot(id: CatalogShotId): boolean {
  const def = getShotDefinition(id);
  return def?.strictIsolation === true;
}

// ────────────────────────────────────────────────
// 8. Anchor Shot Resolver
// ────────────────────────────────────────────────

export function getAnchorShotId(category: ProductCategory, hasModel: boolean): CatalogShotId {
  if (!hasModel) return 'front_flat';
  // Always use the internal identity anchor for on-model — face-first strategy
  return 'identity_anchor';
}

// ────────────────────────────────────────────────
// 9. Render Path Classifier
// ────────────────────────────────────────────────

const EDIT_COMPATIBLE_FROM_ANCHOR: Record<string, Set<CatalogShotId>> = {
  identity_anchor: new Set(['detail_closeup', 'hands_detail', 'zoom_detail']),
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
  backgroundHex?: string;
}

export function assemblePrompt(input: PromptAssemblyInput): string {
  const { productTitle, productCategory, modelProfile, supportWardrobePrompt, backgroundPrompt, lightingPrompt, shotDef, renderPath, backgroundHex } = input;

  // Pick the right template — category override or default
  let template = shotDef.categoryOverrides?.[productCategory] || shotDef.promptTemplate;

  // Choose the right consistency block based on whether this shot needs a model
  const consistencyBlock = shotDef.needsModel ? CONSISTENCY_BLOCK_MODEL : CONSISTENCY_BLOCK_PRODUCT;

  // Ghost mannequin override: force pure white void, strip all shadow language
  const effectiveBackground = shotDef.id === 'ghost_mannequin'
    ? 'pure white (#FFFFFF) infinite void background, absolutely no shadow, no surface, no floor, no gradients'
    : backgroundPrompt;

  // ── Determine if this is the faceless anchor shot ──
  const isAnchorShot = shotDef.id === 'identity_anchor';
  // Derivative on-model shots: use explicit wardrobe text (single-reference, no anchor image)
  const isDerivativeOnModel = !isAnchorShot && shotDef.needsModel && renderPath === 'reference_generate';
  const effectiveWardrobe = supportWardrobePrompt;

  // For edit paths, wrap differently
  if (renderPath === 'anchor_edit') {
    return `Adjust the framing to show: ${template
      .replace('[HERO_PRODUCT]', productTitle)
      .replace('[MODEL]', modelProfile)
      .replace('[SUPPORT_WARDROBE]', supportWardrobePrompt)
      .replace('[BACKGROUND]', effectiveBackground)
      .replace('[LIGHTING]', lightingPrompt)
      .replace('[QUALITY]', QUALITY_BLOCK)
      .replace('[CONSISTENCY]', consistencyBlock)
    }. Keep the model identity, outfit, background, and lighting exactly the same.`;
  }

  // Standard generation prompt (structured: Subject + Action + Environment + Aesthetics)
  let prompt = template
    .replace('[HERO_PRODUCT]', productTitle)
    .replace('[MODEL]', modelProfile)
    .replace('[SUPPORT_WARDROBE]', effectiveWardrobe)
    .replace('[BACKGROUND]', effectiveBackground)
    .replace('[LIGHTING]', lightingPrompt)
    .replace('[QUALITY]', QUALITY_BLOCK)
    .replace('[CONSISTENCY]', consistencyBlock);

  // ── IMAGE ROLE ASSIGNMENT — differs by phase ──
  if (isAnchorShot) {
    // FACELESS ANCHOR: product-only input, no face involved
    prompt += '\nIMAGE ROLE ASSIGNMENT:';
    prompt += '\n- Image 1 (PRODUCT IMAGE): This is the GARMENT/PRODUCT SOURCE. Apply this exact product onto a headless body form.';
    prompt += '\nCRITICAL: Generate from collarbone/neck DOWN only. Absolutely NO head, NO face, NO hair visible. The image must be cropped at the collarbone with NO facial features whatsoever.';
    prompt += '\nNO FACE RULE: This is a faceless outfit photograph. Do NOT generate any head, face, eyes, mouth, nose, chin, or hair. The top of the frame starts at the collarbone/shoulder line.';
  } else if (modelProfile && modelProfile !== 'no model' && shotDef.needsModel) {
    // DERIVATIVE ON-MODEL: dual-reference system — anchor image (Image 1) + model identity (Image 2)
    prompt += '\nIMAGE ROLE ASSIGNMENT (TWO REFERENCES):';
    prompt += '\n- Image 1 (ANCHOR REFERENCE): This shows the model ALREADY WEARING the correct product. This is your PRIMARY visual truth. Replicate the EXACT outfit — same garment, same colors, same textures, same patterns, same fit, same product construction. Do NOT change, recolor, or replace ANY part of the clothing shown in Image 1.';
    prompt += '\n- Image 2 (IDENTITY BACKUP): Face/identity source for maximum face consistency. Replicate this person\'s face, facial structure, skin tone, hair color, and hair style exactly.';
    prompt += '\nDUAL-REF PRIORITY: Image 1 is the DOMINANT reference for the outfit/product. Image 2 is ONLY for face identity backup. If there is any conflict, Image 1 wins for clothing and Image 2 wins for face.';
    prompt += '\nFACE QUALITY: Render the model\'s face with maximum photorealistic resolution — sharp defined facial features, visible skin texture and pores, detailed iris with catchlights, natural lip detail, individual eyebrow hairs, realistic under-eye area. Do NOT blur, smooth, soften, airbrush, or distort any facial feature.';
    prompt += '\nOUTFIT FIDELITY: The model MUST wear the EXACT same product as shown in Image 1 — same colors, same fabric, same pattern, same construction. Do NOT invent a different outfit. Do NOT change colors. Do NOT add or remove accessories not shown in Image 1.';
    prompt += '\nSINGLE SUBJECT RULE: There is EXACTLY ONE person in this image — the person from the references. Do NOT add a second person, do NOT show a reflection, do NOT create a mirror image, do NOT split the frame into multiple exposures, do NOT duplicate the body or limbs. ONE single human subject, ONE single captured moment.';
    prompt += '\nSTUDIO CATALOG RULES: Camera is ALWAYS straight-on at chest height, perfectly level, never tilted up or down. Camera distance is fixed: full body = head to feet with 10% padding top and bottom. The model stands centered in frame on the same spot every shot. Pose is MINIMAL and CONTROLLED — this is e-commerce catalog photography like ASOS or Zalando, NOT editorial, NOT lifestyle, NOT fashion show. Expression: neutral composed or slight natural smile. NO dramatic gestures, NO fashion editorial energy, NO lifestyle mood, NO hand on hip, NO wind-blown hair, NO looking away from camera (unless back view). Background must be PERFECTLY UNIFORM with zero visible texture or gradient.';
  }

  // GLOBAL lighting rule — applied to ALL shots (model and product-only)
  prompt += '\nLIGHTING RULE: Use ONLY controlled even studio lighting. NO sun flares, NO lens flares, NO window light, NO natural outdoor lighting, NO warm color casts, NO golden hour effects.';

  // Background color enforcement for all shots
  if (backgroundHex) {
    prompt += `\nBACKGROUND COLOR: The background MUST be exactly ${backgroundHex} — uniform, seamless, no gradients, no color shifts, no hue variation.`;
  }

  // Product-only shots: enforce single-product + no-people rule
  if (shotDef.group === 'product-only') {
    prompt += '\nIMPORTANT: Show ONLY the specified hero product. Do NOT add any other clothing, accessories, shoes, bags, or items that are not explicitly described. NO people, NO model, NO human figure, NO face, NO hands, NO body parts, NO skin.';
    // Category-aware: shoes can be a natural pair, everything else is single item
    const pairCategories: ProductCategory[] = ['shoes'];
    if (!pairCategories.includes(productCategory)) {
      prompt += ' Show exactly ONE single copy of the product — do NOT duplicate it, do NOT show front and back together, do NOT merge two views into one image.';
    }
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
  shotGroup?: 'on-model' | 'product-only',
): ImageRef[] {
  // Product-only shots: only product reference, no model
  if (shotGroup === 'product-only') {
    const refs: ImageRef[] = [{ url: productImageUrl, role: 'product' }];
    if (anchorImageUrl) refs.push({ url: anchorImageUrl, role: 'anchor' });
    return refs;
  }

  // On-model shots: ONLY the model identity image for face lock
  // Outfit consistency comes from text prompts, not image references
  const refs: ImageRef[] = [];
  if (modelRefUrl) refs.push({ url: modelRefUrl, role: 'model' });
  return refs;
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
    backgroundHex: bg.hex,
    lightingPrompt: getLightingPrompt(style.lightingId),
    consistencyBlock: CONSISTENCY_BLOCK_MODEL,
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
