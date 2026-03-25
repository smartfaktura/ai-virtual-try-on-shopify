

# Admin Model Manager — Position Numbers, Jump-to-Position & Usage Stats

## What changes

### 1. Position numbers
Show the current position number (1, 2, 3...) to the left of each model row, replacing bare arrows.

### 2. Jump-to-position input
Add a small input next to each model's position number. Admin types a target position (e.g. "5") and presses Enter — the model moves to that slot instantly (local reorder, still requires "Save Order" to persist).

### 3. Usage statistics
Add a usage count badge on each model row showing how many times the model has been used in generations. Data sources:
- `generation_jobs.model_name` — stores the model name for workflow generations
- `freestyle_generations.model_id` — stores the modelId for freestyle generations

A new database function `admin_model_usage_stats()` will aggregate both tables into a single map of `model_identifier → count`, callable only by admins. The Admin page will fetch this once and display it inline.

## Technical details

### Database function (migration)
```sql
CREATE OR REPLACE FUNCTION public.admin_model_usage_stats()
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  RETURN (
    SELECT jsonb_object_agg(model_key, cnt)
    FROM (
      SELECT model_key, sum(c) as cnt FROM (
        -- Freestyle uses model_id (e.g. 'freya' or 'custom-uuid')
        SELECT model_id as model_key, count(*) as c
        FROM freestyle_generations WHERE model_id IS NOT NULL
        GROUP BY model_id
        UNION ALL
        -- Workflow jobs use model_name (display name)
        SELECT model_name as model_key, count(*) as c
        FROM generation_jobs WHERE model_name IS NOT NULL
        GROUP BY model_name
      ) combined GROUP BY model_key
    ) agg
  );
END;
$$;
```

### Files changed

| File | Change |
|------|--------|
| Migration | Add `admin_model_usage_stats()` function |
| `src/pages/AdminModels.tsx` | Add position numbers, jump-to-position input, fetch & display usage counts |

### UI changes to AdminModels.tsx
- Replace bare arrows with `#N ↑↓` layout and a small "Go to" input
- Add a `useQuery` call to `supabase.rpc('admin_model_usage_stats')` 
- Show usage count as a subtle badge (e.g. "142 uses") on each row
- Match usage by both `model.id` (for freestyle) and `model.name` (for workflow jobs)

