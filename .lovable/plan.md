## Goal

Two refinements on **Step 4 → People** tab in `/app/brand-scenes/new`:

1. When the cast preset is **Two people** (or **Group**), let the user pick **2 (or up to 3) featured models** — not just one.
2. Collapse the per-attribute chip clutter. Add a **"Custom settings"** pill next to *See all models* / *Use a Brand Model* that reveals Gender / Age / Build / Ethnicity. By default those are hidden.

## 1. Multi-slot featured model

### Schema
- Add `model_refs?: ModelRef[]` to `BrandSceneCast` (new field, optional).
- Keep `model_ref` as a derived "primary" mirror so existing prompt builder, Step6 preview and `assembleSceneDirective` keep working without touch:
  - When `model_refs` is set, `model_ref = model_refs[0]`.
  - When only `model_ref` is set (older sessions), `model_refs = [model_ref]`.
- Helper functions in `FeaturedModelPicker` normalize both directions on every `onChange`.

### UX
`FeaturedModelPicker` becomes slot-aware. It receives the cast `preset` as a new prop and renders N slots:

| Preset | Slots |
|---|---|
| solo / hands / none / replicate | 1 (unchanged) |
| two | 2 |
| group | 3 |

Layout — side-by-side cards on desktop, stacked on mobile:

```text
FEATURED MODELS
Pick up to 2 anchor faces — other people are auto-cast

┌─ Slot 1 ─────────┐   ┌─ Slot 2 ─────────┐
│ [Freya selected] │   │ [+ Pick model]   │
│  Change · Remove │   │                  │
└──────────────────┘   └──────────────────┘
```

Each empty slot opens the same quick-pick grid (Freya suggested first time, then alternate suggested pick for slot 2, e.g. **Anders** → male anchor to balance) plus the existing *See all models* and *Use a Brand Model* buttons.

### Prompt-side wiring (minimal but real)
- `assembleSceneDirective` already inserts the primary model image as a reference. Extend it to also append `cast.model_refs[1..N].sourceImageUrl` as additional reference images, tagged `[MODEL IMAGE 2]`, `[MODEL IMAGE 3]`.
- `buildCastDirective` adds one extra line when `model_refs.length > 1`: "Cast features the provided reference faces — preserve their identities across all subjects." No other prompt logic changes.
- Section helper copy updates to reflect "up to N anchor faces".

## 2. "Custom settings" pill — collapse Gender / Age / Build / Ethnicity

### Today
People tab always renders Energy/Vibe, Gender, Age, Build, Ethnicity even though most users with a featured model never need them — and the section feels noisy.

### Change
- **Energy / vibe** stays visible and required (it drives mood, not identity).
- **Gender, Age, Build, Ethnicity** become **hidden by default** behind a toggle.
- Add a third pill in the same row as *See all models* / *Use a Brand Model*:

```text
[ See all models ]  [ Use a Brand Model ]  [ + Custom settings ]
```

- Clicking *Custom settings* expands a single grouped block (Gender · Age · Build · Ethnicity) with a small "Hide" link to collapse again.
- The toggle is local UI state (`useState`) — not persisted to the answers. If any of these fields already have values (returning to the step), the block auto-opens so the user sees their own choices.
- When a model is selected today, Gender/Age/Build/Ethnicity already auto-hide. Keep that: with a model selected, *Custom settings* is still available but its label changes to "Override casting hints" and the existing "locked to your featured model" caption stays.

## Files touched

- `src/features/brand-scenes/types.ts` — add `model_refs?: ModelRef[]`.
- `src/features/brand-scenes/wizard/components/FeaturedModelPicker.tsx` — slot-aware rendering, primary↔array sync helper, suggested-pick rotation per slot.
- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` (`PeopleTab`) — pass `preset` to the picker, wrap the four attribute sections in a single collapsible controlled by the new "Custom settings" pill, render the pill row.
- `src/features/brand-scenes/prompt/assembleSceneDirective.ts` — append extra `[MODEL IMAGE n]` references when `model_refs.length > 1`.
- `src/features/brand-scenes/prompt/buildCastDirective.ts` — add the multi-anchor line.

## Out of scope

- No DB / schema migration (the JSONB column already accepts the new field).
- No change to Step 6 preview chrome — the primary face still renders as today.
- No change to credit pricing or the variation count.
