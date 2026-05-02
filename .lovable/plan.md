## Findings

**Images**: All 24 pvImages URLs in `workflowAnimationData.tsx` use the correct Supabase storage paths with `getOptimizedUrl` quality optimization. No console errors related to image loading. No conflicts between the hero card and compact card — they use independent component state.

**Rotation speed mismatch**: The "Explore More Visual Types" compact cards use `interval: 750` (0.75s) from the scene data, while the hero card rotates at 3000ms. The 750ms interval is extremely fast for browsing.

## Changes

### 1. Update rotation interval for all carousel scenes (`src/components/app/workflowAnimationData.tsx`)

Change `interval: 750` to `interval: 3000` for the following scenes:
- Product Visuals (line 100)
- Virtual Try-On Set (line 118)
- Product Listing Set (line 141)
- Selfie / UGC Set (line 163)

This makes all carousel thumbnails rotate at the same 3-second pace as the hero card.
