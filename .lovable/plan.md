

# Creative Drops: Current State & Remaining Issues

## What's Working
- Wizard creates schedules and saves to `creative_schedules` ✓
- "Run Now" triggers `trigger-creative-drop` which enqueues jobs ✓
- `complete-creative-drop` fires after each job and transitions drop to `ready`/`failed` ✓
- Daily cron at 7 AM UTC triggers scheduled drops ✓
- `run-scheduled-drops` handles internal auth bypass ✓
- Drop detail modal fetches images from `generation_jobs` as fallback ✓

## Critical Bug: Image Format Mismatch

**`complete-creative-drop`** stores images as plain string URLs:
```ts
allImages.push(img);  // string: "https://..."
// Saved as: images = ["https://...", "https://..."]
```

**`DropCard.tsx`** (line 286) expects objects with `.url`:
```ts
const dropImages = (drop.images || []) as { url: string }[];
// Line 373: img.url → undefined on a plain string
```

**Result**: When a drop completes and transitions to `ready`, the thumbnail previews show broken images (undefined URLs) and the "+N" count may be wrong.

**Fix**: Update `complete-creative-drop` to store images as `[{ url: "https://..." }]` objects instead of plain strings, matching what the UI expects. Also store `workflow_name` and `product_title` metadata per image for the group-by-workflow feature.

## Bug 2: Missing `product_id` in Job Payloads

`trigger-creative-drop` sends `product: { title, imageUrl, ... }` but NOT `product_id` as a UUID field. In `generate-workflow` line 731: `product_id: payload.product_id || null` — this is always `null` for creative drop jobs.

**Impact**: `DropDetailModal` can't look up product titles for drop images via `product_id`.

**Fix**: Add `product_id` to the payload in `trigger-creative-drop` alongside the `product` object.

## Bug 3: Progress Bar Never Updates During Generation

The drop card shows a progress bar during `generating` status, but `completedImages` is calculated from `dropImages.length` (the `images` array on the drop). This array is only populated AFTER completion — it stays empty during generation. So the progress bar always shows 0%.

**Fix**: During `generating` status, query `generation_jobs` where `creative_drop_id = drop.id AND status = 'completed'` to get real-time completed image count. Or update `creative_drops.images` incrementally as each job completes.

## Bug 4: Drop Card Thumbnail Previews for "Ready" Drops

Even after fixing the format, the `DropCard` only shows thumbnails when `dropImages.length > 0`. But since the `creative_drops` query in `CreativeDrops.tsx` returns `images` as a JSON column, the format must match consistently.

## Changes Needed

### File 1: `supabase/functions/complete-creative-drop/index.ts`
- Store images as `[{ url: "..." }]` objects instead of plain strings
- Include `workflow_id` metadata from `generation_jobs` for each image

### File 2: `supabase/functions/trigger-creative-drop/index.ts`
- Add `product_id: productId` (the UUID) to each job payload alongside the `product` object

### File 3: `src/components/app/DropCard.tsx`
- Handle both string and object formats in `dropImages` parsing (defensive)
- For `generating` status, show time-based estimate instead of image-count progress (since real-time count isn't available without an extra query)

## Summary

| Issue | Severity | Fix |
|-------|----------|-----|
| Image format mismatch (strings vs objects) | **Critical** — ready drops show no thumbnails | `complete-creative-drop` |
| Missing `product_id` in payloads | Medium — no product names in detail modal | `trigger-creative-drop` |
| Progress bar always 0% | Low — cosmetic | `DropCard.tsx` |

3 files changed, ~30 lines total.

