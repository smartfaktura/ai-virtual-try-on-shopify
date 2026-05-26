## Outfit Styling — cleanup

File: `src/components/app/product-images/ProductImagesStep3Refine.tsx` (AI mode block around lines 2811–2848). Presentation only.

### 1. Remove the AI confirmation banner
Delete the entire block (lines 2811–2823) that renders:
- "AI will style … with outfits that complement your product"
- "X shot(s) will keep their curated look"

The "AI styling — Complements your product" card already conveys this, so the banner is redundant.

### 2. Fix the "Add styling direction" control
Currently the `CollapsibleTrigger` is a bare button that shows a heavy default focus ring (the blue rectangle in screenshot 2) and the expanded `Textarea` sits indented with `pl-7`, so it visually escapes the card.

Rewrite as a single self-contained, rounded card:

- Wrap the `Collapsible` in a `rounded-lg border border-border/60 bg-muted/20` container.
- Trigger row: full width, `px-3 py-2.5`, left-aligned, `Plus` (or `Pencil`) icon + label, chevron on the right that rotates when open. Use `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40` so there's no harsh blue border.
- Truncated preview of `customOutfitNote` stays inline on the right of the label (current behavior, just inside the new container).
- `CollapsibleContent`: drop the `pl-7` indent, render the `Textarea` with `px-3 pb-3 pt-0` so it lines up with the trigger and stays inside the rounded card.

No state, prop, or logic changes — purely markup/classNames in that one block.
