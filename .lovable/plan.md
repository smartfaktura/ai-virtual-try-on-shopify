## Reorder Visual Type cards in `/app/workflows`

In the "Explore More Visual Types" grid, two slugs need to move:

- `picture-perspectives` ("Generate More Angles") → first card (just before "Selfie / UGC Visuals")
- `flat-lay-set` ("Flatlay Visuals") → last card (before the Freestyle prompt card)

All other cards keep their existing `sort_order` from the DB.

### Change

`src/pages/Workflows.tsx` (~line 493): after computing `otherWorkflows`, derive a stable re-ordered array:

```ts
const otherWorkflows = (() => {
  const rest = workflows.filter(w => w.slug !== 'product-images');
  const perspectives = rest.find(w => w.slug === 'picture-perspectives');
  const flatlay = rest.find(w => w.slug === 'flat-lay-set');
  const middle = rest.filter(w => w.slug !== 'picture-perspectives' && w.slug !== 'flat-lay-set');
  return [
    ...(perspectives ? [perspectives] : []),
    ...middle,
    ...(flatlay ? [flatlay] : []),
  ];
})();
```

No DB migration, no copy changes, no other components touched. Freestyle prompt card still renders last after the map, as today.

### Files touched

- `src/pages/Workflows.tsx` — replace the one-line `filter` with the sorted derivation.
