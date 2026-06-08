# Pin Beverages first under Food & Drink

Add another branch to the `collections` memo in `src/pages/ProductVisualLibrary.tsx`:

```ts
if (family.slug === 'food-and-drink') {
  const beverages = family.collections.find((c) => c.slug === 'beverages');
  if (beverages) {
    return [beverages, ...family.collections.filter((c) => c.slug !== 'beverages')];
  }
}
```

Affects only the Food & Drink → All view; sidebar pill order unchanged.
