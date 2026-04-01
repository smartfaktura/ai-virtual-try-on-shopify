

# Fix Batch Mode: Multi-Select for Library + Upload

## Problem
In batch mode, the "Choose from Library" button opens a single-select picker (closes after one pick), and the upload flow only processes one image at a time despite `multiple` being set. Users can't effectively build a batch.

## Changes

### 1. `LibraryPickerModal.tsx` — Add multi-select mode
- Add `multiSelect?: boolean` and `onMultiSelect?: (urls: string[]) => void` props
- When `multiSelect` is true, clicking an image toggles selection (checkmark overlay) instead of immediately closing
- Add a "Done (N selected)" footer button that calls `onMultiSelect` with all selected URLs
- Show selected count badge

### 2. `AnimateVideo.tsx` — Wire batch mode to multi-select library
- When `bulkMode` is true, open `LibraryPickerModal` with `multiSelect={true}`
- On multi-select callback, convert each selected URL into a `BulkImage` entry (no re-upload needed since they're already stored)
- Trigger analysis on the first image in the batch
- Ensure the file input `multiple` attribute works correctly — the handler already calls `handleBulkAddFiles` which processes multiple files sequentially

### 3. `BulkImageGrid.tsx` — Add "Choose from Library" button
- Add an optional `onPickFromLibrary` callback prop
- Show a small "Library" button next to the "Add" tile so users can add more images from library while in the grid view

## Files
- **Update**: `src/components/app/video/LibraryPickerModal.tsx`
- **Update**: `src/pages/video/AnimateVideo.tsx`
- **Update**: `src/components/app/video/BulkImageGrid.tsx`

