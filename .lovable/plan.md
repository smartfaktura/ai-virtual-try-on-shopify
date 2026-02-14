

## New Workflow: Mirror Selfie Set

### Overview

A new "Mirror Selfie Set" workflow that generates Instagram-style mirror selfie content featuring the user's product(s) worn/held by a selected model, in various mirror and room settings. This is the 5th workflow, positioned after the existing 4.

### Wizard Flow

The wizard follows the existing pattern: **Product --> Model --> Settings --> Generate --> Results**

```text
Step 1: SELECT PRODUCT(S)
  - Pick 1-2 products from library (or upload scratch)
  - Multi-product supported (e.g., outfit + bag)

Step 2: SELECT MODEL
  - Same model picker as Virtual Try-On / Selfie UGC
  - Gender filter, body type, etc.
  - Model reference used for identity preservation

Step 3: SETTINGS
  - Select which mirror scene variations to generate (checkboxes)
  - 8 scene variations (see below)
  - Brand profile selector (optional)
  - Quality toggle (Standard / Pro)
  - Aspect ratio locked to 4:5 (Instagram portrait)

Step 4: GENERATING
  - Standard queue + team avatar loading state

Step 5: RESULTS
  - Image grid with select/download actions
```

### 8 Mirror Selfie Variations

Based on the reference material from Pinterest and the prompt engineering guides:

| # | Variation | Scene Description |
|---|-----------|-------------------|
| 1 | Bedroom Full-Length | Full-length mirror in a stylish bedroom, leaning against wall, natural daylight through curtains |
| 2 | Bathroom Vanity | Bathroom mirror above sink, warm overhead lighting, marble/tile backdrop |
| 3 | Boutique Fitting Room | Clothing store mirror, bright even lighting, clean background |
| 4 | Elevator / Lobby | Reflective elevator doors or lobby mirror, moody lighting, urban aesthetic |
| 5 | Gym Mirror | Full-length gym mirror, bright overhead lights, equipment subtly blurred behind |
| 6 | Hotel Room | Luxury hotel full-length mirror, warm ambient lighting, elegant decor |
| 7 | Walk-in Closet | Closet mirror surrounded by organized clothing racks, soft warm lighting |
| 8 | Minimalist Hallway | Clean hallway with tall standing mirror, hardwood floors, minimal decor |

### Prompt Engineering Strategy

The key difference from the existing "Selfie / UGC Set" is that mirror selfies have a **third-person camera perspective showing the mirror reflection**, not a first-person POV. The phone IS visible in the model's hand because the mirror reflects the full scene.

**Core prompt template:**

```text
Create a photorealistic mirror selfie photograph. A person is standing in front of
a [MIRROR TYPE] mirror, holding a smartphone at chest/waist level, capturing their
reflection. The person is wearing/holding the EXACT product(s) from [PRODUCT IMAGE].

[MODEL IMAGE] is the identity reference -- the person MUST have the exact same face,
skin tone, hair, and features.

The MIRROR REFLECTION must show:
- The person's full outfit and the product clearly visible
- The smartphone in their hand (naturally gripped, screen facing the mirror)
- The room environment reflected naturally behind them

CAMERA: Shot appears to be taken BY the person via the mirror reflection. The
composition mimics a real iPhone mirror selfie -- slight tilt, casual framing,
natural arm angle holding the phone. The phone screen may show the camera UI.

LIGHTING: Natural ambient room lighting. No studio strobes. Realistic for the
environment described. Subtle shadows and reflections on the mirror surface.

TEXTURE: iPhone-quality capture. Sharp but not overly processed. Natural skin
texture. Realistic mirror glass with very subtle reflections/distortions.
```

**Negative prompt additions:**
```text
studio lighting, professional photography, editorial pose, no phone in hand,
missing mirror, missing reflection, floating product, composite/collage,
unrealistic mirror angle, phone not visible, third-person photographer visible,
perfect symmetry, airbrushed skin, fashion magazine quality
```

### Technical Implementation

#### 1. Database Migration -- Insert new workflow row

Insert a new row into the `workflows` table with:
- `name`: "Mirror Selfie Set"
- `sort_order`: 5
- `uses_tryon`: true (requires model reference for identity)
- `required_inputs`: ["product", "model"]
- `recommended_ratios`: ["4:5"]
- `generation_config`: Full JSONB with prompt template, 8 variations, UI config

The `generation_config` will include:
- `ui_config`: `skip_template: true`, `skip_mode: true`, `show_model_picker: true`, `show_pose_picker: false`
- `variation_strategy.type`: "scene"
- `fixed_settings.aspect_ratios`: ["4:5"]
- `fixed_settings.composition_rules`: Mirror selfie composition rules
- `system_instructions`: Mirror selfie photographer persona
- Each variation has its own `instruction` describing the mirror/room environment

#### 2. Frontend -- WorkflowCard features

**`src/components/app/WorkflowCard.tsx`**: Add feature bullets for "Mirror Selfie Set" to the `featureMap`:
```text
- Realistic mirror selfie compositions with phone visible
- 8 room/mirror environments (bedroom, bathroom, elevator, gym...)
- Identity-preserved model with your product
- Instagram-ready 4:5 portrait format
```

#### 3. Frontend -- Workflow animation data

**`src/components/app/workflowAnimationData.tsx`**: Add a new `workflowScenes` entry for "Mirror Selfie Set" with product + model + mirror badge elements (reusing existing landing assets for the thumbnail).

#### 4. Edge Function -- No changes needed

The existing `generate-workflow` edge function already handles:
- Model identity preservation via `[MODEL IMAGE]` references
- Scene-based variation strategies
- Multi-product reference images
- Brand profile integration

The prompt template and variation instructions in the database config are sufficient.

### Files Changed

| File | Change |
|------|--------|
| Database migration | INSERT new workflow row with full generation_config JSONB |
| `src/components/app/WorkflowCard.tsx` | Add "Mirror Selfie Set" to `featureMap` |
| `src/components/app/workflowAnimationData.tsx` | Add animated thumbnail scene definition |

### Cost

Same as other model-based workflows: **12 credits/image** (with model reference). Users on the Starter plan (1000 credits) can generate ~83 mirror selfie images.

