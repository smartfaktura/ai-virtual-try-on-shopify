## Add Product Category picker to Add/Edit Product

### What this adds

A new **Product Category** field in the Product Details section, sitting next to Product Type. It opens a clean modal listing the same 35+ subcategories used in Visual Studio Step 2 (Dresses, Sneakers, Necklaces, etc.), grouped by family. The AI-suggested category is pre-selected so users with already-analyzed products see the right value, not an empty field.

### Product Type vs Product Category

- **Product Type** — freeform text the AI writes (e.g. "mini dress"). Unchanged.
- **Product Category** (new) — one of the 35+ canonical IDs used by Step 2 to pick scenes.

Both kept; they play different roles.

### What the user sees

```text
┌───────────────────────────┐  ┌───────────────────────────┐
│ Product Name *            │  │ Product Type              │
│ [ Floral Mini Dress     ] │  │ [ mini dress            ] │
└───────────────────────────┘  └───────────────────────────┘
┌───────────────────────────┐  ┌───────────────────────────┐
│ Product Category          │  │ Dimensions (optional)     │
│ [ Dresses             ▾ ] │  │ [ 28 x 35 x 13 cm       ] │
└───────────────────────────┘  └───────────────────────────┘
        ▲ click → modal
```

**Modal:** search bar on top, then categories grouped by the existing `CATEGORY_SUPER_GROUPS` (Fashion & Apparel, Footwear, Bags & Accessories, Jewelry, Beauty & Fragrance, Food & Drink, Home & Lifestyle). The current/suggested category is highlighted. Click → modal closes → field updates.

**Pre-fill priority** (so existing users aren't shown empty fields):
1. `userCategory` (user's saved pick)
2. else `category` (from Step 2 AI analysis)
3. else "Choose category"

Any product that's been through Step 2 already has `category` in `analysis_json`, so it shows the AI's category right away.

### Storage

Save into the existing `user_products.analysis_json` JSONB column under a new key `userCategory`. **No DB migration.** AI's `category` is never overwritten — it stays as a fallback.

### Step 2 reading

In `ProductImagesStep2Scenes.tsx`, where we currently read `analyses[id].category`, prefer `userCategory` if present. One-line change. Scene-picking, grouping, generation, billing — all untouched.

### Files

1. **New** `src/lib/productCategories.ts` — single source of truth: `CATEGORY_LABELS` + `CATEGORY_SUPER_GROUPS` (extracted from `ProductImagesStep2Scenes.tsx`). Future categories added here only.
2. **New** `src/components/app/product-images/CategoryPickerModal.tsx` — search + grouped list + suggested-pick highlight.
3. **Edit** `src/components/app/ManualProductTab.tsx` — add the Category trigger + modal in the single-edit form (~line 1140) and the batch card (~line 780). Keep the old "Change category" chip toggle for now (it edits Product Type, which is separate). Persist `userCategory` on save.
4. **Edit** `src/components/app/product-images/ProductImagesStep2Scenes.tsx` — import labels/groups from the shared file; prefer `userCategory` over `category` when reading.
5. **Edit** `src/hooks/useProductAnalysis.ts` — `overrideCategory` writes to `userCategory` instead of overwriting `category`.

### Safety guarantees

- **No DB migration**, no schema change, no RLS change
- New field is **optional** — empty for all legacy products until user picks
- Reading layer always falls back: `userCategory ?? category ?? 'other'`
- Existing analyzed products show the AI-suggested category pre-filled
- Step 2 scene logic, generation, prompts, billing, queue — unchanged
- Easy rollback: remove the new field + revert one read

### Out of scope (saved for later)

- The bigger plan to make the upload analyzer return canonical category at upload time
- Backfilling `userCategory` for legacy rows
- Showing category on product list cards
