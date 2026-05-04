
# Jacket Extra Reference Triggers

Add three new optional reference image upload slots for all jacket scenes, and extend the generation pipeline to pass multiple extra references to the AI.

## What changes

### 1. Add 3 new reference trigger definitions

In `src/components/app/product-images/detailBlockConfig.ts`, add to `REFERENCE_TRIGGERS`:

- **`sleeveButtonDetail`** — "Upload sleeve button close-up" — for cuff button detail shots
- **`innerLining`** — "Upload inner lining photo" — for jacket interior/lining rendering
- **`cuffDetail`** — "Upload cuff detail photo" — for fashion/editorial cuff rendering

Each gets a `promptLabel` so the AI knows what it's looking at (e.g. "Sleeve button close-up reference — use this to accurately render cuff button details and stitching").

### 2. Add triggers to all 48 jacket scenes in the database

SQL UPDATE to append `sleeveButtonDetail`, `innerLining`, `cuffDetail` to the `trigger_blocks` array for every scene where `category_collection = 'jackets'`. These are optional — the upload cards only appear when the user selects jacket scenes, and they can skip any/all of them.

### 3. Support multiple extra references in generation payload

Currently the client sends only one `extra_reference_image_url` (breaks on first match). Changes:

**Client side** (`src/pages/ProductImages.tsx` ~line 951-975): Instead of breaking after the first matching trigger, collect ALL matching trigger reference URLs into an `extra_references` array of `{ url, label }` objects. Keep the single `extra_reference_image_url` for backward compatibility with the first match.

**Edge function** (`supabase/functions/generate-workflow/index.ts` ~line 1314): Read the new `extra_references` array and push each entry into `referenceImages` with its custom label, so the AI receives all uploaded jacket detail photos alongside the product.

### 4. No UI changes needed

The existing reference trigger UI in `ProductImagesStep3Refine.tsx` already auto-renders upload cards for any trigger key found in `REFERENCE_TRIGGERS`. Adding the 3 new keys is enough — the upload cards, remove buttons, and per-product support all work automatically.

---

## Technical details

**Database migration:**
```sql
UPDATE product_image_scenes
SET trigger_blocks = array_cat(
  trigger_blocks,
  ARRAY['sleeveButtonDetail','innerLining','cuffDetail']
)
WHERE category_collection = 'jackets';
```

**Files modified:**
- `src/components/app/product-images/detailBlockConfig.ts` — 3 new entries in `REFERENCE_TRIGGERS`
- `src/pages/ProductImages.tsx` — collect all matching trigger refs into `extra_references` array
- `supabase/functions/generate-workflow/index.ts` — iterate `extra_references` array into `referenceImages`
- 1 database migration for the trigger_blocks update
