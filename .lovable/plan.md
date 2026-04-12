

# Extract All Product Image Scene Prompts to .txt

## What
Run a database query to pull all active scenes from `product_image_scenes`, then format them into a structured `.txt` file organized by category collection and sub-category, showing each shot's title, scene_id, and full prompt template.

## How
1. Query `product_image_scenes` ordered by `category_sort_order`, `sub_category_sort_order`, `sort_order`
2. Write a Python script that groups results by `category_collection` → `sub_category` and formats each entry as:
   ```
   ════════════════════════════════
   CATEGORY: Fragrance
   ════════════════════════════════

   --- Essential Shots ---

   [1] Front View (clean-packshot-fragrance)
   PROMPT:
   {{productName}} photographed in a strict front view...

   [2] Angle View (angle-view-fragrance)
   PROMPT:
   ...
   ```
3. Save to `/mnt/documents/product-image-scenes-prompts.txt`

## Output
A single downloadable `.txt` file with all ~600+ scenes organized by category and sub-category.

