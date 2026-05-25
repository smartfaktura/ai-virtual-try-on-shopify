# Phase 2 — Sub-family Allowlist Corrections

Scope: data-only edits to `src/features/brand-scenes/wizard/registry/categoryPresets.ts`. No component, hook, prompt, or schema changes. Two small fixes.

## Changes

### 1. Broaden `belts` and `scarves` interactions
File: `src/features/brand-scenes/wizard/registry/categoryPresets.ts` (under `fashion-misc → sub`)

Today both sub-families allow only `["wearing", "hero"]`, which blocks valid editorial still-life and flat-lay shots (belt coiled on a stone surface, scarf draped beside a model, etc.).

- `belts.interactions`: `["wearing", "hero"]` → `["wearing", "holding", "beside", "hero"]`
- `scarves.interactions`: `["wearing", "hero"]` → `["wearing", "holding", "beside", "hero"]`
- `scarves.hands_on_product`: `[]` → `["cradle", "pinch"]` (so "holding" actually has a valid hand placement)

Rationale: `still_life` / `flat_lay` / `hero_product` referenced in the QA notes are *scene types*, not `CastInteraction` values. The correct mechanism is to allow the `hero` (product-only) and `beside` interactions, which the scene-type picker maps to still-life/flat-lay aesthetics.

### 2. Add sub-family stubs for `tech` and `wellness`
Both families currently expose only one sub-family in `onboardingTaxonomy.ts`:
- `tech` → `tech-devices`
- `wellness` → `supplements-wellness`

After Phase 1 the wizard auto-skips Step 2 when a family has ≤1 sub-family, so these families already render and submit correctly via the family-level preset. We still add explicit sub stubs so:
- the resolution cascade has a documented per-sub entry (consistent with every other family), and
- future additions of a second sub-family inherit calibrated defaults instead of falling back to the global default.

- `tech.sub["tech-devices"]`: copies the family-level `interactions`, `cast_presets`, `default_cast`, `hands_on_product`, `body_part_focus` so the resolver returns a stable bundle.
- `wellness.sub["supplements-wellness"]`: same pattern (`interactions`, `cast_presets`, `default_cast`, `hands_on_product`).

No new TypeScript types, no new enum values, no taxonomy changes.

## Out of scope

- Adding new `CastInteraction` enum values (`still_life`, `flat_lay`, `hero_product`) — those belong to the scene-type registry, not this file.
- Editing other sub-families (apparel, footwear, jewelry, eyewear, etc.) — they passed the QA matrix.
- Step 2 visibility logic — handled in Phase 1.
- Storage hygiene, UX correctness, polish — Phases 3–5.

## Verification

1. Open `/app/brand-scenes/new`, pick **Fashion misc → Belts** (or **Scarves**). On the Cast step, the Interaction picker now shows **Wearing, Holding, Placed beside, Product only** (was only Wearing + Product only).
2. Pick **Holding** on Scarves → hand-placement field offers `cradle` / `pinch` (was empty, blocking submission).
3. Pick **Tech → Tech devices**: Step 2 is still auto-skipped (Phase 1), Cast/Environment options are identical to before.
4. Pick **Wellness → Supplements & wellness**: same — identical visible options, no console errors, prompt still assembles.
5. Generate one scene per changed sub-family to confirm the prompt engine accepts the new interaction values (no `unknown interaction` warnings in the edge-function logs).

Approve to implement Phase 2.