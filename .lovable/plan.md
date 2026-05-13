## Goal

Rewrite all 8 padel scenes as **simple, Instagram-style outdoor luxury padel club** moments. Match the reference photos: bright natural daylight, real outdoor courts (not enclosed cinematic cages), hard sun shadows OK, casual influencer poses, no towels, no cinematic / film grade, correct padel grip and racket use.

## Reference direction

From the uploaded images:
- Outdoor courts at premium clubs (open sky, trees/palms behind glass, daylight)
- Confident-but-casual poses: composed at the net, sitting on turf or deck chair, standing with racket at side, candid laugh shielding sun
- Natural midday or late-afternoon sun, real hard shadows on court surface
- Clean styling: white/cream/pastel kit, low socks, white court shoes, optional sunglasses or wristband
- Plain phone-shot energy — no haze, no rim light, no cinematic chiaroscuro, no atmospheric beams

## Scope

8 scenes in `product_image_scenes` (`activewear-padel-*`). Single SQL migration updates `prompt_template` and `mood`. Triggers, sort order, scene_id, title, category, `is_active`, and `preview_image_url` untouched.

## New unified aesthetic (applied to every prompt)

- **Setting:** Outdoor padel court at a premium club. Open sky visible above the cage, palms / trees / clubhouse architecture behind the glass. Real blue or terracotta court, crisp white lines.
- **Light:** Bright natural daylight (late-morning or golden-hour). Hard sun shadows on the court are welcome. No sodium lights, no tungsten, no haze, no two-zone chiaroscuro.
- **Camera:** 35mm or 50mm, true-to-life color, gentle modern Instagram grade. No film grain, no lifted blacks, no desaturated greens.
- **Mood:** Off-duty padel-girl influencer. Natural, candid, fashion-aware. Soft confident half-smile or playful candid expression. Not stoic athlete, not cinematic.
- **Styling:** Refined padel kit (tank/dress + skort, low white socks, white court shoes). Optional sunglasses, cap/visor, dainty jewelry, small wristband.
- **Padel correctness:** Padel racket only when the action calls for it; correct grip; ball only in serve/ready scenes; no tennis-style strokes.
- **Closing line:** "feels like a candid Instagram moment from a sunlit outdoor padel club — natural daylight, real shadows, off-duty influencer ease, fashion-forward but never cinematic."

## Per-scene rewrite (pose intent + what changes)

1. **Padel Glass Wall Hero** — Standing relaxed against outdoor cage, racket in one hand at side, free hand on hip or brushing hair. Soft confident look to camera. 50mm 3/4-body. Sunny outdoor club.
2. **Padel Net Volley Ready** — Composed at the net, padel racket held in correct two-hand ready position, focused-but-soft expression, midday sun, hard court shadows.
3. **Back Glass Recovery** — Mid-rally pivot near the back glass, **outdoor** court, bright daylight bouncing off glass, joyful athletic energy — no sodium spill, no haze.
4. **Padel Club Bench Rest** — Seated on a wooden deck chair / courtside bench at the outdoor club (à la reference image 3), one leg crossed, sunglasses, candid soft smile, racket resting against chair. **No towel, no bottle prop required.**
5. **Blue Court Warm-Up** — Standing on outdoor blue court doing a relaxed arm-across-chest stretch, **no racket**, even soft daylight, calm warmup vibe.
6. **Court Walk Entrance** — Walking onto an outdoor court through the cage door mid-stride, racket in one hand, daylight, casual confident entrance. **No towel.**
7. **Serve Prep at Baseline** — Composed pre-serve at the baseline of an outdoor court, padel racket in dominant hand, ball in non-dominant palm at hip, calm focused half-smile, natural sun.
8. **Post-Match Glass Lean** — Leaning back/shoulder against the outdoor cage glass after the match, racket hanging loose at side, contemplative warm half-smile, golden post-match daylight, palms/trees visible behind. **No towel.**

## Implementation

Single `supabase--migration` (8 UPDATE statements). After it runs, ask the user to regenerate **Padel Glass Wall Hero** and **Padel Club Bench Rest** first to validate the new direction before doing the full set.

## Out of scope

- Preview thumbnails (existing `preview_image_url` retained; user can refresh in admin later).
- Frontend, scene picker, category logic.
- Any non-padel scenes.
