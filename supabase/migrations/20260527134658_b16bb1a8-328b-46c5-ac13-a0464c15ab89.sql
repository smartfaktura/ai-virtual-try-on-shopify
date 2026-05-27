INSERT INTO storage.buckets (id, name, public) VALUES ('marketing-docs', 'marketing-docs', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read marketing-docs" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'marketing-docs');