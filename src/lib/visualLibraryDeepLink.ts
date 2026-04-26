// Maps /ai-product-photography/{slug} → /product-visual-library?family=&collection=
// Family slugs match familyToSlug() in usePublicSceneLibrary.ts
// (lowercase, '&' → 'and', non-alphanumeric → '-').
export function getVisualLibraryHrefForCategory(slug?: string): string {
  if (!slug) return '/product-visual-library';
  const map: Record<string, { family: string; collection?: string }> = {
    'fashion': { family: 'fashion' },
    'footwear': { family: 'footwear' },
    'beauty-skincare': { family: 'beauty-and-fragrance', collection: 'beauty-skincare' },
    'fragrance': { family: 'beauty-and-fragrance', collection: 'fragrance' },
    'jewelry': { family: 'jewelry' },
    'bags-accessories': { family: 'bags-and-accessories' },
    'home-furniture': { family: 'home' },
    'food-beverage': { family: 'food-and-drink' },
    'supplements-wellness': { family: 'wellness' },
    'electronics-gadgets': { family: 'tech' },
  };
  const m = map[slug];
  if (!m) return '/product-visual-library';
  const params = new URLSearchParams({ family: m.family });
  if (m.collection) params.set('collection', m.collection);
  return `/product-visual-library?${params.toString()}#catalog-grid`;
}
