

# Move Saved Back Into Category Scroll List

## Problem
The separate heart icon on mobile doesn't show the count and feels disconnected. Better to put "Saved" back as the last pill inside the scrollable row, showing the count, on both mobile and desktop.

## Changes

### File: `src/components/app/DiscoverCategoryBar.tsx`

1. **Remove the separate Saved section** (lines 98-129) — delete the divider, desktop pill, and mobile heart icon entirely.

2. **Add Saved pill inside the scrollable container** (after the `categories.map` loop, still inside the scroll div), only when `savedCount > 0`:

```tsx
{savedCount !== undefined && savedCount > 0 && (
  <button
    key="saved"
    onClick={() => onSelectCategory('saved')}
    className={cn(
      'px-5 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-200 whitespace-nowrap shrink-0',
      selectedCategory === 'saved'
        ? 'bg-foreground text-background shadow-sm'
        : 'bg-muted/20 text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground'
    )}
  >
    Saved<span className="ml-1.5 text-xs opacity-70">· {savedCount}</span>
  </button>
)}
```

3. **Remove `Heart` import** since it's no longer used.

### Result
"Saved · N" appears as the last pill in the scrollable row on both mobile and desktop. Hidden when no saved items. Same styling as all other pills.

