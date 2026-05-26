## Cause

The right info panel in `ResultDetailModal.tsx` uses `bg-background/95 backdrop-blur-xl` (warm off-white token `40 10% 98%` + 5% transparency over a black backdrop). The `ContextualFeedbackCard` inside uses `bg-card` (pure white `0 0% 100%`). The card therefore looks visibly whiter than the panel, and the empty panel area below the card reads as a faint grey/warm tint — most noticeable at the bottom where the empty panel space is largest.

## Fix

In `src/components/app/product-images/ResultDetailModal.tsx` (line 120), change the info panel background to match the card token and drop the 95% transparency so the backdrop tint doesn't leak through:

- `bg-background/95 backdrop-blur-xl` → `bg-card`

No other changes. The feedback card now sits flush against an identically-white panel, eliminating the perceived grey strip.