## Fix container rounding inconsistencies on /app/generate/product-images

All affected sections currently use `rounded-lg` (8px) while the surrounding cards / Eyewear category header use `rounded-xl` (12px). Unify to `rounded-xl`. Remove the extra grey wrapper around the "Recommended for your shots" swatch row.

### Edits

1. **`src/components/app/product-images/ProductContextStrip.tsx`** (L18) — the "Products [n] … Change" strip
   - `rounded-lg` → `rounded-xl`

2. **`src/components/app/product-images/ProductImagesStep2Scenes.tsx`** (L693) — expanded category content wrapper inside the "Select shots" categories
   - `rounded-lg` → `rounded-xl`

3. **`src/components/app/product-images/ProductImagesStep3Refine.tsx`**
   - L2660 (backdrop hint banner "Pick a color to set the backdrop…"): `rounded-lg` → `rounded-xl`
   - L2835 (Collapsible "Add styling direction" — AI mode): `rounded-lg` → `rounded-xl`
   - L3157 (Collapsible "Add styling direction" — bulk-edit, lighter variant): leave as `rounded-lg` if it's a borderless hover trigger only; otherwise also `rounded-xl`. Verify — if it has no border (current line is just hover bg), keep as-is.
   - L3393 (hint banner "Pick a color to unify…"): `rounded-lg` → `rounded-xl`
   - L3462–3469 ("Recommended for your shots"): drop the grey wrapper `<div className="p-2 rounded-lg bg-primary/5 border border-primary/10">…</div>` so the swatch grid sits flush in the column, directly under the label.

### Out of scope
No logic changes, no spacing changes beyond removing the one grey wrapper, no other roundings touched.
