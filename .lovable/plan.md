Revert the info panel back to the original light grey background and make the feedback card transparent so the entire right side reads as one uniform color (matching the Library preview).

## Changes

**`src/components/app/product-images/ResultDetailModal.tsx`** (line 120)
- Restore: `bg-card` → `bg-background/95 backdrop-blur-xl`

**`src/components/app/product-images/ResultDetailModal.tsx`** (ContextualFeedbackCard at line 210)
- Pass `className="[&>div]:bg-transparent [&>div]:border-border/40"` so the feedback banner's inner `bg-card` becomes transparent and blends into the panel.

Result: panel keeps its light grey tint and the feedback card no longer creates a brighter white block inside it.