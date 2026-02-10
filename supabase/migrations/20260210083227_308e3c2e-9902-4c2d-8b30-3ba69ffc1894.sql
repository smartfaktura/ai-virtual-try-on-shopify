
CREATE TABLE public.saved_discover_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

ALTER TABLE public.saved_discover_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved items"
ON public.saved_discover_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved items"
ON public.saved_discover_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved items"
ON public.saved_discover_items FOR DELETE
USING (auth.uid() = user_id);
