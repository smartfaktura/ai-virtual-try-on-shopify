# Pin Sneakers first under Footwear

Extend the same family reorder logic in `src/pages/ProductVisualLibrary.tsx`:

```ts
if (family.slug === 'footwear') {
  const sneakers = family.collections.find((c) => c.slug === 'sneakers');
  if (sneakers) {
    return [sneakers, ...family.collections.filter((c) => c.slug !== 'sneakers')];
  }
}
```

Only affects the "All" view under Footwear; pill order in the sidebar and other families stay untouched.
