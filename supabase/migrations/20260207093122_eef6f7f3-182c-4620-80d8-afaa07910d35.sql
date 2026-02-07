
-- =============================================
-- Phase 2: Full Schema Migration
-- =============================================

-- 1. brand_profiles table
CREATE TABLE public.brand_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  brand_description TEXT NOT NULL DEFAULT '',
  tone TEXT NOT NULL DEFAULT 'clean',
  lighting_style TEXT NOT NULL DEFAULT 'soft diffused',
  background_style TEXT NOT NULL DEFAULT 'studio',
  color_temperature TEXT NOT NULL DEFAULT 'neutral',
  composition_bias TEXT NOT NULL DEFAULT 'centered',
  do_not_rules TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own brand profiles"
  ON public.brand_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brand profiles"
  ON public.brand_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand profiles"
  ON public.brand_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brand profiles"
  ON public.brand_profiles FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_brand_profiles_updated_at
  BEFORE UPDATE ON public.brand_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. workflows table (system-seeded)
CREATE TABLE public.workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  default_image_count INTEGER NOT NULL DEFAULT 10,
  required_inputs TEXT[] NOT NULL DEFAULT '{}',
  recommended_ratios TEXT[] NOT NULL DEFAULT '{1:1}',
  uses_tryon BOOLEAN NOT NULL DEFAULT false,
  template_ids TEXT[] NOT NULL DEFAULT '{}',
  is_system BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view system workflows"
  ON public.workflows FOR SELECT
  TO authenticated
  USING (is_system = true);

-- Seed 6 system workflows
INSERT INTO public.workflows (name, description, default_image_count, required_inputs, recommended_ratios, uses_tryon, template_ids, is_system) VALUES
  ('Ad Refresh Set', 'Fresh ad creatives across multiple styles for paid campaigns. Includes varied backgrounds, angles, and compositions optimized for social ads.', 20, '{product}', '{1:1,4:5}', false, '{clothing-studio,clothing-streetwear,universal-clean,universal-gradient}', true),
  ('Product Listing Set', 'E-commerce ready product images with clean backgrounds and consistent styling. Perfect for storefronts and marketplaces.', 10, '{product}', '{1:1,4:5}', false, '{clothing-studio,universal-clean,cosmetics-luxury}', true),
  ('Website Hero Set', 'Wide-format hero and banner images that showcase your products in premium editorial contexts.', 6, '{product}', '{16:9,3:2}', false, '{universal-gradient,cosmetics-luxury,home-japandi}', true),
  ('Lifestyle Set', 'Contextual lifestyle shots placing your products in real-world environments. Great for social media and brand storytelling.', 10, '{product}', '{1:1,4:5,3:2}', false, '{food-rustic,home-warm,cosmetics-pastel,clothing-streetwear}', true),
  ('On-Model Set', 'Virtual try-on images with diverse models wearing your products. Includes a range of poses and backgrounds.', 10, '{product,model,pose}', '{3:4,4:5}', true, '{clothing-studio,clothing-streetwear}', true),
  ('Social Media Pack', 'Multi-ratio pack optimized for all social platforms. Includes square (feed), portrait (stories/reels), and landscape (covers/ads).', 12, '{product}', '{1:1,4:5,16:9}', false, '{universal-clean,universal-gradient,clothing-studio}', true);

-- 3. creative_schedules table
CREATE TABLE public.creative_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_profile_id UUID REFERENCES public.brand_profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'monthly',
  products_scope TEXT NOT NULL DEFAULT 'all',
  selected_product_ids UUID[] NOT NULL DEFAULT '{}',
  workflow_ids UUID[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.creative_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own schedules"
  ON public.creative_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own schedules"
  ON public.creative_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules"
  ON public.creative_schedules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules"
  ON public.creative_schedules FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_creative_schedules_updated_at
  BEFORE UPDATE ON public.creative_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. creative_drops table
CREATE TABLE public.creative_drops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES public.creative_schedules(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  run_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'scheduled',
  generation_job_ids UUID[] NOT NULL DEFAULT '{}',
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.creative_drops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own drops"
  ON public.creative_drops FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own drops"
  ON public.creative_drops FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. Update generation_jobs with new columns
ALTER TABLE public.generation_jobs
  ADD COLUMN brand_profile_id UUID REFERENCES public.brand_profiles(id) ON DELETE SET NULL,
  ADD COLUMN workflow_id UUID REFERENCES public.workflows(id) ON DELETE SET NULL,
  ADD COLUMN creative_drop_id UUID REFERENCES public.creative_drops(id) ON DELETE SET NULL;

CREATE INDEX idx_generation_jobs_brand_profile ON public.generation_jobs(brand_profile_id);
CREATE INDEX idx_generation_jobs_workflow ON public.generation_jobs(workflow_id);
CREATE INDEX idx_generation_jobs_creative_drop ON public.generation_jobs(creative_drop_id);
