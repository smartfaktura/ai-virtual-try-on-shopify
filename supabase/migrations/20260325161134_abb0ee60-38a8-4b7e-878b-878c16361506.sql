
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
    SELECT COALESCE(jsonb_object_agg(model_key, cnt), '{}'::jsonb)
    FROM (
      SELECT model_key, sum(c) as cnt FROM (
        SELECT model_id as model_key, count(*) as c
        FROM freestyle_generations WHERE model_id IS NOT NULL
        GROUP BY model_id
        UNION ALL
        SELECT model_name as model_key, count(*) as c
        FROM generation_jobs WHERE model_name IS NOT NULL
        GROUP BY model_name
      ) combined GROUP BY model_key
    ) agg
  );
END;
$$;
