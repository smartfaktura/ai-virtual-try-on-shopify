# Edit Product page — design polish

Five tightly-scoped tweaks. All apply to the edit-product view only (single-image / `editingProduct` branch of `ManualProductTab.tsx`) plus `AddProduct.tsx` for layout ordering.

## 1. Remove "(optional)" labels

In `ManualProductTab.tsx`, drop the `(optional)` suffix on:
- `Product Category` label
- `Description` label
- `Dimensions` label
- Keep `Product Name *` required marker untouched.

## 2. Spacious + rounded form design (match picker modal)

For the **Product Details** card and all its inputs:
- Card container: `rounded-2xl` → `rounded-3xl`, `p-4 sm:p-5` → `p-5 sm:p-7`, `space-y-2` → `space-y-5`.
- Section title gets `mb-1` and a thin tracking treatment (already uppercase).
- Inputs (`Product Name`, `Dimensions`, `Description` textarea) and the Category picker button: bump from default to `h-11`, `rounded-xl`, slightly larger horizontal padding (`px-4`), `text-sm`. Textarea: `rounded-xl`, `p-4`, `rows={3}`.
- Grid gap `gap-3` → `gap-4`.
- Refined placeholders (more guidance, less robotic):
  - Product Name: `e.g. Black Leather Crossbody Bag`
  - Dimensions: `e.g. 28 × 35 × 13 cm`
  - Description: `A short, plain description — colour, material, key details…`
- Category trigger button keeps the Suggested pill we built, just inherits the new `h-11 rounded-xl px-4` look.

## 3. "More Details" card matches Product Details

Currently the collapsible only renders a card when open and uses different padding. Change it so:
- Always rendered as a card: `rounded-3xl border bg-card p-5 sm:p-7` (same as Product Details), regardless of open state.
- Trigger row: same uppercase `Product details`-style label, "optional" tag retained inline (this is the only place "optional" stays — it's the section affordance, not a field label), ChevronDown on the right.
- Inputs inside also get `h-11 rounded-xl px-4`, grid `gap-4`.
- Helper line styled identically to the existing Product Details helper microcopy.

## 4. Move Sienna QuickTip below More Details

In `AddProduct.tsx`, the `<ProductUploadTips />` currently sits above the form (`hidden sm:block` before the editor). For the edit branch (`isEditing`):
- Remove the top placement.
- Render `<ProductUploadTips />` AFTER the `ManualProductTab` form (i.e. below the More Details card and above the sticky footer overflow).
- Wrap it in `mt-6` to breathe.
- Non-edit branch (Add Products) keeps current behaviour unchanged.

Since the tip card sits inside the page scroll (PageHeader children area) and the sticky footer is rendered inside `ManualProductTab`, the tip will naturally appear above the floating bar — correct.

## 5. Floating sticky footer matches workflow bar

Replace the edit-mode footer block in `ManualProductTab.tsx` (currently `sticky bottom-0 -mx-5… border-t bg-background/95`) with the same rounded floating-card pattern used by `ProductImagesStickyBar`:

```text
<div className="sticky bottom-4 z-10 max-w-full pb-[env(safe-area-inset-bottom)]">
  <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm shadow-lg
                  flex items-center justify-end gap-3 p-3 sm:p-4">
    <Button variant="ghost" size="pill" …>Cancel</Button>
    <Button size="pill" …>Save Changes</Button>
  </div>
</div>
```

- Drop the negative-margin / border-top edge bleed.
- Buttons become `size="pill"` to match workflow CTA shape.
- Bar floats with `bottom-4` so the rounded card stands above content with the page background showing under it.
- Add `mt-4` on the wrapper so it doesn't hug the card above.

This same footer is used in both edit and add modes today — keep it for both (the workflow bar pattern looks good in add mode too, and the task asks specifically about edit page; non-edit still benefits visually with zero risk).

## Out of scope

- Batch-mode card design unchanged.
- Quick Tip rotation logic and copy unchanged — just relocated.
- No DB or business-logic changes.

## Files touched

- `src/components/app/ManualProductTab.tsx` — labels, spacing, rounding, placeholders, More Details card parity, floating bar redesign.
- `src/pages/AddProduct.tsx` — move `ProductUploadTips` below `ManualProductTab` in edit branch.
