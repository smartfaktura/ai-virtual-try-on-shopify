

## Upscale System Rebuild: Queue-Based, Multi-Image, 2K/4K Tiers

### Current State
- Existing `upscale-image` edge function works synchronously (no queue), single image only, flat 4-credit cost
- No UI for selecting resolution tier or batch upscaling
- Library page has select mode with bulk download but no bulk upscale

### Architecture

**1. New edge function: `supabase/functions/upscale-worker/index.ts`**
Queue-compatible worker (like generate-freestyle/tryon/workflow). Called by `process-queue` when `job_type = 'upscale'`.

- Accepts `{ user_id, job_id, credits_reserved, imageUrl, sourceType, sourceId, resolution }` from queue payload
- Resolution: `"2k"` (2048px) or `"4k"` (4096px — mapped from "8k" credit tier name for practical output)
- Fetches source image, sends to Gemini 3 Pro Image with resolution-specific prompt:
  - 2K: "Reproduce at 2048px on longest edge, ultra-sharp, preserve all details"
  - 4K: "Reproduce at 4096px on longest edge, maximum resolution, razor-sharp"
- Uploads result to `freestyle-images` bucket under `upscaled/{userId}/{sourceId}-{resolution}.png`
- Updates source DB record (freestyle_generations or generation_jobs) with new URL + quality marker
- Updates `generation_queue` status to completed/failed
- On failure: marks queue job failed (credits auto-refunded by existing cleanup)
- Internal-only auth: checks `x-queue-internal` header + service role key

**2. Update `supabase/functions/enqueue-generation/index.ts`**
- Add `"upscale"` to `validJobTypes`
- Update `calculateCreditCost` to handle upscale: `resolution === '4k' ? 8 : 4` per image
- Support `imageCount` for batch (multiple queue jobs, one per image)

**3. Update `supabase/functions/process-queue/index.ts`**
- Add `upscale: "upscale-worker"` to `JOB_TYPE_TO_FUNCTION` map

**4. Delete old `supabase/functions/upscale-image/index.ts`**
Replace with the queue-based approach.

**5. Frontend: `src/hooks/useUpscaleImages.ts`** (new hook)
- `upscaleImages(items: {imageUrl, sourceType, sourceId}[], resolution: '2k' | '4k')` 
- Validates: max 10 images, sufficient credits
- Enqueues each image as separate upscale job via `enqueue-generation`
- Returns job IDs for tracking via existing `useGenerationQueue`

**6. Frontend: Upscale Resolution Modal `src/components/app/UpscaleModal.tsx`** (new)
- Shows selected image count, resolution picker (2K / 4K), total credit cost
- 2K: 4 credits/image, 4K: 8 credits/image
- "Upscale" CTA button, loading state
- Uses credit context to show balance check

**7. Update `src/pages/Jobs.tsx` (Library page)**
- Add "Upscale" button to floating action bar when images are selected (next to Download ZIP)
- Cap selection at 10 for upscale (show toast if exceeded)
- Opens UpscaleModal with selected items
- After enqueue: exit select mode, show toast "Upscaling X images..."

**8. Update `src/components/app/LibraryDetailModal.tsx`**
- Add single-image upscale button (between Download and Delete)
- Opens UpscaleModal with single item
- Show "PRO HD" badge if already upscaled (existing), disable re-upscale

**9. Update `supabase/config.toml`**
- Add `[functions.upscale-worker]` with `verify_jwt = false`

### Edge Cases & Bug Prevention
- **Already upscaled**: Skip/disable upscale button if `quality === 'upscaled'`
- **Insufficient credits**: Pre-check before modal submit, show balance in modal
- **Batch limit**: Hard cap at 10 images, validated client + server side
- **Image fetch failure**: Worker catches and fails the queue job → auto refund
- **Timeout**: Existing 5-minute watchdog in `cleanup_stale_jobs` handles stuck upscale jobs
- **Duplicate upscale**: Use `upsert: true` on storage upload to handle re-runs
- **Select mode filtering**: Don't count already-upscaled images in batch
- **Queue position**: User sees upscale jobs in Global Generation Bar like any other job

### Credit Summary
| Resolution | Per Image | Max Batch (10) |
|-----------|-----------|----------------|
| 2K | 4 credits | 40 credits |
| 4K | 8 credits | 80 credits |

