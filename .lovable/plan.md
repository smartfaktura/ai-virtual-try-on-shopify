

# Fix ZIP File Names to Match Single Download Names

## Problem
The bulk ZIP download uses a simplified naming scheme (`${safeLabel}_${safeId}`) while single downloads use `buildLibraryFileName(item)` which includes product name, scene name, model name, and short ID — producing much more descriptive filenames.

## Solution
Update `handleBulkDownload` in `src/pages/Jobs.tsx` to use `buildLibraryFileName(item)` (from `src/lib/downloadFileName.ts`) instead of the current `safeLabel + safeId` pattern. This ensures ZIP contents have the same names as individual downloads.

### Change
**`src/pages/Jobs.tsx`** (lines 231-233):
- Import `buildLibraryFileName` from `@/lib/downloadFileName`
- Replace the current naming logic:
  ```typescript
  // Before
  const safeLabel = item.label.replace(/[^a-zA-Z0-9 _-]/g, '').replace(/\s+/g, '_');
  const safeId = item.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 8);
  zip.file(`${safeLabel}_${safeId}${ext}`, blob);

  // After
  zip.file(`${buildLibraryFileName(item)}${ext}`, blob);
  ```

Single file change, consistent naming everywhere.

