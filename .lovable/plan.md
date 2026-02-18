

## Fix Product Import Error + Modern Modal Redesign

### Issue 1: Alo Yoga 403 Error

The Shopify JSON API fallback is working but Alo Yoga blocks it. The HTML scrape also returns 403. Root causes:
- The URL has a locale prefix (`/en-lt/products/...`) -- the Shopify JSON API should also try the locale-prefixed path
- Both requests lack proper cookies/headers that modern Shopify stores require
- Need to add `Cookie` header and additional headers to bypass bot protection

**Fix in `supabase/functions/import-product/index.ts`:**
- Try multiple Shopify JSON paths: with locale prefix (`/en-lt/products/{handle}.json`) AND without (`/products/{handle}.json`)
- Add `Sec-Fetch-*` headers and broader `Accept-Language` to mimic a real browser request
- For HTML scraping fallback, add the same enhanced headers
- Add a third fallback: try fetching the URL without the locale prefix (some Shopify stores serve the default locale with less blocking)
- Improve error message to suggest "Try removing country/language prefix from the URL"

### Issue 2: Modal Design -- Modern, Apple-Inspired Overhaul

The modal still looks outdated. A full visual refresh:

**`src/components/app/AddProductModal.tsx`:**
- Increase max-width to `680px` for breathing room
- Add a subtle description subtitle under "Add Product" title
- Restyle tabs: use a cleaner pill-style segmented control with `bg-muted` background wrapper and rounded pills for active state
- More generous padding throughout (`px-10 pt-10`)

**`src/components/app/ManualProductTab.tsx`:**
- Replace the `border-t border-border/40` footer divider with clean spacing only
- Use `rounded-xl` buttons with slightly larger size
- More generous spacing between form sections (`space-y-5` for fields)
- Make the dropzone more visually inviting: larger min-height, softer colors

**`src/components/app/StoreImportTab.tsx`:**
- Same footer cleanup -- remove border-t, use clean spacing
- Softer input styling with larger padding
- Better error card styling with rounded-xl

**`src/components/app/CsvImportTab.tsx`:**
- Same footer cleanup
- Rounder dropzone borders
- Softer color palette for the template download area

### Files Modified
- `supabase/functions/import-product/index.ts` -- multi-path Shopify JSON fallback, enhanced headers
- `src/components/app/AddProductModal.tsx` -- wider modal, subtitle, modern tab styling
- `src/components/app/ManualProductTab.tsx` -- cleaner footer, modern spacing
- `src/components/app/StoreImportTab.tsx` -- cleaner footer, softer styling
- `src/components/app/CsvImportTab.tsx` -- cleaner footer, softer styling

