
# /app/catalog Analysis — Issues & Improvements

## Issues Found

### 1. Mobile: Page header overflows
**File: `CatalogGenerate.tsx` line 484-488**
- `PageHeader` + `CatalogTeamStrip` are in a `flex justify-between` row. The team strip is `hidden md:block` (good), but the PageHeader subtitle text "Generate consistent product photography across your entire catalog" is long and may wrap awkwardly on 440px. Could truncate or shorten on mobile.

### 2. Mobile: `pb-32` excessive bottom padding
**File: `CatalogGenerate.tsx` line 482**
- `pb-32` (128px) is too much on mobile where screen real estate is limited. Should be `pb-16 sm:pb-32`.

### 3. Products step: Floating selection bar can overflow on mobile
**File: `CatalogStepProducts.tsx` line ~320+**
- The floating bar contains thumbnails + text + button. Need to verify it has `overflow-hidden` and proper truncation on 440px. The tab gap is already `gap-3 sm:gap-6` which is fine.

### 4. Shots step: "Next: Review" button text is wrong
**File: `CatalogStepShots.tsx` line 141**
- Button says "Next: Review" but the next step is actually **Props** (step 6), not Review (step 7). Should say "Next: Props".

### 5. Props step: Combo list has no empty state when 0 combos
**File: `CatalogStepProps.tsx`**
- If `heroProducts` is empty or `selectedShots` is empty (shouldn't happen due to step validation, but defensive), the combo list renders nothing without explanation.

### 6. Props step: Prop picker modal doesn't reset search on reopen
**File: `CatalogStepProps.tsx` line 68-71**
- `handleOpenChange` resets `localSelected` but not `search`. If user searched, closed, and reopened, old search text persists.

### 7. Review step: Props summary uses `totalImages` for denominator
**File: `CatalogStepReviewV2.tsx` line 133**
- `{combosWithProps}/{totalImages} shots` — but `totalImages` comes from the parent as `products × models × shots`, which IS the same as total combos. This is correct but the variable name is confusing.

### 8. Stepper: Mobile connector lines could use `bg-primary/30` transition
**File: `CatalogStepper.tsx` line 96-98**
- Mobile connectors lack the `transition-colors` class that desktop connectors have. Minor visual inconsistency.

### 9. Context Sidebar: Models count shows "1" text when exactly 1 or 2 models
**File: `CatalogContextSidebar.tsx` line 99**
- When `models.length <= 2`, it shows the number as text ("1" or "2") next to thumbnails. This is redundant since the thumbnails are already visible. Could remove.

### 10. No keyboard navigation for shot cards
**File: `CatalogStepShots.tsx`**
- Shot cards are `<button>` elements (good for a11y), but there's no focus ring styling. Same issue in Background cards.

### 11. Background step: Grid could use 3 columns on mobile
**File: `CatalogStepBackgroundsV2.tsx` line 24**
- Currently `grid-cols-2 sm:grid-cols-3`. Background swatches are simple color blocks — 3 columns would fit fine at 440px and show more options without scrolling.

## Recommended Improvements

| # | Fix | File | Effort |
|---|-----|------|--------|
| 1 | Reduce bottom padding on mobile | `CatalogGenerate.tsx` | Trivial |
| 2 | Fix "Next: Review" → "Next: Props" | `CatalogStepShots.tsx` | Trivial |
| 3 | Reset search on modal reopen | `CatalogStepProps.tsx` | Trivial |
| 4 | Add `transition-colors` to mobile stepper connectors | `CatalogStepper.tsx` | Trivial |
| 5 | Remove redundant model count text when ≤2 | `CatalogContextSidebar.tsx` | Trivial |
| 6 | Use 3-col grid for backgrounds on mobile | `CatalogStepBackgroundsV2.tsx` | Trivial |
| 7 | Shorten PageHeader subtitle on mobile | `CatalogGenerate.tsx` | Small |
| 8 | Add focus-visible ring to shot/bg cards | `CatalogStepShots.tsx`, `CatalogStepBackgroundsV2.tsx` | Small |

All are minor polish fixes. No breaking issues or critical bugs found — the flow is structurally sound.
