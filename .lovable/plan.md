

## Audit: Creative Drops -- Remaining Issues Before Backend Build

After tracing the full flow from wizard save to `trigger-creative-drop` to `generate-workflow`, here are the remaining issues that will cause incorrect or broken generation results.

---

### Issue 1: Theme Does Nothing

The wizard collects a "Theme" (Summer, Winter, Holiday, etc.) and "Special Instructions" (themeNotes) in Step 1. These are saved to `creative_schedules` as `theme` and `theme_notes` columns. However:

- `trigger-creative-drop` never reads `schedule.theme` or `schedule.theme_notes`
- `generate-workflow` has no `theme` or `theme_notes` field in its request interface
- Neither value is ever injected into any prompt

**Result**: The theme selection is purely decorative. Selecting "Summer" vs "Winter" produces identical generation results.

**Fix**: In `trigger-creative-drop`, inject the theme and notes into each job payload. In `generate-workflow`, add a `SEASONAL DIRECTION` block to the prompt when present:

```
SEASONAL DIRECTION: Summer
Generate imagery with a warm, sun-drenched summer aesthetic.
Additional notes: Bright outdoor lighting, tropical vibes
```

---

### Issue 2: Brand Profile ID Is Passed but Never Resolved

The trigger function passes `brand_profile_id` (a UUID string) in each job payload. But `generate-workflow` expects a full `brand_profile` **object** with fields like `tone`, `color_palette`, `brand_keywords`, `do_not_rules`, etc. The function uses these fields to build the `BRAND GUIDELINES` section of the prompt.

Since the trigger only sends an ID, `generate-workflow` receives no brand data. The `body.brand_profile` will be `undefined`, and all brand styling is silently skipped.

**Result**: Selecting a brand profile in the wizard has zero effect on generated images.

**Fix**: In `trigger-creative-drop`, fetch the brand profile from the database and pass the full object:

```typescript
// Before the job loop
let brandProfile = null;
if (schedule.brand_profile_id) {
  const { data } = await supabase
    .from('brand_profiles')
    .select('*')
    .eq('id', schedule.brand_profile_id)
    .single();
  if (data) {
    brandProfile = {
      tone: data.tone,
      color_temperature: data.color_temperature,
      color_palette: data.color_palette,
      brand_keywords: data.brand_keywords,
      do_not_rules: data.do_not_rules,
      target_audience: data.target_audience,
    };
  }
}
// Then in each payload:
payload.brand_profile = brandProfile;
```

---

### Issue 3: Product Data Is Not Resolved in Trigger

The trigger sends `product_id` (a UUID) in each job payload. But `generate-workflow` expects a full `product` object with `title`, `productType`, `description`, `dimensions`, and `imageUrl` (as base64). The trigger never fetches product data from `user_products`.

**Result**: `generate-workflow` will reject the request with "Missing required fields: workflow_id and product" because `body.product` is undefined.

**Fix**: Fetch all selected products at the start of the trigger, then build the full product object for each job:

```typescript
const { data: productRows } = await supabase
  .from('user_products')
  .select('id, title, product_type, description, dimensions, image_url')
  .in('id', productIds);

// In the loop:
const productData = productRows.find(p => p.id === productId);
payload.product = {
  title: productData.title,
  productType: productData.product_type,
  description: productData.description || '',
  dimensions: productData.dimensions || undefined,
  imageUrl: productData.image_url, // URL, not base64 -- see Issue 4
};
```

---

### Issue 4: generate-workflow Expects Base64 Image, Trigger Sends URL

The individual generation flows (from the Generate page) convert product images to base64 via `convertImageToBase64()` before sending. But the trigger function would send the raw storage URL from `user_products.image_url`.

The AI gateway accepts both base64 and URLs in the `image_url` field, so this may work. However, if the storage URL requires authentication or is a private bucket, the AI gateway won't be able to access it.

**Fix**: Use the public URL directly (Supabase storage public URLs work). Add a comment noting this dependency. If the `product-images` bucket is private, the trigger must generate a signed URL or convert to base64 server-side.

---

### Issue 5: `imagesPerDrop` Treated as Variation Count, Not Image Count

The trigger sets `imageCount: imagesPerDrop` (e.g., 25) for each job. But `generate-workflow` has a hard cap of `maxImages = 4` (line 509) and slices variations to that limit. So even if the user requests 25 images per workflow, they get at most 4 (one per variation, max 4 variations).

The wizard lets users pick 10, 25, 50, or 100 images per workflow, but the backend can only produce up to 4 per call.

**Result**: Users are charged for 25 images but receive 4. The credit calculator also overcharges.

**Fix**: Either:
- (a) The trigger should split the request into multiple batched calls of 4, or
- (b) Clarify in the UI that "images per workflow" actually means "variations to generate" (max based on available variations), or
- (c) Remove the `maxImages = 4` cap in `generate-workflow` and allow generating more (but this increases AI gateway costs and timeout risk).

The most honest fix is (b): change the "Images Per Workflow" selector to show the actual variation count for each workflow, and let users pick which variations, not a raw number. The credit calculator should use the actual variation count, not `imagesPerDrop`.

---

### Issue 6: No `do_not_rules` / Negatives Injection

Even when a brand profile is properly resolved, the `do_not_rules` array (brand negatives like "no neon colors", "no cluttered backgrounds") is available in the brand profile object but is never injected into the generation prompt's negative/avoid section. The `buildVariationPrompt` function only uses `config.negative_prompt_additions` from the workflow config.

**Fix**: Merge brand `do_not_rules` into the negative prompt in `buildVariationPrompt`:

```typescript
const allNegatives = [
  config.negative_prompt_additions,
  ...(brandProfile?.do_not_rules || []),
].filter(Boolean).join('. ');

// In prompt:
`AVOID: ${allNegatives}`
```

---

### Summary of Changes

**File: `supabase/functions/trigger-creative-drop/index.ts`**
- Fetch and resolve brand profile from DB (full object, not just ID)
- Fetch and resolve product data from DB (title, type, description, image_url)
- Inject `theme` and `theme_notes` into each job payload
- Fix `imageCount` to match actual variation count, not `imagesPerDrop`

**File: `supabase/functions/generate-workflow/index.ts`**
- Add `theme` and `theme_notes` to the `WorkflowRequest` interface
- Add a `SEASONAL DIRECTION` prompt block when theme is present
- Merge `brand_profile.do_not_rules` into negative prompts

**File: `src/components/app/CreativeDropWizard.tsx`**
- Update the "Images Per Workflow" UI to clarify it represents variation/scene selections, not a raw image count (or keep as-is and handle batching server-side)

**File: `src/lib/dropCreditCalculator.ts`**
- Align cost calculation with actual generation capacity (variation count, not arbitrary image count)

