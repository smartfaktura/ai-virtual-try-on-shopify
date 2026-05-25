## Problem

The brand-scene preview generation flow now lets users swap the default stock product with their own product via `UserProductPickerModal`. However, the `generate-brand-scene` edge function's SSRF guard rejects user-product images because they use signed Supabase Storage URLs (`/storage/v1/object/sign/product-uploads/...`) while the guard only allows `/storage/v1/object/public/` paths. The result: `productInlineData` is silently undefined when a user picks their own product, and the preview generates without the product reference at all.

## Fix

1. **Broaden `isAllowedImageUrl` in `supabase/functions/generate-brand-scene/index.ts`**
   - Change the `pathOk` check from a single `includes("/storage/v1/object/public/")` to also accept `/storage/v1/object/sign/`
   - This keeps the guard strict (still only project Supabase hosts, still HTTPS only) while allowing both public-bucket and signed-bucket URLs

2. **Deploy the edge function**
   - Deploy `generate-brand-scene` so the change goes live immediately

3. **Verify**
   - Use the curl tool to call the function with a signed `product-uploads` URL and confirm it is no longer rejected (no "Rejected productImageUrl (SSRF guard)" in logs)
   - Regression check: confirm a `/public/` URL still works

## Files Changed
- `supabase/functions/generate-brand-scene/index.ts` (1-line `pathOk` change)

## Out of Scope
- No changes to `Step6PreviewAndPick.tsx` or `UserProductPickerModal.tsx` — they already pass the correct signed URLs
- No changes to saved scene persistence — the custom product is still preview-only