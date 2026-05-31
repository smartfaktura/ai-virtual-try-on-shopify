## Objective
Drop the 2K upscale tier (since our generation pipeline already outputs 2K PNGs). Make 4K the only option in both the modal and the `/app/generate/image-upscaling` flow, and rework the UI so the picker no longer looks like a choice.

## Changes

### 1. `src/components/app/UpscaleModal.tsx` (popup from Library "Enhance to 4K")
- Default `resolution` state to `'4k'`; remove the `TIERS` array and the 2-column grid picker entirely.
- Replace "Resolution" picker block with a compact **4K summary card**:
  - Solid primary-tinted card showing `4K · 4096px`, "Maximum resolution, print-ready", and `15 credits/image`.
  - No selectable buttons — purely informational, matches design system tokens (`bg-primary/5`, `border-primary/30`, `rounded-xl`).
- CTA stays `Upscale Image to 4K` (label already correct since resolution is fixed).
- Modal width can shrink slightly (keep `max-w-md` — looks balanced).

### 2. `src/pages/Generate.tsx` (image-upscaling flow)
- Initialize `upscaleResolution` to `'4k'` and stop exposing the 2K branch in any UI strings (`resLabel` always "4K").
- Continue passing `upscaleResolution='4k'` to backend; no logic removal beyond UI.

### 3. `src/components/app/generate/UpscaleSettingsPanel.tsx`
- Remove the 2-card resolution grid. Replace with a single locked 4K summary card mirroring the modal:
  - Heading "4K Resolution", "4096px — Print-ready, maximum detail & sharpness", `15 credits per image`, small `Premium` badge.
  - No click handler / state toggle.
- Cost summary line becomes `{count} image(s) × 15 credits (4K)`.
- CTA stays `Enhance N Image(s) to 4K`.
- Drop `upscaleResolution` / `setUpscaleResolution` props from the interface (and from the call site in `Generate.tsx`).

### 4. Hooks / types — keep
- `useUpscaleImages` keeps the `UpscaleResolution` type and `'2k' | '4k'` parameter so existing backend contracts, queue jobs, and history rendering for legacy 2K assets keep working. We just never pass `'2k'` from UI anymore.
- `LibraryImageCard` / `LibraryDetailModal` keep rendering the `2K` badge for historical assets already upscaled at 2K — no migration needed.

## Scope guardrails
- Pure UI/state restriction. No edge-function or DB changes.
- Existing 2K-upscaled assets in the library still display correctly.
- No copy uses "Standard vs Premium" framing anymore — 4K is the single tier.

## Expected result
- Library "Enhance to 4K" modal: no 2K/4K choice; one fixed 4K summary block + primary CTA.
- `/app/generate/image-upscaling` settings step: no choice card grid; one fixed 4K block with locked credit math, then the existing cost summary and CTA.