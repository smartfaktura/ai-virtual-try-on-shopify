## Scope

Three small UI fixes for `/app/generate/product-images` (Review / Step 4 + global wizard chrome).

## 1. Mobile labels for "Images per scene"

File: `src/components/app/product-images/ProductImagesStep4Review.tsx` (~L244-257).

In the `IMAGE_COUNT_OPTIONS.map` button, replace `{o.label}` with two spans:

- `<span className="sm:hidden">{o.value}</span>` → shows just `1`, `2`, `3`, `4` on mobile
- `<span className="hidden sm:inline">{o.label}</span>` → keeps `1 image / 2 images …` on ≥640px

No constants change — keeps Step 3 untouched.

## 2. Fix zoomed-in / cropped mini thumbnails

Root cause: `getOptimizedUrl(url, { width: 64, quality: 60 })` hits Supabase's `/render/image/` which **crops** server-side when only `width` is provided (documented in `src/lib/imageOptimization.ts` warning). Result: product/scene chip thumbs lose their white-bg framing and look zoomed in.

Fix — switch to **quality-only** optimization for these small product/scene chips so CSS `object-cover` controls the frame and the source isn't pre-cropped.

Files & edits:

- `src/components/app/product-images/ProductImagesStep4Review.tsx`
  - L284 (product chip thumb): `getOptimizedUrl(p.image_url, { width: 64, quality: 60 })` → `getOptimizedUrl(p.image_url, { quality: 60 })`
  - L320 and L339 (scene chip thumbs): same — drop `width: 64`, keep `quality: 60`
  - Change CSS on those three `<img>` from `object-cover` → `object-contain` so the product (often on white bg) fits inside the 20px circle without being cropped. Keep `bg-muted` for empty area.

- `src/components/app/product-images/ProductContextStrip.tsx`
  - L28: `<ShimmerImage src={p.image_url} …>` currently sends the full original to a 32px box. Wrap with optimizer: `src={getOptimizedUrl(p.image_url, { quality: 60 })}` (import `getOptimizedUrl` from `@/lib/imageOptimization`).
  - Change `object-cover` → `object-contain` on the same image so the product fills the 32px tile correctly without being zoomed past its edges.

## 3. Hide the "Products / Change" strip on the Review (Generate) step

File: `src/pages/ProductImages.tsx` L1409.

Current: `{step >= 2 && step <= 4 && selectedProducts.length > 0 && (<ProductContextStrip … />)}`

Change to: `{step >= 2 && step <= 3 && selectedProducts.length > 0 && (<ProductContextStrip … />)}`

The strip still appears on Shots (step 2) and Refine (step 3), and is hidden on Review/Generate (step 4) where the Review summary card already shows the selected products with an Edit affordance.

## Out of scope

No logic, routing, credit-math, or data-fetching changes. No edits to Step 3 settings, Step 2 scenes, or any backend code.
