# Drop "space/location" branch from product analyzer

Today `analyze-product-image` is dual-purpose — it returns either a product OR a room/building/space (`Living Room`, `Front Facade`, **`Basketball Court`**…). Spaces get written into `user_products.product_type` verbatim, and because they have no canonical category they always fall into `other`.

We want products only.

## Changes

### 1. `supabase/functions/analyze-product-image/index.ts`

Rewrite the prompt to be **product-only**:

- Remove the entire "If it's a ROOM, BUILDING, or SPACE…" branch.
- Add an explicit instruction: *"If the image is not a tangible product (e.g. it shows a room, building, landscape, sports court, street scene, indoor/outdoor location, person without a clear product, screenshot, logo only, abstract art), return `{ "kind": "not_product", "reason": "<short reason>" }` and nothing else."*
- For products, require `kind: "product"` and `category` chosen from the canonical enum (`fragrance, beauty-skincare, … other`) — never null, never freeform. `productType` stays a short label like "Leggings", "Scented Candle".
- Keep the phone-case anti-brand rules unchanged.
- Server-side guard: after JSON parse, if `kind === "not_product"` OR if `resolveCanonicalCategory` returns nothing AND the title/productType matches space keywords (`court|room|kitchen|bedroom|living|office|facade|building|street|park|stadium|gym|studio space|landscape`), force the response to `{ kind: "not_product", reason: "Image looks like a location, not a product" }`. This is a saugiklis in case the model ignores the rule.

### 2. Client callers handle `not_product`

Four callers: `src/components/app/ManualProductTab.tsx`, `src/components/app/UploadSourceCard.tsx`, `src/pages/TextToProduct.tsx`, `src/pages/ProductImages.tsx`.

In each:
- After `supabase.functions.invoke('analyze-product-image', …)`, if `data.kind === 'not_product'`, **abort** the upload flow (don't insert into `user_products`, don't autofill fields), and show a toast: *"That looks like a location, not a product. Upload a product photo to continue."*
- For ManualProductTab batch mode, mark that batch item as rejected and skip it (don't silently mislabel as "other").

No credit/billing change needed — `analyze-product-image` doesn't deduct credits.

### 3. One-off cleanup (optional, mention)

The existing `956b1175-…` row ("Outdoor Basketball Court", product_type "Basketball Court") stays in the DB until the user deletes it. Not deleting automatically — it's user data.

## Out of scope

- No DB schema change. `product_type` stays a free-text column.
- No change to other analyzers (`analyze-product-category`, `analyze-trend-post`, room/scene generators) — they're used elsewhere intentionally.
- Brand Scenes / location uploads (if any) use their own flow, untouched.

## Files

- `supabase/functions/analyze-product-image/index.ts`
- `src/components/app/ManualProductTab.tsx`
- `src/components/app/UploadSourceCard.tsx`
- `src/pages/TextToProduct.tsx`
- `src/pages/ProductImages.tsx`
