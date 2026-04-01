

# Fix Video Naming — Use Camera Motion in Titles and ZIP Filenames

## Problem
1. Video cards in Video Hub show generic hash-based names (e.g. `video-f743dd96.mp4`)
2. ZIP download names files as `video_1.mp4`, `video_2.mp4` — no camera motion context

## Changes

### 1. `src/pages/VideoHub.tsx` — ZIP download naming

Update `handleDownloadZip` to build meaningful filenames from each video's `camera_type` field:
- Pattern: `{camera_type}_{short_id}.mp4` (e.g. `slow_push_in_f743dd.mp4`)
- Fallback to `video_{i+1}` if `camera_type` is null

```ts
// Before
name: `video_${i + 1}`,

// After
name: v.camera_type
  ? `${v.camera_type}_${v.id.slice(0, 6)}`
  : `video_${i + 1}`,
```

### Files
- **Update**: `src/pages/VideoHub.tsx` — use `camera_type` + short ID for ZIP filenames

