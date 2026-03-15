

## Optimize Freestyle Pills Layout on Mobile

### Problem
The chip rows use `flex-wrap`, causing unpredictable layout reflows when selections change (chip text gets longer with product/model names like "Elevate You..." vs just "Product"). This makes the layout jump around.

### Solution
Replace `flex-wrap` with horizontal scrolling (`overflow-x-auto flex-nowrap`) for both chip rows on mobile. This keeps the layout stable regardless of chip content width — users just swipe horizontally to see all options.

### Changes — `src/components/app/freestyle/FreestyleSettingsChips.tsx`

**Row 1 (Assets)** — line ~320:
- Change `flex items-center gap-2 flex-wrap` → `flex items-center gap-2 overflow-x-auto flex-nowrap scrollbar-hide pb-1`
- Add `shrink-0` to each chip wrapper so they don't compress

**Row 2 (Settings)** — line ~362:
- Same change: `flex items-center gap-2 flex-wrap` → `flex items-center gap-2 overflow-x-auto flex-nowrap scrollbar-hide pb-1`

**Style row (inside CollapsibleContent)** — line ~386:
- Same treatment for consistency

**Add scrollbar-hide utility** — ensure `scrollbar-hide` class exists in `src/index.css` (hide scrollbar but keep scroll functionality)

| File | Change |
|---|---|
| `src/components/app/freestyle/FreestyleSettingsChips.tsx` | Switch mobile chip rows from `flex-wrap` to `overflow-x-auto flex-nowrap` with `shrink-0` on chips |
| `src/index.css` | Add `.scrollbar-hide` utility if not already present |

