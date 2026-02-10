

## Fix: Virtual Try-On Images Not Persisting in Library

### Root Cause

The `generate-tryon` edge function returns **base64 data URLs** from the AI gateway. These base64 strings (often 1-5 MB each) are stored directly into the `generation_jobs.results` JSONB column. This causes:

1. **Silent insert failures** -- the base64 payloads are too large for the database row, so the `.insert()` call fails silently (the `.then()` handler only logs on success, not on error in some code paths).
2. **"Non-existing images"** -- even if a base64 string is saved, it may get truncated or fail to render on reload.
3. **generation_jobs table is currently empty** (0 rows), confirming that saves have been failing. The Library only shows freestyle generations (which use proper storage URLs).

### Solution

Upload generated images to storage in the edge function, then return persistent public URLs instead of raw base64.

### Changes

#### 1. Create storage bucket: `tryon-images` (public)

A new storage bucket for try-on generated images, similar to the existing `freestyle-images` bucket.

#### 2. Update `supabase/functions/generate-tryon/index.ts`

After generating each base64 image:
- Decode the base64 string to binary
- Upload to the `tryon-images` bucket under `{user_id}/{uuid}.png`
- Return the public URL instead of the base64 data

This requires extracting the user ID from the Authorization header (JWT).

#### 3. Update `src/pages/Generate.tsx` (try-on save block, ~line 515)

- Add `.then(({ error })` error logging to match other insert blocks (some paths already have this, ensure consistency)
- No major changes needed here since the edge function will now return proper URLs

### Technical Details

**Edge function change (generate-tryon/index.ts):**
```text
// After getting base64 from AI gateway:
1. Extract user_id from JWT in Authorization header
2. Convert base64 to Uint8Array
3. Upload to storage: tryon-images/{user_id}/{crypto.randomUUID()}.png
4. Get public URL from storage
5. Return public URL in response instead of base64
```

**Storage bucket:**
```text
- Name: tryon-images
- Public: yes (for direct URL access, same as freestyle-images)
- RLS: users can only write to their own folder ({user_id}/ prefix)
```

This is the same pattern used by `freestyle-images` bucket, ensuring consistency across the app.

