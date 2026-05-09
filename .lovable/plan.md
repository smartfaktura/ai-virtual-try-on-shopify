## Add Wedding Dress category + 6 bridal editorial scenes

Create a new standalone collection `wedding-dress` in `product_image_scenes` with 6 with-model bridal editorial scenes (personDetails trigger active), and wire `wedding-dress` into the product detection logic so it surfaces as its own category.

### 1. Database — insert 6 scenes

Single SQL `INSERT INTO product_image_scenes (...) VALUES (...) x6;`

**Common fields (all 6):**
- `category_collection`: `wedding-dress`
- `sub_category`: `Bridal Editorial`
- `is_active`: `true`
- `subject`: `with-model`
- `shot_style`: `editorial`
- `scene_type`: `lifestyle`
- `requires_extra_reference`: `false`
- `use_scene_reference`: `false`
- `preview_image_url`: `null` (admin uploads later)
- `trigger_blocks`: `['personDetails']`
- `sub_category_sort_order`: 1–6
- `category_sort_order`: 0
- `sort_order`: 3000–3005

**The 6 scenes:**

| scene_id | Title | Setting / moment |
|---|---|---|
| `wedding-dress-chapel-altar` | Chapel Altar | Standing at stone chapel altar, soft window light from side, candles in background |
| `wedding-dress-garden-veil` | Garden Veil | Walking through formal garden, veil catching breeze, dappled afternoon light |
| `wedding-dress-grand-staircase` | Grand Staircase Descent | Mid-step descending marble staircase, hand on banister, train flowing behind |
| `wedding-dress-beach-golden-hour` | Beach Golden Hour | Standing on quiet sandy shore at sunset, hem brushing wet sand, hair moving in light wind |
| `wedding-dress-ballroom-portrait` | Ballroom Portrait | Centered in classical ballroom, chandelier overhead, candid look to camera, long exposure stillness |
| `wedding-dress-train-walk-away` | Train Walk Away | Back-of-dress hero shot, walking away through hallway/aisle, full train trailing, dramatic depth |

**Per-scene content:**
- **prompt_template** — bridal editorial framing using `[MODEL IMAGE]` + `[PRODUCT IMAGE] {{productName}}`. Emphasises the dress as hero (silhouette, fabric movement, lace/satin/tulle texture). Calm, refined, never overproduced.
- **outfit_hint** — bridal-only OUTFIT STYLING DIRECTION: hair styled (low chignon, soft waves, or veil-integrated updo) tuned to the scene; minimal jewellery (pearl drop earrings or thin diamond studs); natural luminous makeup; classic bridal bouquet appropriate to setting (white/cream/blush). Guardrails: no streetwear, no loud accessories, no fashion sneakers, dress remains hero, no graphic patterns added.
- **suggested_colors** — null (palette is bridal whites/ivories driven by the actual product).

### 2. Detection — `src/lib/categoryUtils.ts`

- Add new detection rule **above** the generic `garments` block:
  - keywords: `['wedding dress', 'bridal gown', 'bridal dress', 'wedding gown', 'bridesmaid dress', 'bridal']`
  - category: `'wedding-dress'`
- Add label entry: `'wedding-dress': 'Wedding Dress'`

### 3. Type — `src/types/index.ts`

- Extend `TemplateCategory` union with `| 'wedding-dress'`.

### 4. Visual library deep link (optional but consistent)

- In `src/lib/visualLibraryDeepLink.ts`, add `'wedding-dress': { family: 'fashion', collection: 'wedding-dress' }` so a `/ai-product-photography/wedding-dress` slug routes correctly if/when one is added. Skip if not needed yet.

### Notes / out of scope
- No frontend tab/admin UI changes required — `category_collection` is data-driven and will appear automatically.
- Preview thumbnails uploaded later via Admin Bulk Preview Upload.
- No SEO landing page added (separate request).
