# Phase 7q — Brand Scenes wizard UI/UX polish

Bug sweep based on the user's four specific complaints: redundant copy, off-size pills, strange collapsed-section behavior, and the jarring "jump to bottom" after pressing Next.

## Bugs found

### BUG-1 — Scroll-to-top is silently broken
`BrandSceneWizard.tsx` runs `window.scrollTo(0)` on every step change, then walks ancestors of `[data-wizard-root]` resetting their scrollTop. But:
- No element in the tree sets `data-wizard-root`, so the walker does nothing.
- The wizard renders inside AppShell's `<main id="app-main-scroll" class="overflow-y-auto">`. `window.scrollTo` does not move that container.

Result: after Next, the new step renders at whatever scroll offset the user was at — perceived as "hopping to bottom".

**Fix:** reset `document.getElementById("app-main-scroll")?.scrollTo({ top: 0 })` plus `window.scrollTo(0)` as fallback. Drop the dead walker.

### BUG-2 — `autoFocus` on already-open custom inputs steals scroll on step entry
`PaletteBlock` (Step3BaseAnswers L570) and `PillFieldInner` (L648) initialize `showCustom = !!current.length` and then render `<Input autoFocus>`. When the user re-enters Step 4 (aesthetic) with a previously-typed custom palette, the input mounts already open → browser scrolls it into view → page jumps. Same pattern in `Step3BaseAnswers` PaletteBlock.

**Fix:** remove `autoFocus` from these two inputs. Keep it on `ExtrasPillField` (only opens via explicit user click during the current step) and `SettingPicker` search (mounted via user toggle).

### BUG-3 — Subtitle text breaks brand voice rule
`META_WIZARD` / `META_REFERENCE` subtitles end with periods ("Pick a starting point — wizard inputs or a reference image."). Project memory: *no terminal periods in single-sentence subtitles / empty-state descriptions*.

**Fix:** strip trailing periods from all 8 subtitles.

### BUG-4 — Redundant "Category-tuned · fashion · activewear" chip
The step title already appends `· {subFamilyLabel}` (e.g. "Scene aesthetic · Activewear"). The chip at the top of Step3BaseAnswers repeats the same info one row below.

**Fix:** delete the chip block (L142–146 of `Step3BaseAnswers.tsx`).

### BUG-5 — "Stage A / Stage B / Stage C" engineering jargon leaks into UI
Section headers read `Stage A · Scene type`, `Stage B · Setting / environment`, `Stage C · More creative dials`. Users don't know what stages are.

**Fix:** drop "Stage A ·" and "Stage B ·" prefixes (sections stand alone). Rename the Stage C header to `More creative dials`. Drop the analogous `More cast & styling dials` wrapper in Step4Cast — keep the divider, drop the label.

### BUG-6 — Double-collapse inside Stage C groups feels strange
A `StageCGroup` (chevron-collapsible) contains `ExtrasPillField` items, and each one wraps its chips in a `Section` with its own `+ Show all` toggle. So when you open a group, every field inside *is itself collapsed* to 8 chips with another mini-toggle. Two collapse mechanisms layered.

**Fix:** pass `showAllInitially` to every `ExtrasPillField` rendered inside a `StageCGroup`. The outer chevron handles bulk collapse; inside, all presets render flat. Removes the inner "+ Show all" toggle and the half-truncated chip rows.

### BUG-7 — Collapsed `StageCGroup` shows no summary
Each chevron-collapsed group shows only its label. Users can't tell which dials inside are already filled.

**Fix:** add a `count` prop. Header renders `{label}` plus a small `· N set` suffix when count > 0. Step3BaseAnswers computes count per group from `value.extras`.

### BUG-8 — Chips too large on mobile (440px viewport)
`Chip` is fixed at `px-4 py-2 text-sm whitespace-nowrap`. Long labels like *"Walking past camera"*, *"Dappled through leaves"*, *"Pan-European"* combined with that padding push only 2 chips per row at 440 CSS px, making 20-option sections extremely tall and exaggerating the scroll problem.

**Fix:** tighten to `px-3 py-1.5 text-[13px]` on mobile, restore `sm:px-4 sm:py-2 sm:text-sm` on ≥ sm. Apply identically to `AddChip` so they line up. No change to colors or shape.

## Out of scope
- Reworking the actual section order or merging "Brand voice / Aesthetic era / Realism level" into one card (structural, separate phase).
- Touching backend, prompt assembler, or saved-scene shape.
- Visual redesign of the wizard chrome — keep current layout and tokens.

## Files
- **Edit** `src/features/brand-scenes/wizard/BrandSceneWizard.tsx` — scroll fix + subtitle cleanup.
- **Edit** `src/features/brand-scenes/wizard/components/Chip.tsx` — responsive sizing.
- **Edit** `src/features/brand-scenes/wizard/components/StageCGroup.tsx` — accept `count`, render summary.
- **Edit** `src/features/brand-scenes/wizard/steps/Step3BaseAnswers.tsx` — remove tuning chip, drop Stage prefixes, pass `showAllInitially`, supply per-group count, remove `autoFocus` from PaletteBlock + PillFieldInner.
- **Edit** `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` — drop wrapper label.
- **New** `src/features/brand-scenes/__tests__/wizard-polish-7q.test.tsx` — assertions: subtitles have no trailing period; `Chip` has responsive class; `StageCGroup` renders count when provided; scroll handler resolves the main element id.

No DB / schema / type changes. No effect on saved scenes.
