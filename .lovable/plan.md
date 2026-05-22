
# Phase 7ac — Visual consistency pass on `/app/brand-scenes/new`

Use `/app/models/new` (BrandModels `UnifiedGenerator` sections layout) as the reference. Brand Scenes currently uses ~5 competing label styles, 3 empty-state treatments, 2 disabled CTAs on the final step, and a `GroupHeader` that breaks the section vocabulary. Fix the visual language only — no behavior, registry, rules, or assembler changes.

## Inconsistencies found

**Typography drift (5 styles for one role: "section label")**
- `Section` label: `text-[10px] uppercase tracking-[0.18em]`
- `GroupHeader` (Step4Cast): `text-[11px] font-semibold tracking-tight` — not uppercase, breaks rhythm
- `AdminPanel` (Step6): `text-[11px] uppercase tracking-[0.18em]` (11 vs 10)
- `Section` `Required` tag: `text-[9px]` — the only 9px in the app
- BrandModels reference: `text-[10px] font-semibold uppercase tracking-widest`

**Surface / radius drift**
- WizardLayout sticky bar: `rounded-xl`; BrandModels footer: `rounded-2xl`
- Step6 `AdminPanel`: `rounded-xl`; sibling info blocks: `rounded-2xl`
- Empty-states use three different looks: dashed `bg-muted/20 px-5 py-8` (Step4Env) vs ring `p-3` (Section.missing) vs dashed `p-4` (SettingPicker)

**Chip sizing jumps**
- `Chip` changes size at `sm:` (`text-[13px] px-3 py-1.5` → `sm:text-sm sm:px-4 sm:py-2`) — pills literally resize at breakpoint
- Step4Cast (line 552) and BackdropColorField re-implement chip styling inline instead of using `<Chip>`

**Chrome / CTA noise**
- WizardLayout shows a Lock + "Admin preview — Brand Scenes wizard" eyebrow on every step
- Step6 hero "Generate 3 variations" uses raw `rounded-full font-semibold`, not shared `size="pill"`
- Last step still renders a disabled `Save scene` in the sticky bar while Step6 hero already shows a disabled Generate — two disabled CTAs

**Helper-text variations** — four different sizes (`text-[11px]/80`, `text-[11px]/70`, `text-xs`, `text-sm`)

## Fixes

**A. One label vocabulary**
1. `Section.tsx` label → `text-[10px] font-semibold uppercase tracking-widest text-muted-foreground`
2. `Section.tsx` `Required` tag → `text-[10px] uppercase tracking-widest text-muted-foreground/60`
3. `Step6PreviewAndPick.AdminPanel` label → `text-[10px] uppercase tracking-widest`
4. `Step4Cast.GroupHeader` → re-render as the same `text-[10px] font-semibold uppercase tracking-widest` label, with `mt-2 mb-1` rhythm; no title-case bold headings inside the form
5. `Step6PreviewAndPick` hero "Ready to generate" eyebrow → same shared style

**B. One helper-text style**
- All sub-labels/helpers: `text-[11px] text-muted-foreground leading-relaxed`
- Replace ad-hoc `text-sm` empty body (Step4Environment) and `text-xs` (Step4ModuleQuestions) with this

**C. One empty / info surface**
- Standardize on `rounded-2xl border border-dashed border-border bg-muted/20 p-5 text-center`
- Apply in Step4Environment "Pick a scene type", Step4ModuleQuestions placeholder, SettingPicker empty branch, Step2ChooseSubFamily fallback

**D. Chrome + sticky bar alignment with BrandModels**
- WizardLayout sticky bar: `rounded-xl` → `rounded-2xl`; remove the "Admin preview — Brand Scenes wizard" eyebrow row
- WizardLayout last step: hide the bottom-bar CTA, keep only `Back`. Step6 hero owns the primary action.
- Step6PreviewAndPick:
  - "Generate 3 variations" → `<Button size="pill">`
  - `AdminPanel` → `rounded-2xl`

**E. WizardCard rhythm**
- Compact body `text-[12px]` → `text-[11px] leading-relaxed` (matches helper style)
- Non-compact title/body unchanged

**F. Chip uniformity**
- `Chip.tsx`: single size at all breakpoints — `rounded-full border px-3.5 py-1.5 text-[13px]`
- `AddChip`: mirror the same size
- Replace raw chip-styled buttons in Step4Cast (line 552) and BackdropColorField with `<Chip>` / `<AddChip>`

## Out of scope

- No registry, rules, cascade, prompt-assembler, constants, types, hooks, or data-flow changes
- No copy rewrites beyond removing the admin-preview eyebrow
- No new components

## Files touched

- `src/features/brand-scenes/wizard/WizardLayout.tsx`
- `src/features/brand-scenes/wizard/components/Section.tsx`
- `src/features/brand-scenes/wizard/components/Chip.tsx`
- `src/features/brand-scenes/wizard/components/WizardCard.tsx`
- `src/features/brand-scenes/wizard/components/SettingPicker.tsx`
- `src/features/brand-scenes/wizard/components/BackdropColorField.tsx`
- `src/features/brand-scenes/wizard/steps/Step2ChooseSubFamily.tsx`
- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx`
- `src/features/brand-scenes/wizard/steps/Step4Environment.tsx`
- `src/features/brand-scenes/wizard/steps/Step4ModuleQuestions.tsx`
- `src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx`

## QA

- Walk every step at `/app/brand-scenes/new`: one label size, one helper size, one empty-state look, one footer radius
- Last step shows only one disabled CTA (the hero), no duplicate in the sticky bar
- Run wizard test suite — no logic changed, all should pass
