

## Add Clipboard Paste Support to UploadSourceCard

The `UploadSourceCard` component (used in workflow generation for uploading clothing photos) currently supports drag-and-drop and file picker, but not clipboard paste. The Freestyle prompt panel and ManualProductTab already have paste support — we'll follow the same pattern.

### Changes

**`src/components/app/UploadSourceCard.tsx`**

1. **Add paste listener** — `useEffect` that listens to the global `paste` event. When clipboard contains an image, convert the `DataTransferItem` to a `File` and call the existing `handleFile()`. Only active when `scratchUpload` is null (no image uploaded yet).

2. **Update upload zone text** — Change "Drag & drop or tap to upload" to "Drag & drop, paste, or tap to upload". Add a keyboard hint below: `⌘V / Ctrl+V to paste from clipboard` in muted text, matching the style used in Freestyle.

3. **Import `Clipboard` icon** from lucide-react to optionally show a small clipboard icon next to the hint text for visual affordance.

| Area | Detail |
|---|---|
| File | `src/components/app/UploadSourceCard.tsx` |
| Paste listener | `useEffect` with `document.addEventListener('paste', ...)`, cleanup on unmount. Guarded by `!scratchUpload` |
| Hint text | Small muted line: `⌘V / Ctrl+V to paste` below the file format line |
| Pattern reference | `FreestylePromptPanel.tsx` lines 103-118 |

