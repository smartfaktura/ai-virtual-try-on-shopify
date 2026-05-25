# Brand Scenes — Custom preview product + clearer sample copy

Scope: `/app/brand-scenes/new`, Step 6 (Preview & Pick). Pure UI/UX + preview-pipeline change. No DB schema changes, no prompt-template / saved-scene change. The saved scene still uses `[PRODUCT IMAGE]` tokens so end users' real products replace whatever was used in preview.

---

## 1. Clarify the "sample item" copy

Current line (Step6PreviewAndPick.tsx ~line 311) reads as if the sample item *will be used*. Rewrite as a clear two-line block:

- Eyebrow label (uppercase 10px): `Preview stand-in`
- Title: `Sample {label}` (e.g. "Sample Ghost Mannequin Dress")
- Body: `Used only for this preview so you can judge scale and placement. When you apply this scene to your real products later, they replace it automatically.`

Also retitle the surrounding card's helper line so the hierarchy is:
- "Preview uses a representative sample" → preview-only
- "Your saved scene works with any of your products" → permanent

## 2. Let the user swap the sample with their own product

Add a small **"Use my product instead"** action next to the sample thumbnail. Opens a lightweight picker modal listing the user's `user_products` (title + image_url, newest first, simple search). Selecting one:

- Replaces the thumbnail + label in the sample card with the chosen product (label = product title).
- Passes that product's `image_url` as `productImageUrl` to `generateBrandScene` instead of `stockProduct.url`.
- Adds a small "Reset to sample" link to revert.

State lives only in Step 6 (not persisted into `BrandSceneAnswers`) — this is preview-only, same as the stock product today.

If the user has zero products, show the picker with a friendly empty state + "Add product" link to `/app/products`, and keep the stock sample selected.

## 3. Files changed

- `src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx`
  - New local state `customProduct: { url, label } | null`
  - Compute `previewProduct = customProduct ?? stockProduct`
  - Use `previewProduct?.url` for `productImageUrl` in `handleGenerate`
  - New sample card copy (section 1)
  - "Use my product instead" button → opens picker
- `src/features/brand-scenes/wizard/components/UserProductPickerModal.tsx` (new)
  - Dialog with search input + grid of user products
  - Query: `supabase.from('user_products').select('id,title,image_url').order('created_at',{ascending:false})`
  - Auth-scoped via existing RLS
  - Empty state → link to `/app/products`

## 4. Out of scope

- No changes to `useStockProductForScene` (still the default).
- No changes to `assembleSceneDirective`, `injectReferenceTokens`, or anything that ships into the saved scene's prompt — token replacement on apply is unchanged.
- No category/sub-family filtering of the user's products in v1 (can add later if noisy).
- No persistence of the chosen custom product on the scene record.

## 5. Verification

- Default flow: opening Step 6 still shows the stock sample with the new clearer copy.
- Swap flow: pick a product → thumbnail + label update → Generate uses that image → Reset returns to stock.
- Empty-products flow: picker shows empty state + link, generation still works with stock.
- No TS errors; no console warnings; saved scene `prompt_template` unchanged.
