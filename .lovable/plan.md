

# Mobile Optimization for Catalog Studio Steps

Viewport is 440px. I'll audit each step component and the page layout for mobile issues and fix them.

## Issues Found

### 1. Page Layout (`CatalogGenerate.tsx`)
- Sidebar is `hidden lg:block` — already hidden on mobile, good
- `pb-32` may be excessive on mobile
- No horizontal padding issues

### 2. Stepper (`CatalogStepper.tsx`)
- Mobile stepper shows 7 icon buttons + labels in a row with `px-2` — at 440px, 7 items × ~50px each = ~350px, tight but connector lines `w-4 mx-0.5` add up
- Labels `text-[9px]` may get truncated or overlap
- **Fix**: Hide labels on mobile, show only icons. Use `flex-1` between items for even spacing. Remove fixed `w-4` connectors on mobile.

### 3. Products Step (`CatalogStepProducts.tsx`)
- Grid is `grid-cols-2` on mobile — fits at 440px
- Tabs bar `gap-6` could be tight — labels "My Products", "Import URL", "Upload CSV" may overflow
- **Fix**: Reduce tab gap to `gap-3` on mobile, use shorter labels or allow wrapping
- Floating selection bar: `px-5` + thumbnails + text + button may overflow
- **Fix**: Reduce padding, hide some thumbnails on mobile

### 4. Style Step (`CatalogStepFashionStyle.tsx`)
- Grid `grid-cols-1 sm:grid-cols-2` — on 440px (<640px) it's single column, fine
- No issues

### 5. Models Step (`CatalogStepModelsV2.tsx`)
- Brand models grid: `grid-cols-4 sm:grid-cols-5` — at 440px, 4 columns = ~100px each, tight but workable
- Library models grid: same pattern
- **Fix**: Use `grid-cols-3` as base for smaller phones, `grid-cols-4 sm:grid-cols-5`

### 6. Backgrounds Step (`CatalogStepBackgroundsV2.tsx`)
- Grid `grid-cols-2 sm:grid-cols-3` — 2 columns at 440px, fine
- No issues

### 7. Shots Step (`CatalogStepShots.tsx`)
- Grid `grid-cols-2 sm:grid-cols-3` — fine
- Credit calculator bar: text wraps via `flex-wrap`, should be OK
- **Fix**: Reduce padding in pinned credit bar on mobile

### 8. Props Step (`CatalogStepProps.tsx`)
- Combo rows pack many elements in a single flex row: number + thumbnail + shot badge + title + prop chips + button — this WILL overflow at 440px
- **Fix**: Stack the combo row on mobile — product info on one line, props + actions on a second line
- Prop picker modal `sm:max-w-lg` — on mobile it should be full-screen
- **Fix**: Add `max-w-full` or use sheet pattern on mobile

### 9. Review Step (`CatalogStepReviewV2.tsx`)
- Product thumbnails: `w-14` in a horizontal scroll — fine
- Credit calculation: text wraps via `flex-wrap` — fine
- Style + Background row: `flex gap-6` may not wrap
- **Fix**: Make style/bg row wrap on mobile

## Files to Modify

| File | Changes |
|------|---------|
| `CatalogStepper.tsx` | Hide labels on mobile (icon-only), use even spacing |
| `CatalogStepProducts.tsx` | Reduce tab gap on mobile, compact floating bar |
| `CatalogStepModelsV2.tsx` | Change base grid to `grid-cols-3` |
| `CatalogStepShots.tsx` | Reduce padding in pinned credit bar |
| `CatalogStepProps.tsx` | Stack combo rows on mobile, full-screen picker modal, responsive prop chips |
| `CatalogStepReviewV2.tsx` | Wrap style/bg row on mobile |

