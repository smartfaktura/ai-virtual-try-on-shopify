
Fix video download naming so files use motion + source/product name consistently.

1. Findings
- Motion is not currently being saved into `generated_videos.camera_type`.
  - In `supabase/functions/generate-video/index.ts`, the video row is inserted without `camera_type`, even though the generation payload already contains `cameraMotion`.
- Several download entry points still use generic filenames:
  - `src/components/app/video/VideoResultsPanel.tsx` uses `video-${Date.now()}.mp4`
  - `src/components/app/video/VideoDetailModal.tsx` falls back to a hash when `camera_type` is missing
  - `src/pages/VideoHub.tsx` ZIP naming falls back because `camera_type` is null
  - `src/pages/VideoGenerate.tsx` legacy route is also generic
- Product/source naming is not preserved today.
  - The animate flow mostly keeps only `imageUrl`
  - upload flow loses the original file name after storage upload
  - library picker returns only URL, not label/product name
  - project title is currently based on category/subject category, not the actual product/file name

2. Implementation
- Persist motion metadata at generation time
  - Update `supabase/functions/generate-video/index.ts` to write `camera_type: body.cameraMotion` when inserting into `generated_videos`.
- Preserve source/product label through the animate flow
  - In `src/pages/video/AnimateVideo.tsx`, capture a readable source name:
    - upload: original file name without extension
    - library: prefer `productName`, otherwise item `label`
  - Update `src/components/app/video/LibraryPickerModal.tsx` so selection returns metadata, not just URL.
  - Pass `sourceName` into `useVideoProject` and `useBulkVideoProject`.
- Save source metadata on the related project
  - Update `src/hooks/useVideoProject.ts` and `src/hooks/useBulkVideoProject.ts` to store `sourceName` in `video_projects.settings_json` and use it in the project title instead of category-only naming.
- Unify naming in one shared helper
  - Add a shared filename builder for all video downloads.
  - Naming priority:
    - motion: `camera_type` -> `settings_json.cameraMotion`
    - product/source: `settings_json.sourceName` -> `settings_json.productName` -> `project_title`
    - fallback short id
  - Format: `{camera-motion}_{product-or-source}_{short-id}.mp4`
  - Sanitize spaces/special characters once and reuse everywhere.
- Apply the helper everywhere videos are downloaded
  - `src/components/app/video/VideoDetailModal.tsx`
  - `src/components/app/video/VideoResultsPanel.tsx`
  - `src/pages/VideoHub.tsx`
  - `src/pages/VideoGenerate.tsx` (legacy route, to prevent regression)
- Improve history fetch for fallback naming
  - Update `src/hooks/useGenerateVideo.ts` to fetch `video_projects.title` together with `settings_json` and `workflow_type`.

3. Expected result
- New downloads will use motion first and include the product/source name.
- ZIP downloads and single downloads will follow the same naming logic.
- Existing videos should recover motion from `settings_json` even if `camera_type` was never saved.
- Existing older videos may still miss true product names if that source label was never stored at generation time; those will fall back to project title or short id.

4. Technical details
- Files to update:
  - `supabase/functions/generate-video/index.ts`
  - `src/pages/video/AnimateVideo.tsx`
  - `src/components/app/video/LibraryPickerModal.tsx`
  - `src/hooks/useVideoProject.ts`
  - `src/hooks/useBulkVideoProject.ts`
  - `src/hooks/useGenerateVideo.ts`
  - `src/components/app/video/VideoDetailModal.tsx`
  - `src/components/app/video/VideoResultsPanel.tsx`
  - `src/pages/VideoHub.tsx`
  - `src/pages/VideoGenerate.tsx`
  - plus one shared filename helper
- No database migration is required; this can be fixed with existing fields and project metadata.
