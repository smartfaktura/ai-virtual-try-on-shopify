

# Improve Freestyle Chip Layout — Two-Row Wrap (No Scrolling)

## Problem

All chips sit in a single `flex-wrap` row, causing unpredictable line breaks and orphaned dividers. On mobile, 8+ chips in one flat wrap looks cluttered.

## Solution: Two Logical Rows, Natural Wrap

No horizontal scrolling. Instead, split chips into two rows using a vertical `space-y-2` container. Each row uses `flex-wrap` so chips wrap naturally if the viewport is very narrow.

### Desktop / Tablet (≥768px)

```text
Row 1: [+ Upload] [Product] [Model] [Scene]          ← inputs
Row 2: [Framing] [Brand] [4:5] [Camera] [Quality]    ← settings
```

Two rows fit cleanly at 768px+. Remove the vertical pipe dividers — row separation handles visual grouping.

### Mobile (<768px)

Same two-row structure with `flex-wrap gap-1.5`. Chips are small enough (h-8, ~60-80px each) that 3-4 fit per line on a 360px screen, wrapping naturally to a second line within each row if needed. No scrolling.

## File: `FreestyleSettingsChips.tsx`

**Desktop return** (lines 288-327):
- Replace single `flex items-center gap-1.5 flex-wrap` with a `space-y-2` wrapper containing two `flex items-center gap-1.5 flex-wrap` rows
- Row 1: uploadButton, productChip, modelChip, sceneChip
- Row 2: FramingSelectorChip, BrandProfileChip, aspectRatioChip, cameraStyleChip, qualityChip
- Remove the two `<div className="h-5 w-px bg-border/60 mx-1" />` dividers

**Mobile return** (lines 256-284):
- Same two-row structure with `space-y-1.5` wrapper
- Row 1: uploadButton, productChip, modelChip, sceneChip
- Row 2: aspectRatioChip, FramingSelectorChip, cameraStyleChip, qualityChip, BrandProfileChip
- `gap-1.5` instead of `gap-2` to fit more per line

~10 lines changed total.

