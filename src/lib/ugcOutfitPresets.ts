// Curated outfit presets for the Selfie/UGC workflow.
// Sent to the backend as `outfit_phrase` and injected into the OUTFIT STYLING block.

export interface UgcOutfitPreset {
  id: string;
  label: string;
  vibe: string;
  phrase: string; // empty string = no override (Auto)
  recommended?: boolean;
}

export const UGC_OUTFIT_PRESETS: UgcOutfitPreset[] = [
  {
    id: 'auto',
    label: 'Auto',
    vibe: 'Smart pick for the scene',
    phrase: '',
    recommended: true,
  },
  {
    id: 'bright-minimal-activewear',
    label: 'Bright Minimal Activewear',
    vibe: 'Crisp white sport set',
    phrase: 'wearing a fitted bright white minimal activewear set, clean lines, no visible logos',
  },
  {
    id: 'soft-beige-loungewear',
    label: 'Soft Beige Loungewear',
    vibe: 'Tonal beige knit set',
    phrase: 'wearing a tonal soft beige ribbed loungewear set, relaxed and quiet',
  },
  {
    id: 'crisp-white-shirt',
    label: 'Crisp White Shirt',
    vibe: 'White shirt, light denim',
    phrase: 'wearing a crisp oversized white cotton shirt with light-wash straight jeans',
  },
  {
    id: 'black-tee-tailored',
    label: 'Black Tee Tailored',
    vibe: 'Black tee, black trousers',
    phrase: 'wearing a fitted plain black t-shirt tucked into tailored black trousers',
  },
  {
    id: 'cream-linen-set',
    label: 'Cream Linen Set',
    vibe: 'Soft cream linen co-ord',
    phrase: 'wearing a soft cream linen shirt and matching wide-leg linen trousers',
  },
  {
    id: 'oversized-grey-knit',
    label: 'Oversized Grey Knit',
    vibe: 'Grey knit, light denim',
    phrase: 'wearing an oversized soft grey fine-knit sweater with light-wash straight jeans',
  },
  {
    id: 'camel-trench-minimal',
    label: 'Camel Trench Minimal',
    vibe: 'Camel coat, white tee',
    phrase: 'wearing a clean camel trench coat over a plain white t-shirt and slim dark jeans',
  },
];

/**
 * Resolve the outfit phrase to send to the backend (non-wearing interactions).
 * Returns undefined when:
 *  - the user picked "auto" (let the scene-default styling apply)
 *  - the interaction is "wearing" (use pair-mode resolver instead)
 */
export function resolveUgcOutfitPhrase(
  outfitId: string | undefined,
  interactionPhrase: string | undefined,
): string | undefined {
  if (!outfitId || outfitId === 'auto') return undefined;
  if (isWearingInteraction(interactionPhrase)) return undefined;
  const preset = UGC_OUTFIT_PRESETS.find(p => p.id === outfitId);
  return preset?.phrase || undefined;
}

/** True when the chosen interaction means the model is already wearing the product. */
export function isWearingInteraction(interactionPhrase: string | undefined): boolean {
  const s = (interactionPhrase || '').toLowerCase();
  return s.includes('wearing') || s.includes('worn ');
}

/** @deprecated Use isWearingInteraction. Kept for backwards compatibility. */
export const isOutfitLockedByInteraction = isWearingInteraction;

// ─────────────────────────────────────────────────────────────────────────────
// PAIR MODE — used when the model is already wearing the product (a top, dress,
// shoes, etc.). We need to dress the *other* slots so the AI doesn't fill
// arbitrary garments.
// ─────────────────────────────────────────────────────────────────────────────

export type ProductSlot = 'top' | 'bottom' | 'shoes' | 'dress' | 'bag' | 'jewellery' | 'eyewear' | 'other';

interface PairPiece {
  bottom?: string;
  top?: string;
  shoes?: string;
  outerwear?: string;
  accessories?: string; // always appended when present
}

export interface UgcPairPreset {
  id: string;
  label: string;
  vibe: string;
  pieces: PairPiece;
  recommended?: boolean;
}

