# Replace old spinners with the brand loader

## What you're seeing in the screenshots

The grey-ring spinner in `IMG_6924.png` / `IMG_6925.png` is the **boot HTML fallback** baked into `index.html` (lines 86–89). It renders before React mounts, so it ignores all your nice `BrandLoader` components.

There's also a second category of leftovers: route-level and in-page `Loader2 + animate-spin` usages that show the old spinner once React is running (App.tsx Suspense fallback, Settings, VideoHub, ProductImages, VideoGenerate, MobileUpload, Auth, etc.).

## Changes

### 1. Boot fallback in `index.html` (the one in your screenshots)

Replace the inline grey-ring div with a brand-aligned static fallback that matches `BrandLoaderProgressGlyph` (the wordmark + sweep) — done in pure HTML/CSS so it works before JS loads. Same off-white background (`#faf9f7`), `VOVV.AI` wordmark, thin sweeping primary line underneath. No external assets, no flash when React mounts and swaps in the real component.

### 2. Route-level Suspense fallback (`src/App.tsx` line 126)

Replace the `animate-spin` div with `<BrandLoader fullScreen />` so route transitions match the rest of the app.

### 3. In-page spinners

Audit and convert the remaining `Loader2` / `animate-spin` usages to brand-consistent loaders:

- **Full-section / page loaders** (e.g. VideoHub list loader, ProductImages page boot, Auth submit overlay, MobileUpload progress) → use `<BrandLoader />` or `<DotPulse size="md" />` depending on context.
- **Inline button spinners** (e.g. Settings "Open portal" button, VideoHub download button, "Load more" button) → use `<DotPulse size="sm" className="mr-2" />`. Keeps button height stable and inherits `currentColor`.
- **Action-icon spins that aren't loaders** (e.g. Settings `RefreshCw` rotating during regenerate) → leave as-is. These are semantic action animations, not loading states.

Files to touch (in-page edits):
- `src/App.tsx`
- `src/pages/Settings.tsx`
- `src/pages/VideoHub.tsx`
- `src/pages/VideoGenerate.tsx`
- `src/pages/ProductImages.tsx`
- `src/pages/Generate.tsx`
- `src/pages/Freestyle.tsx`
- `src/pages/Perspectives.tsx`
- `src/pages/TryShot.tsx`
- `src/pages/Auth.tsx` (if present in spinner list — confirm during edit)
- `src/pages/MobileUpload.tsx`
- `src/pages/Jobs.tsx`
- `src/pages/CatalogGenerate.tsx`
- `src/pages/BrandModels.tsx`
- `src/pages/TextToProduct.tsx`
- `src/pages/video/AnimateVideo.tsx`
- `src/components/landing/SignupSlideUp.tsx`
- `src/components/landing/FreestyleShowcaseSection.tsx`
- `src/components/app/video/short-film/*` (3 files)

Admin pages (`AdminModels`, `AdminTrendWatch`, `AdminStatus`, `AdminScenes`, `AdminSceneUpload`, `AdminSceneLibrary`, `AdminUgcBulkPreviewUpload`, `AdminUIAudit`, `admin/SceneUsage`, `admin/LoadingLab`) → leave as-is. They're internal tools and `LoadingLab` intentionally shows old vs new.

## Out of scope

- No design changes to the existing `BrandLoader` / `DotPulse` components themselves.
- No changes to action-icon spins (`RefreshCw` mid-action).
- No changes to admin tooling.

## Result

The spinner you screenshotted (the boot one) becomes the VOVV wordmark + sweep. Every user-facing route transition and in-app loading state uses brand loaders. No more grey rings on the user side of the app.