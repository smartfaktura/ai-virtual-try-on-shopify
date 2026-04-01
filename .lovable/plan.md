

# /app/catalog — Fresh Audit Findings

After a thorough re-examination of all step components in their current state, the previous round of fixes addressed the major issues well. Here are the **remaining** items worth addressing:

## Issues Found

### 1. State leak: `selectionOrder` not synced with `selectedProductIds`
**File: `CatalogStepProducts.tsx`**
- `selectionOrder` is local state, but `selectedProductIds` is controlled from the parent. If the parent resets `selectedProductIds` (e.g. via `handleNewGeneration`), `selectionOrder` retains stale entries. This causes numbered badges to show wrong numbers on re-entry.
- **Fix**: Add a `useEffect` that prunes `selectionOrder` to only include IDs present in `selectedProductIds`.

### 2. Import URL tab is a fake stub
**File: `CatalogStepProducts.tsx` lines 401-430**
- The "Import URL" button just does `setTimeout(() => setIsImporting(false), 2000)` — pure mock. It will confuse users who try to use it.
- **Fix**: Either wire it to the existing `import-product` edge function, or hide the tab / show "Coming soon" badge.

### 3. CSV tab likely also a stub
**File: `CatalogStepProducts.tsx` line 433+**
- Need to verify, but based on the pattern it's likely also non-functional.
- **Fix**: Same approach — wire up or mark as coming soon.

### 4. Props step: combo list has no grouping
**File: `CatalogStepProps.tsx`**
- When you have 5 products × 3 models × 4 shots = 60 combos, scrolling through a flat list of 60 rows is painful. No grouping by product or model.
- **Fix**: Group combos by product with a sticky product header. Each group shows the product image + name, then indented combo rows beneath it.

### 5. Generation progress: no product image thumbnails
**File: `CatalogGenerate.tsx` lines 411-438**
- The per-product progress cards show name + percentage but no product thumbnail. Adding the image would make it much easier to identify which product is generating.
- **Fix**: Pass product image data into the batch state or look it up from `products` array by `productId`.

### 6. Review step: no way to go back and edit individual sections
**File: `CatalogStepReviewV2.tsx`**
- The review shows a summary but each section (Products, Models, Style, etc.) is not clickable to jump back to that step. Users must click Back repeatedly.
- **Fix**: Make each summary section header clickable with an "Edit" link that calls `onStepClick(N)`.

### 7. Stepper: no visual distinction between "completed" and "can navigate to"
**File: `CatalogStepper.tsx`**
- Steps before current are all styled the same (`bg-primary/8 text-primary`), whether they have valid selections or the user just passed through. Minor but could be improved with a checkmark for fully-validated steps vs. a number for "visited but incomplete".

### 8. Mobile: floating selection bar on Products step has no `safe-area-inset-bottom`
**File: `CatalogStepProducts.tsx` line ~460+**
- On iOS with home indicator, the floating bar at `bottom-4` may be partially obscured.
- **Fix**: Add `pb-safe` or `bottom-[calc(1rem+env(safe-area-inset-bottom))]`.

### 9. No loading state when clicking Generate on Review step
**File: `CatalogStepReviewV2.tsx`**
- The button shows a spinner when `isGenerating` is true, but there's a gap between clicking and `isGenerating` becoming true (async `handleGenerate`). Button should be disabled immediately on click.
- **Fix**: Use local `clicked` state that disables the button immediately.

### 10. Accessibility: Background cards lack `aria-label`
**File: `CatalogStepBackgroundsV2.tsx`**
- Color swatch buttons have no accessible name. Screen readers would announce them as unlabeled buttons.
- **Fix**: Add `aria-label={bg.label}` to each button.

## Recommended Priority

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 1 | Sync selectionOrder with selectedProductIds | Small | Prevents stale numbered badges |
| 2 | Fix or disable Import URL stub | Small | Prevents user confusion |
| 3 | Fix or disable CSV stub | Small | Same |
| 4 | Group props combos by product | Medium | Major UX win for large catalogs |
| 5 | Add product thumbnails to generation progress | Small | Better visual identification |
| 6 | Add "Edit" links in Review step sections | Small | Faster navigation |
| 7 | iOS safe area for floating bar | Trivial | Mobile polish |
| 8 | Immediate button disable on Generate click | Trivial | Prevents double-click |
| 9 | Aria labels on background cards | Trivial | Accessibility |

No critical bugs — the flow works. Items 1-3 are functional issues that should be fixed. Item 4 is the biggest UX improvement opportunity for users with many products.

