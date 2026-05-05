## Problem

1. **Beverage volume is select-only** — users can't enter custom sizes (e.g. 275ml, 1.5L). Same issue affects fragrance, beauty-skincare volumes.
2. **cm/in toggle is at the top-right** near "Optional" — should be near the actual measurement fields where it's contextually relevant.
3. **Unit text is too small** — `text-[10px]` for "cm"/"in" labels next to inputs is hard to read.
4. Several categories use select-only for fields that should allow custom entry.

## Changes

### 1. `src/lib/productSpecFields.ts` — Convert volume/weight selects to combo fields

Change volume fields in `beverages`, `fragrance`, and `beauty-skincare` from `type: 'select'` to a new `type: 'comboInput'` that renders as an input with a dropdown of common options. This lets users pick a preset OR type a custom value.

Also review and convert any other category fields that would benefit from custom entry:
- `beverages.volume` — add comboInput with presets (200ml, 250ml, 330ml, etc.) but allow typing "275ml"
- `fragrance.volume` — same approach
- `beauty-skincare.volume` — same approach
- `food.weight` — keep as input (already fine)
- `furniture.furnitureType` — keep as select (finite list)

Add `type: 'comboInput'` to the `SpecField` type.

### 2. `src/components/app/product-images/ProductSpecsCard.tsx` — Move cm/in toggle + increase sizes

- **Move the cm/in toggle** from the card header down into each product's expanded spec fields area, placed inline above/beside the measurement grid (only shown when the category has fields with `unit: 'cm'`).
- **Remove the toggle from the header row** — keep only "Optional" label and collapse chevron there.
- **Increase unit label size** from `text-[10px]` to `text-xs` (12px) next to input fields.
- **Increase cm/in toggle button text** from `text-[11px]` to `text-xs` with slightly larger padding.

### 3. `src/components/app/product-images/ProductSpecsCard.tsx` — Render comboInput fields

Add a new render branch for `comboInput` type fields:
- Show an `Input` field for free typing
- Add a small dropdown button or datalist with preset options
- Selecting a preset fills the input; user can also type freely
- Use HTML `<datalist>` for simplicity (native browser autocomplete dropdown)

### 4. Category audit summary

| Category | Field | Current | Proposed |
|----------|-------|---------|----------|
| beverages | volume | select (7 options) | comboInput — allows custom sizes |
| fragrance | volume | select (8 options) | comboInput — allows custom sizes |
| beauty-skincare | volume | select (8 options) | comboInput — allows custom sizes |
| garments | size | select | keep select (standard sizes) |
| garments | fit | select | keep select (finite list) |
| furniture | type | select | keep select (finite list) |
| all apparel | size/fit/length | select | keep select (standard sizing) |
| footwear | widthProfile | select | keep select (3 options) |
| boots | shaft | select | keep select (4 options) |

All other input-type fields are already free-text — no changes needed.

## Expected result

- Users can type any custom volume for beverages (e.g. "275ml", "1.5L")
- Preset suggestions still appear as a convenience dropdown
- cm/in toggle appears right next to the measurement fields where it's needed
- Unit labels ("cm", "in", "mm") are larger and easier to read
- Header is cleaner with just title + Optional + chevron
