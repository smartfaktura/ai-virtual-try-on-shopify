

## Change All Image Downloads to .png

### Problem
All download functions hardcode `.jpg` as the filename extension, regardless of actual image format. The user wants `.png` downloads for better quality.

### Changes

**1. `src/pages/Generate.tsx`** — `handleDownloadImage` (line 858)
- Change `generated-image-${index + 1}.jpg` → `generated-image-${index + 1}.png`

**2. `src/components/app/WorkflowPreviewModal.tsx`** — lines 101, 114
- Change `.jpg` suffix to `.png` in both `downloadSingleImage` calls

**3. `src/components/app/DropDetailModal.tsx`** — lines 191, 222
- Change `image_${idx + 1}.jpg` → `image_${idx + 1}.png` in both `downloadSingleImage` calls

**4. `src/lib/dropDownload.ts`** — `getExtensionFromContentType` (line 11)
- Change the fallback default from `.jpg` to `.png` (lines 11 and 17)

**Note:** `downloadSingleImage` already detects the actual content-type and replaces the extension, so the filename passed in is just a hint — but changing the default and all hardcoded `.jpg` references ensures consistency and correct `.png` downloads throughout.

### Files changed — 4 files
- `src/pages/Generate.tsx`
- `src/components/app/WorkflowPreviewModal.tsx`
- `src/components/app/DropDetailModal.tsx`
- `src/lib/dropDownload.ts`

