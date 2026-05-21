# Hide Pain Points + Use Cases on hoodies page

The hoodies category page is still rendering `CategoryPainPoints` and `CategoryUseCases`. Other flagship pages (bags, swimwear, activewear, eyewear) hide them via a gate in `src/pages/seo/AIProductPhotographyCategory.tsx`:

```ts
const hidePainAndUseCases = ['bags', 'swimwear', 'activewear', 'eyewear'].includes(page.slug);
```

## Change

Add `'hoodies'` to that array. One-line edit, no other changes.
