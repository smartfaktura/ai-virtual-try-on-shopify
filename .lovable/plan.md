
## Overhaul Product Listing Set Workflow

### Current Problems
1. **Scene previews are low quality** -- the current 8 AI-generated scene backgrounds look generic and unprofessional
2. **All scenes pre-selected by default** -- users should actively choose which scenes they want, not deselect from a pre-selected list
3. **Credit pricing is too cheap** -- currently 1 credit/standard, 2 credits/high per scene. Should match the Freestyle Pro pricing model (4 credits standard, 10 credits high)
4. **No product angle options** -- users can't specify front, side, back, or mixed angles
5. **Only 8 scenes** -- needs expansion to 20 premium, diverse scenes

### Solution Overview

Expand to 20 pro-level scenes organized in categories, start with none selected, add product angle controls, and align credit costs with the Freestyle pricing model.

### New Scene Library (20 Scenes)

Organized into 4 categories for easy browsing:

**Studio Essentials (5)**
1. Hero White -- clean white studio, the primary listing shot
2. Soft Gray Infinity -- seamless light gray sweep
3. Gradient Glow -- soft white-to-color gradient, floating feel
4. Shadow Play -- hard directional light, dramatic long shadows
5. Dark & Moody -- deep black/charcoal, rim lighting

**Surface & Texture (5)**
6. White Marble -- veined marble slab, luxury feel
7. Raw Concrete -- industrial textured concrete
8. Warm Wood Grain -- natural oak/walnut surface
9. Linen & Fabric -- soft draped linen/cotton backdrop
10. Terrazzo Stone -- speckled terrazzo, contemporary

**Lifestyle Context (5)**
11. Bathroom Shelf -- product on a styled bathroom shelf
12. Kitchen Counter -- clean kitchen countertop setting
13. Vanity Table -- beauty vanity with soft mirror reflections
14. Office Desk -- minimal workspace scene
15. Bedside Table -- cozy bedroom nightstand

**Editorial & Creative (5)**
16. Botanical Garden -- surrounded by lush greenery/flowers
17. Water Splash -- dynamic water droplets, freshness
18. Golden Hour -- warm sunset lighting, outdoor feel
19. Neon Accent -- dark scene with colored neon rim light
20. Flat Lay Overhead -- top-down with styled props

### Product Angle Options
Add a new "Product Angles" selector in the settings step with options:
- **Front Only** (default) -- standard front-facing shot
- **Front + Side** -- generates each selected scene twice (front and side view)
- **Front + Back** -- generates each selected scene twice (front and back view)
- **All Angles** -- generates each selected scene three times (front, side, back)

The angle multiplier affects the total image count and credits accordingly.

### Credit Pricing Alignment
Match Freestyle pricing:
- Standard quality: **4 credits per image**
- High quality: **10 credits per image**

### Technical Details

**Database Migration: Update `workflows.generation_config`**
- Update the Product Listing Set workflow's `generation_config` JSONB to include 20 new scene variations with upgraded prompt instructions
- Add a `custom_settings` entry in `ui_config` for product angles

**File: `src/pages/Generate.tsx`**

Settings step changes (lines ~1380-1570):
- **Scene selection**: Change default from all-selected to none-selected. Show a prompt: "Select the scenes you want (min 1)"
- **Category tabs**: Add horizontal filter tabs (All, Studio, Surface, Lifestyle, Editorial) above the scene grid
- **Scene grid**: Increase to `grid-cols-2 sm:grid-cols-4 lg:grid-cols-5` for 20 items
- **Product Angle selector**: Add a new card section between scene selection and Generation Settings with angle options (Front Only, Front+Side, Front+Back, All Angles)
- **Credit calculation**: Update line 660 from `workflowImageCount * (quality === 'high' ? 2 : 1)` to `workflowImageCount * (quality === 'high' ? 10 : 4)`, multiplied by the angle count
- **Generate button**: Disable when 0 scenes selected, show "Select at least 1 scene"
- **Total image count**: `selectedScenes * angleMultiplier`

**File: `supabase/functions/generate-workflow/index.ts`**
- Accept new `product_angles` field in the request body
- For each selected scene variation, generate images for each requested angle by appending angle instructions to the prompt (e.g., "Show the product from a 45-degree side angle" or "Show the back/rear of the product")

**File: `src/types/workflow.ts`**
- Add `category?: string` to `WorkflowVariationItem` interface for scene categorization

### UX Flow After Changes

```text
Step 1: Select Product
Step 2: Brand Profile (if available)
Step 3: Settings
  - Product summary card
  - "Select Your Scenes" card (category tabs + 20 scene grid, none pre-selected)
  - "Product Angles" card (Front Only / Front+Side / Front+Back / All Angles)
  - "Generation Settings" card (Quality dropdown with 4/10 credit costs, Aspect Ratio)
  - Credit summary: "X scenes x Y angles x Z credits = Total"
  - Generate button (disabled until at least 1 scene selected)
```

### Files Changed Summary
| File | Change |
|------|--------|
| Database migration | Update Product Listing Set `generation_config` with 20 scenes + angle custom_setting |
| `src/pages/Generate.tsx` | Scene category tabs, none-selected default, angle selector, updated credit math |
| `src/types/workflow.ts` | Add `category` field to `WorkflowVariationItem` |
| `supabase/functions/generate-workflow/index.ts` | Handle `product_angles` param, multiply generations per angle |
