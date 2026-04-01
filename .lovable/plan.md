

# Fix Video Download UX — Loading State

## Problem
The download button fetches the entire video blob before triggering the download. For large 1080p videos this can take several seconds with no visual feedback, making it feel broken.

## Solution
Add a `downloading` state to the modal. When clicked, the button shows a spinner and "Preparing Download..." text, and is disabled to prevent double-clicks. On completion or error, it resets.

## Change: `src/components/app/video/VideoDetailModal.tsx`

1. Add `const [downloading, setDownloading] = useState(false);` next to the existing `deleting` state
2. Wrap `handleDownload` with `setDownloading(true)` at start, `setDownloading(false)` in finally block
3. Update the Download button:
   - Add `disabled={downloading}`
   - Show spinner icon + "Preparing Download..." when `downloading` is true
   - Show normal "Download Video" when idle

Single file, ~10 lines changed.

