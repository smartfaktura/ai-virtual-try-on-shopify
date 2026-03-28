

# Bigger Mobile CTA Buttons on Workflow Cards

## Problem
On mobile (390px viewport), the "Start Creating →" buttons are too small and cramped, especially on the compact card variants.

## Changes

### `src/components/app/WorkflowCardCompact.tsx`
- **mobileCompact variant** (line 133): increase button height from `h-6` to `h-8`, padding from `px-2` to `px-3`, text from `text-[10px]` to `text-xs`
- **mobileRow variant** (line 72): increase height from `h-8` to `h-9`
- **Button label**: change "Start Creating" to just "Start" when `mobileCompact` or `mobileRow` is true

### `src/components/app/WorkflowCard.tsx`
- No changes needed — this is the full-size card used on desktop/tablet layout, CTA is already `h-11 px-8`

**Result**: Larger, easier-to-tap buttons on mobile with shorter "Start →" label that fits comfortably.

