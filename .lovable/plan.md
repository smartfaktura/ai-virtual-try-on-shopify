

# Fix Press Page Logo SVGs — Uniform Colors

## Problem
The downloadable logo SVGs use a two-tone style where ".AI" is a different shade from "VOVV". The user wants:
- **Dark logo**: entire "VOVV.AI" in the same dark color (`#1a2332`)
- **White logo**: entire "VOVV.AI" in white (`#ffffff`)

## Changes — `src/pages/Press.tsx`

### 1. Dark logo SVG (line 11)
Change `.AI` fill from `#6b7d93` → `#1a2332` (same as "VOVV")

### 2. White logo SVG (line 16)
Change `.AI` fill from `#a3b1c2` → `#ffffff` (same as "VOVV")

### 3. Update preview text in the cards
- Dark preview: change `<span className="text-muted-foreground">.AI</span>` to inherit the same foreground color
- White preview: change `<span className="text-white/60">.AI</span>` to `text-white`

Single file edit, 4 small line changes.