export const UGC_PAIR_PRESETS: UgcPairPreset[] = [
  {
    id: 'auto',
    label: 'Auto Pair',
    vibe: 'Neutral complement',
    pieces: {}, // empty → no override (Auto)
    recommended: true,
  },
  {
    id: 'light-denim',
    label: 'Light Denim',
    vibe: 'Light wash, white sneakers',
    pieces: {
      bottom: 'light-wash straight-leg jeans',
      top: 'a plain crisp white t-shirt',
      shoes: 'clean white minimal sneakers',
      accessories: 'minimal and quiet',
    },
  },
  {
    id: 'tailored-black',
    label: 'Tailored Black',
    vibe: 'Black trousers, black loafers',
    pieces: {
      bottom: 'tailored straight black trousers',
      top: 'a fitted plain black t-shirt',
      shoes: 'polished black leather loafers',
      accessories: 'minimal and quiet',
    },
  },
  {
    id: 'cream-linen',
    label: 'Cream Linen',
    vibe: 'Linen co-ord, tan sandals',
    pieces: {
      bottom: 'wide-leg cream linen trousers',
      top: 'a soft cream linen shirt',
      shoes: 'tan leather minimal sandals',
      accessories: 'minimal and quiet',
    },
  },
  {
    id: 'soft-beige',
    label: 'Soft Beige',
    vibe: 'Beige set, white sneakers',
    pieces: {
      bottom: 'tonal beige relaxed joggers',
      top: 'a tonal beige soft hoodie',
      shoes: 'clean white minimal sneakers',
      accessories: 'minimal and quiet',
    },
  },
  {
    id: 'crisp-white',
    label: 'Crisp White',
    vibe: 'All white, minimal sandals',
    pieces: {
      bottom: 'crisp white wide-leg trousers',
      top: 'a crisp oversized white cotton shirt',
      shoes: 'minimal white leather sandals',
      accessories: 'minimal and quiet',
    },
  },
  {
    id: 'grey-knit',
    label: 'Grey Knit',
    vibe: 'Grey knit, white sneakers',
    pieces: {
      bottom: 'mid-grey straight tailored trousers',
      top: 'an oversized soft grey fine-knit sweater',
      shoes: 'clean white minimal sneakers',
      accessories: 'minimal and quiet',
    },
  },
  {
    id: 'camel-trench',
    label: 'Camel Trench',
    vibe: 'Camel coat, leather boots',
    pieces: {
      bottom: 'slim dark indigo jeans',
      top: 'a plain white t-shirt',
      outerwear: 'a clean camel trench coat',
      shoes: 'polished brown leather ankle boots',
      accessories: 'minimal and quiet',
    },
  },
];

/**
 * Detect which wardrobe slot the product occupies.
 * Used to skip that slot in pair-mode resolver so we don't conflict with the product.
 */
export function detectProductSlot(category?: string, productName?: string): ProductSlot {
  const cat = (category || '').toLowerCase().trim();
  const name = (productName || '').toLowerCase().trim();
  const text = `${cat} ${name}`;

  // Full coverage
  if (/\b(dress|gown|jumpsuit|romper|playsuit|co-?ord|two-?piece set|matching set)\b/.test(text)) return 'dress';

  // Shoes
  if (cat === 'shoes' || /\b(sneaker|trainer|boot|loafer|heel|sandal|mule|pump|oxford|derby|espadrille)s?\b/.test(text)) return 'shoes';

  // Bottoms
  if (/\b(jean|denim|trouser|pant|short|skirt|legging|jogger|chino|culotte)s?\b/.test(text)) return 'bottom';

  // Tops & outerwear
  if (/\b(tee|t-?shirt|shirt|blouse|top|crop|tank|cami|sweater|knit|hoodie|sweatshirt|jacket|blazer|coat|cardigan|trench|bomber|parka|vest|polo|tunic|turtleneck)\b/.test(text)) return 'top';

  // Bags
  if (cat.includes('bag') || /\b(bag|tote|clutch|backpack|crossbody|handbag|purse|wallet|cardholder)\b/.test(text)) return 'bag';

  // Jewellery
  if (cat.includes('jewel') || /\b(necklace|earring|bracelet|ring|pendant|chain)s?\b/.test(text)) return 'jewellery';

  // Eyewear
  if (cat === 'eyewear' || /\b(sunglass|glasses|eyewear|optical)\b/.test(text)) return 'eyewear';

  return 'other';
}

/**
 * Build the pair-mode outfit phrase for the chosen preset, skipping the slot
 * the product itself occupies. Returns undefined for "auto" or empty preset.
 */
export function resolveUgcPairPhrase(
  presetId: string | undefined,
  productSlot: ProductSlot,
): string | undefined {
  if (!presetId || presetId === 'auto') return undefined;
  const preset = UGC_PAIR_PRESETS.find(p => p.id === presetId);
  if (!preset) return undefined;

  const { bottom, top, shoes, outerwear, accessories } = preset.pieces;
  const parts: string[] = [];

  // Skip the slot the product occupies
  if (productSlot === 'dress') {
    // Dress/jumpsuit covers torso + legs → only shoes + outerwear + accessories
    if (outerwear) parts.push(outerwear);
    if (shoes) parts.push(shoes);
  } else if (productSlot === 'top') {
    if (bottom) parts.push(bottom);
    if (outerwear) parts.push(outerwear);
    if (shoes) parts.push(shoes);
  } else if (productSlot === 'bottom') {
    if (top) parts.push(top);
    if (outerwear) parts.push(outerwear);
    if (shoes) parts.push(shoes);
  } else if (productSlot === 'shoes') {
    if (top) parts.push(top);
    if (bottom) parts.push(bottom);
    if (outerwear) parts.push(outerwear);
  } else {
    // bag / jewellery / eyewear / other → full pair (every slot)
    if (top) parts.push(top);
    if (bottom) parts.push(bottom);
    if (outerwear) parts.push(outerwear);
    if (shoes) parts.push(shoes);
  }

  if (parts.length === 0) return undefined;
  const accLine = accessories ? `, accessories ${accessories}` : '';
  return `paired with ${parts.join(', ')}${accLine}`;
}
