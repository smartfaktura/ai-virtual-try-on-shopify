

# Reorder Hardcoded Models via Admin — No Migration Needed

## Approach
Same pattern as scene sort order: store a **model_sort_order** table in the database with just `model_id → sort_order`. The hardcoded models stay in `mockData.ts`, but everywhere they're displayed, we apply the admin-defined sort order on top. Models without an explicit order keep their original position.

## Database
New table `model_sort_order`:
```sql
CREATE TABLE public.model_sort_order (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.model_sort_order ENABLE ROW LEVEL SECURITY;
-- All authenticated users can read (needed to display sorted models)
-- Only admins can write (using has_role function)
```

## New hook: `src/hooks/useModelSortOrder.ts`
Mirror of `useSceneSortOrder`:
- `useModelSortOrder()` — fetches sort map, provides `sortModels(models)` helper
- `useSaveModelSortOrder()` — mutation to save reordered list

## Changes to model display
- **`ModelSelectorChip`** — apply `sortModels()` to `allModels` before filtering
- **`CreativeDropWizard`** — apply sort to `mockModelItems` list
- **`AdminModels.tsx`** — use sort order for initial display + save on reorder

## Files changed
| File | Change |
|------|--------|
| Migration | Create `model_sort_order` table + RLS |
| `src/hooks/useModelSortOrder.ts` | New hook (read + save sort order) |
| `src/components/app/freestyle/ModelSelectorChip.tsx` | Apply sort before render |
| `src/components/app/CreativeDropWizard.tsx` | Apply sort to model list |
| `src/pages/AdminModels.tsx` | Wire up sort persistence |

