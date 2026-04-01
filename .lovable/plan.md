

# Duplicate Videos in Recent Grid — Analysis & Fix

## Finding
There is **no dedup bug**. The database contains no duplicate `kling_task_id` entries. Each "duplicate-looking" pair is a legitimately separate video generation from the same source image with different camera motions — they just look identical because the grid shows the source image as thumbnail, not the actual video frame.

## The Real Problem
When a user generates multiple camera motions from the same image (the new multi-motion feature), the Recent Videos grid shows identical-looking thumbnails with no way to tell them apart.

## Proposed Fix

### 1. Add camera motion label overlay to `RecentVideoCard` (`VideoHub.tsx`)
- Query the `camera_type` column from `generated_videos` (already exists in the table)
- Display a small label/badge on the thumbnail showing the camera motion name (e.g., "Orbit", "Dolly In") so identical source images are visually distinguishable
- Only show the badge when multiple videos share the same source image

### 2. No data deletion needed
All records are unique and valid — different kling task IDs, different video outputs. Deleting them would remove real user content.

## Alternative: Group same-source videos
Instead of badges, group videos from the same source image into a single card with a count indicator (e.g., "2 versions") that expands to show both. This is a larger change but gives cleaner UX.

## Files
- **Update**: `src/pages/VideoHub.tsx` — add motion label badge to `RecentVideoCard`
- **Update**: `src/hooks/useGenerateVideo.ts` — include `camera_type` in the `GeneratedVideo` interface and select query

