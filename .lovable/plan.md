

## Security Hardening Plan — COMPLETED ✅

### What Was Done

**1. Made 4 storage buckets private** (`freestyle-images`, `tryon-images`, `generated-videos`, `generation-inputs`)
- Added owner-only SELECT policies using `auth.uid()::text = (storage.foldername(name))[1]`

**2. Updated frontend to use signed URLs**
- Created `src/lib/signedUrl.ts` utility for converting public URLs → signed URLs (1hr expiry)
- Updated `useLibraryItems.ts`, `useFreestyleImages.ts`, `useGenerateVideo.ts`, `RecentCreationsGallery.tsx`
- Updated `Freestyle.tsx` upload helper to use signed URLs
- Moved team demo video URLs from `generated-videos` to `landing-assets/team-videos`

**3. Dismissed false-positive security findings**
- `profiles` table: RLS correctly restricts to own row
- `generation_queue`: RLS correctly restricts to own entries
- `discover_item_views`: intentional anonymous tracking

### Remaining Items
- **Leaked password protection**: Still flagged as disabled (requires auth config change)
- **Studio-chat endpoint**: Still has no auth validation (medium priority)
- **scratch-uploads bucket**: Still fully public (low priority, temporary files)
- **RLS always-true policy**: Needs investigation to identify which table/policy
- **Team demo videos**: Need to copy video files from `generated-videos` bucket to `landing-assets/team-videos/` folder in storage
