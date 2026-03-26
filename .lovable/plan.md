

# Video Hub — Add Detail Modal for Recent Videos

## Problem
The Recent Videos grid on `/app/video` currently has inline play/pause behavior with a large pause button in the center. There's no way to download, delete, or preview videos in a modal. The user wants the same modal experience as the Library.

## Approach
Create a `VideoDetailModal` that opens when clicking a video card, with download, delete, play/preview, and other actions — similar to `LibraryDetailModal` but for video items.

### File 1: `src/components/app/video/VideoDetailModal.tsx` (NEW)
- Full-screen overlay modal (same pattern as `LibraryDetailModal`)
- Video player with controls inside the modal
- Actions: **Download**, **Delete**, close button
- Show metadata: date, prompt, status
- Delete logic: remove from `video_generations` table, invalidate queries
- Download logic: fetch video URL, trigger download as `.mp4`

### File 2: `src/pages/VideoHub.tsx` — Refactor `RecentVideoCard`
- **Remove** the inline play/pause/loading state machine (the big center pause button)
- Click on card → open `VideoDetailModal` instead of toggling playback
- Keep hover-to-play on desktop for preview (but remove the pause overlay with big button)
- Keep the small play icon in bottom-left corner when idle
- Add `selectedVideo` state to the hub page, pass to the modal
- On mobile: single tap opens modal directly (no two-tap flow)

### Visual Behavior After Fix
- **Desktop hover**: video auto-plays quietly (no overlay buttons)
- **Click (any device)**: opens the detail modal with full video player + actions
- **Modal**: video with native controls, Download button, Delete button, close (X)

### Technical Details
- Modal uses same overlay/z-index pattern as `LibraryDetailModal` (z-[200])
- Delete calls `supabase.from('video_generations').delete().eq('id', video.id)` and invalidates `['video-history']`
- Download uses `<a>` element with `download` attribute pointing to `video_url`
- Escape key closes modal, body scroll locked while open

