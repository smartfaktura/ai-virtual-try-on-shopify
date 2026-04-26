-- Create feature_requests table for the public /roadmap page
CREATE TABLE public.feature_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email TEXT NOT NULL,
  name TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  user_id UUID,
  status TEXT NOT NULL DEFAULT 'new',
  votes INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can submit a feature request
CREATE POLICY "Anyone can submit feature requests"
ON public.feature_requests
FOR INSERT
TO public
WITH CHECK (true);

-- Only admins can view, update, or delete feature requests
CREATE POLICY "Admins can view feature requests"
ON public.feature_requests
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update feature requests"
ON public.feature_requests
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete feature requests"
ON public.feature_requests
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for admin sorting
CREATE INDEX idx_feature_requests_created_at ON public.feature_requests (created_at DESC);
CREATE INDEX idx_feature_requests_status ON public.feature_requests (status);