# Fix overlapping Back / Generate buttons in /app/n sticky footer (mobile)

## Problem
On mobile (~390px), the sticky pill footer in `UnifiedGenerator` (Step 2 — "Configure your model") renders the **Back** outline button visually under the **Generate** pill. Cause: the row uses `flex items-center justify-between gap-2` with a `hidden sm:block` left-side text span and `flex-shrink-0` on the button group — on mobile the left span collapses to zero, the right group keeps natural width, and on narrow screens the inner padding + two pill buttons + gap can exceed the card's inner width, producing the overlap shown in the screenshot.

## File
- `src/pages/BrandModels.tsx` — sticky footer block around lines 1103–1155.

## Change (mobile-first layout fix)
Update the inner footer row so the two buttons share the row evenly on mobile and only sit right-aligned with the helper text on `sm+`:

1. Replace `flex items-center justify-between gap-2 p-2.5 sm:p-4` with `flex items-center gap-2 p-2 sm:p-4`.
2. On the button group, drop `flex-shrink-0 ml-auto` and use `flex items-center gap-2 w-full sm:w-auto sm:ml-auto`.
3. On each `<Button size="pill">` in that group, add `flex-1 sm:flex-none` so on mobile the two pills split the available width evenly and never overlap. Keep `whitespace-nowrap` on the Generate label.
4. Keep the desktop hint span as-is but add `min-w-0` so it never forces the button group to overflow.

This results in:
- **Mobile:** `[ Back ][ Generate ]` two equal-width pills filling the card, no overlap, safe-area-inset padding preserved.
- **Desktop (≥ sm):** unchanged — left hint text + right-aligned pills at natural width.

Apply the same `flex-1 sm:flex-none` treatment to the Step 1 footer branch (Back / Next, lines 1122–1135) so both steps behave consistently on mobile.

## Verification
After the edit, reload `/app/n` at 390×844 in the preview, scroll to Step 2, and confirm:
- Back and Generate are side-by-side, equal width, no overlap.
- Labels remain readable; Generate stays disabled-styled when invalid.
- Desktop layout at ≥ 640px is unchanged (hint left, pills right at natural size).

No business logic, no validation, no copy changes — purely a presentation fix in `src/pages/BrandModels.tsx`.
