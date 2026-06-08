# Fix: use correct slugs for Bags-first reorder

The previous edit used the wrong slugs:
- Family slug is `bags-and-accessories` (from `familyToSlug("Bags & Accessories")`), not `bags-accessories`.
- Bags collection slug is `bags-accessories` (per `COLLECTION_LABEL` map), not `bags`.

That's why the page still shows Phone Cases first.

## Change

`src/pages/ProductVisualLibrary.tsx`, the `collections` memo:

```ts
if (family.slug === 'bags-and-accessories') {
  const bags = family.collections.find((c) => c.slug === 'bags-accessories');
  if (bags) {
    return [bags, ...family.collections.filter((c) => c.slug !== 'bags-accessories')];
  }
}
```

## Validation

Reload `/product-visual-library?family=bags-and-accessories` with All selected — first section header reads "Bags & Accessories · …" (the Bags collection); Phone Cases follows.
