

## Add Shimmer Loading to Discover Detail Modals

The Discover detail modals use raw `<img>` tags causing images to appear progressively (loading in parts). The Library modal already uses `ShimmerImage` for smooth shimmer-to-fade transitions. Apply the same pattern.

### Changes

**`src/components/app/DiscoverDetailModal.tsx`**
- Import `ShimmerImage` from `@/components/ui/shimmer-image`
- Replace the main `<img>` (line 138-142) with `ShimmerImage`, adding `wrapperClassName` for centering
- Replace the "More like this" thumbnail `<img>` tags (line 334) with `ShimmerImage`

**`src/components/app/PublicDiscoverDetailModal.tsx`**
- Import `ShimmerImage`
- Replace the main `<img>` (line 72-76) with `ShimmerImage` with wrapper styling
- Replace the "More like this" thumbnail `<img>` tags (line 133) with `ShimmerImage`

Both modals will then show a shimmer animation while images load, then crossfade smoothly — matching the Library behavior.

