
CREATE TABLE public.discover_item_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type text NOT NULL,
  item_id text NOT NULL,
  user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.discover_item_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert views" ON public.discover_item_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read view counts" ON public.discover_item_views FOR SELECT USING (true);

CREATE INDEX idx_discover_item_views_item ON public.discover_item_views (item_type, item_id);

CREATE OR REPLACE FUNCTION public.get_discover_view_count(p_item_type text, p_item_id text)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*) FROM public.discover_item_views WHERE item_type = p_item_type AND item_id = p_item_id;
$$;
