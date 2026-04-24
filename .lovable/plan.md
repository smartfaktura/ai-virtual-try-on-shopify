

## Confirmed: zero zoom/crop risk in this plan

Your worry is valid — past zoom regressions were caused by passing `width=` (which triggers Supabase's server-side **cover crop**). This plan does **not** do that.

### Hard guarantee

Every edit uses **`quality` only**. Never `width`, never `height`, never `resize`.

```tsx
// ✅ Safe — re-encodes at lower bitrate, same pixels, same framing
getOptimizedUrl(url, { quality: 60 })

// ❌ Causes the zoom-in bug — NEVER used here
getOptimizedUrl(url, { width: 56 })
getOptimizedUrl(url, { width: 56, resize: 'cover' })
```

### Why it's mathematically impossible to zoom

`quality` is a JPEG/WebP re-encode parameter. It changes file size, not dimensions. The image keeps:
- Same width × height in pixels
- Same aspect ratio
- Same framing / composition

Visual fit on screen is still controlled by the same `object-cover` / `object-contain` CSS on the wrapper — exactly as it renders today.

### Parameter discipline (per-file)

| File | Thumb | Quality | width? | height? | resize? |
|---|---|---|---|---|---|
| MultiProductProgressBanner | 20px chip | 40 | ❌ | ❌ | ❌ |
| OutfitSlotCard | 36px locked thumb | 60 | ❌ | ❌ | ❌ |
| ProductImagesStep3Refine (4 imgs) | 48–96px | 60–70 | ❌ | ❌ | ❌ |
| ProductImages analyzing chip | 40px | 60 | ❌ | ❌ | ❌ |
| Generate (5 imgs) | 20–64px | 40–60 | ❌ | ❌ | ❌ |
| Freestyle recreate badges | 20px | 40 | ❌ | ❌ | ❌ |
| Perspectives ref tile | 80px | 70 | ❌ | ❌ | ❌ |

### Matches established safe pattern

Same discipline as the previous (now-deployed) modal pass and `ProductThumbnail.tsx`, `LibraryPickerModal`, `DiscoverDetailModal`, etc. — all quality-only, no crop reports.

### Rollback safety

If any single thumbnail looks off, the fix is a one-line revert on that `<img>` — remove the `getOptimizedUrl(...)` wrapper. No state, no props, no cascading effects.

### What stays full-resolution (untouched)

Lightboxes, full preview viewers, downloads, exports, generation inputs — not changed. Full-res still loads only when the user explicitly opens a large preview or downloads.

Approve and I'll apply the audit exactly as scoped — quality-only, everywhere.

