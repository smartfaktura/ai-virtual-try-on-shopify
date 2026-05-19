## Hide subcategory chips on activewear category page

### Change
Extend the existing conditional in `src/pages/seo/AIProductPhotographyCategory.tsx` (line 133) to also hide `<CategorySubcategoryChips>` on the `activewear` slug, matching the already-implemented pattern for `home-furniture` and `swimwear`.

**Before:**
```tsx
{!['home-furniture', 'swimwear'].includes(page.slug) && <CategorySubcategoryChips page={page} />}
```

**After:**
```tsx
{!['home-furniture', 'swimwear', 'activewear'].includes(page.slug) && <CategorySubcategoryChips page={page} />}
```

No other files touched. The `subcategories` array remains in the data file for potential future use.