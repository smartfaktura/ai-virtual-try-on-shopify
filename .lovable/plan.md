

## Allow Admins to Hide Built-in Static Scenes

### Problem
Built-in scenes (e.g. `scene_009`) are hardcoded in `mockData.ts` and don't exist in the database. The current delete logic correctly rejects them, but admins need a way to remove these from the platform.

### Solution
Create a `hidden_scenes` table to store scene IDs that admins have hidden. Filter out hidden scenes everywhere `mockTryOnPoses` is consumed.

### Database Migration
Create `hidden_scenes` table:
```sql
CREATE TABLE public.hidden_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id text NOT NULL UNIQUE,
  hidden_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hidden_scenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage hidden scenes"
  ON public.hidden_scenes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read hidden scenes"
  ON public.hidden_scenes FOR SELECT TO authenticated
  USING (true);
```

### Code Changes

**New hook: `src/hooks/useHiddenScenes.ts`**
- Query `hidden_scenes` table to get list of hidden scene IDs
- Provide `hideScene` mutation (insert) and `unhideScene` mutation (delete)
- Export a helper to filter an array of poses by removing hidden ones

**`src/pages/Discover.tsx`** (~line 235, 511-528)
- Import `useHiddenScenes`
- Filter `mockTryOnPoses` through hidden scenes before building `allItems`
- Update `onDelete` handler: for static scenes (no `custom-` prefix), insert into `hidden_scenes` instead of showing error toast. Show "Scene hidden" success toast.

**`src/pages/PublicDiscover.tsx`** (~line 147)
- Same filter: exclude hidden scenes from `allItems`

**`src/components/app/freestyle/SceneSelectorChip.tsx`** (~line 40)
- Filter `mockTryOnPoses` through hidden scenes before combining with custom poses

**`src/pages/Generate.tsx`** (~line 480)
- Filter `mockTryOnPoses` through hidden scenes in `posesByCategory`

**`src/pages/Freestyle.tsx`** (~line 154)
- Filter hidden scenes when matching scene from URL params

**`src/pages/BulkGenerate.tsx`** (~lines 41, 164)
- Filter hidden scenes from poses passed to bulk generation

This ensures hidden built-in scenes disappear globally: Discover, Freestyle, Generate, and Bulk Generate.

