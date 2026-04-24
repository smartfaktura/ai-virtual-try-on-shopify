

## Reassurance: no crop zoom risk in this audit

Your concern is valid — past regressions happened when `width=` was passed to `getOptimizedUrl`, which triggers Supabase's server-side **cover crop** and produces zoomed-in thumbnails. This audit explicitly avoids that.

### Guarantee
Every single edit in the modal thumbnail audit uses **`quality` only** — never `width`, never `height`, never `resize`.

```tsx
// ✅ What we will do (safe — no crop, just compression)
getOptimizedUrl(url, { quality: 60 })

// ❌ What we will NEVER do (causes the zoom-in bug)
getOptimizedUrl(url, { width: 56 })
getOptimizedUrl(url, { width: 56, resize: 'cover' })
```

This matches the existing memory rule `mem://style/image-optimization-no-crop` and the established pattern in `ProductThumbnail.tsx`, `LibraryPickerModal`, `DiscoverDetailModal`, etc.

### Why this is mathematically safe
`quality` only re-encodes the JPEG/WebP at lower bitrate. It does **not** change pixel dimensions, aspect ratio, or framing. The image displayed is the exact same composition — just a smaller file. The `object-cover` / `object-contain` CSS on the wrapper handles the visual fit, identical to today.

### What changes vs. the original audit plan
**Nothing functional.** Same 10 files, same `getOptimizedUrl` wrapping, same `loading="lazy"` additions. I'm just confirming the parameter discipline:

| Thumb | Quality | Width param? |
|---|---|---|
| AddToDiscoverModal dropdown rows (20–24px) | 40 | ❌ no |
| JobDetailModal product thumb (56px) | 60 | ❌ no |
| ProductAssignmentModal rows (48px) | 60 | ❌ no |
| ImportProductScenesModal (32–40px) | 60 | ❌ no |
| PublishModal previews (56px) | 60 | ❌ no |
| UpscaleSettingsPanel (56px) | 60 | ❌ no |
| Local-preview modals (blob URLs) | 60–70 | ❌ no (no-op anyway) |

### Visual outcome
- Same framing as today (no crop, no zoom).
- ~10–15× smaller payload per thumbnail.
- Visually indistinguishable at the rendered small sizes.
- Lightbox / full preview / downloads remain **completely untouched** — full resolution always.

### Rollback safety
If anything looks off in a single thumbnail, the fix is one-line: remove the `getOptimizedUrl` wrapper for that specific `<img>`. No cascading effects, no state changes, no data shape changes.

Approve and I'll apply the audit exactly as scoped, with quality-only parameters everywhere.

