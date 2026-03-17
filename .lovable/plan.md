
Goal: fix Virtual Try-On so the “Continue” button works when the sample crop top is selected, and ensure sample generations don’t fail later.

1) Confirm and isolate root cause
- File: `src/pages/Generate.tsx` (product step continue handler around `2795+`).
- Current try-on branch only builds selection from `userProducts`:
  - `const selectedUps = userProducts.filter(...)`
  - If no DB products exist (sample-only state), `selectedUps.length === 0`, so click does nothing.
- This matches the reported behavior.

2) Fix selection logic for try-on sample flow
- In the same continue handler, replace try-on selection logic with a unified candidate list:
  - If user has products: mapped DB products.
  - If user has none: `[SAMPLE_TRYON_PRODUCT]`.
- Filter candidates by `selectedProductIds`.
- If selected list is empty, show a toast and return.
- If one selected:
  - `setSelectedProduct(selected[0])`
  - set source image id
  - clear stale multi-product state (`setProductQueue([])`, reset index/results).
- If multiple selected:
  - keep existing queue setup behavior.
- Keep existing navigation behavior to `brand-profile` or `model`.

3) Prevent downstream DB FK/type failure for sample product
- In try-on payload creation (`enqueueTryOnForProduct` and single-scene enqueue path), only send `product_id` when it corresponds to a real user product id.
- Add a small helper in `Generate.tsx`:
  - e.g. `getPersistedProductId(product?: Product | null): string | null`
  - returns `product.id` only if found in `userProducts`; otherwise `null`.
- Use this helper for all try-on payload `product_id` fields.
- Reason: sample product is not in `user_products`, and `generation_jobs.product_id` has FK to `user_products(id)`.

4) Keep UX consistent
- Button label logic can remain unchanged.
- Ensure sample selection still visually toggles as today.
- No backend schema/policy changes needed for this fix.

Technical details
- Primary file to update: `src/pages/Generate.tsx`
- Key areas:
  - Product step continue button `onClick` (try-on branch)
  - `enqueueTryOnForProduct(...)` payload
  - Single-scene try-on enqueue payload
- No migration, no auth change, no cloud function contract change.

Validation checklist (end-to-end)
1. Go to `/app/generate/virtual-try-on-set` with zero user products.
2. Select sample crop top → click Continue.
3. Verify navigation advances to Brand/Model step.
4. Complete model + scene + generate.
5. Verify job is queued and completes (no silent failure on save).
6. Re-test with real user product to ensure existing path still works.
