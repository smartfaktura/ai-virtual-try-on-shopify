

# Improve Admin Models Page — Move to Top + Polish

## Current State
The page already has:
- Image replacement (click thumbnail for custom models)
- Delete with styled AlertDialog confirmation
- Reorder with up/down arrows and jump-to-position

## What to Add/Fix

### 1. "Move to Top" button
Add a quick-action button (arrow-up-to-line icon or similar) next to the existing up/down arrows that instantly moves any model to position #1 in the list.

### 2. Polish existing flows
- Ensure the "move to top" triggers unsaved-order state so the "Save Order" button appears
- Verify the delete flow works for both custom models (hard delete) and that built-in models correctly show "read-only"

## Technical Details

### File: `src/pages/AdminModels.tsx`
- Import `ArrowUpToLine` from lucide-react (or use `ChevronsUp`)
- Add a `moveToTop` callback that splices the model from its current position and inserts it at index 0, then calls `setLocalOrder`
- Add a button with tooltip "Move to top" in the reorder controls area (next to up/down arrows), disabled when already at position 1
- The button triggers `moveToTop(globalIndex)` which reuses the same pattern as `moveModel` but always targets index 0

### No database or backend changes needed
All reorder logic is client-side until "Save Order" is clicked, which already handles arbitrary reordering.

