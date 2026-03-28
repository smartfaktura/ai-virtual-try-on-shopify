
-- Drop overly-permissive upload and delete policies on scratch-uploads
DROP POLICY IF EXISTS "Anyone can upload scratch images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete scratch images" ON storage.objects;

-- Restrict uploads to authenticated users only
CREATE POLICY "Authenticated users can upload scratch images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'scratch-uploads');

-- Restrict deletes to authenticated users only
CREATE POLICY "Authenticated users can delete scratch images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'scratch-uploads');
