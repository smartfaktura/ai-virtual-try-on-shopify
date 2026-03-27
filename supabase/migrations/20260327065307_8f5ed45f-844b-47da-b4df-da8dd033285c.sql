
INSERT INTO storage.buckets (id, name, public)
VALUES ('discover-previews', 'discover-previews', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view discover previews"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'discover-previews');

CREATE POLICY "Service role can upload discover previews"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'discover-previews');

CREATE POLICY "Service role can delete discover previews"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'discover-previews');
