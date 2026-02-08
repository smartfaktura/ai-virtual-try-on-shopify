
-- Create generated_videos table
CREATE TABLE public.generated_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_image_url TEXT NOT NULL,
  prompt TEXT NOT NULL DEFAULT '',
  video_url TEXT,
  kling_task_id TEXT,
  model_name TEXT NOT NULL DEFAULT 'kling-v2-1',
  duration TEXT NOT NULL DEFAULT '5',
  aspect_ratio TEXT NOT NULL DEFAULT '16:9',
  status TEXT NOT NULL DEFAULT 'processing',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.generated_videos ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own videos"
  ON public.generated_videos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos"
  ON public.generated_videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
  ON public.generated_videos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
  ON public.generated_videos FOR DELETE
  USING (auth.uid() = user_id);

-- Service role policy for edge function updates
CREATE POLICY "Service role can manage all videos"
  ON public.generated_videos FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create generated-videos storage bucket (public for video playback)
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-videos', 'generated-videos', true);

-- Storage policies: public read
CREATE POLICY "Anyone can view generated videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'generated-videos');

-- Authenticated users can upload to their folder
CREATE POLICY "Users can upload generated videos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'generated-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Service role can upload anywhere (for edge function)
CREATE POLICY "Service role can upload generated videos"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'generated-videos');

-- Index for fast lookups
CREATE INDEX idx_generated_videos_user_id ON public.generated_videos (user_id);
CREATE INDEX idx_generated_videos_kling_task_id ON public.generated_videos (kling_task_id);
