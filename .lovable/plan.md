

## Fix Corrupted Image Downloads in Workflow Preview

### Root Cause

Two issues are causing corrupted downloads:

1. **No response validation**: Neither `downloadSingleImage` nor `downloadDropAsZip` check `response.ok` before reading the body. If the fetch returns an error (e.g., 403 from an expired signed URL, or a CORS error), the error HTML/JSON gets saved as the "image" file, producing a corrupted file that macOS Preview cannot open.

2. **Wrong file extension**: The extension is parsed from the URL using `url.split('.').pop()`, but signed URLs often have long query strings and may not have a clean file extension in the path (e.g., UUIDs without extensions). This can result in wrong or missing extensions, making the OS unable to recognize the file type.

### Fix in `src/lib/dropDownload.ts`

**Changes:**

| Change | Detail |
|--------|--------|
| Add `response.ok` check | Throw an error if the HTTP response is not 2xx, preventing error pages from being saved as images |
| Detect content type from headers | Use `response.headers.get('content-type')` to determine the correct file extension (`image/png` -> `.png`, `image/jpeg` -> `.jpg`, `image/webp` -> `.webp`) instead of parsing the URL |
| Fallback extension | Default to `.jpg` if content-type is missing or unrecognized |
| Fix single image download | Same response validation and proper extension handling for `downloadSingleImage` |

**Content-type to extension map:**
```text
image/png   -> .png
image/jpeg  -> .jpg
image/webp  -> .webp
image/gif   -> .gif
default     -> .jpg
```

**Updated logic (pseudocode):**
```text
downloadSingleImage:
  1. fetch(url)
  2. if (!response.ok) throw Error
  3. get content-type header -> determine extension
  4. ensure fileName uses correct extension
  5. blob -> createObjectURL -> download

downloadDropAsZip:
  1. for each image: fetch(url)
  2. if (!response.ok) skip with warning
  3. get content-type -> determine extension
  4. arrayBuffer -> zip.file with correct extension
```

### File to Modify

| File | Change |
|------|--------|
| `src/lib/dropDownload.ts` | Add response validation, content-type based extension detection, proper error handling |

