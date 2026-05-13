## Issue

Images aren't loading on `/showcase/makarawear` because I constructed the storage URL from the **wrong ID**. The page uses `generation_jobs.id` as the folder name, but the actual storage path uses a different inner ID (likely the queue/batch ID). All 76 image URLs return HTTP 400.

The correct URL for each job is already stored in `generation_jobs.results[0]` as a fully-qualified URL.

## Fix

Rebuild the `IMAGES` array in `src/pages/showcase/MakaraWearShowcase.tsx` to embed the **full storage URL** (from `results->>0`) for each of the 76 jobs, instead of constructing URLs from job IDs.

- Drop the helper `url(jobId)` and the `USER_ID`/`BUCKET` constants.
- Each image becomes `{ url: 'https://...', scene: '...', category: '...' }` — same shape as the Brite showcase.
- 1 of the original 76 jobs (`1348d8dd...`, scene "Coastal Stillness Swim Frame") only has base64 data, no uploaded URL yet → drop it. Final count: **75 visuals**. Update the stat tile from "76" to "75".
- Keep the round-robin interleaving order.
- No other changes (route, layout, hero copy, CTAs all stay).

## Out of scope

- No DB, RLS, or generation pipeline changes.
- No changes to other showcase pages.
