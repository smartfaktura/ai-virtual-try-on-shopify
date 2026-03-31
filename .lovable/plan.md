

# Improve Style Shots UI/UX

## Issues Identified
1. **No search** in product picker popover — hard to find products in large catalogs
2. **Tiny product thumbnails** (7px/8px) — hard to see what you're selecting
3. **Product names truncated** too aggressively (max-w-[120px])
4. **"+ Add" button** too small and easy to miss
5. **No visual feedback** when extras are added — no count per combo
6. **No skip hint** — user may not realize this step is optional
7. **Combo cards look flat** — no visual hierarchy between product/model and extras
8. **"Apply to All" section** doesn't stand out enough

## Changes — Single File

**`src/components/app/catalog/CatalogStepStyleShots.tsx`**

1. **Add search to ProductPickerPopover**: Add an `Input` field at top of popover that filters products by title. Wider popover (w-72), larger thumbnails (w-9 h-9).

2. **Better combo cards**: Increase product thumbnail to 10×10, model avatar to 9×9. Remove aggressive truncation (use max-w-[180px]). Show extras count badge on each card.

3. **Bigger "+ Add" button**: Make it `h-8` with clearer styling — `variant="secondary"` with dashed border look, text "Add product".

4. **Optional step hint**: Add a subtle note below the description: "This step is optional — skip if no extras needed."

5. **"Apply to All" visual uplift**: Add a subtle gradient/accent left border to make it stand out as a special action area.

6. **Empty state per combo**: When no extras added, show light italic text "No extras" instead of just the Add button floating alone.

7. **Combo counter in header**: Show "X of Y combos have extras" for progress awareness.

