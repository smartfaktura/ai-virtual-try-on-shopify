ALTER TABLE public.generated_videos REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.generated_videos;