

## Security Hardening Plan

### Critical: Make Storage Buckets Private for User Content

The biggest vulnerability: 6 storage buckets containing user-generated content are **public**, meaning anyone with a URL can access the files -- no authentication required.

| Bucket | Current | Should Be | Risk |
|---|---|---|---|
| `freestyle-images` | Public | Private | User AI generations exposed |
| `tryon-images` | Public | Private | User try-on photos exposed |
| `generated-videos` | Public | Private | User videos exposed |
| `generation-inputs` | Public | Private | User product photos exposed |
| `scratch-uploads` | Public | Keep public | Temporary uploads, acceptable |
| `workflow-previews` | Public | Keep public | System preview images, acceptable |
| `landing-assets` | Public | Keep public | Marketing images, acceptable |

### What We Will Do

**1. Make 4 buckets private and add proper storage RLS policies**

Switch `freestyle-images`, `tryon-images`, `generated-videos`, and `generation-inputs` from public to private. Then add SELECT policies so only the file owner (identified by the user ID folder prefix) can read their files.

Since your edge functions use the service role key, they will continue to work without any policy changes -- the service role bypasses RLS.

**2. Generate signed URLs instead of public URLs**

Update the frontend code that displays images from these buckets to use signed URLs (time-limited, authenticated) instead of direct public URLs. This applies to:
- Library page (generation results, freestyle images)
- Video generation results
- Try-on preview images

**3. Enable leaked password protection**

A simple auth configuration change to reject passwords found in known data breaches.

**4. Dismiss false-positive findings**

The scanner flagged database tables as "exposed" but the RLS policies are actually correct -- every table uses `auth.uid() = user_id`. These will be marked as reviewed.

### Technical Details

**Migration SQL** (bucket privacy):
```sql
UPDATE storage.buckets SET public = false WHERE name IN ('freestyle-images', 'tryon-images', 'generated-videos', 'generation-inputs');
```

**New storage policies** for private buckets: owner-only SELECT using the existing folder-prefix pattern (`auth.uid()::text = (storage.foldername(name))[1]`).

**Frontend changes**: Replace direct URL references with `supabase.storage.from('bucket').createSignedUrl(path, 3600)` calls for user-generated content. This means updating:
- `useLibraryItems.ts` -- image URLs from generation results
- `useFreestyleImages.ts` -- freestyle image display
- Video display components
- Try-on preview components

**Files to modify**:
- New database migration (storage bucket + policies)
- `src/hooks/useLibraryItems.ts`
- `src/hooks/useFreestyleImages.ts`
- Components rendering user-generated images from these buckets
- Auth configuration for leaked password protection

