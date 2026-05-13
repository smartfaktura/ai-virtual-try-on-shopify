## Goal

Replace the current padel scene prompts (which read as heavy cinematic film — sodium/teal chiaroscuro, hard backlight, atmospheric haze, lifted-black filmic grade) with a **fashion-forward, organic, beautiful influencer** aesthetic. Think: contemporary tennis/padel girl on Instagram — bright natural daylight, soft modern color, clean editorial styling, candid energy, premium but airy.

## Scope

8 scenes in `product_image_scenes` (all `category_collection = 'activewear'`, `scene_id` prefix `activewear-padel-*`):

1. `activewear-padel-glass-wall-hero` — **rebuild from scratch** (user asked for completely new scene)
2. `activewear-padel-net-volley-ready`
3. `activewear-padel-back-glass-recovery`
4. `activewear-padel-club-bench-rest` — no towel
5. `activewear-padel-clay-blue-warmup` — no racket
6. `activewear-padel-court-walk-entrance`
7. `activewear-padel-serve-prep-baseline`
8. `activewear-padel-post-match-glass-lean` — no towel

No DB schema changes. No frontend changes. Only `prompt_template` (and `mood` to match the new direction) updated via SQL.

## New aesthetic direction — applied uniformly

Each prompt keeps the existing structure (identity anchor, product anchor, scene name, action, styling, location, framing, light recipe, fabric physics, photo style, closing line) but swaps the cinematic-film direction for a fashion-influencer direction:

- **Mood / tone**: confident, playful, sun-kissed, organic, fashion-forward, "off-duty padel girl" energy. Beautiful influencer presence — natural smile or soft confident expression, not stoic athlete.
- **Light**: bright natural daylight (golden-hour or soft midday), large soft sources, gentle warm key + clean ambient fill. No hard sodium/cyan two-zone chiaroscuro, no atmospheric haze beams, no tungsten arena lights.
- **Color story**: clean modern palette — sun-warmed whites, fresh court blues/clays, soft sage and sand neutrals, crisp shadows. Vibrant but elegant.
- **Camera & grade**: 35mm or 50mm editorial lens, true-to-life color, gentle contrast, **clean modern fashion grade** (subtle warmth, slight matte, *no* heavy film grain, *no* lifted blacks, *no* desaturated greens).
- **Styling**: same elevated padel kit (refined court shoes, low socks, optional minimal visor/cap/wristband/sunglasses) but lean into "fashion-aware influencer" — tonal pastels, modern minimalism, optional small gold studs / dainty necklace where appropriate.
- **Closing line**: "feels organic, fashion-forward, sun-kissed, and effortlessly premium — a beautiful padel-girl moment captured with contemporary fashion editorial taste."

## Per-scene action notes (preserve existing pose intent, refresh execution)

- **Padel Glass Wall Hero (rebuilt)** — Hero portrait against the glass wall. Athlete leans one shoulder lightly into the glass, racket held casually low at her side, free hand brushing hair behind ear or resting on hip. Soft confident half-smile to camera. Golden-hour sun rakes through the cage from camera-left, glass picks up clean white-and-blue reflections of the court. 50mm, 3/4-body, eye-level, shallow DOF. Editorial influencer hero.
- **Padel Net Volley Ready** — Athletic ready stance at the net, racket up; bright daylight, candid focused expression with a hint of smile.
- **Back Glass Recovery** — Mid-rally pivot; replace the hard backlight + sodium spill with bright open daylight bouncing off the back glass, soft motion, energetic and joyful.
- **Padel Club Bench Rest** — Seated bench, stainless bottle in hand, **no towel anywhere**. Soft daylight on a wooden courtside bench, relaxed influencer-on-break energy.
- **Blue Court Warm-Up** — Arm-across-chest stretch on baseline, **absolutely no racket** anywhere in frame. Replace the side-door amber shaft with even soft late-afternoon daylight, warm but not chiaroscuro.
- **Court Walk Entrance** — Walking through the side door mid-stride, racket in one hand, towel kept (only remove towels where explicitly requested). Bright natural exterior + clean cage interior, no two-zone tungsten chiaroscuro.
- **Serve Prep at Baseline** — Composed pre-serve stance, racket and ball in hands, soft natural sun, calm confident expression.
- **Post-Match Glass Lean** — Back/shoulder leaning on the glass after the match, **no towel**. Racket hanging loose. Golden post-match daylight, reflective glass, contemplative-but-warm influencer look.

## Implementation

Single `supabase--migration` (UPDATE statements) that rewrites `prompt_template` and updates `mood` for each of the 8 scenes. All triggers (`{{productName}}`, `[MODEL IMAGE]`, `[PRODUCT IMAGE]`) preserved. No category, sort_order, scene_id, title, or trigger_blocks changes. `is_active` untouched.

After the migration runs, ask the user to regenerate one or two padel scenes to validate the new look before regenerating the rest.

## Out of scope

- Preview thumbnails — existing `preview_image_url` stays; user can refresh thumbnails later via admin if desired.
- Frontend / category logic / scene picker UI.
- Other (non-padel) tennis or court scenes.
