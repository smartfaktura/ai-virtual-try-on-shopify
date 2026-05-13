# Padel Editorial — 8 cinematic scenes for Activewear

Add a new sub-category **"Padel Editorial"** under the existing `activewear` collection, mirroring the structure of `Tennis Editorial`. All 8 scenes are **with-model** (use [MODEL IMAGE] + [PRODUCT IMAGE] anchor) and follow the same trigger_blocks + filter_tags pattern that powers the existing tennis set.

## Scope
- Database insert into `product_image_scenes` only.
- No code changes, no UI changes — scenes appear automatically because `Activewear` already groups by `sub_category`.
- After insert, the previews are blank — admin uploads thumbnails through the existing scene-preview override flow (same pattern used for the tennis scenes).

## Shared row defaults

| Field | Value |
|---|---|
| `category_collection` | `activewear` |
| `sub_category` | `Padel Editorial` |
| `scene_type` | `lifestyle` (1 hero uses `editorial` — see "Padel Glass Wall Hero") |
| `shot_style` | `lifestyle` (hero: `editorial`) |
| `subject` | `with-model` |
| `trigger_blocks` | `{personDetails, sceneEnvironment, stylingDetails, visualDirection, layout}` |
| `is_active` | `true` |
| `requires_extra_reference` | `false` |
| `use_scene_reference` | `false` |
| `outfit_hint` | `null` (standard outfit UI stays — per scene-controlled-outfit memory) |
| `category_sort_order` | `0` |
| `sort_order` | starts at `2545`, +1 per scene (after Tennis Editorial's 2544) |
| `sub_category_sort_order` | `1..8` in the order below |
| `filter_tags` | base `{padel, glass-court, european}` plus per-scene tags |

## Prompt template skeleton (every scene)

Same 3-anchor structure as Tennis Editorial — identity lock, product lock, then cinematic scene description:

```
Use [MODEL IMAGE] as the identity reference and preserve the person's real facial structure, skin texture, body proportions, posture, hand anatomy, hairline, and natural athletic presence.

Use [PRODUCT IMAGE] {{productName}} as the exact garment reference. Keep the garment true to the uploaded product image, including fabric texture, color, seams, logo placement, neckline, waistband, panel construction, fit, opacity, and all visible product details.

Create a premium padel-fashion editorial scene called "<Scene Name>".

<scene-specific paragraphs: pose · expression · styling · environment · camera · lighting · fabric physics · final mood>

Photograph the scene like a luxury sportswear campaign on <focal length> lens, shallow depth of field, realistic optical bokeh, sharp natural skin detail, visible textile texture, and cinematic but believable color grading.

The final image should feel authentic, premium, natural, and quietly cinematic — a real padel <moment> captured with high-end fashion editorial taste.
```

---

## The 8 scenes

### 1. `activewear-padel-glass-wall-hero` — "Padel Glass Wall Hero"  *(scene_type: editorial)*
- **Mood**: confident editorial · **Setting**: indoor padel court behind glass wall · **Filter tags**: `+hero, +indoor, +cool`
- **Cinematic beat**: athlete stands inside the cage, framed by the back glass wall. One palm rests against the glass at shoulder height; the other hand holds a padel racket loose at the hip. Shoulders square, chin slightly lifted, gaze through the glass past the camera.
- **Camera**: 35mm, eye-level, slight low angle, full body framing, subject centered with negative space above head; faint reflection of the court lights on the glass.
- **Lighting**: cool overhead arena lighting + warm spill from court LEDs creating a teal/amber rim split.
- **Final feel**: campaign hero — quiet, powerful, sportswear-as-fashion.

### 2. `activewear-padel-net-volley-ready` — "Padel Net Volley Ready"
- **Mood**: focused athletic · **Setting**: blue padel court near the net · **Filter tags**: `+blue-court, +action, +cool`
- **Beat**: athlete in a low ready stance at the net, racket up at chest, both knees softly bent, weight on the balls of the feet. Eyes locked toward an imaginary incoming ball.
- **Camera**: 50mm, chest-height, 3/4 perspective from the side; net crosses the foreground softly out of focus.
- **Lighting**: bright arena daylight from above, even and clean with subtle court-blue color bounce on the lower body.

### 3. `activewear-padel-back-glass-recovery` — "Back Glass Recovery"
- **Mood**: dynamic candid · **Setting**: rear glass wall, mid-rally moment · **Filter tags**: `+motion, +indoor, +editorial`
- **Beat**: athlete pivots toward the back glass mid-turn, knees bent, hips coiled, racket trailing low — captured the split second before the lob defense. Hair and garment carry slight motion.
- **Camera**: 35mm, low angle from corner of court, slight Dutch tilt, full body. Faint motion blur on racket only; subject sharp.
- **Lighting**: cool overhead with dramatic shadow along the glass.

### 4. `activewear-padel-club-bench-rest` — "Padel Club Bench Rest"
- **Mood**: quiet luxury · **Setting**: courtside bench at a premium padel club · **Filter tags**: `+rest, +warm, +lifestyle`
- **Beat**: athlete seated on a clean wooden courtside bench, towel folded next to them, racket leaning against the bench. One forearm rests on the knee, the other hand holds a stainless water bottle loosely. Gaze off-camera toward the court.
- **Camera**: 50mm, slightly low chest-height, full-body 3/4. Soft court netting and cage in background bokeh.
- **Lighting**: warm late-afternoon daylight from a high window or open side, soft long shadows.

### 5. `activewear-padel-clay-blue-warmup` — "Blue Court Warm-Up"
- **Mood**: calm preparation · **Setting**: blue padel court baseline at golden hour · **Filter tags**: `+warmup, +golden-hour, +blue-court`
- **Beat**: arm-across-chest stretch standing on the baseline, racket leaning against the leg. Shoulders soft, weight on one leg, expression introspective.
- **Camera**: 50mm, low chest-height, sideline 3/4 perspective; service line visible in foreground.
- **Lighting**: warm golden-hour from one side, rim light on shoulders and hair, cool court reflecting subtle blue into the legs.

### 6. `activewear-padel-court-walk-entrance` — "Court Walk Entrance"
- **Mood**: confident editorial walk · **Setting**: walking into the cage through the side door · **Filter tags**: `+entrance, +editorial, +motion`
- **Beat**: athlete mid-stride entering the court, racket in one hand, towel on shoulder. Posture tall, gaze forward and slightly past the camera, mouth relaxed.
- **Camera**: 50mm, low angle, full body, slight motion forward; door frame and glass cage create natural side framing.
- **Lighting**: bright key light from inside the cage, cooler ambient outside — clear separation between interior and exterior.

### 7. `activewear-padel-serve-prep-baseline` — "Serve Prep at Baseline"
- **Mood**: composed athletic · **Setting**: padel court baseline, ball in hand · **Filter tags**: `+serve, +baseline, +focused`
- **Beat**: athlete at the baseline holding a padel ball at chest, racket lowered to side, eyes scanning the opposite court — the moment before the underhand serve.
- **Camera**: 85mm, slight low angle, 3/4 body framing, mid-distance with the back wall softly in focus behind.
- **Lighting**: directional daylight from one side casting a clean diagonal shadow across the court surface.

### 8. `activewear-padel-post-match-glass-lean` — "Post-Match Glass Lean"
- **Mood**: introspective cinematic · **Setting**: leaning back-shoulder against the side glass after play · **Filter tags**: `+post-match, +editorial, +mood`
- **Beat**: athlete leans the upper back against the side glass wall, head tilted slightly back, eyes closed or looking up; racket hangs from one hand. Towel draped loosely over neck. A few breaths of recovery.
- **Camera**: 50mm, eye-level, 3/4 body crop, glass reflections framing the silhouette; soft horizontal light streaks on the glass.
- **Lighting**: warm side light + cool reflection in the glass — dual-tone cinematic rim.

---

## SQL (single migration)

One `INSERT … ON CONFLICT (scene_id) DO UPDATE` so the migration is rerunnable. All 8 rows in one statement.

```sql
INSERT INTO public.product_image_scenes (
  scene_id, title, description, prompt_template, trigger_blocks,
  category_collection, sub_category, scene_type, shot_style, subject,
  mood, setting, filter_tags,
  sort_order, sub_category_sort_order, category_sort_order,
  is_active, requires_extra_reference, use_scene_reference
) VALUES
  ('activewear-padel-glass-wall-hero',      'Padel Glass Wall Hero',     '…short copy…', $$<full prompt 1>$$, '{personDetails,sceneEnvironment,stylingDetails,visualDirection,layout}', 'activewear', 'Padel Editorial', 'editorial', 'editorial', 'with-model', 'confident editorial',  'indoor padel court behind glass wall', '{padel,glass-court,european,hero,indoor,cool}',          2545, 1, 0, true, false, false),
  ('activewear-padel-net-volley-ready',     'Padel Net Volley Ready',    '…',            $$<full prompt 2>$$, '{personDetails,sceneEnvironment,stylingDetails,visualDirection,layout}', 'activewear', 'Padel Editorial', 'lifestyle', 'lifestyle', 'with-model', 'focused athletic',     'blue padel court near the net',         '{padel,glass-court,european,blue-court,action,cool}',    2546, 2, 0, true, false, false),
  ('activewear-padel-back-glass-recovery',  'Back Glass Recovery',       '…',            $$<full prompt 3>$$, '{personDetails,sceneEnvironment,stylingDetails,visualDirection,layout}', 'activewear', 'Padel Editorial', 'lifestyle', 'lifestyle', 'with-model', 'dynamic candid',       'rear glass wall mid rally',             '{padel,glass-court,european,motion,indoor,editorial}',   2547, 3, 0, true, false, false),
  ('activewear-padel-club-bench-rest',      'Padel Club Bench Rest',     '…',            $$<full prompt 4>$$, '{personDetails,sceneEnvironment,stylingDetails,visualDirection,layout}', 'activewear', 'Padel Editorial', 'lifestyle', 'lifestyle', 'with-model', 'quiet luxury',         'courtside bench at premium padel club', '{padel,glass-court,european,rest,warm,lifestyle}',       2548, 4, 0, true, false, false),
  ('activewear-padel-clay-blue-warmup',     'Blue Court Warm-Up',        '…',            $$<full prompt 5>$$, '{personDetails,sceneEnvironment,stylingDetails,visualDirection,layout}', 'activewear', 'Padel Editorial', 'lifestyle', 'lifestyle', 'with-model', 'calm preparation',     'blue padel court baseline golden hour', '{padel,glass-court,european,warmup,golden-hour,blue-court}', 2549, 5, 0, true, false, false),
  ('activewear-padel-court-walk-entrance',  'Court Walk Entrance',       '…',            $$<full prompt 6>$$, '{personDetails,sceneEnvironment,stylingDetails,visualDirection,layout}', 'activewear', 'Padel Editorial', 'lifestyle', 'lifestyle', 'with-model', 'confident editorial walk','side door entrance into the cage',    '{padel,glass-court,european,entrance,editorial,motion}', 2550, 6, 0, true, false, false),
  ('activewear-padel-serve-prep-baseline',  'Serve Prep at Baseline',    '…',            $$<full prompt 7>$$, '{personDetails,sceneEnvironment,stylingDetails,visualDirection,layout}', 'activewear', 'Padel Editorial', 'lifestyle', 'lifestyle', 'with-model', 'composed athletic',    'padel baseline ball in hand',           '{padel,glass-court,european,serve,baseline,focused}',    2551, 7, 0, true, false, false),
  ('activewear-padel-post-match-glass-lean','Post-Match Glass Lean',     '…',            $$<full prompt 8>$$, '{personDetails,sceneEnvironment,stylingDetails,visualDirection,layout}', 'activewear', 'Padel Editorial', 'lifestyle', 'lifestyle', 'with-model', 'introspective cinematic','side glass post-match recovery',       '{padel,glass-court,european,post-match,editorial,mood}', 2552, 8, 0, true, false, false)
ON CONFLICT (scene_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  prompt_template = EXCLUDED.prompt_template,
  trigger_blocks = EXCLUDED.trigger_blocks,
  category_collection = EXCLUDED.category_collection,
  sub_category = EXCLUDED.sub_category,
  scene_type = EXCLUDED.scene_type,
  shot_style = EXCLUDED.shot_style,
  subject = EXCLUDED.subject,
  mood = EXCLUDED.mood,
  setting = EXCLUDED.setting,
  filter_tags = EXCLUDED.filter_tags,
  sort_order = EXCLUDED.sort_order,
  sub_category_sort_order = EXCLUDED.sub_category_sort_order,
  is_active = true,
  updated_at = now();
```

I'll inline the full prompt body for each scene at execution time using the skeleton above + the per-scene paragraphs in this plan, so every row ships with a complete cinematic prompt and not a placeholder.

## Build steps
1. Run the data insert above (single statement, all 8 rows).
2. Verify in DB: `SELECT scene_id, title, scene_type FROM product_image_scenes WHERE sub_category='Padel Editorial' ORDER BY sub_category_sort_order;` — expect 8 rows.
3. Open `/app/generate/product-images` → confirm the new "PADEL EDITORIAL" tab/section appears with 8 scenes (no thumbnails yet — that's expected).
4. Hand the thumbnails over to admin upload flow when ready.

## Out of scope
- Thumbnail generation/upload (admin handles via existing scene preview tools).
- Translations or copy beyond English.
- Video / Short Film variants.
- Beverages, eyewear or other category mirrors of padel.
