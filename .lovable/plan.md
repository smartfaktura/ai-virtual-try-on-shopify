# Fix Brand Scenes wizard mobile footer overlap + cast tabs overflow

Two presentation fixes scoped to `/app/brand-scenes/new` on mobile (≤640px).

## 1. Sticky footer — Back / Continue overlap
**File:** `src/features/brand-scenes/wizard/WizardLayout.tsx` (lines 143–164)

Same pattern as the model wizard fix: on narrow viewports the right-aligned `flex-shrink-0` button group can overlap when CTA labels are long ("Continue to Essentials", "Continue to Interaction", etc.).

Change:
- Inner row: `flex items-center gap-2 p-2 sm:p-4` (drop `justify-between`, tighten mobile padding).
- Button group: replace `flex items-center gap-2 flex-shrink-0 ml-auto` with `flex items-center gap-2 w-full sm:w-auto sm:ml-auto`.
- Add `flex-1 sm:flex-none` to both the Back button and the `NextButton` so on mobile they share the row evenly and the Continue label can truncate cleanly (the inner spans already use `truncate`).

Result on mobile: `[ Back ][ Continue → ]` two equal-width pills filling the card, no overlap. Desktop layout unchanged.

## 2. Cast sub-step tabs don't fit on screen
**File:** `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` (lines 257–300)

Five tabs (Look · Essentials · People · Interaction · Styling · optional) currently scroll horizontally on mobile but the user wants them to **fit** the 390px viewport.

Changes:
- Tighten the mobile gap from `gap-5` to `gap-3` (keep `sm:gap-6` for desktop).
- On mobile, drop the "· optional" suffix on Styling — render just `Styling` below `sm`, keep the full label on `sm+`. Implement by splitting the label map into a `mobileLabel` shown via `sm:hidden` and the full label via `hidden sm:inline`.
- Keep the existing horizontal scroll fallback in place as a safety net in case a future locale makes a label wider.
- Reduce the tab row's bottom padding slightly (`pb-2.5` on mobile, keep `sm:pb-3`) so the underline still reads but uses less vertical space.

Result: all 5 tabs fit within 390px with no horizontal scroll, while desktop keeps the richer "Styling · optional" wording.

## Out of scope
- No copy/business-logic changes.
- No edits to other wizard steps, sub-step flow logic, or `BrandSceneWizard.tsx`.

## Verification
Reload `/app/brand-scenes/new` at 390×844, walk through Step 3 → Cast → click Design the look → confirm:
- All 5 tabs visible without horizontal scroll.
- Footer shows Back + Continue side-by-side, equal width, no overlap.
- Continue label truncates if needed, never overlaps Back.
- Desktop (≥640px) layout is unchanged.
