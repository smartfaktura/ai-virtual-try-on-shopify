

## Edit Selfie/UGC scenes — remove 2, add 6 new (no previews yet)

### Scene removals
Drop these from `workflows.generation_config.variation_strategy.variations` for slug `selfie-ugc-set`:
- **Product Holding in Hand** (`holdable_only`)
- **Hands-Only Demo** (`holdable_only`)

(Keep **Unboxing Excitement** as the remaining `holdable_only` scene for non-wearing categories.)

### Scene additions (6 new, `wearable_only: true`, `aspect_ratio: 4:5`, no `preview_url` yet)

All written to match the existing quiet-luxury voice and ending with "The subject is {PRODUCT_INTERACTION}." so they obey the interaction directive.

| Label | Category | Instruction summary |
|---|---|---|
| **Modern Luxury Business Center** | Everyday Moments | Polished lobby of a contemporary business center — floor-to-ceiling glass, travertine or pale stone floors, low designer seating, soft diffused daylight bouncing off neutral surfaces. Calm, no foot traffic, no signage. Palette: warm grey, brushed bronze, off-white. |
| **Luxury Garden Walk** | Everyday Moments | Manicured private garden path — trimmed hedges, gravel walkway, soft golden-hour sun filtering through tall trees, a glimpse of a stone villa wall in the background. Palette: deep green, warm cream stone, sun-faded sand. |
| **Beach Walk** | Everyday Moments | Quiet stretch of pale sand beach in soft late-afternoon light. Calm sea horizon, gentle wind, no crowds, no umbrellas, no signage. Bare feet at the waterline framing optional. Palette: bone sand, soft cyan water, warm sun. |
| **Sunbed by the Pool** | Everyday Moments | Reclining on a luxury sunbed beside a clean infinity pool. Beige cushion, white folded towel, single ceramic glass on a side table — nothing else. Soft midday or golden-hour sun, palm shadows on travertine. Palette: travertine, cream linen, turquoise water. |
| **Natural Studio Background** | At Home | Soft, paper-textured natural studio backdrop in warm bone or oat tone. Subject lit by a single large soft window-light source from the side, gentle falloff into shadow. Clean floor, no props, no logos. Palette: bone, warm grey, soft shadow. |
| **Luxury Hotel Room** | At Home | Quiet five-star hotel suite — linen-dressed bed, oak headboard, sheer-curtained window with diffused daylight, single fresh flower on a side table. Tidy, considered, no luggage, no clutter. Palette: ivory linen, oak, warm taupe. |

All six default to `wearable_only: true` (so they show only when the user picks Wearing or a non-wearing category that has no `wearable_only` filter applied — current backend filter only excludes `holdable_only` for wearing flows; `wearable_only` scenes are shown for everything, matching today's other wearable scenes).

`preview_url` is intentionally omitted on the 6 new scenes — UI falls back to the workflow default thumbnail until you supply images. We can add them later via a one-line UPDATE per scene.

### Implementation

Single SQL migration:
1. Read current `generation_config` JSONB.
2. Filter out the two removed scenes from `variation_strategy.variations`.
3. Append the six new scene objects.
4. `UPDATE workflows SET generation_config = … WHERE slug = 'selfie-ugc-set'`.

No frontend, no edge-function, no schema change.

### Files touched
- New migration file under `supabase/migrations/`.

### Validation
- `/app/generate/selfie-ugc-set` Settings step shows 16 total scenes (was 12, −2, +6).
- "Product Holding in Hand" and "Hands-Only Demo" no longer appear.
- The 6 new scenes appear with the workflow's fallback thumbnail until preview images are uploaded.
- Picking a garment + Wearing → all six new scenes show the model wearing the product on body in the new luxury settings.

