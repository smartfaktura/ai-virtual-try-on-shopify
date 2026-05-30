The Step 3 Product Details dropdown is built from a local `CATEGORY_LABELS` map in `src/lib/productSpecFields.ts` that is missing several categories present in the canonical `src/lib/productCategories.ts`.

**What to change:**
Add the following entries to `CATEGORY_LABELS` in `src/lib/productSpecFields.ts` (line 385):
- `'phone-cases': 'Phone Case'`
- `'wedding-dress': 'Wedding Dress'`
- `'skirts': 'Skirt'`
- `'streetwear': 'Streetwear'`

`ALL_CATEGORY_OPTIONS` is already derived from this map and sorted alphabetically, so the new options will appear automatically in the dropdown.

**No other files need to change.** `CATEGORY_SUPER_GROUPS` and spec fields for these categories already exist in the codebase.