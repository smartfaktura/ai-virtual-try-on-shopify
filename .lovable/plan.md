## Confirmable AI **category** on `/app/generate/product-images` upload

You're right — the field that actually matters is **category** (one of the 35 canonical ids in `analyze-product-image`: `garments`, `fragrance`, `sneakers`, `home-decor`, …). It's what drives scene picking, outfit logic, fragrance overrides, etc. The free-text `productType` is just a display label. Today `UploadSourceCard` quietly discards the AI's category and only shows `productType` as a plain text input — users can't see, confirm, or correct the thing that matters.

### 1. Single upload — category confirm chip

In `src/components/app/UploadSourceCard.tsx`:

- Extend `ScratchUpload['productInfo']` (in `src/types.ts`) with `category?: string` and `categoryConfirmed?: boolean`.
- `analyzeProduct` reads `data.category` (canonical id) and writes it onto `productInfo` alongside title/productType/description.
- After analysis returns, render a confirmation row above the existing text fields:

  ```
  AI detected category
  [ 👟 Sneakers ▾ ]   ✓ Looks right
  ```

  - Pill uses the canonical id resolved to a label via `CATEGORY_LABELS` from `src/lib/productSpecFields.ts`.
  - Clicking the pill opens a `Select` (or `Popover` + searchable list) of all canonical categories from `ALL_CATEGORY_OPTIONS` — picking a different one updates `productInfo.category` and auto-confirms.
  - **Looks right** flips `categoryConfirmed = true` and collapses to a quiet line: `Category: Sneakers · Edit`.
  - Visual state: unconfirmed = subtle primary ring; confirmed = muted with a check.
- The free-text `Product Type` input stays as-is for now (it's still used in prompts as a flavor label), but moves below the category row and gets a small helper "optional — refines the AI's understanding".
- Wire `productInfo.category` into the downstream save: when this upload becomes a `user_products` row (existing "Save to My Products" path), persist it into `analysis_json.category` the same way `ManualProductTab.tsx:581` already does (`productData.analysis_json = { ...existing, userCategory: category }`).

### 2. Bulk upload — review modal

- `UploadSourceCard`'s `<input type="file">` gets `multiple`; `handleDrop` and the paste handler accept multiple items. Single file → existing flow unchanged. 2+ files → open `BulkUploadReviewModal` instead of populating `scratchUpload`.
- New `src/components/app/BulkUploadReviewModal.tsx`. One row per file:
  - Thumb + filename
  - Title input (auto-filled from analyzer)
  - **Category select** (the same `ALL_CATEGORY_OPTIONS` picker), pre-set to the AI guess, with per-row status `analyzing | suggested | confirmed | failed`
  - Remove row
- Analysis runs in parallel with concurrency 3 (simple `for` loop with `Promise.all` over batches) so 10 uploads don't hammer the function.
- Footer:
  - **Confirm all** — enabled once every remaining row has a non-empty category. Uploads each file via the existing `uploadFile` helper, inserts a `user_products` row per file with `analysis_json.category = <picked id>`, then closes the modal and refreshes `userProducts`. The newly-created product ids are pre-selected on the products step and the wizard advances to that step.
  - **Cancel** — discards everything.
- Bulk path always saves to Library (stated in the modal subtitle). Single-file path keeps its optional "Save to My Products" checkbox.

### Files touched

- `src/components/app/UploadSourceCard.tsx` — read/write `category`, render confirm chip, accept multi-file, branch to bulk modal.
- `src/components/app/BulkUploadReviewModal.tsx` — new.
- `src/pages/Generate.tsx` — accept new `onBulkComplete(productIds: string[])` from the upload step (~line 2615), refresh `userProducts`, preselect, advance to product step.
- `src/types.ts` — add `category?: string` and `categoryConfirmed?: boolean` on `ScratchUpload['productInfo']`.

### Out of scope

- The `analyze-product-image` edge function — response shape already includes `category`; no changes.
- Anything outside `/app/generate/product-images`.
- The `productType` free-text field stays; we're just adding the canonical category beside it.
- No DB migrations.
