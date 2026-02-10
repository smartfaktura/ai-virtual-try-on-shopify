
-- Create discover_submissions table
CREATE TABLE public.discover_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  source_generation_id uuid REFERENCES public.freestyle_generations(id) ON DELETE SET NULL,
  title text NOT NULL,
  prompt text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'lifestyle',
  tags text[] DEFAULT '{}'::text[],
  aspect_ratio text NOT NULL DEFAULT '1:1',
  quality text NOT NULL DEFAULT 'standard',
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discover_submissions ENABLE ROW LEVEL SECURITY;

-- Users can insert their own submissions
CREATE POLICY "Users can insert their own submissions"
ON public.discover_submissions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own submissions
CREATE POLICY "Users can view their own submissions"
ON public.discover_submissions
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
ON public.discover_submissions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update submissions (approve/reject)
CREATE POLICY "Admins can update submissions"
ON public.discover_submissions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete submissions
CREATE POLICY "Admins can delete submissions"
ON public.discover_submissions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert into discover_presets (needed for approval flow)
CREATE POLICY "Admins can insert discover presets"
ON public.discover_presets
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
