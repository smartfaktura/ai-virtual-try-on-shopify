

# Fix: Loading Spinner Not Visible During Sort Change

## Problem
The spinner is inside an `absolute inset-0` container that spans the entire grid height. If the grid is tall (many images), the spinner centers itself in the middle of the grid — way below the visible viewport. The user never sees it.

## Fix

### `src/pages/Jobs.tsx` (lines 362-367)

Change the spinner overlay from `absolute` to `sticky` positioning so it stays visible in the viewport:

```tsx
<div className="relative">
  {isFetching && !isLoading && (
    <div className="absolute inset-0 z-10 flex items-start justify-center pt-32">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground sticky top-1/2" />
    </div>
  )}
```

Actually, simpler approach — use `sticky top-1/2` on the spinner wrapper so it sticks to the middle of the viewport as the user scrolls:

```tsx
{isFetching && !isLoading && (
  <div className="absolute inset-0 z-10 flex items-center justify-center">
    <div className="sticky top-[40vh]">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  </div>
)}
```

This keeps the spinner visible regardless of scroll position. One line wrapped, no new imports.

