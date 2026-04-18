

## Tighten metric card numbers + equalize card heights

### Issues seen at 1276px viewport
1. `text-3xl sm:text-4xl` (36px) numbers too large — overpowering and pushing some cards taller than others.
2. Cards in the row have inconsistent heights because some have `suffix`, some have `description`, some have `progress` bar, some have `action` button — `min-h` only sets a floor, not equal height.

### Changes — `src/components/app/MetricCard.tsx`

1. **Number size down one step**: `text-3xl sm:text-4xl` → `text-2xl sm:text-3xl` (24/30px). Still clearly the hero (matches credits pill `text-2xl`), no longer overpowering.
2. **Description (no-value) variant**: `text-xl sm:text-2xl` → `text-base sm:text-lg font-semibold` so empty-state cards don't visually outweigh real numbers.
3. **Equal heights**: replace `min-h-[120px] sm:min-h-[160px]` with fixed `h-[140px] sm:h-[170px]` so every card in the grid is identical regardless of content (suffix/progress/action).
4. Keep `flex flex-col justify-between` so top content sits at top, progress/action sit at bottom.

### Acceptance
- All 5 metric cards in the dashboard row are exactly the same height.
- Numbers feel confident but not oversized — roughly matching the credits pill in the sidebar.
- Empty-state copy ("No recent workflow", "Generate to discover") sits as a clear subtitle, not competing with real numeric values.

