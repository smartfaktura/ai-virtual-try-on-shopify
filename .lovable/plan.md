

# Add Mobile Recreate Button to Public Freestyle Cards

## Problem
On mobile, hover overlays don't work, so users can't see the "Recreate this" button on gallery cards. Currently the only way to recreate is through the detail modal.

## Solution
Add a small, always-visible "Recreate" button in the bottom-right corner of each card on touch devices. On desktop (hover-capable), keep the existing hover overlay behavior unchanged.

## Changes

### `src/components/app/DiscoverCard.tsx`

Add a mobile-only recreate button that's always visible on non-hover devices:

- After the hover overlay div (line 128), add a new element visible only on touch devices (`[@media(hover:hover)]:hidden`)
- Small pill button in the bottom-right corner with `ArrowRight` icon and "Recreate" text
- Only renders when `onRecreate` prop is provided
- Uses `e.stopPropagation()` to prevent opening the detail modal
- Styled with semi-transparent background (`bg-white/90 backdrop-blur-sm`) to float over the image

This keeps `DiscoverCard` generic — the button only appears when `onRecreate` is passed, which the public freestyle page already does.

### Files
- `src/components/app/DiscoverCard.tsx` — add always-visible mobile recreate button

