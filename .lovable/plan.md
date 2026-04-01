

# /app/catalog — Round 9 Audit

The flow is near-perfect after 8 rounds. Here are the final micro-refinements I found:

## Findings

### 1. Stepper buttons lack `focus-visible` ring
**File: `CatalogStepper.tsx` lines 34, 77**
Both desktop and mobile stepper `<button>` elements have no `focus-visible` styling. Keyboard users navigating between steps can't see which step is focused. Every other interactive element in the flow now has focus rings except these.
**Fix**: Add `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-full` to both stepper buttons.

### 2. UnderlineTab in Products step lacks `focus-visible` ring
**File: `CatalogStepProducts.tsx` line 57-72**
The `UnderlineTab` component (My Products / Import URL / Upload CSV) is a `<button>` with no focus-visible styling. Inconsistent with all other interactive elements.
**Fix**: Add `focus-visible:ring-2 focus-visible:ring-primary rounded` to the button.

### 3. Prop picker modal items lack `focus-visible` ring
**File: `CatalogStepProps.tsx` line 120-142**
The prop product cards inside `PropPickerModal` are `<button>` elements with no focus-visible styling.
**Fix**: Add `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1` to the button.

### 4. Prop removal `X` button lacks `focus-visible` ring and accessible label
**File: `CatalogStepProps.tsx` line 363-367**
The tiny `<button>` to remove a prop from a combo has no focus ring and no `aria-label`. Screen readers will announce it as an empty button.
**Fix**: Add `aria-label="Remove prop"` and `focus-visible:ring-2 focus-visible:ring-primary rounded`.

### 5. "Clear all" props link lacks `focus-visible` styling
**File: `CatalogStepProps.tsx` line 277**
The "Clear all" link-style button has no focus-visible ring. It's a raw `<button>` with only underline styling.
**Fix**: Add `focus-visible:ring-2 focus-visible:ring-primary rounded`.

### 6. Generation progress: product status cards could show a mini progress bar per product
**File: `CatalogGenerate.tsx` lines 476-493**
Currently each product shows "X/Y" text and a badge. A tiny inline `Progress` bar (already imported) would give better visual feedback without adding complexity.
**Fix**: Add a `<Progress value={...} className="h-1 mt-1.5" />` inside each product status card.

### 7. `Checkbox` import is unused in `CatalogStepProps.tsx`
**File: `CatalogStepProps.tsx` line 8**
The `Checkbox` component is imported but never used — leftover from a previous iteration.
**Fix**: Remove the import.

## Summary

| # | Item | Effort | Impact |
|---|------|--------|--------|
| 1 | Stepper focus-visible | Trivial | Accessibility |
| 2 | UnderlineTab focus-visible | Trivial | Accessibility |
| 3 | Prop picker focus-visible | Trivial | Accessibility |
| 4 | Prop remove button a11y | Trivial | Accessibility |
| 5 | Clear all focus-visible | Trivial | Accessibility |
| 6 | Per-product progress bar | Small | UX feedback |
| 7 | Remove unused import | Trivial | Code hygiene |

Items 1-5 complete the accessibility pass — after these, every interactive element in the catalog flow will have keyboard focus indicators. Item 6 adds visual polish to the generation phase. Item 7 is cleanup.

## Technical Details

**Item 1** — In `CatalogStepper.tsx`, add to both desktop (line 34) and mobile (line 77) buttons:
```
focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1
```

**Item 6** — In the product status card (line 476-493), add after the text line:
```tsx
<Progress value={Math.round(((info.done + info.failed) / info.total) * 100)} className="h-1 mt-1" />
```

**Item 7** — Remove `Checkbox` from the import on line 8 of `CatalogStepProps.tsx`.

