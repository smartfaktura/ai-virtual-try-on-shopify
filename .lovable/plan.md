

## Fix zoomed-in scene thumbnails in Freestyle

### Problem
`SceneSelectorChip.tsx` line 185 passes `{ width: 240, quality: 60 }` to `getOptimizedUrl`, which triggers Supabase server-side resizing — cropping/zooming the scene previews.

### Fix

**File: `src/components/app/freestyle/SceneSelectorChip.tsx`** — Line 185

Change:
```tsx
src={getOptimizedUrl(pose.previewUrl, { width: 240, quality: 60 })}
```
To:
```tsx
src={getOptimizedUrl(pose.previewUrl, { quality: 60 })}
```

Remove the `width` parameter to use quality-only compression, preserving original framing — consistent with the project's image optimization conventions for showcase/selector components.

