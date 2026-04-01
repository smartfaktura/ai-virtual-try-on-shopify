

# Fix Style Cards: Equal Height + Consistent Color Strip

## Problem
Cards have unequal heights because:
1. Descriptions vary in length across styles
2. The "Popular" badge only appears on one card, adding extra height
3. No `min-height` or flex stretch applied

## Fix — `CatalogStepFashionStyle.tsx`

1. **Equal height grid**: Add `grid` with `items-stretch` so all cards fill the tallest card's height
2. **Card layout**: Make each card `flex flex-col h-full` so the color strip stays at the top and content fills remaining space
3. **Description area**: Give description a fixed `min-h-[3rem]` (or use `line-clamp-3`) so text areas align
4. **Popular badge**: Always reserve space for the badge row (render invisible placeholder when not shown) so cards with/without badge are the same height
5. **Color strip**: Already at top — just ensure `overflow-hidden rounded-xl` doesn't clip it (it doesn't, confirmed in code)

Single file change: `src/components/app/catalog/CatalogStepFashionStyle.tsx`

