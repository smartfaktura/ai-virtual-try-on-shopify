
# Fix Image Selection in Results View

## Problem

When hovering over generated images in the results step, the action overlay (expand, download, regenerate buttons) covers the entire image area with `absolute inset-0`. This overlay intercepts all click events, preventing the image selection from working.

**Current behavior:**
- Clicking the image on mobile (no hover) → Works
- Clicking the image on desktop (hover shows overlay) → Doesn't work because overlay blocks clicks
- Clicking the selection indicator at top-right → Works (it's above the overlay)

## Solution

Add an `onClick` handler to the overlay div itself so clicking anywhere on the overlay (except the action buttons) also toggles image selection.

## Implementation

**File: `src/pages/Generate.tsx`**

Around line 1851, update the overlay div:

```tsx
// BEFORE
<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
  {/* action buttons */}
</div>

// AFTER
<div 
  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
  onClick={() => toggleImageSelection(index)}
>
  {/* action buttons - already have e.stopPropagation() */}
</div>
```

The action buttons already have `e.stopPropagation()`, so they will continue to work independently while clicking anywhere else on the overlay will toggle selection.

## Files Changed

| File | Change |
|------|--------|
| `src/pages/Generate.tsx` | Add onClick to overlay div (~line 1851) |

## Result

After this fix:
- Clicking anywhere on the image (including through the overlay) will toggle selection
- Action buttons (expand, download, regenerate) continue working as before
- Selection indicator at top-right continues working as before
- Users can easily select images for publishing to Shopify
