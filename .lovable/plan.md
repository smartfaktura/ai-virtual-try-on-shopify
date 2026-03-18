

## Hide Hover Overlay in Select Mode

Simple change in `src/components/app/LibraryImageCard.tsx`. The hover overlay (line 113) currently always shows on hover. Add a `selectMode` check to hide it when bulk selecting.

### Change
**`src/components/app/LibraryImageCard.tsx`** — line 113: add `!selectMode &&` condition to the overlay div, so it doesn't render at all during select mode.

```tsx
// Before:
<div className="absolute inset-0 bg-gradient-to-t ... hidden [@media(hover:hover)]:flex">

// After: wrap the entire overlay in {!selectMode && (...)}
```

One file, one line change.

