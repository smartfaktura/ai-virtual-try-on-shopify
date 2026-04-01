

# Add Multi-Select & Bulk Download to Video Hub

## Changes

### 1. `src/lib/dropDownload.ts` — add video ZIP utility

Add a `downloadVideosAsZip` function:
- Accepts `videos: {url: string; name: string}[]`, `zipName: string`, `onProgress?`
- Fetches each URL, detects extension from content-type (defaulting to `.mp4` for video types)
- Adds to JSZip flat (no subfolders), triggers download

Add video extension helper alongside existing `getExtensionFromContentType`:
```ts
function getVideoExtension(ct: string | null): string {
  if (!ct) return '.mp4';
  if (ct.includes('video/mp4')) return '.mp4';
  if (ct.includes('video/webm')) return '.webm';
  return '.mp4';
}
```

### 2. `src/pages/VideoHub.tsx` — multi-select mode + bulk download

**State additions:**
- `selectMode: boolean` — toggled by a "Select" / "Done" button
- `selectedIds: Set<string>` — tracks selected video IDs
- `isDownloading: boolean` — loading state for ZIP generation

**Header change:**
- Add a `Button` (ghost/outline) next to "Recent Videos" heading: shows "Select" when off, "Done" when on
- Exiting select mode clears `selectedIds`

**RecentVideoCard props update:**
- Add `selectMode`, `selected`, `onToggleSelect` props
- In select mode: click calls `onToggleSelect` instead of `onClick`; suppress hover-play
- Show a circular checkbox overlay (top-left corner) with check icon when selected, empty circle when not

**Sticky bottom bar:**
- Renders when `selectedIds.size > 0` — fixed to bottom, shows "{N} selected" + "Download as ZIP" button
- Download handler: filters `history` for selected IDs where `video_url` exists, signs URLs via `toSignedUrl()` (since `generated-videos` bucket is private), then calls `downloadVideosAsZip`

### Files
- **Update**: `src/lib/dropDownload.ts`
- **Update**: `src/pages/VideoHub.tsx`

