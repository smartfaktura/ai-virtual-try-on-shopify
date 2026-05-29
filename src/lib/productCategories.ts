/**
 * Single source of truth for the canonical product subcategories used by
 * Visual Studio Step 2 (scene picking) and the Product Category picker in
 * the Add/Edit Product form.
 *
 * To add a new subcategory:
 *   1. Add it to `CATEGORY_LABELS` (id → display label).
 *   2. Add the id to the appropriate group in `CATEGORY_SUPER_GROUPS`.
 * Both the modal picker and the Step 2 grid pick it up automatically.
 */

export const CATEGORY_LABELS: Record<string, string> = {
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
  other: 'Other',
  backpacks: 'Backpacks',
  'wallets-cardholders': 'Wallets & Cardholders',
  'phone-cases': 'Phone Cases',
  belts: 'Belts',
  scarves: 'Scarves',
  caps: 'Caps',
  hats: 'Hats',
  beanies: 'Beanies',
  'jewellery-necklaces': 'Necklaces',
  'jewellery-earrings': 'Earrings',
  'jewellery-bracelets': 'Bracelets',
  'jewellery-rings': 'Rings',
  watches: 'Watches',
  dresses: 'Dresses',
  skirts: 'Skirts',
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
  trousers: 'Trousers',
  jackets: 'Jackets',
  'wedding-dress': 'Wedding Dress',
};

export const CATEGORY_SUPER_GROUPS: { label: string; ids: string[] }[] = [
  { label: 'Fashion & Apparel', ids: ['garments', 'dresses', 'wedding-dress', 'skirts', 'hoodies', 'streetwear', 'jeans', 'trousers', 'jackets', 'activewear', 'swimwear', 'lingerie', 'kidswear'] },
  { label: 'Footwear', ids: ['shoes', 'sneakers', 'boots', 'high-heels'] },
  { label: 'Bags & Accessories', ids: ['bags-accessories', 'backpacks', 'wallets-cardholders', 'phone-cases', 'belts', 'scarves', 'caps', 'hats', 'beanies', 'watches', 'eyewear'] },
  { label: 'Jewelry', ids: ['jewellery-rings', 'jewellery-necklaces', 'jewellery-earrings', 'jewellery-bracelets'] },
  { label: 'Beauty & Fragrance', ids: ['beauty-skincare', 'makeup-lipsticks', 'fragrance'] },
  { label: 'Food & Drink', ids: ['food', 'beverages'] },
  { label: 'Home & Lifestyle', ids: ['home-decor', 'furniture', 'tech-devices', 'supplements-wellness', 'other'] },
];

/** Resolve the best display label for a category id (falls back to the id). */
export function getCategoryLabel(id?: string | null): string {
  if (!id) return '';
  return CATEGORY_LABELS[id] || id;
}
