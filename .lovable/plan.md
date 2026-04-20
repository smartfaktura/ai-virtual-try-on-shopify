

## Duplicate 23 editorial scenes from Clothing & Apparel into Jackets

### What I'll do
Copy 23 specific scenes from `garments` (Clothing & Apparel) into the `jackets` category, placing them under a new **Editorial Outerwear Portraits** sub-category with unique slugs.

### Scenes to duplicate
1. Fisheye Streetwear Studio
2. Old Money Outdoor Portrait
3. Sunlit Tailored Chair Pose
4. Paris Curb Side Pose
5. Soft Volume Lean
6. Super Editorial Campaign
7. Face Detail Product Glimpse
8. Flash Night Fashion Campaign
9. Minimal Mirror Pose
10. Elevated Mirror UGC Pose
11. Window Salon Editorial
12. Flash Glamour Portrait
13. Seated Sculpt Pose
14. Sun Field Grounded Pose
15. Desert Tailored Walk
16. Elevated Stair Editorial
17. City Steps Attitude
18. Day Flash Shadow Portrait
19. Folded Chair Composition
20. Urban Bench Flash Editorial
21. Luxury Door Statement
22. Power Mirror Statement Selfie
23. Side Profile Street Study

### Approach (single SQL via insert tool)
1. **Verify** all 23 source titles exist in `garments` and confirm `jackets` is the exact category value.
2. **Insert** duplicates with:
   - `scene_id` = `{original_scene_id}-jackets` → guaranteed unique
   - `id` = `gen_random_uuid()`
   - `category_collection` → `'jackets'`
   - `sub_category` → `'Editorial Outerwear Portraits'`
   - All other fields copied as-is: `title`, `description`, `prompt_template`, `trigger_blocks`, `scene_type`, `preview_image_url`, `outfit_hint`, `use_scene_reference`, `requires_extra_reference`, `suggested_colors`, `is_active`, sort orders

```sql
INSERT INTO product_image_scenes (
  scene_id, title, description, prompt_template, trigger_blocks,
  category_collection, sub_category, scene_type, preview_image_url,
  outfit_hint, use_scene_reference, requires_extra_reference,
  suggested_colors, is_active, sort_order, category_sort_order, sub_category_sort_order
)
SELECT
  scene_id || '-jackets',
  title, description, prompt_template, trigger_blocks,
  'jackets',
  'Editorial Outerwear Portraits',
  scene_type, preview_image_url,
  outfit_hint, use_scene_reference, requires_extra_reference,
  suggested_colors, is_active, sort_order, category_sort_order, sub_category_sort_order
FROM product_image_scenes
WHERE category_collection = 'garments'
  AND title IN (
    'Fisheye Streetwear Studio',
    'Old Money Outdoor Portrait',
    'Sunlit Tailored Chair Pose',
    'Paris Curb Side Pose',
    'Soft Volume Lean',
    'Super Editorial Campaign',
    'Face Detail Product Glimpse',
    'Flash Night Fashion Campaign',
    'Minimal Mirror Pose',
    'Elevated Mirror UGC Pose',
    'Window Salon Editorial',
    'Flash Glamour Portrait',
    'Seated Sculpt Pose',
    'Sun Field Grounded Pose',
    'Desert Tailored Walk',
    'Elevated Stair Editorial',
    'City Steps Attitude',
    'Day Flash Shadow Portrait',
    'Folded Chair Composition',
    'Urban Bench Flash Editorial',
    'Luxury Door Statement',
    'Power Mirror Statement Selfie',
    'Side Profile Street Study'
  );
```

### Validation
1. Pre-check query → confirm all 23 source titles exist in `garments` (report any missing before inserting)
2. Run insert → expect exactly 23 new rows
3. Open `/app/admin/product-image-scenes` → filter Jackets → see new "Editorial Outerwear Portraits" sub-group with all 23 scenes
4. Source `garments` rows untouched
5. Slugs end with `-jackets` so no PK conflicts

### Notes
- Data operation only — no schema migration
- If any titles aren't found exactly, I'll report which ones and ask before inserting
- Jacket-specific prompt tweaks can be made in the admin panel afterward without affecting source garment scenes

