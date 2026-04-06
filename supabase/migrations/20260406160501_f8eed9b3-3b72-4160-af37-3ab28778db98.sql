ALTER TABLE product_image_scenes 
  ADD COLUMN IF NOT EXISTS sub_category text DEFAULT null,
  ADD COLUMN IF NOT EXISTS category_sort_order integer DEFAULT 0;