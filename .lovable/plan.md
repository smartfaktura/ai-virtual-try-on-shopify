## Problem

Reference image uploads (back view, packaging, scene extras, per-product triggers) fail with "new row violates row-level security policy" because the storage upload paths don't include the user's ID as the first folder segment.

The storage RLS INSERT policy on `product-uploads` requires: `auth.uid()::text = storage.foldername(name)[1]` — meaning the path must start with `{user_id}/`.

The working quick-upload in `ProductImages.tsx` correctly uses `${user.id}/...`, but three reference upload handlers in `ProductImagesStep3Refine.tsx` use paths like `packaging-refs/...` and `scene-extra-refs/...` without the user ID prefix.

## Fix

Update all three upload handlers in `src/components/app/product-images/ProductImagesStep3Refine.tsx` to prefix the storage path with the authenticated user's ID:

1. **Packaging reference upload** (~line 1924): Change path from `packaging-refs/${ts}-...` to `${userId}/packaging-refs/${ts}-...`
2. **Per-product reference upload** (~line 2059): Change path from `scene-extra-refs/${ts}-...` to `${userId}/scene-extra-refs/${ts}-...`
3. **Extra reference upload** (~line 2257): Change path from `scene-extra-refs/${ts}-...` to `${userId}/scene-extra-refs/${ts}-...`

Each handler already imports the supabase client; we'll also call `supabase.auth.getUser()` (or pass the user ID as a prop) to get the current user's ID for the path prefix.

### Technical detail

The component receives props but doesn't currently have the user ID. The simplest approach is to import `supabase` and call `auth.getUser()` inside each handler (already async), or thread the user ID through from the parent which already has it.
