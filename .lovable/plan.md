

# Inline Card Mobile Polish + Drawer Header Left-Align

## Changes

### 1. PostGenerationUpgradeCard — mobile spacing refinements
Current issues on mobile (compact mode):
- `gap-1.5` between rows is too tight — content feels cramped
- The dismiss X button sits far from the CTA with no visual grouping
- Avatar + text row and CTA row need clearer vertical separation

Changes in `PostGenerationUpgradeCard.tsx`:
- Increase vertical padding: `py-2.5` → `py-3` for breathing room
- Increase gap between content row and CTA row in compact mode: `gap-1.5` → `gap-2`
- Move dismiss button to top-right corner as an absolute-positioned element (standard mobile card pattern) so it doesn't compete with the CTA row
- CTA row: left-align button on mobile (remove `justify-end` in compact mode) for better thumb reach

### 2. UpgradeValueDrawer — left-align header on mobile
The `SheetHeader` component defaults to `text-center sm:text-left`. Override by passing `text-left` in the className on line 85 to force left alignment on all viewports.

Change: `SheetHeader className="space-y-2 pb-3"` → `SheetHeader className="space-y-2 pb-3 text-left"`

### Files
- `src/components/app/PostGenerationUpgradeCard.tsx` — lines 62-117 (card layout restructure)
- `src/components/app/UpgradeValueDrawer.tsx` — line 85

