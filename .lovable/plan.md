

# Premium "Add Credits" Button — Apple Style

## Problem
The current `PlusCircle` Lucide icon renders as a thin-stroke SVG that looks blurry at small sizes in the dark sidebar. It lacks visual weight and premium feel.

## Solution
Replace the hollow `PlusCircle` icon with a solid, pill-shaped mini button inspired by Apple's UI — a filled rounded container with a crisp `+` symbol inside.

## Change
**`src/components/app/CreditIndicator.tsx`** — replace the icon button with a styled solid pill:

- Remove `PlusCircle` import
- Replace the `<button>` with a solid `w-8 h-8` rounded-full button using `bg-white/10` fill, `border border-white/[0.08]`, and a bold `+` text character instead of an SVG icon
- Add `backdrop-blur-sm`, `hover:bg-white/20`, and `active:scale-95` for tactile feedback
- The `+` uses `text-base font-medium text-sidebar-foreground/70` for a crisp, non-blurry glyph

This gives a solid, always-sharp tap target that matches Apple's capsule button aesthetic — no SVG blur at any resolution.

