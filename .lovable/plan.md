

## Fix: Show Upscale Button for All Image Types (Not Just Freestyle)

### The Problem
The "Upscale to PRO HD" button currently only appears for freestyle images (`item.source === 'freestyle'`). When you open a Generation/Try-On image, you only see "Download Image" -- no upscale or delete buttons.

### The Fix
Remove the `item.source === 'freestyle'` condition from the upscale button so it appears for **all** image types (freestyle and generation). The delete button stays freestyle-only since generation jobs have their own lifecycle.

### Changes

**File: `src/components/app/LibraryDetailModal.tsx`** (line 203)

Remove the freestyle-only condition from the upscale button:

```typescript
// Before:
{!isUpscaled && item.source === 'freestyle' && (

// After:
{!isUpscaled && (
```

This single change makes the "Upscale to PRO HD -- 4 cr" button visible for both freestyle and generation images. The edge function already handles both source types (`sourceType: 'freestyle' | 'generation'`).

### Files to Edit
- `src/components/app/LibraryDetailModal.tsx` -- remove `item.source === 'freestyle'` from upscale button condition (line 203)
