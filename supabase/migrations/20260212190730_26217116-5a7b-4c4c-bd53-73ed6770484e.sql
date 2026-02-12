
INSERT INTO storage.buckets (id, name, public) VALUES ('landing-assets', 'landing-assets', true);

CREATE POLICY "Public read access for landing assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'landing-assets');
