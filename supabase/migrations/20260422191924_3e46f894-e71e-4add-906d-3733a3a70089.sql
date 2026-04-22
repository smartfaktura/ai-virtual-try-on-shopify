-- Clear all freestyle scene tracking except the latest Sun Lounger Resort Pose reference row
UPDATE public.freestyle_generations
SET scene_id = NULL
WHERE scene_id IS NOT NULL
  AND id <> (
    SELECT id FROM public.freestyle_generations
    WHERE scene_id = 'pis-swimwear-editorial-lounger-resort'
    ORDER BY created_at DESC
    LIMIT 1
  );

-- Clear all generation_jobs scene tracking
UPDATE public.generation_jobs
SET scene_id = NULL
WHERE scene_id IS NOT NULL;