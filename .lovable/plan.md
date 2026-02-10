

## Fix Recent Creations Gallery Loading Flicker

### Problem

The `RecentCreationsGallery` component defaults `creations` to an empty array (`[]`) while the query is loading. This means:

1. On first render, `creations.length === 0` is true (data hasn't loaded yet)
2. The placeholder "What You Can Create" gallery renders with sample images
3. Once the query resolves with real data, the component swaps to "Recent Creations"
4. This causes a visible flicker -- the title, subtitle, images, and layout all change at once

### Solution

Use the query's `isLoading` state to show a skeleton/shimmer while data is being fetched, instead of immediately falling through to the placeholder view. Only show the placeholder "What You Can Create" when the query has finished and returned zero results.

### File: `src/components/app/RecentCreationsGallery.tsx`

1. Extract `isLoading` from `useQuery` alongside `data`
2. While `isLoading` is true, render a shimmer skeleton matching the gallery layout (title skeleton + row of image card skeletons)
3. Only check `creations.length === 0` after loading is complete to decide between real creations vs. placeholder view

The skeleton will consist of:
- A skeleton line for the title area
- A horizontal row of 5-6 shimmer cards matching the `w-[180px] aspect-[4/5]` dimensions of real cards

This eliminates the flash of placeholder content before real data arrives.

### Technical Details

```tsx
const { data: creations = [], isLoading } = useQuery({ ... });

// Show skeleton while loading
if (isLoading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-48" />
      <div className="flex gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="flex-shrink-0 w-[180px] aspect-[4/5] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// Now safely check if user has real creations or show placeholders
const isPlaceholder = creations.length === 0;
```

One file change only. Uses the existing `Skeleton` component from `src/components/ui/skeleton.tsx`.
