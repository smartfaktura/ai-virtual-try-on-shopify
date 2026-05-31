## 1. Fix Back/Change bug on upscale Settings step
`src/components/app/generate/UpscaleSettingsPanel.tsx`

- Line 35 (inline "Change" link) and line 102 (footer "Back" button) currently route to `'product'` whenever `sourceType !== 'scratch'`, so coming from "From Library" lands the user on the products grid.
- Update both handlers to map by `sourceType`:
  - `'scratch'` → `'upload'`
  - `'library'` → `'library'`
  - otherwise → `'product'`

```tsx
const backStep =
  sourceType === 'scratch' ? 'upload'
  : sourceType === 'library' ? 'library'
  : 'product';
```
Use `backStep` for both buttons.

## 2. Tidy "Select Product(s)" toolbar (Generate.tsx, non-try-on branch, lines 3395–3440)

- Remove the grid/list view toggle (lines 3426–3439).
- Resize Select All + Clear buttons to match the search bar: drop `size="sm"` + `h-8 text-xs`, use `className="h-10 rounded-full px-4 text-sm"` so all three controls share height and pill radius.
- Leave the try-on toolbar (lines 3213–3263) and admin-y variants untouched.

## 3. Shorten product-selection subtitle (Generate.tsx line 3077)

Change the non-flat-lay / non-tryon branch from:
> "Choose one or multiple products. 2+ products will use bulk generation."

to:
> "Pick one or more products"

No period (matches Core memory: no terminal period on single-sentence subtitles).

## Scope
Only the two files above; other workflows and the library/tryon variants are unchanged.