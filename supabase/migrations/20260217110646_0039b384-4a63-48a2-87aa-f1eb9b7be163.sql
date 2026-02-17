
-- Create generation-inputs bucket for temporary image uploads before enqueue
INSERT INTO storage.buckets (id, name, public)
VALUES ('generation-inputs', 'generation-inputs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload generation inputs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'generation-inputs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access (generation functions need to fetch these)
CREATE POLICY "Generation inputs are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'generation-inputs');
