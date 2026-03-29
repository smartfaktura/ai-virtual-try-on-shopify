

# Fix Zoomed-In Product Images in Workflow Thumbnails

## Problem
Adding `width: 600` to `getOptimizedUrl` calls causes Supabase's image transform to resize and crop images, creating a zoomed-in effect on product thumbnails. The project's established convention is **quality-only compression** (no width constraint) to prevent this exact distortion.

## Fix
Revert the `width` parameter from all `getOptimizedUrl` calls added in the previous optimization pass. Keep `quality: 60` for bandwidth savings.

### Files to change

**`src/components/app/WorkflowAnimatedThumbnail.tsx`** — Remove `width: 600` from all 5 occurrences:
- Line 237: `{ width: 600, quality: 60 }` → `{ quality: 60 }`
- Line 348: same
- Line 526: same
- Line 528: same
- Line 748: same

**`src/components/app/WorkflowCard.tsx`** — Remove `width: 480` from fallback img:
- `{ width: 480, quality: 60 }` → `{ quality: 60 }`

**`src/components/app/WorkflowCardCompact.tsx`** — Remove `width: 480` from both fallback imgs:
- Same change in two locations

**`src/pages/Dashboard.tsx`** — Remove `width: 480` if added:
- Same change

All calls keep `{ quality: 60 }` for compression without dimensional distortion.

