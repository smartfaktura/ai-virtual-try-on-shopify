

# Set Default Grid Layout to 3 Columns (Desktop/Tablet) and 2 Columns (Mobile)

## Changes

### File: `src/pages/Workflows.tsx`

1. **Change default layout** from `'rows'` to `'3col'` (line 38) — so new users and users without a saved preference see the 3-column grid by default.

2. **Fix the mobile/tablet clamp logic** (line 49) — currently `isMobile` only covers `<768px`. Need to allow `'3col'` on tablet too (768–1279px). The current clamp forces tablet to `'2col'` which is wrong per the request. Change:
   - `const effectiveLayout = isMobile && layout === '3col' ? '2col' : layout;`
   - To: `const effectiveLayout = isMobile ? (layout === '3col' ? '2col' : layout) : layout;`
   - This keeps 3col available on tablet (since `isMobile` is `<768`), and clamps to 2col on mobile. Tablet and desktop both get 3col by default.

3. **Update grid column classes** (lines 473 and 500) — currently `'3col'` uses `grid-cols-2 lg:grid-cols-3`. Change to `grid-cols-2 md:grid-cols-3` so tablet (≥768px) also gets 3 columns instead of waiting for `lg` (≥1024px).

These are the only changes needed — 3 small edits in one file.

