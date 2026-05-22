# Phase 7aa — environment & photo step polish

Frontend-only refinement of the Environment and Photo & edit steps. No logic, no schema, no prompt changes.

## 1. Scene type cards — match wizard card style

**`src/features/brand-scenes/wizard/components/SceneTypePicker.tsx`** — replace the custom inline `<button>` (which uses `text-sm font-medium` + `text-[11px]` vibe line) with the shared `WizardCard` component so spacing, font weight, and active treatment match the Source and Family cards exactly.

- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3`
- Each option renders `<WizardCard title={t.label} body={t.vibe} active={...} onClick={...} />`
- Clicking the active card still clears selection (toggle behavior).

Result: card titles become `text-base font-semibold`, bodies become `text-sm`, padding `p-5`, active state is the solid foreground card — visually consistent with Step 0/1.

## 2. Environment — flatten "Optional fine-tuning"

**`src/features/brand-scenes/wizard/steps/Step4Environment.tsx`** — remove the nested-collapsible "inception":

- Delete the `<div ... border-t border-border/60>` wrapper and the "OPTIONAL FINE-TUNING — skip and we'll pick smart defaults" header (lines 208–216).
- Stop using `StageCGroup` for the `ENV_GROUPS` ("Backdrop & floor", "Light & time"). Replace each group with a flat `<Section label={g.label}>` rendered open, fields inside.
- Inside each group, render each fine-tuning field as a `<Section label={field.label}>` with the pills directly visible — no nested "Backdrop type" sub-collapsible. (The `ExtrasPillField` already shows its own label; we drop the outer collapsible chrome only, so the existing field labels become the section labels.)

Net effect: one flat list — `Setting`, `Weather`, `Season`, `Brand voice`, `Aesthetic era`, `Prop density`, then Backdrop & floor section (flat, with its field labels like "Backdrop type", "Backdrop color", "Floor", "Studio FX" rendered as normal Sections inline), then Light & time section the same way. No double-nested chevrons.

Keep `StageCGroup` file untouched (still used elsewhere? confirm with grep — if only here, leave file in place but unused for now).

## 3. Photo & edit — quieter copy, less text

**`src/features/brand-scenes/wizard/steps/Step5Photography.tsx`** — the page reads as a wall of helpers. Simplify:

- Drop the `helper` prop from every `<Section>` in this step. Helpers are duplicating the label intent (e.g. "Where the product sits inside the frame." under "How the shot is composed").
- Replace section labels with plain-language, shorter equivalents:
  - "Lens look" stays
  - "How blurry the background is" → **"Background blur"**
  - "How the shot is composed" → **"Composition"**
  - "Empty space around the product" → **"Negative space"**
  - "What the eye lands on first" → **"Focus"**
  - "Shadows" stays
  - "How realistic" → **"Realism"**
  - "Color palette" stays
  - "Contrast" stays
  - "Color intensity" → **"Saturation"**
  - "Film / finish look" → **"Finish"**
- Add a single page-level intro line under the step title (already present: "Camera, light, color, finish — plain-language") — keep as-is.
- For the three sections that benefit from a one-line hint (Lens, Background blur, Finish), add a small inline `info` tooltip (use `lucide-react` `HelpCircle` next to the label inside the Section, opened on hover) rather than rendering full sentences. Implementation: extend `Section` to accept optional `tooltip?: string` prop that renders a `HelpCircle` icon with shadcn `Tooltip` next to the label. Drop the existing `helper` rendering use here.

Also flatten the Photo & edit "Optional fine-tuning" block (lines 244–316) the same way as Environment — remove the wrapper + "Optional fine-tuning" header + `StageCGroup`; render PHOTO_GROUPS as flat `<Section>` blocks ("Camera angle", "Motion & crop").

## Out of scope

- No changes to scene-type IDs, registries, cascade rules, or stored field keys.
- No changes to the prompt assembler, generation flow, or backend.
- No copy edits beyond the section labels listed above.

## Files touched

- `src/features/brand-scenes/wizard/components/SceneTypePicker.tsx`
- `src/features/brand-scenes/wizard/components/Section.tsx` (add optional `tooltip` prop)
- `src/features/brand-scenes/wizard/steps/Step4Environment.tsx`
- `src/features/brand-scenes/wizard/steps/Step5Photography.tsx`

## Test impact

Existing 175 tests should pass — no schema, prompt, routing, or field-key changes. Spot-check tests asserting Section label text since 6 labels are renamed in Step 5.
