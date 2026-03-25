
-- Video Projects table
CREATE TABLE public.video_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  workflow_type text NOT NULL DEFAULT 'animate',
  status text NOT NULL DEFAULT 'draft',
  title text NOT NULL DEFAULT '',
  settings_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  analysis_status text NOT NULL DEFAULT 'pending',
  generation_mode text NOT NULL DEFAULT 'single',
  estimated_credits integer NOT NULL DEFAULT 0,
  charged_credits integer NOT NULL DEFAULT 0,
  cover_image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.video_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own video projects" ON public.video_projects
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access video_projects" ON public.video_projects
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Video Inputs table
CREATE TABLE public.video_inputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.video_projects(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'image',
  asset_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  input_role text NOT NULL DEFAULT 'main_reference',
  analysis_json jsonb,
  validation_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.video_inputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own video inputs" ON public.video_inputs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.video_projects vp WHERE vp.id = project_id AND vp.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.video_projects vp WHERE vp.id = project_id AND vp.user_id = auth.uid()));

CREATE POLICY "Service role full access video_inputs" ON public.video_inputs
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Video Shots table
CREATE TABLE public.video_shots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.video_projects(id) ON DELETE CASCADE,
  shot_index integer NOT NULL DEFAULT 0,
  prompt_text text NOT NULL DEFAULT '',
  duration_sec integer NOT NULL DEFAULT 5,
  status text NOT NULL DEFAULT 'pending',
  result_url text,
  source_input_id uuid REFERENCES public.video_inputs(id) ON DELETE SET NULL,
  shot_role text,
  transition_type text,
  audio_mode text NOT NULL DEFAULT 'silent',
  model_route text NOT NULL DEFAULT 'kling_v3',
  strategy_json jsonb,
  prompt_template_name text,
  analysis_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.video_shots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own video shots" ON public.video_shots
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.video_projects vp WHERE vp.id = project_id AND vp.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.video_projects vp WHERE vp.id = project_id AND vp.user_id = auth.uid()));

CREATE POLICY "Service role full access video_shots" ON public.video_shots
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Add project_id and workflow_type to generated_videos
ALTER TABLE public.generated_videos
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.video_projects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS workflow_type text;

-- Updated_at trigger for video_projects
CREATE TRIGGER update_video_projects_updated_at
  BEFORE UPDATE ON public.video_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
