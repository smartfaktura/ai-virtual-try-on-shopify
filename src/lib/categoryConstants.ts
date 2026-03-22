export const PRODUCT_CATEGORIES = [
  { id: 'fashion', label: 'Fashion & Apparel' },
  { id: 'beauty', label: 'Beauty & Skincare' },
  { id: 'fragrances', label: 'Fragrances' },
  { id: 'jewelry', label: 'Jewelry' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'home', label: 'Home & Decor' },
  { id: 'food', label: 'Food & Beverage' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'sports', label: 'Sports & Fitness' },
  { id: 'supplements', label: 'Health & Supplements' },
  { id: 'any', label: 'All products' },
];

export const CATEGORY_HEADLINES: Record<string, string> = {
  fashion: 'Create campaign-ready fashion visuals without photoshoots.',
  beauty: 'Create clean, high-end skincare visuals that feel like luxury campaigns.',
  fragrances: 'Capture the mood of your fragrance through cinematic, emotional visuals.',
  jewelry: 'Highlight every detail with premium, light-perfect jewelry visuals.',
  accessories: 'Turn everyday products into styled, scroll-stopping visuals.',
  home: 'Place your products into beautifully designed interiors instantly.',
  food: 'Create delicious, ad-ready visuals that make people crave your product.',
  electronics: 'Showcase your product in sleek, modern environments built for conversion.',
  sports: 'Create dynamic visuals with energy, movement, and performance.',
  supplements: 'Build trust with clean, premium visuals that feel credible and strong.',
  any: 'Turn your ideas into high-quality, brand-ready visuals in seconds.',
};

/** Display label for the pill selector */
export function getCategoryLabel(ids: string[]): string {
  const filtered = ids.filter((id) => id !== 'any');
  if (filtered.length === 0 || ids.includes('any') && filtered.length === 0) {
    return 'All products';
  }
  if (filtered.length === 1) {
    const cat = PRODUCT_CATEGORIES.find((c) => c.id === filtered[0]);
    return cat?.label ?? 'All products';
  }
  if (filtered.length === 2) {
    const a = PRODUCT_CATEGORIES.find((c) => c.id === filtered[0])?.label ?? '';
    const b = PRODUCT_CATEGORIES.find((c) => c.id === filtered[1])?.label ?? '';
    return `${a} & ${b}`;
  }
  return 'Your product mix';
}

/** Dynamic headline based on selected categories */
export function getCategoryHeadline(ids: string[]): string {
  const filtered = ids.filter((id) => id !== 'any');
  if (filtered.length === 0 || ids.includes('any')) {
    return CATEGORY_HEADLINES.any;
  }
  if (filtered.length === 1) {
    return CATEGORY_HEADLINES[filtered[0]] ?? CATEGORY_HEADLINES.any;
  }
  if (filtered.length === 2) {
    return 'Create high-quality visuals tailored to your products — from styled campaigns to real-life scenes.';
  }
  return 'Turn your product mix into consistent, high-quality visuals in seconds.';
}
