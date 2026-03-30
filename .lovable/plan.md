

## Issue: Product Chip Tap Causes Instant Redirect on Mobile

### Root Cause

When the user taps the Product chip on mobile and has **no products**, the `MobilePickerSheet` opens with empty-state content that includes a full-width `<Link to="/app/products">` button ("Add Your Own Product"). The sheet uses a CSS slide-up animation (`animate-in slide-in-from-bottom duration-200`), but the content is rendered at its **final DOM position immediately** — only the visual is animated. The original tap's touch event can propagate to the Link element before the animation visually completes, causing an instant navigation to `/app/products`.

This is a classic touch-passthrough bug on mobile bottom sheets.

### Fix

Two changes:

**1. `MobilePickerSheet.tsx` — add a touch guard during open animation**

Add a brief `pointer-events: none` on the content area for the first 250ms after opening. Use a state + `useEffect` with `setTimeout` to flip `pointer-events` to `auto` after the animation completes. This prevents any touch passthrough on ALL picker sheets, not just the Product one.

**2. `ProductSelectorChip.tsx` — replace Link with inline navigation**

Change the "Add Your Own Product" `<Link>` in the empty state to a `<button>` that calls `useNavigate()` with a small guard, preventing accidental navigation. Also add `onTouchEnd={e => e.stopPropagation()}` as an additional safety measure.

