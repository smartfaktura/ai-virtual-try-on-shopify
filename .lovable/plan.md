

# Fix TryShot Headline Color Contrast

## Problem
Both "Product shots for" (`text-muted-foreground` = grey) and the rotating word (`text-primary` = dark navy) look too similar against the warm white background — everything blends together.

## Solution
Create clear visual hierarchy with proper contrast:

### File: `src/pages/TryShot.tsx`

**Line 143 — Static heading**: Change from `text-muted-foreground` to `text-foreground` (near-black). This makes "Product shots for" strong and readable.

**Line 147 — Rotating word**: Change from `text-primary` (dark navy `hsl(217,33%,17%)`) to a brighter blue using an inline style or a custom utility. Use `text-[hsl(217,60%,45%)]` — a vibrant medium blue that clearly pops against the near-black static text.

Result: near-black "Product shots for" + bright blue **electronics** = clear distinction, premium feel.

