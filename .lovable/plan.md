## Add 3 new Tennis Editorial scenes

Insert 3 new scenes into `product_image_scenes` under `category_collection = 'activewear'` / `sub_category = 'Tennis Editorial'`. Tone is **natural lifestyle** (less posed than the existing baseline/warm-up scenes), all with model, each on a different surface.

### New scenes

| scene_id | Title | Surface | Mood | scene_type |
|---|---|---|---|---|
| `activewear-tennis-clay-natural-rally` | Clay Court Between Points | European red clay | Candid, sun-warm, breathable | lifestyle |
| `activewear-tennis-hard-court-blue-stride` | Blue Hard Court Stride | Blue acrylic hard court (US Open style) | Crisp, focused, modern | lifestyle |
| `activewear-tennis-grass-court-natural` | Grass Court Morning | Manicured grass court (Wimbledon style) | Soft, classic, fresh morning | lifestyle |

### Common fields for all 3
- `category_collection`: `activewear`
- `sub_category`: `Tennis Editorial`
- `is_active`: `true`
- `subject`: `with-model`
- `shot_style`: `lifestyle`
- `requires_extra_reference`: `false`
- `use_scene_reference`: `false`
- `preview_image_url`: `null` (admin can upload later)
- `sort_order`: 2539, 2540, 2541 (after existing 2538)
- `sub_category_sort_order`: continues sequence
- `filter_tags`: `['tennis', surface tag, 'natural', 'lifestyle']`

### Per-scene content

Each gets:
- **prompt_template** — natural candid framing: walking back to baseline, towel-wipe, ball-bounce-before-serve, drink break by bench, etc. Uses `[MODEL IMAGE]` + `[PRODUCT IMAGE] {{productName}}`. Mirrors the writing pattern of `activewear-clay-court-warmup` but with a more relaxed, in-between-moment vibe (not posed editorial).
- **outfit_hint** — full OUTFIT STYLING DIRECTION block:
  - **Clay**: white/cream tennis shoes with clay dust, low socks, optional visor/wristband, palette = white/cream/clay terracotta/forest green
  - **Blue hard**: clean modern hard-court tennis shoes (herringbone outsole), white/black low socks, optional cap or headband, palette = white/black/cobalt accents/grey
  - **Grass**: classic white grass-court shoes (smooth outsole), pristine white socks, optional white visor/headband, palette = pure white/cream/soft green/navy trim — quiet Wimbledon classic
  - All include guardrails: no fashion sneakers, no streetwear, no loud branding, racket must look like a real performance racket, hero stays the product
- **suggested_colors** — null (outfit_hint already drives palette)
- **subject** = `with-model`, **setting** describes the court, **mood** matches the scene

### Implementation
Single SQL migration: `INSERT INTO product_image_scenes (...) VALUES (...), (...), (...);` — three rows, one per surface.

### Verification
After migration, query the Tennis Editorial sub_category to confirm 3 new rows exist with correct sort_order and outfit_hint populated. Admin can upload preview images via the existing scene preview override flow.

### Notes
- No frontend code changes needed — scenes are data-driven and will appear automatically in the Tennis Editorial sub-category for activewear products.
- Preview thumbnails will be empty until uploaded via admin (consistent with how existing scenes were seeded).
