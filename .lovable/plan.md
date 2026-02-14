

## Fix Scene Preview Images and Remove Hover Tooltips

### 1. Fix Image Display: Use `object-cover` to Fill 1:1 Square

The current `object-contain` leaves empty space (letterboxing) inside the square container. Change back to `object-cover` so images fill the 1:1 square naturally -- this crops edges slightly but shows the image at the correct zoom level without empty bars.

**File:** `src/pages/Generate.tsx` line 1489
- Change `object-contain` to `object-cover`

### 2. Remove Tooltip for All Users (Keep Admin-Only)

The `<TooltipProvider>` still wraps the entire grid for all users, causing hover text to appear. The fix already has the admin-only conditional, but the `<TooltipProvider>` wrapper and the non-admin `<div key={i}>` wrapper need cleanup:

**File:** `src/pages/Generate.tsx`
- Move `<TooltipProvider>` inside the admin check so it only renders for admins
- For non-admin users, render the card directly without any tooltip wrapper

### Technical Details

| Line | Current | Change |
|------|---------|--------|
| 1489 | `object-contain` | `object-cover` |
| ~1458/1542 | `<TooltipProvider>` wraps all | Only wrap when `isAdmin` |

Two small edits in `src/pages/Generate.tsx`.

