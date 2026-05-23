# Mobile fixes for Brand Scenes wizard

Targeting `/app/brand-scenes/new` on viewports ≤ 480px. Frontend/presentation only — no business logic, no edge function changes.

## Bugs observed

1. **Sticky footer clipping / "three Back buttons"** — On the screenshot at 440px the sticky footer renders the disabled-reason text un-truncated next to two Back buttons (a Back from a transitioning step + the current Back), so the card overflows horizontally and clips text ("ick…").
2. **Footer hidden under iOS chrome** — `bottom-4` + `pb-[env(safe-area-inset-bottom)]` still lets the CTA sit under the browser bottom bar; the disabled "Generate 3 variations · 20 credits" button on Step 6 is partially behind the chat/safe-area on iOS.
3. **CTA labels too long for mobile** — "Generate 3 variations · 20 credits" and "Continue to Interaction" overflow the pill and force the footer to flex-wrap into the body.
4. **Step 4 Cast tabs (the "floating step menu")** — `flex-wrap gap-x-6` makes the Look/Essentials/People/Interaction/Styling tabs wrap onto multiple rows on mobile, the "Step X of Y" pushes to a third row, and tapping a wrapped tab is awkward (no horizontal scroll, no active-scroll-into-view).
5. **Top progress strip cramped** — `10px` step-counter + label on one row leaves no breathing room next to the sub-family suffix ("Review & generate" + sub-family chip would overflow).
6. **Page content sits under sticky footer** — the wizard body has `pb-10` but no allowance for the ~72px sticky footer, so the last field/Save button is covered when scrolled to the bottom.
7. **Step 6 hero card padding** — `p-6` on a 440px screen leaves little room; "Saving the variation you like is free" wraps awkwardly and the disabled-state hint is hidden under the footer.

## Changes

### `src/features/brand-scenes/wizard/WizardLayout.tsx`
- Add `pb-28` (mobile) / `sm:pb-10` to the body wrapper so the sticky footer never covers content.
- Sticky footer:
  - Reduce padding on mobile (`p-2.5 sm:p-4`), tighten gap.
  - Make the disabled-reason text `hidden sm:block` (or move it above the buttons as a small line on mobile) so the buttons always fit on one row.
  - Add `min-w-0` + `truncate` to the reason span.
  - Buttons row: `flex-shrink-0`; CTA pill gets `max-w-full truncate`.
  - Replace `bottom-4` with `bottom-2 sm:bottom-4` and keep safe-area padding.
- Shorten Next-button label on mobile via a responsive variant: full label on `sm+`, abbreviated ("Next", "Save", "Continue") on mobile. Implemented by passing both `nextLabel` and a derived short label and rendering `<span className="hidden sm:inline">long</span><span className="sm:hidden">short</span>`.
- Top progress row: stack to two lines on very narrow widths (`flex-col items-start sm:flex-row sm:items-center`), and clamp the right-side label with `truncate max-w-[60%]`.

### `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` (tabs only)
- Replace the wrapping tab row with a **horizontally scrollable, snap-x** strip on mobile:
  - Wrapper: `-mx-4 px-4 overflow-x-auto no-scrollbar snap-x snap-mandatory sm:overflow-visible sm:mx-0 sm:px-0`.
  - Inner: `flex items-center gap-5 sm:gap-6 sm:flex-wrap whitespace-nowrap`.
  - Each tab: `snap-start shrink-0`.
  - Move "Step X of Y" to a separate line above the tabs on mobile (`sm:ml-auto sm:pb-3`) so it never fights for space.
  - Auto-scroll the active tab into view on `subStep` change via a `ref` + `scrollIntoView({ inline: "center", block: "nearest" })`.

### `src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx`
- Hero "Ready to generate" card: `p-4 sm:p-6`, CTA pill wraps long label across two lines via `whitespace-normal text-left` and uses a shorter label on mobile (`Generate · 20 credits` mobile / full label on `sm+`).
- "Pick your favorite" footer row: stack on mobile (`flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between`); Save button full-width on mobile.
- Scene-name card: reduce padding on mobile and ensure the helper copy wraps cleanly.

### Nothing else
- No registry, prompt, edge-function, or schema changes.
- No new components or files; all edits are scoped to the three files above.

## QA
- Use `preview_ui--set_preview_device_viewport: mobile`, then walk Steps 0 → 6 in both wizard and reference flows, paying attention to: sticky footer never covering content, single-row buttons, Step 4 tabs scroll horizontally with the active tab centered, Step 6 hero card readable and CTA tappable above iOS safe area.
- Re-screenshot Step 6 at 440px to confirm the "three Backs" overflow is gone and the Generate button label fits.
