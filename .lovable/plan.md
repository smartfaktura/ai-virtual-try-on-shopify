# Brand Scenes Wizard — design consistency pass

Frontend-only sweep to remove illogical/inconsistent design decisions across `/app/brand-scenes/new`. No logic, schema, or prompt-assembler changes.

## Issues found

**Selection cards — three different active styles**
1. `WizardCard` active = `bg-foreground text-background` (brutal inversion).
2. `SmartSettingCard` (Setting picker) active = `bg-foreground/[0.03] shadow-sm` (faint tint).
3. `Step3Reference` intent buttons active = `bg-foreground/[0.04]` bespoke.
   → Same job, three different visuals.

**Card sizing/grid drift**
4. `Step0ChooseSource` uses `gap-4`; every other picker uses `gap-3`.
5. `Step0` only lights the active card after `picked` flips true — Step 1 reflects state immediately. Inconsistent feedback.
6. `Step1ChooseModule` title-only cards inherit `WizardCard` `p-5` — feels oversized/empty without icon or body.
7. `Step2` single-sub-family fallback and `Step4ModuleQuestions` empty state use two different "info card" styles.

**"Add custom" affordance — three variants**
8. `ExtrasPillField` → `AddChip` (dashed pill + Plus icon).
9. `SettingPicker` → dashed card button "Add your own" + Plus.
10. `BackdropColorField` → text `Chip` with literal `+ Custom hex` / `− Custom`.
11. `Step4Cast` "Add exact size" → raw uppercase text button with `+`/`−` literals.

**Sticky bar redundancy**
12. Top of the page already has step bars + labels; sticky bottom card repeats dot-progress + step label on both mobile and desktop.
13. On the Review step the sticky `Save scene` disabled button and Step 6's disabled `Generate 3 variations` show simultaneously, both with the same "Available in a later phase" tooltip.

**Step 4 Cast — leftover scaffolding (Phase 7aa flattened Env/Photo but missed Cast)**
14. Trailing dials still wrapped in `Optional styling — skip and we'll pick smart defaults` header + top border (same "inception" pattern the user already rejected).
15. `GroupHeader` rendered above single-section groups: "Notes" (one textarea), "Product interaction" (one section).
16. Two overlapping labels in same step: `Energy / vibe` and `Action / energy`.
17. `EthnicityChips` renders its own `[10px] uppercase` header + Info tooltip instead of using the shared `Section` (which now supports `tooltip`).

**Step 3 Reference micro-fixes**
18. "Use this image as" label has a trailing `·` separator that looks like a placeholder.
19. `Chip` import is dead.

**Step 6 polish**
20. Variant placeholders hardcode `[0,1,2]` while the hero card uses `BRAND_SCENE_VARIATIONS_PER_GENERATION`. Will drift if the constant changes.
21. `AdminPanel` uses `rounded-2xl` while other inline disclosure surfaces in the wizard use `rounded-xl`.

## Fix plan (presentation-only)

### A. Unify selection cards
- `WizardCard`: add `compact?: boolean` (renders `p-4`, no icon-slot reservation).
- `Step1ChooseModule`: pass `compact`.
- `Step0ChooseSource`: switch to `gap-3`; drop the `picked &&` guard so active state shows on click.
- `SmartSettingCard`: align active style to `WizardCard` (`border-foreground bg-foreground text-background`, drop `shadow-sm`).
- `Step3Reference` intent options: replace bespoke buttons with `WizardCard` (compact, title=label, body=hint), same `sm:grid-cols-2 gap-3` grid.
- `Step2ChooseSubFamily` single-card fallback + `Step4ModuleQuestions` empty: standardize on one look — `rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center` with quiet typography (no primary-tinted disc).

### B. One "add custom" affordance
- Standardize on `AddChip` (dashed pill, Plus icon).
- `BackdropColorField`: replace text Chip with `AddChip`, close via a small "Hide" ghost.
- `Step4Cast` exact-size: replace text toggle with `AddChip label="Exact size"`; collapse with a `Hide` ghost button when open.
- `SettingPicker`: keep the card-grid variant (it lives in a card grid, not a chip row) but change copy to plain "Custom setting" with Plus, matching `AddChip` wording.

### C. Sticky bar
- Remove duplicate dot-progress + step label from the sticky bottom card (mobile + desktop). Top bars+labels remain the single source of truth.
- On the last step, hide the sticky `Save scene` disabled CTA — Step 6's in-card CTA is enough. Keep `Back` only.

### D. Step 4 Cast cleanup
- Remove the "Optional styling — skip and we'll pick smart defaults" wrapper + border around the trailing `ExtrasPillField` list, mirroring Phase 7aa flattening in Env/Photo.
- Apply rule: render `GroupHeader` only when ≥2 sections will follow it. Drop the lone "Notes" and "Product interaction" group headers.
- Rename `Action / energy` → `Action` (the vibe field already owns "energy").
- Wrap `EthnicityChips` in a real `Section label="Ethnicity / casting hint" tooltip="A styling hint, not a hard cast…"` and strip its internal header.

### E. Step 3 Reference micro-fixes
- Drop the trailing ` · ` from the "Use this image as" label.
- Remove the unused `Chip` import.

### F. Step 6 polish
- Derive variant placeholder count from `BRAND_SCENE_VARIATIONS_PER_GENERATION` (`Array.from({ length: N })`).
- `AdminPanel`: change outer wrapper to `rounded-xl`.

## Out of scope
- No prompt-assembler, registry, rules, cascade, or schema changes.
- No new copy beyond renames listed.
- No new components beyond a `compact` prop on `WizardCard` and reuse of the existing `AddChip`.

## Files touched
- `wizard/WizardLayout.tsx`
- `wizard/components/WizardCard.tsx`
- `wizard/components/SmartSettingCard.tsx`
- `wizard/components/BackdropColorField.tsx`
- `wizard/components/SettingPicker.tsx`
- `wizard/steps/Step0ChooseSource.tsx`
- `wizard/steps/Step1ChooseModule.tsx`
- `wizard/steps/Step2ChooseSubFamily.tsx`
- `wizard/steps/Step3Reference.tsx`
- `wizard/steps/Step4Cast.tsx`
- `wizard/steps/Step4ModuleQuestions.tsx`
- `wizard/steps/Step6PreviewAndPick.tsx`
