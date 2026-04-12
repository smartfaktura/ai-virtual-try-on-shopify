

# Move Uncategorized Fragrance Scenes to Editorial

## What
25 fragrance scenes currently have no `sub_category` (showing as "Uncategorized"). Move them all to the "Editorial" sub-category and remove the `background` trigger block from each.

## Scenes affected
Gradient Blue Studio, Shadow Play Studio, Earthy Driftwood Display, Warm Neutral Studio, Natural Woodscape, Frozen Surface Product, Red Gradient Embrace, Frozen Aura, Earthy Bubble Wrap, Dynamic Studio Background, Dramatic Rock Texture, Prism Glow Showcase, Dynamic Water Splash, Earthy Glow Stage, Earthy Woodland Product, Amber Glow Studio, Moody Wet Concrete, Aquatic Reflection, Botanical Oasis, Crimson Spotlight, Earthy Botanicals Plinth, Natural Light Backdrop, Sunny Shadows, Elegant Vanity Setup, Dark Elegance

## Implementation
Single data update via the insert tool:

```sql
UPDATE product_image_scenes
SET sub_category = 'Editorial',
    trigger_blocks = '{}',
    updated_at = now()
WHERE category_collection = 'fragrance'
  AND (sub_category IS NULL OR sub_category = '');
```

No code changes needed — the frontend reads these fields dynamically.

