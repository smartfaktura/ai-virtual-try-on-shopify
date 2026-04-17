

## Two fixes for /app/products Add Product drawer

### Issue 1 — URL field focus ring clipped (desktop screenshot 1)
**Cause:** `Input` uses `focus-visible:ring-2 ring-offset-2` (4px outside the border). In `StoreImportTab`, the URL input sits in `<div className="flex gap-2 min-w-0"><div className="relative flex-1">...`. There's no horizontal padding/space for the focus ring on the right edge — the ring renders past the wrapper and the Sheet clips it. Also when focus appears the ring visually pushes the layout boundary.

**Fix — `src/components/app/StoreImportTab.tsx` (lines 262-273):**
- Replace the 2px ring + 2px offset combo with a flush 2px ring (no offset) that stays inside the wrapper bounds:
  - Input: add `focus-visible:ring-offset-0` to override the default 2px offset (the ring will sit on top of the border, no layout shift, no clipping).
- Also add `min-w-0` to the inner `relative flex-1` wrapper so it can actually shrink within the flex row.
- Optional: shorten desktop placeholder to `https://myshop.com/products/...` so it doesn't visually crowd the right edge with a long URL.

### Issue 2 — Mobile "back" returns to a clipped tab strip (mobile screenshot 2)
**Cause:** In `AddProductModal.tsx` (lines 134-151), the mobile method picker uses a horizontal `TabsList` with `overflow-x-auto`. With 5 methods (Upload, Product, CSV, Mobile, Shopify) the row overflows — "Upload" gets cut on the left and "Shopify" on the right, with a visible scrollbar. Plus the active tab's contextual subtitle ("Upload images or import products in seconds.") doesn't match the visual state.

**Fix — `src/components/app/AddProductModal.tsx`:**
Replace the horizontal scrolling tab strip on mobile with a clean **2-column grid of method cards** (matches the Apple-style touch UX already used elsewhere in the app):
- Render `METHOD_ORDER` as a `grid grid-cols-2 gap-2` list of tappable cards.
- Each card: icon (top-left), short label (`Upload`, `Product URL`, `CSV`, `Mobile`, `Shopify`), tiny sub-label, subtle border, active state ring. Last odd card spans full row (`col-span-2`) so 5 items lay out cleanly.
- Drop `TabsList`/`TabsTrigger` for mobile branch — keep `Tabs` root for state management with explicit `setActiveTab(id)` onClick on cards.
- Keep desktop branch (lines 152-188) unchanged.

This means tapping "Switch method" / back arrow returns to a clean, fully-visible 2-col grid instead of a clipped horizontal scroll.

### Files to edit
- `src/components/app/StoreImportTab.tsx` — input ring fix + min-w-0 on wrapper
- `src/components/app/AddProductModal.tsx` — replace mobile `TabsList` with 2-col card grid

### Out of scope
- Desktop method rail, drawer chrome, backend, other tabs' content.

### Acceptance
- Clicking the URL field on desktop: focus ring sits flush within the field, no clipping at right edge, no layout shift.
- On mobile, after tapping the back arrow from a method, user sees a clean 2-column grid of all 5 methods — none clipped, no horizontal scrollbar.
- Tapping a card switches into that method's compact view.

