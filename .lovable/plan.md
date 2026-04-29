## Library grid spacing — proper fix

The previous inset ring helped but the grid's `gap-2` (8px) is too tight: when two neighboring cards are both selected, their dark inset rings sit only 8px apart and read as a single merged block in the screenshot.

### Single change
Bump the masonry gap from `gap-2` → `gap-3` (12px) in both axes.

`src/pages/Jobs.tsx` lines 600-602:

```diff
- <div className="flex gap-2">
+ <div className="flex gap-3">
    {columns.map((col, i) => (
-     <div key={i} className="flex-1 flex flex-col gap-2">
+     <div key={i} className="flex-1 flex flex-col gap-3">
```

That gives a clear 12px channel of background between every card, so adjacent selected rings are visibly separated. Inset ring stays as is (no overflow risk).

### Files touched
- `src/pages/Jobs.tsx` (2 class swaps)