

## Fix Corrupted Images in ZIP Download

### Problem
When downloading all images as a ZIP from the workflow preview modal, the images inside the ZIP are corrupted and cannot be opened. This is because the current code passes `blob` objects to JSZip, which can cause data integrity issues with binary image data.

### Root Cause
In `src/lib/dropDownload.ts`, the `downloadDropAsZip` function uses `response.blob()` to get image data and passes it directly to `zip.file()`. JSZip handles `ArrayBuffer` (raw binary) more reliably than `Blob` for binary files like images.

### Fix

**File: `src/lib/dropDownload.ts`**

Change the fetch handling from `blob()` to `arrayBuffer()`:

```text
Before: const blob = await response.blob();
        zip.file(`${folder}/${fileName}`, blob);

After:  const arrayBuffer = await response.arrayBuffer();
        zip.file(`${folder}/${fileName}`, arrayBuffer, { binary: true });
```

This single change ensures JSZip receives raw binary data with the `binary: true` flag, which prevents any encoding/conversion issues that corrupt image files.

### Files to Modify

| File | Change |
|------|--------|
| `src/lib/dropDownload.ts` | Replace `blob` with `arrayBuffer` + `{ binary: true }` in the zip file addition |

