
INSERT INTO storage.buckets (id, name, public)
VALUES ('catalog-previews', 'catalog-previews', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read catalog-previews" ON storage.objects
FOR SELECT USING (bucket_id = 'catalog-previews');

CREATE POLICY "Service role insert catalog-previews" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'catalog-previews');
