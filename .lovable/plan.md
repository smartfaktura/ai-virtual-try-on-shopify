

# Equal-Size Metric Cards with Inline Hover Info Panel

## Concept
Instead of a floating popover that feels disconnected, on hover the card content is replaced in-place by the team avatar + explanation — same card size, smooth crossfade. All cards get a fixed height matching the tallest card (Continue Last).

## Changes

### `src/components/app/MetricCard.tsx`

1. **Fixed equal height**: All cards use `h-[140px]` (matching the "Continue Last" card which has the most content). Remove `min-h-[120px]`.

2. **Remove Popover entirely**: Delete the Radix Popover import and all popover-related code. No more floating external tooltip.

3. **Hover = in-card content swap**: Use `useState(hovered)` with `onMouseEnter`/`onMouseLeave` on the card itself. When hovered and tooltip exists:
   - Hide the normal card content (opacity-0, scale-95)
   - Show the tooltip content in its place (opacity-100, scale-100)
   - Same card dimensions — just the inner content crossfades

   ```text
   Normal state:           Hovered state:
   ┌────────────────┐      ┌────────────────┐
   │ € COST SAVED   │      │ 🟡 Omar        │
   │ €42,930        │  →   │ Based on €30   │
   │ vs photoshoots │      │ avg per photo  │
   └────────────────┘      └────────────────┘
   ```

4. **Animation**: Use `transition-all duration-300` with opacity + slight translateY for smooth crossfade. Both content layers are `absolute inset-0` inside a `relative` container.

5. **Mobile**: On mobile (no hover), show a small tap indicator (subtle info dot in top-right corner). On tap, toggle the same content swap.

6. **Loading skeleton**: Match `h-[140px]`.

### Files
- `src/components/app/MetricCard.tsx` — fixed height, remove popover, add in-card content swap on hover

