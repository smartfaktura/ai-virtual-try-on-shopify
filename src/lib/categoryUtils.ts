import type { Product, TemplateCategory } from '@/types';

/**
 * Keyword-category pairs ordered specific-first.
 * The first match wins, so subcategories (e.g. sneakers) must precede parents (shoes).
 */
const DETECTION_RULES: [string[], TemplateCategory][] = [
  // Jewellery
  [['necklace', 'pendant', 'choker', 'lariat', 'chain necklace'], 'jewellery-necklaces' as TemplateCategory],
  [['earring', 'stud', 'hoop', 'drop earring', 'huggie', 'ear cuff'], 'jewellery-earrings' as TemplateCategory],
  [['bracelet', 'bangle', 'cuff bracelet', 'charm bracelet', 'tennis bracelet'], 'jewellery-bracelets' as TemplateCategory],
  [['ring', 'signet', 'band ring', 'cocktail ring', 'engagement ring'], 'jewellery-rings' as TemplateCategory],
  [['watch', 'timepiece', 'chronograph', 'wristwatch'], 'watches' as TemplateCategory],
  [['sunglasses', 'glasses', 'eyewear', 'optical', 'aviator', 'spectacles'], 'eyewear' as TemplateCategory],
  // Accessories
  [['backpack', 'rucksack', 'daypack'], 'backpacks' as TemplateCategory],
  [['wallet', 'cardholder', 'card holder', 'card case', 'money clip'], 'wallets-cardholders' as TemplateCategory],
  [['belt', 'waist belt', 'leather belt', 'buckle belt'], 'belts' as TemplateCategory],
  [['scarf', 'shawl', 'wrap', 'bandana', 'neckerchief'], 'scarves' as TemplateCategory],
  // Footwear
  [['sneaker', 'trainer', 'air max', 'nike dunk', 'jordan', 'running shoe'], 'sneakers' as TemplateCategory],
  [['boot', 'ankle boot', 'chelsea boot', 'combat boot', 'hiking boot'], 'boots' as TemplateCategory],
  [['high heel', 'stiletto', 'pump', 'platform heel', 'kitten heel', 'wedge heel'], 'high-heels' as TemplateCategory],
  // Fashion
  [['dress', 'gown', 'maxi dress', 'midi dress', 'sundress', 'cocktail dress'], 'dresses' as TemplateCategory],
  [['hoodie', 'hooded sweatshirt', 'zip-up hoodie', 'pullover hoodie'], 'hoodies' as TemplateCategory],
  [['streetwear', 'graphic tee', 'oversized tee', 'urban wear'], 'streetwear' as TemplateCategory],
  [['jeans', 'denim', 'skinny jeans', 'wide-leg jeans', 'mom jeans'], 'jeans' as TemplateCategory],
  [['jacket', 'blazer', 'bomber', 'puffer', 'windbreaker', 'parka', 'trench coat'], 'jackets' as TemplateCategory],
  [['activewear', 'sportswear', 'yoga', 'gym wear', 'athletic', 'workout', 'legging', 'sports bra'], 'activewear' as TemplateCategory],
  [['swimwear', 'bikini', 'swimsuit', 'swim trunks', 'bathing suit'], 'swimwear' as TemplateCategory],
  [['lingerie', 'bra', 'underwear', 'corset', 'negligee', 'intimates'], 'lingerie' as TemplateCategory],
  [['kids', 'children', 'baby', 'toddler', 'infant', 'kidswear'], 'kidswear' as TemplateCategory],
  // Makeup vs beauty
  [['lipstick', 'mascara', 'foundation', 'concealer', 'blush', 'eyeshadow', 'makeup', 'bronzer', 'highlighter', 'primer', 'eyeliner', 'lip gloss', 'lip liner', 'contour', 'rouge', 'cheek'], 'makeup' as TemplateCategory],
  [['serum', 'moisturizer', 'cleanser', 'toner', 'skincare', 'cream', 'sunscreen', 'essence', 'treatment', 'shampoo', 'conditioner', 'body wash', 'lotion', 'retinol'], 'cosmetics'],
  // Generic parents
  [['sweater', 'shirt', 'apparel', 'pants', 'coat', 'blouse', 'skirt', 'suit', 't-shirt', 'clothing', 'tank', 'jogger', 'shorts', 'top', 'cardigan', 'vest', 'romper', 'jumpsuit', 'sweatshirt', 'pullover'], 'clothing'],
  [['perfume', 'cologne', 'fragrance', 'eau de', 'parfum'], 'cosmetics'],
  [['cereal', 'granola', 'chocolate', 'coffee', 'tea', 'honey', 'jam', 'sauce', 'snack', 'beverage', 'juice', 'food'], 'food'],
  [['candle', 'vase', 'planter', 'pillow', 'blanket', 'lamp', 'clock', 'frame', 'mirror', 'rug', 'decor', 'home', 'interior', 'ceramic'], 'home'],
  [['vitamin', 'supplement', 'capsule', 'protein', 'collagen', 'probiotic', 'omega', 'wellness', 'greens', 'superfood', 'gummy'], 'supplements'],
  [['shoe', 'sandal', 'loafer', 'slipper', 'footwear', 'mule', 'clog', 'oxford'], 'universal'],
  [['bag', 'handbag', 'purse', 'clutch', 'tote', 'briefcase', 'satchel', 'crossbody'], 'universal'],
  [['phone', 'laptop', 'headphone', 'earbuds', 'speaker', 'charger', 'tablet', 'keyboard', 'tech', 'gadget'], 'universal'],
  [['dog', 'cat', 'pet', 'collar', 'leash', 'harness'], 'universal'],
  [['ball', 'racket', 'helmet', 'bike', 'camping', 'tent', 'fitness', 'gym', 'sport'], 'universal'],
  [['toy', 'puzzle', 'game', 'doll', 'plush', 'figurine', 'baby'], 'universal'],
  [['notebook', 'pen', 'pencil', 'planner', 'desk', 'office', 'stationery'], 'universal'],
];

