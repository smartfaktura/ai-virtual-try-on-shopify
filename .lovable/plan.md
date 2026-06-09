## Tighten all 7 fashion-welcome emails

### 1. Remove the personal signature
Drop the `— Tomas, VOVV` row entirely from the SHELL template (and from the `Hey, Tomas here, founder of VOVV.AI` line in email 1's intro). Emails close on the final CTA, then footer.

### 2. Standardize section spacing
Every body section (grey or white) gets identical structure:

```
padding-top:    56px   (section vertical rhythm)
eyebrow → h2:   12px
h2 → grid:      28px
grid → CTA:     32px
padding-bottom: 56px
```

Outer side padding stays `44px` everywhere (24px on mobile). Image grid row gap normalized to `12px`, between-image gap `10px`. Hero image block gets `padding: 0 44px 48px`. Headline block: `padding: 0 44px 40px`. Final CTA block: `padding: 16px 44px 64px`. Footer: `padding: 56px 44px 56px`.

### 3. Section-level CTAs
Each `section_grid` gets its own CTA underneath the image grid, contextual to that section:
- **Email 1** — Grey section "Ship from one product" → `Browse the visual library` (→ `/product-visual-library`). Bullets section "What you can do this week" → `Open Visual Studio` (→ `/app/generate/product-images`).
- **Email 2** — Shot types → `Try a flat lay first`. How it works → `Upload your first product`.
- **Email 3** — Angle set → `Generate the full set`.
- **Email 4** — Scenes → `Browse all scenes` (→ library).
- **Email 5** — Catalogue swap → `Build a scene set`.
- **Email 6** — Brand look → `Lock your brand look`.
- **Email 7** — Month of VOVV → `See plans`. What's included → `See plans`.

All section CTAs use the same secondary style: ghost outlined dark on grey sections, solid dark on white sections, both `padding: 14px 28px`, 14px font.

### 4. Make every image clickable
Wrap every `<img>` in grids and the hero in `<a href="..." style="text-decoration:none;">…</a>`. Each image links to the most contextually relevant page:
- Hero → main CTA destination of the email
- Grid images → `/product-visual-library` (so users can browse the actual scene)

Add `border:0;` and `display:block;` reinforcement on anchor to prevent client-side underline halos.

### 5. Copy corrections
Sweep all 7 emails for stilted phrasing and rewrite:

- Email 1 intro currently: *"Hey, Tomas here, founder of VOVV.AI. If you sell dresses, hoodies, jeans…"* → *"If you sell dresses, hoodies, jeans, jackets, activewear, swimwear or lingerie, you can upload one product photo today and start creating the visuals you need — store, ads, email, social — without booking a shoot."* (no first-person founder voice now that the signature is gone)
- Replace *"the visuals you actually need"* → *"the visuals you need"* (less defensive)
- Email 2: *"The fastest way to see what VOVV.AI does is the simplest one"* → *"The fastest way to see what VOVV.AI does is to start with the simplest shot"*
- Email 3: *"A product page with one photo converts worse than a page with six."* → *"A product page with one photo converts worse than a page with six angles."*
- Email 4: *"Locations and scenes are the difference between a product page and a campaign."* keep, but change *"Pick a mood — studio, street, desert, interior, editorial — and the same product gets placed there, lit there and styled there."* → *"Pick a mood — studio, street, desert, interior, editorial — and your product gets placed, lit and styled in that world."*
- Email 5: *"That is how brands make a season look like a season"* → *"That is how a season actually looks like a season"*
- Email 6: *"A brand is recognisable when the framing, light and styling stay consistent."* → *"A brand is recognisable when framing, light and styling stay consistent across every product."*
- Email 7: *"If VOVV.AI is already producing visuals you would otherwise pay a studio, photographer and model for, a paid plan turns that into your full content engine."* → *"If VOVV.AI is already producing visuals you would otherwise pay a studio, photographer and model for, a paid plan turns it into your full content engine."*
- Drop all section-level `final_top` lines that duplicate the section CTA (e.g. "Open Visual Studio and create your first one in a few minutes." becomes the bottom CTA only, not a repeated sentence).
- Bullet list intros: shorten *"Three steps, no shoot"* stays, but ensure consistent eyebrow casing (UPPERCASE 12px) — already consistent.
- Strip terminal periods from H2 subheads per the brand rule (audit all six h2s).

### Mechanics
Single edit pass on `/tmp/build_emails.py`:
- Update `SHELL` (remove signature row, retune all padding).
- Add `link` param to `grid()` and `hero_image()` so every image is wrapped in `<a>`.
- Extend `section_grid()` with optional `cta_label` + `cta_href` (renders a `secondary_cta()` block below the grid).
- Add `secondary_cta()` helper.
- Update each `build(...)` call: rewrite intros/copy, add per-section CTAs, drop `final_top` duplicates where the section CTA already covers it (keep one final closing CTA).

Regenerate all 7 emails and re-emit artifacts.
