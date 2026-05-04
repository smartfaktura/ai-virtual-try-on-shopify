/**
 * Category-aware product specification placeholders.
 * Each category maps to a helpful placeholder hint shown in the textarea.
 */

/**
 * Sanitize user input: strip control characters, limit length.
 */
export function sanitizeSpecInput(val: string, maxLen = 500): string {
  return val.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, maxLen);
}

// ── Category → Placeholder mapping ──

const CATEGORY_PLACEHOLDERS: Record<string, string> = {
  // Furniture
  'furniture': 'e.g. 180×80×75cm, oak wood, matte finish, seats 4',
  // Garments
  'garments': 'e.g. size M, regular fit, mid-thigh length, 100% cotton',
  'dresses': 'e.g. size S, A-line, knee-length, silk fabric',
  'hoodies': 'e.g. size L, oversized fit, drop shoulders, fleece lined',
  'jeans': 'e.g. size 32/32, slim fit, mid-rise, stretch denim',
  'jackets': 'e.g. size M, bomber style, cropped length, nylon shell',
  'activewear': 'e.g. size S, compression fit, high-waist, moisture-wicking',
  'swimwear': 'e.g. size M, high-cut leg, adjustable straps',
  'lingerie': 'e.g. size 34B, underwire, lace trim',
  'kidswear': 'e.g. age 4-5, relaxed fit, organic cotton',
  // Footwear
  'sneakers': 'e.g. EU 42 / US 9, chunky sole, white/grey colorway',
  'shoes': 'e.g. EU 40 / US 7, leather upper, 2cm heel',
  'boots': 'e.g. EU 41, 20cm shaft height, 5cm block heel, suede',
  'high-heels': 'e.g. EU 38, 10cm stiletto heel, patent leather, pointed toe',
  // Bags
  'bags-accessories': 'e.g. 30×25×12cm, leather, adjustable 60cm strap',
  'backpacks': 'e.g. 45×30×15cm, 25L capacity, padded laptop compartment',
  'wallets-cardholders': 'e.g. 11×8cm, bifold, 6 card slots, pebbled leather',
  // Accessories
  'belts': 'e.g. 100cm length, 3.5cm width, brushed silver buckle',
  'scarves': 'e.g. 180×70cm, cashmere, fringed edges',
  'hats-small': 'e.g. 7cm brim, 12cm crown height, wool felt',
  // Watches
  'watches': 'e.g. 40mm case, 20mm band width, 12mm thickness, steel',
  // Jewelry
  'jewellery-necklaces': 'e.g. 45cm chain, 2×1.5cm pendant, 18k gold plated',
  'jewellery-rings': 'e.g. ring size 7 / 17mm, 6mm stone, 3mm band width',
  'jewellery-bracelets': 'e.g. 18cm length, 8mm width, sterling silver',
  'jewellery-earrings': 'e.g. 4cm drop length, 1.5cm width, crystal studs',
  // Eyewear
  'eyewear': 'e.g. 52mm lens, 18mm bridge, 140mm temple, acetate frame',
  // Fragrance
  'fragrance': 'e.g. 50ml / 1.7 fl oz, 15cm tall rectangular bottle, gold cap',
  // Beauty
  'beauty-skincare': 'e.g. 30ml pump bottle, frosted glass, dropper cap',
  'makeup-lipsticks': 'e.g. 3.5g, twist-up tube, metallic rose packaging',
  // Food & Beverage
  'food': 'e.g. 250g, 15×20cm box, kraft paper packaging',
  'beverages': 'e.g. 330ml aluminum can, 500ml glass bottle',
  // Home
  'home-decor': 'e.g. 30×25×12cm, ceramic, matte glaze finish',
  // Tech
  'tech-devices': 'e.g. 6.1" screen, 14.6×7.1×0.8cm, 174g, aluminum body',
  // Supplements
  'supplements-wellness': 'e.g. 60 capsules, 12cm tall container, white label',
};

const DEFAULT_PLACEHOLDER = 'e.g. 30×20×10cm, matte black finish, round shape';

/**
 * Get a category-aware placeholder hint for the specs textarea.
 */
export function getCategoryPlaceholder(category: string | undefined | null): string {
  if (!category) return DEFAULT_PLACEHOLDER;
  return CATEGORY_PLACEHOLDERS[category] || DEFAULT_PLACEHOLDER;
}

/**
 * Get a short category label for UI display.
 */
const CATEGORY_LABELS: Record<string, string> = {
  'furniture': 'Furniture',
  'garments': 'Garment', 'dresses': 'Dress', 'hoodies': 'Hoodie',
  'jeans': 'Jeans', 'jackets': 'Jacket', 'activewear': 'Activewear',
  'swimwear': 'Swimwear', 'lingerie': 'Lingerie', 'kidswear': 'Kidswear',
  'sneakers': 'Sneakers', 'shoes': 'Shoes', 'boots': 'Boots', 'high-heels': 'Heels',
  'bags-accessories': 'Bag', 'backpacks': 'Backpack',
  'wallets-cardholders': 'Wallet', 'belts': 'Belt', 'scarves': 'Scarf',
  'hats-small': 'Hat', 'watches': 'Watch',
  'jewellery-necklaces': 'Necklace', 'jewellery-rings': 'Ring',
  'jewellery-bracelets': 'Bracelet', 'jewellery-earrings': 'Earring',
  'eyewear': 'Eyewear', 'fragrance': 'Fragrance',
  'beauty-skincare': 'Skincare', 'makeup-lipsticks': 'Makeup',
  'food': 'Food', 'beverages': 'Beverage',
  'home-decor': 'Home Décor', 'tech-devices': 'Tech Device',
  'supplements-wellness': 'Supplement',
};

export function getCategoryLabel(category: string | undefined | null): string {
  if (!category) return 'Product';
  return CATEGORY_LABELS[category] || 'Product';
}

/**
 * Build a prompt-friendly specification line from the user's free-text specs.
 * Returns the raw content WITHOUT the "Product specifications:" prefix.
 */
export function buildSpecsPromptLine(specsText: string | undefined): string {
  if (!specsText) return '';
  return sanitizeSpecInput(specsText, 500);
}
