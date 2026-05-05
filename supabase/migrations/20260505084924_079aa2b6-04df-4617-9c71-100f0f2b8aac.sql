-- Add packagingDetails to trigger_blocks for scarf-packaging-unboxing-luxury
UPDATE product_image_scenes 
SET trigger_blocks = array_append(COALESCE(trigger_blocks, ARRAY[]::text[]), 'packagingDetails')
WHERE scene_id = 'scarf-packaging-unboxing-luxury'
AND NOT ('packagingDetails' = ANY(COALESCE(trigger_blocks, ARRAY[]::text[])));

-- Add packagingDetails to trigger_blocks for product-packaging-bags-scarves
UPDATE product_image_scenes 
SET trigger_blocks = array_append(COALESCE(trigger_blocks, ARRAY[]::text[]), 'packagingDetails')
WHERE scene_id = 'product-packaging-bags-scarves'
AND NOT ('packagingDetails' = ANY(COALESCE(trigger_blocks, ARRAY[]::text[])));