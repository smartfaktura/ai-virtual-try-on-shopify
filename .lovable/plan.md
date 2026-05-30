# Fix Product Images floating bar — keep current style

Scope: `src/components/app/product-images/ProductImagesStickyBar.tsx` only. Keep the existing visual design (4 dots + current step label, credits chip, Back, primary CTA). No restyling, no removed elements — only stop the layout from jumping so the step label tracks `step` reliably.

## Bugs

1. **Mobile label appears stuck on "Product"** during rapid Continue → Continue → Back → Back. On 390px the small `text-[10px]` label sits next to a credits chip that mounts/unmounts and squeezes it out of view.
2. **Style "crashes" between steps** because the Back button (only `step > 1`) and credits chip (only `totalCredits > 0`) conditionally render, reflowing the whole row on every transition.

## Fix

- Always render **Back** on steps 1–4. On step 1 render it `disabled` + `aria-disabled` (same `outline pill` styling) so the slot is reserved and the CTA row never reflows.
- Always render the **credits chip slot**. When `totalCredits === 0`, keep the same chip markup but wrap it in `invisible` + `aria-hidden` so width is stable across steps.
- Add `min-w-[48px]` (mobile) / `min-w-[56px]` (desktop) on the step-label `<span>` and `flex-shrink-0` on its parent group so the label can't be visually squeezed under the credits chip. Text still comes from `STEP_LABELS[step]`.
- Add `key={step}` on the label span so React guarantees a fresh text node on each step change (defensive against any stale paint on rapid clicks).
- Keep `STEP_LABELS`, `TOTAL_STEPS`, dot indicators, icons, `Sparkles` on step 4, `blockedReason` toast, and the `aria-disabled` CTA behavior exactly as they are.

## Out of scope

- Visual redesign, removal of the dot stepper, color/typography changes, copy changes.
- Step flow, gating, credit math, or any logic outside the sticky bar.
- The top `CatalogStepper` is untouched.
- `ProductImages.tsx` is untouched — no prop signature changes.

## Verification

- Mobile 390px: step 1 → 2 → 3 → 4 → back → back → back; row height, Back position, and credits chip position do not shift; label updates Product → Shots → Setup → Generate and back.
- Desktop ≥640px: same — Back always present (disabled on step 1), credits slot reserved when 0, no horizontal jitter between transitions.
