

## Fix: Revert ShimmerImage Lazy-Skip That Broke Image Ratios

### Problem
The change that skips the `new Image()` cache probe for lazy images causes all lazy images to start with `opacity: 0`. Since the ShimmerImage wrapper uses `h-full` with no explicit height, the container collapses to 0px until the image finishes loading — resulting in broken aspect ratios and layout jumps.

### Fix
Revert the `isLazy` check in `shimmer-image.tsx` (lines 42-43). Restore the original cache probe that runs for all images. The other three optimizations (responsive render count, `width: 400` on cards, deferred queries) already solve the in-app browser performance issue without needing this change.

### File
- `src/components/ui/shimmer-image.tsx` — remove the `isLazy` early-return, restore original `useState` initializer

### Change detail
```typescript
// Before (broken):
const isLazy = rest.loading === 'lazy' && fetchPriority !== 'high';
if (isLazy) return false;

// After (restored):
// Remove these two lines, keep the rest of the initializer unchanged
```

