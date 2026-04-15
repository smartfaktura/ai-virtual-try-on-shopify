

# Fix Mobile Stepper: Bigger, Show All Labels, Remove Progress Bar

## Problems
1. Only the active step label is visible — other steps show icon-only (line 91 condition)
2. Circles are small (`w-8 h-8`) and icons tiny (`w-3.5 h-3.5`)
3. The progress bar below the steps (lines 107-113) looks like a "carousel scroll" indicator

## Fix — `src/components/app/catalog/CatalogStepper.tsx`

### Mobile stepper redesign (lines 63-114)

Replace the mobile stepper with a cleaner layout:

- **Show all step labels** — remove the `{isActive && ...}` condition on labels (line 91-95)
- **Increase icon circle size** from `w-8 h-8` to `w-10 h-10`, icons from `w-3.5 h-3.5` to `w-4 h-4`
- **Always show label text** below each icon — `text-[10px]` with proper color states
- **Remove the progress bar entirely** (lines 107-113) — redundant with the step circles showing state
- Keep `overflow-hidden` on the container

### Result
4 evenly spaced step circles with labels always visible, no progress bar, larger touch targets. Matches the premium feel of the rest of the UI.

## Files changed
- `src/components/app/catalog/CatalogStepper.tsx` — mobile stepper section only