/**
 * Detects the product category based on product type and tags
 */
export function detectProductCategory(product: Product): TemplateCategory | null {
  const type = product.productType.toLowerCase();
  const tags = product.tags.map(t => t.toLowerCase()).join(' ');
  const combined = `${type} ${tags}`;

  for (const [keywords, category] of DETECTION_RULES) {
    if (keywords.some(kw => combined.includes(kw))) return category;
  }

  return null;
}

/**
 * Human-readable category labels
 */
export const categoryLabels: Partial<Record<TemplateCategory, string>> = {
  clothing: 'Clothing',
  cosmetics: 'Cosmetics',
  food: 'Food & Beverage',
  home: 'Home & Interior',
  supplements: 'Supplements',
  universal: 'Universal',
  backpacks: 'Backpacks',
  'wallets-cardholders': 'Wallets & Cardholders',
  belts: 'Belts',
  scarves: 'Scarves',
  'jewellery-necklaces': 'Jewellery – Necklaces',
  'jewellery-earrings': 'Jewellery – Earrings',
  'jewellery-bracelets': 'Jewellery – Bracelets',
  'jewellery-rings': 'Jewellery – Rings',
  watches: 'Watches',
  dresses: 'Dresses',
  hoodies: 'Hoodies',
  streetwear: 'Streetwear',
  sneakers: 'Sneakers',
  boots: 'Boots',
  'high-heels': 'High Heels',
  activewear: 'Activewear',
  eyewear: 'Eyewear',
  swimwear: 'Swimwear',
  lingerie: 'Lingerie',
  kidswear: 'Kidswear',
  jeans: 'Jeans',
  jackets: 'Jackets',
  makeup: 'Makeup',
};

/**
 * Get unique categories from a list of products
 */
export function getProductCategories(products: Product[]): Set<TemplateCategory> {
  const categories = new Set<TemplateCategory>();
  products.forEach(p => {
    const cat = detectProductCategory(p);
    if (cat) categories.add(cat);
  });
  return categories;
}

/**
 * Check if products have mixed categories
 */
export function hasMixedCategories(products: Product[]): boolean {
  const categories = getProductCategories(products);
  return categories.size > 1;
}
