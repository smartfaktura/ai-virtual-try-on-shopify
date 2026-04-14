-- Add audio persistence columns
ALTER TABLE public.video_projects ADD COLUMN IF NOT EXISTS music_track_url text;
ALTER TABLE public.video_shots ADD COLUMN IF NOT EXISTS audio_url text;
ALTER TABLE public.video_shots ADD COLUMN IF NOT EXISTS sfx_url text;

-- Create private storage bucket for generated audio
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-audio', 'generated-audio', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for generated-audio bucket
CREATE POLICY "Users can upload their own audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'generated-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'generated-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own audio"
ON storage.objects FOR DELETE
USING (bucket_id = 'generated-audio' AND auth.uid()::text = (storage.foldername(name))[1]);