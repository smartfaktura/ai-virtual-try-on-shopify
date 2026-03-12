

## Fix Upscale UX in Library & Generation Bar

### Problems
1. **No processing state in Library** — when an image is being upscaled, the library card shows no visual feedback (no shimmer/spinner)
2. **GlobalGenerationBar says "View in Workflows"** for upscale jobs — should say "View in Library"
3. **Completed upscale group shows generic "Complete"** — should show "Upscaled to 2K/4K"
4. **Library doesn't auto-refresh** after upscale completes — the in-place updated image URL is stale in cache
5. **Upscale results replace originals in-place** (worker updates `image_url`/`results[]`) — user can't tell which image was upscaled since library cache is stale

### Changes

**1. `src/components/app/GlobalGenerationBar.tsx`**
- Change "View in Workflows" button to "View in Library" (navigating to `/app/library`) when any active group has `job_type === 'upscale'`
- In completed groups section: show "Upscaled to 2K" / "Upscaled to 4K" instead of generic "Complete" — carry forward `job_type` and `resolution` from the active group data when transitioning to completed state
- Auto-invalidate `['library']` query cache when an upscale group completes

**2. `src/components/app/LibraryImageCard.tsx`**
- Accept optional `isUpscaling` prop
- When true, show a subtle animated overlay (pulsing shimmer + small "Enhancing..." label) on the card to indicate the image is being processed

**3. `src/pages/Jobs.tsx` (Library page)**
- Query active upscale jobs from `generation_queue` (where `job_type = 'upscale'` and status in `queued, processing`)
- Extract `sourceId` from each job's payload to build a Set of currently-upscaling item IDs
- Pass `isUpscaling={upscalingIds.has(item.id)}` to each `LibraryImageCard`
- When upscale jobs complete (detected via polling or generation bar), invalidate `['library']` cache so the updated image URL loads

**4. `src/lib/batchGrouping.ts`**
- Ensure completed group transitions preserve `job_type` and `resolution` fields (already partially done, but the completed group builder in GlobalGenerationBar hardcodes `job_type: null`)

### Result
- Users see a shimmer overlay on library cards being upscaled
- Generation bar correctly directs to Library (not Workflows) for upscale jobs
- Completed upscale shows "Upscaled to 2K/4K" with "View in Library" link
- Library auto-refreshes when upscale finishes, showing the enhanced image

