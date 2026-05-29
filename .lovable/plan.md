# Freestyle product picker — mobile fix + category sidebar

Two issues on `/app/freestyle`:

1. **Mobile** — tapping the **Product** pill doesn't open the picker sheet.
2. **Desktop sidebar** — left filter currently lists raw `product_type` values (Activewear, Activewear Set, Apparel Outfit, Armchair, Armless Chair, Athletic Dress, Athletic Shoes, Athletic Shorts, …). User wants it grouped by canonical **product category** instead (e.g. Fashion & Apparel → Dresses, Jackets, Activewear; Footwear → Sneakers, Boots; Bags & Accessories; Jewelry; Beauty & Fragrance; …).

---

## 1. Mobile picker doesn't open

Root cause in `src/components/app/freestyle/ProductSelectorChip.tsx` + `MobilePickerSheet.tsx`:

- On mobile, `ProductSelectorChip` returns `triggerButton` AND `<MobilePickerSheet>` as siblings. The chip's outer wrapper in `FreestyleSettingsChips.tsx` is `<div className="w-full opacity-40?">` — fine. But `MobilePickerSheet` renders as a sibling inside that wrapper, which on Freestyle lives inside the bottom prompt bar (`sticky`/`fixed`, typically with `overflow-hidden`, `z-index` lower than 50, and `transform`/backdrop-blur which creates a new containing block — so `fixed inset-0 z-50` is clipped to the bar instead of the viewport).
- Even if it does render, `pointer-events-none` is applied to the content for 260 ms after open. Combined with the chip's parent having `pointer-events` quirks during the same gesture, the first tap can be swallowed.

Fix:
- Render `MobilePickerSheet` through a React **portal to `document.body`** so the parent's `transform` / `overflow-hidden` / stacking context can never clip it. (Add a small `<Portal>` wrapper using `createPortal`.)
- Remove the 260 ms `pointer-events-none` gate; replace with a one-frame `requestAnimationFrame` flag (enough to avoid the trigger's bubbling tap closing the sheet) and also add `onClick={(e) => e.stopPropagation()}` on the sheet panel.
- Make the trigger button explicit: `type="button"` + `onPointerUp` fallback so iOS Safari reliably toggles even when a parent listens to pointer events.

No props, data, or routing change.

## 2. Sidebar grouped by category, not product_type

In `src/components/app/freestyle/ProductCatalogModal.tsx`:

- Replace the current **Type** section (built from `products[i].product_type`) with a **Category** section built from the canonical taxonomy in `src/lib/productCategories.ts` (`CATEGORY_LABELS` + `CATEGORY_SUPER_GROUPS`).
- For each product, resolve its category id in this order:
  1. `product.analysis_json?.userCategory` if it's a known id;
  2. else `mapTextToCategory(product.title + ' ' + product.product_type)` from `src/lib/categoryResolver.ts`;
  3. else `'other'`.
- Render the sidebar as collapsible **super-groups** (Fashion & Apparel, Footwear, Bags & Accessories, Jewelry, Beauty & Fragrance, Food & Drink, Home & Lifestyle). Under each group, list only the category ids that have ≥1 product, with the canonical label from `getCategoryLabel(id)` and the count.
- Filtering state changes from `typeFilter: string | null` to `categoryFilter: string | null` (category id). Grid filter uses the same resolver. "Any" row clears it.
- Header label changes from `TYPE` to `CATEGORY`.

No DB change, no edge function change. Pure client refactor of the catalog modal.

## Files to edit

- `src/components/app/freestyle/ProductCatalogModal.tsx` — sidebar grouped by category + resolver-driven filter.
- `src/components/app/freestyle/MobilePickerSheet.tsx` — portal to `document.body`, remove pointer-events delay, stopPropagation on panel.
- `src/components/app/freestyle/ProductSelectorChip.tsx` — `type="button"` on trigger, ensure mobile branch always wraps sheet in portal.

## Out of scope

- No changes to product data schema, to Visual Studio Step 2, or to other pickers (Bundle, Brand Scenes) — only `/app/freestyle`.
- Copy and visual styling of the desktop modal unchanged apart from sidebar labels.
