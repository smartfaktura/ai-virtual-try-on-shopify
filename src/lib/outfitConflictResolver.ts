// ── Outfit conflict resolver ──
// Given a product's category/garmentType, return which slots are auto-locked
// (filled by product), which are hidden (don't make sense), and which remain
// available for the user to fill.

import type { OutfitConfig } from '@/components/app/product-images/types';

export type OutfitSlotKey =
  | 'outerwear' | 'top' | 'bottom' | 'dress' | 'shoes'
  | 'bag' | 'hat' | 'eyewear' | 'belt' | 'watch' | 'jewelry' | 'coverUp';

export interface ConflictResolution {
  /** Slot the product fills automatically — locked, shown with thumbnail. */
  lockedSlot: OutfitSlotKey | null;
  /** Slots that should NOT appear in the UI at all (silent). */
  hiddenSlots: Set<OutfitSlotKey>;
  /** Slots the user can configure freely. */
  availableSlots: OutfitSlotKey[];
  /** When true, the entire outfit panel should hide (non-fashion product). */
  hideOutfitPanel: boolean;
}

const ALL_SLOTS: OutfitSlotKey[] = [
  'outerwear', 'top', 'bottom', 'dress', 'shoes',
  'bag', 'hat', 'eyewear', 'belt', 'watch', 'jewelry', 'coverUp',
];

const ACCESSORY_SLOTS: OutfitSlotKey[] = ['bag', 'hat', 'eyewear', 'belt', 'watch', 'jewelry'];

function build(lockedSlot: OutfitSlotKey | null, hiddenSlots: OutfitSlotKey[]): ConflictResolution {
  const hidden = new Set(hiddenSlots);
  if (lockedSlot) hidden.delete(lockedSlot); // never hide the locked one
  const available = ALL_SLOTS.filter(s => s !== lockedSlot && !hidden.has(s));
  return { lockedSlot, hiddenSlots: hidden, availableSlots: available, hideOutfitPanel: false };
}

/** Lower-case match against a list of keywords. */
function match(text: string, keywords: string[]): boolean {
  return keywords.some(k => text.includes(k));
}

/**
 * Resolve based on product category + garment type.
 * @param category   ProductAnalysis.category (e.g. 'garments', 'shoes', 'bags-accessories')
 * @param garmentType  ProductAnalysis.garmentType (e.g. 'crop top', 'wide-leg trousers')
 */
