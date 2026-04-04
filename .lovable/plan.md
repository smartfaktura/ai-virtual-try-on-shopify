

# Add Per-Scene Props to Settings Step

## What
Add an "Add Prop" button next to each scene in the "Customize format per scene" collapsible section. Users can attach extra products (e.g., sunglasses, bags) as styling props to specific scenes, enriching the generation with accessories.

## Approach

Keep it simple: reuse the prop picker modal pattern from `CatalogStepProps` but adapted for scene-level assignment instead of per-combo. A global "Add prop to all scenes" button sits at the top of the collapsible section.

### Data Model
**File**: `types.ts`

Add `sceneProps?: Record<string, string[]>` to `DetailSettings`. Keys are scene IDs, values are arrays of product IDs to include as props in that scene.

### Settings UI
**File**: `ProductImagesStep3Settings.tsx`

- Accept new prop: `allProducts` (user's product list) and `selectedProductIds` (hero products to exclude from props)
- Add a `PropPickerModal` component (simplified version of CatalogStepProps picker — search, grid, multi-select)
- Each scene row in the collapsible gets an "Add Prop" button (Plus icon) that opens the modal scoped to that scene
- Add a "Add prop to all scenes" button at the top of the collapsible
- Show assigned prop thumbnails as small chips with remove (X) buttons next to each scene
- "Clear all props" link when any props are assigned

### UI Layout (inside collapsible)
```text
  [+ Add prop to all scenes]    2 scenes have props  Clear all

  Dramatic Lighting   [1:1 4:5 3:4 ...] [+ Add Prop]
    🖼 Sunglasses  ✕   🖼 Watch  ✕

  Back View           [1:1 4:5 3:4 ...] [+ Add Prop]
    (no props)

  Side View           [1:1 4:5 3:4 ...] [+ Add Prop]
    🖼 Sunglasses  ✕   🖼 Watch  ✕
```

### Props Threading
**File**: `ProductImages.tsx`

- Pass `allProducts` (from user_products query) and `selectedProductIds` to the Settings step
- The `sceneProps` data flows through to Review and Generation steps via `DetailSettings`

## Files Modified

| File | Changes |
|------|---------|
| `types.ts` | Add `sceneProps?: Record<string, string[]>` to `DetailSettings` |
| `ProductImagesStep3Settings.tsx` | Add PropPickerModal, per-scene prop buttons, prop chips display |
| `ProductImages.tsx` | Pass `allProducts` and `selectedProductIds` to Settings step |

