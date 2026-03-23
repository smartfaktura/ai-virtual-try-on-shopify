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
  fashion: 'Create your first fashion campaign in seconds - no photoshoot needed.',
  beauty: 'Launch your first beauty campaign in seconds - no photoshoot needed.',
  fragrances: 'Create your first fragrance campaign in seconds - no photoshoot needed.',
  jewelry: 'Launch your first jewelry campaign in seconds - no photoshoot needed.',
  accessories: 'Create your first accessories campaign in seconds - no photoshoot needed.',
  home: 'Launch your first home & decor campaign in seconds - no photoshoot needed.',
  food: 'Create your first food campaign in seconds - no photoshoot needed.',
  electronics: 'Launch your first electronics campaign in seconds - no photoshoot needed.',
  sports: 'Create your first sports campaign in seconds - no photoshoot needed.',
  supplements: 'Launch your first supplements campaign in seconds - no photoshoot needed.',
  any: 'Create your first campaign in seconds - no photoshoot needed.',
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
