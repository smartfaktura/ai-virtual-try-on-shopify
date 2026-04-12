

# Fix: New Sub-Category Not Appearing in Dropdown After Creation

## Problem
When a user types a new sub-category name (e.g., "Street Color Story") and clicks ✓, the input closes and the Select dropdown reappears. But the dropdown options come from `allSubCategories`, which is derived from **existing DB records**. Since the scene hasn't been saved yet, the new name isn't in the list — so the Select can't display it and it appears blank/reset.

## Fix
**`src/pages/AdminProductImageScenes.tsx`** — In the `SceneForm` component, include `draft.sub_category` in the dropdown options if it's not already present:

```tsx
// ~line 726-729, in the Select options rendering
{allSubCategories.map(sc => (
  <SelectItem key={sc} value={sc}>{sc}</SelectItem>
))}
```

Change to:

```tsx
{[...allSubCategories, ...(draft.sub_category && !allSubCategories.includes(draft.sub_category) ? [draft.sub_category] : [])].map(sc => (
  <SelectItem key={sc} value={sc}>{sc}</SelectItem>
))}
```

This ensures the newly typed sub-category value stays visible in the dropdown until the scene is saved, at which point it becomes part of the DB-derived list naturally.

One file, ~2 lines changed.

