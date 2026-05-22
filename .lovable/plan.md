## Make chip-heavy sections in `/app/brand-scenes/new` comfortable to answer

### Problem
The Cast step (and other chip-dense sections: vibe, action, interaction, wardrobe, gaze, hands, body focus, extras) shows a wall of tiny `text-[13px] px-3.5 py-1.5` pills packed tight. Many options + small targets + cramped spacing = the quiz feels like work. We need bigger tap targets, clearer grouping, and breathing room — without redesigning the wizard.

### Single source of truth: `Chip.tsx`
Most sections render `<Chip>` from one component, so the fastest path to "more spacious, more balanced" is to upsize that primitive and the surrounding section rhythm. No data, registry, or step logic changes.

### Changes

**1. `src/features/brand-scenes/wizard/components/Chip.tsx` — bigger, friendlier pill**
- Size: `px-3.5 py-1.5 text-[13px]` → `px-4 py-2 text-[13.5px] leading-none`.
- Min-height for consistent baseline: add `min-h-[36px] inline-flex items-center justify-center`.
- Active state: keep solid foreground bg, add `font-medium` so the selection reads clearly at a glance.
- Hover: add subtle `bg-muted/30` on idle hover (already has `hover:border-foreground/40`) so the affordance is visible without clicking.
- `AddChip`: same size bump + same min-height for visual rhythm in the row.

**2. `src/features/brand-scenes/wizard/components/Section.tsx` — more vertical room around chip groups**
- Outer spacing: `space-y-2.5` → `space-y-3.5`.
- Add an internal `chipGroup` wrapper prop (optional `density="comfortable"`) — when set, the body gets `gap-y-2.5 gap-x-2` flex wrap so chip rows don't crash into each other on wrap. Default unchanged to avoid touching non-chip sections.
- Increase helper text breathing: `space-y-1` between label and helper → `space-y-1.5`.

**3. Chip-row containers across the wizard — wider, more even gaps**
In the four hottest files only, replace `flex flex-wrap gap-2` (chip rows) with `flex flex-wrap gap-x-2 gap-y-2.5`:
  - `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` (vibe, action, interaction, age, gender, wardrobe color, gaze, hands, body focus rows)
  - `src/features/brand-scenes/wizard/components/ExtrasPillField.tsx`
  - `src/features/brand-scenes/wizard/components/EthnicityChips.tsx`
  - `src/features/brand-scenes/wizard/components/BackdropColorField.tsx`
No other steps modified.

**4. Cast step grouping — visual rest between blocks**
In `Step4Cast.tsx` only:
- Increase vertical gap between sibling `<Section>`s within a `StageCGroup`: outer wrapper `space-y-5` → `space-y-7`.
- Insert a subtle `border-t border-border/40 pt-6` separator above the second cast group ("Wardrobe & details") so the eye gets a beat between People → Style.

**5. Section heading clarity (chip sections only)**
- When a Section is required AND filled, swap the `Required` tag for a small `text-[10px] uppercase tracking-widest text-emerald-700/70` `Selected` tag, so the user sees progress instead of nagging. Done inside `Section.tsx` via a new optional `filled` prop, passed by chip sections that already know their value count.

### Out of scope
- No new chip variants, no icons inside chips, no color-token additions.
- No content/copy changes, no registry or rule changes, no step reordering.
- BrandModels-style sliders or alternate input modes — chips stay chips.

### Files
- `src/features/brand-scenes/wizard/components/Chip.tsx`
- `src/features/brand-scenes/wizard/components/Section.tsx`
- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx`
- `src/features/brand-scenes/wizard/components/ExtrasPillField.tsx`
- `src/features/brand-scenes/wizard/components/EthnicityChips.tsx`
- `src/features/brand-scenes/wizard/components/BackdropColorField.tsx`
