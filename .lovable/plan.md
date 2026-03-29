

# Optimize Workflow Thumbnail Image Sizes

## Problem
Workflow thumbnail images are loading at full resolution even though they display at small sizes (~140-400px). Three locations render fallback `<img>` tags without any optimization, and the animated thumbnail backgrounds use `quality: 60` but no `width` constraint.

## Changes

### 1. Fallback images — add `getOptimizedUrl` (3 files)

**`src/components/app/WorkflowCard.tsx`** (line 106):
- Wrap `workflow.preview_image_url || imgFallback` with `getOptimizedUrl(..., { width: 480, quality: 60 })`

**`src/components/app/WorkflowCardCompact.tsx`** (lines 54, 102):
- Same optimization for both fallback `<img>` tags. Import `getOptimizedUrl`.

**`src/pages/Dashboard.tsx`** (line 65):
- Same optimization. Import `getOptimizedUrl`.

### 2. Animated thumbnail backgrounds — add width constraint

**`src/components/app/WorkflowAnimatedThumbnail.tsx`**:
- In `CarouselThumbnail` (line 237): change `getOptimizedUrl(bg, { quality: 60 })` → `getOptimizedUrl(bg, { width: 600, quality: 60 })`
- In `UpscaleThumbnail` (line 348): same change for the background
- In the default/staging mode background (around line 500+): same change
- Element images (chips/circles at 38-60px) already use quality-only which is correct for their small size

This matches the pattern used across the app (e.g., `WorkflowRecentRow` line 47, `PoseSelectorCard`, `SceneSelectorChip`) where thumbnails use `getOptimizedUrl` with quality compression. Adding `width: 600` caps the download at ~600px wide which is more than enough for these card thumbnails.

