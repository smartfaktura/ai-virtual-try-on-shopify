

## Add More Mirror Selfie Scenes

### Current State
The Mirror Selfie Set has 16 scenes across categories: home (5), retail (3), urban (3), fitness (1), travel (2), outdoor (1). Based on your Pinterest references, there are several new environment types that would add variety -- particularly luxury/lifestyle, fashion-forward, and casual everyday settings.

### New Scenes to Add (8 new scenes, bringing total to 24)

| Scene Name | Category | Description |
|---|---|---|
| Living Room Arch Mirror | home | Arched decorative mirror in a stylish living room with warm earth tones, textured rug, and plants |
| Entryway Console | home | Full-length or round mirror above a console table in a modern entryway/foyer, coat hooks and bags visible |
| Dance Studio | fitness | Full-length wall-to-wall dance studio mirror, wooden barre, sprung flooring, bright natural light |
| Restaurant Restroom | urban | Sleek modern restaurant or club restroom mirror, moody ambient lighting, dark tile or marble walls |
| Luxury Dressing Room | retail | High-end department store dressing room with velvet curtains, warm spotlights, plush carpet |
| Sunlit Loft | home | Large industrial loft with exposed brick, floor-to-ceiling windows, full-length mirror leaning against wall |
| Shopping Mall | retail | Reflective glass or mirror in a bright modern shopping mall corridor, marble floors, retail stores in background |
| Beach House | travel | Relaxed coastal mirror selfie in a bright beach house with white-washed wood, rattan furniture, ocean light |

### Implementation Steps

#### 1. Database Migration
Update the `generation_config` JSONB in the `workflows` table for the Mirror Selfie Set to append the 8 new variation objects to `variation_strategy.variations`. Each new entry follows the existing structure with `label`, `instruction`, `aspect_ratio`, `category`, and `preview_url` (set to null initially).

Also update `default_image_count` from 8 to 8 (keep same -- users still select which scenes they want).

#### 2. Update Scene Preview Prompts
Add 8 new entries to the `scenePreviewPrompts` map in `supabase/functions/generate-scene-previews/index.ts` matching the new scene labels with detailed, Pinterest-inspired prompts for preview image generation.

#### 3. Generate Preview Images
Call the `generate-scene-previews` edge function for the Mirror Selfie workflow. The function will skip scenes that already have previews and only generate images for the new ones (where `preview_url` is null). The images get uploaded to the `workflow-previews` storage bucket.

#### 4. Update Environment Count Badge
In `src/pages/Generate.tsx`, the scene selection step shows a "16 Environments" badge. This will be updated dynamically or to "24 Environments" to reflect the new total.

### Technical Details

**Database change**: Single UPDATE to `workflows.generation_config` JSONB, appending 8 objects to the `variation_strategy.variations` array.

**Edge function change**: Add 8 new prompt entries to `scenePreviewPrompts` in `generate-scene-previews/index.ts`.

**Generate.tsx change**: Update environment count display if hardcoded.

**No new tables or schema changes needed** -- everything lives in the existing JSONB config.

