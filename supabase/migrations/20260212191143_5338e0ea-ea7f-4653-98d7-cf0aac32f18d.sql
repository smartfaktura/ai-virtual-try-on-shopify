CREATE POLICY "Authenticated users can upload landing assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'landing-assets');