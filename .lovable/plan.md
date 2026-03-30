

## Fix Sample Products in Freestyle Picker

### Problems Identified

1. **Generation crashes with sample products** — Sample product `image_url` values are local paths (e.g. `/images/samples/sample-ring.png`). When passed to the edge function, it sends this relative path as the `productImage` URL. The AI provider can't fetch a localhost path, causing an instant failure.

2. **Grey borders visible** — The sample product cards have `border-2 border-border` styling on the thumbnail wrapper, creating visible grey borders around each sample.

3. **"Draft" badge unnecessary** — The `Badge` with text "Draft" adds visual noise and is confusing for sample products that aren't user-created drafts.

### Plan

**File: `src/components/app/freestyle/ProductSelectorChip.tsx`**

1. **Move sample images to Supabase Storage** — Update `SAMPLE_PRODUCTS` image URLs from local paths (`/images/samples/sample-ring.png`) to Supabase Storage URLs using `getLandingAssetUrl('samples/sample-ring.png')`. This ensures the edge function receives a publicly accessible HTTPS URL that the AI provider can fetch. *(Requires uploading these 3 images to the `landing-assets` bucket under a `samples/` folder first.)*

   **Alternative (simpler)**: Convert the local path to a full absolute URL at generation time in `Freestyle.tsx` (line 551-558) by prepending `window.location.origin` when the URL starts with `/`. This avoids needing to upload images to storage.

2. **Remove grey borders** — Change `border-2 border-border` to `border-0` on the sample thumbnail wrapper (line 126).

3. **Remove "Draft" badge** — Delete the `Badge` element on line 127.

### Recommended Approach

Use the simpler fix: in `Freestyle.tsx` line 553, add handling for relative URLs (starting with `/`) by converting them to absolute URLs (`${window.location.origin}${url}`). This makes them accessible to the edge function without needing to upload new assets. Combined with removing the border and Draft badge from `ProductSelectorChip.tsx`.

### Files to Edit
- `src/pages/Freestyle.tsx` — Handle relative product image URLs
- `src/components/app/freestyle/ProductSelectorChip.tsx` — Remove Draft badge and grey borders

