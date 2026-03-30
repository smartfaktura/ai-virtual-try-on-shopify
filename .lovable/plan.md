

## Fix Sample Products Failing During Generation

### Root Causes

1. **Database FK violation** — Sample products have string IDs like `sample_ring`. When generation completes, the edge function saves `product_id: 'sample_ring'` to `freestyle_generations`, which has a foreign key to `user_products.id` (UUID). This insert fails.

2. **Unreachable image URL** — The `window.location.origin` fix produces URLs like `https://id-preview--*.lovable.app/images/samples/sample-ring.png`. The AI provider (running on external servers) cannot reliably fetch from the Lovable preview domain.

### Fix

**File: `src/pages/Freestyle.tsx`** (lines 550-562, 679)

- When a sample product is selected (ID starts with `sample_`), set `productId` to `null` in the queue payload so the FK constraint is satisfied.
- For the product image URL: upload the local sample image to Supabase Storage first (using the existing `uploadImageToStorage` helper), so the AI provider gets a publicly accessible Supabase Storage URL instead of a preview-domain URL.

```typescript
// Around line 550-558: Replace the current product image URL logic
if (selectedProduct) {
  const rawUrl = selectedProduct.image_url;
  if (rawUrl.startsWith('data:')) {
    productImageUrl = await uploadImageToStorage(rawUrl, 'product');
  } else if (rawUrl.startsWith('/')) {
    // Local sample image — convert to base64 then upload to storage
    const resp = await fetch(rawUrl);
    const blob = await resp.blob();
    const reader = new FileReader();
    const base64 = await new Promise<string>((resolve) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    productImageUrl = await uploadImageToStorage(base64, 'product');
  } else {
    productImageUrl = rawUrl;
  }
}

// Around line 679: Null out productId for samples
productId: selectedProduct?.id?.startsWith('sample_') ? null : selectedProduct?.id || undefined,
```

### Files to edit
- `src/pages/Freestyle.tsx` — Upload local sample images to storage; null out sample product IDs

