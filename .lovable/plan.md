

# Fix Modal Card Sizing for Better Fit

## Problem
The `WorkflowCardCompact` cards use `aspect-[3/4]` (desktop) or `aspect-[2/3]` (mobile) thumbnails designed for the full Workflows hub page. Inside a constrained modal/drawer, three of these cards are too tall and cramped - hard to see details, especially on mobile.

## Solution

Add a `modalCompact` prop to `WorkflowCardCompact` that uses a shorter thumbnail ratio and tighter content spacing, specifically for the modal context.

### `src/components/app/WorkflowCardCompact.tsx`

- Add `modalCompact?: boolean` prop
- When `modalCompact` is true:
  - Thumbnail uses `aspect-square` instead of `aspect-[3/4]` or `aspect-[2/3]` - significantly shorter, fits 3-up in the modal
  - Content area uses `p-2` with tighter spacing
  - Title uses `text-xs`, description hidden
  - Button uses compact `h-7` size
- This keeps the animated thumbnails but in a size that fits the modal

### `src/components/app/StartWorkflowModal.tsx`

- Pass `modalCompact` to `WorkflowCardCompact` instead of `mobileCompact={isMobile}`
- Reduce gap in the grid: `gap-2` on mobile, `gap-3` on desktop
- On mobile drawer, use `grid-cols-3 gap-2` so cards sit side-by-side without overflow

### Files
- `src/components/app/WorkflowCardCompact.tsx` - add `modalCompact` prop with shorter aspect ratio
- `src/components/app/StartWorkflowModal.tsx` - pass `modalCompact` instead of `mobileCompact`

