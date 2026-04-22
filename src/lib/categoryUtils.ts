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
  [['jeans', 'denim', 'skinny jeans', 'wide-leg jeans', 'mom jeans'], 'jeans' as TemplateCategory],
  [['jacket', 'blazer', 'bomber', 'puffer', 'windbreaker', 'parka', 'trench coat'], 'jackets' as TemplateCategory],
  [['activewear', 'sportswear', 'yoga', 'gym wear', 'athletic', 'workout', 'legging', 'sports bra'], 'activewear' as TemplateCategory],
  [['swimwear', 'bikini', 'swimsuit', 'swim trunks', 'bathing suit'], 'swimwear' as TemplateCategory],
  [['lingerie', 'bra', 'underwear', 'corset', 'negligee', 'intimates'], 'lingerie' as TemplateCategory],
  [['kids', 'children', 'baby', 'toddler', 'infant', 'kidswear'], 'kidswear' as TemplateCategory],
  // Makeup vs beauty
  [['lipstick', 'mascara', 'foundation', 'concealer', 'blush', 'eyeshadow', 'makeup', 'bronzer', 'highlighter', 'primer', 'eyeliner', 'lip gloss', 'lip liner', 'contour', 'rouge', 'cheek'], 'makeup-lipsticks' as TemplateCategory],
  [['serum', 'moisturizer', 'cleanser', 'toner', 'skincare', 'cream', 'sunscreen', 'essence', 'treatment', 'shampoo', 'conditioner', 'body wash', 'lotion', 'retinol'], 'beauty-skincare' as TemplateCategory],
  // Generic parents
  [['sweater', 'shirt', 'apparel', 'pants', 'coat', 'blouse', 'top', 'shorts', 'clothing', 'tank', 'jogger', 'cardigan', 'vest', 'romper', 'jumpsuit', 'sweatshirt', 'pullover', 'graphic tee', 'oversized tee', 'streetwear', 'urban wear', 'skirt', 'mini skirt', 'maxi skirt', 'midi skirt', 'pleated skirt', 'pencil skirt', 'a-line skirt', 'wrap skirt', 'tulle skirt', 'tennis skirt'], 'garments' as TemplateCategory],
  [['perfume', 'cologne', 'fragrance', 'eau de', 'parfum'], 'fragrance' as TemplateCategory],
  [['coffee', 'tea', 'juice', 'beverage', 'soda', 'wine', 'beer', 'water', 'kombucha', 'smoothie', 'energy drink', 'drink', 'lemonade', 'milk'], 'beverages' as TemplateCategory],
  [['cereal', 'granola', 'chocolate', 'honey', 'jam', 'sauce', 'snack', 'candy', 'chips', 'protein bar', 'cookie', 'food', 'olive oil'], 'food' as TemplateCategory],
  [['sofa', 'couch', 'sectional', 'loveseat', 'armchair', 'recliner', 'dining chair', 'office chair', 'accent chair', 'lounge chair', 'rocking chair', 'folding chair', 'bar stool', 'counter stool', 'stool', 'bench', 'ottoman', 'pouf', 'bean bag', 'dining table', 'coffee table', 'side table', 'end table', 'console table', 'accent table', 'nightstand', 'bedside table', 'desk', 'standing desk', 'writing desk', 'vanity', 'bed frame', 'headboard', 'bunk bed', 'daybed', 'futon', 'mattress', 'crib', 'bookshelf', 'bookcase', 'floating shelf', 'wall shelf', 'shelving unit', 'cabinet', 'filing cabinet', 'display cabinet', 'hutch', 'sideboard', 'buffet', 'credenza', 'dresser', 'chest of drawers', 'wardrobe', 'armoire', 'closet organizer', 'tv stand', 'media console', 'entertainment center', 'shoe rack', 'coat rack', 'wine rack', 'pantry', 'kitchen island', 'bar cart', 'furniture'], 'furniture' as TemplateCategory],
  [['candle', 'vase', 'planter', 'pillow', 'blanket', 'lamp', 'clock', 'frame', 'mirror', 'rug', 'decor', 'home', 'interior', 'ceramic', 'tray', 'coaster', 'diffuser', 'figurine', 'ornament', 'sculpture', 'potpourri', 'wreath', 'garland', 'cushion', 'throw', 'tapestry', 'wall art', 'bookend'], 'home-decor' as TemplateCategory],
  [['vitamin', 'supplement', 'capsule', 'protein', 'collagen', 'probiotic', 'omega', 'wellness', 'greens', 'superfood', 'gummy'], 'supplements-wellness' as TemplateCategory],
  [['shoe', 'sandal', 'loafer', 'slipper', 'footwear', 'mule', 'clog', 'oxford'], 'shoes' as TemplateCategory],
  [['bag', 'handbag', 'purse', 'clutch', 'tote', 'briefcase', 'satchel', 'crossbody'], 'bags-accessories' as TemplateCategory],
  [['phone', 'laptop', 'headphone', 'earbuds', 'speaker', 'charger', 'tablet', 'keyboard', 'tech', 'gadget'], 'tech-devices' as TemplateCategory],
  // Fallback: pets / sports / toys / stationery → Clothing & Apparel (most universal scene set)
  [['dog', 'cat', 'pet', 'collar', 'leash', 'harness'], 'garments' as TemplateCategory],
  [['ball', 'racket', 'helmet', 'bike', 'camping', 'tent', 'fitness', 'gym', 'sport'], 'garments' as TemplateCategory],
  [['toy', 'puzzle', 'game', 'doll', 'plush', 'figurine', 'baby'], 'garments' as TemplateCategory],
  [['notebook', 'pen', 'pencil', 'planner', 'desk', 'office', 'stationery'], 'garments' as TemplateCategory],
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
  garments: 'Clothing & Apparel',
  'beauty-skincare': 'Beauty & Skincare',
  'makeup-lipsticks': 'Makeup & Lipsticks',
  fragrance: 'Fragrance',
  food: 'Food & Snacks',
  beverages: 'Beverages',
  furniture: 'Furniture',
  'home-decor': 'Home Decor',
  'supplements-wellness': 'Supplements & Wellness',
  shoes: 'Shoes',
  'bags-accessories': 'Bags & Accessories',
  'tech-devices': 'Tech / Devices',
  backpacks: 'Backpacks',
  'wallets-cardholders': 'Wallets & Cardholders',
  belts: 'Belts',
  scarves: 'Scarves',
  'hats-small': 'Hats & Headwear',
  'jewellery-necklaces': 'Necklaces',
  'jewellery-earrings': 'Earrings',
  'jewellery-bracelets': 'Bracelets',
  'jewellery-rings': 'Rings',
  watches: 'Watches',
  dresses: 'Dresses',
  hoodies: 'Hoodies',
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
