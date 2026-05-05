## Copy Garments Scenes to 4 Headwear/Accessories Categories

### What
Copy 31 scenes from the `garments` category collection and create adapted versions for each of these 4 target categories:
- `hats`
- `beanies`
- `scarves`
- `hoodies`

That's **31 scenes x 4 categories = 124 new scene rows**.

### Scenes to Copy

| # | Title | Source scene_id |
|---|-------|----------------|
| 1 | Interior Window Light Editorial | apparel-interior-windowlight-editorial |
| 2 | Luxury Street Walk | apparel-street-style-luxury-walk |
| 3 | Resort Seaside Apparel Story | apparel-resort-seaside-editorial |
| 4 | Old Money Outdoor Portrait | apparel-oldmoney-outdoor-portrait |
| 5 | Front Portrait Street Hero | streetwear-editorial-front-portrait |
| 6 | Side Profile Street Study | streetwear-editorial-side-profile |
| 7 | Brutalist Concrete | brutalist-concrete |
| 8 | Urban Bench Flash Editorial | urban-bench-flash-editorial |
| 9 | Low Angle Leather Walk | low-angle-leather-walk |
| 10 | Window Salon Editorial | window-salon-editorial |
| 11 | Face Detail Product Glimpse | face-detail-product-glimpse |
| 12 | Minimal Mirror Pose | minimal-mirror-pose |
| 13 | Elevated Mirror UGC Pose | elevated-mirror-ugc-pose |
| 14 | Elevated Stair Editorial | elevated-stair-editorial |
| 15 | Desert Tailored Walk | desert-tailored-walk |
| 16 | Home Lounge Outfit Story | apparel-home-lounge-ugc |
| 17 | Sunlit Tailored Chair Pose | sunlit-tailored-chair-pose |
| 18 | Flash Glamour Portrait | flash-glamour-portrait |
| 19 | Power Mirror Statement Selfie | power-mirror-statement-selfie |
| 20 | Luxury Door Statement | luxury-door-statement |
| 21 | Day Flash Shadow Portrait | day-flash-shadow-portrait |
| 22 | Seated Portrait | streetwear-editorial-seated-chair |
| 23 | Sun Field Grounded Pose | sun-field-grounded-pose |
| 24 | Street Steps Casual Look | apparel-street-steps-casual |
| 25 | Paris Curb Side Pose | paris-curb-side-pose |
| 26 | Crossed Arms Studio | crossed-arms-studio |
| 27 | Hand on Waist | hand-on-waist |
| 28 | Chin Slightly Lifted | chin-slightly-lifted |
| 29 | Hands Behind Back | hands-behind-back |
| 30 | Close-Up Detail | closeup-detail-garments |
| 31 | Texture Detail | texture-detail-garments |

### How

1. **Create a temporary edge function** (`admin-copy-scenes-bulk`) that:
   - Reads all 31 source scenes from `garments` by scene_id
   - For each target category (`hats`, `beanies`, `scarves`, `hoodies`), creates a new row with:
     - New `scene_id`: `{source-scene-id}-{category}` (e.g., `brutalist-concrete-hats`)
     - Same `title` (kept identical)
     - `category_collection` set to the target category
     - All other fields copied as-is (prompt_template, trigger_blocks, scene_type, sub_category, outfit_hint, etc.)
   - Inserts all 124 rows via service_role

2. **Verify** the inserts via a read query

3. **Delete** the temporary edge function

### Technical Details

- The prompt templates use tokens like `{{productName}}`, `{{background}}`, etc., which are category-agnostic and will work correctly for headwear/accessories
- Outfit hints that reference garment-specific logic (top/bottom/dress) will naturally apply since these categories involve worn items
- Sub-categories are preserved from the source (e.g., "Creative Shots", "Essential Shots")
- Scene references (`use_scene_reference`) and extra reference flags are preserved
