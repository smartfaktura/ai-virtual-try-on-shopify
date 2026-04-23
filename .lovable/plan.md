

## Fix: "No scene detected" on legacy Library items + bulletproof title-matching for product-images

### Why the previous fix wasn't enough

The earlier change made the modal **read** `scene_id` from the source job — but every existing `generation_jobs` row created before yesterday has `scene_id = NULL` in the DB (only `scene_name` was persisted). So for the wallet-on-aloe item you opened, there's nothing to read. The modal falls back to AI guessing → "No scene detected".

I confirmed in the DB:
- "Botanical Oasis" exists as **10 sibling rows**, one per `category_collection` (e.g. `botanical-oasis-10` = wallets-cardholders, `botanical-oasis-2` = sneakers, etc.).
- All your past product-images jobs have `scene_id = NULL` — only the one new job after yesterday's wizard fix carries it.

So we need a **deterministic title + category fallback** in the modal for legacy items, plus the existing `scene_id` short-circuit for new ones.

### Fix — `src/components/app/AddToDiscoverModal.tsx`

Extend the `(async () => {...})()` block (around lines 191-223) so that when we resolve metadata from `generation_jobs`, we also pull `product_id` and use it to disambiguate the scene title.

Concretely:

1. **Extend the source-job lookup** to include `product_id` (and `product_type` via a small join on `user_products`):
   ```ts
   .select('scene_name, scene_id, scene_image_url, model_name, model_image_url, workflow_slug, product_id, user_products(product_type, analysis_json)')
   ```

2. **New resolver `resolveSceneRefByTitleAndCategory(sceneName, productType)`**:
   - Query `product_image_scenes` for all rows where `title === sceneName`.
   - If exactly one row → use it.
   - If multiple → map `productType` (e.g. `"wallet"`, `"sneaker"`) to `category_collection` via a small lookup table that mirrors the existing category normalization (already lives in `tech-stack/product-category-normalization` memory). Pick the matching row's `scene_id`.
   - If still ambiguous → pick the lowest-numbered variant (e.g. `botanical-oasis` over `botanical-oasis-10`) as a stable default.

3. **Pre-fill `pickedSceneName` AND a new local `resolvedSceneRef`** before the AI describe call runs. This:
   - Makes the scene visibly selected in the dropdown (no "No scene detected" warning).
   - Skips the costly AI suggestion call when we already have a deterministic match.

4. **Use `resolvedSceneRef` in the `authoritativeSceneRef` calculation** (currently lines 355-358) so the title-based fallback writes the correct `scene_ref` to `discover_presets`.

### Mapping table (small, in-file)

```ts
// product_type token → product_image_scenes.category_collection
const PRODUCT_TYPE_TO_COLLECTION: Record<string, string> = {
  wallet: 'wallets-cardholders',
  cardholder: 'wallets-cardholders',
  sneaker: 'sneakers',
  fragrance: 'fragrance',
  perfume: 'fragrance',
  watch: 'watches',
  ring: 'jewellery-rings',
  bracelet: 'jewellery-bracelets',
  necklace: 'jewellery-necklaces',
  // ...full set mirrors the existing normalization in analyze-product-category
};
```

(We extract the mapping from the existing `analyze-product-category` edge function so it stays consistent — no duplication, just import the const.)

### Behaviour after fix

- Open the wallet-on-aloe Library item → modal opens → DB lookup finds `scene_name = "Botanical Oasis"` + `product_type = "wallet"` → resolver picks `botanical-oasis-10` → scene shows pre-selected, "No scene detected" warning gone, AI guess skipped.
- Publish → `discover_presets.scene_ref = "botanical-oasis-10"` written deterministically.
- New jobs (with `scene_id` populated) still take the fast path via the existing `authoritativeSceneRef` shortcut.

### Out of scope
- No DB migration to backfill `scene_id` on legacy jobs (would be ~thousands of rows; the in-modal resolver covers it without touching data).
- No de-duplication of the 10 "Botanical Oasis" rows.
- No changes to wizard payload (already correct going forward).

### File touched
```text
EDIT  src/components/app/AddToDiscoverModal.tsx
        - Extend source-job select with product_id + user_products join
        - Add resolveSceneRefByTitleAndCategory helper + PRODUCT_TYPE_TO_COLLECTION map
        - Pre-fill pickedSceneName + resolvedSceneRef from title+category
        - Skip AI describe scene suggestion when resolver succeeds
        - Use resolvedSceneRef in authoritativeSceneRef calc
```

