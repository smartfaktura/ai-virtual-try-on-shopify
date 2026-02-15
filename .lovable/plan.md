

## Mirror Selfie Scenes: Vertical Format + New Scenes + Diverse Models

### Overview
Transform the Mirror Selfie scene selection grid from square cards to vertical 9:16 "story" format, add 6 new environment scenes, update all preview generation prompts to feature diverse supermodels, and regenerate all previews.

### Changes

#### 1. Vertical Story Cards for Mirror Selfie Scenes
**File: `src/pages/Generate.tsx`** (line ~1591-1665)

- For Mirror Selfie workflow only, change the scene card aspect ratio from `aspect-square` to `aspect-[9/16]`
- Adjust the grid from `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` to `grid-cols-3 sm:grid-cols-4 lg:grid-cols-5` to fit the narrower vertical cards
- Keep square cards for other workflows (Product Listing Set, etc.)

#### 2. Add 6 New Scene Variations to Database
**Database update** to the `workflows.generation_config` JSONB for the Mirror Selfie Set workflow, appending 6 new variations:

**Fitness (3):**
- **Pilates Studio** -- Full-length mirror in a bright Pilates reformer studio, natural wood reformers, bright clean space
- **Yoga Studio** -- Wall mirror in a serene yoga studio, bamboo floors, warm ambient lighting, plants
- **Gym Locker Room** -- Full-length mirror in a modern gym locker room, clean tiled walls, bright overhead lighting

**Hotel Lobby (3):**
- **Hotel Lobby Grand** -- Ornate full-length mirror in a grand hotel lobby, marble floors, chandelier, luxury aesthetic
- **Hotel Lobby Modern** -- Sleek reflective glass in a contemporary boutique hotel lobby, modern furniture, moody lighting
- **Hotel Lobby Boutique** -- Decorative mirror in a boutique hotel entrance with plants, warm tones, eclectic decor

This brings the total from 24 to 30 environments.

#### 3. Update Preview Generation Prompts for Diversity + Vertical
**File: `supabase/functions/generate-scene-previews/index.ts`**

- Add 6 new scene preview prompts for the new scenes
- Update ALL existing Mirror Selfie prompts:
  - Change "a young woman" to diverse descriptions rotating through: "a blonde supermodel", "a brunette supermodel", "a dark-skinned supermodel", "a tan-skinned supermodel with dark hair", etc.
  - Change aspect ratio references from "4:5 portrait" to "9:16 vertical story format, full body visible"
  - Keep the natural, authentic mirror selfie aesthetic

#### 4. Regenerate All Previews
After deploying the edge function changes and updating the database:
- Clear all existing preview URLs by triggering the "Regenerate Previews" admin button
- The edge function processes in batches of 3, so multiple clicks will be needed to regenerate all 30 scenes
- Each preview will now feature diverse models in vertical 9:16 format

### Technical Details

**Grid layout conditional (Generate.tsx):**
```text
isMirrorSelfie ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
```

**Aspect ratio conditional (Generate.tsx):**
```text
isMirrorSelfie ? "aspect-[9/16]" : "aspect-square"
```

**Diverse model rotation in prompts (edge function):**
Cycle through descriptors per scene index:
- 0: "a stunning blonde European supermodel"
- 1: "a gorgeous brunette Latina supermodel with tan skin"
- 2: "a beautiful dark-skinned African supermodel"
- 3: "a striking East Asian supermodel with black hair"
- 4: "a radiant redhead supermodel with fair skin"
- 5: (repeat cycle)

**New database variations structure:**
Each new variation follows the existing pattern with `label`, `instruction`, `category`, `aspect_ratio: "9:16"`.

### Sequence
1. Update Generate.tsx for vertical card layout
2. Add new scene prompts to edge function + update existing prompts for diversity and vertical format
3. Deploy edge function
4. Update database with 6 new variations (+ change all existing aspect_ratios from "4:5" to "9:16")
5. Trigger preview regeneration via admin button

