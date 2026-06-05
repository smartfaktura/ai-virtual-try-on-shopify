DROP POLICY IF EXISTS "Service role insert catalog-previews" ON storage.objects;

CREATE POLICY "Service role insert catalog-previews"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'catalog-previews');