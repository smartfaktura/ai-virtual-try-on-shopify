## Phase 7l — Review screen & legacy-field cleanup

Polish round focused on the **Review** step (Step 7) and a few residual legacy fields that survived 7i/7j/7k. The Review summary is currently stale — it reads field names the wizard no longer writes, so users see a near-empty card on every scene.

### Issues found

1. **Step5Review summary is broken.** It reads legacy keys that are never set:
   - `base.aesthetic` (replaced by `base.scene_type`)
   - `base.mood`, `base.lighting`, `base.framing` (replaced by `brand_voice` + extras `light_direction` / `light_quality` + extras `composition_energy`)
   - `base.time_of_day` (legacy 4-bucket; replaced in 7k by `extras.time_of_day_detail`)
   - Doesn't surface any of the Stage C extras (backdrop, floor, motion, camera angle, storytelling moment, ethnicity, build, hair, makeup, skin, pose, gaze, group dynamic, hands-on-product, body-part focus, action, gender, age, vibe).
2. **`BrandSceneBaseAnswers.scene_type` union still includes `"tabletop"`** even though Phase 7i removed that scene type from the picker. Lingering ghost option in the type contract.
3. **assembleSceneDirective duplicates time-of-day.** It still emits `Time of day: ${base.time_of_day}.` AND the extras loop emits `Time: ${extras.time_of_day_detail}.`. With 7k the UI only writes the latter, but any stale data hits both paths and the prompt gets two conflicting time lines.

### Fixes

**`src/features/brand-scenes/wizard/steps/Step5Review.tsx`** — rewrite `SummaryCard`:
- Group rows into 4 buckets shown as small sub-headers: **Scene**, **Look & light**, **Cast**, **Output**.
- Pull from the canonical sources only:
  - Scene → family, sub-family, scene_type (humanized), setting, weather, season, prop_density label.
  - Look & light → brand_voice, aesthetic_era, realism, palette (custom or preset label), finish, color_contrast, saturation, backdrop_type, backdrop_color, floor, time_of_day_detail, light_direction, light_quality, motion, composition_energy, camera_angle, crop_safety.
  - Cast → preset label, gender (joined), age (joined), vibe, interaction, action, group_dynamic, gaze, body_part_focus, hands_on_product, wardrobe_color, plus extras: ethnicity, build, pose_energy, skin_finish, hair, makeup, swim_styling, wetness, lingerie_layer, storytelling_moment.
  - Output → scale preset, exact dimensions (if any), aspect ratio (4:5 locked), reference intent (if reference flow).
- Each bucket renders only the rows that have a value. Empty buckets are hidden entirely.
- Truncate long values at 80 chars with `…` to keep the 2-col grid tidy.

**`src/features/brand-scenes/types.ts`** — drop `"tabletop"` from the `scene_type` union.

**`src/features/brand-scenes/prompt/assembleSceneDirective.ts`** — remove the legacy `Time of day: ${base.time_of_day}.` line; `extras.time_of_day_detail` is the single source of truth.

**Tests** — new `review-summary-7l.test.ts` covering:
- Summary renders the new scene_type label (not legacy aesthetic).
- `extras.time_of_day_detail` flows into the Look & light bucket.
- Empty buckets (e.g. no cast on a product-hero scene) are omitted.
- Assembler no longer emits two time-of-day lines when `time_of_day_detail` is set.

### Files
- **Edited**: `wizard/steps/Step5Review.tsx`, `types.ts`, `prompt/assembleSceneDirective.ts`.
- **New**: `__tests__/review-summary-7l.test.ts`.

No DB / schema / generation behavior changes. Existing scenes keep loading; stale `base.time_of_day` values are just ignored in the prompt now.
