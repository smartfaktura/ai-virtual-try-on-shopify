## Add "Tennis Editorial" sub-category to Activewear

Create a new **Tennis Editorial** sub-category under the `activewear` category collection with 6 brand-new scenes. All scenes will feature realistic film-grade color grading, subtle grain, and tennis-specific environments designed for tennis apparel brands.

### The 6 scenes

| # | Title | Scene Type | Setting |
|---|-------|------------|---------|
| 1 | **Tennis Court Baseline** | editorial | Model at baseline of a hard-court in golden-hour light, strong perspective lines, shallow DOF, film grain |
| 2 | **Clay Court Warm-Up** | lifestyle | Model on terracotta clay court, warm ochre tones, cinematic side-light, European tennis aesthetic |
| 3 | **Net Approach Portrait** | editorial | Close-up editorial at the net, soft bokeh of court behind, strong directional light, fashion-forward pose |
| 4 | **Tennis Club Lounge** | lifestyle | Model in clubhouse / courtside bench setting, relaxed post-match moment, vintage sport-luxe feel |
| 5 | **Racket & Gear Flat Lay** | stilllife | Overhead flat lay of tennis apparel with racket, sweatbands, ball — clean editorial styling on matte surface |
| 6 | **Stadium Court Hero** | campaign | Full-body hero shot on a stadium center court, dramatic overhead lighting, championship atmosphere |

### Prompt style
- Each prompt follows the existing activewear pattern: `[MODEL IMAGE]` identity preservation + `[PRODUCT IMAGE]` garment fidelity directives
- Film color grading with subtle grain, desaturated mid-tones, lifted shadows
- Scene 5 (flat lay) uses `[PRODUCT IMAGE]` only (no model)
- All prompts include the "no text, no clutter" safeguard

### Database changes
- Insert 6 rows into `product_image_scenes` with:
  - `category_collection = 'activewear'`
  - `sub_category = 'Tennis Editorial'`
  - `sub_category_sort_order = 4` (after Aesthetic Color Sport Sets at 3)
  - Sequential `sort_order` starting at 2530
  - `is_active = true`

No frontend changes needed — existing scene picker will display the new sub-category automatically.