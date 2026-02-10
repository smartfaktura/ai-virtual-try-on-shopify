
-- Create storage bucket for try-on generated images
INSERT INTO storage.buckets (id, name, public)
VALUES ('tryon-images', 'tryon-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload tryon images to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tryon-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access
CREATE POLICY "Tryon images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'tryon-images');

-- Allow users to delete their own tryon images
CREATE POLICY "Users can delete own tryon images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tryon-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
