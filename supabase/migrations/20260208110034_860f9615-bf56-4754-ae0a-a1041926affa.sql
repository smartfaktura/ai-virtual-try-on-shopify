
-- Create freestyle_generations table
CREATE TABLE public.freestyle_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL DEFAULT '1:1',
  quality TEXT NOT NULL DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.freestyle_generations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own freestyle generations"
ON public.freestyle_generations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own freestyle generations"
ON public.freestyle_generations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own freestyle generations"
ON public.freestyle_generations
FOR DELETE
USING (auth.uid() = user_id);

-- Create freestyle-images storage bucket (public for direct URL display)
INSERT INTO storage.buckets (id, name, public)
VALUES ('freestyle-images', 'freestyle-images', true);

-- Storage policies: authenticated users can upload to their own folder
CREATE POLICY "Users can upload freestyle images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'freestyle-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies: anyone can view freestyle images (public bucket)
CREATE POLICY "Freestyle images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'freestyle-images');

-- Storage policies: users can delete their own freestyle images
CREATE POLICY "Users can delete their own freestyle images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'freestyle-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
