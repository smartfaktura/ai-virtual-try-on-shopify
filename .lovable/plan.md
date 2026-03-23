

# Add Loading Spinner Over Grid During Sort/Search Refetch

## Problem
When switching to "Oldest", the grid goes to 50% opacity but there's no spinner — it looks frozen/broken.

## Fix

### `src/pages/Jobs.tsx` (line 362)

Wrap the grid in a `relative` container and add a centered spinner overlay when refetching:

```tsx
<div className="relative">
  {isFetching && !isLoading && (
    <div className="absolute inset-0 z-10 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  )}
  <div className={cn("flex gap-1 transition-opacity", isFetching && !isLoading && "opacity-50 pointer-events-none")}>
    {columns.map(...)}
  </div>
</div>
```

`Loader2` is already imported. One file, ~5 lines added.