export function resolveOutfitConflicts(
  category?: string,
  garmentType?: string,
): ConflictResolution {
  const cat = (category || '').toLowerCase();
  const gt = (garmentType || '').toLowerCase();

  // Non-fashion → hide the whole panel
  const nonFashion = ['fragrance', 'beauty-skincare', 'makeup-lipsticks', 'home-decor', 'furniture', 'tech-devices', 'food', 'beverages', 'supplements-wellness'];
  if (nonFashion.includes(cat)) {
    return { lockedSlot: null, hiddenSlots: new Set(ALL_SLOTS), availableSlots: [], hideOutfitPanel: true };
  }

  // ── Full-body (dress / jumpsuit / one-piece) ──
  if (match(gt, ['dress', 'jumpsuit', 'romper', 'one-piece', 'overalls', 'gown', 'kaftan', 'kimono', 'maxi dress', 'mini dress'])) {
    return build('dress', ['top', 'bottom']);
  }

  // ── Lingerie set → top + bottom = product, hide dress + outerwear ──
  if (cat === 'lingerie' && match(gt, ['set', 'matching'])) {
    // lock the more "meaningful" top slot; treat bottom as also part of product via hidden
    return { lockedSlot: 'top', hiddenSlots: new Set(['dress', 'outerwear', 'bottom']), availableSlots: ['shoes', ...ACCESSORY_SLOTS], hideOutfitPanel: false };
  }

  // ── Swimwear ── beach/pool context: hide all clothing slots + shoes (barefoot default), accessories + cover-ups only
  if (cat === 'swimwear' || match(gt, ['swimsuit', 'swimwear', 'bikini', 'one-piece'])) {
    const swimAvail: OutfitSlotKey[] = ['coverUp', ...ACCESSORY_SLOTS];
    if (match(gt, ['one-piece', 'monokini'])) {
      const r = build('dress', ['top', 'bottom', 'outerwear', 'shoes']);
      return { ...r, availableSlots: [...r.availableSlots.filter(s => s !== 'coverUp' ? true : true)] };
    }
    if (match(gt, ['bikini top', 'top'])) {
      return { lockedSlot: 'top', hiddenSlots: new Set(['dress', 'outerwear', 'bottom', 'shoes']), availableSlots: swimAvail, hideOutfitPanel: false };
    }
    if (match(gt, ['bikini bottom', 'bottom'])) {
      return { lockedSlot: 'bottom', hiddenSlots: new Set(['dress', 'outerwear', 'top', 'shoes']), availableSlots: swimAvail, hideOutfitPanel: false };
    }
    // Generic bikini → treat as set, lock top, hide bottom + shoes
    return { lockedSlot: 'top', hiddenSlots: new Set(['dress', 'outerwear', 'bottom', 'shoes']), availableSlots: swimAvail, hideOutfitPanel: false };
  }

  // ── Outerwear ──
  if (match(gt, ['jacket', 'blazer', 'coat', 'parka', 'cardigan', 'bomber', 'trench', 'puffer', 'overcoat', 'gilet', 'windbreaker', 'anorak', 'duster'])) {
    return build('outerwear', []);
  }

  // ── Tops ──
  if (match(gt, ['crop top', 'tee', 't-shirt', 'shirt', 'blouse', 'hoodie', 'sweater', 'tank', 'vest', 'polo', 'tunic', 'turtleneck', 'henley', 'pullover', 'knit', 'sweatshirt', 'jersey', 'fleece', 'flannel', 'bodysuit'])) {
    return build('top', []);
  }

  // ── Bottoms ──
  if (match(gt, ['skirt', 'shorts', 'trousers', 'pants', 'leggings', 'jeans', 'wide-leg', 'culottes', 'joggers', 'sweatpants', 'chinos', 'cargo'])) {
    return build('bottom', []);
  }

  // ── Shoes ──
  if (cat === 'shoes' || cat === 'sneakers' || cat === 'boots' || cat === 'high-heels' ||
      match(gt, ['sneaker', 'boot', 'heel', 'sandal', 'loafer', 'mule', 'slipper', 'oxford', 'derby', 'trainer', 'shoe', 'espadrille', 'wedge', 'pump'])) {
    return build('shoes', []);
  }

  // ── Bag / hat / jewelry / eyewear / belt / watch ──
  if (cat === 'bags-accessories' || cat === 'backpacks' || cat === 'wallets-cardholders' || match(gt, ['bag', 'tote', 'clutch', 'crossbody', 'backpack', 'handbag', 'purse'])) {
    return build('bag', []);
  }
  if (cat === 'hats-small' || match(gt, ['hat', 'cap', 'beanie', 'beret', 'fedora'])) {
    return build('hat', []);
  }
  if (cat === 'eyewear' || match(gt, ['sunglasses', 'glasses', 'eyewear', 'optical'])) {
    return build('eyewear', []);
  }
  if (cat === 'belts' || match(gt, ['belt'])) {
    return build('belt', []);
  }
  if (cat === 'watches' || match(gt, ['watch', 'timepiece'])) {
    return build('watch', []);
  }
  if (cat?.startsWith('jewellery') || match(gt, ['necklace', 'earring', 'bracelet', 'ring', 'pendant', 'jewellery', 'jewelry'])) {
    return build('jewelry', []);
  }

  // ── Default: no lock, all slots available ──
  return { lockedSlot: null, hiddenSlots: new Set(), availableSlots: ALL_SLOTS, hideOutfitPanel: false };
}

/**
 * Sanitize a preset config when loading: drop slots that conflict with the
 * current product (e.g. preset has a 'top' but user's product IS a top).
 */
export function applyPresetWithLocks(preset: OutfitConfig, resolution: ConflictResolution): OutfitConfig {
  const cleaned: OutfitConfig = { ...preset };
  if (resolution.lockedSlot) delete (cleaned as Record<string, unknown>)[resolution.lockedSlot];
  for (const slot of resolution.hiddenSlots) {
    delete (cleaned as Record<string, unknown>)[slot];
  }
  return cleaned;
}
