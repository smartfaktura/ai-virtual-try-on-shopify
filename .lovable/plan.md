

# Improve MetricCard Hover UX & Equal Card Sizing

## Problems
1. Popover appears abruptly with no smooth entrance — feels disconnected from the card
2. The popover positioning (below-left) can feel jarring; it should feel like a natural extension of the card
3. Cards have different heights — stat cards vs action cards aren't equal
4. On the screenshot, the popover box looks like a separate disconnected element

## Changes

### `src/components/app/MetricCard.tsx`

**Equal card sizing**: Add `min-h-[120px]` to card container and use `flex flex-col justify-between` so shorter cards distribute space evenly rather than collapsing.

**Smoother popover appearance**:
- Reduce hover delay from 300ms to 200ms for snappier response
- Add `data-[state=open]:animate-in data-[state=closed]:animate-out` with a subtle fade + slide via Radix's built-in animation classes (already in our PopoverContent)
- Style the popover with `rounded-xl` (matching card corners), remove the heavy `shadow-lg` and use `shadow-md` with a softer border
- Position with `sideOffset={4}` (tighter to card) and `align="center"` so it feels connected to the card rather than floating away to the left
- Add a subtle `backdrop-blur-sm` for a modern glass feel

**PopoverContent onMouseEnter/Leave**: Already handled — keep the popover open when user hovers into it, close smoothly when they leave. Ensure the close delay is 250ms so it doesn't flicker.

**Loading state**: Match the `min-h-[120px]` so loading skeletons are same size.

### Files
- `src/components/app/MetricCard.tsx` — equal min-height, smoother popover styling and timing

