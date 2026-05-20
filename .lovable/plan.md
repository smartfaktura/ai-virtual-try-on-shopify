## Remove "What we cover in {category}" section from all SEO category pages

That section is rendered by `<CategorySubcategoryChips />` inside `src/pages/seo/AIProductPhotographyCategory.tsx`. It's currently excluded for a handful of slugs (home-furniture, swimwear, activewear, bags-accessories, bags) via an inline allow-list.

### Change

In `src/pages/seo/AIProductPhotographyCategory.tsx`, remove the `<CategorySubcategoryChips page={page} />` render (and its conditional + the now-unused import).

That single edit hides the chips section across every `/ai-product-photography/{slug}` page — fashion, footwear, beauty-skincare, fragrance, jewelry, food-beverage, home-furniture, electronics, bags, watches, hoodies, swimwear, lingerie, eyewear, activewear, dresses, caps-hats, and any future category — without touching the underlying data (subcategories arrays stay intact for SEO/JSON-LD).

### Not changing

- `CategorySubcategoryChips.tsx` component file stays in the repo (unused) in case you want to revive it later. Say the word if you'd like it deleted too.
- `subcategories: [...]` arrays in `aiProductPhotographyCategoryPages.ts` stay — they're still useful for keyword targeting and aren't visually rendered anywhere else.