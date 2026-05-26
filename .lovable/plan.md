## `src/components/app/product-images/ProductImagesStep3Refine.tsx`

**1. Fix literal escape sequences rendered as JSX text**
- Line 2613: `\u00d7{n} selected` → `×{n} selected` (currently shows literal `\u00d71 selected` because `\u00d7` in JSX text is treated as raw chars, not an escape).
- Line 2686: `Free plan limit \u2014 1 background per generation.` → `Free plan limit — 1 background per generation`.

**2. Improve the flashed "Free plan limit" notification (lines 2683-2691)**
- Increase border radius from `rounded-md` → `rounded-full` to match the rest of the app's pill style.
- Tighten padding to `px-4 py-2`, bump text to `text-xs` for readability.
- Keep the Sparkles icon (it's a positive accent), use `bg-muted/40 border-border` to match the new Free-plan banner style elsewhere.

**3. Improve "Free plan: 1 background per generation" inline hint (lines 664-672)**
- Remove the `Sparkles` icon (per user request — no plus/sparkle icon).
- Bump font from `text-[10px]` to `text-xs` for both label and Upgrade link.
- Keep right-aligned, tighten spacing.

No logic/state changes. Pure presentation + bugfix.