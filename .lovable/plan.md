

## Fix: ZIP Download Creates Random Folders

### Root Cause
Variation labels `"Close-up / Macro"` and `"Wide / Environment"` contain `/` characters. When used in ZIP filenames (e.g., `"Picture Perspectives — Close-up / Macro-abc123.png"`), JSZip interprets the `/` as a directory separator, creating unwanted nested folders like `Close-up` → `Macro-abc123.png`.

### Solution
Sanitize filenames in both ZIP download paths to replace `/` with `–` (en-dash).

### Changes

| File | Change |
|------|--------|
| `src/pages/Jobs.tsx` | In `handleBulkDownload` (~line 158), sanitize `item.label` by replacing `/` before passing to `zip.file()` |
| `src/lib/dropDownload.ts` | In `downloadDropAsZip`, sanitize `folder` and `fileName` values to strip `/` characters |

**Jobs.tsx** (line 158):
```typescript
// Before:
zip.file(`${item.label}-${item.id.slice(0, 8)}.png`, blob);
// After:
const safeLabel = item.label.replace(/\//g, '–');
zip.file(`${safeLabel}-${item.id.slice(0, 8)}.png`, blob);
```

**dropDownload.ts** (lines 36-40):
```typescript
// Sanitize folder and fileName to prevent unintended subdirectories
const folder = (img.workflow_name || 'General').replace(/\//g, '–');
const fileName = img.scene_name
  ? `${img.scene_name.replace(/\//g, '–')}_${i + 1}${ext}`
  : `image_${i + 1}${ext}`;
```

