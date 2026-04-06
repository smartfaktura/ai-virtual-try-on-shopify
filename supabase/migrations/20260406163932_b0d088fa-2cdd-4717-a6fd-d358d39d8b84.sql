
-- Step 1: Duplicate every is_global=true scene into each category it appears in
DO $$
DECLARE
  g RECORD;
  cat TEXT;
  all_cats TEXT[] := ARRAY['fragrance','beauty-skincare','makeup-lipsticks','bags-accessories','hats-small','shoes','garments','home-decor','tech-devices','food-beverage','supplements-wellness','other'];
  new_scene_id TEXT;
BEGIN
  FOR g IN SELECT * FROM product_image_scenes WHERE is_global = true
  LOOP
    FOREACH cat IN ARRAY all_cats
    LOOP
      -- Skip if this category is excluded
      IF cat = ANY(g.exclude_categories) THEN
        CONTINUE;
      END IF;

      new_scene_id := g.scene_id || '-' || cat;

      INSERT INTO product_image_scenes (
        scene_id, title, description, prompt_template, trigger_blocks,
        is_global, category_collection, scene_type, exclude_categories,
        preview_image_url, is_active, sort_order, sub_category,
        category_sort_order, sub_category_overrides
      ) VALUES (
        new_scene_id, g.title, g.description, g.prompt_template, g.trigger_blocks,
        false, cat, g.scene_type, '{}',
        g.preview_image_url, g.is_active, g.sort_order,
        COALESCE((g.sub_category_overrides->>cat), g.sub_category, 'Essential Shots'),
        g.category_sort_order, '{}'::jsonb
      )
      ON CONFLICT (scene_id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Step 2: Delete original global rows
DELETE FROM product_image_scenes WHERE is_global = true;

-- Step 3: Drop columns no longer needed
ALTER TABLE product_image_scenes DROP COLUMN is_global;
ALTER TABLE product_image_scenes DROP COLUMN exclude_categories;
ALTER TABLE product_image_scenes DROP COLUMN sub_category_overrides;
