

# Add Clipboard Paste (Cmd+V) for Reference Image Upload

## What
Allow users to paste an image from their clipboard (Cmd+V / Ctrl+V) into the reference image upload area on the Brand Models page, in addition to the existing click-to-upload.

## Changes

### `src/pages/BrandModels.tsx`

1. **Add a `processFile` helper** — extract the shared logic from `handleFile` (preview via FileReader + upload) into a reusable function that accepts a `File`.

2. **Add a `handlePaste` function** — reads `clipboardData.items`, finds the first image item, converts to File, calls `processFile`.

3. **Attach a `onPaste` event listener** to the upload area container (the `div` wrapping the reference image section) so paste works when that area is focused/visible. Also add a global `useEffect` paste listener when `useReference` is true and no image is uploaded yet, so Cmd+V works anywhere on the page.

4. **Update the upload button text** — change "Click to upload reference photo" to "Click or paste (⌘V) reference photo" to hint at the feature.

5. **Refactor `handleFile`** to call `processFile(file)` internally.

### No other files changed.

