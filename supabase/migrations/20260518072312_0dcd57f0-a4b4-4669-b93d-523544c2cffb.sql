
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('voice-samples', 'voice-samples', true, 2097152, ARRAY['audio/mpeg','audio/mp3','audio/wav','audio/ogg'])
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public can read voice samples"
ON storage.objects FOR SELECT
USING (bucket_id = 'voice-samples');

CREATE POLICY "Admins can upload voice samples"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'voice-samples' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update voice samples"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'voice-samples' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete voice samples"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'voice-samples' AND public.has_role(auth.uid(), 'admin'::app_role));
