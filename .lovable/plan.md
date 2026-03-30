

## Fix Video Download Opening New Tab

**Problem**: In `VideoResultsPanel.tsx`, the "Download Video" button opens a new Chrome tab instead of downloading. Two issues:
1. `a.target = '_blank'` forces a new tab
2. The `download` attribute is ignored by browsers for cross-origin URLs — the video URL is hosted on an external CDN

The `VideoDetailModal.tsx` already has the correct pattern (fetch → blob → objectURL → click), so we just need to apply the same approach to `VideoResultsPanel`.

---

### Changes

**File: `src/components/app/video/VideoResultsPanel.tsx`** (lines 77-84)

Replace the current `handleDownload` with a fetch-based approach:

```ts
const handleDownload = async () => {
  if (!videoUrl) return;
  try {
    const res = await fetch(videoUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video-${Date.now()}.mp4`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    toast.error('Failed to download video');
  }
};
```

Remove `a.target = '_blank'`. Add a toast import if not already present.

This matches the working pattern in `VideoDetailModal.tsx`.

