

## Fix Product URL Import + Redesign Add Product Modal

### Issue 1: Product URL Import Failing (Alo Yoga)

The edge function fetches the raw HTML but many modern sites (like aloyoga.com) use client-side rendering, so the HTML contains minimal product data. The AI extractor then fails to find title/images and returns a non-2xx error.

**Fix in `supabase/functions/import-product/index.ts`:**
- Increase HTML truncation from 15,000 to 50,000 characters to capture more data from JS-heavy pages
- Add fallback: try fetching the Shopify JSON API endpoint (`/products/[handle].json`) for Shopify-detected URLs before scraping HTML -- this returns structured data reliably
- Improve error messages so the user gets a clear explanation instead of a generic "non-2xx status code"
- Add better User-Agent and Accept headers to avoid bot detection

### Issue 2: Modal Design Overhaul -- Modern, Spacious, Apple-Inspired

The current modal feels cramped and the sticky footer overlaps content. A full redesign to match the luxury aesthetic.

**Changes to `src/components/app/AddProductModal.tsx`:**
- Increase modal max-width from `580px` to `640px`
- Add more generous padding (`px-8 pt-8`) for a spacious feel
- Remove the internal scrollable wrapper and let the dialog handle overflow properly
- Clean up tab styling with more spacing between tabs

**Changes to `src/components/app/ManualProductTab.tsx`:**
- Remove the `sticky` footer -- instead place it naturally at the bottom with proper spacing and a top border
- Remove negative margins (`-mx-6 px-6`) that cause overlap issues
- Increase vertical spacing between form sections (`space-y-6` instead of `space-y-5`)
- Make the dropzone taller and more visually inviting
- Increase description textarea rows from 2 to 3

**Changes to `src/components/app/StoreImportTab.tsx`:**
- Same footer fix: remove sticky positioning, use natural flow with proper spacing
- Remove negative margins on footer
- Better error state styling

**Changes to `src/components/app/CsvImportTab.tsx`:**
- Same footer fix as above
- More generous dropzone padding

### Technical Details

**Shopify JSON API fallback (import-product edge function):**
```text
For URLs containing "/products/", try fetching:
  {origin}/products/{handle}.json

This returns structured JSON with title, images[], body_html, 
product_type -- no scraping needed. If this fails, fall back 
to the existing HTML scraping + AI extraction approach.
```

**Footer fix pattern (all tabs):**
Replace:
```
<div className="sticky bottom-0 ... -mx-6 px-6">
```
With:
```
<div className="flex justify-end gap-2 pt-5 mt-2">
```
No sticky, no negative margins, no overlap.

### Files Modified
- `supabase/functions/import-product/index.ts` -- Shopify JSON fallback, better error handling, larger HTML window
- `src/components/app/AddProductModal.tsx` -- wider modal, more padding, better layout
- `src/components/app/ManualProductTab.tsx` -- remove sticky footer, more spacious layout
- `src/components/app/StoreImportTab.tsx` -- remove sticky footer, clean spacing
- `src/components/app/CsvImportTab.tsx` -- remove sticky footer, clean spacing

