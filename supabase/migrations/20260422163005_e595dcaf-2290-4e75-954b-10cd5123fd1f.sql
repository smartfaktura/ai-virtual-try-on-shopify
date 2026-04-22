-- Add previous_sort_order column to remember original position when scene is featured
ALTER TABLE public.product_image_scenes
ADD COLUMN IF NOT EXISTS previous_sort_order INTEGER NULL;

-- RPC: toggle a scene's featured status
-- Featured = sort_order < 0 (floats to top of its category_collection)
CREATE OR REPLACE FUNCTION public.toggle_scene_featured(p_scene_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_sort INTEGER;
  v_previous_sort INTEGER;
  v_collection TEXT;
  v_min_featured INTEGER;
  v_new_sort INTEGER;
BEGIN
  -- Admin only
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  SELECT sort_order, previous_sort_order, category_collection
  INTO v_current_sort, v_previous_sort, v_collection
  FROM product_image_scenes
  WHERE scene_id = p_scene_id
  FOR UPDATE;

  IF v_current_sort IS NULL THEN
    RAISE EXCEPTION 'Scene not found: %', p_scene_id;
  END IF;

  IF v_current_sort < 0 THEN
    -- Currently featured → unfeature: restore previous sort_order
    v_new_sort := COALESCE(v_previous_sort, 0);
    UPDATE product_image_scenes
    SET sort_order = v_new_sort,
        previous_sort_order = NULL,
        updated_at = now()
    WHERE scene_id = p_scene_id;
  ELSE
    -- Not featured → feature: save current, set sort_order to a small negative
    -- Find the smallest (most-negative) sort_order already featured in this collection
    SELECT COALESCE(MIN(sort_order), -1000)
    INTO v_min_featured
    FROM product_image_scenes
    WHERE category_collection IS NOT DISTINCT FROM v_collection
      AND sort_order < 0;

    -- New featured scene goes one below the current minimum (so newest featured is on top)
    v_new_sort := v_min_featured - 1;

    UPDATE product_image_scenes
    SET previous_sort_order = v_current_sort,
        sort_order = v_new_sort,
        updated_at = now()
    WHERE scene_id = p_scene_id;
  END IF;

  RETURN v_new_sort;
END;
$$;