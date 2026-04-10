

# Fix: Library "Download ZIP" Only Contains 1 File

## Root Cause
In `src/pages/Jobs.tsx`, line 180, each file in the zip is named:
```
${safeLabel}-${item.id.slice(0, 8)}.png
```

`item.id` is formatted as `${jobId}-${imageIndex}`. When multiple selected images come from the same generation job, `item.id.slice(0, 8)` produces the same 8-character prefix for all of them. Combined with an identical `safeLabel`, all files get the exact same filename in the zip — each one overwrites the previous, leaving only the last image.

## Fix

Use the full `item.id` (which includes the image index suffix) instead of slicing to 8 characters. Also add proper error handling per-item and check `res.ok`:

```typescript
const handleBulkDownload = async () => {
  setIsZipping(true);
  try {
    const zip = new JSZip();
    const selected = items.filter(i => selectedIds.has(i.id));
    for (const item of selected) {
      try {
        const res = await fetch(item.imageUrl);
        if (!res.ok) continue;
        const blob = await res.blob();
        const safeLabel = item.label.replace(/[^a-zA-Z0-9 _-]/g, '').replace(/\s+/g, '_');
        const safeId = item.id.replace(/[^a-zA-Z0-9_-]/g, '_');
        zip.file(`${safeLabel}_${safeId}.png`, blob);
      } catch {
        // skip failed downloads
      }
    }
    const content = await zip.generateAsync({ type: 'blob' });
    // ... trigger download
  } finally {
    setIsZipping(false);
  }
};
```

## File Changed
| File | Change |
|------|--------|
| `src/pages/Jobs.tsx` | Fix zip filename uniqueness by using full `item.id`, add per-item error handling |

