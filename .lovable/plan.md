

# Fix: Smooth Loading State for Priority Scene Fetch

## Problem
When the two-tier loading kicks in, there's a brief moment where `isLoadingPriority` is `true` but no skeleton/spinner is shown for the recommended section. The component renders with empty `categoryCollections` (or falls back to hardcoded `CATEGORY_COLLECTIONS`), then snaps to the real data — causing a visible "chop chop" flash.

## Root Cause
1. In `useProductImageScenes.ts` line 238: when `scenes` is null (priority still loading), it falls back to `CATEGORY_COLLECTIONS` (hardcoded data), then switches to DB data — causing a layout jump
2. In `ProductImagesStep2Scenes.tsx`: there's no loading skeleton for the **recommended** section during initial fetch, only for the "Explore more" section

## Fix

### 1. `src/hooks/useProductImageScenes.ts`
- When `hasPriority` and `isLoadingPriority` is true, return empty arrays instead of falling back to hardcoded `CATEGORY_COLLECTIONS` — this prevents the flash of stale/wrong data
- Return `isLoading: true` properly so the UI can show a skeleton

### 2. `src/components/app/product-images/ProductImagesStep2Scenes.tsx`
- Destructure `isLoading` from the hook (not just `isLoadingRest`)
- When `isLoading` is true, show a compact skeleton placeholder for the recommended section: 2-3 pulsing rows mimicking collapsed category headers
- This replaces the current behavior of showing nothing or flashing fallback data

## Result
- User sees a subtle pulse animation for ~100ms while priority scenes load
- Recommended category appears smoothly without any layout shift
- "Explore more" section continues to show its own skeleton while background data loads

## Files Changed
- `src/hooks/useProductImageScenes.ts` — return empty arrays during priority loading instead of fallback
- `src/components/app/product-images/ProductImagesStep2Scenes.tsx` — add loading skeleton for recommended section

