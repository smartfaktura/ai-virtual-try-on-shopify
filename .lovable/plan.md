

# Reorder & Rename Dashboard Quick Action Buttons

## Changes — `src/pages/Dashboard.tsx`

### Line 531-539: Swap order and rename
Move "Browse Templates" button to first position (before "Create with Promt") and rename it to **"Create Visuals"**.

**Before:**
1. Create with Promt → `/app/freestyle`
2. Browse Templates → `/app/workflows`

**After:**
1. Create Visuals → `/app/workflows`
2. Create with Promt → `/app/freestyle`

Also update the other two occurrences of "Browse Templates" (lines 457 and 635) to "Create Visuals" for consistency.

