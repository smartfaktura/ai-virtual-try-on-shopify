## Add 4 more natural Tennis Editorial scenes (with model)

Insert 4 more scenes into `product_image_scenes` under `category_collection='activewear'` / `sub_category='Tennis Editorial'`. All include the `personDetails` trigger (so the user gets the model + visible-person controls activated automatically), plus the natural lifestyle tone of the previous batch. Spread evenly across the three surfaces.

### New scenes

| scene_id | Title | Surface | Natural moment | sort_order |
|---|---|---|---|---|
| `activewear-tennis-clay-bench-rest` | Clay Court Bench Rest | European red clay | Sitting on courtside bench, towel over shoulder, water bottle in hand, racket leaning beside | 2542 |
| `activewear-tennis-hard-court-blue-serve-prep` | Blue Hard Court Serve Prep | Blue acrylic hard court | Standing at baseline bouncing the ball before serve, focused gaze down, racket loose at side | 2543 |
| `activewear-tennis-grass-court-volley-ready` | Grass Court Volley Ready | Manicured grass court | Slight crouch at the net, racket up in volley-ready stance, soft morning light | 2544 |
| `activewear-tennis-clay-walk-off` | Clay Court Walk Off | European red clay | Walking off court toward camera, racket cover in hand, golden late-afternoon light, candid stride | 2545 |

### Common fields (all 4)
- `category_collection`: `activewear`
- `sub_category`: `Tennis Editorial`
- `is_active`: `true`
- `subject`: `with-model`
- `shot_style`: `lifestyle`
- `scene_type`: `lifestyle`
- `requires_extra_reference`: `false`
- `use_scene_reference`: `false`
- `preview_image_url`: `null` (admin can upload later)
- `sub_category_sort_order`: continues sequence (9–12)
- **`trigger_blocks`: `['personDetails']`** ← person trigger activated
- `filter_tags`: `['tennis', surface tag, 'natural', 'lifestyle']`

### Per-scene content
Each gets:
- **prompt_template** — natural candid framing for that specific moment, using `[MODEL IMAGE]` + `[PRODUCT IMAGE] {{productName}}`. Mirrors the writing style of the previous 3 (Clay Between Points, Blue Hard Court Stride, Grass Court Morning) — natural, in-between-moment energy, never posed editorial.
- **outfit_hint** — full OUTFIT STYLING DIRECTION block tuned to the surface, identical palette logic to the prior batch:
  - **Clay (bench rest, walk off)**: white/cream tennis shoes with clay dust, low socks, optional visor/wristband — palette = white/cream/clay terracotta/forest green
  - **Blue hard (serve prep)**: clean modern hard-court tennis shoes (herringbone outsole), white/black low socks, optional cap or headband — palette = white/black/cobalt accents/grey
  - **Grass (volley ready)**: classic white grass-court shoes (smooth outsole), pristine white socks, optional white visor/headband — palette = pure white/cream/soft green/navy trim
  - All include guardrails: no fashion sneakers, no streetwear, no loud branding, racket must be a real performance racket, hero stays the product
- **suggested_colors** — null (outfit_hint drives palette)

### Implementation
Single SQL `INSERT INTO product_image_scenes (...) VALUES (...), (...), (...), (...);` — four rows.

### Notes
- No frontend code changes needed; scenes are data-driven.
- Preview thumbnails empty until uploaded via admin (consistent with prior batch).
- After this, Tennis Editorial will have 9 scenes total (5 original + 3 prior natural + 4 new).
