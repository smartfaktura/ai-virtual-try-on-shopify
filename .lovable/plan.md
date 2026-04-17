

## You're 100% right — and here's the fix

**Current waste per demo click:**
1. Fetch demo PNG from `/public` → re-upload to `product-uploads` storage (new file every time)
2. Call `analyze-product-image` edge fn → Gemini API call (title, type, description)
3. Insert `user_products` row
4. Later in flow: `analyze-product-category` → another Gemini call (35+ tokens)
5. Result: ~2 paid AI calls + storage bloat **per demo, per user, every time**

For 9 fixed demos that literally never change, this is 100% avoidable.

## Fix: Pre-baked demo metadata, instant insert

### 1. Pre-compute analyses once (offline, one-time)
Run each demo image through both `analyze-product-image` + `analyze-product-category` **once**, save the resulting JSON into a static file:

```ts
// src/data/demoProducts.ts
export const DEMO_PRODUCTS = [
  {
    id: 'demo_eyewear',
    title: 'Cat-Eye Glasses',
    productType: 'eyewear',
    description: 'Burgundy acetate cat-eye optical frames...',
    image_url: 'https://[bucket]/demos/demo-eyewear.png', // permanent public URL
    analysis_json: { category: 'eyewear', sizeClass: 'small', colorFamily: 'red', ... }, // full v2 token set
  },
  // ...8 more
];
```

### 2. Host demo images permanently in storage (one-time)
Upload the 9 PNGs once to a public `demos/` prefix in `product-uploads` (or a dedicated `demo-products` bucket). Get stable public URLs. No per-user re-upload.

### 3. New `handleDemoSelect` — instant, zero-cost
Replace the `onSelect={handleQuickUpload}` path with a dedicated handler:

```ts
const handleDemoSelect = async (demo: DemoProduct) => {
  const { data: newProduct } = await supabase
    .from('user_products')
    .insert({
      user_id: user.id,
      title: demo.title,
      product_type: demo.productType,
      description: demo.description,
      image_url: demo.image_url,        // shared permanent URL
      analysis_json: demo.analysis_json, // pre-baked, skips analyze-product-category too
    })
    .select()
    .single();
  
  await queryClient.invalidateQueries({ queryKey: ['user-products'] });
  setSelectedProductIds(prev => new Set(prev).add(newProduct.id));
};
```

**Result:** Single DB insert. ~100ms vs ~5–8s. Zero AI cost. `useProductAnalysis` will see `analysis_json.version === 2` already cached and skip entirely.

## Implementation steps

| Step | What | Where |
|---|---|---|
| 1 | Build a one-off script to upload 9 PNGs to `product-uploads/demos/` (public path) and run both analyses, dump JSON | `scripts/seed-demos.ts` (run once via exec) |
| 2 | Save resulting metadata as static TS const | `src/data/demoProducts.ts` |
| 3 | Update `DemoProductPicker` to pass full demo object (not just File) via new `onSelectDemo` prop | `DemoProductPicker.tsx` |
| 4 | Add `handleDemoSelect` in `ProductImages.tsx`, wire to picker | `src/pages/ProductImages.tsx` |
| 5 | Keep `handleQuickUpload` untouched — only used for real user uploads now | (no change) |

## Notes on storage RLS
The `product-uploads` bucket requires `{user_id}/...` prefixed paths (per memory). Demos shared across users need either:
- **Option A**: a `demos/` prefix with a public-read RLS exception, OR
- **Option B**: a dedicated public `demo-products` bucket (cleaner)

I'd go with **Option B** — separate bucket, public read, admin-only write. Cleaner isolation, no RLS workaround.

## Acceptance
- Clicking a demo product: row appears in user's products in <300ms
- Zero edge function calls (verifiable in Network tab)
- `analysis_json` already populated — no spinner during Step 1 → Step 2 transition
- Real uploads (file picker, paste, drop) still go through full analysis pipeline
- All 9 demos use shared image URLs (no per-user storage duplication)

