

## Fix: White Studio Generation Failures + Remove "Try Again" Button

### Root Cause
The edge function logs reveal the exact error:
```
Invalid URL format: /images/hero/hero-hp-white.png
```

The **White Studio** scene (`scene_038`) in `src/data/mockData.ts` uses a relative path (`/images/hero/hero-hp-white.png`) for its `previewUrl`. All other scenes use absolute URLs (CDN or Supabase storage). When this relative path is sent to the AI provider as a scene reference image, it fails because the provider can't resolve a relative URL.

### Changes

**1. `src/data/mockData.ts`** — Fix the White Studio scene URL
- Change `sceneWhiteStudio` from the relative path `/images/hero/hero-hp-white.png` to an absolute URL. The simplest fix is to prefix it with `window.location.origin`, but since this is a static data file, we'll upload or reference the image via the same CDN/storage pattern used by other scenes, OR add a runtime guard in Freestyle.

Best approach: Add a runtime guard in `src/pages/Freestyle.tsx` that converts any relative `previewUrl` to an absolute URL before passing it to the edge function. This is more robust and catches any future scenes with relative paths.

**2. `src/pages/Freestyle.tsx`** — Ensure scene image URLs are absolute
- Before sending `sceneImageUrl` to the edge function, check if it starts with `/` and prepend `window.location.origin` to make it a full URL the AI provider can fetch.

**3. `src/components/app/freestyle/FreestyleGallery.tsx`** — Remove "Try again" button
- Remove the `onRetry` prop and the "Try again" button from `GenerationFailedCard`
- Keep only the "Dismiss" button, styled more prominently since it's now the sole action

### Technical Detail
The fix in Freestyle.tsx will be approximately:
```typescript
if (sceneImageUrl && sceneImageUrl.startsWith('/')) {
  sceneImageUrl = `${window.location.origin}${sceneImageUrl}`;
}
```

This ensures any relative scene path becomes a fetchable absolute URL for the AI provider.

