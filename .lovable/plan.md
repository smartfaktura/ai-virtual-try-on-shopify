

## Fix: Two more download handlers still hardcoding `.png`

The image you showed was likely downloaded before the previous fix was deployed, but I also found **two more download handlers** that still hardcode `.png`:

### 1. `src/components/app/LibraryImageCard.tsx` (line 143)
The quick-download button on library cards passes a hardcoded `.png` filename:
```typescript
downloadImage(item.imageUrl, `${item.label}-${item.id.slice(0, 8)}.png`);
```
The `downloadImage` helper (line 42) fetches the blob but never checks content-type for the extension.

### 2. `src/pages/Generate.tsx` (line 1417)
The `buildFileName` function hardcodes `.png`:
```typescript
return parts.join('-') + '.png';
```
And `handleDownloadImage` (line 1420) fetches the blob without checking content-type.

### Fix
1. **`LibraryImageCard.tsx`** — Update `downloadImage` to read `content-type` from the fetch response, use `getExtensionFromContentType` to determine the correct extension, and strip any existing extension from the passed filename before appending the detected one.

2. **`Generate.tsx`** — Update `handleDownloadImage` to read `content-type` from the fetch response, use `getExtensionFromContentType`, and replace the hardcoded `.png` in `buildFileName` or override it at download time.

Both will import `getExtensionFromContentType` from `@/lib/dropDownload`.

### Files to modify
- `src/components/app/LibraryImageCard.tsx`
- `src/pages/Generate.tsx`

