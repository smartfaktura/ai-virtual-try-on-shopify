

# Rename Custom Scene & Add to Product Listing Set Workflow

## Changes

### 1. Database migration — Rename custom scene
Update the `custom_scenes` row `56f9c5d7-0a4d-4f21-b6bf-a5ff2e36f576`:
- Set `name` from "White Background Product Shot" to "Ghost Mannequin"

### 2. Database migration — Add variation to Product Listing Set workflow
Add a new variation entry to the `generation_config.variation_strategy.variations` JSON array for workflow `bf124e8b-aabc-484a-bc81-d29a9ccec885` (Product Listing Set). The new variation will use:
- **label**: "Ghost Mannequin"
- **category**: "Studio Essentials"
- **instruction**: The existing `prompt_hint` from the custom scene (the ghost mannequin / invisible mannequin product-only prompt)
- **preview_url**: The scene's current `image_url`

This will be done via a single SQL migration that:
1. Renames the custom scene
2. Uses `jsonb_set` to append the new variation to the Product Listing Set workflow's config

Both changes in one migration file.

