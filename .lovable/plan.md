

## Admin Scene Manager Page

### Overview
Create an admin-only page at `/app/admin/scenes` where you can view all scenes grouped by category, reorder them with drag-and-drop, and delete scenes (hide built-in / delete custom).

### Database

**New table: `scene_sort_order`**
- `id` uuid PK
- `scene_id` text NOT NULL UNIQUE — matches poseId
- `sort_order` integer NOT NULL DEFAULT 0
- `updated_by` uuid NOT NULL
- `created_at` timestamptz DEFAULT now()

RLS: Admin-only for all operations, authenticated SELECT for reading order.

### New Page: `src/pages/AdminScenes.tsx`

- Admin guard using `useIsAdmin()` — redirects non-admins
- Fetches all scenes: static `mockTryOnPoses` + custom scenes from DB, filters out hidden
- Groups by category using `poseCategoryLabels`
- Each category section shows scenes as a vertical list with:
  - Thumbnail (small), name, poseId
  - Up/Down arrow buttons to reorder within category
  - Delete button (red trash icon)
- Delete action: inserts into `hidden_scenes` for built-in scenes, deletes from `custom_scenes` for custom ones
- Save button persists sort order to `scene_sort_order` table
- All consumers (`SceneSelectorChip`, `Generate`, `Discover`) will read sort order and apply it

### New Hook: `src/hooks/useSceneSortOrder.ts`

- Fetches `scene_sort_order` rows
- Returns a `sortScenes(poses: TryOnPose[]): TryOnPose[]` function that applies stored order within each category
- Used by `SceneSelectorChip`, `Generate`, and `Discover` pages

### Route

Add `/app/admin/scenes` route in `App.tsx`.

### Files

| File | Change |
|---|---|
| `src/pages/AdminScenes.tsx` | New admin page with category-grouped scene list, reorder + delete |
| `src/hooks/useSceneSortOrder.ts` | New hook to fetch/apply sort order |
| `src/App.tsx` | Add route for admin scenes page |
| `src/components/app/freestyle/SceneSelectorChip.tsx` | Apply sort order from hook |
| Migration | Create `scene_sort_order` table with RLS |

