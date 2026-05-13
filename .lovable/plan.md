## Goal

Add a real **"Other"** category so products that don't match any existing category (e.g. Elves Behavin' Badly Jigsaw Puzzle — toys, puzzles, generic objects) get a curated set of universal scenes recommended automatically, instead of falling back to "show every category expanded".

## Current behavior

- `detectRelevantCategories()` in `ProductImagesStep2Scenes.tsx` returns an empty set when nothing matches.
- The component then renders **all** category collections expanded (lines 489–508), which is overwhelming and not tailored.
- The DB has no scenes with `category_collection = 'other'` (verified via query — 39 collections, none called `other`).
- `'other'` only exists as a label in `CATEGORY_LABELS` (orphaned).

## Proposed changes

### 1. Seed an "Other" scene collection in the database

Insert ~8–10 universal, category-agnostic scenes into `product_image_scenes` with `category_collection = 'other'`. These should work for any object: toys, puzzles, books, kitchenware, stationery, gifts, etc. Suggested starter set (admin can refine later):

- Studio Hero on Soft White
- Editorial Top-Down Flat Lay
- Lifestyle Wood Surface
- Hand Holding Product (in-use shot)
- Gift / Unboxing Moment
- Window Light Still Life
- Color Block Backdrop (uses `{{aestheticColor}}`)
- Negative Space Hero (for ads/banners)
- Detail Macro Texture
- Warm Home Tabletop

Each gets a generic `prompt_template` written to the same standard as existing scenes (light recipe, lens, framing, anchors `[PRODUCT IMAGE]` / no model). Per existing memory, prompts must follow the ChatGPT Scene Generation Standard and produce 2K PNG.

A follow-up step (admin UI or another message) can add proper `preview_image_url` thumbnails — initial seed will leave them blank until you generate previews.

### 2. Wire `'other'` into the category resolver

In `src/components/app/product-images/ProductImagesStep2Scenes.tsx`:

- Add `'other'` to `VALID_CATEGORY_IDS` (by adding an empty entry in `CATEGORY_KEYWORDS` so the picker includes it as a valid collection without keyword auto-matching).
- In `detectRelevantCategories()`: if after AI + keyword pass the product produced no match, add `'other'` to that product's bucket as a fallback. Result: products with no detected category land in the **Other** recommended tab.
- Keep `CATEGORY_LABELS['other'] = 'Other'` (drop "/ Custom" wording per minimalist style).
- Add `'other'` to a new misc super-group (or append to "Home & Lifestyle") in `CATEGORY_SUPER_GROUPS` so it appears in the explore-more list too.

### 3. Behavior after the change

- Elves Behavin' Badly Jigsaw Puzzle → no category match → **Other** appears as the recommended tab, expanded by default, with the universal scenes ready to select.
- Products that already match a category are unaffected.
- Mixed selections (one matched product + one unmatched) will surface both the matched category **and** Other as recommended.

### Out of scope

- No changes to generation pipeline, RLS, or pricing.
- Preview thumbnails for the new Other scenes will be generated separately (you can run them through the regular generation flow, then assign via the existing admin scene editor).
- No changes to MakaraWear / Elfas Namuose showcase pages.

## Technical notes

- Files touched: `src/components/app/product-images/ProductImagesStep2Scenes.tsx` only (frontend) + a one-time DB insert into `product_image_scenes`.
- The hook `useProductImageScenes` already groups by `category_collection`, so the new rows will appear automatically once `'other'` rows exist and the code recognises the id.
- Memory will be updated to record that `'other'` is now the canonical fallback collection for unmatched products.
