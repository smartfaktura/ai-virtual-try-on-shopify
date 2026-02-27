

## Interior Design / Real Estate Photography Workflow

### Concept

A new workflow called **"Interior Design Set"** that transforms empty or outdated room photos into professionally staged interiors. The user uploads one room photo, selects room type, design style, and optional customizations (wall color, flooring), and receives AI-staged variations -- all while strictly preserving the room's architecture (windows, doors, angles, walls).

This is fundamentally different from existing workflows: instead of placing a product in scenes, we're transforming the scene itself while preserving its structure.

---

### User Flow

```text
Upload Room Photo --> Select Room Type --> Choose Design Style --> Optional: Wall Color, Flooring --> Generate Staged Variations
```

**Step-by-step:**
1. Upload a room photo (empty room, old furniture, or construction stage)
2. Select **Room Type** from a comprehensive list
3. Choose 1-3 **Interior Design Styles**
4. Optionally pick **Wall Color** and **Flooring** preferences
5. Generate -- receives variations showing the same room furnished in the selected style(s)

---

### Room Types (Comprehensive)

- Living Room
- Bedroom (Master)
- Bedroom (Guest)
- Kids Room (Girl)
- Kids Room (Boy)
- Kids Room (Twins/Shared)
- Baby Nursery (Girl)
- Baby Nursery (Boy)
- Kitchen
- Dining Room
- Bathroom (Master)
- Bathroom (Guest)
- Home Office / Work Room
- Walk-in Closet
- Hallway / Entryway
- Patio / Outdoor Living
- Balcony / Terrace
- Laundry Room
- Storage Room / Utility
- Garage
- Basement / Rec Room
- Exterior / Facade

### Interior Design Styles (Variation Strategy)

Each style becomes a variation in the generation config:

| Style | Description |
|-------|-------------|
| Modern Minimalist | Clean lines, neutral palette, functional furniture |
| Scandinavian | Light wood, whites, cozy textiles, hygge feel |
| Japandi | Japanese-Scandinavian fusion, wabi-sabi, natural materials |
| Mid-Century Modern | Retro-inspired, warm wood tones, iconic furniture shapes |
| Industrial | Exposed brick/metal, dark tones, raw textures |
| Bohemian | Layered textiles, plants, eclectic patterns, warm |
| Coastal / Hampton | Light blues, whites, natural fibers, beachy |
| Traditional / Classic | Elegant furnishings, rich fabrics, symmetry |
| Farmhouse / Rustic | Reclaimed wood, vintage charm, warm neutrals |
| Contemporary Luxury | High-end materials, statement pieces, refined |
| Art Deco | Geometric patterns, bold colors, glamorous |
| Mediterranean | Terracotta, arches, warm earth tones |

### Optional Customizations (UI Config)

- **Wall Color**: Optional color picker/presets (White, Warm White, Light Gray, Beige, Sage Green, Navy Blue, Terracotta, Blush Pink, Custom hex)
- **Flooring Preference**: Keep Original, Hardwood Light, Hardwood Dark, Marble, Tiles, Carpet, Concrete

---

### Technical Implementation

#### 1. Database: Insert workflow record

Add a new row to the `workflows` table via SQL migration with a comprehensive `generation_config` JSONB that includes:

- `prompt_template` -- Heavy emphasis on architectural preservation: "You are a professional interior designer and real estate staging photographer. Transform this room photo by adding furniture and decor while STRICTLY preserving: all window positions, door positions, wall angles, room dimensions, ceiling height, and architectural features. The camera angle must remain IDENTICAL."
- `variation_strategy.type: 'scene'` with 12 style variations
- `ui_config` with custom settings for room_type, wall_color, flooring
- `negative_prompt_additions` -- "Do not move windows, do not change door positions, do not alter room shape, no structural changes"

#### 2. Edge Function Updates (`generate-workflow/index.ts`)

- Add `ROOM_TYPE_DESCRIPTIONS` mapping (similar to existing `PRODUCT_INTERACTIONS`)
- Add `INTERIOR_STYLE_DESCRIPTIONS` mapping for detailed style prompts
- Handle new request fields: `room_type`, `wall_color`, `flooring_preference`
- Build an `interiorBlock` in `buildVariationPrompt` that injects room-specific instructions
- Force Pro model (`google/gemini-3-pro-image-preview`) for this workflow since architectural preservation requires highest fidelity

#### 3. Generate.tsx Updates

- Detect this workflow type via `generation_config.ui_config`
- Show a **Room Type selector** (grid of labeled options)
- Show an **Interior Style multi-select** (user picks 1-3 styles = variations)
- Show optional **Wall Color** and **Flooring** selectors
- The "product image" upload becomes "Room Photo" upload with adjusted copy

#### 4. WorkflowCard + Animation Data

- Add feature list to `featureMap` in `WorkflowCard.tsx`
- Add animation scene to `workflowAnimationData.tsx` (room photo + style badge overlay)

#### 5. Request Flow Mapping

The room photo maps to `product.imageUrl` (reusing existing infrastructure). The room type and style selections map to custom fields in the payload. The edge function interprets these and builds interior-specific prompts.

---

### Prompt Engineering (Critical)

The system instructions will contain strict architectural preservation rules:

```text
ARCHITECTURAL PRESERVATION (NON-NEGOTIABLE):
1. Window positions, sizes, and shapes must remain EXACTLY as shown
2. Door positions and sizes must remain EXACTLY as shown  
3. Room dimensions, angles, and perspective must be IDENTICAL
4. Ceiling height and any beams/moldings preserved
5. Any visible plumbing fixtures (bathroom/kitchen) stay in place
6. Natural light direction from windows must be consistent
7. The camera viewpoint must not change AT ALL

YOU ARE ONLY ALLOWED TO:
- Add/replace furniture appropriate for the room type
- Add decor, art, rugs, curtains, lighting fixtures
- Optionally change wall color if specified
- Optionally change flooring if specified
- Add plants and accessories
```

---

### Files to Create/Edit

| File | Change |
|------|--------|
| SQL Migration | Insert new workflow row with full `generation_config` |
| `supabase/functions/generate-workflow/index.ts` | Add room type + interior style mappings, handle new fields, build interior prompt block |
| `src/pages/Generate.tsx` | Add room type selector, style multi-select, wall color/flooring pickers for this workflow |
| `src/components/app/WorkflowCard.tsx` | Add feature list for "Interior Design Set" |
| `src/components/app/workflowAnimationData.tsx` | Add animation scene entry |
| `src/types/workflow.ts` | No changes needed -- existing `WorkflowCustomSetting` in ui_config handles this |

