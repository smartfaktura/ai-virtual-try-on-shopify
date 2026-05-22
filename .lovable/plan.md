# Phase 7p — Subfamily wizard bug sweep

After Phase 7o, a closer audit surfaced 5 real bugs (3 high, 2 medium) that affect the live wizard for the currently unlocked modules (`fashion`, `footwear`, `eyewear`) and the about-to-unlock ones (`jewelry`, `watches`, `bags-accessories`, `hats-caps-beanies`).

## Bug list

### HIGH-1 — Product-only camera angles disappear when cast = none
`SCENE_EXTRAS_FIELDS` in `wizard/constants/extras.ts` flags `camera_angle_footwear`, `camera_angle_eyewear`, and `camera_angle_jewelry` with `hideWhenNoCast: true`. But these lists are FULL of product-only angles:
- footwear: `Top-down pair`, `Sole-up`, `Heel-back detail`, `Tongue close-up`, `Lace detail`, `Side profile pair`, `Stacked pair`, `Kicked-off arrangement`, `In hand offering`
- eyewear: `Top-down folded`, `Top-down open`, `Lens detail macro`, `Temple/Bridge detail macro`, `In-hand offering`
- jewelry: `Macro stone/clasp/engraving`, `Paired on tray`, `In-hand offering`, `Falling / floating`

When the user picks the very common product-hero cast (`none`), these angles vanish — exactly the moment they're most needed. Only `camera_angle_apparel` is correctly cast-only (every entry needs a person).

**Fix:** drop `hideWhenNoCast` from footwear/eyewear/jewelry camera-angle fields. Keep it on `camera_angle_apparel` only.

### HIGH-2 — `footwear/shoes` strips `full_body` body-part-focus
`PRESETS.footwear.sub.shoes` (added in 7o) sets `body_part_focus: ["feet", "detail"]`. Loafers/oxfords with a styled cast (suited man, walking corridor) absolutely want `full_body`. The parent footwear bundle correctly includes it; the sub override removes it.

**Fix:** restore `body_part_focus: ["feet", "full_body", "detail"]` on the `shoes` sub.

### HIGH-3 — Eyewear has no `hands` cast preset
`PRESETS.eyewear` declares `cast_presets: ["solo", "none"]`. But the eyewear-specific camera angles include `In-hand offering` and `On-hair pushed up` — the latter needs a person, the former needs hands. With cast=`hands` disallowed, users can never set up an "In-hand offering" eyewear shot with a hand-only crop.

**Fix:** `cast_presets: ["solo", "hands", "none"]`, keep `default_cast: "solo"`.

### MED-1 — `hats-caps-beanies` and `bags-accessories` missing forbidden-interaction rules
`combinationGuards.forbiddenInteractionsByFamily` covers beauty, food, jewelry, watches, eyewear, home, tech, wellness — but not `hats-caps-beanies` (where "using" makes no sense) nor `bags-accessories` (where "using" only fits a few subs like wallets).

**Fix:** add `case "hats-caps-beanies": return new Set(["using"]);`. Leave bags as-is (some subs do "use" e.g. opening a wallet) — instead document in the case statement.

### MED-2 — `PRESETS[...].settings` is dead data drifting from the real picker
`resolveAll().settings` is computed but never consumed by Step3 (the picker uses `getSettingPool` from `settingsBySubfamily.ts`). The Phase 7o edits to `PRESETS.footwear.sub.shoes.settings`, `hats-caps-beanies.sub.*.settings`, etc. therefore have zero UI effect — they only show up in tests. This is misleading for future maintainers and the 7o tests give a false sense of coverage.

**Fix (no behavior change):**
- Add a header comment in `categoryPresets.ts` clarifying that `settings` is descriptive only and the real picker uses `settingsBySubfamily.ts`.
- Update `wizard-polish-7o.test.ts` to assert against `getSettingPool(module, sub, sceneType)` instead of `resolveBundle().settings` for the shoes/caps/hats/beanies cases, so tests track what the UI actually shows.

## Out of scope
- Adding more subfamilies (tech sub block, wellness sub block, eyewear sunglasses/optical split) — taxonomy decision, separate phase.
- Per-subfamily narrowing of `CAMERA_ANGLES_APPAREL` (hiding "Detail — collar" for swimwear etc.) — minor cosmetic.
- Removing stale `"Tabletop surface"` strings from `SCENE_SETTINGS` and PRESETS — `SCENE_SETTINGS` is unused at runtime now too.

## Files
**Edit:** `src/features/brand-scenes/wizard/constants/extras.ts`, `src/features/brand-scenes/wizard/registry/categoryPresets.ts`, `src/features/brand-scenes/wizard/rules/combinationGuards.ts`, `src/features/brand-scenes/__tests__/wizard-polish-7o.test.ts`.
**New:** `src/features/brand-scenes/__tests__/wizard-polish-7p.test.ts` — 5 tests, one per bug, all asserting against the consumer (`applicableFieldsCtx`, `resolveAll`, `forbiddenInteractionsByFamily`, `getSettingPool`).

No DB / schema / type changes. No effect on saved scenes — only UI gating and prompt shape for new selections.
