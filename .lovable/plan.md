# Speed up email images — serve resized variants from Supabase render endpoint

## Why it's slow
The grid uses the raw `/storage/v1/object/public/...` URLs. Those are the full-size scene previews (typically 1–3 MB each). With 7 images per email × 7 emails, every inbox preview is downloading ~15 MB of source files just to render them at 252–520 px.

## Fix
Swap every image URL from the **object** endpoint to Supabase's **render/image** endpoint and add width + quality + `resize=contain`. That serves a freshly-resized JPEG (~30–80 KB instead of 1–3 MB) and uses `resize=contain` so the image is not cropped (respects the project's "no crop zoom from width param" rule — contain mode resizes the full image to fit, no zoom).

URL transform:

```
before: .../storage/v1/object/public/product-uploads/.../scene-previews/abc.jpg
after:  .../storage/v1/render/image/public/product-uploads/.../scene-previews/abc.jpg?width=560&quality=72&resize=contain
```

Sizes used:
- **Hero image** → `width=560&quality=75&resize=contain` (renders at 520 px, 2× cap for retina)
- **Grid thumbnails** → `width=560&quality=70&resize=contain` (renders at 252 px, oversized for retina)

Single shared `?width=560` keeps the CDN cache key consistent across both uses, so the same file is downloaded once when used in both spots.

## Mechanics
Update the generator script `/tmp/build_emails.py` so the `IMG` map values are wrapped through one helper that swaps `/object/` → `/render/image/` and appends the transform query string. Re-run it to regenerate the 7 files in `src/emails/fashion-welcome/` and `/mnt/documents/resend-templates/fashion-welcome/`.

No template, copy or layout changes. Re-emit artifact tags.

Approve and I'll ship.
