

# Add Multi-Select & Bulk Download to Video Hub

## Overview
Add a "Select" toggle button to the Recent Videos header. When active, cards show checkboxes, and a sticky bottom bar appears with a "Download X as ZIP" action.

## Changes

### 1. `src/pages/VideoHub.tsx`
- Add state: `selectMode`, `selectedIds` (Set)
- Add "Select" / "Done" button next to the "Recent Videos" heading
- Pass `selectMode` and selection handlers to `RecentVideoCard`
- In select mode: clicking a card toggles selection instead of opening the detail modal; show a checkbox overlay on each card
- Render a sticky bottom action bar when `selectedIds.size > 0` with count + "Download as ZIP" button
- Download handler: filter `history` by selected IDs, fetch each `.video_url`, zip using JSZip (reuse pattern from `dropDownload.ts` but for `.mp4` files), trigger download as `videos.zip`

### 2. `RecentVideoCard` (in same file)
- Accept new props: `selectMode`, `selected`, `onToggleSelect`
- In select mode: show a checkbox circle overlay (top-left), suppress hover-play behavior
- Click calls `onToggleSelect` instead of `onClick` when in select mode

### 3. `src/lib/dropDownload.ts`
- Add `downloadVideosAsZip(videos: {url: string; name: string}[], zipName: string, onProgress?)` utility
- Similar to `downloadDropAsZip` but defaults extension to `.mp4` for video content types

### Files
- **Update**: `src/pages/VideoHub.tsx`
- **Update**: `src/lib/dropDownload.ts`

