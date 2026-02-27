

## Two Changes for Interior / Exterior Staging

### 1. Hide Aspect Ratio Selector

The generated image should match the uploaded photo's aspect ratio, so letting users pick a different format makes no sense for this workflow.

**File: `src/pages/Generate.tsx` (~line 2230-2244)**
- Wrap the Aspect Ratio section in a condition: when `isInteriorDesign`, show a locked badge saying "Matches uploaded photo" instead of the `AspectRatioSelector`.
- This sits in the shared "Generation Settings" card alongside Quality, so only the aspect ratio portion is hidden/replaced.

### 2. Show Previously Uploaded Room Photos

Instead of always forcing a fresh upload, show the user's previously uploaded images from storage so they can reuse them.

**Approach**: List files from the `product-uploads` storage bucket for the current user's folder. Display them as clickable thumbnails above the upload dropzone in the Upload step -- only when `isInteriorDesign` is true.

**File: `src/pages/Generate.tsx`**
- Add a query using `supabase.storage.from('product-uploads').list(user.id)` to fetch the user's previously uploaded files.
- In the Upload step (line ~980-1038), when `isInteriorDesign` and there are previous uploads, render a "Your Recent Uploads" section with thumbnail grid before the `UploadSourceCard`.
- Clicking a thumbnail populates `scratchUpload` with that image (creating a minimal `ScratchUpload` object with the signed URL and empty productInfo for the user to fill in).
- The user can still upload a new photo using the existing dropzone below.

**File: `src/hooks/useFileUpload.ts`** -- No changes needed; the upload path already uses `user.id/timestamp-randomId.ext`, so listing `user.id/` folder returns all their uploads.

### Technical Details

```text
Storage listing:
  supabase.storage.from('product-uploads').list(user.id, {
    limit: 20,
    sortBy: { column: 'created_at', order: 'desc' }
  })

For each file, generate public URL:
  supabase.storage.from('product-uploads').getPublicUrl(`${user.id}/${file.name}`)

When user clicks a previous upload:
  - Set scratchUpload with previewUrl = publicUrl, empty productInfo
  - User fills in Room Name, Space Type, Description manually
  - No File object needed since already uploaded; set uploadedUrl directly
```

The ScratchUpload type requires a `file: File` property. Since reused images are already uploaded, we'll need to handle the "Continue" button logic to skip re-uploading when `uploadedUrl` is already set. A small conditional in the Continue handler (line ~1018-1037) will check if `scratchUpload.uploadedUrl` already exists and skip the `uploadFile()` call.
