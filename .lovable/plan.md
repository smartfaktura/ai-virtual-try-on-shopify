

# Add Skeleton Loading State for Product Grid

## Problem
When products are loading (`isLoading = true`), the current UI shows a single centered spinner — this feels abrupt and doesn't hint at the grid layout that's about to appear.

## Fix

**File: `src/components/app/product-images/ProductImagesStep1Products.tsx`**

Replace the simple `Loader2` spinner (lines 92-95) with a skeleton grid that mirrors the real product card layout:

```tsx
{isLoading ? (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="rounded-xl border-2 border-border overflow-hidden">
        <Skeleton className="aspect-square" />
        <div className="h-[52px] flex flex-col justify-center px-2.5 gap-1.5">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-2.5 w-1/2" />
        </div>
      </div>
    ))}
  </div>
)
```

This shows 8 placeholder cards with the same aspect-square image area + title/type text lines, using the existing `Skeleton` component with its `animate-pulse` effect. Matches the real grid dimensions exactly so there's zero layout shift when products load in.

Add `Skeleton` to the imports from `@/components/ui/skeleton`.

## Impact
- 1 file changed
- Smooth, polished loading state that previews the grid layout

