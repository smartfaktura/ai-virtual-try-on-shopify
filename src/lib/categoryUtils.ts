import type { Product, TemplateCategory } from '@/types';

/**
 * Detects the product category based on product type and tags
 */
export function detectProductCategory(product: Product): TemplateCategory | null {
  const type = product.productType.toLowerCase();
  const tags = product.tags.map(t => t.toLowerCase()).join(' ');
  const combined = `${type} ${tags}`;

  // Clothing keywords
  const clothingKeywords = [
    'sweater', 'shirt', 'apparel', 'dress', 'jacket', 'pants', 'jeans', 'coat',
    'blouse', 'skirt', 'suit', 'hoodie', 't-shirt', 'clothing',
    'legging', 'bra', 'sports bra', 'tank', 'jogger', 'shorts', 'top',
    'long sleeve', 'crop', 'bodysuit', 'romper', 'jumpsuit', 'sweatshirt',
    'pullover', 'cardigan', 'vest', 'active', 'athletic', 'yoga', 'workout'
  ];
  if (clothingKeywords.some(kw => combined.includes(kw))) return 'clothing';

  // Cosmetics keywords
  const cosmeticsKeywords = [
    'serum', 'moisturizer', 'lipstick', 'foundation', 'mascara', 'eyeshadow',
    'cleanser', 'toner', 'essence', 'sunscreen', 'primer', 'concealer', 'blush', 'bronzer',
    'highlighter', 'skincare', 'beauty', 'makeup', 'cream', 'treatment', 'powder', 'lip'
  ];
  if (cosmeticsKeywords.some(kw => combined.includes(kw))) return 'cosmetics';

  // Food keywords
  const foodKeywords = [
    'cereal', 'granola', 'chocolate', 'coffee', 'tea', 'honey', 'jam', 'sauce',
    'snack', 'bar', 'cookie', 'candy', 'nuts', 'dried fruit', 'beverage', 'juice', 'food',
    'organic', 'artisan', 'spread', 'confectionery'
  ];
  if (foodKeywords.some(kw => combined.includes(kw))) return 'food';

  // Home keywords
  const homeKeywords = [
    'candle', 'vase', 'planter', 'pillow', 'blanket', 'lamp', 'clock', 'frame',
    'mirror', 'rug', 'curtain', 'towel', 'mug', 'bowl', 'plate', 'decor', 'home', 'interior',
    'kitchen', 'lighting', 'textile', 'carafe', 'ceramic'
  ];
  if (homeKeywords.some(kw => combined.includes(kw))) return 'home';

  // Supplements keywords
  const supplementKeywords = [
    'vitamin', 'supplement', 'capsule', 'powder', 'gummy', 'protein',
    'collagen', 'probiotic', 'omega', 'mineral', 'herb', 'extract', 'wellness', 'health',
    'greens', 'superfood', 'sleep', 'energy'
  ];
  if (supplementKeywords.some(kw => combined.includes(kw))) return 'supplements';

  return null;
}

/**
 * Human-readable category labels
 */
export const categoryLabels: Record<TemplateCategory, string> = {
  clothing: 'Clothing',
  cosmetics: 'Cosmetics',
  food: 'Food & Beverage',
  home: 'Home & Interior',
  supplements: 'Supplements',
  universal: 'Universal',
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
