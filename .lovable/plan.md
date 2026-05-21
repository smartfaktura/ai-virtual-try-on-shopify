# Brand Models — fix CTA proportions + right-align

Two small tweaks.

## 1. Match the project's primary CTA proportions

The current "Start" button uses `size="sm"` (`h-8`, `text-xs`) which is too small for a hero card CTA. The project's primary CTA proportions (sidebar "Create Visuals") are `h-10`, `text-sm`, `font-semibold`, `rounded-full`.

**Fix in `src/pages/BrandModels.tsx`:** swap the Button to use the existing `size="pill"` variant (which gives `h-10 rounded-full px-5`) and add `text-sm font-semibold` for the right weight:

```tsx
<Button size="pill" className="text-sm font-semibold pointer-events-none">
  Start
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>
```

Icon nudges up to `h-4 w-4` and `ml-2` to match the larger button.

## 2. Right-align the CTA inside each card

Move the button to the bottom-right of the card so it reads as a clear "next step" anchor (similar to a card footer action). Wrap with `flex justify-end` instead of the default left-anchored stack.

```tsx
<div className="mt-auto pt-10 flex justify-end">
  <Button ... />
</div>
```

## Out of scope

Copy, card frame, padding, hover behavior, page header — all unchanged.
