

# Fix: Recent Creations Not Showing Latest Images

## Problem
The query fetches only 5 `generation_jobs` and 5 `freestyle_generations`. Since each job can expand into multiple images (via the `results` JSONB array), a single job with 4 result images consumes 4 of the 8 display slots. This crowds out newer images from other sources that weren't fetched due to the low limits.

## Solution
Increase fetch limits from 5 to **12** for both tables. After expanding job results and merging both sources, the combined pool is large enough that the final `sort + slice(0, 8)` reliably picks the 8 most recent individual images.

## File Changed

### `src/components/app/RecentCreationsGallery.tsx`
- Change `.limit(5)` to `.limit(12)` on the `generation_jobs` query (line 45)
- Change `.limit(5)` to `.limit(12)` on the `freestyle_generations` query (line 50)
- Increase the `items.slice(0, 10)` cap to `items.slice(0, 16)` (line 117) so more items enter the signed-URL batch, then the final render still takes `.slice(0, 8)` (line 176)

