# Phase 7g — Wizard Logic Polish (Freedom-First)

Your answers set the tone: **no hard blocks, no forced couplings, custom inputs everywhere, auto-fills are recommendations not locks.** This phase fills the remaining logic gaps under those rules.

## 1. Blind spots found in current wizard

After auditing `extras.ts`, `sceneRules.ts`, `settingsBySubfamily.ts`, and per-module schemas:

**Sub-families with no dedicated pool (fall through to generic GLOBAL):**
- Jewelry: rings / necklaces / earrings / bracelets
- Hats, caps & beanies — no on-head vs flat-lay split
- Tech devices — no desk / hand / lifestyle split
- Home furniture (only `home-decor` covered)
- Food: snacks-food, food — only `beverages` covered
- Watches — only tabletop; missing on-wrist lifestyle
- Bags: wallets, belts, scarves
- Fashion: jeans, hoodies, garments
- Beauty: makeup-lipsticks variants

**Logic inconsistencies:**
- `scene_type` is in schema but Step 3 never renders it as Stage A (SmartSettingCard exists but isn't wired)
- `setting` field exists but no Stage B UI surfaces it
- Cascades fire but cleared values lose the recommendation — no way to re-apply
- Backdrop two-tone / gradient colors are raw free strings — no swatch picker
- `studio_fx` rule requires `weather` first, but `weather` is hidden in studio → dead-end
- Custom "+ Add your own" only exists on pill fields, not on settings or colors
- `nextDisabledReason` doesn't mention Stage A / B requirements

## 2. What gets built

### A. Wire the 3-stage flow into Step 3
- `Step3BaseAnswers.tsx` renders **Stage A — Scene Type** (6 cards), then **Stage B — Setting** (chips from `getSettingPool` + "Add your own" input), then **Stage C — Dials**.
- Soft empty-states (no hard gate, matching your "allow freely" preference) — Stages B and C render explanatory placeholders until the prereq is chosen.
- Custom setting input writes free text to `base.setting` and shows a subtle "custom" badge.

### B. Recommendation system (replaces locks)
- New `RecommendationHint.tsx` — when a cascade auto-fills a field, the user can clear it and a "✦ Re-apply recommendation: golden hour" chip stays available for one-click restore.
- `applyCascade` keeps the recommendation in a separate `recommendations` map so cleared fields still know what was suggested.

### C. Backdrop color picker
- New `BackdropColorField.tsx` — 24-swatch curated palette + user's saved brand colors (`useUserSavedColors`) + custom hex input.
- Auto-renders inside `ExtrasPillField` (via the `children` slot) when `backdrop_type` is `Two-tone hard split` or `Soft gradient wall`.
- Replaces raw text storage for `backdrop_color_a`, `backdrop_color_b`, `gradient_from`, `gradient_to`.

### D. Per-sub-family pool expansion
Add entries to `settingsBySubfamily.ts` for every gap above. Examples:

```text
jewelry/rings        tabletop → marble slab, velvet tray, stone shelf, water surface, sand
                     studio   → plinth macro, sand bed, gradient sweep
watches/watches +    outdoor_location → marina, mountain lodge, car interior, café counter
                     indoor_lifestyle → atelier, library, hotel desk
tech/tech-devices    tabletop → wood desk, marble slab, lit surface
                     indoor_lifestyle → minimalist desk, café, studio bench
hats-caps/caps       outdoor_location → skate plaza, rooftop
                     tabletop → flat-lay knolling
                     studio → cyclorama, plinth
food-drink/food      tabletop → linen table, wood board, marble slab
                     indoor_lifestyle → sunlit kitchen, café table
bags-acc/wallets     tabletop heavy + studio plinth
fashion/jeans|hoodies|garments  → tuned from jackets/streetwear bases
```

Target: every sub-family from `onboardingTaxonomy.SUB_TYPES_BY_FAMILY` has ≥1 explicit pool entry across ≥2 scene types. ~6–8 settings each.

### E. Custom inputs everywhere (your answer #3)
- Stage B settings — "+ Add your own setting" inline input
- Backdrop colors — custom hex input
- Audit every `ExtrasPillField` for `allowCustom` (already supported by the component)
- Free-text fields for surface, jewelry tray material, food garnish where missing

### F. Soft warnings, never blocks (your answer #1)
- New `softWarnings(ctx): string[]` in `sceneRules.ts` returns informational notes for unusual combos (e.g. "Jackets on tropical beach — unusual but go for it").
- Renders as a dismissible note chip below Stage B. Never blocks Next.

### G. Studio-FX dead-end fix
- `studio_fx` becomes available in `studio` scene type WITHOUT needing `weather` first.
- Self-contained options: rain rig, haze machine, wet floor, smoke, wind machine.

### H. Cast stays independent (your answer #2)
- No coupling rules added. Existing `hideWhenNoCast` on camera-angle fields stays (UX, not coupling — angles literally need a person).
- Audit removes any other implicit cast assumptions.

## 3. Files

**New**
- `wizard/components/SceneTypePicker.tsx` (Stage A)
- `wizard/components/SettingPicker.tsx` (Stage B with custom input)
- `wizard/components/BackdropColorField.tsx`
- `wizard/components/RecommendationHint.tsx`
- `__tests__/setting-pools-coverage.test.ts`
- `__tests__/recommendation-reapply.test.ts`
- `__tests__/backdrop-color-field.test.ts`

**Edited**
- `wizard/registry/settingsBySubfamily.ts` — add missing sub-family pools
- `wizard/rules/sceneRules.ts` — keep recommendations after clear, add `softWarnings(ctx)`
- `wizard/constants/extras.ts` — expand `appliesWhen`, allow `studio_fx` without `weather`, ensure `allowCustom` is set where useful
- `wizard/steps/Step3BaseAnswers.tsx` — wire Stage A → B → C, mount BackdropColorField
- `wizard/WizardLayout.tsx` — `nextDisabledReason` mentions Stage A/B when relevant
- `prompt/assembleSceneDirective.ts` — emit `setting` + color fields in canonical order
- `schema.ts` / `types.ts` — `setting: string` (already free), add `recommendations: Record<string, string>` to state

## 4. Out of scope
- No backend changes, no taxonomy renames, no credit/billing logic
- Steps 1, 2, 4 (Cast), 5 untouched except for tooltip wording

## 5. Tests
All current 89 tests stay green. New checks:
- Every onboarding sub-family resolves to a non-empty pool for ≥2 scene types
- Cleared auto-fill still exposes a re-apply hint
- `BackdropColorField` only mounts for two-tone / gradient backdrop types
- `softWarnings` returns strings, never throws or blocks

I'll run the full suite after implementation and confirm green.
