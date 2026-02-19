

## Fix Stale Signed URL Config for Public Buckets

### Problem Found

The `src/lib/signedUrl.ts` file has a `PRIVATE_BUCKETS` array that is outdated. It still lists `freestyle-images` and `tryon-images` as private, but both buckets were made **public** in earlier changes. This causes:

- **Unnecessary signed URL generation** for every freestyle and try-on image -- adds latency and API calls
- **Signed URLs expire after 1 hour**, so images in the gallery/library can break if the user keeps the tab open longer than that
- **Mobile reliability issues** -- long signed URLs with JWT tokens are the exact problem we previously fixed for `product-uploads`

### What New Profiles CAN See (No Issues)

- Workflows, custom models, custom scenes, discover presets -- all have proper public SELECT RLS policies
- Product images (`product-uploads` -- public bucket)
- Workflow preview images (`workflow-previews` -- public bucket)
- Landing assets (`landing-assets` -- public bucket)
- Dashboard, onboarding, team carousel -- all work correctly

### What Needs Fixing

**1. Update `PRIVATE_BUCKETS` in `src/lib/signedUrl.ts`**

Remove `freestyle-images` and `tryon-images` from the private buckets list since they are now public. Only `generated-videos` and `generation-inputs` remain private.

Change from:
```text
['freestyle-images', 'tryon-images', 'generated-videos', 'generation-inputs']
```
To:
```text
['generated-videos', 'generation-inputs']
```

This single change cascades through all 6 files that use `toSignedUrl` / `toSignedUrls`:
- `RecentCreationsGallery.tsx` -- will stop signing freestyle/tryon URLs
- `useFreestyleImages.ts` -- will stop signing freestyle URLs  
- `useLibraryItems.ts` -- will stop signing library image URLs
- `WorkflowRecentRow.tsx` -- will stop signing workflow result URLs
- `WorkflowPreviewModal.tsx` -- will stop signing preview URLs
- `useGenerateVideo.ts` -- will correctly continue signing video URLs (still private)

**2. No other privacy issues found**

- The `handle_new_user` database trigger exists and is attached to `auth.users` -- new profiles ARE created automatically with 20 credits
- All user-scoped tables (products, jobs, generations, etc.) have correct RLS policies restricting access to `auth.uid() = user_id`
- Public content (workflows, models, scenes, presets) is accessible to all authenticated users
- Generated videos remain private with proper signed URL handling

### Files Modified
- `src/lib/signedUrl.ts` -- remove `freestyle-images` and `tryon-images` from `PRIVATE_BUCKETS`

