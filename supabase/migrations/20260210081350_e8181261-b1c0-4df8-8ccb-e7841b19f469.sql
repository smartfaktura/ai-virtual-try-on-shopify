
-- Create discover_presets table for curated inspiration gallery
CREATE TABLE public.discover_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'lifestyle',
  model_name TEXT,
  scene_name TEXT,
  aspect_ratio TEXT NOT NULL DEFAULT '3:4',
  quality TEXT NOT NULL DEFAULT 'standard',
  tags TEXT[] DEFAULT '{}'::text[],
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discover_presets ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read presets
CREATE POLICY "Authenticated users can view discover presets"
  ON public.discover_presets
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Seed with placeholder presets (images will be replaced with real ones later)
INSERT INTO public.discover_presets (title, prompt, image_url, category, aspect_ratio, quality, tags, sort_order, is_featured) VALUES
('Tennis Court Editorial', 'A 25-year-old model wearing a white tennis outfit standing on a sunlit tennis court, golden hour lighting, editorial fashion photography, clean composition', 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&q=80', 'cinematic', '3:4', 'high', '{"editorial","tennis","golden hour","fashion"}', 1, true),
('Urban Street Style', 'Street style fashion photography of a model in oversized denim jacket walking through a neon-lit city street at night, cinematic mood, shallow depth of field', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80', 'styling', '3:4', 'high', '{"street style","urban","neon","night"}', 2, true),
('Minimal Product Shot', 'Clean white studio product photography, soft diffused lighting, centered composition, premium feel, high-end cosmetic product on marble surface', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80', 'commercial', '1:1', 'standard', '{"product","studio","minimal","cosmetics"}', 3, false),
('Coffee Shop Lifestyle', 'Lifestyle photography of a person holding a ceramic coffee cup in a cozy café, warm natural light from window, bokeh background, inviting atmosphere', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80', 'lifestyle', '4:5', 'standard', '{"lifestyle","coffee","warm","cozy"}', 4, false),
('Luxury Watch Close-up', 'Macro product photography of a luxury watch on dark textured surface, dramatic side lighting, reflections, high-end advertising style', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&q=80', 'commercial', '1:1', 'high', '{"luxury","watch","macro","advertising"}', 5, true),
('Beach Resort Editorial', 'Fashion editorial on a tropical beach at sunset, model in flowing white linen dress, warm colors, movement captured in fabric, dreamy atmosphere', 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80', 'cinematic', '3:4', 'high', '{"beach","sunset","fashion","editorial"}', 6, false),
('Studio Portrait', 'Professional studio portrait with butterfly lighting, clean white background, confident expression, beauty photography, skin retouching style', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80', 'photography', '3:4', 'high', '{"portrait","studio","beauty","professional"}', 7, true),
('Sneaker Ad Campaign', 'Dynamic product photography of sneakers in mid-air with colorful powder explosion background, action shot, high energy advertising campaign', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', 'ads', '16:9', 'high', '{"sneakers","dynamic","advertising","action"}', 8, false),
('Flat Lay Workspace', 'Overhead flat lay of a minimal workspace with laptop, coffee, notebook and plant on light wood desk, organized layout, lifestyle branding', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80', 'lifestyle', '1:1', 'standard', '{"flat lay","workspace","minimal","branding"}', 9, false),
('Vintage Film Mood', 'Vintage film grain photography of a woman in retro clothing at a 1970s diner, warm desaturated tones, nostalgic atmosphere, Kodak Portra film look', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80', 'styling', '3:4', 'standard', '{"vintage","retro","film","nostalgic"}', 10, false),
('Food Photography', 'Overhead food photography of artisan pasta dish on rustic ceramic plate, fresh herbs garnish, natural window light, food styling', 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&q=80', 'photography', '1:1', 'standard', '{"food","overhead","styling","restaurant"}', 11, false),
('Social Media Story', 'Vertical social media content of a fitness model doing yoga on rooftop at sunrise, vibrant sky, aspirational lifestyle, Instagram story format', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80', 'ads', '9:16', 'standard', '{"social media","fitness","sunrise","vertical"}', 12, false);
