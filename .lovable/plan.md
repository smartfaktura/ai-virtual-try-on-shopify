## Goal

Make the **Look**, **Environment ("Where does it happen?")**, and **Photography ("How is the photo taken?")** sub-steps feel less like a dense form and more like a Typeform — fewer words, more breathing room, clear visual chapters instead of one long flat list. Presentation only; no schema/prompt/logic changes.

## 1. Look sub-step (`Step4Cast.tsx`)

Currently shows a Section helper ("Skip auto-casts a generic look…") plus two BranchCards with two lines of copy each — visually heavy for a binary choice.

- Drop the Section helper paragraph entirely. The H1 already asks the question.
- Reduce each BranchCard to a single short phrase:
  - "Skip — auto-cast" → keep title, drop sub-line
  - "Yes, design the look" → keep title, drop sub-line
- Center the two cards in a wider 2-col grid with `gap-4`, give the row `pt-6` so it floats in space instead of stacking right under the tab bar.

## 2. Environment — "Where does it happen?" (`Step4Environment.tsx`)

Currently ~10 stacked Sections (Scene type → Setting → Weather → Season → Brand voice → Aesthetic era → Prop density → fine-tuning fields → Avoid → Notes) all at the same visual weight. Reads as a long list.

Re-chapter into 3 visual groups, each introduced by a larger uppercase chapter label with extra top/bottom space:

```text
SCENE                ← Scene type + Setting
MOOD & ATMOSPHERE    ← Weather, Season, Brand voice, Aesthetic era, Prop density
FINE-TUNING          ← existing extras loop + Avoid + Notes
```

- Add a small `ChapterHeading` helper inside the file (uppercase `text-[10px] tracking-[0.18em] text-muted-foreground`, with a hairline divider below and `mt-14 mb-6` rhythm). No new shared component.
- Bump outer wrapper from `space-y-10` to `space-y-12` and let chapter spacing carry the rest.
- Shorten the "Pick a scene type above to unlock…" empty-state to "Pick a scene type to continue" and lower visual weight (no border, lighter copy).
- Remove the `defaultOpen` `ENV_GROUPS` constant — no longer used after re-chaptering.

## 3. Photography — "How is the photo taken?" (`Step5Photography.tsx`)

11 identical Sections in a row. Same re-chapter treatment using the same `ChapterHeading` pattern (duplicated locally — keeps the change scoped):

```text
LENS & FOCUS         ← Lens, Background blur, Focus, Shadows
COMPOSITION          ← Composition, Negative space, Realism, + extras (camera_angle*, motion, composition_energy, crop_safety)
COLOR & FINISH       ← Color palette, Contrast, Saturation, Finish
```

- Move the extras loop into the **Composition** chapter rather than dangling at the bottom.
- Outer wrapper: `space-y-12`.
- Trim tooltips that repeat the label (e.g. keep "Wide = roomy. Long = compressed." style — already short, leave as is).

## Out of scope

- No changes to `Section`, `Chip`, `ChipRow`, `ExtrasPillField`, `SceneTypePicker`, or any shared component
- No prompt, validation, schema, or routing changes
- No changes to other sub-steps (Essentials / People / Interaction / Styling) or other wizard steps