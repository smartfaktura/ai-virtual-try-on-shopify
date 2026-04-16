

# Auto-Close Other Categories in Explore More (Accordion Behavior)

## Problem
In the "Explore More" section, opening a second category (e.g., "Dresses") keeps the first one ("Clothing & Apparel") expanded above. The newly opened content is pushed below the viewport and the user can't see it without scrolling.

## Fix

### File: `src/components/app/product-images/ProductImagesStep2Scenes.tsx`

**1. Change `toggleCategory` to accordion behavior** — when opening a new category, close all others. Then scroll the newly opened category into view:

```tsx
const toggleCategory = (catId: string) => {
  if (expandedCategories.has(catId)) {
    // Closing: just remove it
    const next = new Set(expandedCategories);
    next.delete(catId);
    setExpandedCategories(next);
  } else {
    // Opening: close all others, open only this one
    setExpandedCategories(new Set([catId]));
    // Scroll to the opened category after render
    requestAnimationFrame(() => {
      document.getElementById(`explore-cat-${catId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
};
```

**2. Add `id` attribute to `CategoryRowTrigger` containers** so scroll targeting works — add `id={`explore-cat-${cat.id}`}` to the trigger buttons in the Explore More section (line ~529).

### Result
Only one category can be expanded at a time. Opening "Dresses" auto-closes "Clothing & Apparel" and scrolls to show the Dresses scenes.

### Files
- `src/components/app/product-images/ProductImagesStep2Scenes.tsx` — accordion toggle + scroll-into-view

