

## Modal & overlay thumbnail audit — final pass

### Audit result
After previous passes, only **2 genuine remaining unoptimized small thumbnails** exist in modal/overlay/dropdown contexts. Everything else is already correct.

| File | Line | Element | Size | Container | Current |
|---|---|---|---|---|---|
| `src/components/app/video/short-film/ShotCard.tsx` | 211 | reference thumb in dropdown item | 16×16 px (`h-4 w-4`) | `<SelectContent>` (Radix overlay) | `<img src={ref.url}>` raw |
| `src/components/app/product-images/ProductImagesStep3Refine.tsx` | 2514 | model avatar in stacked preview | 24×24 px (`w-6 h-6`) | Refine step card (sub-modal-like) | `<img src={m.previewUrl}>` raw |

### Intentionally NOT touched

**Local blob URLs** — `getOptimizedUrl` no-ops on these, but they are pre-upload previews so wrapping adds zero value:
- `ManualProductTab.tsx` lines 688, 1059, 1072 — local `previewUrl` from FileReader
- `StoreImportTab.tsx` line 592 — local upload preview
- `UploadSourceCard.tsx` line 116 — `scratchUpload.previewUrl` (local blob)

**Already optimized** (verified): `AddModelModal`, `AddSceneModal`, `GenerateModelModal`, `TryOnConfirmModal`, `StartWorkflowModal`, `AddToDiscoverModal`, `FreestylePromptPanel`, `CatalogPoseCard`, `CatalogStepProps`, `ModelCatalogModal`, `SceneCatalogModal`, `ProductCatalogModal`, `LibraryPickerModal`, `DiscoverDetailModal` chips, `PublicDiscoverDetailModal` chips, `CreativeDropWizard`, `ShopifyImportTab`, `ReferenceUploadPanel`, all of `ProductImages.tsx`.

**Full-resolution by design** (do not touch): `DiscoverDetailModal` hero, `LibraryDetailModal` hero, `PublicDiscoverDetailModal` hero, `VideoDetailModal` poster, image lightboxes.

### Fix (only 2 lines)

**1. `src/components/app/video/short-film/ShotCard.tsx`** (line 211)
- Add `getOptimizedUrl` import
- Wrap: `src={getOptimizedUrl(ref.url, { quality: 50 })}`
- Add `loading="lazy"`

**2. `src/components/app/product-images/ProductImagesStep3Refine.tsx`** (line 2514)
- Confirm `getOptimizedUrl` import already present (file uses it elsewhere)
- Wrap: `src={getOptimizedUrl(m.previewUrl, { quality: 50 })}`
- Add `loading="lazy"`

### Hard safety guarantee — no zoom regression
Per `mem://style/image-optimization-no-crop`:
- ✅ **Quality only** — `{ quality: 50 }` (these are 16–24 px so quality 50 is plenty)
- ❌ **Never** `width`, `height`, or `resize`
- ✅ All CSS (`object-cover`, sizing, rounding) untouched
- ✅ All wrappers, selection, and dropdown logic untouched
- ✅ `getOptimizedUrl` safely no-ops on non-Supabase URLs

### Expected result
- Two more tiny thumbnails stop loading full-resolution originals
- Visual framing identical (no zoom/crop risk)
- Network: requests gain `?quality=50`, no `width=`/`height=`/`resize=`
- Dropdown/select behavior, model selection, and short-film flow unaffected

### QA
1. Open Short Film → a shot card → "Scene Reference" dropdown → tiny thumbs render identically, network shows `?quality=50`
2. Open Product Visuals → Step 3 (Refine) → "Choose model" stacked avatars render identically, network shows `?quality=50`
3. Confirm no zoom/crop shift anywhere
4. Confirm full lightboxes / large previews still load originals

