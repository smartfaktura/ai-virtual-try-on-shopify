Redesign `/mnt/documents/scene-request-broadcast.html` to match the existing `vovv-newsletter-week-update.html` aesthetic and replace the awkward "Hey — quick one" copy with an engaging, sectioned layout.

## New structure (620px white card on stone bg)

1. **HERO** — dark gradient (#0f172a → #1e293b)
   - Eyebrow chip: "OPEN REQUESTS · WEEK 19"
   - Banner image (existing hosted `scene-request-banner.jpg`) full-bleed at top of hero with rounded corners
   - Headline (28px, light + bold mix): "Tell us the scene you wish existed"
   - Subhead: "Every week we add new scenes to VOVV.AI. This week, you pick what we build"

2. **HOW IT WORKS** — 3-column row
   - Reply → one line, a screenshot, a mood
   - We build → within 1–2 business days
   - It's live → we email you when your scene ships

3. **WHAT COUNTS AS A SCENE** — examples block
   - Pill-style chips: "Parisian café · Tokyo neon · Tuscan villa · Brutalist loft · Maldives overwater · Aspen lodge · Soho rooftop · Marrakech riad"
   - Short intro: "A setting, a mood, a reference shot. Real or imagined"

4. **CTA SECTION** — pill-shaped dark button "Reply with your scene idea" → `mailto:hello@vovv.ai` with prefilled subject + body. Small note under: "or send a screenshot, mood reference, link — whatever's easiest"

5. **FOUNDER NOTE** — short, signed
   - "I read every reply personally. The best ideas usually take one line. — Tomas, founder of VOVV.AI"

6. **FOOTER** — unsubscribe merge tag `{{{RESEND_UNSUBSCRIBE_URL}}}`, © 2026 VOVV.AI · A product by 123Presets

## Visual matching

- Stone `#f5f5f4` body bg, white `#ffffff` 620px card with `border-radius:16px`
- Inter font, eyebrow labels 10px / 2px tracking / uppercase / `#999`
- Section headers 20px / 600 / `#0f172a`
- Body 14px / `#555` / line-height 1.7
- 1px `#e7e5e4` dividers between sections
- All inline styles, table-based, MSO-safe
- Keep banner image URL: `https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/landing-assets/email%2Fscene-request-banner.jpg`

## Subject + preview

- Subject (default): "What scene should we build for you next?"
- Preview text: "Reply with one line — we'll build your scene in 1–2 days"

## Out of scope

- No code, edge function, or DB changes — still a manual Resend broadcast paste
- No new image uploads (banner already hosted)