## Plan: Add "Bags" link to the home footer

Add a footer link pointing to the existing dedicated `/ai-product-photography/bags` page (the "bags-only" SEO landing, separate from the broader `/bags-accessories` hub).

### Change

In `src/components/home/HomeFooter.tsx`, add one entry to the **Product** column:

```ts
{ label: 'AI bag photography', to: '/ai-product-photography/bags' },
```

Final Product column order:
- Pricing
- Examples
- AI bag photography  ← new
- Changelog

### Why this column / label
- The Product column already groups the user-facing surface; the SEO bag page fits there.
- Label "AI bag photography" matches the page's actual H1/intent and gives the footer link real keyword value (better than just "Bags", which reads ambiguously in a footer).

### Not changing
- No other footer columns touched.
- No sitemap edit needed — `/ai-product-photography/:slug` pages are already generated from the category data source.

### File to edit
- `src/components/home/HomeFooter.tsx` (one new array item)
