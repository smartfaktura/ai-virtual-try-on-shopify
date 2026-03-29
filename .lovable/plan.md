

# Fix Zoomed-In Scene Thumbnails

## Problem
Adding `width: 400` to `getOptimizedUrl` for scene thumbnails causes Supabase's image transform to resize/crop the source image, resulting in a "zoomed-in" appearance. The project convention (confirmed by existing patterns in LibraryImageCard, FreestyleQuickPresets, etc.) is to use **quality-only** compression without width constraints.

## Change

**File: `src/components/app/generate/WorkflowSettingsPanel.tsx`** (line 399)

Remove the `width: 400` parameter, keeping only `quality: 60`:

```tsx
// Before (causes zoom)
getOptimizedUrl(v.preview_url, { width: 400, quality: 60 })

// After (quality-only, no distortion)
getOptimizedUrl(v.preview_url, { quality: 60 })
```

This matches how LibraryImageCard and other components optimize thumbnails — quality compression only, no width resize.

