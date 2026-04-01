

# /app/catalog — Round 6 Audit

The flow is mature and well-polished. No functional bugs remain. Here are minor issues I found:

## Findings

### 1. `ModelSelectorCard` uses `div` with `onClick` — not keyboard accessible
**File: `ModelSelectorCard.tsx` line 16-17**
The card is a `<div>` with `onClick` and no `role`, `tabIndex`, or `onKeyDown`. Unlike all other selector cards in the catalog flow (shots, backgrounds, fashion style, product only toggle) which are `<button>` elements with focus-visible rings, this component is completely inaccessible via keyboard.
**Fix**: Change the outer `<div>` to a `<button>` (or add `role="button" tabIndex={0} onKeyDown`) and add `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`.

### 2. Lightbox download loop doesn't `break` after finding the match
**File: `CatalogGenerate.tsx` lines 519-532**
The filename-resolution loop iterates through all completed jobs/images even after finding the matching index. It works because the last match wins and there's only one match per index, but it's wasteful for large batches.
**Fix**: Add `break` after the match is found (inside the `if (imgIdx === i)` block and the outer loop).

### 3. "Create Your Brand Model" button in Models step navigates away without warning
**File: `CatalogStepModelsV2.tsx` line 117**
Clicking this navigates to `/app/brand-models`, abandoning all catalog wizard state (products, style, etc.) without confirmation. Users lose all progress.
**Fix**: Either open in a new tab (`window.open`), or show a confirmation dialog warning that wizard progress will be lost.

### 4. Mobile summary floating button may overlap the Products step floating selection bar
**File: `CatalogGenerate.tsx` line 698-707**
The mobile summary button is positioned at `fixed bottom-20 right-4`. The Products step's floating selection bar is `sticky bottom-0`. At 440px, both could be visible simultaneously — the summary chip floats over the selection bar's right side.
**Fix**: Hide the summary chip when `step === 1 && selectedProductIds.size > 0`, or adjust its position.

### 5. Props step combo list uses fixed `max-h-[460px]` — not responsive
**File: `CatalogStepProps.tsx` line 283**
Same pattern as the Products list view issue that was already fixed. Should be `max-h-[min(460px,50vh)]` for consistency.
**Fix**: Change to responsive max-height.

### 6. Timer doesn't stop cleanly when user cancels generation
**File: `CatalogGenerate.tsx` lines 107-120**
When the user cancels via the AlertDialog, `resetBatch()` sets `batchState` to `null` and `isGenerating` to `false`. The timer effect depends on `hasBatch` and `allDone` — when `hasBatch` becomes false, the cleanup runs. This works, but `generationStartedAt` state is never cleared on cancel, leaving stale state.
**Fix**: Call `setGenerationStartedAt(null)` alongside `resetBatch()` in the cancel handler (line 443).

### 7. Products step: "Add Product" card in grid appears even when max products reached
**File: `CatalogStepProducts.tsx` line 333-344**
The "Add Product" card is always visible at the bottom of the grid. When the user has already selected `maxProducts`, clicking it opens the Add Product modal — they can add the product but won't be able to select it (capped). Not a bug, but slightly misleading.
**Fix**: Optionally hide or dim the card when `selectedProductIds.size >= maxProducts` with a tooltip "Max products selected".

## Summary

| # | Item | Effort | Impact |
|---|------|--------|--------|
| 1 | ModelSelectorCard keyboard a11y | Small | Accessibility (used across app) |
| 2 | Add break to lightbox filename loop | Trivial | Performance (minor) |
| 3 | Brand Model nav loses wizard state | Small | Data loss risk |
| 4 | Mobile button overlap on Step 1 | Trivial | Visual overlap |
| 5 | Props list responsive height | Trivial | Layout consistency |
| 6 | Clear timer state on cancel | Trivial | Clean state |
| 7 | Add Product card when maxed | Trivial | UX clarity |

Items 1 and 3 are the most impactful. The rest are minor polish.

## Technical Details

**Item 1** — In `ModelSelectorCard.tsx`, change:
```tsx
<div onClick={onSelect} className={`relative cursor-pointer ...`}>
```
to:
```tsx
<button type="button" onClick={onSelect} className={`relative cursor-pointer ... focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}>
```
And close with `</button>`. Since it currently uses `ring-1 ring-border` etc. in styling, the switch is straightforward.

**Item 3** — In `CatalogStepModelsV2.tsx` line 117, change `onClick={() => navigate(...)}` to `onClick={() => window.open('/app/brand-models', '_blank')}` so the wizard state is preserved.

**Item 6** — In `CatalogGenerate.tsx` line 443, add `setGenerationStartedAt(null); setElapsedSeconds(0);` after `resetBatch()`.

