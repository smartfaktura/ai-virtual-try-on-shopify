

# Fix: Outfit + Scene Reference Compatibility & Paste-to-Preview

## Current State

**Outfit hint + scene reference**: Both already work correctly together. The prompt builder injects `OUTFIT DIRECTION` (line 1283) **before** `SCENE REFERENCE` (line 1298), so clothing details are always included regardless of whether scene reference is active. No code change needed here — it's already set up correctly.

**Paste to preview image**: Currently the preview image field only supports file upload via button or manually typing/pasting a URL into the text input. There's no clipboard image paste (Ctrl+V / Cmd+V) support.

## Plan

### 1. Add clipboard image paste to the Preview Image area
In `src/pages/AdminProductImageScenes.tsx`, add an `onPaste` handler on the preview image container that:
- Intercepts paste events containing image data from clipboard
- Extracts the image blob from `clipboardData`
- Reuses the existing `handleImageUpload` function to upload it
- Shows a visual "paste zone" hint on the preview thumbnail

This lets you screenshot → Cmd+V directly into the preview area instead of saving the file first.

### Files to update
1. `src/pages/AdminProductImageScenes.tsx` — add `onPaste` handler to the preview image section

That's it — one small change. The outfit + scene reference prompt chain is already working correctly as-is.

