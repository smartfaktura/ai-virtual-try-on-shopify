

## Fix Scene Performance page — name + thumbnail resolution

The data layer is working correctly (177 freestyle generations tracked, scene_id populated). The page just doesn't know how to look up names/thumbnails for the two main scene families it's seeing. Three small frontend bugs to fix in `src/pages/admin/SceneUsage.tsx`.

### What's actually happening

Looking at your screenshot:

| Row shown | What it really is | Why it shows raw ID |
|---|---|---|
| `pose_021`, `pose_002`, `scene_038` | **Freestyle scenes** from `src/data/mockData.ts` (`mockTryOnPoses`) — bundled in the app, not in DB | Page only queries `product_image_scenes` + `custom_scenes` tables — never looks at the static TS file |
| `custom-973ebb42…`, `custom-eef59b5a…` | Custom scenes from DB. The full string `custom-{uuid}` is the canonical scene_id, but the row ID in `custom_scenes` is just the UUID | Page does `.in('id', ids)` with the prefixed strings → no match → no name, no thumbnail |
| Empty thumbnails on custom rows | `custom_scenes` has `image_url` populated but `preview_image_url` is null | Once #2 is fixed, the existing `preview_image_url ?? image_url` fallback already in code resolves this |

### The three fixes (one file)

**`src/pages/admin/SceneUsage.tsx`** — in the `load()` function where metadata is resolved:

1. **Strip the `custom-` prefix before the custom_scenes lookup.** Build `customIds = ids.filter(i => i.startsWith('custom-')).map(i => i.slice(7))`, query `.in('id', customIds)`, then re-key the result map with the original prefixed `custom-{uuid}` so the rest of the code finds it.

2. **Add a third resolver for freestyle/tryon scenes** from `mockTryOnPoses` (and the freestyle scene catalog if separate). Import the array, build a `Map<poseId, {name, category, previewUrl}>` once at module load, and use it as the **first** lookup before falling back to the DB tables. This covers `pose_*` and `scene_*` IDs.

3. **Use `image_url` as thumbnail fallback** — already in the code (`preview_image_url ?? image_url`); just verify after fix #1 that custom rows now resolve.

### Result after fix

The same screenshot rows would render as:
- `pose_021` → "Editorial Movement" (Editorial) + bundled preview image
- `pose_002` → "Studio Profile" (Studio) + bundled preview image
- `scene_038` → "White Studio" (Clean Studio) + bundled preview image
- `custom-eef59b5a…` → "Mid-Century Modern Lounge" (fashion) + image_url thumbnail
- `custom-b84c0c8a…` → "Clean White Studio" (studio) + image_url thumbnail

Top risers rail uses the same `meta` map → fixed automatically.

### Untouched

- No DB changes, no edge function changes, no migration.
- `freestyle_generations` and `generation_jobs` writes already correct.
- KPIs (177 generations, 76 scenes, 85 users) are already accurate.

### Files

- `src/pages/admin/SceneUsage.tsx` — only file edited.

### Validation

- Page reload: `pose_*`, `scene_*`, and `custom-*` rows show real names + thumbnails. Raw IDs only appear for truly unknown scenes (none expected).
- Search by name (e.g., "Studio") now matches.
- Top risers rail shows names/thumbs.

