## Phase 7k — wizard polish round (post-7j)

Quick targeted polish on issues found while re-reading the wizard files. All changes are UI/UX/data-only — no schema or generation changes.

### Issues found

1. **Duplicate "Time of day"** — Step 3 has both a top-level "Time of day" (morning/midday/evening/night) and a Stage C → Light & time → "Time of day (detail)" (14 options). Two fields setting different state keys silently disagree.
2. **`STORYTELLING_MOMENT` generic list bleeds into prompt** when sub-family has no entry. The field's static `presets` is the 10-item generic list; Step4Cast resolves per-subfamily but the FALLBACK (no entry) returns a 4-item GENERIC array that doesn't match the field's `presets`. Result: inconsistent fallback.
3. **Dead code** — `CAMERA_ANGLES_TABLETOP` is exported but no longer referenced (tabletop scene type removed). Comment in `SceneTypePicker.tsx` still says "6 scene-type cards" (now 5).
4. **`BUILDS` includes "Mixed"** — only meaningful for two/group cast, but shown for solo too.
5. **Hardcoded sub-family exclusion** in Step4Cast for wardrobe color anchor (`subFamily !== "swimwear" && subFamily !== "lingerie"`) — bypasses the `subFamilyExcept` pattern used everywhere else.
6. **Body-part focus shown for `hands` cast** — redundant: the cast IS the body part. Should hide.
7. **Ethnicity value `"As-cast"` stored verbatim** — prompt assembler outputs literal "Ethnicity: As-cast" which is jargon. Should store a friendlier phrase like "Match the attached brand model".
8. **EthnicityChips mobile layout** — at 440px viewport, `min-w-[140px]` 2-line cards wrap to one chip per row with awkward gaps. Switch to a proper 2-col grid on mobile.
9. **Inconsistent section header style** — "More cast & styling dials" header in Step4Cast uses different opacity/spacing vs "Stage C · More creative dials" in Step3.
10. **"Crop-safe zones (for copy)" jargon** — "Center-safe (1:1 sibling)" is opaque to non-tech users.
11. **`storytelling_moment` field `castOnly` includes `hands`** but Step4Cast hides it for hands when no explicit moments — the field-level filter should also drop hands for sub-families without a "hands-friendly" moments list, so logic isn't split between two places.

### Fixes

**`extras.ts`**
- Remove `CAMERA_ANGLES_TABLETOP` export (dead).
- Replace `STORYTELLING_MOMENT` static list with the same short generic fallback used by the resolver; export it from `storytellingBySubfamily.ts` only.
- Add `subFamilyExcept` slot to wardrobe_color (Phase 7l) — actually wardrobe_color isn't in extras (it's hardcoded). Instead, move the swimwear/lingerie exclusion out of Step4Cast and into a small helper.
- Replace "Center-safe (1:1 sibling)" with "Center-safe (works for square crop)".
- Add helper `buildsForCast(cast)` returning BUILDS without "Mixed" for solo.

**`Step3BaseAnswers.tsx`**
- Remove the top-level "Time of day" section (4 buckets); rely on Stage C → Light & time → "Time of day (detail)". When the legacy 4-bucket value exists, migrate-on-render to seed `extras.time_of_day_detail`.

**`Step4Cast.tsx`**
- Hide "Body-part focus" when preset === "hands".
- Use `subFamilyExcept` data instead of inline string compare for the wardrobe color anchor.
- Use `buildsForCast` for the build pills.
- Align "More cast & styling dials" header markup with Stage C version (same `pt-2 border-t` framing).

**`EthnicityChips.tsx`**
- Change "As-cast" stored value to `"Match the attached brand model"` so the prompt reads cleanly.
- Replace `flex-wrap min-w-[140px]` with `grid grid-cols-2 sm:grid-cols-3` so mobile shows a clean 2-up grid.

**`SceneTypePicker.tsx`**
- Update stale comment ("6 scene-type cards" → "5").

**Tests**
- Add `wizard-polish-7k.test.ts` covering: no duplicate time-of-day field, BUILDS for solo omits "Mixed", ethnicity "Match my model" stores friendly string, CAMERA_ANGLES_TABLETOP export removed.
- Keep all 136 existing tests green.

### Files
- **Edited**: `constants/extras.ts`, `steps/Step3BaseAnswers.tsx`, `steps/Step4Cast.tsx`, `components/EthnicityChips.tsx`, `components/SceneTypePicker.tsx`, `registry/storytellingBySubfamily.ts` (export shared generic list).
- **New**: `__tests__/wizard-polish-7k.test.ts`.

No backend, schema, or prompt-assembler changes. Freedom-first preserved — all warnings stay soft, no new gates.
