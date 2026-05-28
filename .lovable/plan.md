## Goal

Prevent `analyze-product-image` from writing any specific phone model (e.g. "iPhone 15 Pro", "Samsung Galaxy S24", "Pixel 8") into `title`, `description`, or `specification` when the analyzed product is a phone case. The function should still confidently detect that the item is a phone case — just describe it generically.

## Change (single file)

`supabase/functions/analyze-product-image/index.ts` — update the prompt sent to Gemini Flash (lines 43–57). Two additions:

1. **Hard rule appended to the PRODUCT block** instructing the model never to mention a brand or model designation for phone accessories, even if cutouts make it identifiable. List the protected categories so the rule covers adjacent cases: phone cases, tablet cases, laptop sleeves, AirPods/earbud cases, watch bands, screen protectors.

2. **Concrete substitution examples** so the model knows what to write instead:
   - Bad: "Orange Striped iPhone 15 Pro Case"
   - Good: "Orange Striped Phone Case"
   - Bad: "...phone case with a glossy finish for iPhone 15 Pro"
   - Good: "...phone case with a glossy finish, slim profile with precise cutouts"

3. **Also forbid** the words: "iPhone", "Samsung", "Galaxy", "Pixel", "Huawei", "Xiaomi", "OnePlus", and any model numbers (e.g. "15 Pro", "S24", "Ultra") inside `title` / `productType` / `description` / `specification` when `productType` is a phone case.

No other code paths change. No DB migration. No change to `generate-workflow` — once the source description no longer contains the device name, the assembled prompt at lines 603–606 will be clean automatically. Existing products that already have a polluted description in the DB will keep their old text until re-analyzed (we are not touching historical rows).

## Out of scope

- Cleaning up already-saved product descriptions in the DB.
- Adding a category-aware post-filter / regex sanitizer (prompt rule alone is enough for Flash; we can add a regex backstop later if it slips through).
- Changing the 6 phone-case scenes with literal `\n\n` (unrelated, already discussed).

## Verification

After deploy, re-upload a phone case in info@tsimkus.lt's account and confirm the returned JSON's `title`, `description`, and `specification` contain no device brand/model names.
