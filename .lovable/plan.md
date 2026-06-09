## Goal

Re-skin all 7 fashion-welcome emails with the brand navy `#0f172b`, add a unique navy pre-footer CTA band to each, and tidy the footer social row.

## Changes (applied to `/tmp/build_emails.py`, then regenerate all 7 files)

### 1. Brand color swap → `#0f172b`
- Header wordmark `VOVV.AI` color: `#0a0a0a` → `#0f172b`
- All CTAs (`primary_cta` + `section_cta`): `bgcolor="#0a0a0a"` → `bgcolor="#0f172b"`
- Headings (h1/h2) and footer wordmark stay near-black `#0a0a0a` for body legibility — only buttons + header logo move to navy. (Confirm if you'd rather move h1/h2 too.)

### 2. New navy pre-footer band (per-email message)
Added between the grey grid section and the footer:

```text
┌──────────────────────────────────────────┐
│ bg: #0f172b  • padding: 56px 44px        │
│ Eyebrow (uppercase, 12px, #94a3b8)       │
│ H2 (22px, weight 600, #ffffff)           │
│ Sub-line (15px, 1.65, #cbd5e1)           │
│ White CTA (bg #ffffff, text #0f172b)     │
└──────────────────────────────────────────┘
```

Per-email copy (eyebrow / heading / sub / CTA label → href):

| # | Email | Eyebrow | Heading | Sub | CTA |
|---|---|---|---|---|---|
| 01 | welcome | Ready when you are | Your first shot is one upload away | Drop in one product photo and we'll turn it into store, ad and social visuals. | Start creating → /app/generate/product-images |
| 02 | first-gen | Easy first win | Try the simplest shot today | A clean flat lay or on-model image is the fastest way to feel the difference. | Generate your first shot → /app/generate/product-images |
| 03 | more-angles | Full product page | Six angles from one upload | Front, back, side, detail, ghost, flat — all from the photo you already have. | Build the gallery → /app/generate/product-images |
| 04 | fashion-scenes | Editorial scenes | Place your product in a real world | Pick a location and your product gets placed, lit and styled to match. | Open Visual Studio → /app/generate/product-images |
| 05 | product-swap | Whole season, one upload | Swap fabric, color and styling | Spin a single product into a full seasonal range without a re-shoot. | Try a swap → /app/generate/product-images |
| 06 | brand-look | One direction | Lock the look across every product | Save your direction once so every new upload comes out on-brand. | Lock your brand look → /app/generate/product-images |
| 07 | upgrade | The full system | Turn VOVV.AI into your content engine | A paid plan unlocks monthly credits, brand lock and 2K downloads. | See plans → /pricing |

The band uses the **same spacing rhythm** as the grey section (56/12/28/32) so it lines up. CTA inside uses the unified `15px 32px / 14px` size, but inverted colors (white bg, navy text).

### 3. Footer social row cleanup
- Remove the `vovv.ai` text link (footer wordmark already says VOVV.AI).
- Replace plaintext separators with a tighter, lighter row: `Instagram · TikTok · LinkedIn` only, in `#94a3b8`, weight 500, 13px, letter-spacing normal, hover/visited inherit.
- Add small `padding-top` on the social row so it sits cleanly below the wordmark.
- Footer top border tone softened to `#e7e5e4` (unchanged).
- Unsubscribe paragraph unchanged (dynamic Resend tag preserved).

### 4. Skeleton becomes
```text
Header (navy wordmark)
Hero (h1 + intro + navy CTA)
Hero image (clickable)
Grey grid section (eyebrow + h2 + 3×2 grid + navy CTA)
Navy pre-footer band (eyebrow + h2 + sub + white CTA)   ← NEW
Footer (wordmark + 3 social links + unsubscribe)
```

All 7 emails share this exact skeleton.

## Mechanics
1. Patch `/tmp/build_emails.py`:
   - Replace `#0a0a0a` button bg + wordmark color with `#0f172b`.
   - Add a `navy_band(eyebrow, heading, sub, cta_label, cta_href)` helper and a `{navy_band}` slot in `SHELL` between `{body}` and the footer row.
   - Pass per-email navy-band content in each `build(...)` call.
   - Rewrite the footer social `<p>` to drop `vovv.ai`, use `#94a3b8`, 13px, weight 500.
2. Run `python3 /tmp/build_emails.py` → regenerates all 7 files in `src/emails/fashion-welcome/` and `/mnt/documents/resend-templates/fashion-welcome/`.
3. Verify with grep: every file has `bgcolor="#0f172b"` ≥3× (header? no — header is just text color; 2 CTAs + 1 navy band = 3), no `#0a0a0a` button bg remains, footer no longer contains `vovv.ai`, every file has the navy band.
4. Re-emit artifacts.

No app/runtime code is touched.
