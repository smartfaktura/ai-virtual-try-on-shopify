

# Name Generated Images by Product Title + Scene Type

## Current State
- The **edge function** already stores images as `{ url, label, aspect_ratio }` objects (e.g., label = "White Front")
- The **results screen** treats them as flat URL strings and names downloads `product-name-1.png`
- The **library** (Jobs page) pulls labels from `job.prompt_final`, ignoring per-image labels
- `generation_jobs.scene_name` is not populated for text-product jobs

## Changes

### 1. `src/pages/TextToProduct.tsx` — Fix download naming + results display

**Download function**: Replace the generic `label-idx.png` pattern with `ProductTitle_SceneName.png` using the image's `label` field from the backend result.

**Parse results properly**: Currently `resultImages` and `allResults` extract `images` as `string[]`. Change to extract `{ url, label }[]` so scene labels are available for both display and download.

**Show scene labels**: Display the scene name (e.g., "White Front") as a caption under each result image.

**Concrete changes**:
- `resultImages` memo: parse each item as `{ url, label }` instead of plain string
- `allResults` memo: change `images` type from `string[]` to `{ url: string; label: string }[]`
- `completedJobs` polling: extract `{ url, label }` from result data
- `handleDownload`: use the image's `label` instead of index — `ProductTitle_White_Front.png`
- Results grid: show `label` as a caption on each card

### 2. Library naming (no changes needed)
The library page (Generate.tsx line 381) already handles object results (`r?.url`). It uses `job.prompt_final` for label which is acceptable since library items are not downloads. No change required here unless you want scene-level labels in the library too — but that's a separate scope.

## Files Changed
| File | Change |
|------|--------|
| `src/pages/TextToProduct.tsx` | Parse image objects with labels, update download naming, show scene captions |

No backend changes needed — the edge function already returns labeled image objects.

