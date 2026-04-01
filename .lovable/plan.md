

# /app/catalog — Round 7 Audit

After six rounds of fixes, the flow is highly polished. Here are the remaining micro-improvements I found:

## Findings

### 1. Shots step has excessive bottom padding (`pb-44`) causing wasted space
**File: `CatalogStepShots.tsx` line 44**
The container uses `pb-44` (176px) to ensure the sticky credit calculator doesn't overlap content. This is generous — `pb-36` or `pb-32` would suffice and avoid the impression of a broken layout when scrolled to the bottom on desktop.
**Fix**: Reduce to `pb-36`.

### 2. Review step: "Edit" buttons on each section lack `focus-visible` ring
**File: `CatalogStepReviewV2.tsx` line 43**
The `SectionEditButton` is a raw `<button>` with no focus-visible styling. Keyboard users can't see which Edit button is focused.
**Fix**: Add `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded` to the button.

### 3. Products floating selection bar uses `<img>` instead of `<ShimmerImage>`
**File: `CatalogStepProducts.tsx` lines 476-481**
The mini product thumbnails in the sticky bottom bar use raw `<img>` tags, which don't get the shimmer loading placeholder that every other image in the flow uses. This creates a flash of empty space before images load.
**Fix**: Replace `<img>` with `<ShimmerImage>`.

### 4. Review step model images use raw `<img>` instead of `<ShimmerImage>`
**File: `CatalogStepReviewV2.tsx` line 129**
Same issue — model preview thumbnails in the review strip use `<img>` while everything else uses `<ShimmerImage>`.
**Fix**: Replace with `<ShimmerImage>`.

### 5. Sidebar model images use raw `<img>` instead of `<ShimmerImage>`
**File: `CatalogContextSidebar.tsx` line 90**
Model preview circles in the sidebar use `<img>`. Inconsistent with the rest of the app.
**Fix**: Replace with `<ShimmerImage>`.

### 6. Products step: grid view product card lacks `focus-visible` ring
**File: `CatalogStepProducts.tsx` line 281-328**
The product card `<button>` in grid view has no focus-visible styling. List view cards also lack it.
**Fix**: Add `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` to both grid and list product buttons.

### 7. View toggle buttons (grid/list) lack `focus-visible` ring
**File: `CatalogStepProducts.tsx` lines 239-261**
The grid/list toggle pill buttons have no focus-visible ring.
**Fix**: Add `focus-visible:ring-2 focus-visible:ring-primary` to both.

### 8. Download All button has no loading/progress indicator
**File: `CatalogGenerate.tsx` lines 353-363**
For large catalogs (20+ images), the ZIP download takes several seconds. The button gives no feedback — users may click it multiple times.
**Fix**: Add a `downloading` state that disables the button and shows a spinner while the ZIP is being assembled.

### 9. `handleNewGeneration` doesn't reset `showCancelDialog`
**File: `CatalogGenerate.tsx` line 266-279**
When starting a new generation after completion, `showCancelDialog` isn't reset. Not a visible bug since it defaults to `false` and the dialog auto-closes, but stale state.
**Fix**: Add `setShowCancelDialog(false)` to `handleNewGeneration`.

## Summary

| # | Item | Effort | Impact |
|---|------|--------|--------|
| 1 | Reduce shots step padding | Trivial | Layout |
| 2 | Edit button focus-visible | Trivial | Accessibility |
| 3 | ShimmerImage in selection bar | Trivial | Visual consistency |
| 4 | ShimmerImage in review models | Trivial | Visual consistency |
| 5 | ShimmerImage in sidebar models | Trivial | Visual consistency |
| 6 | Product card focus-visible | Trivial | Accessibility |
| 7 | View toggle focus-visible | Trivial | Accessibility |
| 8 | Download All loading state | Small | UX feedback |
| 9 | Reset cancel dialog state | Trivial | Clean state |

All items are trivial polish. Items 3-5 (ShimmerImage consistency) and 6-7 (focus rings) can be batched.

## Technical Details

**Items 3-5** — Replace `<img src={...} alt={...} className="..." />` with `<ShimmerImage src={...} alt={...} className="..." />` in:
- `CatalogStepProducts.tsx` line 478
- `CatalogStepReviewV2.tsx` line 129
- `CatalogContextSidebar.tsx` line 90

**Item 8** — Add `const [isDownloading, setIsDownloading] = useState(false)` and wrap the `downloadDropAsZip` call:
```tsx
<Button
  variant="outline"
  disabled={isDownloading}
  onClick={async () => {
    setIsDownloading(true);
    try { await downloadDropAsZip(images, 'Catalog-Export'); }
    finally { setIsDownloading(false); }
  }}
>
  {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
  {isDownloading ? 'Preparing...' : 'Download All'}
</Button>
```

