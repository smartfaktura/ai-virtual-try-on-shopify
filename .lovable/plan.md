

# Fix Zoomed-In Workflow Card Images

## Problem
The `width: 600` parameter in `getOptimizedUrl` calls inside `WorkflowAnimatedThumbnail.tsx` triggers server-side resizing/cropping via Supabase image transforms. The card container is larger than 600px, so the resized image gets stretched, appearing zoomed in.

This contradicts the established convention: *avoid `width` parameters for result cards to prevent server-side cropping*.

## Changes — `src/components/app/WorkflowAnimatedThumbnail.tsx`

### 1. CarouselThumbnail (line 154)
Remove `width: 600` — use quality-only optimization:
```
getOptimizedUrl(bg, { width: 600, quality: 60 })  →  getOptimizedUrl(bg, { quality: 60 })
```

### 2. UpscaleThumbnail (line 248)
Same fix:
```
getOptimizedUrl(scene.background, { width: 600, quality: 60 })  →  getOptimizedUrl(scene.background, { quality: 60 })
```

No other files affected. The `StagingThumbnail` (line 426-428) and `FloatingEl` (line 78-79) already use quality-only — those are correct.

