
-- 1. watch_accounts
CREATE TABLE public.watch_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  username text NOT NULL,
  instagram_account_id text,
  profile_image_url text,
  category text NOT NULL DEFAULT 'Fashion & Apparel',
  is_active boolean NOT NULL DEFAULT true,
  priority_order integer NOT NULL DEFAULT 0,
  source_mode text NOT NULL DEFAULT 'manual',
  sync_status text NOT NULL DEFAULT 'manual',
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.watch_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage watch_accounts" ON public.watch_accounts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. watch_posts
CREATE TABLE public.watch_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  watch_account_id uuid NOT NULL REFERENCES public.watch_accounts(id) ON DELETE CASCADE,
  instagram_post_id text,
  media_type text NOT NULL DEFAULT 'image',
  media_url text,
  thumbnail_url text,
  caption text,
  permalink text,
  posted_at timestamptz,
  like_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  is_favorite boolean NOT NULL DEFAULT false,
  is_worth_aesthetic boolean NOT NULL DEFAULT false,
  fetched_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.watch_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage watch_posts" ON public.watch_posts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. post_notes
CREATE TABLE public.post_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  watch_post_id uuid NOT NULL REFERENCES public.watch_posts(id) ON DELETE CASCADE,
  palette text DEFAULT '',
  lighting text DEFAULT '',
  background text DEFAULT '',
  crop text DEFAULT '',
  props text DEFAULT '',
  mood text DEFAULT '',
  styling_tone text DEFAULT '',
  premium_cue text DEFAULT '',
  internal_note text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.post_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage post_notes" ON public.post_notes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. reference_analyses
CREATE TABLE public.reference_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  watch_post_id uuid NOT NULL REFERENCES public.watch_posts(id) ON DELETE CASCADE,
  category text DEFAULT '',
  subcategory text DEFAULT '',
  scene_type text DEFAULT '',
  palette text[] DEFAULT '{}',
  dominant_colors text[] DEFAULT '{}',
  lighting_type text DEFAULT '',
  light_direction text DEFAULT '',
  shadow_softness text DEFAULT '',
  background_type text DEFAULT '',
  environment_type text DEFAULT '',
  crop_type text DEFAULT '',
  camera_angle text DEFAULT '',
  framing_style text DEFAULT '',
  composition_logic text DEFAULT '',
  props text[] DEFAULT '{}',
  material_cues text[] DEFAULT '{}',
  surface_cues text[] DEFAULT '{}',
  styling_tone text DEFAULT '',
  mood text DEFAULT '',
  premium_cues text[] DEFAULT '{}',
  realism_level text DEFAULT '',
  has_model boolean DEFAULT false,
  has_hands boolean DEFAULT false,
  has_packaging boolean DEFAULT false,
  image_mode text DEFAULT '',
  avoid_terms text[] DEFAULT '{}',
  short_summary text DEFAULT '',
  recommended_scene_name text DEFAULT '',
  recommended_aesthetic_family text DEFAULT '',
  raw_analysis_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reference_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage reference_analyses" ON public.reference_analyses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. scene_recipes
CREATE TABLE public.scene_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text DEFAULT '',
  subcategory text DEFAULT '',
  aesthetic_family text DEFAULT '',
  scene_type text DEFAULT '',
  short_description text DEFAULT '',
  scene_goal text DEFAULT '',
  palette text[] DEFAULT '{}',
  lighting text DEFAULT '',
  background text DEFAULT '',
  composition text DEFAULT '',
  crop text DEFAULT '',
  camera_feel text DEFAULT '',
  props text[] DEFAULT '{}',
  mood text DEFAULT '',
  styling_tone text DEFAULT '',
  premium_cues text[] DEFAULT '{}',
  avoid_terms text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft',
  source_type text NOT NULL DEFAULT 'instagram',
  source_reference_analysis_id uuid REFERENCES public.reference_analyses(id) ON DELETE SET NULL,
  source_watch_post_id uuid REFERENCES public.watch_posts(id) ON DELETE SET NULL,
  preview_image_url text,
  recommended_use_cases text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scene_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage scene_recipes" ON public.scene_recipes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. prompt_outputs
CREATE TABLE public.prompt_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_recipe_id uuid NOT NULL REFERENCES public.scene_recipes(id) ON DELETE CASCADE,
  master_scene_prompt text DEFAULT '',
  environment_prompt text DEFAULT '',
  lighting_prompt text DEFAULT '',
  composition_prompt text DEFAULT '',
  styling_prompt text DEFAULT '',
  negative_prompt text DEFAULT '',
  consistency_prompt text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.prompt_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage prompt_outputs" ON public.prompt_outputs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add updated_at triggers
CREATE TRIGGER update_watch_accounts_updated_at BEFORE UPDATE ON public.watch_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_notes_updated_at BEFORE UPDATE ON public.post_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reference_analyses_updated_at BEFORE UPDATE ON public.reference_analyses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scene_recipes_updated_at BEFORE UPDATE ON public.scene_recipes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prompt_outputs_updated_at BEFORE UPDATE ON public.prompt_outputs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
