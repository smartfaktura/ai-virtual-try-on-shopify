## Newsletter v3 — polish pass

Targeted edits to `/mnt/documents/brand-scenes-newsletter.html`.

### 1. Lighter images
Switch to Supabase render endpoint with quality only (no width crop — per project rule, `width` causes server-side zoom on full-bleed):
- Hero: `?quality=70`
- 3-up Brand Scenes tiles: `?quality=65`
- 4-up Brand Models tiles: `?quality=60`
- Add `loading="lazy"` + `decoding="async"` on every below-fold `<img>`

Target: total payload from ~10 MB → under 1 MB.

### 2. Rebrand VOVV.AI → VOVV
Replace every user-facing `VOVV.AI` with `VOVV` (logo wordmark, H1, footer signature, `<title>`, preheader, alt text). Keep `vovv.ai` only inside URLs.

### 3. Make "what's new" obvious
- Small pill above hero H1: `NEW · LAUNCHED THIS WEEK` (uppercase, tracked, hairline border)
- Rewrite H1 to lead with the news, not the brand
- `NEW` chip beside each feature H2 (Brand Scenes, Brand Models)
- One-line "what changed" sub-label under each H2 (before → now phrasing)

### 4. Primary dark blue (replaces black)
Introduce a single brand accent and apply it to:
- Upgrade / final CTA section background (was `#0A0A0A` black → `#0B1C3A` deep navy)
- All CTA buttons (primary CTA + final CTA) → same `#0B1C3A` with white text, subtle inner highlight, 2px hairline `rgba(255,255,255,0.08)` border for depth
- Hover/visited safe (email-safe inline styles, no JS)

Body, headlines, hairlines stay black/off-white — the navy is reserved for high-intent surfaces so it pops.

### 5. Footer rebuild
Current footer is a thin grey line. Replace with a proper editorial footer on the cream canvas:
- Top: `VOVV` wordmark (left) + tiny tagline "AI visuals for product brands" (right)
- Middle row: 3 link columns — `Studio` (Brand Scenes, Brand Models, Visual Studio) · `Company` (Pricing, Learn, Contact) · `Follow` (Instagram, LinkedIn, X)
- Hairline divider
- Bottom row: `© 2026 VOVV` · `vovv.ai` · `Unsubscribe` · `View in browser`
- Inter 12–13px, muted `#6B6B6B`, 1.6 line-height, generous 32px top/bottom padding

### Out of scope
Section order, hero copy beyond H1, layout grid, cream canvas, Inter type system.

### Validation
Overwrite file → render via headless Chromium at 680×3600 → confirm: (a) total image bytes < 1 MB, (b) zero `VOVV.AI` in rendered text, (c) NEW pills + sub-labels visible, (d) navy CTA section + buttons render correctly, (e) footer columns align and links are legible.
