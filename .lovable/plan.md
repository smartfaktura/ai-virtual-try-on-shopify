

# Audit Results: Remaining Unoptimized Images

After a thorough final audit of every `getLandingAssetUrl`, `image_url`, `avatar`, and `previewUrl` usage, here's what I found:

## Already Optimized ✓
- **FreestyleGallery.tsx** — avatars already wrapped with `getOptimizedUrl` at render level (lines 127, 181, 264, 306)
- **WorkflowCardCompact.tsx** — `imgFallback` already optimized at render (line 55)
- **ProductUploadTips.tsx** — already optimized at data level with `quality: 50` (line 8)
- **DashboardTipCard.tsx** — already optimized at data level with `quality: 50` (line 8)
- **All video posters** — already optimized in previous batch
- **All team avatars in app components** — already optimized

## Still Unoptimized — 5 Remaining Locations

### 1. `src/pages/Auth.tsx` (line 16, rendered line 592)
- `authHero` — large hero background image, raw `getLandingAssetUrl('auth/auth-hero.jpg')`
- Full-bleed background but still benefits from quality compression

### 2. `src/pages/Onboarding.tsx` (line ~304)
- Same `authHero` image used as background — also unoptimized

### 3. `src/components/app/GenerateModelModal.tsx` (line 104)
- `result.image_url` — 80px model creation result thumbnail, raw Supabase URL

### 4. `src/components/app/StoreImportTab.tsx` (line 296)
- `extracted.image_url` — 80px imported product preview thumbnail, external URL (may not be Supabase — `getOptimizedUrl` will safely pass through non-Supabase URLs)

### 5. `src/components/landing/ProductCategoryShowcase.tsx` (line 67)
- Helper `s()` uses raw `getLandingAssetUrl` without optimization at data level — render level already wraps with `getOptimizedUrl`, so this causes double-processing. Should optimize at data level and remove render-level wrap for cleanliness. **Low priority / cosmetic.**

## Intentionally Skipped
- `UploadSourceCard.tsx` — blob URL, not Supabase
- `ManualProductTab.tsx` — user-uploaded blob preview URLs
- `Generate.tsx` line 3721 — `scratchUpload.previewUrl` is a blob URL

---

## Changes

| # | File | Location | Fix |
|---|---|---|---|
| 1 | `Auth.tsx` | line 16 | Wrap `authHero` with `getOptimizedUrl` |
| 2 | `Onboarding.tsx` | import | Import optimized `authHero` or wrap locally |
| 3 | `GenerateModelModal.tsx` | line 104 | Wrap `result.image_url` |
| 4 | `StoreImportTab.tsx` | line 296 | Wrap extracted image URL |
| 5 | `ProductCategoryShowcase.tsx` | line 67 | Optimize at data level, remove render-level double-wrap |

Pattern: `getOptimizedUrl(url, { quality: 60 })`

