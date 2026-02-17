
## Fix: Generated Images Not Loading (Bucket Access Issue)

### Root Cause

The storage buckets `tryon-images` and `freestyle-images` are set to **private**, but the edge functions use `getPublicUrl()` to generate image URLs. Private buckets reject requests to the `/object/public/` path, returning a 404 "Bucket not found" error. Since `<img>` tags in the browser cannot send authentication headers, the images never load.

The `workflow-previews` bucket works because it is already public.

### Fix

Run a database migration to update both buckets to **public** access. This is the same approach already used for `workflow-previews` and `scratch-uploads`.

```sql
UPDATE storage.buckets SET public = true WHERE id IN ('tryon-images', 'freestyle-images');
```

This single SQL statement will make both buckets publicly accessible, allowing the existing `getPublicUrl()` URLs to work correctly.

### Why Public Is Safe Here

- The file paths already include the user's ID as a folder prefix (e.g., `fe45fd27-.../image.png`), so URLs are not guessable
- These are AI-generated images, not sensitive user data
- The same pattern is already used for `workflow-previews` and `scratch-uploads`

### Files Modified
- Database migration only -- no code changes needed

### Result
All previously generated images (try-on, freestyle) will immediately start loading. No regeneration required.
