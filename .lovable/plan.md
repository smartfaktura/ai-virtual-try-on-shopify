

## Mirror Selfie Set: Custom Wizard Flow, More Scenes, and AI Previews

### Overview

Restructure the Mirror Selfie Set wizard to use a custom step order, remove the Brand step, unlock aspect ratio selection, expand from 8 to 16 mirror scenes, and add AI-generated preview images for all scenes.

### New Wizard Step Order

```text
Current:  Product -> Brand -> Model -> Settings -> Results
New:      Product -> Scenes -> Model -> Settings -> Results
```

- **Product step**: Updated copy to clarify the product will appear in a mirror selfie ("Select the product(s) that will appear in your mirror selfie")
- **Scenes step**: NEW dedicated step showing all 16 mirror scene variations with AI preview images. User picks which compositions to generate
- **Model step**: Select the model who will take the selfie
- **Settings step**: Quality + Aspect Ratio (unlocked) + cost summary
- **No Brand step** for this workflow

### 16 Mirror Selfie Scenes (expanded from 8)

| # | Label | Category | Description |
|---|-------|----------|-------------|
| 1 | Bedroom Full-Length | home | Floor mirror, bedroom, natural daylight |
| 2 | Bathroom Vanity | home | Bathroom mirror, vanity lighting, marble |
| 3 | Boutique Fitting Room | retail | Clothing store mirror, bright even lighting |
| 4 | Elevator / Lobby | urban | Reflective elevator doors, moody lighting |
| 5 | Gym Mirror | fitness | Gym wall mirror, bright overhead lights |
| 6 | Hotel Room | travel | Luxury hotel mirror, warm ambient lighting |
| 7 | Walk-in Closet | home | Closet mirror, organized racks around |
| 8 | Minimalist Hallway | home | Standing mirror, clean hallway, natural light |
| 9 | Coffee Shop Window | urban | Reflective coffee shop window, warm interior |
| 10 | Car Side Mirror | urban | Car window/side mirror reflection, outdoor |
| 11 | Rooftop Terrace | outdoor | Glass door reflection, city skyline behind |
| 12 | Pool / Resort | travel | Poolside mirror, tropical setting, golden light |
| 13 | Art Gallery | retail | Gallery mirror, white walls, gallery lighting |
| 14 | Hair Salon | retail | Salon mirror with styling station, professional lighting |
| 15 | Vintage Shop | retail | Ornate antique mirror, eclectic decor |
| 16 | Studio Apartment | home | Full-length mirror, cozy studio, warm window light |

### Technical Changes

#### 1. Database Update -- Update workflow `generation_config`

Update the Mirror Selfie Set row to:
- Set `lock_aspect_ratio: false` (unlock aspect ratio)
- Add 8 new scene variations to the existing 8 (total 16)
- Keep `show_model_picker: true`, `skip_template: true`

#### 2. `src/pages/Generate.tsx` -- Custom wizard routing

**Mirror Selfie detection**: Add `const isMirrorSelfie = activeWorkflow?.name === 'Mirror Selfie Set';`

**`getSteps()`**: Add a dedicated path for Mirror Selfie:
```
Product -> Scenes -> Model -> Settings -> Results
```

**`getStepNumber()`**: Add matching step number mapping:
```
source/product: 1, settings(scenes): 2, model: 3, settings(final): 4, results: 5
```

Since the existing code uses a single `'settings'` step for scene selection AND generation settings, we need a way to differentiate. The approach:
- Use the existing `'settings'` step for scenes (step 2 in the new flow)  
- After scene selection, go to `'model'` (step 3)
- After model selection, the model step "Continue" navigates to a final settings sub-state
- Use a state variable `mirrorSettingsPhase` to distinguish between "scenes" and "final settings" within the `'settings'` step

**Product step copy**: When `isMirrorSelfie`, update heading and description:
- Title: "Select Product(s) for Mirror Selfie"
- Description: "Choose the product(s) your model will wear or hold in the mirror selfie"

**Product step navigation**: When `isMirrorSelfie`, skip brand profile and go directly to `'settings'` (scenes phase)

**Model step navigation**: When `isMirrorSelfie`, model "Continue" goes to final settings phase

**Settings step split**: When `isMirrorSelfie`:
- Phase 1 (scenes): Show scene selection grid with tips card. "Continue" goes to `'model'`
- Phase 2 (final settings): Show quality + aspect ratio selector (unlocked). "Back" goes to `'model'`

**Back button adjustments**: All back buttons in the mirror selfie flow respect the new order

#### 3. `supabase/functions/generate-scene-previews/index.ts` -- Add mirror scene prompts

Add 16 new mirror-selfie-specific preview prompts to the `scenePreviewPrompts` map. These will generate actual AI preview images showing a person taking a mirror selfie in each environment:

```text
"Bedroom Full-Length": "Photorealistic mirror selfie of a young woman in a stylish outfit 
standing in front of a full-length floor mirror in a modern bedroom, holding smartphone at 
chest level capturing reflection, natural daylight through sheer curtains, warm wood floors, 
bed visible in background, iPhone quality, Instagram aesthetic, 4:5 portrait"
```

Each prompt follows the mirror selfie composition rules: phone visible, reflection-based, environment-specific lighting, casual authentic pose.

#### 4. Deploy and Generate Previews

After deploying the updated edge function, the admin can click "Regenerate Previews" on the settings page to generate AI preview images for all 16 mirror scenes.

### Files Changed

| File | Change |
|------|--------|
| Database (UPDATE) | Update Mirror Selfie Set `generation_config` with 16 variations, `lock_aspect_ratio: false` |
| `src/pages/Generate.tsx` | Custom wizard routing for mirror selfie: Product -> Scenes -> Model -> Settings. Mirror-specific product step copy. Split settings step into scenes phase and final settings phase. |
| `supabase/functions/generate-scene-previews/index.ts` | Add 16 mirror selfie scene preview prompts |

