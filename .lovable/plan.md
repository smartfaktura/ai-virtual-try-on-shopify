

# Fix Scene Expansion Layout + Auto-Defaults on Review Skip

## Two Changes

### 1. Replace Sheet with inline row-aware expansion

Remove the `Sheet` side panel. Instead, render the expanded settings panel **after each complete row** of cards in the grid. This means grouping scene cards into rows based on the grid column count (2 on mobile, 3 on sm, 4 on md+), and inserting the panel as a full-width block after the row containing the active card.

**How it works:**
- Chunk the `productShots` and `modelShots` arrays into rows of N (matching the grid cols at each breakpoint — we use a flat list with `col-span-full` items inserted at row boundaries)
- Instead of a CSS grid, render cards in a flex-wrap container or use the grid approach with explicit row groups
- When a card is clicked, the expanded panel renders immediately after that row as a `col-span-full` element — but because we group cards into explicit row chunks (divs), the panel sits between row containers, not inside the grid
- Add a small CSS triangle/caret on the active card pointing down to visually connect it to the panel

**Implementation:** Render cards in row groups. Each row group is a `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4`. After each row group, conditionally render the expanded panel if the active card is in that row. Use a helper that chunks the array and determines which chunk contains `expandedSceneId`.

### 2. Auto-select model + info toast when skipping to Review

In `ProductImages.tsx`, when transitioning from step 3→4:
- If `needsModel` (on-model scenes exist but no model selected), auto-pick the first available global model
- Show an info toast: "Smart defaults applied — we auto-selected a model and best settings for your scenes. You can go back to Refine to customize."

This way users can skip Refine entirely and still get good results.

## Files

| File | What |
|---|---|
| `ProductImagesStep3Refine.tsx` | Remove `Sheet` import/usage. Add `chunkArray` helper. Render scene cards in row-group divs. After each row group, conditionally render the expanded panel (same content as was in the Sheet) as a full-width bordered card. Add a small downward triangle indicator on the active card. |
| `ProductImages.tsx` | In `handleNext` case 3→4: if `needsModel && globalModels.length > 0`, auto-set `selectedModelId` to first global model. Show info toast about auto-defaults. |

