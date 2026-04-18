
## Unify Edit/Add Product page visuals

The Edit Product page renders content as loose stacked sections (Sophia tip, then a `bg-muted/10` image block, then bare form fields). The Add Product page has the same building blocks but inside a Tabs container — neither feels like the polished card-driven "Products" page. Goal: give both the same calm, grouped, card-based vibe without touching backend logic, AI flow, or form state.

### Approach
Introduce consistent **"section card" wrappers** around the existing content blocks. No prop, hook, or submission logic changes — purely presentational JSX wrappers + spacing/border tokens.

### Concrete changes

**1. `src/pages/AddProduct.tsx`**
- Wrap the editing branch's `<ManualProductTab>` in a `<Card>` (rounded-2xl, p-4 sm:p-6) so it matches Products page card density.
- Wrap the Tabs branch's `<div className="pt-6">` content area in the same `<Card>` so each import method renders inside a unified surface (image dropzone, URL input, CSV uploader, etc. all sit in one card).
- Keep `ProductUploadTips` outside the card (it already has its own surface).

**2. `src/components/app/ManualProductTab.tsx`** (presentational only)
- Wrap the **image / reference-angles block** (lines ~774–860 dropzone OR ~861+ filled state) so empty + filled both share the same outer card padding — already mostly there, just normalize to `rounded-2xl border bg-card p-3 sm:p-4` (currently uses `bg-muted/10`).
- Wrap **PRODUCT DETAILS** (Name, Type, chips, description) in a sibling `rounded-2xl border bg-card p-4 sm:p-5` with a small uppercase section label `PRODUCT DETAILS` — matches the screenshot's existing label.
- Wrap **More details** collapsible (weight, materials, color) in the same card pattern.
- Sticky footer: keep existing Cancel / Save Changes bar but align its container to `border-t border-border/60 bg-background/80 backdrop-blur` and constrain to same max-width as cards above so it visually aligns on desktop.

**3. Mobile / desktop consistency**
- Cards: `rounded-2xl` everywhere (matches Products page).
- Padding scale: `p-4 sm:p-5` for content cards, `p-3 sm:p-4` for media card.
- Vertical rhythm: `space-y-4 sm:space-y-5` between cards.
- Tabs row keeps `overflow-x-auto` (mobile-safe) — already done.
- Reference-angle slots (88×88) stay as-is on desktop; on mobile they already wrap — verify horizontal scroll is preserved.

### Files touched
- `src/pages/AddProduct.tsx` (~10 lines)
- `src/components/app/ManualProductTab.tsx` (wrapper divs only, ~6 spots)

### Out of scope
- No backend / Supabase / mutation / analyze-product-image changes
- No field additions/removals
- No tab restructuring
- No icon/color theme changes

### Acceptance
- Edit Product and Add Product render with the same card-surface vibe as `/app/products`
- Image block, Product Details, and More Details each sit in their own consistent card
- Mobile: cards stack with comfortable padding, no horizontal overflow
- Desktop: cards align to the same content max-width as Products page
- Save / Cancel still works identically; AI analysis flow unchanged
