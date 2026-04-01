

# /app/catalog — Round 5 Audit

The flow is well-polished after four rounds. Only minor items remain — no functional bugs.

## Remaining Items

### 1. Products step: Import URL and CSV tabs still show functional UI that does nothing
**File: `CatalogStepProducts.tsx` lines ~420-500**
Need to verify the current state of these tabs — they were supposed to show "Coming Soon" badges from a previous round but I need to confirm the implementation.

### 2. Stepper: mobile stepper buttons lack `disabled` attribute when `!canClick`
**File: `CatalogStepper.tsx` line 76**
Desktop stepper has `disabled={!canClick}` (line 33), but mobile stepper button has no `disabled` prop — it relies only on the `onClick` guard `canClick && onStepClick(s.number)`. This means mobile users can still focus/tap disabled steps (screen readers announce them as clickable).
**Fix**: Add `disabled={!canClick}` to the mobile stepper button.

### 3. Generation results: no "Download All" option
**File: `CatalogGenerate.tsx` lines 354-370**
After batch completes, users see a grid of generated images and can click each for lightbox + individual download, but there's no bulk "Download All as ZIP" button. For catalogs with 20+ images this is tedious.
**Fix**: Add a "Download All" button that creates a ZIP client-side using JSZip (or downloads sequentially). Medium effort — could be a follow-up.

### 4. Lightbox download filename is generic
**File: `CatalogGenerate.tsx` line 503**
Download filename is `catalog-${i + 1}.jpg` — doesn't include product name or shot type. Users can't identify images after downloading.
**Fix**: Include product name and shot label in the filename. This requires enriching the `aggregatedImages` data to carry metadata alongside URLs.

### 5. No empty state for Props step when user has 0 extra products
Already handled (line 256-261 of CatalogStepProps.tsx) — verified, this is fine.

### 6. Context sidebar not visible on the current 440px mobile viewport
The sidebar is wrapped in `hidden lg:block` (CatalogGenerate.tsx line 642). At 440px, users have no visibility into their selections while navigating steps. This is by design (mobile space constraints), but a collapsible mobile summary drawer could help.
**Fix**: Low priority — add a floating "Setup summary" chip on mobile that opens a Sheet with the sidebar content.

## Summary

| # | Item | Effort | Impact |
|---|------|--------|--------|
| 1 | Verify Coming Soon tabs | Trivial | Confirm previous fix |
| 2 | Mobile stepper `disabled` attr | Trivial | Accessibility |
| 3 | Download All ZIP | Medium | Major convenience for large catalogs |
| 4 | Better download filenames | Small | File organization |
| 6 | Mobile summary drawer | Medium | Mobile UX |

Only item 2 is a clear fix worth implementing now. Items 3 and 4 are valuable feature additions. Item 6 is a nice-to-have.

**Recommendation**: Implement item 2 (trivial a11y fix). Items 3-4 are worth doing as a follow-up batch. Item 6 is optional.

## Technical Details

**Item 2** — In `CatalogStepper.tsx` line 76, change:
```tsx
<button onClick={() => canClick && onStepClick(s.number)} className="...">
```
to:
```tsx
<button onClick={() => canClick && onStepClick(s.number)} disabled={!canClick} className="...">
```

**Item 4** — Requires changing `aggregatedImages` from `string[]` to `Array<{url: string; productName: string; shotLabel: string}>` in the batch state, then using that metadata in the download handler.

