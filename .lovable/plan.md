Some pages (fashion, bags, watches, hoodies, swimwear, lingerie, eyewear, activewear, dresses, caps-hats) have 4 entries in `relatedCategories`, so the component renders 4 cards — the 4th wraps to a new row.

### Fix
`src/components/seo/photography/category/CategoryRelatedCategories.tsx` line 34:

```ts
const related = getRelatedPages(page.relatedCategories).slice(0, 3);
```

One-line change. Hard caps the section at 3 cards across every page without touching data (preserves SEO/JSON-LD lists elsewhere if any consumer reads beyond 3).