
-- Make 4 user-content buckets private
UPDATE storage.buckets SET public = false WHERE name IN ('freestyle-images', 'tryon-images', 'generated-videos', 'generation-inputs');

-- Storage RLS: Users can SELECT their own files (folder prefix = user_id)
CREATE POLICY "Users can view own freestyle images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'freestyle-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own tryon images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'tryon-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own generated videos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'generated-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own generation inputs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'generation-inputs' AND auth.uid()::text = (storage.foldername(name))[1]);
