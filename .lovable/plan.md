# Material Swap — Step 1 redesign

Replace the pre-opened tab picker in `/app/material-swap` Step 1 with a clean, mobile-friendly **method chooser**. The user first picks *how* they want to bring the product image in; the actual picker only opens after they select a method.

## Changes (all in `src/pages/MaterialSwap.tsx`, Step 1 block only)

1. **Copy**
   - Replace heading `Pick the product photo to re-skin` with: `Add your product image`
   - Add a one-line subtitle: `Choose where to bring it from — we'll keep its shape, lighting and scene exactly as-is`

2. **Method chooser (default state, no product selected, no method chosen yet)**
   - Render **3 cards** in a responsive grid: `grid-cols-1 sm:grid-cols-3 gap-3`
   - Each card: large icon, title, one-line helper, full tap target (min height ~140px), rounded-2xl, border, hover/active states, semantic tokens only
     - **Library** — icon `Images`, helper: `Reuse a visual you already generated`
     - **Products** — icon `Package`, helper: `Pick from your saved products`
     - **Upload** — icon `Upload`, helper: `Drop a new photo or paste a URL`
   - Tapping a card sets `productSource` and reveals that picker below

3. **Active picker view (after a method is chosen, still no product picked)**
   - Show a small back control above the picker: `← Change source` that clears `productSource`
   - Render only the picker for the chosen source (Library / Products / Upload) — remove the pill/tab row entirely
   - Keep all existing picker internals (search, grid, load more, dropzone, URL paste) unchanged

4. **Selected state**
   - Unchanged: existing "selected product preview" card with `Change` button (clears `productUrl`, `productTitle`, `productSource` → returns to method chooser)

## Out of scope
- No changes to Step 2, Step 3, hook, pricing, prompt, routes, or backend
- No new components, no new dependencies; reuse existing icons from `lucide-react` already imported (add `Images`, `Package` if missing)
