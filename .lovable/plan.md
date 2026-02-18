

## Fix Product Image Not Loading on Mobile

### Root Cause

The `product-uploads` storage bucket is set to **private**. Product images are stored as signed URLs (with long JWT tokens in the query string). While these work on desktop preview, they can fail on mobile browsers (especially Safari) due to:
- Very long URL strings with JWT tokens that mobile browsers may handle differently
- Token-based URLs are not cacheable, causing repeated failed fetches
- Some mobile browsers strip or truncate long query parameters

Other image buckets (`tryon-images`, `freestyle-images`, `workflow-previews`) are already set to public for exactly this reason.

### Fix

1. **Make `product-uploads` bucket public** via a database migration -- this matches the pattern used by other image buckets in the app.

2. **Update the import-product edge function** (`supabase/functions/import-product/index.ts`) to store public URLs instead of signed URLs when saving imported product images.

3. **Update the AddProductModal / ManualProductTab** upload flow to use `getPublicUrl()` instead of `createSignedUrl()` when storing the image reference in the database.

### Technical Details

**Migration SQL:**
```sql
UPDATE storage.buckets SET public = true WHERE id = 'product-uploads';
```

**Edge function change:** Replace `createSignedUrl()` calls with `getPublicUrl()` for the product-uploads bucket.

**Frontend upload change:** In the upload flow (ManualProductTab), after uploading to storage, use `supabase.storage.from('product-uploads').getPublicUrl(path)` instead of `createSignedUrl()`.

**Existing products:** Products already stored with signed URLs will continue to work until their tokens expire (~1 year). Making the bucket public means even old signed URLs still work, and new products will use simpler public URLs.

### Files Modified
- Database migration -- make product-uploads bucket public
- `supabase/functions/import-product/index.ts` -- use public URLs
- `src/components/app/ManualProductTab.tsx` -- use public URLs after upload
