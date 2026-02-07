
-- 1. Create private product-uploads storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-uploads', 'product-uploads', false);

-- 2. RLS policies for product-uploads: user-scoped paths ({user_id}/filename)
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'product-uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own uploads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Create mobile_upload_sessions table
CREATE TABLE public.mobile_upload_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Enable RLS on mobile_upload_sessions
ALTER TABLE public.mobile_upload_sessions ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies: users can only access their own sessions
CREATE POLICY "Users can view their own sessions"
ON public.mobile_upload_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
ON public.mobile_upload_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
ON public.mobile_upload_sessions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
ON public.mobile_upload_sessions FOR DELETE
USING (auth.uid() = user_id);

-- 6. Index for fast session token lookups
CREATE INDEX idx_mobile_upload_sessions_token ON public.mobile_upload_sessions (session_token);
CREATE INDEX idx_mobile_upload_sessions_expires ON public.mobile_upload_sessions (expires_at);
