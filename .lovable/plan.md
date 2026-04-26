## Pre-select category in `/product-visual-library` from hub-page CTAs

Today, every "Browse the visual library" / "Browse the full scene library" CTA across hub pages points to a bare `/product-visual-library` URL — so users always land on the first family (Fashion & Apparel) regardless of which category they came from. We'll make the library accept query params and update each category page's CTAs to deep-link to the matching family (and where useful, sub-collection).

### 1. Make `/product-visual-library` accept deep-link params

`src/pages/ProductVisualLibrary.tsx`
- Read query params on mount: `?family=<slug>` and optional `&collection=<slug>`.
- Wait for `families` to load, then if `family` matches one, set it as `activeFamilySlug`. If `collection` matches one inside that family, set `activeCollectionSlug`.
- After applying, scroll to `#catalog-grid` so the user lands directly on the right grid.
- Keep current default behaviour (first family) when no params present.

### 2. Add a shared mapper from category-page slug → library family/collection

New file `src/lib/visualLibraryDeepLink.ts`:

```ts
// Maps /ai-product-photography/{slug} → /product-visual-library?family=&collection=
export function getVisualLibraryHrefForCategory(
  slug?: string,
): string {
  if (!slug) return '/product-visual-library';
  const map: Record<string, { family: string; collection?: string }> = {
    'fashion':              { family: 'fashion' },
    'footwear':             { family: 'footwear' },
    'beauty-skincare':      { family: 'beauty-and-fragrance', collection: 'beauty-skincare' },
    'fragrance':            { family: 'beauty-and-fragrance', collection: 'fragrance' },
    'jewelry':              { family: 'jewelry' },
    'bags-accessories':     { family: 'bags-and-accessories' },
    'home-furniture':       { family: 'home' },
    'food-beverage':        { family: 'food-and-drink' },
    'supplements-wellness': { family: 'wellness' },
    'electronics-gadgets':  { family: 'tech' },
  };
  const m = map[slug];
  if (!m) return '/product-visual-library';
  const params = new URLSearchParams({ family: m.family });
  if (m.collection) params.set('collection', m.collection);
  return `/product-visual-library?${params.toString()}#catalog-grid`;
}
```

Family slugs match `familyToSlug()` in `usePublicSceneLibrary.ts` (`&` → `and`, lowercase, hyphens). Beauty & Skincare and Fragrance share one family but pre-select different collections so the user immediately sees the right sub-set.

### 3. Update CTA links inside the category template

In `src/components/seo/photography/category/`:
- `CategoryBuiltForEveryCategory.tsx` (line 190) — change `to="/product-visual-library"` to `to={getVisualLibraryHrefForCategory(page.slug)}`.
- `CategorySceneExamples.tsx` (line 54) — same change.

Both components already receive `page: CategoryPage` so `page.slug` is available.

### 4. Leave non-category CTAs unchanged

CTAs on `/ai-product-photography` (parent), `/`, `/how-it-works`, nav, etc. don't have a single category context — they should keep linking to bare `/product-visual-library` and show all families (Fashion first, current behaviour).

### Result

- Click "Browse the visual library" from `/ai-product-photography/footwear` → lands on Footwear family.
- From `/ai-product-photography/beauty-skincare` → lands on Beauty & Fragrance family with the Beauty & Skincare pill pre-selected.
- From `/ai-product-photography/fragrance` → lands on Beauty & Fragrance with Fragrance pill pre-selected.
- All other category hubs deep-link to their matching family.
- Bare `/product-visual-library` link from home/nav/how-it-works behaves exactly as today.