
-- Add new columns
ALTER TABLE public.workflows
  ADD COLUMN sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN preview_image_url text;

-- Rename and reorder existing workflows
UPDATE public.workflows SET name = 'Virtual Try-On Set', sort_order = 1
  WHERE name = 'On-Model Set';
UPDATE public.workflows SET sort_order = 2 WHERE name = 'Social Media Pack';
UPDATE public.workflows SET sort_order = 3 WHERE name = 'Product Listing Set';
UPDATE public.workflows SET sort_order = 4 WHERE name = 'Lifestyle Set';
UPDATE public.workflows SET sort_order = 5 WHERE name = 'Website Hero Set';
UPDATE public.workflows SET sort_order = 6 WHERE name = 'Ad Refresh Set';

-- Insert 4 new workflows
INSERT INTO public.workflows
  (name, description, default_image_count, required_inputs,
   recommended_ratios, uses_tryon, template_ids, is_system, sort_order)
VALUES
  ('Selfie / UGC Set',
   'Casual phone-camera style shots -- mirror selfies, coffee shops, golden-hour parks. Authentic UGC aesthetic that converts on social.',
   8, '{product,model,pose}', '{4:5,1:1}', true, '{}', true, 7),
  ('Flat Lay Set',
   'Overhead styled arrangements with curated props and clean compositions. Perfect for Instagram grids and editorial layouts.',
   8, '{product}', '{1:1,4:5}', false, '{}', true, 8),
  ('Seasonal Campaign Set',
   'Themed product shots across Spring, Summer, Autumn, and Winter settings. Generate 4/8/12 images covering every season.',
   12, '{product}', '{1:1,4:5,16:9}', false, '{}', true, 9),
  ('Before & After Set',
   'Paired transformation images showing product impact. Optimized for skincare, supplements, and wellness brands.',
   8, '{product}', '{1:1,4:5}', false, '{}', true, 10);

-- Create storage bucket for workflow preview images
INSERT INTO storage.buckets (id, name, public)
VALUES ('workflow-previews', 'workflow-previews', true);

-- Allow anyone to read (public bucket)
CREATE POLICY "Public read access for workflow previews"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'workflow-previews');

-- Allow authenticated users to upload workflow previews
CREATE POLICY "Authenticated users can upload workflow previews"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'workflow-previews' AND auth.role() = 'authenticated');
