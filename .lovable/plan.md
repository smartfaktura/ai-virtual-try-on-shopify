## Add "Other" free-text option to every chip field in Step 5 (How is the photo taken?)

Mirror the pattern already used by Palette: each chip row gets an `+ Other` chip that opens a small inline input so users can write specific direction (e.g. "50mm f/1.4", "hard 45° rim shadow", "matte film grain Portra 400"). When a custom value is set it overrides the preset for that field, both in UI and in the generated prompt.

### Fields covered (all chip rows in Step 5)
Lens · Background blur · Focus · Shadows · Composition · Negative space · Realism · Contrast · Saturation · Finish.
Palette already has it — leave as is.

The extras-driven block (`camera_angle`, `motion`, `composition_energy`, `crop_safety`) is rendered via `ExtrasPillField` and is out of scope of this change.

### UI

Add a new shared helper next to `ChipRow` in `_baseHelpers.tsx`:

```text
ChipRowWithOther
  ├─ existing chips (preset values)
  ├─ + Other chip          → reveals input
  └─ <Input>               → custom text (max 120 chars)
```

Behavior:
- If `custom` is set, no preset chip is highlighted and the input is shown pre-filled.
- Picking a preset chip clears `custom`.
- Typing in the input clears `preset`.
- Empty input + close = both cleared (same as palette).
- Style matches `PaletteBlock` (rounded-xl input, mt-2, same placeholder tone).

Swap each `ChipRow` in `Step5Photography.tsx` for `ChipRowWithOther`, passing a `custom` value and `onCustom` handler.

### State / schema

Add optional `_custom` siblings to `BrandSceneBaseAnswers` (in `types.ts` and the matching zod schema in `schema.ts`):

```
lens_custom?, depth_of_field_custom?, subject_focus_custom?, shadows_custom?,
composition_custom?, negative_space_intent_custom?, realism_custom?,
color_contrast_custom?, saturation_custom?, finish_custom?
```

All optional strings, max 120 chars, trimmed.

### Prompt wiring (`assembleSceneDirective.ts`)

For each field, prefer the custom string over the preset directive — same pattern as palette:

```ts
const lensDirective = base.lens_custom ?? meta(SCENE_LENSES, base.lens)?.directive;
if (lensDirective) camParts.push(`Camera: ${lensDirective}`);
```

Apply equivalently to dof, finish, shadows, composition, neg space, realism, focus, contrast, saturation. Keep prefixes ("Camera:", "Finish:", etc.) so directive structure is unchanged.

### Review step

`Step5Review.tsx` already reads these fields; update the lookup to fall back to the custom string when present so the review chip shows the user-typed text (in italic or plain — matching palette's current treatment).

### Out of scope

- Step 4 (Cast) and the `Where does it happen?` step — no Other added there in this pass.
- `ExtrasPillField` (camera_angle etc.) — that component already has its own custom-input behavior managed separately.
- Validation rules, autopick logic, recommendations — untouched.

### Files

- `src/features/brand-scenes/wizard/steps/_baseHelpers.tsx` — new `ChipRowWithOther`
- `src/features/brand-scenes/wizard/steps/Step5Photography.tsx` — swap 10 ChipRow usages
- `src/features/brand-scenes/types.ts` — add 10 `*_custom` optional fields
- `src/features/brand-scenes/schema.ts` — mirror in zod
- `src/features/brand-scenes/prompt/assembleSceneDirective.ts` — prefer custom over preset
- `src/features/brand-scenes/wizard/steps/Step5Review.tsx` — display custom value when set
