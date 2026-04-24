

## Modal thumbnail audit — remaining unoptimized small images

### Audit result
After the previous pass, almost all modals are correctly using `getOptimizedUrl(..., { quality: N })`. Two genuine remaining cases were found, both small grid thumbnails in the Catalog Studio wizard:

| File | Line | Element | Grid context | Current |
|---|---|---|---|---|
| `src/components/app/catalog/CatalogPoseCard.tsx` | 58 | pose/background grid card | 4–8 col grid in Catalog steps | `<img src={previewUrl}>` (raw) |
| `src/components/app/catalog/CatalogStepProps.tsx` | 135 | product chip in props selector | grid in Catalog props modal | `<ShimmerImage src={p.image_url}>` (raw) |

Everything else (`SubmitToDiscoverModal`, `LibraryPickerModal`, `DiscoverDetailModal` chips, `CatalogStepReviewV2`, `CreativeDropWizard`, `PublicDiscoverDetailModal` related items, etc.) is already optimized.

### Intentionally NOT touched (full-resolution by design)
These are large hero/lightbox images where the user explicitly opens a full preview — must stay original:
- `DiscoverDetailModal.tsx` line 205 — hero
- `LibraryDetailModal.tsx` line 207 — hero
- `PublicDiscoverDetailModal.tsx` line 78 — hero
- `VideoDetailModal.tsx` line 195 — large video poster
- `UpgradeValueDrawer.tsx` line 94 — `AvatarImage` (already small)
- `DemoProductPicker.tsx` line 47 — local bundled asset, `getOptimizedUrl` would be a no-op

### Fix (only 2 lines)

**1. `src/components/app/catalog/CatalogPoseCard.tsx`** (line ~58)
- Add `getOptimizedUrl` import
- Wrap: `src={getOptimizedUrl(previewUrl, { quality: 60 })}`
- `loading="lazy"` already present ✅

**2. `src/components/app/catalog/CatalogStepProps.tsx`** (line ~135)
- Add `getOptimizedUrl` import
- Wrap: `src={getOptimizedUrl(p.image_url, { quality: 60 })}`

### Hard safety guarantee — same as previous pass
Per `mem://style/image-optimization-no-crop`:
- ✅ **Quality only** — `{ quality: 60 }`
- ❌ **Never** `width`, `height`, or `resize` (these trigger Supabase server-side crop/zoom)
- ✅ All CSS (`object-cover`, `object-contain`, sizing) untouched
- ✅ All wrappers, aspect ratios, selection logic untouched
- ✅ `getOptimizedUrl` safely no-ops on non-Supabase URLs (data URIs, blob URLs, local assets)

### Lazy-loading
- `CatalogPoseCard` already has `loading="lazy"` ✅
- `ShimmerImage` in `CatalogStepProps` — `ShimmerImage` already lazy-loads internally; no change needed

### Expected result
- Two more modal/wizard grids stop loading full-resolution originals
- Visual framing identical (no zoom/crop risk)
- Network: requests gain `?quality=60`, no `width=`/`height=`/`resize=`
- Selection, generation, and lightbox flows unaffected

### QA
1. Open Catalog Studio → Backgrounds step → grid thumbnails look identical, network shows `?quality=60`
2. Open Catalog Studio → Props step → product chips look identical, network shows `?quality=60`
3. Confirm no zoom/crop shift on any thumbnail
4. Confirm full lightbox previews (Discover, Library, Public Discover) still load originals

