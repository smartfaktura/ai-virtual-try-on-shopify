

## Fix: Downloaded images missing previews due to wrong file extension

### Root cause
The download handlers in **Freestyle** and **LibraryDetailModal** hardcode `.png` as the file extension:

```typescript
// Freestyle.tsx line 552
a.download = `freestyle-${index + 1}.png`;

// LibraryDetailModal.tsx line 68  
a.download = `...${item.id.slice(0, 8)}.png`;
```

The actual generated images are typically **WebP** (returned by the AI generation APIs). When a WebP file is saved with a `.png` extension, macOS Finder can't generate a thumbnail preview — it shows the generic icon instead.

The existing `dropDownload.ts` already solves this correctly by reading the `content-type` header and choosing the right extension. The other download handlers just need to do the same.

### Fix

**File 1: `src/pages/Freestyle.tsx`** — Update `handleDownload` to detect content type from the fetch response and use the correct extension.

**File 2: `src/components/app/LibraryDetailModal.tsx`** — Same fix for `handleDownload`.

**File 3: `src/components/app/ImageLightbox.tsx`** — Check if it also has a download handler that hardcodes `.png`.

The logic is simple — after `fetch`, read `response.headers.get('content-type')` and map it to the correct extension (`.webp`, `.jpg`, `.png`), same as `getExtensionFromContentType` in `dropDownload.ts`. We can import and reuse that function by exporting it.

### Changes summary
1. Export `getExtensionFromContentType` from `src/lib/dropDownload.ts`
2. Update `Freestyle.tsx` `handleDownload` to use detected extension
3. Update `LibraryDetailModal.tsx` `handleDownload` to use detected extension
4. Check and fix any other download handlers (ImageLightbox, etc.)

