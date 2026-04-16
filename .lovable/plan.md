

# Fix Sticky Close Button — Remove Grey Line

## Problem
The sticky close button wrapper (`div` with `p-4 pb-0`) creates a visible gap/background strip that looks like a grey line separating the X from the content below. This is because the sticky container has its own background from the parent panel's `bg-background/95`.

## Solution
Remove the separate sticky wrapper div entirely. Instead, make the close button `absolute` with `top-4 right-4` (fixed to the panel, not scrollable content) since the parent is already `relative`. This eliminates the grey line while keeping the button always accessible.

### `src/components/app/LibraryDetailModal.tsx` — Lines 188-196

**Before:**
```tsx
{/* Sticky close button */}
<div className="sticky top-0 z-20 flex justify-end p-4 pb-0">
  <button
    onClick={onClose}
    className="text-foreground/70 hover:text-foreground transition-colors"
  >
    <X className="w-7 h-7" strokeWidth={2} />
  </button>
</div>
```

**After:**
```tsx
<button
  onClick={onClose}
  className="absolute top-4 right-4 z-20 text-foreground/70 hover:text-foreground transition-colors"
>
  <X className="w-7 h-7" strokeWidth={2} />
</button>
```

Also restore `overflow-y-auto` to the full panel (line 187) and remove the extra `flex-1 overflow-y-auto` wrapper (line 198), reverting to the simpler structure but keeping the button outside the scroll via `absolute` positioning on the `relative` parent.

| File | Change |
|------|--------|
| `src/components/app/LibraryDetailModal.tsx` | Replace sticky wrapper with absolute-positioned close button, remove extra scroll wrapper |

