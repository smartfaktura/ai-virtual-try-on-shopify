## Goal
On `/app/video/start-end` and `/app/video/animate`, the "Cost: N credits" pill and the "Not enough credits" pill currently wrap to separate rows in the sticky bottom bar (visible in the attached screenshot of the narrow mobile-style preview). Make them smaller so they sit on the same row, with the "Get credits" button below.

## Changes

**1. `src/components/app/video/CreditEstimateBox.tsx`**
- Reduce pill padding `px-3.5 py-2` → `px-2.5 py-1`
- Reduce text from `text-sm` → `text-xs`
- Keep rounded-full, border, muted bg
- Shorten label: render as `Cost N` (drop the "credits" word, drop the colon-space gap) — e.g. `Cost 35` to save horizontal space

**2. `src/pages/video/StartEndVideo.tsx` (lines 405-410)**
- Shrink the "Not enough credits" pill to match: `px-2.5 py-1`, `text-xs`, icon `h-3 w-3`
- Keep destructive styling

**3. `src/pages/video/AnimateVideo.tsx` (lines 1327-1337)**
- Same shrink on the "Not enough credits" pill (`px-2.5 py-1`, `text-xs`, icon `h-3 w-3`)
- Also shrink the `× N = N credits` multiplier pill to align (already `text-xs`, just normalize padding to `px-2.5 py-1`)

No layout-structure changes — the existing `flex-wrap` row continues to host all pills; reducing pill size lets Cost + Not-enough-credits fit on one line at the current preview width, while the full-width "Get credits" button stays on the next row on narrow viewports (unchanged `w-full sm:w-auto` behavior).

No logic changes; visual/spacing only.
