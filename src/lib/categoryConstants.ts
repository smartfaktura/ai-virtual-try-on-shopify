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

export const CATEGORY_HEADLINES_RETURNING: Record<string, string> = {
  fashion: 'Create campaign-ready fashion visuals - no photoshoot needed.',
  beauty: 'Create campaign-ready beauty visuals - no photoshoot needed.',
  fragrances: 'Create campaign-ready fragrance visuals - no photoshoot needed.',
  jewelry: 'Create campaign-ready jewelry visuals - no photoshoot needed.',
  accessories: 'Create campaign-ready accessories visuals - no photoshoot needed.',
  home: 'Create campaign-ready home & decor visuals - no photoshoot needed.',
  food: 'Create campaign-ready food visuals - no photoshoot needed.',
  electronics: 'Create campaign-ready electronics visuals - no photoshoot needed.',
  sports: 'Create campaign-ready sports visuals - no photoshoot needed.',
  supplements: 'Create campaign-ready supplements visuals - no photoshoot needed.',
  any: 'Create campaign-ready visuals in seconds - no photoshoot needed.',
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
export function getCategoryHeadline(ids: string[], isReturning: boolean = false): string {
  const headlineMap = isReturning ? CATEGORY_HEADLINES_RETURNING : CATEGORY_HEADLINES;
  const filtered = ids.filter((id) => id !== 'any');
  if (filtered.length === 0 || ids.includes('any')) {
    return headlineMap.any;
  }
  if (filtered.length === 1) {
    return headlineMap[filtered[0]] ?? headlineMap.any;
  }
  if (filtered.length === 2) {
    return isReturning
      ? 'Create high-quality visuals tailored to your products - no photoshoot needed.'
      : 'Create high-quality visuals tailored to your products - from styled campaigns to real-life scenes.';
  }
  return isReturning
    ? 'Turn your product mix into consistent, high-quality visuals - no photoshoot needed.'
    : 'Turn your product mix into consistent, high-quality visuals in seconds.';
}
