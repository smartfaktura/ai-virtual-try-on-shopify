## /home updates

### 1. Premium redesign — `HomeTrustBlock.tsx`
Move from plain white cards on cream to a **dark editorial section** that feels solid, premium, and on‑brand with the rest of VOVV.ai.

- **Background**: `bg-[#0E1116]` (near-black) with two soft ambient blurs (white + warm amber) and a faint hairline grid texture.
- **Eyebrow chip**: small pill with a pulsing emerald dot + "Early access · live now" — signals real activity without overclaiming.
- **Heading**: "Built for brands that ship fast." with subline "Early users replacing entire shoot days with a single afternoon on VOVV."
- **Testimonial cards** (3-up): translucent `bg-white/[0.04]`, hairline `border-white/10`, hover lifts to `border-white/20`. Oversized serif quote glyph `”` in the top-right at very low opacity for editorial polish. Light-weight body copy. Avatar is a small gradient pill (white→transparent) with initials, name + role beneath a thin divider.
- **Stats strip** below testimonials — single rounded card, 4 columns (2 on mobile) divided by hairlines:
  - 1000+ Editorial scenes
  - 35+ Product categories
  - <60s Per generation
  - 1:1 Brand consistency
- **Footnote**: "Early-access feedback · Names anonymized to protect brand pipelines."
- Keeps existing testimonial copy + initials (ML / DK / AR).

### 2. Fragrance asset swap — `HomeTransformStrip.tsx`
Replace 5 fragrance scene IDs with the 4 new ones (the 4th new image is reused for the 5th slot since only 4 new URLs were provided):
- `1775132683871-rw4rg7` → `1776018021309-gfgfci` (Volcanic Sunset)
- `1775132044712-m8fods` → `1776018039712-1hifzr` (Dynamic Water Splash)
- `1775132089419-eqo26l` → `1776018027926-ua03bd` (Red Gradient Embrace)
- `1775136513431-i3rxtr` → `1776018038709-gmt0eg` (Frozen Aura)
- `1775136074748-fdv974` → `1776018021309-gfgfci` (Earthy Driftwood — reuses gfgfci)

### Notes
- No copy changes to `HomeTransformStrip` — only image src IDs.
- Trust block keeps its position (after How it works) and its own scroll reveal.