## Remove subcategory chips from Bags & Accessories category page

The "What we cover in bags" chip strip (Handbags, Totes, Shoulder Bags, etc.) on `/ai-product-photography/bags-accessories` is rendered by `CategorySubcategoryChips`. This component is already conditionally hidden for a few categories (`home-furniture`, `swimwear`, `activewear`).

### Change
- **File:** `src/pages/seo/AIProductPhotographyCategory.tsx` (line 128)
- **Action:** Add `'bags-accessories'` to the exclusion array so the subcategory chips section does not render on the bags page.

```diff
- {!['home-furniture', 'swimwear', 'activewear'].includes(page.slug) && <CategorySubcategoryChips page={page} />}
+ {!['home-furniture', 'swimwear', 'activewear', 'bags-accessories'].includes(page.slug) && <CategorySubcategoryChips page={page} />}
```

No other pages or components are affected.