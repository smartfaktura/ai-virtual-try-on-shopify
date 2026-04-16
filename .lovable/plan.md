

# Dashboard Cleanup for Returning Users

## Summary
Remove the "Create" and "Recent Activity" sections, fix the "Continue Last" card navigation for Product Images, improve metric cards compactness on mobile, and add a "Tools" section after Recent Creations.

## Changes

### 1. Remove "Create" section (lines 610-645)
Delete the entire "Create" section with Templates and Freestyle Studio cards.

### 2. Remove "Recent Activity" section (line 765)
Remove the `<ActivityFeed />` component from the returning user dashboard.

### 3. Fix "Continue Last" card navigation (line 582)
The current code navigates to `/app/generate/${slug}` using the workflow's DB slug. Problem: some workflow slugs don't match routes (e.g., `product-on-model` vs the actual route `product-images`). Also the fallback is `'product-on-model'` which doesn't exist as a route.

Fix: Add a slug-to-route mapping that handles known mismatches, and change fallback to `'product-images'`:
```ts
const workflowRoute = (slug: string) => {
  const routeMap: Record<string, string> = {
    'product-on-model': 'product-images',
  };
  return routeMap[slug] || slug;
};
```

### 4. Compact metric cards on mobile
Currently `grid-cols-2` on mobile with default card padding. Changes:
- Reduce card padding on mobile in `MetricCard.tsx`: `p-4 sm:p-5`
- Reduce title/value font sizes on mobile for tighter cards
- Ensure all 5 cards (including "Top Style" which is `hidden md:block`) display as a consistent 2-col grid on mobile with the 5th card visible

### 5. Add "Tools" section after Recent Creations (after line 608)
Add a section with the same 3 cards from the first-time user "Start here" grid — Product Visuals, Create with Prompt, Explore Examples — using the same card style but in a compact format for returning users:
```
Tools
├─ Create Product Visuals → /app/generate/product-images
├─ Create with Prompt → /app/freestyle
└─ Explore Examples → /app/discover
```
Use the same card pattern (icon, title, description, Open button) but in a 3-col grid.

## Files
- `src/pages/Dashboard.tsx` — remove Create section, remove ActivityFeed, fix slug routing, add Tools section
- `src/components/app/MetricCard.tsx` — tighten mobile padding/spacing

