

# Optimize "More Like This" Thumbnails in Discover Detail Modals

## Problem
The "More like this" grid in both `DiscoverDetailModal` and `PublicDiscoverDetailModal` loads **full-size images** — no `getOptimizedUrl()` is applied. These thumbnails render at ~120px wide but download multi-megabyte originals.

## Fix

### `src/components/app/DiscoverDetailModal.tsx` (line 481)
### `src/components/app/PublicDiscoverDetailModal.tsx` (line 206)

Wrap `riImage` with `getOptimizedUrl()` — quality-only compression (no width to avoid aspect ratio issues, per project convention):

```tsx
// Before
<ShimmerImage src={riImage} ...

// After
<ShimmerImage src={getOptimizedUrl(riImage, { quality: 60 })} ...
```

Both files already import `getOptimizedUrl`. Two files, 1 line each.

