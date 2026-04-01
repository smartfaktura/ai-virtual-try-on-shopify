

# /app/catalog — Round 10 Audit

After 9 rounds of systematic polish, the catalog flow is in excellent shape. Here are the final remaining micro-refinements:

## Findings

### 1. Generated image grid buttons lack `focus-visible` ring
**File: `CatalogGenerate.tsx` lines 386-393 and 504-510**
The `<button>` elements wrapping generated images (both in the completion view and the "generated so far" in-progress view) have no `focus-visible` styling. Keyboard users can't see which image is focused for lightbox opening.

### 2. "Create Your Brand Model" button in Models step lacks `focus-visible` ring
**File: `CatalogStepModelsV2.tsx` line 116**
The empty-state brand model upsell `<button>` has no `focus-visible` styling — inconsistent with the Product Only toggle directly above it which has it.

### 3. "Add Product" dashed card in grid view lacks `focus-visible` ring
**File: `CatalogStepProducts.tsx` line 334**
The "Add Product" dashed border card in the product grid has no `focus-visible` styling, while all product cards around it do.

### 4. Mobile summary drawer trigger button could leak behind bottom nav
**File: `CatalogGenerate.tsx` line 713**
The fixed `bottom-20` positioning assumes a specific bottom nav height. On some mobile viewports with `safe-area-inset-bottom`, this could overlap. Adding `pb-[env(safe-area-inset-bottom)]` padding or adjusting to `bottom-24` would be safer. Minor edge case.

### 5. `isImporting` state in Products step is declared but never used
**File: `CatalogStepProducts.tsx` line 85**
`const [isImporting, setIsImporting] = useState(false)` is declared but the URL import tab uses a static "Coming Soon" disabled button. Dead code.

### 6. Cancel button in generation progress lacks `focus-visible` ring
**File: `CatalogGenerate.tsx` line 438**
The "Cancel" button uses a shadcn `Button` component (which should inherit focus styling), but it's worth confirming. The `AlertDialogAction` and `AlertDialogCancel` inside the dialog should also inherit — this is fine.

### 7. Failed job list items could use `aria-label` for screen readers
**File: `CatalogGenerate.tsx` lines 406-411**
The failed job entries are `<div>` elements with no semantic structure. Adding `role="listitem"` or wrapping in a `<ul>` would improve screen reader navigation for the error list.

## Summary

| # | Item | Effort | Impact |
|---|------|--------|--------|
| 1 | Image grid focus-visible | Trivial | Accessibility |
| 2 | Brand model button focus-visible | Trivial | Accessibility |
| 3 | Add Product card focus-visible | Trivial | Accessibility |
| 4 | Mobile summary safe area | Trivial | Edge case |
| 5 | Remove unused `isImporting` state | Trivial | Code hygiene |
| 6 | Cancel button focus (already OK via shadcn) | None | Confirmed fine |
| 7 | Failed jobs semantic list | Trivial | Accessibility |

## Technical Details

**Item 1** — Add `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` to the generated image `<button>` at lines 386 and 504.

**Item 2** — Add `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl` to the brand model upsell button at line 116.

**Item 3** — Add `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` to the Add Product card at line 334.

**Item 4** — Change `bottom-20` to `bottom-24` on line 713 for safer mobile clearance.

**Item 5** — Remove `const [isImporting, setIsImporting] = useState(false)` from line 85.

**Item 7** — Wrap the failed jobs list in a `<ul role="list">` and change each failed job `<div>` to `<li>`.

These are the absolute last cosmetic items. After this round, every interactive element in the entire catalog flow will have consistent keyboard focus indicators, and all dead code will be removed.

