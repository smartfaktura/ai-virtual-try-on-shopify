## Phase 7i — Wizard polish: subcategory-aware cast, cleaner pills, scroll fix, remove flat-lay

Targeted fixes for the 6 issues you flagged. No new big features — just tighten what's there.

### 1. Swimwear cast styling — no extra clothing options
- In `extras.ts`, scope `OUTFIT` / clothing-related cast pills (anything that suggests layering, jackets, etc.) so they **do not render when `sub_family === 'swimwear'`** (also `lingerie`).
- Replace with a small swimwear-relevant block: `swim_styling` (one-piece / bikini / surf shorts / cover-up over) and `wetness` (dry / damp / freshly out of water). Same pattern for lingerie (`lingerie_layer`: bare / robe open / sheet draped).
- Anything not relevant to the chosen sub-family is hidden, not just greyed.

### 2. Age band shown twice
- Audit: `AGE_BANDS` is currently rendered both in `Step3BaseAnswers` (cast extras spillover) and in `Step4Cast`. Keep it **only in Step 4 (Cast)** and remove from Step 3.
- Same audit pass for `build`, `ethnicity`, `pose_energy`, `skin_finish`, `hair`, `makeup` — these are cast fields, must appear once.

### 3. Ethnicity pills unclear
- Replace the current label-only chips with a clearer two-line chip: bold label + one-line example (e.g. "Pan-European — Northern + Mediterranean", "Globally diverse — mixed casting"). 
- Rename "As-cast" → "Match my model" (clearer when a brand model is attached).
- Add a tiny "Why?" tooltip explaining this is a styling hint, not a hard cast.
- Reorder so the most-used options ("Match my model", "Globally diverse", "Mixed-heritage") sit first.

### 4. Storytelling moments not related to subcategories
- Today `STORYTELLING_MOMENT` is one global list. Replace with a per-sub-family map in a new `storytellingBySubfamily.ts`:
  - Swimwear: "Stepping out of water", "Lounging poolside", "Toweling off", "Walking the shoreline".
  - Jackets: "Zipping up", "Collar pop", "Walking into cold", "Hands in pockets".
  - Dresses: "Twirl", "Adjusting strap", "Mid-step entrance", "Sitting elegantly".
  - Activewear: "Warm-up", "Mid-rep", "Cooldown stretch", "Post-sweat".
  - Footwear: "Lacing up", "Mid-stride", "Kicked off", "Stepping onto curb".
  - Bags: "Pulling from shoulder", "Setting down", "Reaching inside", "Carrying through street".
  - Eyewear: "Putting on", "Pushing up into hair", "Lowering for glance".
  - Watches/Jewelry: "Clasping", "Checking time", "Adjusting on wrist".
  - Fragrance/Beauty: "Spraying", "Applying", "Smelling wrist", "Tipping bottle".
  - Food/Beverages: "Pouring", "First sip", "Plating", "Sharing".
  - Fallback to a short generic list only when no map entry exists.

### 5. "Next step" scrolls down
- Fix in `BrandSceneWizard.tsx` / `WizardLayout.tsx`: on step change, `window.scrollTo({ top: 0 })` AND reset the wizard scroll container to `scrollTop = 0`. Use a ref on the scroll container and a `useEffect([step])`.
- Also remove any `autoFocus` on first input that is below the fold (autofocus is what drags the page down).

### 6. Remove tabletop / flat-lay scene type entirely
- Drop `tabletop` from `SCENE_TYPES` in `settingsBySubfamily.ts`.
- Remove `tabletop` pools across all sub-families; redistribute meaningful settings into `studio` or `indoor_lifestyle` where they still make sense.
- Remove `camera_angle_tabletop` field from `extras.ts` and its preset list; absorb the still-useful angles (Top-down 90°, 45° hero, Pour, Splash) into `CAMERA_ANGLES_GENERAL`.
- Remove the tabletop soft-warning rule.
- Update tests: `setting-pools-coverage.test.ts` no longer expects tabletop entries.

### Files

**Edited**
- `src/features/brand-scenes/wizard/constants/extras.ts` — sub-family scoping for cast/clothing fields; remove tabletop angle field; remove Age/Build/Ethnicity/etc. from scene scope.
- `src/features/brand-scenes/wizard/steps/Step3BaseAnswers.tsx` — drop duplicated cast fields; render new sub-family styling block; pull storytelling from new map.
- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` — owns Age band / Ethnicity / etc. only; new clearer ethnicity chip component.
- `src/features/brand-scenes/wizard/registry/settingsBySubfamily.ts` — remove `tabletop` scene type and pools.
- `src/features/brand-scenes/wizard/rules/sceneRules.ts` — remove tabletop warning.
- `src/features/brand-scenes/wizard/BrandSceneWizard.tsx` + `WizardLayout.tsx` — scroll-to-top on step change.
- `src/features/brand-scenes/prompt/assembleSceneDirective.ts` — render new swim/lingerie styling + per-subfamily storytelling fields.

**New**
- `src/features/brand-scenes/wizard/registry/storytellingBySubfamily.ts` — sub-family → moments list + fallback.
- `src/features/brand-scenes/wizard/components/EthnicityChip.tsx` — two-line chip with tooltip.
- Tests: `subfamily-styling-scope.test.ts` (swimwear doesn't show coats), `cast-fields-single-source.test.ts` (Age band only in Step 4), `storytelling-by-subfamily.test.ts`.

### Out of scope
- No taxonomy changes; no new categories.
- No backend, billing, or prompt-engine rewrites.
- Keep freedom-first: nothing hard-blocked, all sub-family scoping just hides irrelevant fields.

### Test plan
- All 131 existing tests stay green (tabletop assertions updated).
- New tests verify: no duplicate cast fields, swimwear hides coat/jacket layering, every onboarding sub-family resolves to ≥3 storytelling moments, scroll resets on step change (jsdom scrollTo spy).
