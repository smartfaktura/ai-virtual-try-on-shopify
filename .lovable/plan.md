## Problem

After uploading a file in the Short Film references step, the browser auto-scrolls down past the content, revealing blank space (the `pb-28` sticky bar padding). The user sees empty white space instead of their uploaded file preview.

## Solution

Add a `useRef` on the `ReferenceUploadPanel` root element and scroll it back into view after each file upload completes, so the user always sees their newly added reference instead of blank padding.

## Technical Details

**File: `src/components/app/video/short-film/ReferenceUploadPanel.tsx`**

1. Add a `useRef` to the component's root `<div>` 
2. After `handleFileUpload` completes (line ~276, after `onChange` and clearing upload state), call `rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })` to gently bring the panel back into view without jarring jumps
3. Apply the same scroll-back after product picker selection and model picker selection callbacks that add references
