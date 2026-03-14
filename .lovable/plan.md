

## Improve Product URL Import Error Handling

The current error messages are raw/technical. We need friendly, branded messages from the VOVV.AI team that explain what happened and what to do next.

### Changes

**1. `src/components/app/StoreImportTab.tsx` — Better error display and messaging**

Replace the simple error `<div>` with a richer error card that maps known error patterns to friendly explanations:

- **403 / "blocking automated requests"** → "This website has bot protection that prevents us from accessing the product page. Our team recommends using the Upload tab to add this product manually."
- **"Could not find product title or images"** → "We couldn't detect product data on this page. Make sure you're linking directly to a product page (not a collection or homepage)."
- **"Could not download any product images"** → "The product images on this site are protected. Try right-click saving the images and uploading them via the Upload tab."
- **"Could not extract product data"** → "This page uses dynamic rendering that our importer can't read yet. Try the Upload tab instead."
- **Generic fallback** → "Something went wrong during import. Try again or use manual upload."

Each error will show:
- A clear title ("Import blocked by website")
- A helpful explanation
- A suggestion from the VOVV.AI team
- A "Try Manual Upload" button that switches to the Upload tab (or prompts the user)

**2. `supabase/functions/import-product/index.ts` — Add error codes to responses**

Add an `error_code` field alongside `error` messages so the frontend can pattern-match reliably instead of parsing strings:
- `site_blocked` (HTTP 403/bot protection)
- `no_product_data` (no title/images found)
- `images_protected` (couldn't download images)
- `extraction_failed` (AI parse failure)
- `invalid_url` / `unauthorized`

**3. StoreImportTab — Add "Try Upload Instead" action button in error state**

Include a button in the error card that either navigates to the Upload tab or calls a callback, making the recovery path obvious.

### Files Modified
| File | Change |
|---|---|
| `supabase/functions/import-product/index.ts` | Add `error_code` to all error responses |
| `src/components/app/StoreImportTab.tsx` | Map error codes to friendly messages with team tips and recovery action |

