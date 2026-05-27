## Goal

Fix the two real issues in `/mnt/documents/brand-scenes-newsletter.html`:
1. Images render as broken icons in the preview
2. Headlines use Times New Roman serif — wrong for VOVV's Inter sans-serif brand

Layout, copy, structure, CTAs all stay the same.

## Changes

**1. Swap image URLs to direct public objects (fixes broken images)**

Replace all `…/storage/v1/render/image/public/…?width=…&quality=…&resize=cover` with
`…/storage/v1/object/public/…` (no transform params).

Affected URLs:
- Hero: `…/scene-previews/1776688403670-i0t3r6.jpg`
- Scenes 3-up: `…/1776689318257-yahkye.jpg`, `…/1776840733386-n4bc6x.jpg`, `…/1776688413055-z73arv.jpg`
- Models 4-up: `…/scratch-uploads/models/model_029-…png`, `model_018`, `model_033`, `model_049`

Direct object URLs load without auth, no CORS layer, render in every email client and preview iframe.

**2. Brand-correct typography (fixes off-brand serif)**

Headings change from `'Times New Roman', Georgia, serif` → `-apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', Arial, sans-serif`:
- H1 hero: `font-weight:500`, `font-size:40px`, `letter-spacing:-1.2px`, `line-height:1.05`
- H2 section: `font-weight:500`, `font-size:26px`, `letter-spacing:-0.6px`
- Upgrade card H2: same as section H2, white color
- Body / eyebrows / buttons: unchanged (already Inter stack)

**3. Small polish**

- Add `height` attribute to grid `<img>` tags so cells reserve space (no jumpy layout)
- Slim the `font-weight:300` headings into `500` for stronger inbox presence

## Out of scope

- Section order, copy, CTAs, layout, button styles
- Cream `#F7F5F2` canvas, dark upgrade card, hairline borders

## Validation

Overwrite file → render via headless Chromium (HTTP-served) at 680×3400 → inspect screenshot → confirm images load and headings render in clean sans-serif before delivering.
