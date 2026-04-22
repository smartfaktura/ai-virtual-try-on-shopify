

## Why your Product Images generation didn't show up

### Root cause

The `/app/generate/product-images` flow correctly sends `scene_name: "Frozen Aura"` to the queue, but **never sends `scene_id`**. The edge function (`generate-workflow`) writes:

```ts
scene_id: payload.pose?.id ?? payload.scene_id ?? null
```

Both are undefined → row is saved with `scene_id = NULL`. The `scene_usage_unified` view filters out NULL scene_ids, so the dashboard doesn't see it.

Verified in DB: your 19:20 UTC job has `scene_name = "Frozen Aura"` but `scene_id = NULL`. Same for all the 11:37 UTC jobs from earlier today.

### Fix (one file, ~1 line)

**`src/pages/ProductImages.tsx`** — in the payload built around line 729, add the missing `scene_id`:

```ts
scene_name: scene.title,
scene_id: scene.id,   // ← ADD THIS
```

That's it. The edge function already reads `payload.scene_id` as a fallback — no edge function changes needed.

### Bonus: backfill today's untracked rows (optional)

Since we already know `scene_name → scene_id` mapping exists for today's rows (they were generated against `product_image_scenes`), I can run a small data migration to backfill `scene_id` for the 5 jobs from today by matching on `scene_name`. This rescues the rows you've already generated so they appear on the dashboard.

If you'd rather keep the truly fresh start (only the Sun Lounger row from earlier), I'll skip the backfill.

### Validation

1. Generate any new image via Product Images → row appears on `/app/admin/scene-performance` within seconds with proper name + thumbnail.
2. (If backfill chosen) Today's 5 untracked Product Images rows also appear.

### Untouched

- No edge function changes, no DB schema changes.
- `freestyle_generations` was always correct (Freestyle does pass `scene_id`).
- All other workflows (`generate-tryon`, `generate-catalog`) were already correct — they pass `pose.id`.

