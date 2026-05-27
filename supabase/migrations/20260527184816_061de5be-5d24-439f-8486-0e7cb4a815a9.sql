UPDATE public.product_image_scenes
SET use_scene_reference = true,
    trigger_blocks = ARRAY['productDetails']::text[],
    description = 'Vanity Nook — Editorial Wellness Routine editorial brand scene'
WHERE scene_id = 'brand-vanity-nook-092b4d82'
  AND (description IS NULL OR description = '')
  AND (trigger_blocks IS NULL OR cardinality(trigger_blocks) = 0);