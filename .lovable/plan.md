

# Change Hero Images to Fashion Featured Presets

## What
Replace the hero grid images (the 6 images right after the hero headline/CTAs/team avatars) with **featured presets from the fashion category** instead of the current generic `pickProductLed` selection.

## Change in `src/pages/seo/AIProductPhotographyEcommerce.tsx`

Update the `heroImages` memo (~lines 146-151) to filter for fashion category + featured presets:

```tsx
const heroImages = useMemo(() => {
  usedIds.clear();
  // Pick featured fashion presets first, then any fashion preset
  const fashionFeatured = presets.filter(
    p => (p.category === 'fashion' || p.discover_categories?.includes('fashion')) && p.is_featured
  ).slice(0, 6);
  const picks = fashionFeatured.length >= 6
    ? fashionFeatured
    : [
        ...fashionFeatured,
        ...presets
          .filter(p =>
            (p.category === 'fashion' || p.discover_categories?.includes('fashion')) &&
            !fashionFeatured.some(f => f.id === p.id)
          )
          .slice(0, 6 - fashionFeatured.length),
      ];
  picks.forEach(p => usedIds.add(p.id));
  return picks;
}, [presets, usedIds]);
```

This prioritizes `is_featured` fashion presets, then fills remaining slots with any fashion-category preset.

## Files
| File | Change |
|------|--------|
| `src/pages/seo/AIProductPhotographyEcommerce.tsx` | Update `heroImages` memo to filter by fashion category |

