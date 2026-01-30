-- Create scratch-uploads bucket for temporary image uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'scratch-uploads',
  'scratch-uploads',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Allow anyone to upload to scratch-uploads bucket
CREATE POLICY "Anyone can upload scratch images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'scratch-uploads');

-- Allow anyone to read scratch-uploads (needed for AI to access images)
CREATE POLICY "Anyone can view scratch images"
ON storage.objects FOR SELECT
USING (bucket_id = 'scratch-uploads');

-- Allow anyone to delete their uploaded scratch images
CREATE POLICY "Anyone can delete scratch images"
ON storage.objects FOR DELETE
USING (bucket_id = 'scratch-uploads');