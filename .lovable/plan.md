## Fix /ai-product-photography/bags (separate slug from bags-accessories)

The URL `/ai-product-photography/bags` resolves to a **different** category page (slug `bags`) than the `bags-accessories` slug I edited last time. So neither prior change took effect on this URL.

### Changes

**1. Hide the "What we cover in bags" chip strip**
- File: `src/pages/seo/AIProductPhotographyCategory.tsx` (line 128)
- Add `'bags'` to the exclusion array:
  ```diff
  - {!['home-furniture', 'swimwear', 'activewear', 'bags-accessories'].includes(page.slug) && <CategorySubcategoryChips page={page} />}
  + {!['home-furniture', 'swimwear', 'activewear', 'bags-accessories', 'bags'].includes(page.slug) && <CategorySubcategoryChips page={page} />}
  ```

**2. Make "Campaign Statements" the first tab in "Built for every bags shot"**
- File: `src/data/aiProductPhotographyBuiltForGrids.ts` (lines ~2070–2134, the `"bags"` array)
- Reorder so `"Bags · Campaign Statements"` is the first group, followed by `Editorial Studio`, `On-Body Editorial`, `Essential Shots`, `Everyday UGC`.

No other slugs or image IDs change.