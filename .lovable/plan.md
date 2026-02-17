

## Remove the Visible Scrollbar from Recent Creations Row

### Problem

The horizontal scroll container uses a `scrollbar-none` CSS class that doesn't exist in the project's styles or Tailwind config. This means the native browser scrollbar is visible beneath the cards — that's the gray bar ("slider") you see under the first card.

### Fix

**File: `src/components/app/WorkflowRecentRow.tsx`**

The container already has an inline style object but only hides scrollbars for Firefox and IE. The `scrollbar-none` class does nothing because it's not defined. The fix:

1. Remove the non-functional `scrollbar-none` class from the scroll container
2. Add inline styles to hide the scrollbar across all browsers (WebKit + Firefox):
   - Add `WebkitOverflowScrolling: 'touch'` for smooth iOS scrolling
   - The container already uses `overflow-x-auto` which is correct

Alternatively, add a global CSS utility class `.scrollbar-none` in `src/index.css` so it works everywhere it's used in the project.

**Recommended approach — add the utility once in CSS so all scroll containers benefit:**

**File: `src/index.css`** — Add at the bottom:
```css
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
```

This single addition fixes the scrollbar visibility for this component and any other component using `scrollbar-none`.

Also clean up leftover unused state (`activeIndex`, `handleScroll`, scroll listener effect) from `WorkflowRecentRow.tsx` since the dot indicators were removed — this is dead code now.

### Files to Change

| File | Change |
|------|--------|
| `src/index.css` | Add `.scrollbar-none` utility (3 lines) |
| `src/components/app/WorkflowRecentRow.tsx` | Remove unused `activeIndex` state, `handleScroll` callback, and scroll listener `useEffect` (dead code from removed dots) |

