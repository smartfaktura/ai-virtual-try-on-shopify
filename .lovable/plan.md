

# Remove Redundant "Compare all plans" Button

## Problem
The "Compare all plans" link appears at the bottom of the Plans tab inside the Buy Credits modal. The user is already viewing and comparing plans — this button is pointless and just closes the modal to navigate to `/app/settings`.

## Change

### File: `src/components/app/BuyCreditsModal.tsx` (lines 417-431)

Remove the "Compare all plans" button from the bottom links row. Keep only the "Need more? Contact Sales" link, and center it or keep it left-aligned.

**Before:**
```
<div className="flex items-center justify-between">
  <button>Need more? Contact Sales ↗</button>
  <button>Compare all plans</button>  ← remove
</div>
```

**After:**
```
<div>
  <button>Need more? Contact Sales ↗</button>
</div>
```

### Files
- `src/components/app/BuyCreditsModal.tsx` — remove 1 button (~6 lines)

