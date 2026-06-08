# Default Bags & Accessories "All" view to show Bags first

**Scope:** frontend only — `src/pages/ProductVisualLibrary.tsx`, single `useMemo` (line 385).

Collections inside a family currently render in DB `category_sort_order`, which puts Phone Cases first under Bags & Accessories. When the user opens the family with "All" selected, we'll reorder so the `bags` collection appears first (other collections keep their existing relative order).

## Change

In the `collections` memo (line 385), after picking `family.collections` and before returning, if `family.slug === 'bags-accessories'` and no specific collection is selected, move the `bags` collection to the front:

```ts
const collections = useMemo<CollectionGroup[]>(() => {
  if (activeCollectionSlug) {
    return family.collections.filter((c) => c.slug === activeCollectionSlug);
  }
  if (family.slug === 'bags-accessories') {
    const bags = family.collections.find((c) => c.slug === 'bags');
    if (bags) {
      return [bags, ...family.collections.filter((c) => c.slug !== 'bags')];
    }
  }
  return family.collections;
}, [family.collections, family.slug, activeCollectionSlug]);
```

## Safe / out of scope

- No DB / sort_order edits — purely a per-family UI reorder.
- Sidebar pill order untouched (still reflects DB order).
- Other families unchanged.
- "All" count and totals unaffected.

## Validation

- `/product-visual-library` → Bags & Accessories → All: first section is "Bags", Phone Cases follows.
- Click Phone Cases pill: still works, shows only Phone Cases.
- Other families (Fashion & Apparel, Footwear, …): order unchanged.
