
# Fashion Welcome Emails — Quality + Compliance Pass

Apply the following improvements to all 7 emails via the `/tmp/build_emails.py` builder, then regenerate and re-emit artifacts. No app/runtime code touched.

## Scope (excluded per user)
- Subject lines — handled externally
- Preheader / hidden preview text — handled externally

## 1. Dark mode handling
- Add `<meta name="color-scheme" content="light dark">` and `<meta name="supported-color-schemes" content="light dark">` in `<head>`.
- Add `@media (prefers-color-scheme: dark)` block forcing:
  - Body background stays white-ish (`#ffffff` → `#0f172b` only for the navy band, which already works)
  - Navy band text stays white
  - White CTA inside navy band keeps `#0f172b` text (prevent Apple Mail auto-invert)
- Use `[data-ogsc]` selectors for Outlook.com dark mode override on text colors.

## 2. Bulletproof Outlook VML buttons
Wrap every CTA (`hero`, `section`, `navy_band`) with MSO conditional VML so 12px radius + `#0f172b` background render in Outlook 2016/2019/365 desktop:

```text
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="{href}"
  style="height:48px;v-text-anchor:middle;width:220px;" arcsize="25%"
  strokecolor="#0f172b" fillcolor="#0f172b">
  <w:anchorlock/>
  <center style="color:#ffffff;font-family:Inter,Arial,sans-serif;
    font-size:15px;font-weight:600;">{label}</center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!-- -->
<a href="..." style="...current styles...">{label}</a>
<!--<![endif]-->
```

Centralize in `cta_button()` helper.

## 3. Retina-ready images
- Set explicit `width=""` attribute on `<img>` to displayed size (e.g. 560).
- Ensure underlying image URL is requested at 2× via existing Supabase image transform (quality-only, no width crop per memory rule).
- Add `style="display:block; width:100%; max-width:560px; height:auto;"`.

## 4. Personalization tokens
- Replace "Hi there" salutations with `{{first_name|"there"}}` Resend/Liquid token.
- Add `{{brand_name}}` and `{{plan_name}}` where copy currently hardcodes generic words ("your brand", "your plan").
- Token list documented at top of `build_emails.py`.

## 5. Tokens file (single source of truth)
Extract to a `TOKENS` dict in `build_emails.py`:

```text
COLOR_BG, COLOR_NAVY=#0f172b, COLOR_TEXT, COLOR_MUTED, COLOR_BORDER
RADIUS_BTN=12, RADIUS_HERO=16, RADIUS_GRID=12
FONT_STACK="Inter, Arial, sans-serif"
SPACING_SECTION=32, SPACING_BLOCK=20
```

Helpers reference tokens instead of inline literals so future changes are one-line.

## 6. Accessibility pass
- `<html lang="en" dir="ltr">`
- `role="presentation"` on every layout `<table>`
- Min body font 14px (bump any 13px non-legal copy to 14px; keep 12px only for footer legal line)
- Meaningful `alt` text per image (descriptive, not filename) — set per-image in builder
- Verify CTA contrast ratio in a comment (white on #0f172b = 16.3:1 ✓)

## 7. Plain-text alternative
For each `.html`, generate a sibling `.txt`:
- Strip tags
- Preserve heading hierarchy with line breaks
- CTAs rendered as `Label: https://...`
- Footer with address + social URLs
- Same filename, `.txt` extension. Emit both as artifacts.

## 8. Compliant footer
Replace current footer (social-only) with:

```text
VOVV.AI
Juozo Balčikonio g. 7, Vilnius, Lithuania

Instagram · TikTok · LinkedIn

You're receiving this because you signed up for VOVV.AI.
Unsubscribe  ·  Manage preferences
```

- Address: 12px `#94a3b8`
- Social row: existing 13px `#94a3b8` style
- Legal line: 11px `#94a3b8`
- Unsubscribe link: `{{resend_unsubscribe_url}}` token placeholder; preferences link points to `https://vovv.ai/app/settings`
- Single horizontal hairline `#e2e8f0` above footer

## Execution order
1. Patch `build_emails.py`: add TOKENS, update head helper, rewrite `cta_button`, `img_tag`, `footer` helpers, add per-image alt arg, add `.txt` generator.
2. Update each `build()` call: pass first_name token in salutation, descriptive alt strings, address constant.
3. Regenerate all 7 `.html` + 7 `.txt` files.
4. Verify: grep for `v:roundrect`, `color-scheme`, `role="presentation"`, address string, `{{first_name`, and confirm `.txt` files exist.
5. Re-emit 14 artifacts (7 HTML + 7 TXT).

## Files touched
- `/tmp/build_emails.py` (builder only)
- `src/emails/fashion-welcome/0[1-7]-*.html` (regenerated)
- `src/emails/fashion-welcome/0[1-7]-*.txt` (new)
