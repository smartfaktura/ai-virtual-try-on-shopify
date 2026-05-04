## Problem

The cm/in unit toggle buttons are nested inside an outer `<button>` element (the collapse/expand header). Nesting `<button>` inside `<button>` is invalid HTML — browsers handle this inconsistently, often preventing the inner buttons from working at all on mobile.

## Fix

**File: `src/components/app/product-images/ProductSpecsCard.tsx`**

Move the cm/in toggle outside of the outer `<button>` element. Restructure the header so the collapse trigger and the unit toggle are sibling elements rather than parent-child:

- Convert the outer `<button>` to a `<div>` with `role="button"` and `onClick`
- Or split the header into two parts: a clickable left section (title + chevron) and the right section with the toggle
- Add `type="button"` to the cm/in buttons as a safety measure
- Keep the visual layout identical

This is a one-file fix in `ProductSpecsCard.tsx`.
