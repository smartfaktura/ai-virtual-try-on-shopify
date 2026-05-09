Replace all 6 wedding-dress scenes with modern atelier/studio aesthetics — keep the structure (full-body bridal hero, dress accuracy directives, camera spec) but swap the wedding-photoshoot settings (chapel, garden, staircase, beach, ballroom) for contemporary studio environments. Existing previews stay until you regenerate them.

New 6 scenes (titles, sub_category stays "Bridal Editorial"):

1. **Concrete Plinth** (`wedding-dress-chapel-altar` → retitled "Concrete Plinth")
   - Polished microcement floor, large warm-grey concrete wall, single soft window light from camera-left
   - Model standing centered, three-quarter body angle, train pooled on the concrete floor
   - 50mm, f/2.8, eye-level, brutalist minimal mood

2. **Atelier Mirror** (`wedding-dress-garden-veil` → retitled "Atelier Mirror")
   - Modern bridal atelier: pale oak floor, full-length antique brass mirror, neutral linen drapery in background
   - Model captured in a quiet fitting moment, reflection visible at edge, soft tulle/veil draped over a wooden stool
   - Diffused north-window daylight, warm shadow falloff

3. **Sculpture Studio** (`wedding-dress-grand-staircase` → retitled "Sculpture Studio")
   - High-ceiling concrete studio, plaster-finished walls, single tall industrial window
   - Model on a low travertine block, train cascading off the platform like drapery on a sculpture
   - Cinematic side light, deep shadow on opposite side, gallery-like calm

4. **Seamless Bone** (`wedding-dress-beach-golden-hour` → retitled "Seamless Bone")
   - Pure seamless paper backdrop in warm bone/ivory, raw concrete floor beneath
   - Full-length editorial pose, train fanned forward on the floor
   - Two soft strip-box lights, gentle gradient on backdrop, quiet luxury campaign feel

5. **Linen Curtain Studio** (`wedding-dress-ballroom-portrait` → retitled "Linen Curtain Studio")
   - Soft floor-to-ceiling raw linen curtain backdrop, warm concrete floor
   - Model standing relaxed, hands at sides, full silhouette of gown isolated against the curtain
   - Large diffused softbox front-left, subtle wind movement on tulle/veil

6. **Atelier Walk Away** (`wedding-dress-train-walk-away` → keep concept, restage)
   - Modern atelier interior, polished concrete floor reflecting train
   - Model walking away from camera, full back of dress and train as the hero
   - Cool north-window daylight from the right, minimalist gallery mood

Implementation:

- Single `UPDATE` per scene on `product_image_scenes` modifying `title`, `description`, and `prompt_template`. Each new prompt keeps:
  - `[MODEL IMAGE] wearing [PRODUCT IMAGE] {{productName}}`
  - "wedding dress is the absolute hero of the frame"
  - The closing "Render the dress with photographic accuracy…" directive
  - Aspect ratio guidance (4:5 portrait via existing scene_type)
- `scene_id`, `sort_order`, `category_collection`, `sub_category`, `trigger_blocks` (`personDetails`, `outfitConfig`, etc.), and previews stay untouched.
- No frontend changes needed — these are DB-only updates via the data tool.

After update, the preview thumbnails will still show the old wedding-photoshoot images until you regenerate them in the admin Scene Previews tool — call that out to the user.