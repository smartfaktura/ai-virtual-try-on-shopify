

# Connect "Generate Video" Button to Animate Video Page

## What Changes

### 1. AnimateVideo page: Accept image URL via query param (`src/pages/video/AnimateVideo.tsx`)
- Add `useSearchParams` to read `?imageUrl=` param on mount
- When param is present, call the existing `handleLibrarySelect` function with that URL (which already sets preview, triggers analysis, etc.)
- Clear the param from URL after consuming it to keep URL clean

### 2. LibraryDetailModal: Enable the "Generate Video" button (`src/components/app/LibraryDetailModal.tsx`)
- Remove `disabled` from the Generate Video button
- Remove the "Coming Soon" badge
- Add `onClick` handler: `navigate(/app/video/animate?imageUrl=${encodeURIComponent(activeItem.imageUrl)})` then `onClose()`
- Same pattern already used by "Edit Image" button

### 3. ImageLightbox: Wire up the "Generate Video" button if present
- Check if the lightbox in `JobDetailModal` or `FreestyleGallery` also has a generate video path — but based on screenshots, the button is only in `LibraryDetailModal`, so this is the only file needing the onClick change.

## Technical Detail

The `handleLibrarySelect` in AnimateVideo already handles setting the image preview, triggering AI analysis, and populating all settings — so we just need to call it with the URL from the query param. A `useEffect` watching the search param will trigger this on mount.

