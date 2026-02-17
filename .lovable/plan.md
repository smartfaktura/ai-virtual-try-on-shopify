

## Fix: Freestyle Images Not Loading in Dashboard & Library

### Root Cause

The `freestyle-images` storage bucket is **private**, requiring signed URLs to access images. In the **Recent Creations gallery** on the dashboard, freestyle image URLs are used directly without signing, causing broken images (the first two cards in your screenshot showing broken "Freestyle" placeholders).

The **Library** hook (`useLibraryItems.ts`) already batch-signs all URLs correctly, so if there's an issue there it may be related to cache staleness after new generations.

### Changes

**File: `src/components/app/RecentCreationsGallery.tsx`**

1. Sign freestyle image URLs before displaying them -- add `await toSignedUrl(f.image_url)` when building freestyle items (around line 101), matching how generation job URLs are already signed on line 67.

2. Additionally, invalidate the `recent-creations` query cache after new freestyle generations complete, to ensure new images appear promptly without waiting for the 15-second polling interval.

**File: `src/hooks/useGenerateFreestyle.ts`** (if not already invalidating)

3. After a successful freestyle generation, invalidate both `recent-creations` and `library` query keys so the dashboard and library update immediately.

### Technical Detail

```tsx
// RecentCreationsGallery.tsx, line 98-106 — before:
for (const f of freestyleResult.data ?? []) {
  items.push({
    id: f.id,
    imageUrl: f.image_url,  // <-- raw public URL, 403 on private bucket
    ...
  });
}

// After:
for (const f of freestyleResult.data ?? []) {
  const signedUrl = await toSignedUrl(f.image_url);
  items.push({
    id: f.id,
    imageUrl: signedUrl,  // <-- now properly signed
    ...
  });
}
```

For the generation hook, add cache invalidation:
```tsx
// In useGenerateFreestyle.ts onSuccess callback:
queryClient.invalidateQueries({ queryKey: ['recent-creations'] });
queryClient.invalidateQueries({ queryKey: ['library'] });
```

