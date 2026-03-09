

## Fix Freestyle Guide X Button Overlapping Step Counter

The X dismiss button (`absolute top-3 right-3`) overlaps with the `1/4` step counter (`ml-auto`) in the step indicator row since they occupy the same top-right space.

### Fix

| File | Change |
|------|--------|
| `src/components/app/freestyle/FreestyleGuide.tsx` | Remove the absolute-positioned X button. Instead, move the X into the step indicator row, replacing the `ml-auto` span with a flex group containing the counter and the X button side by side. |

Specifically: the step indicator `<div>` row will end with `<span>1/4</span> <button X />` in a single flex line, eliminating the overlap. Remove the separate absolute-positioned close button entirely.

