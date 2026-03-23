

# Fix Mobile Workflow Cards Layout

## Problem
On mobile (390px), the horizontal scroll carousel makes cards unequal sizes and hard to navigate. Cards at `min-w-[200px]` don't fill the screen well and the scroll pattern isn't intuitive for 3 items.

## Solution
Replace the horizontal scroll with a **vertical stack** on mobile — show all 3 cards in a single column, each full-width. This is cleaner, easier to scan, and eliminates the carousel confusion.

## Changes

### `src/components/app/StartWorkflowModal.tsx` (~line 203-206)

Change mobile layout from horizontal scroll to vertical stack:
```
Mobile: "flex flex-col gap-3"  (was: "flex gap-3 overflow-x-auto snap-x snap-mandatory")
```
Remove the `min-w-[200px] snap-center shrink-0` wrapper on mobile cards.

For each card on mobile, use a **horizontal layout** (image left, text right) instead of the tall vertical card — switch to a compact row format:
- Image thumbnail: `w-24 h-24 rounded-xl` on the left
- Title + subtitle + CTA on the right

### `src/components/app/WorkflowCardCompact.tsx`

Add a `mobileRow` prop (passed when `isMobile && modalCompact`). When `mobileRow` is true:
- Card layout: `flex-row` instead of `flex-col`, with image at `w-28 aspect-square` and text content filling the right side
- This keeps all 3 cards visible without scrolling, at a comfortable size

### Files
- `src/components/app/StartWorkflowModal.tsx` — vertical stack on mobile
- `src/components/app/WorkflowCardCompact.tsx` — add horizontal row variant for mobile modal

